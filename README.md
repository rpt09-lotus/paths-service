

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
$> pql 9trails-paths #to enter psql repl,  to confirm creation
$> pql 9trails-paths < db/schema.sql
# seed  db
$ (repl)> \dt; #to show all tables (should see 'paths now)
$ (repl)> \q; #to exit repl
# woop done!


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

### Log

#### Seeding the database

To seed the database, I had some acquired data stored in google spreadsheets. Info on how some of this data, specifically the grabbing of gpx files can maybe be seen in `dummyData/` folder. Furthermore, I stored this data in a google spreadsheet as rows and the 1st row being the name of the `column_key` within the database. I then made a quick node script to autogenerate, given a set of configurations + urls to these gSheets, it will create the `*.sql` sql file tha you can use to populate your database. currently it supports postgresql and sql. 

I found it interesting that postgresql:

  - doesn't have the use DATABASE_NAME; drop DATABASE...etc syntax, because to enter the psql repl, you specify the database beforehand
  - Insert statements don't use double quotes, they're single so additional work to differentiate the two types had to be done.
  - Error descriptions for invalid sql syntax / schema syntax are much better in postsql.
