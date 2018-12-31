const {lineString, lineChunk, length, point, distance} = require('@turf/turf');

const pathUtils = module.exports = {

  createRemap: (inMin, inMax, outMin, outMax) => {
    return function remapper(x) {
      return (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    };
  },
  getMinMaxElevation: (points, opts) => {
    opts = Object.assign({units: 'meters'}, opts);
    // should return start and end points
    // first init min, max
    let min = 999999999;
    let max = -999999999;
    points.forEach(({ele}) => {
      min = Math.min(Number(ele), min);
      max = Math.max(Number(ele), max);
    });
    const unitsDic = {
      'meters': 1,
      'feet': 3.28084
    };
    return {
      min: min * unitsDic[opts.units],
      max: max * unitsDic[opts.units]
    };
  },
  // get elevation bars as lines
  getElevBarsAsLines: (points, width, height) => {
    if (points[0].ele === undefined) {
      return false;
    } else {
      const {min, max} = pathUtils.getMinMaxElevation(points);
      const heightRemapper = pathUtils.createRemap(min, max, .2, 1);
      const buffer = Math.floor(width / points.length);
      const widthRemapper = pathUtils.createRemap(0, points.length - 1, buffer, width - buffer);
      return points.map((point, index) => {
        point.heightRatio = heightRemapper(Number(point.ele));
        point.height = height * point.heightRatio;
        point.width = buffer - (buffer * 2 / points.length);
        point.lineStart = [widthRemapper(index), 0];
        point.lineEnd = [widthRemapper(index), point.height];
        return point;
      });
    }
  
  },
  getPointAsArray: (point) => {
    return [parseFloat(point.lon), parseFloat(point.lat)];
  },
  getPointsAsArray: (points) => {
    return points.map((point) => {
      return pathUtils.getPointAsArray(point);
    });
  },
  getPointAsString: (pt) => {
    return JSON.stringify([parseFloat(pt.lon), parseFloat(pt.lat)]);
  },
  getPointsAsDic: (points) => {
    const dic = {};
    points.forEach((pt) => {
      dic[pathUtils.getPointAsString(pt)] = pt;
    });
    return dic;
  },
  convertToPX: (pt, latLonBounds, width, height) => {
    const $mapWidth = width;
    const $mapHeight = height;

    const $mapLonLeft = latLonBounds[0];
    const $mapLonRight = latLonBounds[2];
    const $mapLonDelta = $mapLonRight - $mapLonLeft;
    
    const $mapLatBottom = latLonBounds[1];
    const $mapLatBottomDegree = $mapLatBottom * Math.PI / 180;
    const $lon = pt[0];
    let $lat = pt[1];

    const $x = ($lon - $mapLonLeft) * ($mapWidth / $mapLonDelta);

    $lat = $lat * Math.PI / 180;
    const $worldMapWidth = (($mapWidth / $mapLonDelta) * 360) / (2 * Math.PI);
    const $mapOffsetY = ($worldMapWidth / 2 * Math.log((1 + Math.sin($mapLatBottomDegree)) / (1 - Math.sin($mapLatBottomDegree))));
    const $y = $mapHeight - (($worldMapWidth / 2 * Math.log((1 + Math.sin($lat)) / (1 - Math.sin($lat)))) - $mapOffsetY);

    return [$x, $y];

  },
  getClosestPoint: (targetPoint, points) => {
    let minDist = 9999999;
    let closestPoint = null;
    let currDist;
    points.forEach(pt => {
      currDist = distance(point(targetPoint), point(pathUtils.getPointAsArray(pt)));
      if (currDist < minDist) {
        minDist = currDist;
        closestPoint = pt;
      }
    });
    return Object.assign({}, closestPoint);
  },
  getPathLength: (points, opts = {}) => {
    const pts = pathUtils.getPointsAsArray(points);
    const path = lineString(pts, {name: 'path'});
    return length(path, opts);
  },
  // redivide path
  redividePath: (points, segmentCount) => {
    const pts = pathUtils.getPointsAsArray(points);
    const path = lineString(pts, {name: 'path'});
    const pathLength = length(path);
    const segmentLength = pathLength / segmentCount;
    const segments = lineChunk(path, segmentLength);
    const newPts = segments.features.map(segment => {
      return pathUtils.getClosestPoint(segment.geometry.coordinates[0], points);
    });
    return newPts;
  }
};