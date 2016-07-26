function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function objectSwap(json) {
  var reversedObj = {};
  for(let key in json){
    reversedObj[json[key]] = key;
  }
  return reversedObj;
}

function getGeolocation() {
  return new Promise( function(resolve, reject) {
    navigator.geolocation.getCurrentPosition(function(position) {
      resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    });
  });
}