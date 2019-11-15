'use strict';
var fs = require('fs');
var Crawler = require("crawler");
var htmlparser2 = require("htmlparser2");
var c = new Crawler();

var parser = new htmlparser2.Parser(
    {
        ontext(text) {
            if(/^\s*$/.test(text)) {}
            else
            {
                console.log(text);
            }
        }
    },
    { decodeEntities: true }
);



exports.handler = function(event, context, callback){
    c.direct({
        uri: 'https://www.hipsterconsulting.com',
        skipEventRequest: false, // default to true, direct requests won't trigger Event:'request'
        callback: function(error, response) {
            if(error) {
                console.log(error)
            } else {
                parser.write(response.body);
                parser.end();
            }
            callback(null, "Done");
        }
    });
};
