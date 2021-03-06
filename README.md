# 1. Paths Service TOC

  - [1.2. To do](#12-to-do)
  - [1.3. Usage](#13-usage)
    - [1.3.1. API endpoints](#131-api-endpoints)
    - [1.3.2. Individual Component Page](#132-individual-component-page)
  - [1.4. Development Setup](#14-development-setup)
  - [1.5. Log](#15-log)
    - [1.5.1. Seeding the database](#151-seeding-the-database)
    - [1.5.2. Setting up the API](#152-setting-up-the-api)
    - [1.5.3. Backfilling entries via a seededRandom](#153-backfilling-entries-via-a-seededrandom)
    - [1.5.4. Validation service](#154-validation-service)
    - [1.5.5. Unit and Integration Tests](#155-unit-and-integration-tests)
    - [1.5.6. Page Layout Scaffolding + Service Launcher](#156-page-layout-scaffolding--service-launcher)
    - [1.5.7 React basic setup](#157-react-basic-setup)
    - [1.5.8. Proxy service launcher + inserting into it DOM](#158-proxy-service-launcher--inserting-into-it-dom)
    - [1.5.9. Dynamic routing](#159-dynamic-routing)
    - [1.5.10. Docker and Deployment](#1510-docker-and-deployment)
    - [1.5.11. NODE_ENV environment variable](#1511-node_env-environment-variable)
    - [1.5.12. React Widget Development](#1512-react-widget-development)
    - [1.5.13. Performance](#1513-performance)
    
## 1.1. Related Projects

  - paths: [Current]
  - profiles: https://github.com/rpt09-scully/profile-service
  - photos: https://github.com/rpt09-scully/trail-photos-service
  - trails: https://github.com/rpt09-scully/trail-service
  - reviews: https://github.com/rpt09-scully/reviews-service

## 1.2. To do

  SDC   
  
  Generating 1M records is quite a challenege.  Since all of the seeding is being taken care of in the .sql file, having 1M lines of insert statements can bring up memory space.  To avoid this, a copy statement can be included in the current .sql file, which would take data from a generated .csv file.  Please see [psql-csv](http://www.postgresqltutorial.com/import-csv-file-into-posgresql-table/) for more info.  


```
  FEC
  x speed tests
  - performance improvements
    x other
    -  cache images 
    x lazyload n recordings at a time, refresh when get to botoom of page
  x implement sorting method when clicking dropdown
  x path widget buttons
    x zoom to map, in interactive mode have a zoom extents thing
    x interactive mode, by default loads static map. clicking interactive loads mapbox pannable version
  - mobile version (for hoverable events?)
- Stretch
  - Save posts to database and upload xml file to S3
    - when implemented, for tests make sure to remove a post after

```



## 1.3. Usage 


Path Service is a series of endpoints and 2 widgets for 9 trails. The service contains a db for storing info about paths, as well as links to gpx files (xml files) stored on s3. It uses these files which contain lat, long, and elev data to render static/interactive maps. 

**path widget**

![upload](https://camo.githubusercontent.com/b9196696a983a2e944ac85e30278a5845ff185e4/687474703a2f2f672e7265636f726469742e636f2f344b316172397074704e2e676966)

**uploading a user recording**

![upload](https://camo.githubusercontent.com/9be7f8dcfe2ff6ccc074c51c7d98567ee4668386/687474703a2f2f672e7265636f726469742e636f2f386e6f6671416d4355632e676966)



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
  - GET `/paths/:pathId?redividePath={null|<number>}*` * 
    - retrieves detailed information about a path by a given ID in database. this also will retrieve gpx data. An additional parameter for gpxData will be given called `redividedPoints` if you provide redividePath query parameter. This will redistribute the points for a given amount i.e. `100` will return 100 points regardless of points in gpx file.
  - GET `/paths/:pathId/image/:width/:height?mode={svg|png}*`
    - renders static PNG/SVG map on server side given width and height. default: SVG.
  - GET `/:trailId/heroPath?redividePath={null|<number>}*` * 
    - retrieves detailed information about the canonical path for a given trail data. this also will retrieve gpx data.  An additional parameter for gpxData will be given called `redividedPoints` if you provide redividePath query parameter. This will redistribute the points for a given amount i.e. `100` will return 100 points regardless of points in gpx file.
  - GET `/:trailId/trailHead` 
    - retrieves first point of the canonical path for a given trail from the database if available.

### 1.3.2. Individual Component Page

Going to `GET /` aka the root server page, will render the individual components. This is useful for testing.

## 1.4. Development Setup

This service uses the following dev stack:

  - Server: node / NPM
  - Deployment: docker on ec2 aws
  - Client: react
  - DB: PostgreSQL (installed via brew)
  - Testing: jest

  - Important Libs:
    - mapbox-gl-react
    - mapbox-gl-node (static map rendering)
    - canvas / sharp (image processing)


If you don't have PostgreSQL,It can be installed with brew. If you choose not to use brew or are using linux , please see this [article](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-ubuntu-18-04) on postgres installation

Make sure that XCode is installed.  If XCode installed, make sure that you install command line tools via XCode.  Go to preferences -> Locations -> command line tools.  This will enable for when you npm install.  Please see this [node-gyp](https://github.com/nodejs/node-gyp) on command line tools installation.

``` sh
# install npm dependencies
$> cd /path/to/paths-service
$> npm install
# install and start service (if no brew, see above note!)
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

To build in react:
``` sh
# build once (builds to dist/)
$> npm run build 
# or for watching file changes
$> npm run buildWatch
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

The schema handles paths 1 - 132.  For the SDC portion, 1M records is to be inserted.  Since 1M actual trails was not a realistic task, faker was used to generate fake trail names.  These were all initialized with a `false` flag for has_gpx_data.  This flag is handled in the backfill functions to use existing gpx data from paths 1-70.
`SeedMill.js` is used to seed the database before the psql command to generate a csv file with 10 million records.  Once this is generated, a copy statement is run on the `schema.sql` file to populate the tables with the existing data. 
Running 1 million records did not cause any node errors.  However, when creating an array of 10M records in javascript, node threw an error.  

The following error was generated by node in seeding 10M records:  
`FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory` . 
Node is automatically allocated a set amount of memory on the computer, regardless of how much physical memory there is.  So override this, a flag needs to be added to the npm run command  
`node --max-old-space-size=4096 db/seedMill.js`

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

### 1.5.6. Page Layout Scaffolding + Service Launcher

Switching gears in phase 02, was time to think about page layout for all our individual services component. I layed out a rough draft in [Figma](http://figma.com/file/CShpO1gQJP6MDReqEmgaZN/9-Trails?node-id=0%3A1) as a starting point and then using Jeff's layout.html from our [proxy-reference-files repo](https://github.com/rpt09-scully/proxy-reference-files), I created the [MVP of our scaffold](https://github.com/rpt09-scully/proxy-reference-files/tree/master/shared/layout.html) in the shared directory. THis will likely be improved but works as a base for inserting our individual components.

In tandem, i also created a [shell script](https://github.com/rpt09-scully/proxy-reference-files/tree/master/shared/launch) to launch all services based on a `launchDirs.txt` file. This file is line seperated `[path/to/service] > npm run [scriptName]` which tells the shell script which directorys should be cd'd into and server started. All of these processes get thrown into a console in their seperate tab! So this manual process of launching 5 services and a proxy is now skipped with this tool.


### 1.5.7. React basic setup

I setup my basic react setup. Beacuase I have two widgets I have namespaced them accordingly both in the DOM and React as `NTPathService.CanonicalPath` and `NTPathService.Recordings` for react components and `9Trails.PathService.CanonicalPath` and `9Trails.PathService.Recordings` for dom ids. 

I setup webpack serving from the dist/ folder on port 3000. THis runs a standalone version of just my components for now for quick testing. I will do the proxy server next.


### 1.5.8. Proxy service launcher + inserting into it DOM

I setup my [proxy service here](https://github.com/rpt09-scully/chris-proxy-service) which can be cloned to your parent FEC folder. TO launch this and all my services, I use the [Service Launcher tool](https://github.com/rpt09-scully/proxy-reference-files/tree/master/shared/launch) I made. It will automatically startup all the services proxy. Because we're using a pretty straightfoward name space the code below, will automatically check the namespace and insert it into the appropriate DOM Ids. This code was inserted into our shared layout folder [https://github.com/rpt09-scully/proxy-reference-files/tree/master/shared](here): 

``` js
    // if properly namespaced the DOM insertion is automated!
    Object.keys(window.NT).forEach((serviceKey) => {
      // now get service object
      Object.keys(window.NT[serviceKey]).forEach((widgetKey) => {
        const dom_id = `9Trails.${serviceKey}.${widgetKey}`;
        const currentWidget = window.NT[serviceKey][widgetKey];
        ReactDOM.render(React.createElement(currentWidget), document.getElementById(dom_id));
      });
    });
```

I also have created **two** useful scripts in my main parent directory:
  - (1) copying this layout from the reference-files we have directly into my personal proxy. (THis is useful to just have one source of truth which we can share, but then copy into our indiv proxy repos)
  - (2) launching service launcher (see previous link for more info) from reference-files repo 

It looks like this

``` js
// package.json excerpt from parent fec directory
{
  "scripts": {
    "copyScaffold": "cp -rf ./proxy-reference-files/shared/. ./chris-proxy-service/public && rm -rf ./chris-proxy-service/public/launch",
    "launchServices": "killall Terminal & killall -9 node & ./proxy-reference-files/shared/launch/launch.sh"
  }
}
```


### 1.5.9. Dynamic routing 
For our proxy routes to differeny trails we chose to do 

``` 
localhost/:trailId
```

One thing that was pseudo tricky was serving the root html page on dynamic routes for my proxy/dev client pages. It turns out you can specify an optional regex in the following fashion where insiide the parens basically says 'match 1-n number of digits at the end of the route'. the `*?` marks this `/:trailId` route as optional and will render the 1st trail id by default aka going to `localhost:3000`.

``` js
// matches: /, /1, /1234,
// doesnt match: /something, /1/something, /1.text, /1.file
/:trailId(\\d+$)*?
```

ON client I created a new util to parse this route assuming this simple route (NOTE: this is super simple parsing, but might need to be adjusted if we add # or ? url params, needs more tests).

``` js
const utils = {
  getTrailIdFromUrl: () => {
    const trailId = parseInt(location.href.split('/').pop()) || 1;
    return trailId;
  }
}
```

I also will need to handle invalid trail ids in the react components, allthough in real env, our server would reject with 404.

### 1.5.10. Docker and Deployment

For deployment I decided to use EC2/Docker which is covered in great detail via my notes here: [Docker / EC2 Notes](https://github.com/rpt09-studyhall/notesWiki/blob/master/Docker_EC2_README.md#create-local-dockerfile-and-sample-app)

In regards to this repo, I created a few handy npm scripts which I can run both locally and on my ec2 instance for managing docker. 

Note: To get node/npm installed on my ec2 centOs, I had to the following.

``` sh
# Add node.js yum repository
$> sudo yum install -y gcc-c++ make
$> sudo curl -sL https://rpm.nodesource.com/setup_6.x | sudo -E bash - 
# install
$> yum install nodejs
```

Then once doing that I made the following convenience `npm` scripts

  - `connect` - connects via ssh to ec2.
  - `copyToServer` - copies changes via rsync and ssh to ec2. looks at .gitignore and tracked files to know what to exclude / include!
  - `deploy`- Magic one! deploys, stops docker instance if any, builds docker image, and runs it!
  - `dockerPrune` - clean up loose containers if any..sometimes needed if run out of space by too many failed builds.
  - `dockerStop` - kills a running container (does lookup by image name), if any
  - `dockerBuild` - builds a d docker image
  - `dockerRun ` - runs a docker image, creating a new container instance
  - `dbr` - build run combo!

Below you can see what they look like:

**package.json** (excerpt)

``` json
{

    "connect": "ssh -i ~/.ssh/mine2.pem ec2-user@ec2-54-172-80-40.compute-1.amazonaws.com",
    "copyToServer": "npm run build && scp -i \"~/.ssh/mine2.pem\" .env.production  ec2-user@ec2-54-172-80-40.compute-1.amazonaws.com:/home/ec2-user/app/.env && rsync --include .git --exclude-from=\"$(git -C . ls-files --exclude-standard -oi --directory >.git/ignores.tmp && echo .git/ignores.tmp)\" -rave \"ssh -i ~/.ssh/mine2.pem\" . ec2-user@ec2-54-172-80-40.compute-1.amazonaws.com:/home/ec2-user/app && npm run buildDev",
    "deploy": "npm run copyToServer && ssh -i ~/.ssh/mine2.pem ec2-user@ec2-54-172-80-40.compute-1.amazonaws.com 'cd /home/ec2-user/app && ./buildRun.sh'",
    "dockerPrune": "docker system prune",
    "dockerStop": "docker rm $(docker stop $(docker ps -a -q --filter ancestor=9trails-paths --format=\"{{.ID}}\"))",
    "dockerBuild": "docker build --rm -t 9trails-paths .",
    "dockerRun": "docker run -p 80:80 9trails-paths",
    "dbr": "npm run dockerBuild && npm run dockerRun"
}
```

**To deploy**
``` sh
# run deploy, this will send to ec2 instance
$> npm run deploy
```


**NOTE**: (At end of react developent), I had to refactor my `Dockerfile` to have an `Ubuntu:16.04` base image and install node 8 and some additional from that. This is becuase some of my npm libs required some c++ env that the node image proved difficult to make happen!

### 1.5.11. NODE_ENV environment variable

TO know which host urls to use (`development` or `production`) the first thing we need to do is specify this in an *Environment Variable*. in node these can be accessed via the  `process.env` object.

To get this working was that for both the proxy and service we needed to set the `process.env.NODE_ENV` variable to `production`. For the service react app this was done already by using the `--mode production` flag in the webpack build process. For the proxy / server side, this was set in the Dockerfile image via `ENV NODE_ENV=production`!

Next, we need to check it in these two areas (service client / proxy server). here are the excerpts ..

**app.js** (service client / react app)

``` js

let SERVICE_HOSTS = {};

if (process.env.NODE_ENV === 'production') {
  SERVICE_HOSTS = {
    trails: 'http://trail-env.8jhbbn2nrv.us-west-2.elasticbeanstalk.com/',
    profile: '[to be added]',
    photos: 'http://trail-photos-service-dev.us-west-1.elasticbeanstalk.com',
    reviews: 'http://trail-photos-service-dev.us-west-1.elasticbeanstalk.com',
    paths: 'http://ec2-54-172-80-40.compute-1.amazonaws.com',
  };
} else {
  SERVICE_HOSTS = {
    trails: 'http://localhost:3001',
    profile: 'http://localhost:3002',
    photos: 'http://localhost:3003',
    reviews: 'http://localhost:3004',
    paths: 'http://localhost:3005',
  };
}

```

For the [proxy service](https://github.com/rpt09-scully/chris-proxy-service/), this had to be handled differently since it occurs at load time and serverside. I used `express-handlebars` template engine for `express`, to render a different set of script tags depending on the env variable see that excert here:

*** index.js** (proxy)
``` js
app.get('/:trailId(\\d+$)*?', (req, res) => {
  // we set env_production to the boolean conditional
  res.status(200).render('layout', {env_production: (process.env.NODE_ENV === 'production')});
});
```

**layout.html** (proxy)
``` html

<!-- load services -->
  {{#if env_production }}
  <script src='http://trail-env.8jhbbn2nrv.us-west-2.elasticbeanstalk.com/app.js'></script>
  <script src=''></script>
  <script src='http://trail-photos-service-dev.us-west-1.elasticbeanstalk.com/app.js'></script>
  <script src='http://reviewservice.jsxvmg3wq3.us-west-1.elasticbeanstalk.com/app.js'></script>
  <script src='http://ec2-54-172-80-40.compute-1.amazonaws.com/app.js'></script>
  {{else}}
  <script src='http://localhost:3001/app.js'></script>
  <script src='http://localhost:3002/app.js'></script>
  <script src='http://localhost:3003/app.js'></script>
  <script src='http://localhost:3004/app.js'></script>
  <script src='http://localhost:3005/app.js'></script>
  {{/if}}
  <!-- DOM that -->

```

### 1.5.12. React Widget Development

**Server Side Image Rendering**

Moving back to react client development, I first was focused on Recording widget which comprised of all the user submitted paths. One concern was to be rendering all these mapbox widgets for every recording seemed too like it would be overkill / computationally expensive. Instead, similar to actual alltrails, it would make more sense to render a static map (as an image) for each recording on the server, and then show that instead. I managed to do this with 2 npm packages: `@mapbox/mapbox-gl-native`, a node native library which allows for the retrieval of the mapbox tiles and drawing geojson geometry, and than `sharp` for processing the buffers to image output. Then my endpoint  `/paths/:pathId/image/:width/:height` points to a dynamically rendered PNG image! [This tutorial](https://medium.com/@brendan_ward/creating-a-static-map-renderer-using-the-mapbox-gl-native-nodejs-api-23db560b219e) was very helpful in this endeavor, as well as the npm docs. 

Furthermore, one issue I had was the `map.fitBounds()` was not available for getting the appropriate `zoom` value for the map in this version of mapbox.  this is very userful in client version as it will autozoom to your given lat lng bounds data, but with the node version I could only supply a number `zoom=0-24`, where 0 is the entire world, and 24 is the most zoomed in. Our trails tended to need to be zoomed anywhere from `8-13`, but I couldn't find a pattern to convert our bounds to this weird arbitrary `zoom` number. Then I found a google groups post that pretty much explained the logic behind google maps' zoom index, analagous to mapbox! With a few tweaks (aka a modifier to shrink / convert to mapbox zoom), voila, i was able to create this number from my bounds and pixel width/height! This can be seen in `staticMap.js`. Snippet.

``` js
  map.render({
      width: width,
      height: height,
      zoom: staticMap.getBoundsZoomLevel(bounds, {width: width * modifier, height: height * modifier}),  
      center: [ 
        (Number(bounds.minlon) + Number(bounds.maxlon)) / 2,
        (Number(bounds.minlat) + Number(bounds.maxlat)) / 2

      ]
    }, ...
```

This provides a PNG/SVG from a given endpoint.

**Redivided path,SVG Geojson measuring with Turf.js + Interactive hoverable tooltips**

I wanted to normalize the amount of elevation points for gpx data to be a consistent number. So if the path has `1000` or `304` or `50` points, I can specify to the endpoint `?redividePath=100` and always get a normalized data set of 100 points. To do this, I had to use a geojson utils library called [Turf.js](http://turfjs.org). This allowed me to measure the length of the polyline from the points, redivide into segments, and other useful things. I then drew the points, and elevation bars on the static image buffer (which also required to learn how to conver lat lng to px dimensions given bounds + zoom level)

The result: A consistent elevation bar chart. After loading on client side, javascript callback sets up hoverable tooltips for more granular info like elevation change and miles into the trail.

![example](https://i.imgur.com/ZKZw7MZr.png)

**Finalized Sorting and Form Submission**
 The form submission is responsive and will submit to the backend. Currently it doesn't save but does validation on the server side.

 ![submitForm](http://g.recordit.co/8nofqAmCUc.gif)

**Finalized PathWidget**

The finalized path widget (`pathWidget`)atually has both the image `staticMap` and interactive `dynamicMap`. Hovering over the map lets you toggle between the two! You can see it in action here. The form and page is also now mobile ready.

![pathWidget](http://g.recordit.co/4K1ar9ptpN.gif)

### 1.5.13. Performance 

First thing was to look at my bundle. I like this tool here: https://chrisbateman.github.io/webpack-visualizer/. My bundle at the end of the day was around `2.2mb` (`3.1mb` in development). Mainly this is due to:

  - react-mapbox-gl (`100kb`)
  - react-mapbox (`500kb`)
  - turf (`500 kb`)
  - moment  (`500 kb`)
  - fortAwesome (fontAwesome Icons) (`500 kb`)

![performance original](http://g.recordit.co/XRgEpCDXMs.gif)

**SCORE : 02 + 88, TIME TO OPTIMIZE** 

![original](https://i.imgur.com/vrmqeru.jpg)

Running this in page insights I got a SUPER LOW `2/100`. Ouch, ok lets try some performance improvements. The first thing insights mentioned was to serve a gzipped version , so I used the `CompressionPlugin`. This compresses a `.gz` version of app.js for compatible browsers. Cool, but we still need to serve it to those browsers on our server side so the route refactored for me was below. I basically checked if the req accepted gzip encoding , and if so would serve that with the content header!


``` js


app.get('/app.js', (req, res) => {
  let file = '/../client/dist/assets/app.bundle.js';
  // if gzip is accepted  and we have it lets send that
  if (req.acceptsEncoding().indexOf('gzip') !== -1 && fs.existsSync(path.resolve(__dirname + file + '.gz'))) {
    file += '.gz';
    res.set('Content-Encoding', 'gzip');
  }
  
  res.status(200).sendFile(path.resolve(__dirname + file));
});
```


Then I turned to trying to reduce `turf` `moment` and `fort awesome` as I was using very little from those modules. Here I learned about this very useful `IgnorePlugin` for ignoring `moment` time locales! For the `turf` I learned I could individually import modules rather than from main lib i.e. `@turf/{util}`. 

And for fortAwesome there is an interesting babel plugin called `babel-plugin-transform-imports` this essentially does the same thing that I did for turf, but converts it to the individual components for you! It was reccomended by fort awesome folks and looks like this below

``` js
use: {
  loader: 'babel-loader',
  query: {
    plugins: [
      [require('babel-plugin-transform-imports'), {
        '@fortawesome/free-solid-svg-icons': {
          'transform': '@fortawesome/free-solid-svg-icons/${member}',
          'skipDefaultConversion': true
        }
      }]
    ]
  }
}
```

**SCORE : 60 + 100, FROM 2.2MB to 254 kb** 

![optimize](https://i.imgur.com/Yikh6J0.gif)

From all of this I reduced the total uncompressed to *963kb* and compressed to **254kb**. NOT bad! Here is the summary

  - react-mapbox-gl (`100kb`)
  - react-mapbox (`500kb`)
  - turf (500 kb -> `200 kb`)
  - moment  (500 kb -> `80 kb`)
  - fortAwesome (fontAwesome Icons) (500 kb -> `45 kb`)


![performance original](http://g.recordit.co/PH63YaQ5xD.gif)

** Lazy loading recordings **

I noticed that even if its not visible on DOM, or not scrolled to yet, react will attempt to render all the widgets. Thanks to [react-lazy-fastdom](https://www.npmjs.com/package/react-lazy-fastdom), it solves these two issues. Below you can see I just wrapped with this component, and will only load when visible and at scroll place. It requires a min height, but you can make it depend on the parent which is what i did :P.

``` js
  this.state.recordings.map((recording) => (
    <div key={recording.id}  style={{'minHeight': '100px'}}>
      <LazyLoad height={'100%'} offsetTop={600} debounce={false}>
        <Recording recording={recording} serviceHosts={this.props.serviceHosts} />
      </LazyLoad>
    </div>
  ))
```

**Other improvements**

Other improvments which will probably help if I can get to them are:

    - use redis to cache images and gpx files
