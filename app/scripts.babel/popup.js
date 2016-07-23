'use strict';

const submitButton = document.getElementById('coordinate_submit');
const longitudeButton = document.getElementById('longitude');
const latitudeButton = document.getElementById('latitude');

submitButton.onclick = function() {
  // TODO: Add validation
  localStorage['latitude'] = latitudeButton.value;
  localStorage['longitude'] =longitudeButton.value;
}
