const { Client } = require('pg');
const client = new Client({
  database: '9trails-paths',
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
});

client.connect();

module.exports = {
  getAll: function() {
    return  client.query('SELECT * FROM paths');
  },
  getPathsByTrailId: function(id) {
    return  client.query('SELECT * FROM paths WHERE trail_id=$1', [id]);
  },
  getHeroPathByTrailId: function(id) {
    return  client.query('SELECT * FROM paths WHERE trail_id=$1 AND is_hero_path=$2', [id, true]);
  }
}