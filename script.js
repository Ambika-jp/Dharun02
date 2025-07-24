let video = document.getElementById('videoElement');
let canvas = document.getElementById('canvasElement');
let ctx = canvas.getContext('2d');
let detector;
let isAIEnhanced = false;
let isPlaying = false;

// Load TensorFlow.js model for pose detection
async function loadModel() {
  detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
    modelType: 'full',
  });
  console.log('AI Model Loaded');
}

// Load video
function loadVideo() {
  const file = document.getElementById('videoInput').files[0];
  if (file) {
    video.src = URL.createObjectURL(file);
    video.load();
    video.play();
  }
}

// Play/Pause Video
function playPauseVideo() {
  if (video.paused || video.ended) {
    video.play();
    isPlaying = true;
  } else {
    video.pause();
    isPlaying = false;
  }
}

// Mute/Unmute Video
function muteUnmute() {
  video.muted = !video.muted;
}

// Toggle Fullscreen Mode
function toggleFullscreen() {
  if (video.requestFullscreen) {
    video.requestFullscreen();
  } else if (video.mozRequestFullScreen) {
    video.mozRequestFullScreen();
  } else if (video.webkitRequestFullscreen) {
    video.webkitRequestFullscreen();
  }
}

// Change Video Playback Speed
function changeSpeed() {
  video.playbackRate = parseFloat(document.getElementById('speed').value);
}

// Adjust Volume
function adjustVolume() {
  video.volume = document.getElementById('volume').value;
}

// Seek Video
function seekVideo() {
  const seekbar = document.getElementById('seekbar');
  const time = (seekbar.value / 100) * video.duration;
  video.currentTime = time;
}

// Toggle AI Enhancement
function toggleAIEnhancement() {
  isAIEnhanced = !isAIEnhanced;
  console.log('AI Enhancement:', isAIEnhanced);
  processVideoFrame();
}

// Process video frame for AI enhancements
async function processVideoFrame() {
  if (video.paused || video.ended) return;

  const poses = await detector.estimatePoses(video);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (poses.length > 0 && isAIEnhanced) {
    const target = poses[0];
    const keypoints = target.keypoints.filter(k => k.score > 0.5);
    const xs = keypoints.map(k => k.x);
    const ys = keypoints.map(k => k.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const width = maxX - minX;
    const height = maxY - minY;

    // Apply AI enhancements or crop on the person (target)
    ctx.drawImage(video, minX, minY, width, height, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, canvas.width, canvas.height);
  }

  requestAnimationFrame(processVideoFrame);
}

// Download Video or Frames (Basic Export)
function downloadVideo() {
  const videoURL = video.src;
  const link = document.createElement('a');
  link.href = videoURL;
  link.download = 'enhanced_video.mp4';
  link.click();
}

// Initialize AI Model
loadModel();
