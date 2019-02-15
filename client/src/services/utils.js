

module.exports = {
  createNameSpace: (ns) => {
    const pathPieces = ns.split('.').reverse();
    let piece;
    let varString = '';
    let currValue = window;
    while (currValue && pathPieces.length) {
      piece = pathPieces.pop();
      if (currValue[piece] === undefined) {
        currValue[piece] = {};
      
      } 
      currValue = currValue[piece];
    }
    return currValue;
  },
  getServiceHosts: () => {
    let SERVICE_HOSTS = {};
    console.log('env: ', process.env.NODE_ENV);
    if (process.env.NODE_ENV === 'production') {
      SERVICE_HOSTS = {
        trails: 'http://ec2-34-217-75-14.us-west-2.compute.amazonaws.com',
        profile: 'http://ec2-54-188-74-220.us-west-2.compute.amazonaws.com',
        photos: 'http://ec2-54-183-106-59.us-west-1.compute.amazonaws.com',
        reviews: 'http://trail-photos-service-dev.us-west-1.elasticbeanstalk.com',
        paths: 'http://ec2-18-234-120-132.compute-1.amazonaws.com',
      };
    } else {
      const SAFE_ORIGINS = ['localhost', 'chris-m-2.local'];
      let localHost = 'localhost';
      SAFE_ORIGINS.forEach((host) => {
        if (window.location.origin.indexOf(host) !== -1 ) {
          localHost = host;
        }
      });

      SERVICE_HOSTS = {
        trails: `http://${localHost}:3001`,
        profile: `http://${localHost}:3002`,
        photos: `http://${localHost}:3003`,
        reviews: `http://${localHost}:3004`,
        paths: `http://${localHost}:3005`,
      };
    }
    return SERVICE_HOSTS;
  },
  getTrailIdFromUrl: () => {
    const trailId = parseInt(location.href.split('/').pop()) || 1;
    return trailId;
  }
};