var casper = require("casper").create();
var url = 'https://local.homeagain.com/';
var urls = {
	'index' : url,
	'about' : url + 'about',
	'help'  : url + 'help'
}
var fs = require("fs");

casper.start();
for(name in urls){
    console.log( urls[name] );
    casper.thenOpen(urls[name], function(){
        this.echo("download " + name);
        fs.write(name+".html", this.getHTML(), "w");
    });
}

casper.run();

