const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const faker = require('faker');
const dotenv = require('dotenv').config();
const { exec } = require('child_process');

const START_TRAIL_RECORD = 133;
const START_TRAIL_ID_RECORDING = 21;
const TOTAL_TRAIL_RECORDS = 10000000;
const LATEST_DATE = 1548208265331;
const MAX_GPX_ID = 22000001;
const MAX_RECORDINGS_PER_TRAIL = 1;
const MAX_ARRAY_LENGTH = 100;
let id_count = 608;

const DB_TYPE = process.env.DB_TYPE  || 'postgres';

let client;
let csvHero, csvRecordings;

if (DB_TYPE === 'postgres') {
  console.log('inside postgres');
  const connection = {
    user: process.env.DB_USER,
    host: process.env.HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
  };
  
  const { Client } = require('pg');
  
  client = new Client(connection);
  client.connect();

  csvHero = createCsvWriter({
    path: 'db/hero.csv',
    header: [
      {id: 'trail_id', title:'trail_id'},
      {id: 'is_hero_path', title: 'is_hero_path'},
      {id: 'gpx_url', title: 'gpx_url'},
      {id: 'have_gpx', title: 'have_gpx'}
    ]
  });
  csvRecordings = createCsvWriter({
    path: 'db/recordings.csv',
    header: [
      {id: 'trail_id', title: 'trail_id'},
      {id: 'gpx_id', title: 'gpx_id'},
      {id: 'user_id', title: 'user_id'},
      {id: 'date', title: 'date'},
      {id: 'rating', title: 'rating'},
      {id: 'comment', title: 'comment'},
      {id: 'tag', title: 'tag'},
      {id: 'is_hero_path', title: 'is_hero_path'},
      {id: 'gpx_url', title: 'gpx_url'},
      {id: 'have_gpx', title: 'have_gpx'}
    ]
  });
} 
if (DB_TYPE === 'cassandra') {
  console.log('inside cassandra');
  const cassandra = require('cassandra-driver');

  client = new cassandra.Client({
    contactPoints: ['127.0.0.1'], 
    keyspace: process.env.CASSANDRA_DB_NAME,
    localDataCenter: 'datacenter1'
  });
  csvHero = createCsvWriter({
    path: 'db/hero.csv',
    header: [
      {id: 'id', title: 'id'},
      {id: 'trail_id', title: 'trail_id'},
      {id: 'gpx_id', title: 'gpx_id'},
      {id: 'user_id', title: 'user_id'},
      {id: 'date', title: 'date'},
      {id: 'rating', title: 'rating'},
      {id: 'comment', title: 'comment'},
      {id: 'tag', title: 'tag'},
      {id: 'is_hero_path', title: 'is_hero_path'},
      {id: 'gpx_url', title: 'gpx_url'},
      {id: 'have_gpx', title: 'have_gpx'}
    ]
  });
  csvRecordings = createCsvWriter({
    path: 'db/recordings.csv',
    header: [
      {id: 'id', title: 'id'},
      {id: 'trail_id', title: 'trail_id'},
      {id: 'gpx_id', title: 'gpx_id'},
      {id: 'user_id', title: 'user_id'},
      {id: 'date', title: 'date'},
      {id: 'rating', title: 'rating'},
      {id: 'comment', title: 'comment'},
      {id: 'tag', title: 'tag'},
      {id: 'is_hero_path', title: 'is_hero_path'},
      {id: 'gpx_url', title: 'gpx_url'},
      {id: 'have_gpx', title: 'have_gpx'}
    ]
  });
}


const copyCass = () => {
  return new Promise(resolve => {
    const fileNames = ['hero', 'recordings'];
    const copies = fileNames.map(filename => {
      console.log('filename: ', filename);
      const command = `cqlsh -e "COPY ntrailspaths.paths \
        (id, trail_id, gpx_id, user_id, date, rating, comment, tag, is_hero_path, gpx_url, have_gpx) \
        FROM '${process.env.ABS_PATH_TO_DB_FOLDER}/${filename}.csv' WITH HEADER= TRUE;"`;
      return new Promise((resolve, reject) => {
        exec(command, (err, stdout, stderr) => {
          if (err) {
            reject(err);
          }
          // the *entire* stdout and stderr (buffered)
          // console.log(`stdout: ${stdout}`);
          // console.log(`stderr: ${stderr}`);
          resolve();
        });
      });
    });
    Promise.all(copies).then(() => {
      console.log('completed copying to cassandra');
      resolve();
    });
  })
}

const runSql = (params=[]) => {
  return new Promise((resolve, reject) => {
    const filepath = DB_TYPE === 'postgres' ? '/postgres.sql' : '/cassandra.cql'; 
    fs.readFile(path.resolve(__dirname + filepath), (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  }).then( async (data) => {
    let sqlString;
    const heroStr = /absolute\/path\/to\/db\/hero.csv/gi;
    const recordingStr = /absolute\/path\/to\/db\/recordings.csv/gi;
    sqlString = data.toString().replace(heroStr, process.env.ABS_PATH_TO_DB_FOLDER + '/hero.csv')
      .replace(recordingStr, process.env.ABS_PATH_TO_DB_FOLDER + '/recordings.csv');
    let query;
    if (DB_TYPE === 'postgres') {
      query = await client.query(sqlString);
    } 
    if (DB_TYPE === 'cassandra') {
      const queries = sqlString.split(';').slice(0, -1).map((query) => {
        return query;
      });
      for (let query of queries) {
        await client.execute(query, params,  { prepare: true });
      }
      await copyCass();
    }

    return query;
  });
}

const seededRandom = (seed) => {
  seed = (seed * 9301 + 49297) % 233280;
  var rnd = seed / 233280;
  return rnd;
};

const seedHeros = (start) => {
  return new Promise( async (resolve, reject) => {
    const heroPaths = [];
    try {
      for (let i = START_TRAIL_RECORD; i < START_TRAIL_RECORD + TOTAL_TRAIL_RECORDS + 1; i++) {
        id_count++;
        if (DB_TYPE === 'postgres') {
          heroPaths.push({
            trail_id: i,
            is_hero_path: true,
            gpx_url: faker.lorem.words(),
            have_gpx: false
          });
        }
        if (DB_TYPE === 'cassandra') {
          heroPaths.push({
            id: id_count,
            trail_id: i,
            gpx_id: null,
            user_id: null,
            date: null,
            rating: 0,
            comment: null,
            tag: null,
            is_hero_path: true,
            gpx_url: faker.lorem.words(),
            have_gpx: false
          });
        }
        if (heroPaths.length > MAX_ARRAY_LENGTH - 1 || i === START_TRAIL_RECORD + TOTAL_TRAIL_RECORDS) {
          await csvHero.writeRecords(heroPaths);
          heroPaths.length = 0;
          if (i === START_TRAIL_RECORD + TOTAL_TRAIL_RECORDS) {
            let end = new Date();
            let seconds = (end.getTime() - start.getTime()) / 1000;
            resolve({
              msg: `Done writing ${TOTAL_TRAIL_RECORDS} records within hero.csv in ${seconds} seconds`,
              time: seconds
            });
          }
        }
      }
    } catch(err) {
      reject('error occured in seeding hero paths: ', err);
    }
  })
}

const seedRecordings = (start) => {
  return new Promise( async (resolve, reject) => {
    const recordings = [];
    try {
      for (let i = START_TRAIL_ID_RECORDING; i < START_TRAIL_ID_RECORDING + TOTAL_TRAIL_RECORDS + 1; i++) {
        for (let j = 0; j < MAX_RECORDINGS_PER_TRAIL; j++) {
          id_count++;
          recordings.push({
            trail_id: i,
            gpx_id: Math.floor(seededRandom(i) * MAX_GPX_ID),
            user_id: Math.floor(seededRandom(i) * (TOTAL_TRAIL_RECORDS + 1)),
            date: Math.floor(seededRandom(i) * (LATEST_DATE) + 1),
            rating: Math.floor(Math.random() * 2) ? null : Math.floor((Math.random() * 5) + 1),
            comment: faker.lorem.words(),
            tag: faker.lorem.word(),
            is_hero_path: false,
            gpx_url: faker.lorem.words(),
            have_gpx: false
          });
          if (DB_TYPE === 'cassandra') {
            recordings[recordings.length - 1].id = id_count;
          }

          if (
            (recordings.length > MAX_ARRAY_LENGTH - 1) 
            || (i === START_TRAIL_ID_RECORDING + TOTAL_TRAIL_RECORDS) 
            && (MAX_RECORDINGS_PER_TRAIL - 1 === j)
          ) {
            await csvRecordings.writeRecords(recordings);
            recordings.length = 0;
            if (i === START_TRAIL_ID_RECORDING + TOTAL_TRAIL_RECORDS) {
              let end = new Date();
              let seconds = (end.getTime() - start.getTime()) / 1000;
              resolve({
                msg: `Done writing ${TOTAL_TRAIL_RECORDS * MAX_RECORDINGS_PER_TRAIL} records within recordings.csv in ${seconds} seconds`,
                time: seconds
              });
            }
          }
        }
      } 
    } catch(err) {
      reject('error occured in seeding recordings: ', err);
    }
  });
}

const deleteCsv = () => {
  const fileNames = ['hero', 'recordings'];
  return new Promise((resolve, reject) => {
    const deletes = fileNames.map(file => {
      return new Promise((resolve, reject) => {
        fs.unlink(`db/${file}.csv`, (err) => {
          if (err) {
            reject(err);
          } 
          resolve(`successfully deleted db/${file}`);
        });
      });
    });
    Promise.all(deletes).then(() => {
      console.log('completed deleting csv files');
      resolve();
    });
  })
}

const main = (async () => {
  try {
    //Seed hero paths (write to hero.csv)
    console.log('Creating hero.csv...');
    let start = new Date();
    const heroObj = await seedHeros(start);
    console.log(heroObj.msg);

    //Seed recordings (write to recordings.csv)
    console.log('Creating recordings.csv...');
    let startRecordings = new Date();
    const recordingsObj = await seedRecordings(startRecordings);
    console.log(recordingsObj.msg);

    //Seed db (run schema.sql -> copy csv files to db)
    console.log('Seeding to db...');
    let sqlTime = new Date();
    await runSql();
    let end = new Date();
    let seconds = (end.getTime() - sqlTime.getTime()) / 1000;
    console.log('deleting .csv files...');
    await deleteCsv();
    const totalRecords = TOTAL_TRAIL_RECORDS + TOTAL_TRAIL_RECORDS * MAX_RECORDINGS_PER_TRAIL;
    console.log(`Done seeding ${totalRecords} records within db in ${seconds} seconds`)

    //Calculate time from start to end
    let totalTime = (end.getTime() - start.getTime()) / 1000;
    console.log('-----------------------------------');
    console.log(`Total Time: ${totalTime} seconds`);
    process.exit();
  } catch(err) {
    console.log('error in seeding: ', err);
    process.exit();
  }
})();
