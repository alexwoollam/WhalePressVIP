var casper = require("casper").create();
var utils = require('utils');
var fs = require('fs');
var mimetype = require('./mimetype'); // URL provided below
var cssResources = [];
var imgResources = [];
var fontResources = [];
var resourceDirectory = "resources";
var debug = false;

fs.removeTree(resourceDirectory);

casper.on("remote.message", function(msg){
    this.echo("remote.msg: " + msg);
});

casper.on("resource.error", function(resourceError){
    this.echo("res.err: " + JSON.stringify(resourceError));
});

casper.on("page.error", function(pageError){
    this.echo("page.err: " + JSON.stringify(pageError));
});

casper.on("downloaded.file", function(targetPath){
    if (debug) this.echo("dl.file: " + targetPath);
});

casper.on("resource.received", function(resource){
    // don't try to download data:* URI and only use stage == "end"
    if (resource.url.indexOf("data:") != 0 && resource.stage == "end") {
        if (resource.contentType == "text/css") {
            cssResources.push({obj: resource, file: false});
        }
        if (resource.contentType.indexOf("image/") == 0) {
            imgResources.push({obj: resource, file: false});
        }
        if (resource.contentType.indexOf("application/x-font-") == 0) {
            fontResources.push({obj: resource, file: false});
        }
    }
});

// based on http://docs.casperjs.org/en/latest/modules/casper.html#download
casper.loadResource = function loadResource(url, method, data) {
    "use strict";
    this.checkStarted();
    var cu = require('clientutils').create(utils.mergeObjects({}, this.options));
    return cu.decode(this.base64encode(url, method, data));
};


function escapeRegExp(string) {
    // from https://stackoverflow.com/a/1144788/1816580
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(find, replace, str) {
    // from https://stackoverflow.com/a/1144788/1816580
    return str.replace(find, replace);
}

var wrapFunctions = [
    function wrapQuot1(s){
        return '"' + s + '"';
    },
    function wrapQuot2(s){
        return "'" + s + "'";
    },
    function csswrap(s){
        return '(' + s + ')';
    }
];

function findAndReplace(doc, resources, resourcesReplacer) {
    // change page on the fly
    resources.forEach(function(resource){
        var url = resource.obj.url;

        // don't download again
        if (!resource.file) {
            // set random filename and download it **or** call further processing which in turn will load ans write to disk
            resource.file = resourceDirectory+"/"+Math.random().toString(36).slice(2)+"."+mimetype.ext[resource.obj.contentType];
            if (typeof resourcesReplacer != "function") {
                if (debug) casper.echo("download resource (" + resource.obj.contentType + "): " + url + " to " + resource.file);
                casper.download(url, resource.file, "GET");
            } else {
                resourcesReplacer(resource);
            }
        }

        wrapFunctions.forEach(function(wrap){
            // test the resource url (growing from the back) with a string in the document
            var lastURL;
            var lastRegExp;
            var subURL;
            // min length is 4 characters
            for(var i = 0; i < url.length-5; i++) {
                subURL = url.substring(i);
                lastRegExp = new RegExp(escapeRegExp(wrap(subURL)), "g");
                if (doc.match(lastRegExp)) {
                    lastURL = subURL;
                    break;
                }
            }
            if (lastURL) {
                if (debug) casper.echo("replace " + lastURL + " with " + resource.file);
                doc = replaceAll(lastRegExp, wrap(resource.file), doc);
            }
        });
    });
    return doc;
}

function capturePage(){

    // remove all <script> and <base> tags
    this.evaluate(function(){
        Array.prototype.forEach.call(document.querySelectorAll("script"), function(scr){
            scr.parentNode.removeChild(scr);
        });
        Array.prototype.forEach.call(document.querySelectorAll("base"), function(scr){
            scr.parentNode.removeChild(scr);
        });
    });

    // TODO: remove all event handlers in html

    var page = this.getHTML();
    page = findAndReplace(page, imgResources);
    page = findAndReplace(page, cssResources, function(cssResource){
        var css = casper.loadResource(cssResource.obj.url, "GET");
        css = findAndReplace(css, imgResources);
        css = findAndReplace(css, fontResources);
        fs.write(cssResource.file, css, "wb");
    });
    fs.write("static/page.html", page, "wb");
}

casper.start("https://local.homeagain.com/").wait(3000).then(capturePage).run(function(){
    this.echo("DONE");
    this.exit();
});
