const requestPromise = require("request-promise");
requestPromise.debug = false;
const {
  willHaveErrorResponse,
  willHaveValidResponse,
  getFirstAndLast
} = require("../testUtils.js");

describe("endpoints tests", () => {
  const validateHasGpxData = pathObj => {
    expect(pathObj.gpx_data).toBeDefined();
    expect(pathObj.gpx_data.bounds).toBeDefined();
    expect(pathObj.gpx_data.bounds).not.toBeNull();
    expect(pathObj.gpx_data.points).toBeDefined();
    expect(pathObj.gpx_data.points).not.toBeNull();
  };

  it("return 404 and error for invalid path", () => {
    return willHaveErrorResponse("/im_an_invalid_path", 404, () => {});
  });

  it("GET /paths", () => {
    return willHaveValidResponse("/paths", json => {
      expect(json.data.length).toBeGreaterThan(1);
    });
  });

  it("GET /:trailId/paths", () => {
    // test different routes and make sure we're getting proper trail_ids for all list
    const idsToTest = [1, 2];

    const promises = idsToTest.map(id => {
      return willHaveValidResponse(`/${id}/paths`, json => {
        expect(json.data.length).toBeGreaterThan(1);
        json.data.forEach(item => {
          expect(item.trail_id).toEqual(id);
        });
      });
    });
    return Promise.all(promises);
  });

  it("GET /:trailId/trailHead (detail info on beginning trail)", () => {
    // test different routes
    const idsToTest = [1, 2];

    const promises = idsToTest.map(id => {
      return willHaveValidResponse(`/${id}/trailHead`, json => {
        expect(json.data.length).toEqual(1);
        const pathObj = json.data[0];
        expect(pathObj.trailHead).toBeDefined();
        expect(pathObj.trailHead).not.toBeNull();
        expect(Object.keys(pathObj.trailHead).length).toEqual(3);
        ["lat", "lon", "ele"].forEach(att => {
          expect(pathObj.trailHead[att]).toBeDefined();
        });
      });
    });
    return Promise.all(promises);
  });

  it("GET /:trailId/heroPath (detail info on hero path including gpx data)", () => {
    // test different routes
    const idsToTest = [1, 2];

    const promises = idsToTest.map(id => {
      return willHaveValidResponse(`/${id}/heroPath`, json => {
        expect(json.data.length).toEqual(1);
        const pathObj = json.data[0];
        expect(pathObj.trail_id).toEqual(id);
        expect(pathObj.is_hero_path).toEqual(true);
        validateHasGpxData(pathObj);
      });
    });
    return Promise.all(promises);
  });

  it("GET /paths/:pathId (detail info on path including gpx data)", () => {
    // test different routes
    const idsToTest = [1, 2];

    const promises = idsToTest.map(id => {
      return willHaveValidResponse(`/paths/${id}`, json => {
        expect(json.data.length).toEqual(1);
        const pathObj = json.data[0];
        expect(pathObj.id).toEqual(id);
        validateHasGpxData(pathObj);
      });
    });
    return Promise.all(promises);
  });

  it("GET /:trailId/recordings", () => {
    // test different routes
    const idsToTest = [1, 2];

    const promises = idsToTest.map(id => {
      return willHaveValidResponse(`/${id}/recordings`, json => {
        expect(json.data.length).toBeGreaterThan(1);
        json.data.forEach(item => {
          expect(item.trail_id).toEqual(id);
          expect(item.is_hero_path).toEqual(false);
        });
      });
    });
    return Promise.all(promises);
  });

  it("GET /:trailId/recordings can be sorted by rating", () => {
    // test different routes, we do more
    const idsToTest = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const promises = idsToTest.map(id => {
      return Promise.all([
        // rating desc
        willHaveValidResponse(`/${id}/recordings?sortBy=rating,desc`, json => {
          expect(json.data.length).toBeGreaterThan(1);
          // grab first and last
          const [first, last] = getFirstAndLast(json.data, "rating", val => {
            return val || 0;
          });
          // descending
          expect(first).toBeGreaterThan(last);
          return;
        }),
        // rating asc
        willHaveValidResponse(`/${id}/recordings?sortBy=rating,asc`, json => {
          expect(json.data.length).toBeGreaterThan(1);
          // grab first and last
          const [first, last] = getFirstAndLast(json.data, "rating", val => {
            return val || 0;
          });
          // ascending
          expect(last).toBeGreaterThan(first);
          return;
        })
      ]);
    });
    return Promise.all(promises);
  });

  it("GET /:trailId/recordings can be sorted by date", () => {
    // test different routes, we do more
    const idsToTest = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const promises = idsToTest.map(id => {
      return Promise.all([
        // date desc
        willHaveValidResponse(`/${id}/recordings?sortBy=date,desc`, json => {
          expect(json.data.length).toBeGreaterThan(1);
          const [first, last] = getFirstAndLast(json.data, "date", val => {
            return new Date(val).getTime();
          });
          // descending
          expect(first).toBeGreaterThan(last);
          return;
        }),
        // date asc
        willHaveValidResponse(`/${id}/recordings?sortBy=date,asc`, json => {
          expect(json.data.length).toBeGreaterThan(1);
          const [first, last] = getFirstAndLast(json.data, "date", val => {
            return new Date(val).getTime();
          });
          // ascending
          expect(last).toBeGreaterThan(first);
          return;
        })
      ]);
    });
    return Promise.all(promises);
  });

  it("GET /:trailId/recordings returns error on invalid sort key", () => {
    const idsToTest = [1];

    const promises = idsToTest.map(id => {
      return willHaveErrorResponse(
        `/${id}/recordings?sortBy=invalid_sortKey`,
        500
      );
    });

    return Promise.all(promises);
  });

  it("POST /:trailId/recordings fails with invalid data", () => {
    return willHaveErrorResponse({
      method: "POST",
      uri: "/1/recordings",
      body: {
        i_am: "an_invalid_set_of_data"
      }
    });
  });

  it("POST /:trailId/recordings works with valid data", () => {
    return willHaveValidResponse({
      method: "POST",
      uri: "/1/recordings",
      body: {
        user_id: 5,
        date: "1234",
        ranking: 1,
        comment: "something",
        gpx:
          '<?xml version="1.0"?><gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.1" creator="AllTrails.com" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd"><metadata><name><![CDATA[Na Pali Coast (Kalalau) Trail]]></name><desc><![CDATA[]]></desc><link href="http://www.alltrails.com"><text>AllTrails, Inc.</text></link><bounds minlat="22.20477" minlon="-159.60318" maxlat="22.21898" maxlon="-159.58557"/></metadata><trk><name/><desc/><trkseg><trkpt lat="22.21898" lon="-159.58557"><ele>67.55</ele><time>2017-12-31T00:58:57Z</time></trkpt><trkpt lat="22.21894" lon="-159.58559"><ele>69.03</ele><time>2017-12-31T00:59:13Z</time></trkpt><trkpt lat="22.2189" lon="-159.58563"><ele>70.97</ele><time>2017-12-31T00:59:18Z</time></trkpt></trkseg></trk></gpx>'
      }
    });
  });
});
