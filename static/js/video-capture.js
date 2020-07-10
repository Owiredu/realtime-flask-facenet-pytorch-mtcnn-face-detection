$(document).ready(function(){
  let namespace = "/capture";
  let videoElement = document.querySelector('#videoElement');
  let videoSelect = document.querySelector('select#videoSource');
  let selectors = [videoSelect];
  let canvas = document.querySelector("#canvasElement");
  let ctx = canvas.getContext('2d');

  localMediaStream = null;

  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + namespace);
  console.log(socket);

  function sendSnapshot() {
    if (!localMediaStream) {
      return;
    }

    ctx.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight, 0, 0, 300, 150);

    let dataURL = canvas.toDataURL('image/jpeg');
    socket.emit('input_image', dataURL);
  }

  socket.on('connect', function() {
    console.log('Connected!');
  });

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
      } else {
        console.log('Some other kind of source/device: ', deviceInfo);
      }
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
    if (window.stream) {
      window.stream.getTracks().forEach(track => {
        track.stop();
      });
    }
    const videoSource = videoSelect.value;
    const constraints = {
      video: {
        deviceId: videoSource ? {exact: videoSource} : undefined, 
        width: { min: 640 }, height: { min: 480 }
      }
    };
    navigator.mediaDevices.getUserMedia(constraints).then(getStream).then(getDevices).catch(handleError);
  }

  videoSelect.onchange = start;

  start();

});
