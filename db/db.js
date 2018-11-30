const { Client } = require('pg');
const awsHelper = require('../services/aws.js');

const client = new Client({
  database: '9trails-paths',
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
});

client.connect();

module.exports = {
  /**
   * 
   * @param {Number} seed returns a pseudorandom number consistently based on given seed value
   */
  seededRandom: function(seed) {
    seed = (seed * 9301 + 49297) % 233280;
    var rnd = seed / 233280;
    return rnd;
  },
  /**
   * 
   * @param {Object} pathObjects path objects to format
   * @param {Array} toFormat array of keys you would like to format (must be available in mappings)
   */
  baseFormatting: ['gpx_url', 'path_api_url'],
  formatDataAll: function(pathObjects, toFormat) {
    return Promise.all(pathObjects.map((row) => {
      return this.formatData(row, toFormat);
    }));
  },
  backfillNonExistentGPX: async function(obj) {
    // lets instead get a list of valid gpxs and pick one based on a seed 
    try {
      let validGPXPool = await this.getValidGPXs();
      validGPXPool = validGPXPool.map((url) => {
        return awsHelper.getS3Url(url);
      })
      const randomGPXBackfill =  validGPXPool[Math.floor(this.seededRandom(obj.id) * validGPXPool.length)];
      console.log('backfilling with random gpx backfill:', randomGPXBackfill);
      const json =  await awsHelper.readGPXByUrl(randomGPXBackfill);
      // edit obj to preserve true (but broken gpx url)
      obj.backfilled_gpx_url = randomGPXBackfill;
      return json;
    } catch (e) {
      console.log('error: while trying to backfill with valid gpx', e);
      return null;
    }
  },
  /**
   * 
   * @param {Object} pathObject path object to format
   * @param {Array} toFormat array of keys you would like to format (must be available in mappings)
   */
  // @toFormat:
  formatData : async function(pathObject, toFormat) {
    // establish mappings, can be asynchronous
    const mappings = [{
      'path_api_url': (val, obj) => {
        return `${this.host}/paths/${obj.id}`
      }},{
      'gpx_url': (val, obj) => {
        return awsHelper.getS3Url(val);
      }},{
      'gpx_data': async (val, obj) => {
        try {
          const json =  await awsHelper.readGPXByUrl( awsHelper.getS3Url(obj.gpx_url));
          return json;
        } catch (e) {
          console.log('error: couldn\'t parse obj.gpx_url:', e);
          // we can't get all gpx data so we will backfill with a random val
          return await this.backfillNonExistentGPX(obj);
        }
      }
    }];
    // create new object
    const willResolveFormatting = [];
    const formatKeys = [];
    const formattedObject = Object.assign({}, pathObject);
    mappings.forEach(async (mapObj, index) => {
      const mapKey = Object.keys(mapObj)[0];
      if (toFormat.indexOf(mapKey) !== -1 ) {
        formatKeys.push(mapKey);
        willResolveFormatting.push(mapObj[mapKey](formattedObject[mapKey], formattedObject));
      }
    });
    try {
      await Promise.all(willResolveFormatting).then((resolvedVals) => {
        resolvedVals.forEach((resolvedVal, i) => {
          formattedObject[formatKeys[i]] = resolvedVal;
        });
  
      });
      // return object
      return formattedObject;
    } catch (e) {
      throw e;
    }
  },
  getAll: function() {
    return  client.query('SELECT * FROM paths').then((data) => {
      return this.formatDataAll(data.rows, [...this.baseFormatting]);
    });
  },
  
  getPathsByTrailId: function(id) {
    return  client.query('SELECT * FROM paths WHERE trail_id=$1', [id]).then((data) => {
      return this.formatDataAll(data.rows, [...this.baseFormatting]);
    }).then((rows) => {
      // backfill if we don't have any recordings
      if (rows.length <= 1) {
        return this.getBackfilledRecordings(id).then((backfilledRows) => {
          return rows.concat(backfilledRows);
        })
      } else {

        return rows;
      }
    });
  },
  getRecordingsByTrailId: function(id) {
    return  client.query('SELECT * FROM paths WHERE trail_id=$1 AND is_hero_path=$2', [id, false]).then((data) => {
      return this.formatDataAll(data.rows, [...this.baseFormatting]);
    }).then((rows) => {
      // backfill if we don't have any recordings
      if (rows.length === 0) {
        return this.getBackfilledRecordings(id).then((backfilledRows) => {
          return rows.concat(backfilledRows);
        })
      } else {

        return rows;
      }
    });
  },
  getBackfilledRecordings: function(id) {
    const MAX_EXTRA_RECORDINGS = 3;

    return  client.query('SELECT * FROM paths WHERE trail_id!=$1 and have_gpx=$2', [id, true]).then((data) => {
      return this.formatDataAll(data.rows, [...this.baseFormatting]);
    }).then(data => {
      const backfillAmount = 1 + Math.floor( this.seededRandom(id) * MAX_EXTRA_RECORDINGS);
      console.log(backfillAmount);
      return Array.from({length: backfillAmount}).map((item, index) => {
        item = data[Math.floor(this.seededRandom(id * (index + 1)) * data.length)];
        item.backfilled_recording = true;
        item.backfilled_from_trail = item.trail_id;
        item.trail_id = parseInt(id);
        return item;
      });
    });
  },
  getHeroPathByTrailId: function(id) {
    return client.query('SELECT * FROM paths WHERE trail_id=$1 AND is_hero_path=$2', [id, true]).then((data) => {
      return this.formatDataAll(data.rows, [...this.baseFormatting, 'gpx_data']);
    });
  },
  getValidGPXs: function() {
    return client.query('SELECT gpx_url FROM paths WHERE have_gpx=$1', [true]).then((data) => {
      return data.rows.map((row) => {
        return row.gpx_url;
      });
    });
  },
  getPathById: function(id) {
    return client.query('SELECT * FROM paths WHERE id=$1', [id]).then((data) => {
      return this.formatDataAll(data.rows, [...this.baseFormatting, 'gpx_data']);
    });
  },
  getTrailHeadById: function(id) {
    return this.getHeroPathByTrailId(id).then((data) => {
      return data.map(({id, gpx_url, path_api_url, gpx_data}) => {
        return {
          id,
          gpx_url, 
          path_api_url,
          trailHead: (!gpx_data) ? null : gpx_data.points[0]
        }
      });
    });
  }
}