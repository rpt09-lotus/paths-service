

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
        trails: 'http://trail-env.8jhbbn2nrv.us-west-2.elasticbeanstalk.com',
        profile: 'http://profile-service.be6c6ztrma.us-west-2.elasticbeanstalk.com',
        photos: 'http://trail-photos-service-dev.us-west-1.elasticbeanstalk.com',
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