# PicAorB

### [Live Website: https://picaorb.herokuapp.com](https://picaorb.herokuapp.com/poll/935597635561574400)
( or try it yourself by tweeting a question and two images to @picAorB )

created by [Jesse Gerard](http://jessegerard.com/), [DJ Joy](https://github.com/djjoyjr)

#### key libraries and tech <br>
Twitter API <br>
Node <br>
Express <br>
Firebase <br>
Heroku <br>
NPM <br>
Git / Github <br>
Anime.js <br>
jQuery <br>
SVG <br>
Javascript ES6 <br>

### about this project
'Pic A or B' is a fun way to crowd source answers to questions using twitter. A user tweets two images and a question to @picAorB, and then receives a reply with a link to their new poll question on the picAorB website. After answering a poll, a new polls to are presented.
<br><br>
Utilizing social media as a submission interface, and the large exposure that comes with it, was a key goal of the project.

### code
The animation library, anime.js, was key to presenting a simple yet communicative [single-page app interface](#poll-data-animation). [Twitter](#twitter-bot) provided a robust submission mechanism for new data.


#### twitter-bot
New messages stream from Twitter as they happen, allowing for rapid response of automated tweets containing custom urls to the user's content on the picAorB website, in conjunction with the new data being uploaded to the Firebase database.
<br><br>
code below is quoted from: picAorB/server.js

```
// initilaze twitter
const startTwitterStream = () => {
  // start twitter stream, recieve @picAorB mentions
  let stream = client.stream('statuses/filter', {track: '@picaorb'});
  stream.on('data', function(event) {

    console.log(`received: ${event.text}\n`);

    addPollToFirebase(event);

    replyTweetWithLink(event);
  });
};

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
```

#### poll data animation

Using callbacks provided by the anime.js library, poll data is updated on the fly to include the user's new vote, and any new votes that may have been registered in the database since the page was loaded, into the totals seemingly instantaneously. The animation was crafted to load new images at key moments to give a feeling that the new poll is a distinct experience from the last.

```
const voteAnimation = (aorb, callback) => {
  let voteImage;
  let rejectImage;
  const animate = () => {
    anime({
      targets: '#cap-text',
      opacity: [{value: 0, duration: 500, easing: 'linear'}],
    });
    // clicked / voted image animation
    anime({
      targets: `#img-${voteImage}`,
      zIndex: [{ value: 10, duration: 0}],
      translateY: [
        { value: '-=10vmin', duration: 200, easing: [.3,0,.09,1], elasticity: 1000},
        { value: '+=110vmin', duration: 300, easing: [.22,.01,1,.19], elasticity: 1000} ],
      scale: [
        { value: 1.5, duration: 200, easing: [.3,0,.09,1], elasticity: 1000},
        { value: 1, duration: 300, delay: 200}],
    });
    // not clicked / recjected image animation
    anime({
      targets: `#img-${rejectImage}`,
      zIndex: [{ value: 9, duration: 0}],
      translateY: [
        { value: '-=10vmin', duration: 200, delay: 200, easing: [.3,0,.09,1], elasticity: 1000},
        { value: '+=110vmin', duration: 300, easing: [.22,.01,1,.19], elasticity: 1000} ],
      scale: [
        { value: .75, duration: 200, delay: 200, easing: [.3,0,.09,1], elasticity: 1000},
        { value: 1, duration: 200, delay: 300}],
    }).finished.then(callback);
  };

  if (aorb == 'a' || aorb == 'A') {
    voteImage = 'a';
    rejectImage = 'b';
    animate();
  } else {
    voteImage = 'b';
    rejectImage = 'a';
    animate();
  };
};

const newImageAnimation = () => {
  anime({
    targets: '#cap-text',
    opacity: [{value: 1, delay: 1800, duration: 1000, easing: 'linear'}],
  });
  anime({
    targets: `#img-a`,
    translateX: [
      {value:'-=150vmin', delay: 1000, duration: 0, elasticity: 0},
      {value: '+=150vmin', duration: 1500, easing: 'easeOutElastic', elasticity: 1} ],
    translateY: [
      {value: '-=100vmin', delay: 1000, duration: 0, elasticity: 0 }, ]
  });
  anime({
    targets: `#img-b`,
    translateX: [
      {value:'+=150vmin', duration: 0, delay: 1000, elasticity: 0},
      {value: '-=150vmin', duration: 1500, delay: 150, easing: 'easeOutElastic', elasticity: 1} ],
    translateY: [
      {value: '-=100vmin', delay: 1000, duration: 0, elasticity: 0 }, ],
    complete: ()=>{
      addPollImageListeners();
      updateVotePercentages();
    }
  });
};
```
