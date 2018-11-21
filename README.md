

# 1. Paths Service

Paths / Routes service for 9 trails.

  - [1.2. To do](#12-to-do)
  - [1.3. Usage](#13-usage)
    - [1.3.1. API endpoints](#131-api-endpoints)
  - [1.4. Development Setup](#14-development-setup)
  - [1.5. Log](#15-log)
    - [1.5.1. Seeding the database](#151-seeding-the-database)
    - [1.5.2. Setting up the API](#152-setting-up-the-api)

## 1.1. Related Projects

  - paths: [Current]
  - profiles: https://github.com/rpt09-scully/profile-service
  - photos: https://github.com/rpt09-scully/trail-photos-service
  - trails: https://github.com/rpt09-scully/trail-service
  - reviews: https://github.com/rpt09-scully/reviews-service

## 1.2. To do

```
x Setup database 
x Setup Server
- serve routes
  x base routes
  - POST {trailId}/paths 
- do sorting for paths/
  - GET {trailId}/paths?sortBy=date,{asc|desc}
- fill 21 + 100 with backfill data since these entries dont exist
- for paths that we dont have on S3, backfill this data from a set of data that we do have
```



## 1.3. Usage 

### 1.3.1. API endpoints

Below you can find all available endpoints. 

Note: that those with an asterisk *(*)* will have more detailed information , aka actual point data for creating a visual path. Because this is significantly more data, requests that recieve multiple paths likely will not provide this.

  - GET `/paths` 
    - retrieves all paths in database (shouldn't really be used except for testing)
  - GET `/:trailId/paths`
    - retrieves all recordings / paths for a specified trail id.
  - GET `/paths/:pathId` * 
    - retrieves detailed information about a path by a given ID in database. this also will retrieve gpx data.
  - GET `/:trailId//heroPath` * 
    - retrieves detailed information about the canonical path for a given trail data. this also will retrieve gpx data.
  - GET `/:trailId/trailHead` * 
    - retrieves first point of the canonical path for a given trail from the database if available.

## 1.4. Development Setup

PostgreSQL is required. It can be installed with brew:


``` sh
# install and start service
$> brew install PostgreSQL
$>  brew services start postgresql
# create the db with `createdb` command
$> createdb 9trails-paths
# seed  db
$> pql 9trails-paths < db/schema.sql
$> pql 9trails-paths #to enter psql repl,  to confirm creation
$ (repl)> \dt; #to show all tables (should see 'paths now)
$ (repl)> \q; #to exit repl
# woop done!
```

Inside `.env` place your SQL credentials (change if needed)

``` 
DB_HOST=localhost
DB_USER=root
DB_PASS=
PORT=3005
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

### 1.5.2. Setting up the API

Setting up the api went fine.

One interesting thing was to create an async formatter for desired keys. So for example after
retrieving db attributes, one can then supply a mapping object that can create / update attributes such as creating the `s3_url` from a relative filename and parsing the `gpx_data` from url.
This bundles the logic up nicely in one file.

I have two areas that will need enriching, data-wise. 

  - *Trail Entries 21-100*. Trail Entries 1-20 contain valid information, but 21-100 currently don't exist. Need a strategy for backfilling this.
  - *Recordings with missing gpx data*. For trails 1-20, we have the canonical / hero paths. but for the rest as well as for the various recordings (user submitted routes),
  we simply do not have every single gpx file on S3. these currently will leave the `gpx_data` entry null. Need a way to swap out with an actual gpx file we have as a placeholder and maybe also include a attribute to describe this swap!