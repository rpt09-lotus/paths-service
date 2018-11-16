const express = require('express');
const app = express();
const PORT = 3004;

app.use((req, res, next) => {
  res.sendJSON = (data) => {
    res.status(200).end(JSON.stringify({data}))
  }
  res.errorJSON = (error, status=400) => {
    res.status(status).end(JSON.stringify({error}))
  }
  next();
});

app.get('/:trailId/paths', (req, res) => {
  res.sendJSON('Coming soon... paths route.');
});

app.get('/:trailId/heroPath',(req, res) => {
  res.sendJSON('Coming soon... hero path route.');
})

app.get('/:trailId/trailHead', (req, res) => {
  res.sendJSON('Coming soon... trail Head.');
})

app.get('*', (req, res) => {
  res.errorJSON(`${req.url} Not found`, 404);
})


app.listen(PORT, () => {
  console.log(`listen on ${PORT}...`);
});