const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const ffprobePath = require("ffprobe-static").path;
const fs = require('fs');
const path = require('path');
const os = require('os');

// Set the path to the ffmpeg binary
if(fs.existsSync("/usr/bin/ffmpeg")) ffmpeg.setFfmpegPath("/usr/bin/ffmpeg");
else ffmpeg.setFfmpegPath(ffmpegPath);
if(fs.existsSync("/usr/bin/ffprobe")) ffmpeg.setFfprobePath("/usr/bin/ffprobe");
else ffmpeg.setFfprobePath(ffprobePath);

let imagesDir = 'images/';
let audioDir = 'mp3VN/';
let rootFolder ="";
let videoIndex = "";
let filename= `${Date.now()}`;
async function createTxtThenCreateVideo(){
      try{
        // Get list of images and audio fil


const files = fs.readdirSync(imagesDir);
let promiseCreateVideoFromLine =[];
        for(const imageFile of files)
            {                   
                
                 let baseFileName = imageFile.split(".")[0];
                fs.writeFileSync(`${rootFolder}/imageFileList/${videoIndex}/`+baseFileName+".txt", `file '../../images/${videoIndex}/${imageFile.replace(/'/g, "\\'")}'`);
    
                let list = ''; 
                fs.readdirSync(audioDir).map(audioFile => 
                    {
                       if(audioFile.includes(baseFileName)) {
                        list+= `file '../../mp3VN/${videoIndex}/${audioFile.replace(/'/g, "\\'")}'\n`;
                       }
                    }
                );
                if(list!='')
                  {
                  fs.writeFileSync(`${rootFolder}/audioFileListVN/${videoIndex}/`+baseFileName+".txt", list);
                  promiseCreateVideoFromLine.push(new Promise(async(resolve,rejects)=>{
                    await createVideo(`./${rootFolder}/imageFileList/${videoIndex}/`+baseFileName+".txt",`./${rootFolder}/audioFileListVN/${videoIndex}/`+baseFileName+".txt",`${videoIndex}/`+baseFileName)
                  resolve();
                  }
                  
                  ));
                }

                if(imageFile==files[files.length-1]) await Promise.all(promiseCreateVideoFromLine);
            }
            await concatAllOutputVideo();
      }
      catch(error){
        console.log(error)
      }

    
}

async function concatAllOutputVideo(){
  
  const videoFiles = fs.readdirSync(`${rootFolder}/outputVideoVN/${videoIndex}`).map(file => path.join(file));
  let list = ''; 
  for(const video of videoFiles)
    {
        
        
        list+= `file '../outputVideoVN/${videoIndex}/${video.replace(/'/g, "\\'")}'\n`;
    }
    fs.writeFileSync(`${rootFolder}/videoFileListVN/ListVideo${videoIndex}.txt`, list);
    const ffmpegProcess = ffmpeg()
    .input(`./${rootFolder}/videoFileListVN/ListVideo${videoIndex}.txt`)
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
/*
 videoFiles.length = 6;
     const transitions = [
  'fade', 'wipeleft', 'wiperight', 'slideleft', 'slideright', 'circleopen', 'circleclose',
  'hlslice', 'hrslice', 'dissolve', 'pixelize', 'radial', 'spiral', 'smoothleft', 'smoothright',
  'hblur', 'vblur', 'zlens', 'mosaic', 'pagecurl', 'pageflip', 'crosswarp', 'dreamy', 'fadeblack',
  'fadewhite', 'linearblur', 'crosszoom', 'zoomblur', 'cube', 'crosshatch', 'glitchmemories',
  'burn', 'ripple', 'swirl', 'waver', 'retro', 'circlecrop', 'colorphase', 'shear', 'bounce',
  'ripplepulse', 'glasswarp', 'foggy', 'flashbulb', 'lensflare', 'vortex', 'twirl', 'wirl', 'kaleidoscope',
  'static'
];

// Tạo lệnh FFmpeg với các hiệu ứng chuyển cảnh
let filterComplex = '';
let inputs = '';
let outputMap = '';
let totalDuration = 0;
let Preduration=0;
const transitionDuration = 1;

  // Lấy thời gian của từng video
  const durations = await Promise.all(videoFiles.map(video =>{   {console.log(__dirname)}; return getVideoDuration(path.join(__dirname,`${rootFolder}/outputVideoVN/${videoIndex}/${video}`))}));
     console.log(durations);
  for (let i = 0; i < videoFiles.length; i++) {
    inputs += `-i ${rootFolder}/outputVideoVN/${videoIndex}/${videoFiles[i]} `;
    if (i < videoFiles.length - 1) {
      const transition = transitions[i % transitions.length];
      const duration = durations[i];
      console.log(duration)
      const nextDuration = durations[i + 1];
      const offset = duration + Preduration - transitionDuration;
      Preduration = offset // Sử dụng thời gian đã tích lũy

      filterComplex += `[v${i}][${i + 1}:v]xfade=transition=fade:duration=${transitionDuration}:offset=${offset}[v${i + 1}];[a${i}][${i + 1}:a]acrossfade=d=1[a${i + 1}]; `;
      if (i === videoFiles.length - 2) {
        outputMap += ``;
      }

      totalDuration += duration; // Cộng dồn thời gian video
    }
  }

// Cắt bỏ ký tự cuối cùng ('; ') trong filterComplex
filterComplex = filterComplex.slice(0, -2);

const command = `ffmpeg ${inputs} -filter_complex "${filterComplex}" ${outputMap} output.mp4`;

console.log('Running command:', command);

// Thực thi lệnh FFmpeg
const exec = require('child_process').exec;
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${stderr}`);
  } else {
    console.log('Video ghép thành công');
  }
});*/
}

const { exec } = require('child_process');

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
  .outputOption('-c copy')
  .on('start', commandLine => console.log(`Spawned Ffmpeg with command: ${commandLine}`))
  .save(`${rootFolder}/outputVideoVN/${outputVideo}.mp4`)
  .on('end', () => {
    console.log('Video đã được lưu thành công!');
  })
  .on('error', (err) => {
    console.error('Có lỗi xảy ra:', err.message);
  });

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
      .save(`${rootFolder}/outputVideoVN/` + outputVideo + ".mp4");

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
  filename = RootFolder+"/VideoVNmese/"+VideoIndex+"_"+videoID;
  rootFolder = RootFolder;
  videoIndex = VideoIndex;
   imagesDir = `${rootFolder}/images/${videoIndex}`;
  audioDir = `${rootFolder}/mp3VN/${videoIndex}`;
  if(!fs.existsSync(`${rootFolder}/imageFileList/${videoIndex}`)) fs.mkdirSync(`${rootFolder}/imageFileList/${videoIndex}`)
    else{
      fs.rmdirSync(`${rootFolder}/imageFileList/${videoIndex}`, { recursive: true, force: true })
      fs.mkdirSync(`${rootFolder}/imageFileList/${videoIndex}`)
    }
  if(!fs.existsSync(`${rootFolder}/audioFileListVN/${videoIndex}`)) fs.mkdirSync(`${rootFolder}/audioFileListVN/${videoIndex}`)
    else{
      fs.rmdirSync(`${rootFolder}/audioFileListVN/${videoIndex}`, { recursive: true, force: true })
      fs.mkdirSync(`${rootFolder}/audioFileListVN/${videoIndex}`)
  }
  if(!fs.existsSync(`${rootFolder}/outputVideoVN/${videoIndex}`)) fs.mkdirSync(`${rootFolder}/outputVideoVN/${videoIndex}`)
    else{
      fs.rmdirSync(`${rootFolder}/outputVideoVN/${videoIndex}`, { recursive: true, force: true })
      fs.mkdirSync(`${rootFolder}/outputVideoVN/${videoIndex}`)
    }
    await createTxtThenCreateVideo();
}
module.exports = runMakeVideo;
//runMakeVideo()
