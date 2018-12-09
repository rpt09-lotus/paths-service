const express = require('express');
const db = require('../db/db.js');
const validator = require('../services/validator.js');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const PORT = 3005;

app.use('/', express.static(__dirname + '/../client/'));
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

app.get('/app.js', (req, res) => {
  console.log(__dirname + '/../client/dist/assets/app.bundle.js');
  res.status(200).sendFile(path.resolve(__dirname + '/../client/dist/assets/app.bundle.js'));
});

app.get('/paths', (req, res) => {
  db.getAll().then((result) => {
    res.sendJSON(result);
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