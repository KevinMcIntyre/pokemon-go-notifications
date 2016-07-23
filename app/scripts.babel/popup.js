'use strict';

const submitButton = document.getElementById('coordinate_submit');
const longitudeInput = document.getElementById('longitude');
const latitudeInput = document.getElementById('latitude');

const LongitudeErrorText = document.getElementById('invalid_longitude');
const LatitudeErrorText = document.getElementById('invalid_latitude');

longitudeInput.placeholder = localStorage['longitude'];
latitudeInput.placeholder = localStorage['latitude'];

submitButton.onclick = function() {
  const isInvalid = isNaN(latitudeInput.value) || isNaN(longitudeInput.value);

  if (!isInvalid) {
    localStorage['latitude'] = latitudeInput.value;
    localStorage['longitude'] = longitudeInput.value;
    longitudeInput.placeholder = longitudeInput.value;
    LatitudeErrorText.placeholder = latitudeInput.value;
    chrome.runtime.sendMessage({repoll: true}, function(response) { });
    window.close();
  }
}

// Validation for the inputs
latitudeInput.onchange = function(e) {
  const value = e.target.value;

  if (isNaN(value)) {
    LatitudeErrorText.style.display = '';
  } else {
    LatitudeErrorText.style.display = 'none';
  }
}

longitudeInput.onchange = function(e) {
  const value = e.target.value;

  if (isNaN(value)) {
    LongitudeErrorText.style.display = '';
  } else {
    LongitudeErrorText.style.display = 'none';
  }
}
