// audioManager.js

// Background music
export const backgroundMusic = new Audio('./assets/audio/background.wav');

// Optional: preload the audio
export function preloadAudio(audio) {
    return new Promise(resolve => {
        audio.oncanplaythrough = () => resolve();
        audio.load();
    });
}

// Function to start music
export function playBackgroundMusic(loop = true, volume = 0.5) {
    backgroundMusic.loop = loop;   // loop continuously
    backgroundMusic.volume = volume; 
    backgroundMusic.play();
}

// Function to stop music
export function stopBackgroundMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
}
