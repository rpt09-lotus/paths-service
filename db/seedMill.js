const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const faker = require('faker');
const csvWriter = createCsvWriter({
  path: 'db/paths.csv',
  header: [
      {id: 'trail_id', title:'trail_id'},
      {id: 'is_hero_path', title: 'is_hero_path'},
      {id: 'gpx_url', title: 'gpx_url'},
      {id: 'have_gpx', title: 'have_gpx'}
  ]
});

let trail_id, is_hero_path, gpx_url, have_gpx;
const paths = [];
for (let i = 133; i < 1000001; i++) {
  paths.push({
    trail_id: i,
    is_hero_path: true,
    gpx_url: faker.lorem.words(),
    have_gpx: false
  });
}

csvWriter.writeRecords(paths)
  .then(() => {
    console.log('...Done creating csv');
  });
