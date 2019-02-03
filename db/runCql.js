const fs = require('fs');
const dotenv = require('dotenv').config();
const path = require('path');

const DB_TYPE = process.env.DB_TYPE;

const runCql = (params=[]) => {
  return new Promise((resolve, reject) => {
    const filepath = DB_TYPE === 'postgres' ? '/postgres.sql' : '/cassandra.cql'; 
    fs.readFile(path.resolve(__dirname + filepath), (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  }).then( data => {
    let sqlString = data.toString()
      .split(';');
    sqlString.map(q => {
      if (q.match(/(trail_id, is_hero_path, gpx_url, have_gpx)/)) {
        let newQArr = q.split(' VALUES ');
        let newColumns = '(trail_id, gpx_id, user_id, date, rating, comment, tag, is_hero_path, gpx_url, have_gpx)'
        let newValuesRef = newQArr[1].split(','); // length = 4;
        let newValues = [
          newValuesRef[0], 
          null, 
          null, 
          null, 
          0, 
          null, 
          null, 
          newValuesRef[1],
          newValuesRef[2],
          newValuesRef[3]
        ];
        let newStr = '';
        for (let i = 0; i < newValues.length; i++) {
          if (typeof newValues[i] === 'object') {
            newStr += 'null,';
          } else {
            if (i === newValues.length - 1) {
              newStr += newValues[i];
            } else {
              newStr += newValues[i] + ',';
            }
          }
        }
        // console.log('newValues: ', newStr);
        console.log('INSERT INTO paths ' + newColumns + ' VALUES ' + newStr + ';');
      }
    })
      // .filter(q => q.match(/(trail_id, is_hero_path, gpx_url, have_gpx)/))
      // .split
      // .map(q => {
      //   let newQ = q.split(',');
      //   if (q.match(/(trail_id, is_hero_path, gpx_url, have_gpx)/)) {

      //   }
      // })
      // .replace()
  });
}

const replaceInsert = async () => {
  const qs = await new Promise((resolve, reject) => {
    fs.readFile(path.resolve(__dirname + '/cassandra.1.cql'), (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
  const queries = qs.toString()
    .split(';')
    .filter(q => q.match(/\(trail_id,/))
    .map((q, index) => {
      return q.replace(/\(trail_id,/, '(id, trail_id,')
        .replace(/VALUES \(/, `VALUES (${index + 1},`) + ';';
  });
  const queryStr = queries.join('');
  const write = await new Promise((resolve, reject) => {
    fs.writeFile(path.resolve(__dirname + '/cassandraNew.cql'), queryStr, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
const main = (async () => {
  try {
    await replaceInsert();
  } catch(err) {
    console.log('error: ', err);
  }
})();