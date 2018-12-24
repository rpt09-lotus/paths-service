const requestPromise = require('request-promise');
const db = require('../db/db.js');
const mbgl = require('@mapbox/mapbox-gl-native');
const styleJson = require('../server/assets/mapbox/style.json');
const sharp = require('sharp');
const {Readable} = require('stream');

const staticMap = module.exports = {
  bufferToStream: (buffer) => { 
    let stream = new Readable ();
    stream.push(buffer);
    stream.push(null);
    return stream;
  },
  renderStaticMap: (pathId, width = 800, height = 300) => {

    const modifier = 0.45;
    return db.getPathById(pathId).then((result) => {
      width = Number(width);
      height = Number(height);
      if (isNaN(width) || isNaN(height)) {
        throw 'Width and Height values must be numbers.';
      } else if (width < 1|| height < 1) {
        throw 'Width and Height  values must be greater than 0';
      }
      // get gpx data
      const bounds = result[0].gpx_data.bounds;
      const points = result[0].gpx_data.points.map(({ lat, lon }) => {
        return [parseFloat(lon), parseFloat(lat)];
      });
      
      var options = {
        request: function(req, callback) {
          requestPromise({
            url: req.url,
            encoding: null,
            gzip: true
          })
            .then((result) => {
              var response = {};
              response.data = result;
              callback(null, response);
            })
            .catch((error) => {
              console.log('request error!', error);
              
              if (error.error) {
                return staticMap.bufferToStream(error.error);
              } else {
                throw err;
              }
            });
        },
        ratio: 1
      };

      
      var map = new mbgl.Map(options);
      map.load(styleJson);
      
      map.addSource('mySource', {
        'id': 'mySource',
        'type': 'geojson',
        'data':
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: points
            }
          },
        'paint': {
          'line-color': '#c0c0c0'
        }
      });

      map.addLayer({
        'type': 'FeatureCollection',
        'id': 'trailPath',
        'type': 'line',
        'source': 'mySource',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#888',
          'line-width': 2,
          'line-opacity': 0.8
        }
      });

      return new Promise((resolve, reject) => {
        map.render({
          width: width,
          height: height,
          zoom: staticMap.getBoundsZoomLevel(bounds, {width: width * modifier, height: height * modifier}),  
          center: [ 
            (Number(bounds.minlon) + Number(bounds.maxlon)) / 2,
            (Number(bounds.minlat) + Number(bounds.maxlat)) / 2
  
          ]
        }, function(err, buffer) {
          if (err) { 
            // res.errorJSON(err, 500);
            reject(err);
          }
        
          map.release();
          
          var image = sharp(buffer, {
            raw: {
              width: width,
              height: height,
              channels: 4
            }
          });
        
          // Convert raw image buffer to PNG
          
          return image.png().toBuffer()
            .then( (data) => {
              resolve(staticMap.bufferToStream(data));
            }).catch( (err) => {
              reject(err);
            });
        });
      });
    });
  },
  getBoundsZoomLevel: (bounds, mapDim) => {
    
    const WORLD_DIM = { height: 256, width: 256 };
    const ZOOM_MAX = 24;

    const latRad = (lat) => {
      const sin = Math.sin(lat * Math.PI / 180);
      const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
      return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
    };

    const zoom = (mapPx, worldPx, fraction) => {
      return Math.log(mapPx / worldPx / fraction) / Math.LN2;
    };


    const latFraction = (latRad(bounds.maxlat) - latRad(bounds.minlat)) / Math.PI;
    
    const lngDiff = bounds.maxlon - bounds.minlon;
    const lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;
    
    const latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
    const lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);

    return Math.min(latZoom, lngZoom, ZOOM_MAX);
  },

};
