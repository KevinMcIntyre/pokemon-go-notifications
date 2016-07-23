'use strict';
// Imports (they come from manifest.json > background > scripts)
var request = window.superagent;

let latitude = '40.17108634546';
let longitude = '-75.119866149902';
let pollingTime = 30000;

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
  request
    .get(`https://pokevision.com/map/data/${latitude}/${longitude}`)
    .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
    .set('accept-language', 'en-US,en;q=0.8')
    .set('cache-control', 'no-cache')
    .set('pragma', 'no-cache')
    .set('upgrade-insecure-requests', '1')
    .end((err, res) => {
      if (err || !res.ok) {
        console.log("Unable to contact https://pokevision.com");
      } else {
        const pokemonFound = res.body['pokemon'];
        if (pokemonFound) {
          var i = 0;
          for (let pokemon of pokemonFound) {
            i++;
            newPokemonNotification(pokemon['pokemonId'], pokemon['uid'] + i);
          }
        }
      }
    });
  setTimeout(() => {
    lookForPokemon();
  }, pollingTime);
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
