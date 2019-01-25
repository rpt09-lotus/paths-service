const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const faker = require('faker');

const START_TRAIL_RECORD = 133;
const START_TRAIL_ID_RECORDING = 21;
const TOTAL_TRAIL_RECORDS = 10000000;
const LATEST_DATE = 1548208265331;
const MAX_GPX_ID = 22000001;
const MAX_RECORDINGS_PER_TRAIL = 4;

const connection = {
  user: process.env.DB_USER,
  host: process.env.HOST,
  database: '9trails-paths',
  password: process.env.DB_PASS,
};

const { Client } = require('pg');

const client = new Client(connection);
client.connect();

const csvHero = createCsvWriter({
  path: 'db/hero.csv',
  header: [
    {id: 'trail_id', title:'trail_id'},
    {id: 'is_hero_path', title: 'is_hero_path'},
    {id: 'gpx_url', title: 'gpx_url'},
    {id: 'have_gpx', title: 'have_gpx'}
  ]
});

const csvRecordings = createCsvWriter({
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

const runSql = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(__dirname + '/schema.sql'), (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  }).then((data) => {
    const sqlString = data.toString();
    const qs = client.query(sqlString);
    return qs;
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
    for (let i = START_TRAIL_RECORD; i < START_TRAIL_RECORD + TOTAL_TRAIL_RECORDS + 1; i++) {
      // console.log('length: ', heroPaths.length, 'i: ', i);
      heroPaths.push({
        trail_id: i,
        is_hero_path: true,
        gpx_url: faker.lorem.words(),
        have_gpx: false
      });
      if (i === START_TRAIL_RECORD) {
        await csvHero.writeRecords(heroPaths);
        heroPaths.length = 0;
      }
      if (heroPaths.length > 99 || i === START_TRAIL_RECORD + TOTAL_TRAIL_RECORDS) {
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
  })
}

const seedRecordings = (start) => {
  return new Promise( async (resolve) => {
    const recordings = [];
    for (let i = START_TRAIL_ID_RECORDING; i < START_TRAIL_ID_RECORDING + TOTAL_TRAIL_RECORDS + 1; i++) {
      for (let j = 0; j < MAX_RECORDINGS_PER_TRAIL; j++) {
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

        if (i === START_TRAIL_ID_RECORDING) {
          await csvRecordings.writeRecords(recordings);
          recordings.length = 0;
        }

        if (recordings.length > 99 || i === START_TRAIL_ID_RECORDING + TOTAL_TRAIL_RECORDS && j === 3) {
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
  });
}

const main = (async () => {
  try {
    //Seed hero paths
    console.log('Creating hero.csv...');
    let start = new Date();
    const heroObj = await seedHeros(start);
    console.log(heroObj.msg);

    //Seed recordings
    console.log('Creating recordings.csv...');
    let startRecordings = new Date();
    const recordingsObj = await seedRecordings(startRecordings);
    console.log(recordingsObj.msg);
    console.log('Seeding to db...');
    let sqlTime = new Date();
    await runSql();
    let end = new Date();
    let seconds = (end.getTime() - sqlTime.getTime()) / 1000;
    console.log(`Done seeding ${TOTAL_TRAIL_RECORDS + TOTAL_TRAIL_RECORDS * MAX_RECORDINGS_PER_TRAIL} records within db in ${seconds} seconds`)
    let totalTime = (end.getTime() - start.getTime()) / 1000;
    console.log('-----------------------------------');
    console.log(`Total Time: ${totalTime} seconds`);
  } catch(err) {
    console.log('error in seeding: ', err);
  }
})();
