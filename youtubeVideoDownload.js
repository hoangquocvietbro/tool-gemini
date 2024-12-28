const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const readline = require('readline');
const { exec } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to download YouTube video and audio separately
async function downloadYouTubeVideo(url, outputPath) {
  try {
    const info = await ytdl.getInfo(url);
    const videoTitle = info.videoDetails.title;
    const videoDuration = info.videoDetails.lengthSeconds;

    // Check if the video duration is longer than 20 minutes (1200 seconds)
    if (videoDuration > 1300) {
      throw new Error('Video is longer than 20 minutes. Skipping download.');
    }
  const formats = ytdl.filterFormats(info.formats, 'video');
  const format480p = formats.find(format => format.qualityLabel === '480p');
    const videoStream = ytdl(url, { quality: 'highest' });
    const audioStream = ytdl(url, { quality: 'lowest' });

    const videoFilePath = `${outputPath}`;
    const audioFilePath = `${outputPath}.mp3`;

       // Remove existing temporary files if they exist
    if (fs.existsSync(videoFilePath)) {
      fs.unlinkSync(videoFilePath);
    }
    if (fs.existsSync(audioFilePath)) {
      fs.unlinkSync(audioFilePath);
    }


    const videoPromise = new Promise((resolve, reject) => {
      const videoWritableStream = fs.createWriteStream(videoFilePath);
      videoStream.pipe(videoWritableStream);
      videoWritableStream.on('finish', resolve);
      videoWritableStream.on('error', reject);
    });

    const audioPromise = new Promise((resolve, reject) => {
      const audioWritableStream = fs.createWriteStream(audioFilePath);
      audioStream.pipe(audioWritableStream);
      audioWritableStream.on('finish', resolve);
      audioWritableStream.on('error', reject);
    });

    await Promise.all([videoPromise, audioPromise]);
/*
    const finalOutputPath = `${outputPath}`;

    // Merge video and audio using FFmpeg
    await new Promise((resolve, reject) => {
      const command = `ffmpeg -i ${videoFilePath} -i ${audioFilePath} -c copy ${finalOutputPath} -y`;
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    // Clean up temporary files
    fs.unlinkSync(videoFilePath);
    fs.unlinkSync(audioFilePath);
*/
    console.log(`Downloaded: ${videoTitle}`);
    return Promise.resolve();
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
}

async function Run(videoUrl, outputFilePath) {
  // Read input from the command line
  await downloadYouTubeVideo(videoUrl, outputFilePath);
  console.log("Download completed");
}

module.exports = Run;

// To run the script, call the Run function with appropriate parameters
// Run('https://www.youtube.com/watch?v=example', 'output/path/filename');
