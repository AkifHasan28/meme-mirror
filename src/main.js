import './style.css';

// Grab the elements from index.html so we can control them
const video = document.getElementById('webcam');
const startBtn = document.getElementById('start-btn');
const statusText = document.getElementById('status');

async function startCamera() {
  try {
    // Ask the browser for camera access (this triggers the permission popup)
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720 },
      audio: false,
    });

    // Plug the live camera stream into the <video> element
    video.srcObject = stream;
    await video.play();

    statusText.textContent = 'Camera on!';
    startBtn.hidden = true;
  } catch (err) {
    // Runs if you click "Block", or if no camera is found
    console.error(err);
    statusText.textContent = `Couldn't access camera: ${err.name}`;
  }
}

startBtn.addEventListener('click', startCamera);