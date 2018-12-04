
## 0.1. TOC

- [0.1.1. GET http://localhost:3005/:trailId/paths HTTP/1.1](#011-get-httplocalhost30051paths-http11)
- [0.1.2. GET http://localhost:3005/:trailId/recordings?sortBy=rating,desc HTTP/1.1](#012-get-httplocalhost30051recordingssortbyratingdesc-http11)
- [0.1.3. GET http://localhost:3005/paths/:pathId HTTP/1.1](#013-get-httplocalhost3005paths3-http11) (existing gpx)
- [0.1.4. GET http://localhost:3005/paths/:pathId HTTP/1.1](#014-get-httplocalhost3005paths231-http11) (backfilled gpx)
- [0.1.5. POST http://localhost:3005/:trailId/recordings HTTP/1.1](#015-post-httplocalhost30053recordings-http11) (valid post)
- [0.1.6. POST http://localhost:3005/:trailId/recordings HTTP/1.1](#016-post-httplocalhost30053recordings-http11-error-handling) (error handling)
- [0.1.7. GET http://localhost:3005/:trailId/heroPath HTTP/1.1](#017-get-httplocalhost30051heropath-http11)
- [0.1.8. GET http://localhost:3005/:trailId/trailHead HTTP/1.1](#018-get-httplocalhost30051trailhead-http11)

### 0.1.1. GET http://localhost:3005/1/paths HTTP/1.1

``` js
// HTTP/1.1 200 OK
// X-Powered-By: Express
// Date: Tue, 04 Dec 2018 02:19:52 GMT
// Connection: keep-alive
// Content-Length: 8978

{
  "data": [
    {
      "id": 1,
      "trail_id": 1,
      "date": null,
      "user_id": null,
      "rating": 0,
      "comment": null,
      "tag": null,
      "gpx_id": null,
      "gpx_url": "https://s3.amazonaws.com/9trails-gpx/01_Golden Gate Park Trail.gpx",
      "is_hero_path": true,
      "have_gpx": true,
      "path_api_url": "http://localhost:3005/paths/1"
    },
    {
      "id": 427,
      "trail_id": 1,
      "date": "2018-11-20T23:40:55.711Z",
      "user_id": 9,
      "rating": 5,
      "comment": "morning walk",
      "tag": "hiking",
      "gpx_id": 18870837,
      "gpx_url": "https://s3.amazonaws.com/9trails-gpx/18870837.gpx",
      "is_hero_path": false,
      "have_gpx": false,
      "path_api_url": "http://localhost:3005/paths/427"
    }
  ]
}
```

### 0.1.2. GET http://localhost:3005/1/recordings?sortBy=rating,desc HTTP/1.1

``` js
// HTTP/1.1 200 OK
// X-Powered-By: Express
// Date: Tue, 04 Dec 2018 02:19:52 GMT
// Connection: keep-alive
// Content-Length: 8978

{
  "data": [
   
    {
      "id": 446,
      "trail_id": 1,
      "date": "2018-11-21T06:15:08.721Z",
      "user_id": 10,
      "rating": 4,
      "comment": "Golden Gate Park Trail",
      "tag": "hiking",
      "gpx_id": 21650223,
      "gpx_url": "https://s3.amazonaws.com/9trails-gpx/21650223.gpx",
      "is_hero_path": false,
      "have_gpx": false,
      "path_api_url": "http://localhost:3005/paths/446"
    },
    {
      "id": 450,
      "trail_id": 1,
      "date": "2018-11-21T01:08:35.264Z",
      "user_id": 11,
      "rating": 3,
      "comment": "Golden Gate Park Trail",
      "tag": "hiking",
      "gpx_id": 19060852,
      "gpx_url": "https://s3.amazonaws.com/9trails-gpx/19060852.gpx",
      "is_hero_path": false,
      "have_gpx": false,
      "path_api_url": "http://localhost:3005/paths/450"
    },
    {
      "id": 454,
      "trail_id": 1,
      "date": "2018-11-21T06:15:14.721Z",
      "user_id": 11,
      "rating": 3,
      "comment": "Day 1",
      "tag": "hiking",
      "gpx_id": 21448630,
      "gpx_url": "https://s3.amazonaws.com/9trails-gpx/21448630.gpx",
      "is_hero_path": false,
      "have_gpx": false,
      "path_api_url": "http://localhost:3005/paths/454"
    },
    {
      "id": 435,
      "trail_id": 1,
      "date": "2018-11-21T04:47:33.998Z",
      "user_id": 16,
      "rating": null,
      "comment": "Golden Gate Park Trail",
      "tag": "hiking",
      "gpx_id": 20439978,
      "gpx_url": "https://s3.amazonaws.com/9trails-gpx/20439978.gpx",
      "is_hero_path": false,
      "have_gpx": false,
      "path_api_url": "http://localhost:3005/paths/435"
    }
  ]
}
```



### 0.1.3. GET http://localhost:3005/paths/3 HTTP/1.1

paths (with gpx valid file)

``` js
// HTTP/1.1 200 OK
// X-Powered-By: Express
// Date: Tue, 04 Dec 2018 02:30:29 GMT
// Connection: keep-alive
// Content-Length: 36543

{
  "data": [
    {
      "id": 3,
      "trail_id": 3,
      "date": null,
      "user_id": null,
      "rating": 0,
      "comment": null,
      "tag": null,
      "gpx_id": null,
      "gpx_url": "https://s3.amazonaws.com/9trails-gpx/03_Hope Point.gpx",
      "is_hero_path": true,
      "have_gpx": true,
      "path_api_url": "http://localhost:3005/paths/3",
      "gpx_data": {
        "bounds": {
          "minlat": "60.92668",
          "minlon": "-149.71664",
          "maxlat": "60.93851",
          "maxlon": "-149.66308"
        },
        "points": [
          { "lat": "60.92668", "lon": "-149.66308", "ele": "57.28" },
          { "lat": "60.92749", "lon": "-149.66357", "ele": "73.32" },
          { "lat": "60.92816", "lon": "-149.66422", "ele": "84.94" },
          { "lat": "60.92803", "lon": "-149.66542", "ele": "87.7" },
          { "lat": "60.92818", "lon": "-149.66602", "ele": "90.03" }
        ]
      }
    }
  ]
}
```

### 0.1.4. GET http://localhost:3005/paths/231 HTTP/1.1

paths (with missing .gpx file, and backfilled)

``` js
// HTTP/1.1 200 OK
// X-Powered-By: Express
// Date: Tue, 04 Dec 2018 02:30:29 GMT
// Connection: keep-alive
// Content-Length: 36543
{
  "data": [
    {
      "id": 231,
      "trail_id": 17,
      "date": "2018-11-21T06:15:07.346Z",
      "user_id": 18,
      "rating": null,
      "comment": "Recording - Oct 01, 01:20 PM",
      "tag": "hiking",
      "gpx_id": 21503469,
      "gpx_url": "https://s3.amazonaws.com/9trails-gpx/21503469.gpx",
      "is_hero_path": false,
      "have_gpx": false,
      "backfilled_gpx_url": "https://s3.amazonaws.com/9trails-gpx/19065986.gpx",
      "path_api_url": "http://localhost:3005/paths/231",
      "gpx_data": {
        "bounds": {
          "minlat": "22.186",
          "minlon": "-159.59784",
          "maxlat": "22.22011",
          "maxlon": "-159.58273"
        },
        "points": [
          {
            "lat": "22.2201",
            "lon": "-159.58279",
            "ele": "29.55",
            "time": "2018-02-15T19:59:38Z"
          },
          {
            "lat": "22.22008",
            "lon": "-159.58288",
            "ele": "30.36",
            "time": "2018-02-15T19:59:46Z"
          }
        ]
      }
    }
  ]
}
```


### 0.1.5. POST http://localhost:3005/3/recordings HTTP/1.1

Request like so:

``` js

// POST http://localhost:3005/3/recordings HTTP/1.1
// content-type: application/json

{
    "user_id": 5,
    "date": "1234",
    "rating": 1,
    "comment": "something",
    "gpx": "<?xml version=\"1.0\"?><gpx xmlns=\"http://www.topografix.com/GPX/1/1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" version=\"1.1\" creator=\"AllTrails.com\" xsi:schemaLocation=\"http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd\"><metadata><name><![CDATA[Na Pali Coast (Kalalau) Trail]]></name><desc><![CDATA[]]></desc><link href=\"http://www.alltrails.com\"><text>AllTrails, Inc.</text></link><bounds minlat=\"22.20477\" minlon=\"-159.60318\" maxlat=\"22.21898\" maxlon=\"-159.58557\"/></metadata><trk><name/><desc/><trkseg><trkpt lat=\"22.21898\" lon=\"-159.58557\"><ele>67.55</ele><time>2017-12-31T00:58:57Z</time></trkpt><trkpt lat=\"22.21894\" lon=\"-159.58559\"><ele>69.03</ele><time>2017-12-31T00:59:13Z</time></trkpt><trkpt lat=\"22.2189\" lon=\"-159.58563\"><ele>70.97</ele><time>2017-12-31T00:59:18Z</time></trkpt></trkseg></trk></gpx>"
}
```

Response

``` js
// HTTP/1.1 200 OK
// X-Powered-By: Express
// Date: Tue, 04 Dec 2018 02:25:26 GMT
// Connection: keep-alive
// Content-Length: 964

{
  "data": [
    {
      "user_id": 5,
      "date": "1234",
      "comment": "something",
      "rating": 1,
      "gpx": "<?xml version=\"1.0\"?><gpx xmlns=\"http://www.topografix.com/GPX/1/1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" version=\"1.1\" creator=\"AllTrails.com\" xsi:schemaLocation=\"http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd\"><metadata><name><![CDATA[Na Pali Coast (Kalalau) Trail]]></name><desc><![CDATA[]]></desc><link href=\"http://www.alltrails.com\"><text>AllTrails, Inc.</text></link><bounds minlat=\"22.20477\" minlon=\"-159.60318\" maxlat=\"22.21898\" maxlon=\"-159.58557\"/></metadata><trk><name/><desc/><trkseg><trkpt lat=\"22.21898\" lon=\"-159.58557\"><ele>67.55</ele><time>2017-12-31T00:58:57Z</time></trkpt><trkpt lat=\"22.21894\" lon=\"-159.58559\"><ele>69.03</ele><time>2017-12-31T00:59:13Z</time></trkpt><trkpt lat=\"22.2189\" lon=\"-159.58563\"><ele>70.97</ele><time>2017-12-31T00:59:18Z</time></trkpt></trkseg></trk></gpx>"
    }
  ]
}

```

### 0.1.6. POST http://localhost:3005/3/recordings HTTP/1.1 (error handling)
ERROR handling , ex. missing date

request to post like so

``` js
// POST http://localhost:3005/3/recordings HTTP/1.1
// content-type: application/json

 {
     "user_id": 5
 }
```


Response like so:

``` json
// //HTTP/1.1 400 Bad Request
// X-Powered-By: Express
// Date: Tue, 04 Dec 2018 02:26:26 GMT
// Connection: keep-alive
// Content-Length: 36


{"error":"date is a required field"}
```


### 0.1.7. GET http://localhost:3005/1/heroPath HTTP/1.1

Get hero path of trail

``` js
// HTTP/1.1 200 OK
// X-Powered-By: Express
// Date: Tue, 04 Dec 2018 02:35:30 GMT
// Connection: keep-alive
// Content-Length: 21176

{
  "data": [
    {
      "id": 1,
      "trail_id": 1,
      "date": null,
      "user_id": null,
      "rating": 0,
      "comment": null,
      "tag": null,
      "gpx_id": null,
      "gpx_url": "https://s3.amazonaws.com/9trails-gpx/01_Golden Gate Park Trail.gpx",
      "is_hero_path": true,
      "have_gpx": true,
      "path_api_url": "http://localhost:3005/paths/1",
      "gpx_data": {
        "bounds": {
          "minlat": "37.76442",
          "minlon": "-122.50979",
          "maxlat": "37.77146",
          "maxlon": "-122.46597"
        },
        "points": [
          { "lat": "37.76644", "lon": "-122.46597", "ele": "75.16" },
          { "lat": "37.7664", "lon": "-122.46622", "ele": "76.0" },
          { "lat": "37.76651", "lon": "-122.46649", "ele": "76.0" }
        ]
      }
    }
  ]
}
```
### 0.1.8. GET http://localhost:3005/1/trailHead HTTP/1.1

``` js
// HTTP/1.1 200 OK
// X-Powered-By: Express
// Date: Tue, 04 Dec 2018 02:34:20 GMT
// Connection: keep-alive
// Content-Length: 209

{
  "data": [
    {
      "id": 1,
      "gpx_url": "https://s3.amazonaws.com/9trails-gpx/01_Golden Gate Park Trail.gpx",
      "path_api_url": "http://localhost:3005/paths/1",
      "trailHead": { "lat": "37.76644", "lon": "-122.46597", "ele": "75.16" }
    }
  ]
}
```

