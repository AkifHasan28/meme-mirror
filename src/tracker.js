import { FilesetResolver, HandLandmarker, PoseLandmarker } from '@mediapipe/tasks-vision';

const MP_VERSION = '1.1.0';

const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/wasm`;
const HAND_MODEL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const POSE_MODEL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

// Builds both trackers using the given processor ('GPU' or 'CPU')
async function buildTrackers(vision, delegate) {
  const hands = await HandLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: HAND_MODEL, delegate },
    runningMode: 'VIDEO',
    numHands: 2,
  });

  const pose = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: POSE_MODEL, delegate },
    runningMode: 'VIDEO',
    numPoses: 1,
  });

  return { hands, pose, delegate };
}

export async function createTrackers() {
  const vision = await FilesetResolver.forVisionTasks(WASM_URL);

  try {
    // Try the fast path first
    return await buildTrackers(vision, 'GPU');
  } catch (err) {
    // No WebGL / GPU available: fall back to the CPU instead of crashing
    console.warn('GPU unavailable, falling back to CPU:', err.message);
    return await buildTrackers(vision, 'CPU');
  }
}