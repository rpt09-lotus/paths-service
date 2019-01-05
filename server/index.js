const express = require('express');
const db = require('../db/db.js');
const validator = require('../services/validator.js');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const path = require('path');
const staticMap = require('../services/staticMap.js');

const PORT = process.env.PORT;

app.use('/', express.static(__dirname + '/../client/'));
app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
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

app.get('/paths/:pathId/image/:width(\\d+)/:height(\\d+)', (req, res) => {
  staticMap.renderStaticMap(req.params.pathId, req.params.width, req.params.height, true, req.query.mode).then((stream) => {
    stream.pipe(res);
  }).catch((err) => {
    res.errorJSON(err.message || err);
  });
});

app.get('/paths/:pathId', (req, res) => {
  db.getPathById(
    req.params.pathId,
    req.query.redividePath
  ).then((result) => {
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
  db.getHeroPathByTrailId(req.params.trailId, req.query.redividePath).then((result) => {
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