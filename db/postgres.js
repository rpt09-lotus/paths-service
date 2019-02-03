const { Client } = require('pg');
const awsHelper = require('../services/aws.js');
const pathUtils = require('../services/pathUtils.js');
const dotenv = require('dotenv').config();

const client = new Client({
  database: process.env.DB_NAME,
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
   * Valid sort options and formatters
   * 
   */
  VALID_SORT_OPTIONS: {
    ascOrDesc: ['asc', 'desc'],
    sortBy: [
      'id', 
      'rating', 
      {
        'name': 'date',
        'format': (val) => {
        // optional pre sort formatter
          return new Date(val).getTime();
        }
      }],
  },
  /**
   * 
   * @param {string} sortBy column to sort by
   * @param {string} ascOrDesc asc or desc string
   */
  validateSortOptions: function(sortBy, ascOrDesc) {
    const VALID_SORT_KEYS = this.VALID_SORT_OPTIONS.sortBy.map((item) => {
      // get keys to determine validity
      return (typeof item === 'object') ? item.name : item;
    });
    return (
      VALID_SORT_KEYS.indexOf(sortBy.toLowerCase()) !== -1 &&
        this.VALID_SORT_OPTIONS.ascOrDesc.indexOf(ascOrDesc.toLowerCase()) !== -1
    );
  },
  generateOrderString: function(sortBy, ascOrDesc) {
    return `${sortBy} ${ascOrDesc}`;
  },
  /**
   * 
   * @param {string} sortBy name of sort key
   * @returns {fn} function that formats value for sorting
   * 
   */
  sortFormatterFactory: function(sortBy) {
    // create a formatter function 
    let formatterFunc = (val) => { return val; };
    let key; let currFormatter;
    this.VALID_SORT_OPTIONS.sortBy.forEach((item) => {
      // get keys to determine sort formatter
      key = (typeof item === 'object') ? item.name : item;
      // strore format func
      currFormatter = (typeof item === 'object') ? item.format : (val) => { return val; };
      if (key.trim().toLowerCase() === sortBy.trim().toLowerCase()) {
        formatterFunc = currFormatter;
      }
    });
    return formatterFunc;
  },
  sortBy: function([...arr], sortBy, ascOrDesc) {
    const formatForSorting = this.sortFormatterFactory(sortBy);
    arr.sort((a, b) => {
      if (ascOrDesc.toLowerCase() === 'asc') {
        return formatForSorting(a[sortBy]) - formatForSorting(b[sortBy]);
      } else {
        return formatForSorting(b[sortBy]) - formatForSorting(a[sortBy]);
      }
    });
    return arr;
  },
  /**
   * 
   * @param {Object} pathObjects path objects to format
   * @param {Array} toFormat array of keys you would like to format (must be available in mappings)
   */
  baseFormatting: ['gpx_url', 'path_api_url', 'date'],
  formatDataAll: function(pathObjects, toFormat) {
    return Promise.all(pathObjects.map((row) => {
      return this.formatData(row, toFormat);
    }));
  },
  backfillNonExistentGPX: function(obj) {
    // lets instead get a list of valid gpxs and pick one based on a seed 
    return (async () => {
      try {
        let validGPXPool = await this.getValidGPXs();
        validGPXPool = validGPXPool.map((url) => {
          return awsHelper.getS3Url(url);
        });
        const randomGPXBackfill = validGPXPool[Math.floor(this.seededRandom(obj.id) * validGPXPool.length)];
        console.log('backfilling with random gpx backfill:', randomGPXBackfill);
        const json = await awsHelper.readGPXByUrl(randomGPXBackfill);
        // edit obj to preserve true (but broken gpx url)
        obj.backfilled_gpx_url = randomGPXBackfill;
        return json;
      } catch (e) {
        console.log('error: while trying to backfill with valid gpx', e);
        return null;
      }
    })();
  },
  /**
   * 
   * @param {Object} pathObject path object to format
   * @param {Array} toFormat array of keys you would like to format (must be available in mappings)
   */
  // @toFormat:
  formatData: async function(pathObject, toFormat) {
    // establish mappings, can be asynchronous
    const mappings = [{
      'path_api_url': (val, obj) => {
        return `${this.host}/paths/${obj.id}`;
      }}, {
      'gpx_url': (val, obj) => {
        return awsHelper.getS3Url(val);
      }}, {
      'date': (val) => {
        return new Date(parseInt(val)).toJSON();
      }}, {
      'gpx_data': async (val, obj) => {
        let gpxData = null;
        try {
          gpxData = await awsHelper.readGPXByUrl( awsHelper.getS3Url(obj.gpx_url));
        } catch (e) {
          console.log('error: couldn\'t parse obj.gpx_url:', e);
          // we can't get all gpx data so we will backfill with a random val
          gpxData = await this.backfillNonExistentGPX(obj);
        }
        const elevUnits = 'feet';
        gpxData.min_max_elevation = {units: elevUnits, value: pathUtils.getMinMaxElevation(gpxData.points, {units: elevUnits})};
        const lengthUnits = 'miles';
        gpxData.length = {units: lengthUnits, value: pathUtils.getPathLength(gpxData.points, {units: lengthUnits})};
        return gpxData;
      },
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
    return client.query('SELECT * FROM paths').then((data) => {
      return this.formatDataAll(data.rows, [...this.baseFormatting]);
    });
  },
  
  getPathsByTrailId: function(id, sortBy = 'id', ascOrDesc = 'DESC') {
    if (!this.validateSortOptions(sortBy, ascOrDesc)) {
      return new Promise((res, rej) => { rej('Sort options not valid!'); });
    }
    return client.query('SELECT * FROM paths WHERE trail_id=$1 ORDER BY ' + 
    this.generateOrderString(sortBy, ascOrDesc), [id]).then((data) => {
      return this.formatDataAll(data.rows, [...this.baseFormatting]);
    }).then((rows) => {
      // backfill if we don't have any recordings
      if (rows.length <= 1) {
        return this.getBackfilledRecordings(id).then((backfilledRows) => {
          return this.sortBy(rows.concat(backfilledRows), sortBy, ascOrDesc);
        });
      } else {

        return this.sortBy(rows, sortBy, ascOrDesc);
      }
    });
  },
  getRecordingsByTrailId: function(id, sortBy = 'id', ascOrDesc = 'DESC') {
    if (!this.validateSortOptions(sortBy, ascOrDesc)) {
      return new Promise((res, rej) => { rej('Sort options not valid!'); });
    }

    return client.query('SELECT * FROM paths WHERE trail_id=$1 AND is_hero_path=$2 ORDER BY ' + 
    this.generateOrderString(sortBy, ascOrDesc), [id, false]).then((data) => {
      return this.formatDataAll(data.rows, [...this.baseFormatting]);
    }).then((rows) => {
      // backfill if we don't have any recordings
      if (rows.length === 0) {
        return this.getBackfilledRecordings(id, sortBy, ascOrDesc).then((backfilledRows) => {
          return this.sortBy(rows.concat(backfilledRows), sortBy, ascOrDesc);
        });
      } else {

        return this.sortBy(rows, sortBy, ascOrDesc);
      }
    });
  },
  getBackfilledRecordings: function(id) {
    const MAX_EXTRA_RECORDINGS = 3;
    return client.query('SELECT * FROM paths WHERE trail_id!=$1 and have_gpx=$2  AND is_hero_path=$3', [id, true, false]).then((data) => {
      return this.formatDataAll(data.rows, [...this.baseFormatting]);
    }).then(data => {
      const backfillAmount = 1 + Math.floor( this.seededRandom(id) * MAX_EXTRA_RECORDINGS);
      console.log(backfillAmount);
      return Array.from({length: backfillAmount}).map((item, index) => {
        item = data[Math.floor(this.seededRandom(id * (index + 1)) * data.length)];
        item.backfilled_recording = true;
        item.backfilled_from_trail = item.trail_id;
        item.comment = null;
        item.trail_id = parseInt(id);
        return item;
      });
    });
  },
  getHeroPathByTrailId: function(id, redividePath = null) {
    return client.query('SELECT * FROM paths WHERE trail_id=$1 AND is_hero_path=$2', [id, true]).then((data) => {
      return this.formatIndividualPath(data, redividePath);
    });
  },
  getValidGPXs: function() {
    return client.query('SELECT gpx_url FROM paths WHERE have_gpx=$1 AND is_hero_path=$2', [true, false]).then((data) => {
      return data.rows.map((row) => {
        return row.gpx_url;
      });
    });
  },
  formatIndividualPath: function(data, redividePath = null) {
    return this.formatDataAll(data.rows, [...this.baseFormatting, 'gpx_data']).then((data) => {
      if (redividePath) {
        data[0].gpx_data.redividedPoints = pathUtils.redividePath(data[0].gpx_data.points, redividePath);
        return data;
      } else {
        return data;
      }
    });
  },
  getPathById: function(id, redividePath = null) {
    return client.query('SELECT * FROM paths WHERE id=$1', [id]).then((data) => {
      return this.formatIndividualPath(data, redividePath);
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
        };
      });
    });
  }
};