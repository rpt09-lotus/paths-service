const app = require('express')();
const PORT = 80;

app.get('/', (req, res) => {
  res.status(200).send("oh hai from chris from docker from ec2!")
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}..`);
});