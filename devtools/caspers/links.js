
var links = [];
var title = [];
var casper = require("casper").create();
 
function getLinks() {
    var links = document.querySelectorAll('your-selector');
    return Array.prototype.map.call(links, function(e) {
        return e.getAttribute('href');
    });
};
function getTitle() {
    var title = document.querySelectorAll('your-selector');
    return Array.prototype.map.call(title, function(a) {
        return a.getAttribute('title');
    });
};
casper.start(casper.cli.get(0), function() {
     this.echo('Current location is =' + this.getCurrentUrl(), 'COMMENT');
 
});
 
// save values in arrays
casper.then(function() {
    links = this.evaluate(getLinks);
});
casper.then(function() {
    title = this.evaluate(getTitle);
});
 
casper.run(function() {
    // echo results in a desired pattern
    this.echo(links.length + ' links found:', 'GREEN_BAR');
    this.echo(' - ' + links.join('\n - '));
    this.echo(title.length + ' title found:', 'GREEN_BAR');
    this.echo(' - ' + title.join('\n - ')).exit();
});
