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
    const lines = textData.split("\n").filter(line => line.trim() !== "");
  
    let LineNumber = 0;
    let LineIndex = '';
            // Tạo mảng để lưu các promise
        let threadPromise = [];
    // Xử lý mỗi dòng
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        LineNumber++;


        if (!line.includes("|")) {
            // Nếu dòng không chứa "|", tiếp tục với dòng tiếp theo
            if (i === lines.length - 1) await Promise.all(threadPromise);
            continue;
        }

        let [startTime, endTime, text] = line.split("|");
        
        if (!text) {
            // Nếu dòng không chứa "|", tiếp tục với dòng tiếp theo
            if (i === lines.length - 1) await Promise.all(threadPromise);
            continue;
        }
                    LineIndex=`${startTime.trim()}`;
        text = text.replace(/\.\.\./,'')
        // Nếu text không kết thúc bằng dấu câu, gộp với dòng tiếp theo

        if (!/[\.,?!:]$/.test(text.trim()) && i < lines.length - 1) {
    
            let [startTimeNextLine, endTimeNextLine, textNextLine] = lines[i + 1].split("|");
                  if(textNextLine){
            const punctuationRegex = /[.,!?]/;
            
            const firstPunctuationIndex = textNextLine.search(punctuationRegex);

            if (firstPunctuationIndex !== -1) {
                const firstPart = textNextLine.substring(0, firstPunctuationIndex + 1).trim();
                const remainingPart = textNextLine.substring(firstPunctuationIndex + 1).trim();
                text = text + " " + firstPart;
                textNextLine = remainingPart;
                lines[i] = [startTime, endTime, text].join("|");
                lines[i + 1] = [startTimeNextLine, endTimeNextLine, textNextLine].join("|");
            }
            }
        }


        try {

            threadPromise.push(
                gTTSPython(text, LineIndex)
                .then()
                .catch(error => console.error(error))
            );

        } catch (error) {
            console.error(`Error processing line "${line}":`, error);
        }

        // Chờ tất cả các promise hoàn thành nếu là dòng cuối cùng
        if (threadPromise.length % 100 ==0  || i === lines.length - 1) await Promise.all(threadPromise);
        fs.writeFileSync(filePath, lines.join('\n'));
        
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
          .seekInput(startExtractFrameTimeInSeconds.toFixed(3))
          .frames(1)
          .output(outputImagePath)
          .on("start", commandLine => console.log(`Spawned Ffmpeg with command: ${commandLine}`))
          .on("end", () => resolve(outputImagePath)) 
          .on("error", reject) // Reject with the error directly
          .run();
      });
      
      console.log(`Frame extracted successfully to ${result}`);
      removeTextOnImage(outputImagePath)
      return result; // Optionally return the path for further use
  
    } catch (error) {
      console.error(`Error extracting frame: ${error.message}`); // Log the error message
      // Additional error handling here if needed (e.g., retry, notify user)
      throw error; // Re-throw the error to signal failure
    }
  }

  async function extractFrameWidthBg(videoPath, startTime,endTime, lineIndex) {
    const outputFilename = `${lineIndex}.png`;
    const outputImagePath = path.join(rootFolder, `images/${videoIndex}`, outputFilename); // Dedicated "images" folder
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
    '[0]crop=1708:960:(iw-1708)/2:ih-960,format=rgba[padded]',
    '[1]scale=1708:960[bg]',
    '[bg][padded]overlay=(W-w)/2:(H-h)/2'
  ])
          .output(outputImagePath)
          .on("end", () => resolve()) 
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
    const [minutes, seconds,milisecond] = timeStr.split(/:|,|\./g);
    const minutesInSeconds = parseInt(minutes)*60 + parseInt(seconds) + parseInt(milisecond) * 0.001;
  
    return minutesInSeconds;
  }

  function splitText(input, wordsPerChunk) {
    // Tách văn bản thành các từ
    const words = input.split(' ');

    // Tạo mảng để chứa các đoạn văn bản
    const chunks = [];

    // Duyệt qua các từ và tạo các đoạn văn bản
    for (let i = 0; i < words.length; i += wordsPerChunk) {
        // Ghép các từ lại thành một đoạn văn bản
        chunks.push(words.slice(i, i + wordsPerChunk).join(' '));
    }

    return chunks;
}
async function gTTSPython(text,LineIndex){
  text = text.replace(/hmph!|hmph|"\.|''|"|`|\.\.|\s\.|p p|pp|”|“/g,"");
    text = text.replace(/([!?\.])([!?\.])|\.(?=[A-Za-z])|'|"|`|\.\.|\s\.|p p|pp|”|“/g,"");
  const filePath = path.join(rootFolder, `mp3VNSlow/${videoIndex}`, `${LineIndex}.mp3`);
  //const filePath = path.join(rootFolder, `mp3VN/${videoIndex}`, `${LineIndex}.mp3`);

    await new Promise((resolve, reject) => {
  // Lấy độ dài của file
   const command = `gtts-cli --lang vi '${text}' --output "${filePath}"`;
    console.log(command);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(`Error trimming file: ${stderr}`);
      }
      resolve(`File saved: ${filePath}`);
    });
});
   const fastFilePath = path.join(rootFolder, `mp3VN/${videoIndex}`, `${LineIndex}.mp3`);
   await doubleSpeed(filePath,fastFilePath);
};

function doubleSpeed(inputFile, outputFile) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputFile)
      .audioFilters('atempo=1.6') // Double the speed
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

function removeTextOnImage(filePath){
const command = `curl -X POST http://localhost:5006/remove-text -H "Content-Type: application/json" -d '{\"img_path\": \"${filePath}\"}'`;
setTimeout(() => { console.log('Waiting for 200 seconds...');
  exec(command, (error, stdout, stderr) => {
    console.log(`stdout: ${stdout}`);
    console.log(`stdout: ${error}`);
    console.log(`stdout: ${stderr}`);
  }); 
}, 20000);  // 200 seconds = 200,000 milliseconds

}

  async function downloadAndCreateMP3(text, LineIndex) {
    if (text) {
      text = text.replace(/'|"|`|\.\.|\s\.|p p|pp/g,"");
      text = text.replace(/'|"|`|\.\.|\s\.|p p|pp/gi,"");
      text = text.replace(/(?<=\d)\.(?=\d)/g," chấm ");
      //const paragraphs = splitText(text, 12);

      //let paragraphs = text.split(/[,.;:!?]+\s/); // Options for Text-to-Speech API request (optimized)
        let paragraphs = text.replace(/'|"|`/g," ") + "  " ;
        if(text.trim()=="") paragraphs = [text+"          "];
      const options = {
        method: "POST",
        url: "https://text2audio.cc/api/audio",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        }, // Removed redundant headers
        body: JSON.stringify({
          paragraphs: paragraphs,
          language: "vi-VN",
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
  
    const filePath = path.join(rootFolder, `mp3VN/${videoIndex}`, filename);
  
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
    videoPath = "./" +rootFolder+`/originVideo/videoHightQuality${videoIndex}.mp4`;
    if(!fs.existsSync(videoPath)) videoPath = "./" +rootFolder+`/originVideo/videoplayback${videoIndex}.mp4`;
    textFile = "./" +rootFolder+`/originSub/sub${videoIndex}.txt`;
    if(!fs.existsSync(path.join(rootFolder, `mp3VN/${videoIndex}`))) fs.mkdirSync(path.join(rootFolder, `mp3VN/${videoIndex}`))
    else{
        fs.rmdirSync(path.join(rootFolder, `mp3VN/${videoIndex}`), { recursive: true, force: true })
        fs.mkdirSync(path.join(rootFolder, `mp3VN/${videoIndex}`))
    }
    if(!fs.existsSync(path.join(rootFolder, `mp3VNSlow`))) fs.mkdirSync(path.join(rootFolder, `mp3VNSlow`))
    else{
        fs.rmdirSync(path.join(rootFolder, `mp3VNSlow`), { recursive: true, force: true })
        fs.mkdirSync(path.join(rootFolder, `mp3VNSlow`))
    }
    if(!fs.existsSync(path.join(rootFolder, `mp3VNSlow/${videoIndex}`))) fs.mkdirSync(path.join(rootFolder, `mp3VNSlow/${videoIndex}`))
    else{
        fs.rmdirSync(path.join(rootFolder, `mp3VNSlow/${videoIndex}`), { recursive: true, force: true })
        fs.mkdirSync(path.join(rootFolder, `mp3VNSlow/${videoIndex}`))
    }
    await processTextFile(textFile);

  }

  module.exports = Run;
  //Run()