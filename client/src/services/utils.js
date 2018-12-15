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
  getTrailIdFromUrl: () => {
    const trailId = parseInt(location.href.split('/').pop()) || 1;
    return trailId;
  }
};