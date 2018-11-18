const path = require('path');
const fs = require('fs');
const requestPromise = require('request-promise');
const csvtojson = require('csvtojson');

/**
 * /////////////////////////////////////////
 * SETTINGS
 * /////////////////////////////////////////
 */


// output path
const outputPath = path.join(__dirname, '../db/schema.sql');
// db name
const DB_NAME = 'pathsService';
// set table data
const DB_TABLES = [{

  tableName: 'paths',
  schema: `
      id SERIAL,
      trail_id int NOT NULL,
      date bigint,
      user_id int DEFAULT NULL,
      rating int NOT NULL DEFAULT 0,
      comment text,
      tag text,
      gpx_id int, 
      gpx_url text,
      is_hero_path boolean NOT NULL DEFAULT FALSE,
      PRIMARY KEY (id)
`
}];

// public google sheets with data
// column names to be skipped should have a #
// column names should match table columns
const gSheets = {
  // table name --> list of sheets to populate from
  'paths': [
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vR8SO2Qiqz0gcHvVSLvzLtIXefde65XQM25jZBWbAkC8D5EKuZRIWZS_Z3JroUVjF1IoIBw1Y7b0rCb/pub?gid=1804747731&single=true&output=csv",
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vR8SO2Qiqz0gcHvVSLvzLtIXefde65XQM25jZBWbAkC8D5EKuZRIWZS_Z3JroUVjF1IoIBw1Y7b0rCb/pub?gid=2138298506&single=true&output=csv"
]};


/**
 * /////////////////////////////////////////
 * DONT EDIT BELOW
 * /////////////////////////////////////////
 */


// schema model for working with data
class Schema {

  constructor(schemaText) {
    // default left as string
    this.typeMappings = {
      'number': ['date', 'tinyint', 'bigint', 'bigserial', 'serial', 
      'serial4','serial8','int', 'int4', 'smallint', 'int2', 'real', 
      'float4', 'float8'],
      'boolean': ['bool', 'boolean']
    }
    this.parseSchemaText(schemaText);
  }

  // initial parser (create dictionary of boolean, text, or number for each columns)
  parseSchemaText(schemaText) {
    this.data = {};
    let m;
    const regex = /^\s*([^\s]+)\s+([^\s,]+)/gm;
    while ((m =  regex.exec(schemaText)) !== null) {
      const [columnName, columnDataType] = m.slice(1,3).map((item) => { return item.toLowerCase().trim()});
      this.data[columnName] = 'text';
      Object.keys(this.typeMappings).forEach((sqlDataTypeGroup) => {
        if (this.typeMappings[sqlDataTypeGroup].indexOf(columnDataType) !== -1) {
          this.data[columnName] = sqlDataTypeGroup;
        } 
      });
    }
    console.log(this.data);
  }
  // see if exists in schema
  exists(columnName) {
    return this.data[columnName] !== undefined;
  }
  // format value as string, number, bool based on colmn aName
  formatValue(value, columnName) {
    value = value.toLowerCase().trim();
    if (value === 'null' || value === '') {
      return null;
    }
    if (this.exists(columnName)) {
      switch(this.data[columnName]) {
        case 'boolean':
          switch(value) {
            case 'true':
            case '1':
            case 1:
              return true;
            case 'false':
            case '0':
            case 0:
              return false;
            default: 
              return null;
          }
        case 'number':
          return Number(value);
        case 'text':
        default:
          return value; 
      }
    } else {
      return value;
    }
  }
}


var sql = `DROP DATABASE IF EXISTS ${DB_NAME};

CREATE DATABASE ${DB_NAME};

USE ${DB_NAME};

`;


// table setup
tableDic = {};
sql += DB_TABLES.map(({tableName, schema}) => {
  tableDic[tableName] = schema;
  return `CREATE TABLE ${tableName} (${schema})`
}).join('\n\n');




Object.keys(gSheets).forEach( (tableName) => {
  const schemaModel  = new Schema(tableDic[tableName]);
  // parse schema text into dictionary of columns (key) to {type i.e. string, }
  gSheets[tableName].forEach(async (url) => {
    try{
      const gsheetText = await requestPromise(url);
      const rows = await csvtojson().fromString(gsheetText);
      const finalEntries = rows.map((row) => {
        const filteredRow = {};
        Object.keys(row).forEach((key) => {
          key = key.toLowerCase().trim();
          if (schemaModel.exists(key)) {
            filteredRow[key] = schemaModel.formatValue(row[key], key);
          } else {
            return null;
          }
        });
        return filteredRow;
      });
      sql += '\n';
      // console.log(finalEntries);
      finalEntries.forEach((cells) => {
        debugger;
        sql += `
INSERT INTO ${tableName} (${Object.keys(cells).join(', ')}) VALUES (${Object.keys(cells).map((key) => {return JSON.stringify(cells[key])}).join(', ')})`
      });
      // console.log(finalEntries);
      // console.log(sql);
      fs.writeFile(outputPath, sql, (err) => {
        if (err) throw err;
        console.log(`sql file has been saved to ${outputPath}!`);
      });
    } catch (e) {
      console.log('error while requesting google sheet: ', e);
    }
  });
  
})
