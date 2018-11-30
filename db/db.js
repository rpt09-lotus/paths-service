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
   * @param {Object} pathObjects path objects to format
   * @param {Array} toFormat array of keys you would like to format (must be available in mappings)
   */
  baseFormatting: ['gpx_url', 'path_api_url'],
  formatDataAll: function(pathObjects, toFormat) {
    return Promise.all(pathObjects.map((row) => {
      return this.formatData(row, toFormat);
    }));
  },
  /**
   * 
   * @param {Object} pathObject path object to format
   * @param {Array} toFormat array of keys you would like to format (must be available in mappings)
   */
  // @toFormat:
  formatData : async function(pathObject, toFormat) {
    // establish mappings, can be asynchronous
    const mappings = {
      'path_api_url': (val, obj) => {
        return `${this.host}/paths/${obj.id}`
      },
      'gpx_url': (val, obj) => {
        return awsHelper.getS3Url(val);
      },
      'gpx_data': async (val, obj) => {
        try {
          const json =  await awsHelper.readGPXByUrl( awsHelper.getS3Url(obj.gpx_url));
          return json;
        } catch (e) {
          console.log('error: couldn\'t parse obj.gpx_url:', e);
          return null;
        }
      }
    };
    // create new object
    const willResolveFormatting = [];
    const formatKeys = [];
    const formattedObject = Object.assign({}, pathObject);
    Object.keys(mappings).forEach(async (mapKey) => {
      if (toFormat.indexOf(mapKey) !== -1 ) {
        formatKeys.push(mapKey);
        willResolveFormatting.push(mappings[mapKey](formattedObject[mapKey], formattedObject));
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
    });
  },
  getHeroPathByTrailId: function(id) {
    return client.query('SELECT * FROM paths WHERE trail_id=$1 AND is_hero_path=$2', [id, true]).then((data) => {
      return this.formatDataAll(data.rows, [...this.baseFormatting, 'gpx_data']);
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