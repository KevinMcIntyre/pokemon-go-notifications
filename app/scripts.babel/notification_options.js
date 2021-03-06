// Notification Options
let blacklist = JSON.parse(localStorage['blacklist']);

function blacklistPokemon(pokemonName) {
  let reversedPokemonMap = objectSwap(PokemonMap);
  chrome.runtime.sendMessage({
    blacklistPokemon: reversedPokemonMap[pokemonName.toLowerCase()]
  }, function(response) {
    if (response) {
      blacklist = response;
      renderBlacklistedPokemon(blacklist);
    }
  });
  const input = document.querySelector('#disable-pokemon');
  input.value = '';
}

function whitelistPokemon(pokemonName) {
  let reversedPokemonMap = objectSwap(PokemonMap);
  chrome.runtime.sendMessage({
   whitelistPokemon: reversedPokemonMap[pokemonName.toLowerCase()]
  }, function(response) {
    if (response) {
      blacklist = response;
      renderBlacklistedPokemon(blacklist);
    }
  });
}

function renderBlacklistedPokemon(blacklistedPokemonIds) {
  const blacklistedPokemon = blacklistedPokemonIds.map((pokemonId) => {
    return capitalizeFirstLetter(PokemonMap[pokemonId]);
  });
  const blacklist = createElement('ul');
  for (let pokemon of blacklistedPokemon) {
    const li = createElement('li');
    const anchor = createElement('a');
    anchor.innerHTML = pokemon;
    li.appendChild(anchor);
    li.onclick = function() {
      whitelistPokemon(pokemon);
    };
    blacklist.appendChild(li);
  }
  const blacklistContainer = document.querySelector('#blacklist-container');
  blacklistContainer.firstElementChild.remove();
  blacklistContainer.appendChild(blacklist);
}

new autoComplete({
  selector: '#disable-pokemon',
  minChars: 1,
  source: function(term, suggest) {
    term = term.toLowerCase();
    let choices = Object.keys(PokemonMap).map((key) => {
      return capitalizeFirstLetter(PokemonMap[key]);
    });
    let matches = [];
    for (let i = 0; i < choices.length; i++) {
      if (~choices[i].toLowerCase().indexOf(term)) {
        matches.push(choices[i]);
      }
    }
    suggest(matches);
  },
  onSelect: function(e, term) {
    blacklistPokemon(term);
  }
});

renderBlacklistedPokemon(blacklist);

const notificationSwitch = document.querySelector('#notification-switch');
if (localStorage['notificationsEnabled'] === 'true') {
  notificationSwitch.setAttribute('checked', 'checked');
}

notificationSwitch.onclick = function() {
  chrome.runtime.sendMessage({
    toggleNotifications: true
  }, function(response) {});
};

const soundSwitch = document.querySelector('#sound-switch');
if (localStorage['soundEnabled'] === 'true') {
  soundSwitch.setAttribute('checked', 'checked');
}

soundSwitch.onclick = function() {
  chrome.runtime.sendMessage({
    toggleSound: true
  }, function(response) {});
};
