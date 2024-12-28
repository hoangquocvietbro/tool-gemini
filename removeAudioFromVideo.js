const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const ffprobePath = require("ffprobe-static").path;
const request = require("request");
const util = require('util');
const { resolve } = require("dns");
const { rejects } = require("assert");
const exec = util.promisify(require('child_process').exec);
if(fs.existsSync("/usr/bin/ffmpeg")) ffmpeg.setFfmpegPath("/usr/bin/ffmpeg");
else ffmpeg.setFfmpegPath(ffmpegPath);

async function removeAudio(rootPath, videoIndex){
    return await new  Promise((resolve, reject) => {
      ffmpeg("./" +rootPath+`/originVideo/videoplayback${videoIndex}.mp4`)
        .output("./" +rootPath+`/noAudioVideo/videoplayback${videoIndex}.mp4`)
        .noAudio() // Exclude audio from the output
        .on("end", () => {
          console.log(`Created no Audio Video`);
          resolve();
        })
        .on("error", (err) => {
          console.error(`Error Creatting no Audio Videot: ${err.message}`);
          reject(err);
        })
        .run();
    });
  };

  module.exports = removeAudio;