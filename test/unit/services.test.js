const { Client } = require('pg');
const requestPromise = require('request-promise');
requestPromise.debug = false;
const awsHelper = require('../../services/aws.js');
const validator = require('../../services/validator.js');
const { willRejectAll } = require('.././testUtils.js');

describe('aws tests', () => {

  let gpxFileName;
 
  
  beforeEach(() => {
    gpxFileName = "testing_path.gpx";
  })

  it('creates a S3 endpoint from a filename', () => {
    expect(awsHelper.getS3Url(gpxFileName)).toContain('https://s3.amazonaws.com');
    expect(awsHelper.getS3Url(gpxFileName)).toContain(gpxFileName);
  })

  it('reads a gpx file based on a given url', () => {
    return requestPromise(awsHelper.getS3Url(gpxFileName));
  });

  it('parses a valid gpx file based on a given url', () => {
    return requestPromise(awsHelper.getS3Url(gpxFileName)).then((data) => {
      return awsHelper.parseGPX(data);
    });
  });

  it('throws error for invalid gpx file', () => {
    return willRejectAll([
      awsHelper.parseGPX(''),
      awsHelper.parseGPX('not_xml'),
      awsHelper.parseGPX('<xml><not_gpx_tho/></xml>')
    ]).then(({rejectedAll, createRejectionMessage}) => {
      if (!rejectedAll) {
        throw createRejectionMessage('gpx data');
      }
    });
  })
});

describe('validator tests', () => {

  let validGpxData;

  beforeEach(() => {
    validGpxData = "<?xml version=\"1.0\"?><gpx xmlns=\"http://www.topografix.com/GPX/1/1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" version=\"1.1\" creator=\"AllTrails.com\" xsi:schemaLocation=\"http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd\"><metadata><name><![CDATA[Na Pali Coast (Kalalau) Trail]]></name><desc><![CDATA[]]></desc><link href=\"http://www.alltrails.com\"><text>AllTrails, Inc.</text></link><bounds minlat=\"22.20477\" minlon=\"-159.60318\" maxlat=\"22.21898\" maxlon=\"-159.58557\"/></metadata><trk><name/><desc/><trkseg><trkpt lat=\"22.21898\" lon=\"-159.58557\"><ele>67.55</ele><time>2017-12-31T00:58:57Z</time></trkpt><trkpt lat=\"22.21894\" lon=\"-159.58559\"><ele>69.03</ele><time>2017-12-31T00:59:13Z</time></trkpt><trkpt lat=\"22.2189\" lon=\"-159.58563\"><ele>70.97</ele><time>2017-12-31T00:59:18Z</time></trkpt></trkseg></trk></gpx>";
  });

  it('throws for various missing/invalid fields in a submission', () => {
    return willRejectAll([
        // nothing
        {},
        // missing date
        {"user_id": 5},
        // missing gpx
        {"user_id": 5,"date": "1234"},
        // not valid xml
        { "user_id": 5, "date": "1234", "gpx": "im not xml" },
        // not a valid gpx file, but valid xml
        { "user_id": 5, "date": "1234", "gpx": "<xml></xml>" },
        // comment must be a string
        { "user_id": 5, "date": "1234", "comment": 3 },
        // date cannot be blank
        { "user_id": 5, "date": " ", "comment": 3 },
        // ranking cannot excceed 5
        { "user_id": 4, "date": "1234", "ranking": 6, "gpx": validGpxData }
      ].map( (json) => {
        // creates validator promises
        return validator.validate(json);
    })).then(({rejectedAll, createRejectionMessage}) => {
      // now lets analyze our results and fail test if not all we're rejected
      if (!rejectedAll) {
        throw createRejectionMessage('gpx data');
      }
    });
  });

  it('validate valid submission', () => {
    return validator.validate({ 
      "user_id": 4, 
      "date": "1234", 
      "ranking": 4, 
      "gpx": validGpxData });
  });

});