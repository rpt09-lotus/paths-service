const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
// var csvWriter = require('csv-write-stream')
// var writer = csvWriter();
const faker = require('faker');

const main = (async () => {
  const TOTAL_TRAIL_RECORDS = 1000000;
  const LATEST_DATE = 1548208265331;
  const MAX_GPX_ID = 22000001;
  const MAX_RECORDINGS_PER_TRAIL = 4;

  const csvHero = createCsvWriter({
    path: 'db/hero.csv',
    header: [
      {id: 'trail_id', title:'trail_id'},
      {id: 'is_hero_path', title: 'is_hero_path'},
      {id: 'gpx_url', title: 'gpx_url'},
      {id: 'have_gpx', title: 'have_gpx'}
    ]
  });

  csvHero.writeRecords([])
  .then(() => {
    console.log('...Done creating hero csv');
  });

  const heroPaths = [];
  for (let i = 133; i < TOTAL_TRAIL_RECORDS + 1; i++) {
    if (heroPaths.length > 99 || i === TOTAL_TRAIL_RECORDS) {
      await csvHero.writeRecords(heroPaths);
      heroPaths.length = 0;
    }
    heroPaths.push({
      trail_id: i,
      is_hero_path: true,
      gpx_url: faker.lorem.words(),
      have_gpx: false
    });
  }
  
  
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
  
  csvRecordings.writeRecords([])
    .then(() => {
      console.log('...Done creating recordings csv');
    });
  
  const seededRandom = (seed) => {
    seed = (seed * 9301 + 49297) % 233280;
    var rnd = seed / 233280;
    return rnd;
  };
  
  const recordings = [];
  for (let i = 21; i < TOTAL_TRAIL_RECORDS + 1; i++) {
    for (let j = 0; j < MAX_RECORDINGS_PER_TRAIL; j++) {
      if (recordings.length > 99 || i === TOTAL_TRAIL_RECORDS) {
        await csvRecordings.writeRecords(recordings);
        recordings.length = 0;
      }
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
    }
  }
})();
