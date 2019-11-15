'use strict';
var fs = require('fs');
var Crawler = require("crawler");
var htmlparser2 = require("htmlparser2");
var AWS = require('aws-sdk');

var c = new Crawler();
var pageContents = "";

var parser = new htmlparser2.Parser(
    {
        ontext(text) {
            if(/^\s*$/.test(text)) {}
            else
            {
                //console.log(text);
                pageContents = pageContents + text;
            }
        }
    },
    { 
        decodeEntities: true,
        xmlMode: true,
        recognizeSelfClosing: true
    }
);



exports.handler = function(event, context, callback){
    c.direct({
        uri: 'https://aws.amazon.com/service-terms/',
        skipEventRequest: false, // default to true, direct requests won't trigger Event:'request'
        callback: function(error, response) {
            if(error) {
                console.log(error)
            } else {
                console.log(response);
                parser.write(response.body);
                parser.end();
                putObjectToS3("page-scrape-data","test/termsofservice.txt", pageContents, callback);
            }
            
        }
    });
};

function putObjectToS3(bucket, key, data, callback){
    var s3 = new AWS.S3();
        var params = {
            Bucket : bucket,
            Key : key,
            Body : data
        }
        s3.putObject(params, function(err, data) {
          if (err) console.log(err, err.stack); // an error occurred
          else     console.log(data);           // successful response
          callback(null, "Done");
        });
}
