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
   * we could just recieve a url end point or a set of request options (uri + post + body etc...), so we'll resolve
   *
   * @param {String|Object} endpointOrOptions string or request options
   * 
   */
  resolveEndpointOrOptionsValue: function(endpointOrOptions) {
    let resultOptions;
    if (typeof endpointOrOptions === 'string') {
      resultOptions =  {
        uri: testUtils.getAbsUrl(endpointOrOptions)
      }
    } else {
      resultOptions = endpointOrOptions;
      resultOptions.uri = testUtils.getAbsUrl(endpointOrOptions.uri);
  
    }

    // extend with defaults
    resultOptions =  Object.assign({
      resolveWithFullResponse: true, //gets headers, body, etc
      simple: false, // we dont want a 404 to trigger a reject
      json: true
    }, resultOptions);
    return resultOptions;
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
  willHaveValidResponse: function(endpointOrOptions, postBaseValidation = json => {}) {
    if (endpointOrOptions)
    return requestPromise(testUtils.resolveEndpointOrOptionsValue(endpointOrOptions)).then(async resp => {
      expect(resp.statusCode).toEqual(200);
      expect(typeof resp.body).toEqual("object");
      const json = resp.body;
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
    endpointOrOptions,
    expectedStatus = 400,
    postBaseValidation = json => {}
  ) {
      return requestPromise(testUtils.resolveEndpointOrOptionsValue(endpointOrOptions)).then(async resp => {
      expect(resp.statusCode).toEqual(expectedStatus);
      expect(typeof resp.body).toEqual("object");
      const json = resp.body;
      expect(json.error).toBeDefined();
      postBaseValidation(json);
      return;
    });
  },
  /**
   * 
   * @param {arr} promises array of promises
   * @returns {object} results stats/methods like {'rejectedAll', 'passed', 'total', 'results', 'createRejectionMssage()`}
   */
  willRejectAll: function(promises) {

    // set a catcher
    promises = promises.map((promise) => {
      return promise.then(() => 'ok')
      .catch((e) => {
        return 'Error: ' + e
      });
    })

    return Promise.all(promises).then((arr) => {
      const amountThatPassed = arr.filter((result) => {return result === 'ok'}).length;
     
      // properties
      const results = {
        'rejectedAll':  (amountThatPassed === 0 ),
        'passed': amountThatPassed,
        'total': arr.length,
        'results': arr
      }

      // methods
      results.createRejectionMessage = (testsDescriptor) => {
        return `\n
        \n ${results.passed} /  ${results.total} invalid ${testsDescriptor} passed, none should pass.
        \n
        \n Results:
        \n${ results.results.map((item, index) => {return `(#${index}) ${item}`}).join('\n')}
        \n
        \n`;

      }
      return results;
    });
  }
};
