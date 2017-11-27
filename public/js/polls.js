// "ID" wiLL always refer to the poll or twitter "ID" in the form of a string, not an integer. Using integers will cause munging errors due to length. property 'id_str' is used, not 'id'

// stores data
let currentPollData;
let activePollsIdsArray;
let viewedPolls = [];


// configure firebase
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

// increments a or b vote, of currentPollData id, and voteTotal, takes argument 'A' or 'B' as a string
const incrementFirebaseVote = (aOrB) => {
  firebase.database().ref(`activePolls/${currentPollData.id_str}/pic/vote${aOrB}`).transaction(function(propertyInt) {
   return propertyInt + 1;
  });
  firebase.database().ref(`activePolls/${currentPollData.id_str}/pic/voteTotal`).transaction(function(propertyInt) {
    return propertyInt + 1;
  });
};


const getPollIdFromUrl = () => {
  return window.location.pathname.slice(6);
};

const groomText = () => {
  // remove urls and whitespace from currentPollData.text
  return currentPollData.text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '')
    .replace('@picaorb', '');
};

const voteAnimation = (aorb, callback) => {
  let voteImage;
  let rejectImage;
  const animate = () => {
    // clicked / voted image animation
    anime({
      targets: `#img-${voteImage}`,
      translateY: [
        { value: '-=10vmin', duration: 200, easing: [.3,0,.09,1], elasticity: 1000},
        { value: '+=100vmin', duration: 300, easing: [.22,.01,1,.19], elasticity: 1000} ],
      scale: [
        { value: 1.5, duration: 200, easing: [.3,0,.09,1], elasticity: 1000} ],
      zIndex: [
        { value: 10 } ],
    });
    // not clicked / recjected image animation
    anime({
      targets: `#img-${rejectImage}`,
      translateY: [
        { value: '-=10vmin', duration: 200, delay: 200, easing: [.3,0,.09,1], elasticity: 1000},
        { value: '+=100vmin', duration: 300, easing: [.22,.01,1,.19], elasticity: 1000} ],
      scale: [
        { value: .75, duration: 200, delay: 200, easing: [.3,0,.09,1], elasticity: 1000} ],
      zIndex: [
        { value: 9 } ],
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

const getPollFromFirebase = (pollId) => {
  // get tweet id from path, search firebase for id
  firebase.database().ref(`activePolls/${pollId}`).once('value', function(data) {
    // data.val() shows value of firebase entry, not just firebase object properties
    currentPollData = data.val();
    viewedPolls.push(pollId);

    // add poll images to page
    $('#img-a').attr('style', `background-image: url("${currentPollData.extended_entities.media[0].media_url_https}")`);
    $('#img-b').attr('style', `background-image: url("${currentPollData.extended_entities.media[1].media_url_https}")`);

    // add event listener on click to vote
    $('#img-a').on('click', ()=>{
      voteAnimation('A', ()=>{
        console.log(currentPollData.id_str);
        incrementFirebaseVote('A');
        getPollFromFirebase(getRandomActivePollsId());
      });
    });
    $('#img-b').on('click', ()=>{
      voteAnimation('B', ()=>{
        console.log(currentPollData.id_str);
        incrementFirebaseVote('B');
        getPollFromFirebase(getRandomActivePollsId());
      });
    });

    // add poll text
    $('#cap-text').text(groomText());
  });
};

const getActivePollsIdsArray = () => {
  $.get(`${window.location.origin}/get-active-polls-array`, function(data, status) {
    activePollsIdsArray = data;
  });
};

const getRandomActivePollsId = () => {
  let randoId = activePollsIdsArray[Math.floor(Math.random() * activePollsIdsArray.length)];

  if (!viewedPolls.includes(randoId)) {
    return randoId;
  } else {
    getRandomActivePollsId();
  };
};




$(document).ready(function() {
  getPollFromFirebase(getPollIdFromUrl());



  getActivePollsIdsArray();

});
