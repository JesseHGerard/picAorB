let express = require('express');
let bodyParser = require('body-parser');
let path = require('path');
let Twitter = require('twitter');
let keys = require('./keys.js');

let app = express();
let PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
// ___________________________________


// start twitter stream
let client = new Twitter(process.env.keys || keys);
let stream = client.stream('statuses/filter', {track: '@picaorb'});
stream.on('data', function(event) {
  console.log(`received: ${event.text}\n`);

  //reply to received tweet
  client.post('statuses/update', {
    //assemble reply message
    status: `@${event.user.screen_name}`,

    in_reply_to_status_id: event.id_str,
    in_reply_to_status_id_str: event.id_str,
    in_reply_to_user_id: event.user.id,
    in_reply_to_user_id_str: event.user.id_str,
    in_reply_to_screen_name: event.user.screen_name,
    //two lines below throw an error
    entities: {media: event.entities.media},
    extended_entities: {media: event.extended_entities.media},


    },  function(error, tweet, response) {
    if(error) {console.log(error)};

    console.log(`reply: ${tweet.text}\n`);

  });
});

stream.on('error', function(error) {
  throw error;
});

// posts tweet to @picaorb account, takes any string as argument
const postTweet = () => {
  client.post('statuses/update', {status: 'hello there'},  function(error, tweet, response) {
    if(error) throw error;
    //console.log(`posted tweet: ${message}`);
    console.log(tweet);

  });
};





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
