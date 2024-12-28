const fs = require("fs");
const path = require("path");
const https = require("https");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const ffprobePath = require("ffprobe-static").path;
const request = require("request");
const util = require('util');
const exec = util.promisify(require('child_process').exec);
if(fs.existsSync("/usr/bin/ffmpeg")) ffmpeg.setFfmpegPath("/usr/bin/ffmpeg");
else ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);
let rootFolder =  "";
let videoIndex = ""

let videoPath = "";
let textFile = "";

async function processTextFile(filePath) {
    const textData = fs.readFileSync(filePath, "utf-8");
  
    const lines = textData.split("\n").filter((line) => line.trim() !== "");
  
    let LineNumber = 0;
    let LineIndex = '';
    let threadPromise = [];
    for (const line of lines) {
      
      LineNumber++;
      LineIndex=`${Date.now()+LineNumber}_Line${LineNumber}`;
      if(!line.includes("|")){
        if(line==lines[lines.length-1]) await Promise.all(threadPromise);
        continue;
      } 
      const [startTime,endTime, text] = line.split("|");
  
      try {
        threadPromise.push(new Promise(async(resolve,rejects)=>{
           extractFrame(videoPath, startTime,endTime, LineIndex)
          .then(() => console.log("Frame extracted successfully!"))
          .catch((err) => console.error("Error extracting frame:", err));
           downloadAndCreateMP3(text, LineIndex);

        console.log(`Processed: ${line}`);
        resolve();
        }
        
        ));
      } catch (error) {
        console.error(`Error processing line "${line}":`, error);
      }
      if(line==lines[lines.length-1]) await Promise.all(threadPromise);
    }
  }

  async function extractFrame(videoPath, startTime, endTime, lineIndex) {
    const outputFilename = `${lineIndex}.png`;
    const outputImagePath = path.join(rootFolder, `images/${videoIndex}`, outputFilename); // Dedicated "images" folder
  
    const startExtractFrameTimeInSeconds = (parseTime(startTime) + parseTime(endTime))/2;
  
    try {
      // Await the Promise returned by ffmpeg to get the result
      const result = await new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .seekInput(startExtractFrameTimeInSeconds)
          .frames(1)
          .output(outputImagePath)
          .on("end", () => resolve(outputImagePath)) 
          .on("error", reject) // Reject with the error directly
          .run();
      });
      
      console.log(`Frame extracted successfully to ${result}`);
      return result; // Optionally return the path for further use
  
    } catch (error) {
      console.error(`Error extracting frame: ${error.message}`); // Log the error message
      // Additional error handling here if needed (e.g., retry, notify user)
      throw error; // Re-throw the error to signal failure
    }
  }

  function parseTime(timeStr) {
    const [minutes, seconds,milisecond] = timeStr.split(/:|,/g);
  
    const minutesInSeconds = parseInt(minutes) * 60 + parseInt(seconds);
  
    return minutesInSeconds;
  }

  async function downloadAndCreateMP3(text, LineIndex) {
    if (text) {
      console.log(text);
            //const paragraphs = text.split(/[,.;:!?]+\s/); // Options for Text-to-Speech API request (optimized)
 const paragraphs = text.replace(/'|"|`/g," ") + "  " ;
  
      const options = {
        method: "POST",
        url: "https://text2audio.cc/api/audio",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        }, // Removed redundant headers
        body: JSON.stringify({
          paragraphs: paragraphs,
          language: "vi-THAILAN",
          splitParagraph: false,
          speed: "1",
        }),
      };
      try {
        const mp3Path = await new Promise((resolve, reject) => {
          request(options, async (error, response) => {
            if (error) {
              reject(error);
            } else {
                            try {
              const parsedData = JSON.parse(response.body);
              const url = parsedData[0].url;
  

     
                const downloadedPath = await downloadMP3(
                  url,
                  `${LineIndex}.mp3`
                );
                resolve(downloadedPath);
              } catch (error) {
                reject(error);
              }
            }
          });
        });
        return mp3Path;
      } catch(error) {
        console.error("Error processing file:", error);
      }
    }
  }

  async function downloadMP3(url, filename) {
  
    const filePath = path.join(rootFolder, `mp3THAILAN/${videoIndex}`, filename);
  
    return new Promise((resolve, reject) => {
      https
        .get(url, (response) => {
          if (response.statusCode === 200) {
            const fileStream = fs.createWriteStream(filePath);
            response.pipe(fileStream);
  
            fileStream.on("finish", () => {
              fileStream.close();
              resolve(filePath);
            });
          } else {
            reject(new Error(`Failed to download: ${response.statusCode}`));
          }
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  }

async function Run(RootFolder,VideoIndex){

    rootFolder=RootFolder;
    videoIndex=VideoIndex;
    videoPath = "./" +rootFolder+`/originVideo/videoplayback${videoIndex}.mp4`;
    textFile = "./" +rootFolder+`/translatedSubTHAILAN/translate${videoIndex}.txt`;
    if(!fs.existsSync(path.join(rootFolder, `images/${videoIndex}`))) fs.mkdirSync(path.join(rootFolder, `images/${videoIndex}`));
    else{
      fs.rmdirSync(path.join(rootFolder, `images/${videoIndex}`), { recursive: true, force: true })
      fs.mkdirSync(path.join(rootFolder, `images/${videoIndex}`))
    }
    if(!fs.existsSync(path.join(rootFolder, `mp3THAILAN/${videoIndex}`))) fs.mkdirSync(path.join(rootFolder, `mp3THAILAN/${videoIndex}`))
    else{
        fs.rmdirSync(path.join(rootFolder, `mp3THAILAN/${videoIndex}`), { recursive: true, force: true })
        fs.mkdirSync(path.join(rootFolder, `mp3THAILAN/${videoIndex}`))
    }
    await processTextFile(textFile);

  }

  module.exports = Run;
  //Run()