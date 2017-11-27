let fs = require('fs');
let express = require('express');
let bodyParser = require('body-parser');
let path = require('path');

let firebase = require('firebase');

let app = express();
let PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static('public/js'));
app.use(express.static('public/images'));
app.use(express.static('public/css'));

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
    if (error) {
      console.log(`${error.status}\ntrying again in 3 seconds`);
      setTimeout(function(){
        startTwitterStream();
      }, 3000);
    };
  });
};

let Twitter = require('twitter');
let keys;
let client;
// if(fs.existsSync('./keys.js')){
//   keys = require('./keys.js');
//   client= new Twitter(keys);
//   startTwitterStream();
// }
// else {
//   client= new Twitter({
//     consumer_key: process.env.consumer_key,
//     consumer_secret: process.env.consumer_secret,
//     access_token_key: process.env.access_token_key,
//     access_token_secret: process.env.access_token_secret
//   });
  startTwitterStream();
// };




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


// stores active poll data
let activePollsDataLocal = [];
// stores active poll id
let activePollsPropsLocal = [];

const getActivePollsFromFirebase = () => {
  firebase.database().ref(`activePolls`).once('value', function(data) {
    let pollData = data.val();
    let tempData = [];
    let tempProps = [];
    // make polls into an array
    for (index in pollData){
      tempData.push(pollData[index]);
      tempProps.push(index);
    };
    activePollsDataLocal = tempData;
    activePollsPropsLocal = tempProps;
  });

};







// root route
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

// aorb route
app.get('/aorb', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/aorb.html'));
});

// submit route
app.get('/submit', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/submit.html'));
});


// poll route, path will be to tweet id_str as stored in firebase
app.get('/poll/*', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/polls.html'));
  getActivePollsFromFirebase();
});

// get active poll ids
app.get('/get-active-polls-array', function(req, res) {
  res.send(activePollsPropsLocal);
});








// ___________________________________
app.listen(PORT, function() {
  console.log(`App is listening on port ${PORT}\n`);
});
