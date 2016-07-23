'use strict';

const chai = require('chai');
const expect = chai.expect;

// Setup document

const jsdom = require('jsdom').jsdom;

const documentHTML = '<!doctype html><html>' +
'<body><input id="longitude"><input id="latitude"><button id="coordinate_submit" disabled>Search!</button>' +
'</body></html>';

global.document = jsdom(documentHTML);
global.window = global.document.defaultView;
global.navigator = global.window.navigator;


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

});
