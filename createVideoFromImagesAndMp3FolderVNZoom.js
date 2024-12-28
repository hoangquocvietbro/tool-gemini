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


const files = fs.readdirSync(audioDir);
let promiseCreateVideoFromLine =[];
        for(const imageFile of files)
            {                   
                
                 let baseFileName = imageFile.split(".")[0];
                 promiseCreateVideoFromLine.push(new Promise(async(resolve,rejects)=>{
                    await createVideo(`./${rootFolder}/images/${videoIndex}/`+baseFileName+".png",`./${rootFolder}/mp3VN/${videoIndex}/`+baseFileName+".mp3",`${videoIndex}/`+baseFileName)
                  resolve();
                  }
                  ));

                if(promiseCreateVideoFromLine.length % 50 ==0||imageFile==files[files.length-1]) await Promise.all(promiseCreateVideoFromLine);
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
  const duration = Math.ceil(await getVideoDuration(path.join(__dirname,audioListFile)));
  const videoFilter = [
          `zoompan=z='if(eq(on,1),1.3,max(1,zoom-0.0056))':d=25*${duration}:x='iw*(1-zoom)':y='ih*(1-zoom)'`,
      `zoompan=z='if(eq(on,1),1.3,max(1,zoom-0.0056))':d=25*${duration}:x='0':y='ih*(1-zoom)'`,
      `zoompan=z='if(eq(on,1),1.3,max(1,zoom-0.0056))':d=25*${duration}:x='iw*(1-zoom)':y='0'`,
                `zoompan=z='if(eq(on,1),1.3,max(1,zoom-0.0056))':d=25*${duration}`,
        `zoompan=z='min(zoom+0.0056,1.3)':d=25*${duration}`,
      `zoompan=z='min(zoom+0.005,1.5)':d=25*${duration}:x='if(gte(zoom,1.5),x,x+1/a)':y='if(gte(zoom,1.5),y,y+1)'`,//phóng to random quan trọng dùng cho ca video cũng được
    `zoompan=z='if(eq(on,1),1.5,max(1,zoom-0.01))':d=25*${duration}:x='if(gte(zoom,1.5),(iw-(iw/zoom))/2,(iw-(iw/zoom))/2)':y='if(gte(zoom,1.5),(ih-(ih/zoom)),(ih-(ih/zoom)))'`,//thu nhỏ trục ngang dưới cố định
    `zoompan=z='if(eq(on,1),1.6,max(1,zoom-0.01))':d=25*${duration}:x='if(gte(zoom,1.5),x,x-1/a)':y='if(gte(zoom,1.5),y,y-1)'`,//thu nhỏ từ trái lên
  `crop=640:720,zoompan=z='min(zoom+0.001,2)':d=25*${duration}:x='if(gte(zoom,2),x,x+1/a)':y='if(gte(zoom,2),y,y+1)':s=640x720:`,//phóng to random quan trọng dùng cho ca video cũng được
    `crop=640:720,zoompan=z='if(eq(on,1),1.5,max(1,zoom-0.006))':d=25*${duration}:x='if(gte(zoom,1.5),(iw-(iw/zoom))/2,(iw-(iw/zoom))/2)':y='if(gte(zoom,1.5),(ih-(ih/zoom)),(ih-(ih/zoom)))':s=640x720`,//thu nhỏ trục ngang dưới cố định
    `crop=640:720,zoompan=z='if(eq(on,1),1.6,max(1,zoom-0.006))':d=25*${duration}:x='if(gte(zoom,1.5),x,x-1/a)':y='if(gte(zoom,1.5),y,y-1)':s=640x720`,//thu nhỏ từ trái lên
    `crop=640:720,zoompan=z='if(lte(mod(on,25*2*${duration}),25*${duration}),min(zoom+0.001,2),max(zoom-0.001,2))':d=25*${duration}:x='iw/2-(iw/zoom/2)':s=640x720` ,//giữa ra xuống dưới phóng to

    `crop=640:720,zoompan=z='min(max(zoom,pzoom)+0.001,1.5)':d=25*${duration}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=640x720`,
    `crop=640:720,zoompan=z='min(zoom+0.001,2)':d=25*${duration}:x='if(gte(zoom,2),x,x+1/a)':y='if(gte(zoom,2),y,y+1)':s=640x720`,//phóng to random quan trọng dùng cho ca video cũng 
    `crop=640:720,zoompan=z='if(eq(on,1),1.5,max(1,zoom-0.006))':d=25*${duration}:x='if(gte(zoom,1.5),(iw-(iw/zoom))/2,(iw-(iw/zoom))/2)':y='if(gte(zoom,1.5),(ih-(ih/zoom)),(ih-(ih/zoom)))':s=640x720`,//thu nhỏ trục ngang dưới cố định
    `crop=640:720,zoompan=z='if(eq(on,1),1.6,max(1,zoom-0.006))':d=25*${duration}:x='if(gte(zoom,1.5),x,x-1/a)':y='if(gte(zoom,1.5),y,y-1)':s=640x720`,//thu nhỏ từ trái lên




    `crop=640:720,zoompan=z='min(max(zoom,pzoom)+0.0025,1.5)':d=125:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=640x720`,
    `crop=640:720,zoompan=z='min(zoom+0.0025,2)':d=125:x='if(gte(zoom,2),x,x+1/a)':y='if(gte(zoom,2),y,y+1)':s=640x720`,//phóng to random quan trọng dùng cho ca video cũng được
    `crop=640:720,zoompan=z='if(eq(on,1),2,max(1,zoom-0.006))':d=125:x='if(gte(zoom,1.5),(iw-(iw/zoom))/2,(iw-(iw/zoom))/2)':y='if(gte(zoom,1.5),0,(ih-(ih/zoom))/2)':s=640x720`,//thu nhỏ vào giữa màn hình
    `crop=640:720,zoompan=z='if(eq(on,1),1.5,max(1,zoom-0.006))':d=25*${duration}:x='if(gte(zoom,1.5),(iw-(iw/zoom))/2,(iw-(iw/zoom))/2)':y='if(gte(zoom,1.5),(ih-(ih/zoom)),(ih-(ih/zoom)))':s=640x720`,//thu nhỏ trục ngang dưới cố định

    `crop=640:720,zoompan=z='if(eq(on,1),2,max(1,zoom-0.006))':d=25*${duration}:x='if(gte(zoom,1.5),x,x-1/a)':y='if(gte(zoom,1.5),y,y-1)':s=640x720`,//thu nhỏ từ trái lên
    `pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='if(lte(mod(on,25*2*${duration}),25*${duration}),min(zoom+0.006,2),max(zoom-0.006,2))':d=25*${duration}:x='iw/2-(iw/zoom/2)'`,//giữa ra xuống dưới
    `pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='if(lte(mod(on,25*2*${duration}),25*${duration}),min(zoom+0.006,2),max(zoom-0.006,1))':d=25*${duration}:x='(iw/2)-(iw/zoom/2)':y='(ih/2)-(ih/zoom/2)'`,//giữa ra lên trên
    `pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='if(lte(mod(on,25*2*${duration}),25*${duration}),min(zoom+0.006,2),max(zoom-0.006,1))':d=25*${duration}:x='iw/2-(iw/zoom/2)'`, //giữa ra xuống dưới

    `pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='if(lte(mod(on,25*2*${duration}),25*${duration}),min(zoom+0.006,2),max(zoom-0.006,1))':d=25*${duration}:x='(ow-iw)/2-(iw/zoom)/2':y='(oh-ih)/2'`,//trái sang phải xuống dưới
    `pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='if(lte(mod(on,25*2*${duration}),25*${duration}),min(zoom+0.006,2),max(zoom-0.006,1))':d=25*${duration}:y='0'`,//trái sang phải xuống dưới
    `pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='if(lte(mod(on,25*2*${duration}),25*${duration}),min(zoom+0.006,2),max(zoom-0.006,1))':d=25*${duration}:x='iw-iw/zoom'`,//phải sang trái xuống dưới
    `pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='if(lte(mod(on,25*2*${duration}),25*${duration}),min(zoom+0.006,2),max(zoom-0.006,1))':d=25*${duration}:y='ih-ih/zoom'`,//dưới lên sang phải
    `pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='if(lte(mod(on,25*2*${duration}),25*${duration}),min(zoom+0.006,2),max(zoom-0.006,1))':d=25*${duration}:x='iw-iw/zoom'`,//xuống dưới sang trái




  ]
  const backgroundPath = 'background.jpg'
  const randomNumber = Math.floor(Math.random() * 5);
  const ffmpegProcess = ffmpeg()
  .input(imageListFile)
  .input(backgroundPath)
  .input(audioListFile) // Verify this is an audio file
  .complexFilter([
    '[0]scale=iw:ih[padded]',
    '[1][padded]scale2ref=w=iw:h=ih[bg][padded]',
    '[bg][padded]overlay=(W-w)/2:(H-h)/2[draw]',
    "[draw]drawtext=text='Pepe Review':fontsize=30:fontcolor=white@0.2:x=(w-text_w)/2:y=(h-text_h)/2[image]",
    `[image]${videoFilter[randomNumber]}`
])
  .outputOptions([
//    '-filter_complex', `${videoFilter[randomNumber]}`,
    '-c:v libx264',     // Sử dụng codec video `libx264`
    '-crf 23',          // Đặt giá trị CRF để điều khiển chất lượng video (0-51, giá trị thấp hơn tương đương với chất lượng cao hơn)
    '-preset ultrafast',   // Sử dụng preset để cân bằng giữa tốc độ và chất lượng
    '-c:a aac',         // Sử dụng codec âm thanh `aac`
    '-strict -2',       // Tuân thủ codec `aac`
    '-pix_fmt yuv420p', // Đảm bảo định dạng pixel là `yuv420p` để tương thích với hầu hết các trình phát
    '-r 25',            // Đặt tỷ lệ khung hình (frame rate) đồng nhất
    '-shortest',        // Kết thúc video khi âm thanh hoặc video ngắn nhất kết thúc
  ])
  .on('start', commandLine => console.log(`Spawned Ffmpeg with command: ${commandLine}`))
  .on('end', () => {
    console.log('Processing finished!');
  })
  .on('error', (err) => {
    console.error('Error:', err);
  })
  .save(`${rootFolder}/outputVideoVN/${outputVideo}.mp4`);

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
    return Promise.resolve();
  } catch (err) {
    return Promise.resolve();
    console.error('An error occurred during video creation:', err);
    console.log('try again');
    tryAgainCount++;
    try{
          createVideo(imageListFile, audioListFile, outputVideo);
    }catch{}
    if(tryAgainCount>2) return Promise.resolve;
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
