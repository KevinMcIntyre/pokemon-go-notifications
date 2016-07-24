'use strict';


// Routing
const routeButtons = document.getElementsByClassName('route-button');
const routePages= document.getElementsByClassName('route-body');

for (let button of routeButtons) {
  button.onclick = function() {
    const requestedPage = button.id;
    for (let routePage of routePages) {
      if (routePage.id === requestedPage.concat('-body')) {
        routePage.style.display = 'block';
      } else {
        routePage.style.display = 'none';
      }
    }
    for (let routeButton of routeButtons) {
      if (routeButton.id === requestedPage) {
        routeButton.style.display = 'none';
      } else {
        routeButton.style.display = 'inline-block';
      }
    }
  }
}

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
  setDivVisibility(LatitudeErrorText, isLatitudeValid);
  setButtonState();
}

longitudeInput.onchange = function(e) {
  const value = e.target.value;
  isLongitutdeValid = isValidLongitude(value);
  setDivVisibility(LongitudeErrorText, isLongitutdeValid);
  setButtonState();
}

function setDivVisibility(div, isValid) {
  if (isValid) {
    div.style.display = 'none';
  } else {
    div.style.display = '';
  }
}

// Validation for the inputs
function isValidLatitude(value) {
  if (!value || isNaN(value) || (value > 90) || (value < -90)) {
    return false;
  } else {
    return true;
  }
}

function isValidLongitude(value) {
  if (!value || isNaN(value) || (value > 180) || (value < -180)) {
    return false;
  } else {
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


if (module) {
  // Modules only work during tests
  module.exports = { isValidLatitude: isValidLatitude, isValidLongitude: isValidLongitude }
}
