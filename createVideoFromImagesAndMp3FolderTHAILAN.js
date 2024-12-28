const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const ffprobePath = require("ffprobe-static").path;
const fs = require('fs');
const path = require('path');
const os = require('os');

// Set the path to the ffmpeg binary
if(fs.existsSync("/usr/bin/ffmpeg")) ffmpeg.setFfmpegPath("/usr/bin/ffmpeg");
else ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

let imagesDir = 'images/';
let audioDir = 'mp3THAILAN/';
let rootFolder ="";
let videoIndex = "";
let filename= `${Date.now()}`;
async function createTxtThenCreateVideo(){
      try{
        // Get list of images and audio fil


const files = fs.readdirSync(imagesDir);
let promiseCreateVideoFromLine =[];
        for(const imageFile of files)
            {                   console.log(imageFile)
                  console.log(files[files.length-1])
                
                 let baseFileName = imageFile.split(".")[0];
                fs.writeFileSync(`${rootFolder}/imageFileList/${videoIndex}/`+baseFileName+".txt", `file '../../images/${videoIndex}/${imageFile.replace(/'/g, "\\'")}'`);
    
                let list = ''; 
                fs.readdirSync(audioDir).map(audioFile => 
                    {
                       if(audioFile.includes(baseFileName)) {
                        list+= `file '../../mp3THAILAN/${videoIndex}/${audioFile.replace(/'/g, "\\'")}'\n`;
                       }
                    }
                );
                if(list!='')
                  {
                    console.log(list);
                  fs.writeFileSync(`${rootFolder}/audioFileListTHAILAN/${videoIndex}/`+baseFileName+".txt", list);
                  promiseCreateVideoFromLine.push(new Promise(async(resolve,rejects)=>{
                    await createVideo(`./${rootFolder}/imageFileList/${videoIndex}/`+baseFileName+".txt",`./${rootFolder}/audioFileListTHAILAN/${videoIndex}/`+baseFileName+".txt",`${videoIndex}/`+baseFileName)
                  resolve();
                  }
                  
                  ));
                }
                                  console.log(imageFile)
                  console.log(files[files.length-1])
                if(imageFile==files[files.length-1]) await Promise.all(promiseCreateVideoFromLine);
            }
            await concatAllOutputVideo();
      }
      catch(error){
        console.log(error)
      }

    
}

async function concatAllOutputVideo(){
  
  const videoFiles = fs.readdirSync(`${rootFolder}/outputVideoTHAILAN/${videoIndex}`).map(file => path.join(file));
  let list = ''; 
  for(const video of videoFiles)
    {
        
        
        list+= `file '../outputVideoTHAILAN/${videoIndex}/${video.replace(/'/g, "\\'")}'\n`;
    }
    fs.writeFileSync(`${rootFolder}/videoFileListTHAILAN/ListVideo${videoIndex}.txt`, list);
    const ffmpegProcess = ffmpeg()
    .input(`./${rootFolder}/videoFileListTHAILAN/ListVideo${videoIndex}.txt`)
    .inputOptions('-f concat')
    .inputOptions('-safe 0')
    .outputOption('-c copy')
    .on('start', commandLine => console.log(`Spawned Ffmpeg with command: ${commandLine}`))
    .save(filename + ".mp4");

    const promise = new Promise((resolve, reject) => {
      ffmpegProcess.on('end', () => resolve());
      ffmpegProcess.on('error', (err, stdout, stderr) => {
        console.error('Error:', err.message);
        console.error('ffmpeg stderr:', stderr);
        reject(err);
      });
    });

    await promise;
}

async function createVideo(imageListFile, audioListFile, outputVideo) {
  let tryAgainCount=0;
  try {
    
    const ffmpegProcess = ffmpeg()
      .input(imageListFile)
      .inputOptions('-f concat')
      .inputOptions('-safe 0')
      .input(audioListFile)
      .inputOptions('-f concat')
      .inputOptions('-safe 0')
      .on('start', commandLine => console.log(`Spawned Ffmpeg with command: ${commandLine}`))
      .save(`${rootFolder}/outputVideoTHAILAN/` + outputVideo + ".mp4");

    // Wrap ffmpeg execution in a promise
    const promise = new Promise((resolve, reject) => {
      ffmpegProcess.on('end', () => resolve());
      ffmpegProcess.on('error', (err, stdout, stderr) => {
        console.error('Error:', err.message);
        console.error('ffmpeg stderr:', stderr);
        reject(err);
      });
    });

    await promise;
    console.log('Processing finished!');
    return Promise.resolve;
  } catch (err) {
    console.error('An error occurred during video creation:', err);
    console.log('try again');
    tryAgainCount++;
    if(tryAgainCount>2) return Promise.resolve;
    await createVideoWidthFilter(imageListFile, audioListFile, outputVideo);
  }
}
async function createVideoWidthFilter(imageListFile, audioListFile, outputVideo) {
  try {
    
    const ffmpegProcess = ffmpeg()
      .input(imageListFile)
      .inputOptions('-f concat')
      .inputOptions('-safe 0')
      .videoFilter(`scale=trunc(ih/2)*2:ceil(ih/2)*2`)
      .input(audioListFile)
      .inputOptions('-f concat')
      .inputOptions('-safe 0')
      .on('start', commandLine => console.log(`Spawned Ffmpeg with command: ${commandLine}`))
      .save(`${rootFolder}/outputVideoTHAILAN/` + outputVideo + ".mp4");

    // Wrap ffmpeg execution in a promise
    const promise = new Promise((resolve, reject) => {
      ffmpegProcess.on('end', () => resolve());
      ffmpegProcess.on('error', (err, stdout, stderr) => {
        console.error('Error:', err.message);
        console.error('ffmpeg stderr:', stderr);
        reject(err);
      });
    });

    await promise;
    console.log('Processing finished!');
  } catch (err) {
    console.error('An error occurred during video creation:', err);
  }
}

async function runMakeVideo(RootFolder,VideoIndex,videoID){
  filename = RootFolder+"/VideoTHAILANmese/"+VideoIndex+"_"+videoID;
  rootFolder = RootFolder;
  videoIndex = VideoIndex;
   imagesDir = `${rootFolder}/images/${videoIndex}`;
  audioDir = `${rootFolder}/mp3THAILAN/${videoIndex}`;
  if(!fs.existsSync(`${rootFolder}/imageFileList/${videoIndex}`)) fs.mkdirSync(`${rootFolder}/imageFileList/${videoIndex}`)
    else{
      fs.rmdirSync(`${rootFolder}/imageFileList/${videoIndex}`, { recursive: true, force: true })
      fs.mkdirSync(`${rootFolder}/imageFileList/${videoIndex}`)
    }
  if(!fs.existsSync(`${rootFolder}/audioFileListTHAILAN/${videoIndex}`)) fs.mkdirSync(`${rootFolder}/audioFileListTHAILAN/${videoIndex}`)
    else{
      fs.rmdirSync(`${rootFolder}/audioFileListTHAILAN/${videoIndex}`, { recursive: true, force: true })
      fs.mkdirSync(`${rootFolder}/audioFileListTHAILAN/${videoIndex}`)
  }
  if(!fs.existsSync(`${rootFolder}/outputVideoTHAILAN/${videoIndex}`)) fs.mkdirSync(`${rootFolder}/outputVideoTHAILAN/${videoIndex}`)
    else{
      fs.rmdirSync(`${rootFolder}/outputVideoTHAILAN/${videoIndex}`, { recursive: true, force: true })
      fs.mkdirSync(`${rootFolder}/outputVideoTHAILAN/${videoIndex}`)
    }
    await createTxtThenCreateVideo();
}
module.exports = runMakeVideo;
//runMakeVideo()
