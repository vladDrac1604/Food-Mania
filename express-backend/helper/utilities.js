const InvalidLogin = "Invalid login credentials";
const mimeTypeMap = {
  'images/png': 'png',
  'images/jpg': 'jpg',
  'images/jpeg': 'jpeg'
}

function getNumberOfPages(recordsCount, pageSize) {
    if(recordsCount <= pageSize) {
        return 1;
    }
    let numberOfPages = (recordsCount / pageSize).toString();
    if(numberOfPages.includes('.')) {
      numberOfPages = numberOfPages.substring(0, numberOfPages.indexOf('.'));
    }
    numberOfPages = +numberOfPages;
    if(recordsCount % pageSize > 0) {
      numberOfPages += 1;
    }
    return numberOfPages;
}

module.exports.getNumberOfPages = getNumberOfPages;
module.exports.InvalidLogin = InvalidLogin;
module.exports.mimeTypeMap = mimeTypeMap;
