const requestPromise = require("request-promise");
const dotenv = require("dotenv").config();
let testUtils;

module.exports = testUtils =  {
  /**
   * gets abs url from route based on env variables
   *
   */
  getAbsUrl: function(route) {
    const hostAndPort = `http://${process.env.HOST}:${process.env.PORT}`;
    return `${hostAndPort}${route}`;
  },

  /**
   *
   * @param {array} arr
   * @param {string} attribute optional attribute to return , otherwise returns item
   * @param {fn} afterGrabbed optional post processing
   */
  getFirstAndLast: function(
    arr,
    attribute = false,
    afterGrabbed = val => {
      return val;
    }
  ) {
    return [arr[0], arr[arr.length - 1]].map(item => {
      return afterGrabbed(attribute ? item[attribute] : item);
    });
  },

  /**
   *
   * @param {string} endpoint ex. /paths
   * @param {fn} postBaseValidation more assertions after base assertions are done
   *
   */
  willHaveValidResponse: function(endpoint, postBaseValidation = json => {}) {
    return requestPromise({
      uri: testUtils.getAbsUrl(endpoint),
      resolveWithFullResponse: true //gets headers, body, etc
    }).then(async resp => {
      expect(resp.statusCode).toEqual(200);
      json = await JSON.parse(resp.body);
      expect(typeof resp.body).toEqual("string");
      expect(json.data).toBeDefined();
      expect(Array.isArray(json.data)).toEqual(true);
      postBaseValidation(json);
      return;
    });
  },

  /**
   *
   * @param {string} endpoint ex. /invalid_path
   * @param {integer} expectedStatus ex. 404 default 400
   * @param {fn} postBaseValidation more assertions after base assertions are don
   */
  willHaveErrorResponse: function(
    endpoint,
    expectedStatus = 400,
    postBaseValidation = json => {}
  ) {
    requestPromise({
      uri: testUtils.getAbsUrl(endpoint),
      resolveWithFullResponse: true, //gets headers, body, etc
      simple: false // we dont want a 404 to trigger a reject
    }).then(async resp => {
      expect(resp.statusCode).toEqual(expectedStatus);
      expect(typeof resp.body).toEqual("string");
      json = await JSON.parse(resp.body);
      expect(json.error).toBeDefined();
      postBaseValidation(json);
      return;
    });
  }
};
