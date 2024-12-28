const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const readline = require('readline');
const { resolve } = require('dns');
const { rejects } = require('assert');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
async function listFormats(url,qualityLabel) {
  try {
    const info = await ytdl.getInfo(url);
    const formats = ytdl.filterFormats(info.formats, 'audioonly');

    console.log('Available formats:');
    formats.forEach((format, index) => {
      console.log(`${index}: ${format.qualityLabel}, ${format.container}`);
    });
    const formatfilter= formats.find(format => format.audioQuality === 'AUDIO_QUALITY_MEDIUM') || formats[0]
    return formatfilter;
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
}

// Function to download YouTube video
async function downloadYouTubeVideo(url,format, outputPath) {
  try {
    const info = await ytdl.getInfo(url);
    const videoTitle = info.videoDetails.title;
    const videoReadableStream = ytdl(url, { format });

    let fileWritableStream = fs.createWriteStream(outputPath);
    videoReadableStream.pipe(fileWritableStream)

    const promise = new Promise((resolve, reject) => {
      fileWritableStream.on('finish', () => resolve());
    });
    await promise;
    console.log(`Downloaded: ${videoTitle}`)
    return Promise.resolve();
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
}

async function Run(videoUrl,outputFilePath,qualityLabel){
  // Read input from the command line
  const formats = await listFormats(videoUrl,qualityLabel);
  console.log(formats)
  //const formats = await listFormats(videoUrl);
  await downloadYouTubeVideo(videoUrl, formats, outputFilePath);
  console.log("download xong")
}

module.exports = Run;

//Run()