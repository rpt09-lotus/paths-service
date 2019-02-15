const requestPromise = require('request-promise');
const db = require('../db/postgres.js');
const mbgl = require('@mapbox/mapbox-gl-native');
const path = require('path');
const mbvp = require('@mapbox/geo-viewport');
const styleJson = require('../server/assets/mapbox/style.json');
const sharp = require('sharp');
const {Readable} = require('stream');
const {Image, createCanvas} = require('canvas');
const pathUtils = require('./pathUtils');

const staticMap = module.exports = {
  bufferToStream: (buffer) => { 
    let stream = new Readable ();
    stream.push(buffer);
    stream.push(null);
    return stream;
  },
  renderStaticMap: (pathId, width = 800, height = 300, drawChart = true, mode = 'svg') => {
    // console.log('rendering starting now..');
    const modifier = 0.45;
    return db.getPathById(pathId).then((result) => {
      width = Number(width);
      height = Number(height);
      if (isNaN(width) || isNaN(height)) {
        throw 'Width and Height values must be numbers.';
      } else if (width < 1 || height < 1) {
        throw 'Width and Height  values must be greater than 0';
      }
      // get gpx data
      const bounds = result[0].gpx_data.bounds;
      const ZOOM = staticMap.getBoundsZoomLevel(bounds, {width: width * modifier, height: height * modifier});
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
          'line-width': ZOOM / 6,
          'line-opacity': 0.8
        }
      });

      return new Promise((resolve, reject) => {
        const centerPt = [ 
          (Number(bounds.minlon) + Number(bounds.maxlon)) / 2,
          (Number(bounds.minlat) + Number(bounds.maxlat)) / 2

        ];
        const calcBounds = mbvp.bounds(centerPt, ZOOM, [width * .5, height * .5]);
        // const calvViewport = mbvp.viewport(calcBounds, [0])
        // console.log('bounds:', calcBounds);
        const convertedPixels = pathUtils.convertToPX(centerPt, calcBounds, width, height);
        // console.log('converted pixels:', convertedPixels);
        map.render({
          width: width,
          height: height,
          zoom: ZOOM,  
          center: centerPt
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
          
          // console.log('creating image buffer');
          return image.png().toBuffer()
            .then ( (buffer) => {
              if (drawChart) {
                const lineData = pathUtils.getElevBarsAsLines(pathUtils.redividePath(result[0].gpx_data.points, 100), width, height * 0.2);
                const canvas = createCanvas(width, height, mode === 'svg' ? 'svg' : null);
                const ctx = canvas.getContext('2d');
                const img = new Image();
                img.onload = () => ctx.drawImage(img, 0, 0);
                img.onerror = err => { throw err; };
                img.src = buffer;
               
               
                lineData.forEach((point, index) => {
                  const convertedPixels = pathUtils.convertToPX(pathUtils.getPointAsArray(point), calcBounds, width, height);
                  if (index === 0) {
                    ctx.strokeStyle = 'blue';
                    ctx.lineWidth = 2;
                    ctx.globalAlpha = 0.25;
                    ctx.beginPath();
                    ctx.arc(convertedPixels[0], convertedPixels[1], ZOOM / 3, 0, 2 * Math.PI);
                    ctx.stroke();
                  } else {
                    ctx.fillStyle = '#ff0000';
                    ctx.globalAlpha = 0.01;
                    ctx.beginPath();
                    ctx.arc(convertedPixels[0], convertedPixels[1], ZOOM / 3, 0, 2 * Math.PI);
                    ctx.fill();
                  }
                  ctx.globalAlpha = 0.25;
                  ctx.fillStyle = '#333';
                  ctx.fillRect(point.lineStart[0], height - point.lineEnd[1], point.width * 0.5, point.height);
                });
                resolve(staticMap.bufferToStream(canvas.toBuffer('image/png')));
              } else {
                resolve(staticMap.bufferToStream(buffer));
              }
            })
            .catch( (err) => {
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
