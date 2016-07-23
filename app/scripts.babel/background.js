'use strict';
// Imports (they come from manifest.json > background > scripts)
var request = window.superagent;

let currentPokemon = [];
let latitude = '40.17108634546';
let longitude = '-75.119866149902';
let pollingTime = 30000;
let pokevisionDown = false;

// Code
chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  chrome.tabs.create({
    url: `https://pokevision.com/#/@${latitude},${longitude}`
  });
});

(function() {
  lookForPokemon();
})();

function lookForPokemon() {
  let statusChange = false;
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
      } else {
        if (pokevisionDown) {
          statusChange = true;
        }
        const pokemonFound = res.body['pokemon'];
        if (pokemonFound) {
          for (let pokemon of pokemonFound) {
            if (!pokemonHasBeenSighted(pokemon)) {
              newPokemonNotification(pokemon['pokemonId'], pokemon['uid']);
              currentPokemon.push(pokemon);
            }
          }
        }
      }

      if (statusChange) {
        pokevisionDown = !pokevisionDown;
        if (pokevisionDown) {
          console.log('setting to yellow');
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
          console.log('setting to red');
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
    });

  setTimeout(() => {
    lookForPokemon();
  }, pollingTime);
}

function pokemonHasBeenSighted(pokemon) {
  let pokemonAlreadySighted = false;
  for (let current of currentPokemon) {
    if (current['uid'] == pokemon['uid']) {
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
