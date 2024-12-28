const fs = require("fs");
const path = require("path");
const https = require("https");
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
      if(!line.includes("|")){
        if(line==lines[lines.length-1]) await Promise.all(threadPromise);
        continue;
      } 
      const [startTime,endTime, text] = line.split("|");
            LineIndex=`${startTime.trim()}`;
      try {
            
            
           threadPromise.push(gTTSPython(text, LineIndex)
          .then()
          .catch(error => console.error(error)))
            
      } catch (error) {
        console.error(`Error processing line "${line}":`, error);
      }
      if(threadPromise.length % 100 ==0  ||line==lines[lines.length-1]) await Promise.all(threadPromise);
    }
  }

  async function extractFrame(videoPath, startTime,endTime, lineIndex) {
    const outputFilename = `${lineIndex}.png`;
    const outputImagePath = path.join(rootFolder, `images/${videoIndex}`, outputFilename); // Dedicated "images" folder
  
    const startExtractFrameTimeInSeconds = (parseTime(startTime) + parseTime(endTime))/2;
  
    try {
      // Await the Promise returned by ffmpeg to get the result
      const result = await new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .seekInput(startExtractFrameTimeInSeconds.toFixed(3))
          .frames(1)
          .output(outputImagePath)
          .on("end", () => resolve()) 
          .on("error", reject) // Reject with the error directly
          .run();
      });
      
      console.log(`Frame extracted successfully to ${result}`);
/*
            await removeTextOnImage(outputImagePath)
        .then()
        .catch()
*/
      return result; // Optionally return the path for further use
  
    } catch (error) {
      console.error(`Error extracting frame: ${error.message}`); // Log the error message
      // Additional error handling here if needed (e.g., retry, notify user)
      throw error; // Re-throw the error to signal failure
    }
  }

  async function extractFrameWidthBg(videoPath, startTime,endTime, lineIndex) {
    const outputFilename = `${lineIndex}.png`;
    const outputImagePath = path.join(__dirname,rootFolder, `images/${videoIndex}`, outputFilename); // Dedicated "images" folder
    const backgroundPath = 'background.jpg'
    const startExtractFrameTimeInSeconds = (parseTime(startTime) + parseTime(endTime))/2;
  
    try {
      // Await the Promise returned by ffmpeg to get the result
      const result = await new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .seekInput(startExtractFrameTimeInSeconds.toFixed(3))
          .frames(1)
         .input(backgroundPath)
        .complexFilter([
    '[0]scale=iw/3:ih/3[padded]',
    '[1][padded]scale2ref=w=iw+30:h=ih+30[bg][padded]',
    '[bg][padded]overlay=(W-w)/2:(H-h)/2[draw]',
    "[draw]drawtext=text='EngSub Commics':fontsize=20:fontcolor=white@0.2:x=(w-text_w)/2:y=(h-text_h)/2"
])
         /*
    .complexFilter([
    '[0]crop=1708:960:(iw-1708)/2:ih-960,format=rgba[padded]',
    '[1]scale=1708:960[bg]',
    '[bg][padded]overlay=(W-w)/2:(H-h)/2[draw]',
    "[draw]drawtext=text='EngSub Commics':fontsize=20:fontcolor=white@0.2:x=(w-text_w)/2:y=(h-text_h)/2"
    ])
    */
          .output(outputImagePath)
          .on("end", () => resolve()) 
          .on("error", reject) // Reject with the error directly
          .run();
      });
      
      console.log(`Frame extracted successfully to ${result}`);

      await removeTextOnImage(outputImagePath)
        .then()
        .catch()

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
  async function gTTSPython(text,LineIndex){
  text = text.replace(/hmph!|hmph|'|"|`|\.\.|\s\.|p p|pp|”\.|“/g,"");
    text = text.replace(/([!?\.])([!?\.])|\.(?=[A-Za-z])|'|"|`|\.\.|\s\.|p p|pp|”|“/g,"");
    const filePath = path.join(rootFolder, `mp3Slow/${videoIndex}`, `${LineIndex}.mp3`);
    //const filePath = path.join(rootFolder, `mp3/${videoIndex}`, `${LineIndex}.mp3`);
    await new Promise((resolve, reject) => {
    // Lấy độ dài của file
     const command = `gtts-cli --lang en '${text}' --output "${filePath}"`;
      console.log(command);
      exec(command, (error, stdout, stderr) => {
        if (error) {
          return reject(`Error trimming file: ${stderr}`);
        }
        resolve(`File saved: ${filePath}`);
      });
  });
  const fastFilePath = path.join(rootFolder, `mp3/${videoIndex}`, `${LineIndex}.mp3`);
  await doubleSpeed(filePath,fastFilePath);
  };

  function doubleSpeed(inputFile, outputFile) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputFile)
      .audioFilters('atempo=1.25') // Double the speed
      .on('end', () => {
        console.log('Processing finished successfully.');
        resolve();
      })
      .on('error', (err) => {
        console.error('An error occurred:', err.message);
        reject(err);
      })
      .save(outputFile);
  });
}

  async function downloadAndCreateMP3(text, LineIndex) {
    if (text) {
      text = text.replace(/'|"|`|\.\.|\s\.|p p|pp|!|\?/g," ");
      text = text.replace(/'|"|`|\.\.|\s\.|p p|pp|!|\?/gi," ");
      text = text.trim();
      if (text.endsWith(".")||text.endsWith(",")){
        text = text.slice(0, -1);
      }
            text = text.replace(/'|"|`|\.\.|\s\.|p p|pp/gi," ");
      //const paragraphs = splitText(text, 12);

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
          language: "en-US",
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
  
    const filePath = path.join(rootFolder, `mp3/${videoIndex}`, filename);
  
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
async function removeTextOnImage(filePath){
const command = `curl -X POST http://localhost:5006/remove-text -H "Content-Type: application/json" -d '{\"img_path\": \"${filePath}\"}'`;
  console.log(`xóa chữ`);
  return await new  Promise((resolve, reject) => {
  exec(command, (error, stdout, stderr) => {
    console.log(`stdout: ${stdout}`);
    console.log(`stdout: ${error}`);
    console.log(`stdout: ${stderr}`);
    resolve();
  }); 
});
}
async function Run(RootFolder,VideoIndex){

    rootFolder=RootFolder;
    videoIndex=VideoIndex;
    videoPath = "./" +rootFolder+`/originVideo/videoHightQuality${videoIndex}.mp4`;
    if(!fs.existsSync(videoPath)) videoPath = "./" +rootFolder+`/originVideo/videoplayback${videoIndex}.mp4`;
    textFile = "./" +rootFolder+`/translatedSub/translate${videoIndex}.txt`;
    if(!fs.existsSync(path.join(rootFolder, `mp3/${videoIndex}`))) fs.mkdirSync(path.join(rootFolder, `mp3/${videoIndex}`))
    else{
        fs.rmdirSync(path.join(rootFolder, `mp3/${videoIndex}`), { recursive: true, force: true })
        fs.mkdirSync(path.join(rootFolder, `mp3/${videoIndex}`))
    }

        if(!fs.existsSync(path.join(rootFolder, `mp3Slow`))) fs.mkdirSync(path.join(rootFolder, `mp3Slow`))
    else{
        fs.rmdirSync(path.join(rootFolder, `mp3Slow`), { recursive: true, force: true })
        fs.mkdirSync(path.join(rootFolder, `mp3Slow`))
    }
    if(!fs.existsSync(path.join(rootFolder, `mp3Slow/${videoIndex}`))) fs.mkdirSync(path.join(rootFolder, `mp3Slow/${videoIndex}`))
    else{
        fs.rmdirSync(path.join(rootFolder, `mp3Slow/${videoIndex}`), { recursive: true, force: true })
        fs.mkdirSync(path.join(rootFolder, `mp3Slow/${videoIndex}`))
    }
    await processTextFile(textFile);
    console.log("aaa");
    return;
  }
async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
  module.exports = Run;
  //Run()