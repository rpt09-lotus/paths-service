const { Client } = require('pg');
const db = require('../../db/db.js');
const dotenv = require('dotenv').config();


describe('DB tests', () => {

  const validateHasGpxData = (pathObj) => {
    expect(pathObj.gpx_data).toBeDefined();
    expect(pathObj.gpx_data.bounds).toBeDefined();
    expect(pathObj.gpx_data.bounds).not.toBeNull();
    expect(pathObj.gpx_data.points).toBeDefined();
    expect(pathObj.gpx_data.points).not.toBeNull();
  }

  it('expects to connect to database with .env info', () => {
    const client = new Client({
      database: '9trails-paths',
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    });
    
    // in ject you can just return a promise as a test;
    return client.connect();
  });

  it('gets all paths from db', () => {
    return db.getAll().then((data) => {
      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(1);
    })
  });

  it('gets paths by trail id ', () => {

    const id = 1;
    return db.getPathsByTrailId(id).then((data) => {
      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(1);
      data.forEach((path) => {
        expect(path.trail_id).toEqual(id);
      });
    })
  });

  it('gets recordings by trail id ', () => {

    const id = 1;
    return db.getRecordingsByTrailId(id).then((data) => {
      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(1);
      data.forEach((path) => {
        expect(path.trail_id).toEqual(id);
        expect(path.is_hero_path).toEqual(false);
      });
    })
  });

  it('gets hero path of trail id', () => {

    const id = 1;
    return db.getHeroPathByTrailId(id).then((data) => {
      expect(data).toBeDefined();
      expect(data.length).toEqual(1);
      const heroPath = data[0];
      expect(heroPath.is_hero_path).toEqual(true);
      expect(heroPath.trail_id).toEqual(id);
    })
  });

  it('gets Path by id', () => {

    const id = 1;
    return db.getPathById(id).then((data) => {
      expect(data).toBeDefined();
      expect(data.length).toEqual(1);
      const path = data[0];
      expect(path.id).toEqual(id);
    })
  });


  it('gets trailHead By Id', () => {

    const id = 1;
    return db.getTrailHeadById(id).then((data) => {
      expect(data).toBeDefined();
      expect(data.length).toEqual(1);
      const path = data[0];
      expect(path.trailHead).toBeDefined();
    })
  });

  it('gets all paths with valid gpx files', () => {

    const id = 1;

    return db.getValidGPXs(id).then((data) => {
      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(1);
      data.forEach((url) => {
        expect(typeof url).toEqual('string');
      });
    })
  })

});