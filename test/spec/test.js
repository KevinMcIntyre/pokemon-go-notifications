'use strict';
// Imports
const chai = require('chai');
const expect = chai.expect;
const jsdom = require('jsdom').jsdom;

const _$ = require('jquery');
const chaiJquery = require('chai-jquery');

// Setup document
const documentHTML = '<!doctype html><html>' +
'<body><input id="longitude"><input id="latitude"><button id="coordinate_submit" disabled>Search!</button>' +
'<a id="current-pokemon" class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect route-button" style="display: none">Current Pokemon</a>' +
'<a id="set-location" class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect route-button">Set Location</a>' +
'<a id="notification-options" class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect route-button">Notification Options</a>' +
'<li class="mdl-menu__item" id="facebook-button"><i class="fa fa-facebook-official social-icon"></i>Facebook</li>' +
'<li class="mdl-menu__item" id="twitter-button"><i class="fa fa-twitter social-icon"></i>Twitter</li>' +
'<li class="mdl-menu__item" id="github-button"><i class="fa fa-github social-icon"></i>Github</li>' +
'<a class="gps-current-location">' +
'<div id="pokemon_list_container"></div>'+
'</body></html>';

global.document = jsdom(documentHTML);
global.window = global.document.defaultView;
global.navigator = global.window.navigator;

const $ = _$(window);

chaiJquery(chai, chai.util, $);

// Begin Tests
describe('Longitude and latitude validation', function () {
  let popup;

  beforeEach(function () {
     global.chrome = require('sinon-chrome');
     popup = require('../../app/scripts.babel/popup')
  });

  it('should fail validation if value is null', function () {
      expect(popup.isValidLatitude(null)).to.equal(false);
      expect(popup.isValidLongitude(null)).to.equal(false);
  });

  it('should fail validation if value is undefined', function () {
      expect(popup.isValidLatitude(undefined)).to.equal(false);
      expect(popup.isValidLongitude(undefined)).to.equal(false);
  });

  it('should fail validation if value is non numeric characters', function () {
      expect(popup.isValidLatitude('abc')).to.equal(false);
      expect(popup.isValidLongitude('abc')).to.equal(false);
  });

  it('should fail validation if value exceeds limit', function () {
      expect(popup.isValidLatitude(91)).to.equal(false);
      expect(popup.isValidLongitude(181)).to.equal(false);
  });

  it('should fail validation if value is below range', function () {
      expect(popup.isValidLatitude(-91)).to.equal(false);
      expect(popup.isValidLongitude(-181)).to.equal(false);
  });

  it('should pass validation if value within range with falsy value', function () {
      expect(popup.isValidLatitude(0)).to.equal(true);
      expect(popup.isValidLongitude(0)).to.equal(true);
  });

  it('should pass validation if value within range', function () {
      expect(popup.isValidLatitude(-90)).to.equal(true);
      expect(popup.isValidLatitude(55)).to.equal(true);
      expect(popup.isValidLatitude(90)).to.equal(true);
      expect(popup.isValidLongitude(-180)).to.equal(true);
      expect(popup.isValidLongitude(55)).to.equal(true);
      expect(popup.isValidLongitude(180)).to.equal(true);
  });
});

describe('DOM manipulation tests', function() {
  let popup;
  let renderCurrentPokemonList;
  let response;

  beforeEach(function () {
     global.chrome = require('sinon-chrome');
     popup = require('../../app/scripts.babel/popup');
     renderCurrentPokemonList = popup.renderCurrentPokemonList;
     response = {
       currentPokemon: [{ pokemonId: 1, latitude: 12, longitude: 34 }, { pokemonId: 4, latitude: 14, longitude: 43 }],
       PokemonMap: { 1: 'bulbasaur', 4: 'charmander'},
       latitude: 24,
       longitude: 36
     };
  });

  describe('Current Pokemon list rendering', function() {
      beforeEach(function () {
        renderCurrentPokemonList(response);
      });

      it('should render a list item for each pokemon', function() {
        const items = document.querySelectorAll('.pokemon-list-item');
        expect(items.length).to.equal(2);
      });

      it('should should contain span with pokemon name', function() {
        const items = $('.pokemon-list-item');
        expect(items.eq(0)).to.contain('Bulbasaur');
        expect(items.eq(1)).to.contain('Charmander');
      });

      it('should should contain correct image for each pokemon', function() {
        const items = $('.pokemon-list-item');

        expect(items.eq(0).find('img')).to.exist;
        expect(items.eq(0).find('img')).to.have.prop('src','images/pokemon/1.png');

        expect(items.eq(1).find('img')).to.exist;
        expect(items.eq(1).find('img')).to.have.prop('src','images/pokemon/4.png');
      });
  })
})
