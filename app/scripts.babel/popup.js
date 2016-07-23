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
  setButtonState();
}

longitudeInput.onchange = function(e) {
  const value = e.target.value;
  isLongitutdeValid = isValidLongitude(value);
  setButtonState();
}

// Validation for the inputs
function isValidLatitude(value) {
  if (!value || isNaN(value) || (value > 90) || (value < -90)) {
    LatitudeErrorText.style.display = '';
    return false;
  } else {
    LatitudeErrorText.style.display = 'none';
    return true;
  }
}

function isValidLongitude(value) {
  if (!value || isNaN(value) || (value > 180) || (value < -180)) {
    LongitudeErrorText.style.display = '';
    return false;
  } else {
    LongitudeErrorText.style.display = 'none';
    return true;
  }
}

function setButtonState() {
  submitButton.disabled = !(isLatitudeValid && isLongitutdeValid);
}

// Update Current Pokemon List
chrome.runtime.sendMessage({currentPokemon: true}, function(response) {
  if (response.currentPokemon) {
    // TODO: Render the pokemon on the `current pokemon` view
    console.log(response.currentPokemon);
  }
});
