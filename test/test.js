const assert = require('chai').assert;
var rewire = require('rewire');
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

// var fs = require('fs');
// var vm = require('vm');
// var path = '../JS_AdManagerDistribution/release/AdManager.js'

// var code = fs.readFileSync(path);
// vm.runInThisContext(code);

var tv = tv || {};
tv.freewheel = tv.freewheel || {};

var demoPlayerRewire = rewire('../player.js');

describe('Player', function() {

  describe('Request Ads', function() {
    before( function () {
      
    });

    it('should submit ad request', function() {

    // var xmlHttpRequestObj = new XMLHttpRequest();
    // xmlHttpRequestObj.open("GET", "http://vi.freewheel.tv/static/dash-renderer-js/AdManager.js", false);
    // xmlHttpRequestObj.send('');
    // // the script should be loaded into topmost window; karma loads each test in a separate context, loaded as an iframe
    // var parentWindow = window.parent;
    // var se = parentWindow.document.createElement('script');
    // se.type = 'text/javascript';
    // se.text = this.xmlHttpRequestObj.responseText;
    // se.id = scriptId;
    // parentWindow.document.getElementsByTagName('head')[0].appendChild(se);
      
    //const dom = new JSDOM('<!DOCTYPE html><html><head><script type="text/javacript" src="http://vi.freewheel.tv/static/dash-renderer-js/AdManager.js"></script><script type="text/javascript" src="player.js"></script></head><body>></body></html>');
    // global.window = dom.window;
    // global.document = dom.window.document;

    // // The script will be executed and modify the DOM:
    // dom.window.document.body.children.length === 2;

    DemoPlayer = demoPlayerRewire.__get__('tv.freewheel.DemoPlayer');
    var player = DemoPlayer();

    console.log("STOP");

    //player.requestAds();

      // var player = new tv.freewheel.DemoPlayer();
      // expect(demoPlayer).to.not.be.null;

      //demoPlayer.requestAds();
      //console.log(demoPlayer.currentAcContext());
        
    });


  });
});