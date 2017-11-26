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

const getPollFromFirebase = (pollId) => {
  // get tweet id from path, search firebase for id
  firebase.database().ref(`activePolls/${pollId}`).once('value', function(data) {
    // data.val() shows value of firebase entry, not just firebase object properties
    currentPollData = data.val();
    viewedPolls.push(pollId);

    $('#a').attr('src', currentPollData.extended_entities.media[0].media_url_https);
    $('#b').attr('src', currentPollData.extended_entities.media[1].media_url_https);

    $('#a').on('click', function() {
      incrementFirebaseVote('A');
      getPollFromFirebase(getRandomActivePollsId());
    });
    $('#b').on('click', function(){
      incrementFirebaseVote('B');
      getPollFromFirebase(getRandomActivePollsId());
    });
  });
};

const getActivePollsIdsArray = () => {
  $.get(`${window.location.origin}/get-active-polls-array`, function(data, status) {
    activePollsIdsArray = data;
  });
};

const getRandomActivePollsId = () => {
  let randoId activePollsIdsArray[Math.floor(Math.random() * activePollsIdsArray.length)];
  if (viewedPolls.length)
  if (!viewedPolls.includes(randoId)) {
    return randoId
  } else {
    getRandomActivePollsId
  };
};


$(document).ready(function() {
  getPollFromFirebase(getPollIdFromUrl());



  getActivePollsIdsArray();

});
