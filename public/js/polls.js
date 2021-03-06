// "ID" wiLL always refer to the poll or twitter "ID" in the form of a string, not an integer. Using integers will cause munging errors due to length. property 'id_str' is used, not 'id'

// stores data
let currentPollData;
let activePollsIdsArray;
let viewedPolls = [];

const colors = {
  _bright: ['#e500a3', '#00ffff', '#c21690', '#e5b600', '#66ffff', '#f0d366', '#f066c8', '#2decec'],
  get bright() {
    return this._bright[Math.floor(Math.random() * this._bright.length)];
  },
};

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
  // increment local variable for display
  currentPollData.pic[`vote${aOrB}`]++;
  currentPollData.pic[`voteTotal`]++;
  updateVotePercentages();

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

const updateVotePercentages = () => {
  let perA = Math.round((currentPollData.pic.voteA * 100) / currentPollData.pic.voteTotal);

  $('#per-a').text(`${perA}%`);
  $('#per-b').text(`${100 - perA}%`);

  $('#cir-a .big').css('fill', colors.bright).attr('r', `${perA}`);
  $('#cir-b .big').css('fill', colors.bright).attr('r', `${100 - perA}`);
};

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

const getPollFromFirebase = (pollId) => {
  // get tweet id from path, search firebase for id
  firebase.database().ref(`activePolls/${pollId}`).once('value', function(data) {
    // data.val() shows value of firebase entry, not just firebase object properties
    currentPollData = data.val();
    viewedPolls.push(pollId);

    // add poll images to page
    $('#img-a').css(`background-image`, `url("${currentPollData.extended_entities.media[0].media_url_https}")`);
    $('#img-b').css(`background-image`,  `url("${currentPollData.extended_entities.media[1].media_url_https}")`);

    // add poll text
    $('#cap-text').text(groomText());

    // add profile image
    let profileUrl = currentPollData.user.profile_background_image_url_https;
    if (profileUrl == '') {
      $('#profile-pic').css("background-image", "");
      $('#profile-pic').css("background-color", colors.bright);
    } else {
      $('#profile-pic').css(`background-image`, `url("${profileUrl}")`);
    };

    // change url
    history.pushState({}, "pic A or B", `/poll/${pollId}`);

    // code below fixes issue when polls are submitted via web form
    if (currentPollData.id_str === '' || currentPollData.id_str === undefined) {
      firebase.database().ref(`activePolls/${pollId}/id_str`).transaction(function() {
       return pollId;
      });
      currentPollData.id_str = pollId;
    };
  });
};

const addPollImageListeners = () => {
  // add event listener on click to vote
  $('#img-a').on('click', ()=>{
    $('#img-a').off('click');
    $('#img-b').off('click');
    incrementFirebaseVote('A');
    voteAnimation('A', ()=>{
      getPollFromFirebase(getRandomActivePollsId());
      newImageAnimation();
    });
  });
  $('#img-b').on('click', ()=>{
    $('#img-a').off('click');
    $('#img-b').off('click');
    incrementFirebaseVote('B');
    voteAnimation('B', ()=>{
      getPollFromFirebase(getRandomActivePollsId());
      newImageAnimation();
    });
  });
};

const getActivePollsIdsArray = () => {
  $.get(`${window.location.origin}/get-active-polls-array`, function(data, status) {
    activePollsIdsArray = data;
  });
};

const getRandomActivePollsId = () => {
  const makeRando = () => {
    let randoIndex = Math.floor(Math.random() * activePollsIdsArray.length);
    let randoId = activePollsIdsArray[randoIndex];
    activePollsIdsArray.splice(randoIndex, 1);
    return randoId;
  };
  if (activePollsIdsArray.length <= 1){
    getActivePollsIdsArray();
    return makeRando();
  } else {
    return makeRando();
  };
};




$(document).ready(function() {
  getPollFromFirebase(getPollIdFromUrl());
  getActivePollsIdsArray();
  addPollImageListeners();
});
