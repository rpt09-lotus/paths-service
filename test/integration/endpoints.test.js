const requestPromise = require('request-promise');
const dotenv = require('dotenv').config();
requestPromise.debug = false;

describe('endpoints tests', () => {

  const hostAndPort = `http://${process.env.HOST}:${process.env.PORT}`
  const getAbsUrl = (route) => {
    return `${hostAndPort}${route}`;
  }

  /**
   * 
   * @param {string} endpoint ex. /paths
   * @param {fn} postBaseValidation more assertions after base assertions are done
   * 
   */
  const willHaveValidResponse = (endpoint, postBaseValidation = (json) => {}) => {
    return requestPromise({
      uri: getAbsUrl(endpoint), 
      resolveWithFullResponse: true  //gets headers, body, etc
   }).then( async (resp) => {
     expect(resp.statusCode).toEqual(200);
     json = await JSON.parse(resp.body);
     expect(typeof resp.body).toEqual('string');
     expect(json.data).toBeDefined();
     expect(Array.isArray(json.data)).toEqual(true);
     postBaseValidation(json);
     return;
   });
  }
//   GET /paths
// retrieves all paths in database (shouldn't really be used except for testing)
// GET /:trailId/paths?sortBy={id|rating|date},{asc|desc}*
// retrieves all recordings / paths for a specified trail id. sort optionas as shown (optional!)
// GET /:trailId/recordings?sortBy={id|rating|date},{asc|desc}*
// retrieves all recordings (excluding hero path) for a specified trail id. sort optionas as shown (optional!)
// POST /:trailId/recordings
// post a user path recording to a specified trail id.
// GET /paths/:pathId *
// retrieves detailed information about a path by a given ID in database. this also will retrieve gpx data.
// GET /:trailId/heroPath *
// retrieves detailed information about the canonical path for a given trail data. this also will retrieve gpx data.
// GET /:trailId/trailHead *

  it('return 404 and error for invalid path', () => {
    return requestPromise({
      uri: getAbsUrl('/im_an_invalid_path'), 
      resolveWithFullResponse: true,  //gets headers, body, etc
      simple: false // we dont want a 404 to trigger a reject
   }).then(async (resp) => {
      expect(resp.statusCode).toEqual(404);
      expect(typeof resp.body).toEqual('string');
      json = await JSON.parse(resp.body);
      expect(json.error).toBeDefined();
      return;
    })
  });

  it('GET /paths', () => {
    return willHaveValidResponse('/paths', (json) => {
      expect(json.data.length).toBeGreaterThan(1);
    })
  });

  it('GET /:trailId/paths', () => {
    // test different routes and make sure we're getting proper trail_ids for all list
    const idsToTest = [1,2];
    const promises = idsToTest.map((id) => {
      return willHaveValidResponse(`/${id}/paths`, (json) => {
        expect(json.data.length).toBeGreaterThan(1);
        json.data.forEach((item) => {
          expect(item.trail_id).toEqual(id);
        });
      });
    });
    return Promise.all(promises);
  });
});