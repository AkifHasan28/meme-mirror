import './style.css';
import { DrawingUtils, HandLandmarker, PoseLandmarker } from '@mediapipe/tasks-vision';
import { createTrackers } from './tracker.js';

const video = document.getElementById('webcam');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const drawer = new DrawingUtils(ctx);
const startBtn = document.getElementById('start-btn');
const statusText = document.getElementById('status');

let trackers = null;
let lastVideoTime = -1;

async function startCamera() {
  try {
    startBtn.disabled = true;
    statusText.textContent = 'Loading tracking models...';
    trackers = await createTrackers();

    statusText.textContent = 'Starting camera...';
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720 },
      audio: false,
    });
    video.srcObject = stream;
    await video.play();

    // Make the canvas's drawing area match the real camera resolution
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    statusText.textContent = `Tracking! (running on ${trackers.delegate})`;
    startBtn.hidden = true;
    requestAnimationFrame(loop);
  } catch (err) {
    console.error(err);
    statusText.textContent = `Something went wrong: ${err.name || err}`;
    startBtn.disabled = false;
  }
}

// Runs once per screen refresh (~60 times a second)
function loop() {
  // Only process when the camera has actually produced a new frame
  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    const now = performance.now();

    const handResult = trackers.hands.detectForVideo(video, now);
    const poseResult = trackers.pose.detectForVideo(video, now);

    draw(handResult, poseResult);
  }
  requestAnimationFrame(loop);
}

function draw(handResult, poseResult) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Body: blue skeleton, white joints
  for (const body of poseResult.landmarks) {
    drawer.drawConnectors(body, PoseLandmarker.POSE_CONNECTIONS, { color: '#4f8cff', lineWidth: 3 });
    drawer.drawLandmarks(body, { color: '#ffffff', radius: 3 });
  }

  // Hands: green bones, pink joints
  for (const hand of handResult.landmarks) {
    drawer.drawConnectors(hand, HandLandmarker.HAND_CONNECTIONS, { color: '#00ff88', lineWidth: 3 });
    drawer.drawLandmarks(hand, { color: '#ff3366', radius: 4 });
  }
}

startBtn.addEventListener('click', startCamera);