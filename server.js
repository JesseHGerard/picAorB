let fs = require('fs');
let express = require('express');
let bodyParser = require('body-parser');
let path = require('path');

let firebase = require('firebase');

let app = express();
let PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static('public/js'))

// ___________________________________
// initilaze twitter
const startTwitterStream = () => {
  // start twitter stream, recieve @picAorB mentions
  let stream = client.stream('statuses/filter', {track: '@picaorb'});
  stream.on('data', function(event) {

    console.log(`received: ${event.text}\n`);

    addPollToFirebase(event);

    replyTweetWithLink(event);
  });

  stream.on('error', function(error) {
    throw error;
  });
};

let Twitter = require('twitter');
let keys;
let client;
if(fs.existsSync('./keys.js')){
  keys = require('./keys.js');
  client= new Twitter(keys);
  startTwitterStream();
} else {
  client= new Twitter({
    consumer_key: process.env.consumer_key,
    consumer_secret: process.env.consumer_secret,
    access_token_key: process.env.access_token_key,
    access_token_secret: process.env.access_token_secret
  });
  startTwitterStream();
};




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



const replyTweetWithLink = (event) => {

  client.post('statuses/update', {
    //assemble reply message
    status: `@${event.user.screen_name} https://picaorb.herokuapp.com/poll/${event.id_str}`,

    in_reply_to_status_id: event.id_str,
    in_reply_to_status_id_str: event.id_str,
    in_reply_to_user_id: event.user.id,
    in_reply_to_user_id_str: event.user.id_str,
    in_reply_to_screen_name: event.user.screen_name,

    },  function(error, tweet, response) {
    if(error) {console.log(error)};

    console.log(`reply: ${tweet.text}\n`);

  });
};

const addPollToFirebase = (event) => {
  let newPoll = event;
  // add picAorB info to tweet object
  newPoll.pic = {
    voteTotal: 0,
    voteA: 0,
    voteB: 0
  };

  firebase.database().ref('activePolls').child(newPoll.id_str).set(newPoll);
};

// this function is not currently used
const getPollFromFirebase = () => {
  // get tweet id from path, search firebase for id
  firebase.database().ref(`activePolls/${req.url.slice(6)}`).once('value', function(data) {
    // data.val() shows value of firebase entry, not just firebase object properties
    console.log(data.val());
  });
};







// root route
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

// poll route, path will be to tweet id_str as stored in firebase
app.get('/poll/*', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/polls.html'))
});

// api route
// app.post('/api', function(req, res) {
//   console.log(req.body);
// });








// ___________________________________
app.listen(PORT, function() {
  console.log(`App is listening on port ${PORT}\n`);
});
