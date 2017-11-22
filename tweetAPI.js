var keys = require("./keys.js");
var Twitter = require("twitter");
var request = require('request');
var firebase = require("firebase");


//this stuff makes firebase work
var config = {
  apiKey: "AIzaSyBjKZrsmDN27Nyh9NyuXgZiyOduGO0Lo7k",
  authDomain: "picaorb-73861.firebaseapp.com",
  databaseURL: "https://picaorb-73861.firebaseio.com",
  projectId: "picaorb-73861",
  storageBucket: "picaorb-73861.appspot.com",
  messagingSenderId: "149972153718"
};

firebase.initializeApp(config);
var database = firebase.database();
const dbRefRoot = firebase.database().ref();

let client = new Twitter(process.env.keys || keys);
// console.log("keys",keys)
let stream = client.stream('statuses/filter', {track: '@picaorb'});

stream.on('data', function(event) {
  console.log(`received: ${event.text}\n`);
  funcTweets();
    function funcTweets () {
      for (var i = 0; i < event.length; i++) {
        var screenName = event[i].user.screen_name;
        var tweetID = event[i].id_str;
        console.log("-------------------");
        console.log("Screen Name: " + screenName);
        console.log("Tweet ID: " + tweetID);
        var eeMedia = event[i].extended_entities.media;
        var imageA = eeMedia[0].media_url;
        var imageB = eeMedia[1].media_url;
        console.log("Image A: " + imageA);
        console.log("Image B: " + imageB);
        //writes the relevant data from a new tweet to the database
        var tweetsRef = firebase.database().ref("tweets");
        function newTweet(screenName, tweetID, imageA, imageB) {
          tweetsRef.child(tweetID).set({
            screenName:screenName,
            tweetID:tweetID,
            imageA:imageA,
            imageB:imageB
          });
        };
        newTweet(screenName, tweetID, imageA, imageB);
      };
    };
});
