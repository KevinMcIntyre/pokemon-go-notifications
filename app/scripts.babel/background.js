'use strict';
// Imports (they come from manifest.json > background > scripts)
var request = window.superagent;

// If any of the localStorage objects are missing, repopulate with defaults
if (localStorage['latitude'] === undefined
    || localStorage['longitude'] === undefined
    || localStorage['pollingTime'] === undefined
    || localStorage['blacklist'] === undefined
    || localStorage['notificationsEnabled'] === undefined) {

  localStorage['latitude'] = DefaultData.location.latitude;
  localStorage['longitude'] = DefaultData.location.longitude;
  localStorage['pollingTime'] = DefaultData.pollingTime;
  localStorage['blacklist'] = JSON.stringify([]);
  localStorage['notificationsEnabled'] = 'true';
}

// This is used to prevent notification bombardment from already spawned pokemon
let firstCall = true;

let currentPokemon = [];
let blacklist = JSON.parse(localStorage['blacklist']);
let notificationsEnabled = (localStorage['notificationsEnabled'] === 'true');
let pokevisionDown = false;

// Code
chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.repoll) {
      currentPokemon = [];
      firstCall = true;
      lookForPokemon()
    } else if (request.currentPokemon) {
      sendResponse({currentPokemon, PokemonMap});
    } else if (request.blacklistPokemon) {
      if (blacklist.indexOf(request.blacklistPokemon) === -1) {
        blacklist.push(request.blacklistPokemon);
        blacklist.sort((a, b) => {
          return parseInt(a, 10) - parseInt(b, 10);
        });
        sendResponse(blacklist);
        ((blacklist) => {
          localStorage['blacklist'] = JSON.stringify(blacklist);
        })(blacklist);
      }
    } else if (request.whitelistPokemon) {
      const index = blacklist.indexOf(request.whitelistPokemon);
      if (index > -1) {
        blacklist.splice(index, 1);
        sendResponse(blacklist);
        ((blacklist) => {
          localStorage['blacklist'] = JSON.stringify(blacklist);
        })(blacklist);
      }
    } else if (request.toggleNotifications) {
      notificationsEnabled = !notificationsEnabled;
      ((notificationsEnabled) => {
        localStorage['notificationsEnabled'] = notificationsEnabled.toString();
      })(notificationsEnabled);
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

  scanForPokemon(latitude, longitude, () => {
    request
      .get(`https://pokevision.com/map/data/${latitude}/${longitude}`)
      .set('accept', 'application/json, text/javascript, */*; q=0.01')
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
              if (!pokemonHasBeenSighted(pokemon)) {
                if (!firstCall && notificationsEnabled && blacklist.indexOf(pokemon['pokemonId'].toString()) === -1) {
                  newPokemonNotification(pokemon['pokemonId'], pokemon['id'].toString());
                }
                currentPokemon.push(pokemon);
              }
            }
            const foundPokemonIds = pokemonFound.map(function(foundPokemon) {
              return foundPokemon['id'];
            });
            currentPokemon = currentPokemon.filter(function(pokemon) {
              return (foundPokemonIds.indexOf(pokemon['id']) > -1)
            });
            firstCall = false;
          }
        } else {
          if (!pokevisionDown) {
            statusChange = true;
          }
        }

        if (statusChange) {
          pokevisionDown = !pokevisionDown;
          if (pokevisionDown) {
            firstCall = true;
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

        setTimeout(() => {
          lookForPokemon();
        }, pollingTime);
      });
  });
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

function newPokemonNotification(pokemonId, id) {
  chrome.notifications.create(id, {
    type: 'basic',
    iconUrl: 'images/pokemon/' + pokemonId + '.png',
    title: 'Pokemon alert!',
    message: `${capitalizeFirstLetter(PokemonMap[pokemonId.toString()])} has spawned nearby!`,
    buttons: [{
      title: 'Click here to check PokeVision!'
    }]
  }, (notificationId) => {});
}

function scanForPokemon(latitude, longitude, callback) {
  let success = true;
  request
    .get(`https://pokevision.com/map/scan/${latitude}/${longitude}`)
    .set('accept', 'application/json, text/javascript, */*; q=0.01')
    .set('accept-language', 'en-US,en;q=0.8')
    .end((err, res) => {
      if (err || !res.ok) {
        success = false;
      } else if (res.body) {
        if (res.body['status'] != 'success') {
          success = false;
        }
      } else {
        success = false;
      }
    });
  if (success) {
    callback();
  } else {
    if (!pokevisionDown) {
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
    lookForPokemon();
  }
}
