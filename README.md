

# 1. Paths Service

Paths / Routes service for 9 trails.

<!-- TOC -->

- [1. Paths Service](#1-paths-service)
  - [1.1. Related Projects](#11-related-projects)
  - [1.2. To do](#12-to-do)
  - [1.3. Usage](#13-usage)
  - [1.4. Development Setup](#14-development-setup)
  - [1.5. Log](#15-log)
    - [1.5.1. Seeding the database](#151-seeding-the-database)

<!-- /TOC -->


## 1.1. Related Projects

  - paths: [Current]
  - profiles: https://github.com/rpt09-scully/profile-service
  - photos: https://github.com/rpt09-scully/trail-photos-service
  - trails: https://github.com/rpt09-scully/trail-service
  - reviews: https://github.com/rpt09-scully/reviews-service

## 1.2. To do

x Setup database 
x Setup Server
- serve routes
  - GET {trailId}/paths?sortBy=date,{asc|desc}
  - POST {trailId}/paths 
  - GET {trailId}/heroPath *
  - GET {trailId}/trailHead *



## 1.3. Usage

> Some usage instructions

[To specify]

## 1.4. Development Setup

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

## 1.5. Log

### 1.5.1. Seeding the database

As outlined in development setup ^, you should have psql installed. As a convenience, the package.json script can be ran to replicate the act of doing the `psql [database] < [sqlFile]` routine.
``` sh
# seed the database with the db/schema.sql content
$> npm run seed-database
```

To seed the database, I had some acquired data stored in google spreadsheets. Info on how some of this data, specifically the grabbing of gpx files can maybe be seen in `dummyData/` folder. Furthermore, I stored this data in a google spreadsheet as rows and the 1st row being the name of the `column_key` within the database. I then made a quick node script to autogenerate, given a set of configurations + urls to these gSheets, it will create the `*.sql` sql file tha you can use to populate your database. currently it supports postgresql and sql. 

I found it interesting that postgresql:

  - doesn't have the use DATABASE_NAME; drop DATABASE...etc syntax, because to enter the psql repl, you specify the database beforehand
  - Insert statements don't use double quotes, they're single so additional work to differentiate the two types had to be done.
  - Error descriptions for invalid sql syntax / schema syntax are much better in postsql.
