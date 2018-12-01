const requestPromise = require('request-promise');
requestPromise.debug = false;
const {willHaveErrorResponse, willHaveValidResponse, getFirstAndLast } = require('../testUtils.js');

describe('endpoints tests', () => {


// POST /:trailId/recordings
// post a user path recording to a specified trail id.
// GET /paths/:pathId *
// retrieves detailed information about a path by a given ID in database. this also will retrieve gpx data.
// GET /:trailId/heroPath *
// retrieves detailed information about the canonical path for a given trail data. this also will retrieve gpx data.
// GET /:trailId/trailHead *

  it('return 404 and error for invalid path', () => {
    return willHaveErrorResponse('/im_an_invalid_path', 404, () => {

    });
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

  it('GET /:trailId/recordings', () => {
    // test different routes
    const idsToTest = [1,2];

    const promises = idsToTest.map((id) => {
      return willHaveValidResponse(`/${id}/recordings`, (json) => {
        expect(json.data.length).toBeGreaterThan(1);
        json.data.forEach((item) => {
          expect(item.trail_id).toEqual(id);
          expect(item.is_hero_path).toEqual(false);
        });
      });
    });
    return Promise.all(promises);
  });


  it('GET /:trailId/recordings can be sorted by rating or date', () => {
    // test different routes
    const idsToTest = [1];

    const promises = idsToTest.map((id) => {
      return Promise.all([
          // rating desc
          willHaveValidResponse(`/${id}/recordings?sortBy=rating,desc`, (json) => {
          expect(json.data.length).toBeGreaterThan(1);
          // grab first and last
          const [first, last] = getFirstAndLast(json.data, 'rating', (val) => {return val || 0});
          // descending
          expect(first).toBeGreaterThan(last);
          return;
        }),
          // rating asc
          willHaveValidResponse(`/${id}/recordings?sortBy=rating,asc`, (json) => {
          expect(json.data.length).toBeGreaterThan(1);
          // grab first and last
          const [first, last] = getFirstAndLast(json.data, 'rating', (val) => {return val || 0});
          // ascending
          expect(last).toBeGreaterThan(first);
          return;
        }),
          // date desc
          willHaveValidResponse(`/${id}/recordings?sortBy=date,desc`, (json) => {
          expect(json.data.length).toBeGreaterThan(1);
          const [first, last] = getFirstAndLast(json.data, 'date', (val) => {return parseInt(val)});
          // descending
          expect(first).toBeGreaterThan(last);
          return;
        }),
          // date asc
          willHaveValidResponse(`/${id}/recordings?sortBy=date,asc`, (json) => {
          expect(json.data.length).toBeGreaterThan(1);
          const [first, last] = getFirstAndLast(json.data, 'date', (val) => {return parseInt(val)});
          // ascending
          expect(last).toBeGreaterThan(first);
          return;
        }),
      ]);
    });
    return Promise.all(promises);
  });

  it('GET /:trailId/recordings can be sorted by rating or date', () => {

  });
});