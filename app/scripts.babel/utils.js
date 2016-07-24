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