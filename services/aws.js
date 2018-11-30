const xml2json = require('xml2json');
const requestPromise = require('request-promise');
requestPromise.debug = false;

module.exports = {
  URL_PREFIX: 'https://s3.amazonaws.com/9trails-gpx/',
  getS3Url: function(file) {
    return `${this.URL_PREFIX}${file}`
  },
  readGPXByUrl: function(url) {

    return requestPromise(url).then(xml => {
      let json = xml2json.toJson(xml);
      json = JSON.parse(json);
      if (json.gpx && json.gpx.metadata && json.gpx.metadata.bounds ) {
        let points = [];
        const gpx = json.gpx;
        debugger;
        if (gpx.rte && gpx.rte.rtept) {
          points = gpx.rte.rtept;
        } else if (gpx.trk && gpx.trk.trkseg) {
          if (Array.isArray(gpx.trk.trkseg)) {
            gpx.trk.trkseg.forEach((el) => {
              if (Array.isArray(el.trkpt)) {
                points = points.concat(el.trkpt);
              }
            });
          } else {
            points = gpx.trk.trkseg.trkpt;
          }
        } else {
          throw 'Could not find points of gpx file!'
        }
        return {
          bounds: gpx.metadata.bounds,
          points: points
        }
      } else {
        throw 'Not a valid gpx file';
      }
    })
  }
};