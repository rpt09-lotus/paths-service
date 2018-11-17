

# Paths Service

Paths / Routes service for 9 trails.



## Related Projects

  - paths: [Current]
  - profiles: https://github.com/rpt09-scully/profile-service
  - photos: https://github.com/rpt09-scully/trail-photos-service
  - trails: https://github.com/rpt09-scully/trail-service
  - reviews: https://github.com/rpt09-scully/reviews-service

## To dp

- Setup database 
x Setup Server
- serve routes
  - GET {trailId}/paths?sortBy=date,{asc|desc}
  - POST {trailId}/paths 
  - GET {trailId}/heroPath *
  - GET {trailId}/trailHead *



## Usage

> Some usage instructions

[To specify]

## Requirements

PostgreSQL is required. It can be installed with brew:


``` sh
# install and start service
$> brew install PostgreSQL
$>  brew services start postgresql
# create the db with `createdb` command
$> createdb 9trails-paths
$> pql 9trails-paths #enter to confirm creation
$ (repl)> \q; #to exit repl
# seed  db
$> pql 9trails-paths < db/schema.sql

## Development Setup

  ``` sh
  # cd into directory
  $> cd trail-service
  # install dependencies
  $> npm install
  # setup .env file (for sql creds)
  $> touch .env 
  # seed database `trailService` (change credentials as needed)
  $> mysql -uroot < schema.sql  
  ```
   Inside `.env` place your SQL credentials (change if needed)
  ``` 
  DB_HOST=localhost
  DB_USER=root
  DB_PASS=
  ```
   To execute:
   ``` sh
  $> npm run server-dev
  ```

### Installing Dependencies

[To specify]
