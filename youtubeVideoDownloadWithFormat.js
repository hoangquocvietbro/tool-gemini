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
    const formats = ytdl.filterFormats(info.formats, 'video');

    console.log('Available formats:');
    formats.forEach((format, index) => {
      console.log(`${index}: ${format.qualityLabel}, ${format.container}`);
    });
    const formatfilter= formats.filter((videoFormat)=>(videoFormat.container=='mp4' && videoFormat.qualityLabel==qualityLabel))
    return formats;
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
  //const formats = await listFormats(videoUrl);
  await downloadYouTubeVideo(videoUrl, formats[0], outputFilePath);
  console.log("download format xong")
}

module.exports = Run;

//Run()