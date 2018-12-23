const express = require('express');
const db = require('../db/db.js');
const validator = require('../services/validator.js');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const path = require('path');
const requestPromise = require('request-promise');

// mapbox gl native requirement
const fs = require('fs');
const mbgl = require('@mapbox/mapbox-gl-native');
const sharp = require('sharp');
const {Readable} = require('stream');

const PORT = process.env.PORT;

app.use('/', express.static(__dirname + '/../client/'));
app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) => {

  console.log(`Incoming Request: ${req.method} ${req.url} `);
  const getSortByObject = () => { 
    const sortBy = {
      column: 'id',
      ascOrDesc: 'desc'
    };

    if (req.query.sortBy) {
      const [column, ascOrDesc] = req.query.sortBy.split(',');
      sortBy.column = column || sortBy.column;
      sortBy.ascOrDesc = ascOrDesc || sortBy.ascOrDesc;
    }
    return sortBy;
  };

  req.sortBy = getSortByObject();

  db.host = req.protocol + '://' + req.headers.host;
  res.sendJSON = (data) => {
    res.status(200).end(JSON.stringify({data}));
  };
  res.errorJSON = (error, status = 400) => {
    res.status(status).end(JSON.stringify({error}));
  };
  next();
});

/****************
 *  DEV TESTING
 ****************/

//  we also want to serve the first id as default page , synonymous with /1
//  we want to serve any number based subroute ex. /1 , /100
app.get('/:trailId(\\d+$)*?', (req, res) => {
  res.status(200).sendFile(path.resolve(__dirname + '/../client/index.html'));
});

/************
 *  ASSETS
 ***********/

app.get('/app.js', (req, res) => {
  res.status(200).sendFile(path.resolve(__dirname + '/../client/dist/assets/app.bundle.js'));
});

/************
 *  API
 ***********/
app.get('/paths', (req, res) => {
  db.getAll().then((result) => {
    res.sendJSON(result);
  }).catch((error) => {
    res.errorJSON(`${error}`, 500);
  });
});

app.get('/paths/:pathId/image/', (req, res) => {

  const bufferToStream = (buffer) => { 
    let stream = new Readable ();
    stream.push(buffer);
    stream.push(null);
    return stream;
  };

  db.getPathById(req.params.pathId).then((result) => {
    const bounds = result[0].gpx_data.bounds;
    const points = result[0].gpx_data.points.map(({ lat, lon }) => {
      return [parseFloat(lon), parseFloat(lat)];
    });
    
    console.log(result);

    var options = {
      request: function(req, callback) {
        requestPromise({
          url: req.url,
          encoding: null,
          gzip: true
        })
          .then((result) => {
            var response = {};
            // if (result.headers.modified) { 
            //   response.modified = new Date(result.headers.modified); 
            // }
            // if (result.headers.expires) { 
            //   response.expires = new Date(result.headers.expires); 
            // }
            // if (result.headers.etag) { 
            //   response.etag = result.headers.etag; 
            // }
            
            response.data = result;
            callback(null, response);
          })
          .catch((error) => {
            console.log('request error!', error);
            
            if (error.error) {
              bufferToStream(error.error).pipe(res);
            } else {
              res.errorJSON(error);
            }
          });
      },
      ratio: 1
    };
    var map = new mbgl.Map(options);
    
    console.log('latitude:', bounds.maxlat - bounds.minlat);
    console.log('longitude:', bounds.maxlon - bounds.minlon);
    
    map.load(require(path.join(__dirname, 'assets', 'mapbox', 'style.json')));
    
    // map.fitBounds([
    //   [bounds.minlon, bounds.minlat],
    //   [bounds.maxlon, bounds.maxlat]
    // ], {padding: 50});

    console.log(
      Number(bounds.minlat) + Number(bounds.maxlat) / 2, 
      Number(bounds.minlon) + Number(bounds.maxlon) / 2
    );

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
        'line-color': '#c0c0c0',
        // 'line-opacity': 0.8
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

    map.render({
      zoom: 13, 
      // 13.5: 0.013, *0.013
      // 13: 0.020, 0.036*  
      //12: --> lat: 0.007, *0.04,
      //  11: lat 0.03423999999999694,  lng: *0.0956600000000094,
      //  10.75: *.086 .01
      // 8.75 --> *0.38 0.32
      center: [ 
        (Number(bounds.minlon) + Number(bounds.maxlon)) / 2,
        (Number(bounds.minlat) + Number(bounds.maxlat)) / 2

      ]
      // bounds: [
      //   [bounds.minlon, bounds.minlat],
      //   [bounds.maxlon, bounds.maxlat]
      // ]
      // style: 'mapbox://styles/cjm771/cjpjymsoc0nsz2slnpyrkxdol'
    }, function(err, buffer) {
      if (err) { 
        console.log('error:', err);
        res.errorJSON(err, 500);
      }
    
      map.release();
    
      var image = sharp(buffer, {
        raw: {
          width: 512,
          height: 512,
          channels: 4
        }
      });
    
      // Convert raw image buffer to PNG
      image.png().toBuffer()
        .then( (data) => {
          
          // res.writeHead(200, 'image/png');
          bufferToStream(data).pipe(res);
        })
        .catch( (err) => {
          console.log('buffer error:', err);
          // TODO convert to image error
          res.errorJSON(err, 500);
        });
    });
  
  }).catch((error) => {

    res.errorJSON(`${error}`, 500);
  });
});

app.get('/paths/:pathId', (req, res) => {
  db.getPathById(req.params.pathId).then((result) => {
    res.sendJSON(result);
  }).catch((error) => {
    res.errorJSON(`${error}`, 500);
  });
});

app.get('/:trailId/paths', (req, res) => {
  db.getPathsByTrailId(
    req.params.trailId, 
    req.sortBy.column, 
    req.sortBy.ascOrDesc
  ).then((result) => {
    res.sendJSON(result);
  }).catch((error) => {
    res.errorJSON(`${error}`, 500);
  });
});

app.get('/:trailId/recordings', (req, res) => {
  db.getRecordingsByTrailId(
    req.params.trailId, 
    req.sortBy.column, 
    req.sortBy.ascOrDesc
  ).then((result) => {
    res.sendJSON(result);
  }).catch((error) => {
    res.errorJSON(`${error}`, 500);
  });
});

app.post('/:trailId/recordings', (req, res) => {
  validator.validate(req.body).then((result) => {
    res.sendJSON([result]);
  }).catch((error) => {
    res.errorJSON(`${error}`, 400);
  });
});

app.get('/:trailId/heroPath',(req, res) => {
  db.getHeroPathByTrailId(req.params.trailId).then((result) => {
    res.sendJSON(result);
  }).catch((error) => {
    res.errorJSON(`${error}`, 500);
  });
});

app.get('/:trailId/trailHead', (req, res) => {
  db.getTrailHeadById(req.params.trailId).then((result) => {
    res.sendJSON(result);
  }).catch((error) => {
    res.errorJSON(`${error}`, 500);
  });
});

app.get('*', (req, res) => {
  res.errorJSON(`${req.url} Not found`, 404);
});


app.listen(PORT, () => {
  console.log(`listen on ${PORT}...`);
});