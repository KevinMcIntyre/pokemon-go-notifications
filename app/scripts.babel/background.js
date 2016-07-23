'use strict';
// Imports (they come from manifest.json > background > scripts)
var request = window.superagent;

// If any of the localStorage objects are missing, repopulate with defaults
if (localStorage['latitude'] === undefined
  || localStorage['longitude'] === undefined
  || localStorage['pollingTime'] === undefined) {

  localStorage['latitude'] = DefaultData.location.latitude;
  localStorage['longitude'] = DefaultData.location.longitude;
  localStorage['pollingTime'] = DefaultData.pollingTime;
}

let currentPokemon = [];
let pokevisionDown = false;

// Code
chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.greeting) {
      lookForPokemon()
    }
});

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  const latitude = localStorage['latitude'];
  const longitude = localStorage['longitude'];
  const pollingTime = localStorage['pollingTime'];

  chrome.tabs.create({
    url: `https://pokevision.com/#/@${latitude},${longitude}`
  });
});

(function(){lookForPokemon()})();

function lookForPokemon() {
  let statusChange = false;
  const latitude = localStorage['latitude'];
  const longitude = localStorage['longitude'];
  const pollingTime = localStorage['pollingTime'];

  console.log("latitude: ", latitude)
  console.log("longitude: ", longitude)

  request
    .get(`https://pokevision.com/map/data/${latitude}/${longitude}`)
    .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
    .set('accept-language', 'en-US,en;q=0.8')
    .set('cache-control', 'no-cache')
    .set('pragma', 'no-cache')
    .set('upgrade-insecure-requests', '1')
    .end((err, res) => {
      if (err || !res.ok) {
        if (!pokevisionDown) {
          statusChange = true;
        }
        console.log('Unable to contact https://pokevision.com');
      } else if (res.body) {
        if (pokevisionDown) {
          statusChange = true;
        }
        const pokemonFound = res.body['pokemon'];
        if (pokemonFound) {
          for (let pokemon of pokemonFound) {
            newPokemonNotification(pokemon['pokemonId'], pokemon['uid']);
            if (!pokemonHasBeenSighted(pokemon)) {
              newPokemonNotification(pokemon['pokemonId'], pokemon['uid']);
              currentPokemon.push(pokemon);
            }
          }
          const foundPokemonIds = pokemonFound.map(function(foundPokemon) {
            return foundPokemon['id'];
          });
          currentPokemon = currentPokemon.map(function(pokemon) {
            if (foundPokemonIds.indexOf(pokemon['id']) > -1) {
              return pokemon;
            }
          });
        }
      } else {
        if (!pokevisionDown) {
          statusChange = true;
        }
      }

      if (statusChange) {
        pokevisionDown = !pokevisionDown;
        if (pokevisionDown) {
          chrome.browserAction.setIcon({
            path : {
              '19': 'images/yellow-pokeball-19.png',
              '38': 'images/yellow-pokeball-38.png'
            }
          });
          chrome.browserAction.setTitle({
            title: 'PokeVision is down'
          });
        } else {
          chrome.browserAction.setIcon({
            path : {
              '19': 'images/pokeball-19.png',
              '38': 'images/pokeball-38.png'
            }
          });
          chrome.browserAction.setTitle({
            title: 'Pokemon GO Notifications'
          });
        }
      }

      console.log(currentPokemon);
    });

  setTimeout(() => {
    lookForPokemon();
  }, pollingTime);
}

function pokemonHasBeenSighted(pokemon) {
  let pokemonAlreadySighted = false;
  for (let current of currentPokemon) {
    if (current['id'] == pokemon['id']) {
      pokemonAlreadySighted = true;
      break;
    }
  }
  return pokemonAlreadySighted;
}

function newPokemonNotification(pokemonId, uid) {
  chrome.notifications.create(uid, {
    type: 'basic',
    iconUrl: 'images/pokemon/' + pokemonId + '.png',
    title: 'Pokemon alert!',
    message: `There is a ${capitalizeFirstLetter(PokemonMap[pokemonId.toString()])} nearby!`,
    buttons: [{
      title: 'Click here to check PokeVision!'
    }]
  }, (notificationId) => {});
}


function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}