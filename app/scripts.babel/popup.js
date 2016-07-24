'use strict';
// Routing
const routeButtons = document.querySelectorAll('.route-button');
const routePages = document.querySelectorAll('.route-body');

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
const pokemonListContainer = document.getElementById('pokemon_list_container');

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

    response.currentPokemon.forEach(function(pokemon) {
      let listItem = document.createElement('a');
      listItem.className = 'linkable demo-list-action mdl-list';
      listItem.style.padding = 0;
      let listItemDiv = document.createElement('div');
      listItemDiv.className = 'mdl-list__item';
      listItemDiv.style.padding = 0;
      let listItemSpan = document.createElement('span');
      listItemSpan.className = 'mdl-list__item-primary-content';
      let image = document.createElement('img');
      image.src = `images/pokemon/${pokemon.pokemonId}.png`
      let nameSpan = document.createElement('span');
      let pokemonName = capitalizeFirstLetter(response.PokemonMap[pokemon.pokemonId]);
      let name = document.createTextNode(pokemonName);
      nameSpan.appendChild(name);
      listItemSpan.appendChild(image);
      listItemSpan.appendChild(nameSpan);
      listItemDiv.appendChild(listItemSpan);
      listItem.appendChild(listItemDiv);
      pokemonListContainer.appendChild(listItem)
    });
  }
});

// TODO: Add this to a utils file
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

if (typeof module !== "undefined") {
  // define module exports for testing purposes
  module.exports = {
    isValidLatitude: isValidLatitude,
    isValidLongitude: isValidLongitude
  }
}
