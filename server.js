let express = require('express');
let bodyParser = require('body-parser');
let path = require('path');
let Twitter = require('twitter');
let keys = require('./keys.js');
let firebase = require('firebase');

let app = express();
let PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
// ___________________________________


// Initialize Firebase
var config = {
  apiKey: "AIzaSyAgyDSwIZzynPdq5OvN1pVTbg60D67U91g",
  authDomain: "picaorb-project2.firebaseapp.com",
  databaseURL: "https://picaorb-project2.firebaseio.com",
  projectId: "picaorb-project2",
  storageBucket: "picaorb-project2.appspot.com",
  messagingSenderId: "1007298219380"
};
firebase.initializeApp(config);
let database = firebase.database();





// start twitter stream
let client = new Twitter(process.env.keys || keys);
let stream = client.stream('statuses/filter', {track: '@picaorb'});
stream.on('data', function(event) {
  // add tweet to firebase
  firebase.database().ref(event.id_str).set(event);

  console.log(`received: ${event.text}\n`);

  //reply to received tweet
  client.post('statuses/update', {
    //assemble reply message
    status: `@${event.user.screen_name} http://tbd.com/${event.id_str}`,

    in_reply_to_status_id: event.id_str,
    in_reply_to_status_id_str: event.id_str,
    in_reply_to_user_id: event.user.id,
    in_reply_to_user_id_str: event.user.id_str,
    in_reply_to_screen_name: event.user.screen_name,


    },  function(error, tweet, response) {
    if(error) {console.log(error)};

    console.log(`reply: ${tweet.text}\n`);

  });
});

stream.on('error', function(error) {
  throw error;
});





// root route
// app.get('/', function(req, res) {
//   res.sendFile(path.join(__dirname, '/index.html'));
// });

// api route
// app.post('/api', function(req, res) {
//   console.log(req.body);
// });



// ___________________________________
app.listen(PORT, function() {
  console.log(`App is listening on port ${PORT}\n`);
});
