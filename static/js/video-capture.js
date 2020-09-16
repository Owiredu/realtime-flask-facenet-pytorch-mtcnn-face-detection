/**
 * THIS SECTION HANDLES THE VIDEO CAPTURE, TRANSMISSION TO SERVER FOR PROCESSING AND RETURNING THE PROCESSED FRAMES.
 * THIS INCLUDES PAUSING AND PLAYING THE VIDEO STREAM, SELECTING AND SWITCHING CAMERAS.
 */

let namespace = "/capture";
let videoElement = document.querySelector('#videoElement');
let videoSelect = document.querySelector('select#videoSource');
let selectors = [videoSelect];
let canvas = document.querySelector("#canvasElement");
let ctx = canvas.getContext('2d');

var localMediaStream = null;
var isStreaming = false;

var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + namespace);

// socket.on('connect', function() {
//   document.querySelector("#conn-status").textContent = "Connected!";
// });

function init() {
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + namespace);

  // socket.on('connect', function() {
  //   document.querySelector("#conn-status").textContent = "Connected!";
  // });
}

function sendSnapshot() {
  if (!localMediaStream && !isStreaming) {
    return;
  }

  ctx.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight, 0, 0, 300, 150);

  let dataURL = canvas.toDataURL('image/jpeg');
  socket.emit('input_image', dataURL);
}

function getDevices(deviceInfos) {
  // Handles being called several times to update labels. Preserve values.
  const values = selectors.map(select => select.value);
  selectors.forEach(select => {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  });
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    const option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    } 
    // else {
    //   console.log('Some other kind of source/device: ', deviceInfo);
    // }
  }
  selectors.forEach((select, selectorIndex) => {
    if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
      select.value = values[selectorIndex];
    }
  });
}

navigator.mediaDevices.enumerateDevices().then(getDevices).catch(handleError);

function getStream(stream) {
  window.stream = stream; // make stream available to console
  videoElement.srcObject = stream;

  localMediaStream = stream;

  setInterval(function () { sendSnapshot(); }, 50);
  // Refresh button list in case labels have become available
  return navigator.mediaDevices.enumerateDevices();
}

function handleError(error) {
  console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

function start() {
  init();
  if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  }
  const videoSource = videoSelect.value;
  const constraints = {
    video: {
      deviceId: videoSource ? {exact: videoSource} : undefined,
    }
  };
  navigator.mediaDevices.getUserMedia(constraints).then(getStream).then(getDevices).catch(handleError);
}

function startStream() {
  videoElement.setAttribute('poster', "");
  videoElement.load();
  videoElement.play();
  start();
  isStreaming = true;
}

function startStreamOnCameraChange() {
  if (isStreaming) {
    startStream();
  }
}

function stopStream() {
  videoElement.pause();

  stream.getTracks().forEach(function(track) {
    track.stop();
  });

  localMediaStream = null;
  isStreaming = false;

  videoElement.setAttribute('poster', "/static/images/default_img.jpg");
  videoElement.load();
}

function closeSocket() {
  socket.disconnect();
}

videoSelect.onchange = startStreamOnCameraChange;


/**
 * THIS SECTION HANDLES HANDLES OTHER FUNCTIONS
 */

 function takeSnapshot() {

   if (!localMediaStream && !isStreaming) {
     return;
   }

   $.ajax({
    url: "/take_snapshot",

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
      swal.fire({
        "title": "", 
        "text": res.message, 
        "type": "success",
        "confirmButtonText": 'OK',
        "confirmButtonClass": "btn btn-brand btn-sm btn-bold"
      });
    }
  });
 }

 
 function saveVideo(caller) {
  
  //  if (!localMediaStream && !isStreaming) {
  //    return;
  //  }

   let saveStatus = "0";
   saveVideoBtn = document.querySelector("#saveVideoBtn");
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
    url: "/save_video/" + saveStatus,

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


 function facialRecognition() {
  swal.fire({
    "title": "",
    "text": "Facial recognition", 
    "type": "success",
    "confirmButtonText": 'OK',
    "confirmButtonClass": "btn btn-brand btn-sm btn-bold"
  });
 }


 function motionDetection() {
  swal.fire({
    "title": "",
    "text": "Motion detection", 
    "type": "success",
    "confirmButtonText": 'OK',
    "confirmButtonClass": "btn btn-brand btn-sm btn-bold"
  });
 }