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
};

longitudeInput.onchange = function(e) {
  const value = e.target.value;
  isLongitutdeValid = isValidLongitude(value);
  LongitudeErrorText.style.display = isLongitutdeValid ? 'none' : '';
  setButtonState();
};

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

document.querySelector('.gps-current-location').onclick = function() {
  const longitudeInput = document.getElementById('longitude');
  const latitudeInput = document.getElementById('latitude');

  getGeolocation().then(function(res){
    longitudeInput.value = res.longitude;
    latitudeInput.value = res.latitude;
    longitudeInput.onchange({ target: { value: res.longitude }})
    latitudeInput.onchange({ target: { value: res.latitude }})
  });
};

// Update Current Pokemon List
chrome.runtime.sendMessage({ currentPokemon: true }, renderCurrentPokemonList);

function renderCurrentPokemonList(response) {
  const currentPokemon = response.currentPokemon;
  const PokemonMap = response.PokemonMap;
  const latitude = response.latitude;
  const longitude = response.longitude;

  if (!currentPokemon) { return; }

  currentPokemon.forEach(function(pokemon) {
    let listItem = document.createElement('div');
    listItem.onclick = function() {
      chrome.tabs.create({ url: `https://pokevision.com/#/@${pokemon.latitude},${pokemon.longitude}` });
    }
    listItem.className = 'linkable pokemon-list-item mdl-list';
    listItem.style.padding = 0;
    let listItemDiv = createElement('div', {
      className: 'mdl-list__item'
    });
    listItemDiv.style.padding = 0;
    let listItemSpan = createElement('span', {
      className: 'mdl-list__item-primary-content'
    });
    let image = createElement('img', {
      src : `images/pokemon/${pokemon.pokemonId}.png`
    });
    let nameSpan = createElement('span', {
      className: 'pokemon-name'
    });
    let distanceSpan = createElement('span', {
      className: 'pokemon-distance'
    });
    let detailSpan = createElement('span', {
      className: 'pokemon-details'
    });
    let pokemonName = capitalizeFirstLetter(PokemonMap[pokemon.pokemonId]);
    let distanceKm = getDistanceFromLatLonInKm(pokemon.latitude, pokemon.longitude, latitude, longitude);
    if (!isNaN(distanceKm)) {
      distanceKm = (distanceKm).toFixed(2)
    }
    const distance =  document.createTextNode(' is ' + distanceKm + ' km(s) away');
    let name = document.createTextNode(pokemonName);
    nameSpan.appendChild(name);
    distanceSpan.appendChild(distance);
    detailSpan.appendChild(nameSpan);
    detailSpan.appendChild(distanceSpan),
    listItemSpan.appendChild(image);
    listItemSpan.appendChild(detailSpan);
    listItemDiv.appendChild(listItemSpan);
    listItem.appendChild(listItemDiv);
    pokemonListContainer.appendChild(listItem)
  });
}

function getDistanceFromLatLonInKm(lat1,lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// TODO: Move this to utils
function createElement(tag, attributes) {
  const element = document.createElement(tag);
  if (attributes) {
    const keys = Object.keys(attributes);

    for(let key of keys) {
      let attribute = attributes[key];
      if (key === 'className') { key = 'class'; }
      element.setAttribute(key, attribute)
    }
  }
  return element;
}

// Social Buttons

document.querySelector('#facebook-button').onclick = function () {
  // TODO: Make the link the chrome extension page
  const queryURL = 'https%3A%2F%2Ffacebook.com';
  chrome.windows.create({
    'url': `https://www.facebook.com/sharer/sharer.php?u=${queryURL}`,
    'type': 'popup',
    'width': 555,
    'height': 424
  }, function(window) {
  });
};

document.querySelector('#twitter-button').onclick = function () {
  // TODO: Make the link the chrome extension page
  const queryURL = 'https%3A%2F%2Ftwitter.com';
  const queryText = 'Hello%20world';
  chrome.windows.create({
    'url': `https://twitter.com/intent/tweet?url=${queryURL}&text=${queryText}`,
    'type': 'popup',
    'width': 640,
    'height': 253
  }, function(window) {
  });
};

document.querySelector('#github-button').onclick = function () {
  chrome.tabs.create({
    url: 'https://github.com/KevinMcIntyre/pokemon-go-notifications'
  });
};


if (typeof module !== 'undefined') {
  // define module exports for testing purposes
  module.exports = {
    isValidLatitude: isValidLatitude,
    isValidLongitude: isValidLongitude,
    renderCurrentPokemonList: renderCurrentPokemonList
  }
}
