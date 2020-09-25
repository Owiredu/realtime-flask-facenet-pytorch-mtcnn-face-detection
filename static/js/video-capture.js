//#####################################################################################################################
//# THIS SECTION HANDLES THE VIDEO CAPTURE, TRANSMISSION TO SERVER FOR PROCESSING AND RETURNING THE PROCESSED FRAMES. #
//# THIS INCLUDES PAUSING AND PLAYING THE VIDEO STREAM, SELECTING AND SWITCHING CAMERAS.                              #
//#####################################################################################################################


let namespace = "/capture";
var currentFeedId = "";

var localMediaStream = {};
var isStreaming = {};

var allVideoFeedIds = []; // contains all the video ids
var maxAllowedVideoFeeds = 4;  // specifies the maximum video streams that will allowed in a single session/tab

var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + namespace);

// socket.on('connect', function() {
//   document.querySelector("#conn-status").textContent = "Connected!";
// });

function init() {
  /**
   * Opens a socket connection to the server
   */
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + namespace);

  // socket.on('connect', function() {
  //   document.querySelector("#conn-status").textContent = "Connected!";
  // });
}

function sendFrame(feedId) {
  /**
   * Sends a captured frame to the server
   */
  if (!localMediaStream[feedId] && !isStreaming[feedId]) {
    return;
  }

  let videoElement = document.querySelector('#videoElement' + feedId);
  let canvas = document.querySelector("#canvasElement" + feedId);
  canvas.getContext('2d').drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight, 0, 0, 300, 150); // drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight, 0, 0, 300, 150)

  let dataURL = canvas.toDataURL('image/jpeg');
  socket.emit('input_image', [feedId, dataURL]);
}

function getDevices(deviceInfos) {
  /**
   * Gets all the connected video devices
   */
  // Handles being called several times to update labels. Preserve values.
  const values = [document.querySelector('select#videoSource' + currentFeedId)].map(select => select.value);
  [document.querySelector('select#videoSource' + currentFeedId)].forEach(select => {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  });
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    const option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || `camera ${document.querySelector('select#videoSource' + currentFeedId).length + 1}`;
      document.querySelector('select#videoSource' + currentFeedId).appendChild(option);
    }
    // else {
    //   console.log('Some other kind of source/device: ', deviceInfo);
    // }
  }
  [document.querySelector('select#videoSource' + currentFeedId)].forEach((select, selectorIndex) => {
    if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
      select.value = values[selectorIndex];
    }
  });
}

navigator.mediaDevices.enumerateDevices().then(getDevices).catch(handleError);

function getStream(stream) {
  /**
   * Makes the video stream available to the browser window and the video element.
   * Also refreshes the devices in the select widget.
   */
  window.stream = stream; // make stream available to console
  document.querySelector('#videoElement' + currentFeedId).srcObject = stream;

  localMediaStream[currentFeedId] = stream;

  setInterval(function () { sendFrame(currentFeedId); }, 50);
  // Refresh button list in case labels have become available
  return navigator.mediaDevices.enumerateDevices();
}

function handleError(error) {
  // console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

function start(feedId) {
  /**
   * Setup the media device and the video parameters, stop the any streams that are running
   * and begin streaming
   */
  currentFeedId = feedId;
  init();
  if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  }
  const videoSource = document.querySelector('select#videoSource' + feedId).value;
  const constraints = {
    video: {
      deviceId: videoSource ? {exact: videoSource} : undefined,
    }
  };
  navigator.mediaDevices.getUserMedia(constraints).then(getStream).then(getDevices).catch(handleError);
}

function startStream(feedId) {
  /**
   * Starts streaming video from the selected source
   */
  currentFeedId = feedId;
  let videoElement = document.querySelector('#videoElement' + feedId);
  videoElement.setAttribute('poster', "");
  videoElement.load();
  videoElement.play();
  start(feedId);
  isStreaming = true;
}

function startStreamOnCameraChange(feedId) {
  /**
   * Start streaming a video when the camera is changed
   */
  if (isStreaming) {
    startStream(feedId);
  }
}

function stopStream(feedId) {
  /**
   * Stops streaming the video
   */
  currentFeedId = feedId;
  let videoElement = document.querySelector('#videoElement' + feedId)
  videoElement.pause();

  if (window.stream) {
    window.stream.getTracks().forEach(function(track) {
      track.stop();
    });
  }

  localMediaStream[feedId] = null;
  isStreaming[feedId] = false;

  videoElement.setAttribute('poster', "/static/images/default_img.jpg");
  videoElement.load();
}

function closeSocket() {
  /**
   * Disconnects or closes the socket
   */
  socket.disconnect();
}

// automatically start new camera after selecting it
// document.querySelector('select#videoSource').onchange = startStreamOnCameraChange;


//################################################
//# THIS SECTION HANDLES OTHER FUNCTIONS         #
//################################################


/* Adds Element BEFORE NeighborElement */
Element.prototype.appendBefore = function (element) {
  element.parentNode.insertBefore(this, element);
}, false;

/* Adds Element AFTER NeighborElement */
Element.prototype.appendAfter = function (element) {
  element.parentNode.insertBefore(this, element.nextSibling);
}, false;


function getRandomString() {
  /**
   * Returns a random string of length 7 to be appended to the feed index.
   * This is to ensure that the feed is always unique.
   */
  let length = 20;
  let result = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


function getNewVideoFeed() {
  /**
   * Creates a new video feed element and returns the new element along with 
   * the id of the previous element
   */
  // get number of video feeds
  let numOfVideoElements = allVideoFeedIds.length;
  // check if maximum number of video streams has been reached
  if (numOfVideoElements >= maxAllowedVideoFeeds) {
      return [];
  }
  // get the already taken indices
  let alreadyTakenFeedIndices = [];
  for (let i = 0; i < numOfVideoElements; i++) {
    let id = allVideoFeedIds[i];
    alreadyTakenFeedIndices.push(parseInt(id[id.length - 1]));
  }
  // get the new video feed
  let newVideoFeedIndex = numOfVideoElements.toString();
  for (let i = 0; i < maxAllowedVideoFeeds; i++) {
    if (!alreadyTakenFeedIndices.includes(i)) {
      newVideoFeedIndex = i.toString();
      break;
    }
  }
  let uniqueVideoElementId = getRandomString() + newVideoFeedIndex;
  let newVideoElementId = "video_feed_" + uniqueVideoElementId;
  // create the new video feed element
  let newVideoFeedElement = document.createElement("div");
  newVideoFeedElement.id = newVideoElementId + "_parent";
  let newVideoElementHtml = `<div id="` + newVideoElementId + `" class="card-group container row">
        
                              <div class="card col-sm-6" style="margin: 20px;">
                                  <div class="card-header">
                                      <h4 class="card-title text-center">INPUT STREAM</h4>
                                  </div>

                                  <video id="videoElement` + uniqueVideoElementId + `" playsinline autoplay class="w-100 d-block" poster="/static/images/default_img.jpg"></video>

                                  <div class="card-body centered-div">
                                      <!-- <label for="videoSource` + uniqueVideoElementId + `" class="bg-white border-white">Video source: </label> -->
                                      <div class="select">
                                          <select id="videoSource` + uniqueVideoElementId + `"></select>
                                      </div>
                                  </div>

                                  <div class="card-footer centered-div">
                                      <div class="centered-div">
                                          <span class="stream_controls_icons"><i class="btn-primary btn fa fa-play fa-lg" id="startVideoBtn` + uniqueVideoElementId + `" title="Start camera"></i></span>
                                          <span class="stream_controls_icons"><i class="btn-primary btn fa fa-stop fa-lg" id="stopVideoBtn` + uniqueVideoElementId + `" title="Stop camera"></i></span>
                                          <span class="stream_controls_icons"><i class="btn-primary btn fa fa-camera fa-lg" id="takeSnapshotBtn` + uniqueVideoElementId + `" title="Take snapshot"></i></span> 
                                          <span class="stream_controls_icons"><i class="btn-primary btn fa fa-floppy-o fa-lg" id="saveVideoBtn` + uniqueVideoElementId + `" title="Start saving video"></i></span>
                                          <span class="stream_controls_icons"><i class="btn-primary btn fa fa-smile-o fa-lg" id="facialRecognitionBtn` + uniqueVideoElementId + `" title="Activate facial recognition"></i></span>
                                          <span class="stream_controls_icons"><i class="btn-primary btn fa fa-wheelchair-alt fa-lg" id="motionDetectionBtn` + uniqueVideoElementId + `" title="Activate motion detection"></i></span> 
                                          <span class="stream_controls_icons"><i class="btn-primary btn fa fa-trash fa-lg" id="deleteVideoBtn` + uniqueVideoElementId + `" title="Delete Stream"></i></span>
                                      </div>
                                  </div>
                              </div>


                              <div class="card col-sm-6" style="margin: 20px;">
                                  <div class="card-header text-center">
                                      <h4 class="card-title">OUTPUT STREAM</h4>
                                  </div>
                                  
                                  <img id="imageElement` + uniqueVideoElementId + `" src="/video_feed_` + newVideoFeedIndex + `/` + uniqueVideoElementId + `" class="w-100 d-block">
                                  <canvas id="canvasElement` + uniqueVideoElementId + `" style="display: none;"></canvas>

                                  <div class="card-body centered-div">
                                      <p id="conn-status-` + uniqueVideoElementId + `"></p>
                                  </div>
                              </div>

                            </div>`;
  newVideoFeedElement.innerHTML = newVideoElementHtml;
  // load the devices connected
  currentFeedId = uniqueVideoElementId;
  navigator.mediaDevices.enumerateDevices().then(getDevices).catch(handleError);
  // update the localMediaStream and isStreaming objects
  localMediaStream[uniqueVideoElementId] = null;
  isStreaming[uniqueVideoElementId] = false;
  // add id to the video feed ids array
  allVideoFeedIds.push(uniqueVideoElementId);
  // return the previous video feed element id and the new video feed element
  return [newVideoFeedElement, uniqueVideoElementId];
}


function insertNewVideoFeed() {
  /**
   * Inserts the new video feed right under the main videos menu
   */
  let newVideoFeedElementData = getNewVideoFeed();
  if (newVideoFeedElementData.length === 0) {
    swal.fire({
      "title": "",
      "text": "Maximum number of streams (" + maxAllowedVideoFeeds.toString() + ") reached", 
      "type": "error",
      "confirmButtonText": 'OK',
      "confirmButtonClass": "btn btn-brand btn-sm btn-bold"
    });

    return;
  }
  let newVideoFeedElement = newVideoFeedElementData[0];
  let uniqueVideoElementId = newVideoFeedElementData[1];
  newVideoFeedElement.appendAfter(document.querySelector("#main_video_feed_menu"));
  // add event listeners to the buttons of the video stream
  document.querySelector("#startVideoBtn" + uniqueVideoElementId).addEventListener("click", function() {startStream(uniqueVideoElementId);}, false);
  document.querySelector("#stopVideoBtn" + uniqueVideoElementId).addEventListener("click", function() {stopStream(uniqueVideoElementId);}, false);
  document.querySelector("#takeSnapshotBtn" + uniqueVideoElementId).addEventListener("click", function() {takeSnapshot(uniqueVideoElementId);}, false);
  document.querySelector("#saveVideoBtn" + uniqueVideoElementId).addEventListener("click", function() {saveVideo(uniqueVideoElementId);}, false);
  document.querySelector("#facialRecognitionBtn" + uniqueVideoElementId).addEventListener("click", function() {facialRecognition(uniqueVideoElementId);}, false);
  document.querySelector("#motionDetectionBtn" + uniqueVideoElementId).addEventListener("click", function() {motionDetection(uniqueVideoElementId);}, false);
  document.querySelector("#deleteVideoBtn" + uniqueVideoElementId).addEventListener("click", function() {removeVideoFeeds([uniqueVideoElementId]);}, false);
}


function removeVideoFeeds(videoFeedIds) {
  /**
   * Removes the nodes with their ids specified in the videoFeedIds array
   */
  for (let i = 0; i < videoFeedIds.length; i++) {
    // stop the appropriate video stream
    stopStream(videoFeedIds[i]);
    // remove the video feed
    $("#video_feed_" + videoFeedIds[i] + "_parent").remove();
    // remove the id from the all ids array
    let indexToRemove = allVideoFeedIds.indexOf(videoFeedIds[i]);
    allVideoFeedIds.splice(indexToRemove, 1);
    // remove the threads of all the deleted feeds
    removeVideoThreads(videoFeedIds);
  }
}


function removeAllVideoFeeds() {
  /**
   * Removes all the video feeds
   */
  for (let i = 0; i < allVideoFeedIds.length; i++) {
    // stop the appropriate video stream
    stopStream(allVideoFeedIds[i]);
    // remove the video feed
    $("#video_feed_" + allVideoFeedIds[i] + "_parent").remove();
  }
  // remove all threads of all the deleted feeds
  removeVideoThreads(allVideoFeedIds);
  // empty the all video feed ids array
  allVideoFeedIds.splice(0, allVideoFeedIds.length);
}


function snackbarFunc(message) {
  /**
   * Displays snackbar with message
   */
  var x = document.getElementById("snackbar");
  x.textContent = message;
  x.className = "show";
  setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}


function removeVideoThreads(videoFeedIds) {
  /**
   * Removes all video processing threads specified in the video feed ids array
   */
  $.ajax({
    url: "/remove_threads",

    data: {videoFeedIds: videoFeedIds.join("_")},

    method: "POST",

    error: function(res, err) {
    //   swal.fire({
    //     "title": "",
    //     "text": res.responseJSON.message, 
    //     "type": "error",
    //     "confirmButtonClass": "btn btn-brand btn-sm btn-bold"
    //   });
    },

    success: function(res) {
      // swal.fire({
      //   "title": "", 
      //   "text": res.message, 
      //   "type": "success",
      //   "confirmButtonText": 'OK',
      //   "confirmButtonClass": "btn btn-brand btn-sm btn-bold"
      // });
    }
  });
}


// reset all the checkable features when a page loads or reloads
$(window).bind("beforeunload", function(e) {
  e.preventDefault();
  removeAllVideoFeeds();
  removeVideoThreads(allVideoFeedIds);

  return;
});

$(window).on("close", function(e) {
  e.preventDefault();
  removeAllVideoFeeds();
  removeVideoThreads(allVideoFeedIds);

  return;
});


function takeSnapshot(feedId) {
  currentFeedId = feedId;
  /**
   * Saves the current frame that has been captured
   */
  if (!localMediaStream[feedId] && !isStreaming[feedId]) {
    return;
  }

  $.ajax({
  url: "/take_snapshot/" + feedId,

  method: "POST",

  error: function(res, err) {
    swal.fire({
      "title": "",
      "text": res.responseJSON.message, 
      "type": "error",
      "confirmButtonClass": "btn btn-brand btn-sm btn-bold"
    });
  },

  success: function(res) {
    snackbarFunc(res.message);
    // swal.fire({
    //   "title": "", 
    //   "text": res.message, 
    //   "type": "success",
    //   "confirmButtonText": 'OK',
    //   "confirmButtonClass": "btn btn-brand btn-sm btn-bold"
    // });
  }
});
}


function saveVideo(feedId) {
  /**
   * Activates video saving so that the server saves the video being captured
   */
  currentFeedId = feedId;
  if (!localMediaStream[feedId] && !isStreaming) {
    return;
  }

  let saveStatus = "0";
  saveVideoBtn = document.querySelector("#saveVideoBtn" + feedId);
  let class_attr = saveVideoBtn.getAttribute("class");

  if (class_attr.includes("btn-primary")) {
    saveStatus = "1";
    saveVideoBtn.setAttribute("class", "btn-success btn fa fa-floppy-o fa-lg");
    saveVideoBtn.setAttribute("title", "Stop saving video");
  } else {
    saveStatus = "0";
    saveVideoBtn.setAttribute("class", "btn-primary btn fa fa-floppy-o fa-lg");
    saveVideoBtn.setAttribute("title", "Start saving video");
  }

  $.ajax({
    url: "/save_video/" + saveStatus + "_" + feedId,

    method: "POST",

    error: function(res, err) {
      swal.fire({
        "title": "",
        "text": res.responseJSON.message, 
        "type": "error",
        "confirmButtonClass": "btn btn-brand btn-sm btn-bold"
      });
    },

    success: function(res) {
      snackbarFunc(res.message);
      // swal.fire({
      //   "title": "", 
      //   "text": res.message, 
      //   "type": "success",
      //   "confirmButtonText": 'OK',
      //   "confirmButtonClass": "btn btn-brand btn-sm btn-bold"
      // });
    }
  });
}

function facialRecognition(feedId) {
  /**
   * Activates facial recognition
   */
  currentFeedId = feedId;
  swal.fire({
    "title": "",
    "text": "Facial recognition", 
    "type": "success",
    "confirmButtonText": 'OK',
    "confirmButtonClass": "btn btn-brand btn-sm btn-bold"
  });
}


function motionDetection(feedId) {
  /**
   * Activates motion detection
   */
  currentFeedId = feedId;
  swal.fire({
    "title": "",
    "text": "Motion detection", 
    "type": "success",
    "confirmButtonText": 'OK',
    "confirmButtonClass": "btn btn-brand btn-sm btn-bold"
  });
}