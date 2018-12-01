const { Client } = require('pg');
const requestPromise = require('request-promise');
requestPromise.debug = false;
const awsHelper = require('../../services/aws.js');
const validator = require('../../services/validator.js');

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

});