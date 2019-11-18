'use strict';
var fs = require('fs');
var Crawler = require("crawler");
var htmlparser2 = require("htmlparser2");
var AWS = require('aws-sdk');

var c = new Crawler();
var pageContents = "";
var forceCrawl = "false";

var parser = new htmlparser2.Parser(
    {
        ontext(text) {
            if(/^\s*$/.test(text)) {}
            else
            {
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

    if(event && event.queryStringParameters && event.queryStringParameters.force)
    {
        forceCrawl = event.queryStringParameters.force;
    }
    
    c.direct({
        uri: 'https://aws.amazon.com/service-terms/',
        timeout: 1500000,
        skipEventRequest: false, 
        callback: function(error, response) {
            
            if(error) {
                console.log(error)
                callback(null, {
                      "statusCode": 200,
                      "isBase64Encoded": false,
                      "body": JSON.stringify({
                        "status": "Success",
                        "message": error
                    })
                });
            } else {
                var curdate = new Date(response.headers["last-modified"]);
                if(new Date().toDateString() === curdate.toDateString() || forceCrawl === "true")
                {
                    console.log("Document Has Changed");
                    parser.write(response.$('main').text());
                    parser.end();
                    putObjectToS3("page-scrape-data","aws-docs/termsofservice.txt", pageContents, callback);
                }
                else
                {
                    console.log("No Changes To Page. Last Modified: " + curdate.toDateString());
                    callback(null, {
                        "statusCode": 200,
                        "isBase64Encoded": false,
                        "body": JSON.stringify({
                            "status": "Success",
                            "message": "No Changes to Site"
                        })
                    });
                }
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
          callback(null, {
              "statusCode": 200,
              "isBase64Encoded": false,
              "body": JSON.stringify({
                "status": "Success",
                "message": "Fuction Compled Successfully"
              })
            });
        });
}
