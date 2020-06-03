var casper = require("casper").create();
var x = require("casper").selectXpath;

casper.userAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:39.0) Gecko/20100101 Firefox/39.0");


phantom.cookiesEnabled = true;

var webPage = require('webpage');
var page = webPage.create();
page.settings.javascriptEnabled = true;

casper.start("http://local.homeagain.com");

casper.then(function(){
  casper.capture("test.png");
  this.debugHTML();
});

casper.run();
