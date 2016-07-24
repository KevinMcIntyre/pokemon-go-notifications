'use strict';

// Declare varibales and set placeholders
const submitButton = document.getElementById('coordinate_submit');
const longitudeInput = document.getElementById('longitude');
const latitudeInput = document.getElementById('latitude');
const LongitudeErrorText = document.getElementById('invalid_longitude');
const LatitudeErrorText = document.getElementById('invalid_latitude');

let isLatitudeValid = false;
let isLongitutdeValid = false;

longitudeInput.placeholder = localStorage['longitude'];
latitudeInput.placeholder = localStorage['latitude'];

// Event Handlers
submitButton.onclick = function() {
  const isValid = isLatitudeValid && isLongitutdeValid;

  if (isValid) {
    localStorage['latitude'] = latitudeInput.value;
    localStorage['longitude'] = longitudeInput.value;
    longitudeInput.placeholder = longitudeInput.value;
    LatitudeErrorText.placeholder = latitudeInput.value;
    chrome.runtime.sendMessage({ repoll: true }, function(response) { });
    window.close();
  }
}

latitudeInput.onchange = function(e) {
  const value = e.target.value;
  isLatitudeValid = isValidLatitude(value);
  LatitudeErrorText.style.display = isLatitudeValid ? 'none' : '';
  setButtonState();
}

longitudeInput.onchange = function(e) {
  const value = e.target.value;
  isLongitutdeValid = isValidLongitude(value);
  LongitudeErrorText.style.display = isLongitutdeValid ? 'none' : '';
  setButtonState();
}

// Validation for the inputs
function isValidLatitude(value) {
  return !((!value && value !== 0) || isNaN(value) || (value > 90) || (value < -90));
}

function isValidLongitude(value) {
  return !((!value && value !== 0) || isNaN(value) || (value > 180) || (value < -180));
}

// HTML Element controls
function setButtonState() {
  submitButton.disabled = !(isLatitudeValid && isLongitutdeValid);
}

// Update Current Pokemon List
chrome.runtime.sendMessage({ currentPokemon: true }, function(response) {
  if (response.currentPokemon) {
    // TODO: Render the pokemon on the `current pokemon` view
    console.log(response.currentPokemon);
  }
});

if (module) {
  // define module exports for testing purposes
  module.exports = {
    isValidLatitude: isValidLatitude,
    isValidLongitude: isValidLongitude
  }
}
