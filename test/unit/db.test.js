const { Client } = require('pg');
const dotenv = require('dotenv').config();


describe('DB tests', () => {

  it('expects to connect to database with .env info', () => {
    const client = new Client({
      database: '9trails-paths',
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    });
    
    // in ject you can just return a promise as a test;
    return client.connect();
  });

});