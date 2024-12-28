/*
 * Install the Generative AI SDK
 *
 * $ npm install @google/generative-ai
 *
 * See the getting started guide for more information
 * https://ai.google.dev/gemini-api/docs/get-started/node
 */

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/files");
const { error } = require("console");
require("dotenv").config();
var request = require('request');
var fs = require('fs');
const { resolve } = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const ffprobePath = require("ffprobe-static").path;
if(fs.existsSync("/usr/bin/ffmpeg")) ffmpeg.setFfmpegPath("/usr/bin/ffmpeg");
else ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

let apiKeys = process.env.API_KEY_PROCESS_SEGMENT.split("|");
let apiKey = process.env.API_KEY_PROCESS_SEGMENT.split("|")[0];

let genAI = new GoogleGenerativeAI(apiKey);
let fileManager = new GoogleAIFileManager(apiKey);

/**
 * Uploads the given file to Gemini.
 *
 * See https://ai.google.dev/gemini-api/docs/prompting_with_media
 */
async function uploadToGemini(path, mimeType,fileManager) {
  const uploadResult = await fileManager.uploadFile(path, {
    mimeType,
    displayName: path,
  });
  const file = uploadResult.file;
  console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
  while (file.state === "PROCESSING") {
    process.stdout.write(".");
    await new Promise((resolve) => setTimeout(resolve, 10_000));
    file = await fileManager.getFile(file.name);
  }
  if (file.state !== "ACTIVE") {
    throw Error(`File ${file.name} failed to process`);
  }
  return file;
}

/**
 * Waits for the given files to be active.
 *
 * Some files uploaded to the Gemini API need to be processed before they can
 * be used as prompt inputs. The status can be seen by querying the file's
 * "state" field.
 *
 * This implementation uses a simple blocking polling loop. Production code
 * should probably employ a more sophisticated approach.
 */
async function waitForFilesActive(files,fileManager) {
  console.log("Waiting for file processing...");
  for (const name of files.map((file) => file.name)) {
    console.log(name);
    let file = await fileManager.getFile(name);
    while (file.state === "PROCESSING") {
      process.stdout.write(".");
      await new Promise((resolve) => setTimeout(resolve, 10_000));
      file = await fileManager.getFile(name);
    }
    if (file.state !== "ACTIVE") {
      throw Error(`File ${file.name} failed to process`);
    }
  }
  console.log("...all files ready\n");
}

async function Run(rootPath, videoIndex, ApiKey,filePath,files) {
  apiKey = ApiKey;

  genAI = new GoogleGenerativeAI(apiKey);


  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
  });

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };

  // TODO Make these files available on the local file system
  // You may need to update the file paths

  // Some files have a processing delay. Wait for them to be ready.
  console.log(apiKey+files[0].uri +" zzzz "+ files[0].mimeType);
  const chatSession = model.startChat({
    generationConfig,
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ],
    history: [
      {
        role: "user",
        parts: [
          {
            fileData: {
              mimeType: files[0].mimeType,
              fileUri: files[0].uri,
            },
          },
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage(
    "* Tôi cần bản chép lời của audio đã giửi ở trên. \n* Có đầy đủ dấu câu. \n * Viết hoa tên riêng \n* chỉ trả lại văn bản chép lời không trả lại thông tin khác.\n * Nếu xem được video hoặc không xử lý được thì trả về chuỗi trống, nhưng cần hạn chế "
  );
  const text = result.response.text().replace(/\n|"|'|<noise>|\s\.|“|”|\.\./g," ")
  console.log(result.response.text());
  return text;
}



async function RunCutVideo(rootPath, videoIndex, ApiKey) {
  const timestamps = fs
    .readFileSync(
      "./" + rootPath + `/timeStamps/timeStamps${videoIndex}.txt`,
      "utf-8"
    )
    .trim()
    .split("\n");

  // Path to the input video file
  const inputVideoPath =
    "./" +rootPath+`/originVideo/videoplayback${videoIndex}.mp4`;

  // Output directory for the video segments
  const outputDir = "./" + rootPath + `/outputVideoSliced/${videoIndex}`;
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  else{
    fs.rmdirSync(outputDir,{ recursive: true, force: true });
    fs.mkdirSync(outputDir);
  }


  // Function to cut video based on timestamps
  const cutVideo = (inputPath, startTime, endTime, outputPath) => {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(startTime)
        .setDuration(endTime - startTime)
        .output(outputPath)
        .noVideo()
        .on("end", () => {
          console.log(`Created segment: ${outputPath}`);
          resolve();
        })
        .on("error", (err) => {
          console.error(`Error creating segment: ${err.message}`);
          reject(err);
        })
        .run();
    });
  };

  // Process each timestamp
  const processTimestamps = async () => {
    fs.writeFileSync("./" +rootPath+`/SubTurnOne/sub${videoIndex}.txt`,"")
    const videoDuration = await getVideoDuration(inputVideoPath);
    let processsegmentPromise=[];
    let threadApi =0;
    for (let i = 0; i < timestamps.length; i++) {
      try{
      if(threadApi== apiKeys.length) threadApi=0;
      let start, end;
      if(timestamps[i].includes("|")) [start, end] = timestamps[i].split("|");
      else {      if(i == timestamps.length-1)  {

          let result = await Promise.all(processsegmentPromise);
         fs.appendFileSync("./" +rootPath+`/SubTurnOne/sub${videoIndex}.txt`,result.join('\n')+"\n");
         console.log(result.join('\n'));
         processsegmentPromise=[];
         await wait(60000);
      };continue;}
      const startTime = parseTime(start);
      let endTime = parseTime(end);
      if(endTime - startTime<1 ) continue;
      if( videoDuration - endTime <6 ) endTime= videoDuration;
      const outputFilePath = (outputDir+`/segment_${i + 1}.mp3`);
    


      processsegmentPromise.push(processsegmentToText(inputVideoPath, startTime, endTime, outputFilePath,rootPath, videoIndex, threadApi,start, end))
  
      if(i == timestamps.length-1)  {

         let result = await Promise.all(processsegmentPromise);
         fs.appendFileSync("./" +rootPath+`/SubTurnOne/sub${videoIndex}.txt`,result.join('\n')+"\n");
         console.log(result.join('\n'));
         processsegmentPromise=[];
         await wait(60000);
      }
     
      threadApi++;
      }catch(error){
        console.log(error)
      }
    }
    return Promise.resolve();
  };

  async function processsegmentToText(inputVideoPath, startTime, endTime, outputFilePath,rootPath, videoIndex,threadApi,start, end){
    try{
      if(endTime-startTime>30){
              await cutVideo(inputVideoPath, startTime, startTime + 29, outputFilePath);
              let result  = await audioToText(outputFilePath);
              await cutVideo(inputVideoPath, startTime + 29, endTime, outputFilePath);
              result  +=' '+ await audioToText(outputFilePath);
      }
      await cutVideo(inputVideoPath, startTime, endTime, outputFilePath);
      let result  = await audioToText(outputFilePath);
      return start+"|"+end+"|"+result;
    }
    catch(error){
      console.log(error);
      return start+"|"+end+"|";
    }

  }


  await processTimestamps()
    .then(() => console.log("All segments created successfully"))
    .catch((error) =>
      console.error(`Error processing timestamps: ${error.message}`)
    );
}
function parseTime(timeStr) {
  const [minutes, seconds,milisecond] = timeStr.split(/:|,/g);
  const minutesInSeconds = parseInt(minutes) * 60 + parseInt(seconds) + 0.001 * milisecond ;

  return minutesInSeconds;
}
async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function audioToText(audioPath) {
  let response;
  var options = {
    'method': 'POST',
    'url': 'https://text2audio.cc/api/stt',
    'headers': {
      'accept': '*/*',
      'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
      'origin': 'https://text2audio.cc',
      'priority': 'u=1, i',
      'referer': 'https://text2audio.cc/stt',
      'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
    },
    formData: {
      'audio': {
        'value': fs.createReadStream(audioPath),
        'options': {
          'filename': audioPath,
          'contentType': null
        }
      }
    }
  };

  try {
     response = await new Promise((resolve, reject) => {
      request(options, (error, response) => {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          try{
          const text = JSON.parse(response.body).result.text;
          resolve(text); // Resolve the promise with the text
          }
          catch{
            
          }
        }
      });
    });
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }

  return response;
}

function getVideoDuration(path) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(path, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        const duration = metadata.format.duration;
        resolve(duration);
      }
    });
  });
}

module.exports = RunCutVideo;//ffmpeg -i caovo.mp4 -c copy -map 0 -segment_time 300 -reset_timestamps 1 -f segment videoplayback1%06d.mp4
