# 1. Paths Service

Paths / Routes service for 9 trails.
  
  - [1.1. Related Projects](#11-related-projects)
  - [1.2. To do](#12-to-do)
  - [1.3. Usage](#13-usage)
    - [1.3.1. API endpoints](#131-api-endpoints)
  - [1.4. Development Setup](#14-development-setup)
  - [1.5. Log](#15-log)
    - [1.5.1. Seeding the database](#151-seeding-the-database)
    - [1.5.2. Setting up the API](#152-setting-up-the-api)
    - [1.5.3. Backfilling entries via a seededRandom](#153-backfilling-entries-via-a-seededrandom)
    - [1.5.4. Validation service](#154-validation-service)
    - [1.5.5. Unit and Integration Tests](#155-unit-and-integration-tests)

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
x serve routes
  x base routes
  x POST {trailId}/path
x do sorting for recordings/
  x GET {trailId}/recordings?sortBy=date,{asc|desc}
  x GET {trailId}/recordings?sortBy=ranking,{asc|desc}
x fill 21 + 100 with backfill data since these entries dont exist
x for paths that we dont have on S3, backfill this data from a set of data that we do have
- Save posts to database and upload xml file to S3
  - when implemented, for tests make sure to remove a post after
x test suite
  x unit tests 
    x db
    x validation
    x aws
  x integration
    x endpoints

```



## 1.3. Usage 

### 1.3.1. API endpoints

Below you can find all available endpoints. 

Note: that those with an asterisk *(\*)* will have more detailed information , aka actual point data for creating a visual path. Because this is significantly more data, requests that recieve multiple paths likely will not provide this.

  - GET `/paths` 
    - retrieves all paths in database (shouldn't really be used except for testing)
  - GET `/:trailId/paths?sortBy={id|rating|date},{asc|desc}*`
    - retrieves all recordings / paths for a specified trail id. sort optionas as shown (optional!)
  - GET `/:trailId/recordings?sortBy={id|rating|date},{asc|desc}*`
    - retrieves all recordings (excluding hero path) for a specified trail id. sort optionas as shown (optional!)
  - POST `/:trailId/recordings`
    - post a user path recording to a specified trail id.
  - GET `/paths/:pathId` * 
    - retrieves detailed information about a path by a given ID in database. this also will retrieve gpx data.
  - GET `/:trailId/heroPath` * 
    - retrieves detailed information about the canonical path for a given trail data. this also will retrieve gpx data.
  - GET `/:trailId/trailHead` * 
    - retrieves first point of the canonical path for a given trail from the database if available.

## 1.4. Development Setup

This service uses the following dev stack:

  - Server: node / NPM
  - Client: react
  - DB: PostgreSQL (installed via brew)
  - Testing: jest


If you don't have PostgreSQL,It can be installed with brew.

``` sh
# install npm dependencies
$> cd /path/to/paths-service
$> npm install
# install and start service
$> brew install PostgreSQL
$>  brew services start postgresql
# create the db with `createdb` command
$> createdb 9trails-paths
# seed  db
$> npm run seed-database
$> pql 9trails-paths #to enter psql repl,  to confirm creation
$ (repl)> \dt; #to show all tables (should see 'paths now)
$ (repl)> \q; #to exit repl
# woop done!
```

Inside `.env` place your Server + SQL credentials (change if needed)

``` 
HOST=localhost
PORT=3005
DB_HOST=localhost
DB_PORT=3005
DB_USER=
DB_PASS=
```

To test:
``` sh
$> npm test #synonymous with jest ./test
```

To execute:
``` sh
$> npm run server-dev #should be running on 3005
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

### 1.5.3. Backfilling entries via a seededRandom

So to solve the previous 2 issues, outside of getting banned temporarily for trying to 'aquire' accurate gpx data, I still had quite a gap in both actual gpx files and just recordings ^^ as mentioned above. I had about 70/100 of the canonical trails' gpx data, and had about 50% (220/447) of the gpx recordings (user submitted paths). Given my cease and desist, I decided to backfill using a random seed strategy. 

* Snippet from db.js *

``` js
    // the seed can provide a consistent random number based off the id of the path
    seededRandom: function(seed) {
    seed = (seed * 9301 + 49297) % 233280;
    var rnd = seed / 233280;
    return rnd;
  },
```
* How I resolved*
  - *Trail Entries 70-100 canonical gpx's + 50% recordings does not have valid gpx_url*
    - for those canonical gpx files that are missing ^, I used the id (70-100) to generate a psuedo-random value, that would then be used to consistently grab a gpx file from the valid pool that I DO have. As a means to notify users of api endpoint, the api also appends an additional property called `backfilled_gpx_url` which reaveals which gpx_url was used. Again this is consistent due to the seed function

  - *Backfilling trails with dummy user recordings*
    - so the previous thing would give us fake gpx data for those missing on canonical trails (`hero_path`) and our 50% of recordings, but user recordings for a bunch don't exist since I only got up to maybe trail 20 for actual data! So to make every trail (0-100), seem like they have a user submitted recording, or series of recordings, I also used that function to backfill anywhere from `1-3 recordings` if none we're present on the trail!. As a means to notify users of api endpoint, the api also appends 2 additional properties called `backfilled_recording` (boolean, set to true)
    `backfilled_from_trail` (integer, which reaveals which the actual trail it was plucked from). Again this is consistent due to the seed function.

### 1.5.4. Validation service

In creating the post endpoint, a validation service was used where one can supply required fields and async validation callbacks as an array of object literals. then calling `validator.validate(req.body)` returns a promise.

Below is a snippet of that service Dictionary.

``` js
  {
    name: 'ranking',
    type: 'number',
    errorMessage: 'is not between 0 & 5',
    validator: (val) => {
      return (0 < val && val <=5)
    }
  },
  {
    name: 'gpx',
    type: 'string',
    required: true, 
    errorMessage: 'is not a valid gpx file',
    validator: (val) => {
      return aws.validateGPX(val); ///returns promise
    }
  }
```

### 1.5.5. Unit and Integration Tests

Below was my strategy for developing my test suite which is stored in `test/` folder. Endpoints http:// requests test effective integration between server side services, routing, and db calls. Unit tests for each service are also tested. I used `jest` and the tests can be run by `npm test`

```
- test suite
  - unit tests 
    - db
    - validation
    - aws
  - integration
    - endpoints
```
