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
let audioDir = 'mp3/';
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
                    await createVideo(`./${rootFolder}/images/${videoIndex}/`+baseFileName+".png",`./${rootFolder}/mp3/${videoIndex}/`+baseFileName+".mp3",`${videoIndex}/`+baseFileName)
                  resolve();
                  }
                  ));

                  if(promiseCreateVideoFromLine.length % 50 ==0 || imageFile==files[files.length-1]) await Promise.all(promiseCreateVideoFromLine);
            }
            await wait(60000)
            await concatAllOutputVideo();
      }
      catch(error){
        console.log(error)
      }

    
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function concatAllOutputVideo(){
  
  const videoFiles = fs.readdirSync(`${rootFolder}/outputVideo/${videoIndex}`).map(file => path.join(file));
  let list = ''; 
  for(const video of videoFiles)
    {
        
        
        list+= `file '../outputVideo/${videoIndex}/${video.replace(/'/g, "\\'")}'\n`;
    }
    fs.writeFileSync(`${rootFolder}/videoFileList/ListVideo${videoIndex}.txt`, list);
    const ffmpegProcess = ffmpeg()
    .input(`./${rootFolder}/videoFileList/ListVideo${videoIndex}.txt`)
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
/*
async function createVideo(imageListFile, audioListFile, outputVideo) {
  let tryAgainCount=0;
  try {
  const duration = Math.ceil(await getVideoDuration(path.join(__dirname,audioListFile)));
  const videoFilter = [
    //`zoompan=z='min(max(zoom,pzoom)+0.005,1.5)':d=25*${duration}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)',setpts=PTS-STARTPTS,format=yuv420p`,//dung lắc
    `zoompan=z='min(zoom+0.005,1.5)':d=25*${duration}:x='if(gte(zoom,1.5),x,x+1/a)':y='if(gte(zoom,1.5),y,y+1)',setpts=PTS-STARTPTS`,//phóng to random quan trọng dùng cho ca video cũng được
    `zoompan=z='if(eq(on,1),1.5,max(1,zoom-0.005))':d=25*${duration}:x='if(gte(zoom,1.5),(iw-(iw/zoom))/2,(iw-(iw/zoom))/2)':y='if(gte(zoom,1.5),(ih-(ih/zoom)),(ih-(ih/zoom)))',setpts=PTS-STARTPTS`,//thu nhỏ trục ngang dưới cố định
    `zoompan=z='if(eq(on,1),1.6,max(1,zoom-0.005))':d=25*${duration}:x='if(gte(zoom,1.5),x,x-1/a)':y='if(gte(zoom,1.5),y,y-1)',setpts=PTS-STARTPTS`,//thu nhỏ từ trái lên
    `zoompan=z='if(lte(mod(on,25*2*${duration}),25*${duration}),min(zoom+0.005,2),max(zoom-0.005,2))':d=25*${duration}:x='iw/2-(iw/zoom/2)':` ,//giữa ra xuống dưới phóng to
    `pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='if(lte(mod(on,25*2*${duration}),25*${duration}),min(zoom+0.0056,2),max(zoom-0.0056,2))':d=25*${duration}:x='iw/2-(iw/zoom/2)'`,//giữa ra xuống dưới
    `pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='if(lte(mod(on,25*2*${duration}),25*${duration}),min(zoom+0.0056,2),max(zoom-0.0056,1))':d=25*${duration}:x='(iw/2)-(iw/zoom/2)':y='(ih/2)-(ih/zoom/2)'`,//giữa ra lên trên
    `pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='if(lte(mod(on,25*2*${duration}),25*${duration}),min(zoom+0.0056,2),max(zoom-0.0056,1))':d=25*${duration}:x='iw/2-(iw/zoom/2)'`, //giữa ra xuống dưới

    `pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='if(lte(mod(on,25*2*${duration}),25*${duration}),min(zoom+0.0056,2),max(zoom-0.0056,1))':d=25*${duration}:x='(ow-iw)/2-(iw/zoom)/2':y='(oh-ih)/2'`,//trái sang phải xuống dưới
    `pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='if(lte(mod(on,25*2*${duration}),25*${duration}),min(zoom+0.0056,2),max(zoom-0.0056,1))':d=25*${duration}:y='0'`,//trái sang phải xuống dưới
    `pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='if(lte(mod(on,25*2*${duration}),25*${duration}),min(zoom+0.0056,2),max(zoom-0.0056,1))':d=25*${duration}:x='iw-iw/zoom'`,//phải sang trái xuống dưới
    `pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='if(lte(mod(on,25*2*${duration}),25*${duration}),min(zoom+0.0056,2),max(zoom-0.0056,1))':d=25*${duration}:y='ih-ih/zoom'`,//dưới lên sang phải
    `pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='if(lte(mod(on,25*2*${duration}),25*${duration}),min(zoom+0.0056,2),max(zoom-0.0056,1))':d=25*${duration}:x='iw-iw/zoom'`,//xuống dưới sang trái




  ]
  const randomNumber = Math.floor(Math.random() * 3);
const ffmpegProcess = ffmpeg()
  .input(imageListFile)
  .input(audioListFile)
  .videoFilter(videoFilter[randomNumber])
  .outputOptions([
    '-c:v libx264',   // Sử dụng codec video libx264
    '-c:a aac',
    '-shortest',
    '-preset', 'ultrafast', // Sử dụng preset nhanh hơn
    '-crf 28',
    '-r 25',
    '-b:a 128k'
  ])
  .on('start', commandLine => console.log(`Spawned Ffmpeg with command: ${commandLine}`))
  .on('end', () => {
    console.log('Processing finished!');
  })
  .on('error', (err) => {
    console.error('Error:', err);
  })
  .save(`${rootFolder}/outputVideo/${outputVideo}.mp4`);

// Wrap ffmpeg execution in a promise
const promise = new Promise((resolve, reject) => {
  ffmpegProcess.on('end', () => {
    resolve();  // Resolve the promise on success
  });
  ffmpegProcess.on('error', (err, stdout, stderr) => {
    console.error('Error:', err.message);
    console.error('ffmpeg stderr:', stderr);
    reject(err);  // Reject the promise on error
  });
});

// Usage example:
promise
  .then(() => {
    console.log('FFmpeg process completed successfully.');
  })
  .catch((err) => {
    console.error('FFmpeg process failed:', err);
  });

    console.log('Processing finished!');
    return Promise.resolve;
  } catch (err) {
    console.error('An error occurred during video creation:', err);
    console.log('try again');
    try{
    createVideo(imageListFile, audioListFile, outputVideo);
    } catch{}

    tryAgainCount++;
    if(tryAgainCount>2) return Promise.resolve;
  }
}
*/

async function createVideo(imageListFile, audioListFile, outputVideo) {
  let tryAgainCount=0
  try { 
  const backgroundPath = 'background.jpg'
  const duration = Math.ceil(await getVideoDuration(path.join(__dirname,audioListFile)));
  const videoFilter = [
      `zoompan=z='if(eq(on,1),1.3,max(1,zoom-0.0056))':d=25*${duration}:x='iw*(1-zoom)':y='ih*(1-zoom)'`,
      `zoompan=z='if(eq(on,1),1.3,max(1,zoom-0.0056))':d=25*${duration}:x='0':y='ih*(1-zoom)'`,
      `zoompan=z='if(eq(on,1),1.3,max(1,zoom-0.0056))':d=25*${duration}:x='iw*(1-zoom)':y='0'`,
                `zoompan=z='if(eq(on,1),1.3,max(1,zoom-0.0056))':d=25*${duration}`,
        `zoompan=z='min(zoom+0.0056,1.3)':d=25*${duration}`,
                `zoompan=z='if(eq(on,1),1.5,max(1,zoom-0.005))':d=25*${duration}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'`,
        `zoompan=z='min(zoom+0.005,1.5)':d=25*${duration}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'`,
    `zoompan=z='if(eq(on,1),1.6,max(1,zoom-0.005))':d=25*${duration}:x='if(gte(zoom,1.5),x,x-1/a)':y='if(gte(zoom,1.5),y,y-1)'`,//thu nhỏ từ trái lên
    `zoompan=z='if(eq(on,1),1.5,max(1,zoom-0.005))':d=25*${duration}:x='if(gte(zoom,1.5),(iw-(iw/zoom))/2,(iw-(iw/zoom))/2)':y='if(gte(zoom,1.5),(ih-(ih/zoom)),(ih-(ih/zoom)))'`,//thu nhỏ trục ngang dưới cố định
    `zoompan=z='if(eq(on,1),1.6,max(1,zoom-0.005))':d=25*${duration}:x='if(gte(zoom,1.5),x,x-1/a)':y='if(gte(zoom,1.5),y,y-1)'`,//thu nhỏ từ trái lên
      `zoompan=z='min(zoom+0.005,1.3)':d=25*${duration}:x='if(gte(zoom,1.3),x,x+1/a)':y='if(gte(zoom,1.3),y,y+1)'`,//phóng to random quan trọng dùng cho ca video cũng được
  `crop=640:720,zoompan=z='min(zoom+0.005,2)':d=25*${duration}:x='if(gte(zoom,2),x,x+1/a)':y='if(gte(zoom,2),y,y+1)':s=640x720:`,//phóng to random quan trọng dùng cho ca video cũng được
    `crop=640:720,zoompan=z='if(eq(on,1),1.5,max(1,zoom-0.0056))':d=25*${duration}:x='if(gte(zoom,1.5),(iw-(iw/zoom))/2,(iw-(iw/zoom))/2)':y='if(gte(zoom,1.5),(ih-(ih/zoom)),(ih-(ih/zoom)))':s=640x720`,//thu nhỏ trục ngang dưới cố định
    `crop=640:720,zoompan=z='if(eq(on,1),1.6,max(1,zoom-0.0056))':d=25*${duration}:x='if(gte(zoom,1.5),x,x-1/a)':y='if(gte(zoom,1.5),y,y-1)':s=640x720`,//thu nhỏ từ trái lên
    `crop=640:720,zoompan=z='if(lte(mod(on,25*2*${duration}),25*${duration}),min(zoom+0.005,2),max(zoom-0.005,2))':d=25*${duration}:x='iw/2-(iw/zoom/2)':s=640x720` ,//giữa ra xuống dưới phóng to

    `crop=640:720,zoompan=z='min(max(zoom,pzoom)+0.005,1.5)':d=25*${duration}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=640x720`,
    `crop=640:720,zoompan=z='min(zoom+0.005,2)':d=25*${duration}:x='if(gte(zoom,2),x,x+1/a)':y='if(gte(zoom,2),y,y+1)':s=640x720`,//phóng to random quan trọng dùng cho ca video cũng 
    `crop=640:720,zoompan=z='if(eq(on,1),1.5,max(1,zoom-0.0056))':d=25*${duration}:x='if(gte(zoom,1.5),(iw-(iw/zoom))/2,(iw-(iw/zoom))/2)':y='if(gte(zoom,1.5),(ih-(ih/zoom)),(ih-(ih/zoom)))':s=640x720`,//thu nhỏ trục ngang dưới cố định
    `crop=640:720,zoompan=z='if(eq(on,1),1.6,max(1,zoom-0.0056))':d=25*${duration}:x='if(gte(zoom,1.5),x,x-1/a)':y='if(gte(zoom,1.5),y,y-1)':s=640x720`,//thu nhỏ từ trái lên




    `crop=640:720,zoompan=z='min(max(zoom,pzoom)+0.0025,1.5)':d=125:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=640x720`,
    `crop=640:720,zoompan=z='min(zoom+0.0025,2)':d=125:x='if(gte(zoom,2),x,x+1/a)':y='if(gte(zoom,2),y,y+1)':s=640x720`,//phóng to random quan trọng dùng cho ca video cũng được
    `crop=640:720,zoompan=z='if(eq(on,1),2,max(1,zoom-0.0056))':d=125:x='if(gte(zoom,1.5),(iw-(iw/zoom))/2,(iw-(iw/zoom))/2)':y='if(gte(zoom,1.5),0,(ih-(ih/zoom))/2)':s=640x720`,//thu nhỏ vào giữa màn hình
    `crop=640:720,zoompan=z='if(eq(on,1),1.5,max(1,zoom-0.0056))':d=25*${duration}:x='if(gte(zoom,1.5),(iw-(iw/zoom))/2,(iw-(iw/zoom))/2)':y='if(gte(zoom,1.5),(ih-(ih/zoom)),(ih-(ih/zoom)))':s=640x720`,//thu nhỏ trục ngang dưới cố định

    `crop=640:720,zoompan=z='if(eq(on,1),2,max(1,zoom-0.0056))':d=25*${duration}:x='if(gte(zoom,1.5),x,x-1/a)':y='if(gte(zoom,1.5),y,y-1)':s=640x720`,//thu nhỏ từ trái lên
    `pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='if(lte(mod(on,25*2*${duration}),25*${duration}),min(zoom+0.0056,2),max(zoom-0.0056,2))':d=25*${duration}:x='iw/2-(iw/zoom/2)'`,//giữa ra xuống dưới
    `pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='if(lte(mod(on,25*2*${duration}),25*${duration}),min(zoom+0.0056,2),max(zoom-0.0056,1))':d=25*${duration}:x='(iw/2)-(iw/zoom/2)':y='(ih/2)-(ih/zoom/2)'`,//giữa ra lên trên
    `pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='if(lte(mod(on,25*2*${duration}),25*${duration}),min(zoom+0.0056,2),max(zoom-0.0056,1))':d=25*${duration}:x='iw/2-(iw/zoom/2)'`, //giữa ra xuống dưới

    `pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='if(lte(mod(on,25*2*${duration}),25*${duration}),min(zoom+0.0056,2),max(zoom-0.0056,1))':d=25*${duration}:x='(ow-iw)/2-(iw/zoom)/2':y='(oh-ih)/2'`,//trái sang phải xuống dưới
    `pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='if(lte(mod(on,25*2*${duration}),25*${duration}),min(zoom+0.0056,2),max(zoom-0.0056,1))':d=25*${duration}:y='0'`,//trái sang phải xuống dưới
    `pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='if(lte(mod(on,25*2*${duration}),25*${duration}),min(zoom+0.0056,2),max(zoom-0.0056,1))':d=25*${duration}:x='iw-iw/zoom'`,//phải sang trái xuống dưới
    `pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='if(lte(mod(on,25*2*${duration}),25*${duration}),min(zoom+0.0056,2),max(zoom-0.0056,1))':d=25*${duration}:y='ih-ih/zoom'`,//dưới lên sang phải
    `pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='if(lte(mod(on,25*2*${duration}),25*${duration}),min(zoom+0.0056,2),max(zoom-0.0056,1))':d=25*${duration}:x='iw-iw/zoom'`,//xuống dưới sang trái




  ]
  const randomNumber = Math.floor(Math.random() * 5);
  const ffmpegProcess = ffmpeg()
  .input(imageListFile)
  .input(backgroundPath)
  .input(audioListFile) // Verify this is an audio file
  .complexFilter([
    '[0]scale=iw-20:ih-20[padded]',
    '[1][padded]scale2ref=w=iw+20:h=ih+20[bg][padded]',
    '[bg][padded]overlay=(W-w)/2:(H-h)/2[draw]',
    '[draw]drawtext=text=`Engsub comics`:fontsize=30:fontcolor=white@0.2:x=(w-text_w)/2:y=(h-text_h)/2[image]',
    `[image]${videoFilter[randomNumber]}`
])
 /* .complexFilter([
    '[0]scale=iw:ih[padded]',
    '[1][padded]scale2ref=w=iw:h=ih[bg][padded]',
    '[bg][padded]overlay=(W-w)/2:(H-h)/2[draw]',
    '[draw]drawtext=text=`Engsub comics`:fontsize=30:fontcolor=white@0.2:x=(w-text_w)/2:y=(h-text_h)/2[image]',
    `[image]${videoFilter[randomNumber]}`
])*/
  .outputOptions([
//    '-filter_complex', `${videoFilter[randomNumber]}`,
    '-c:v libx264',     // Sử dụng codec video `libx264`
    '-crf 23',          // Đặt giá trị CRF để điều khiển chất lượng video (0-51, giá trị thấp hơn tương đương với chất lượng cao hơn)
    '-preset veryfast',   // Sử dụng preset để cân bằng giữa tốc độ và chất lượng
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
  .save(`${rootFolder}/outputVideo/${outputVideo}.mp4`);

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
    return Promise.resolve;
   
    console.error('An error occurred during video creation:', err);
    console.log('try again ',tryAgainCount);
    tryAgainCount++;
      if(tryAgainCount>2) {
      tryAgainCount=0
      return Promise.resolve};
      }
       /*
    try{
          createVideo(imageListFile, audioListFile, outputVideo,tryAgainCount);
    }catch{}
*/
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
      .save(`${rootFolder}/outputVideo/` + outputVideo + ".mp4");

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
  filename = RootFolder+"/VideoTranslated/"+VideoIndex+"_"+videoID;
  rootFolder = RootFolder;
  videoIndex = VideoIndex;
   imagesDir = `${rootFolder}/images/${videoIndex}`;
  audioDir = `${rootFolder}/mp3/${videoIndex}`;
  if(!fs.existsSync(`${rootFolder}/imageFileList/${videoIndex}`)) fs.mkdirSync(`${rootFolder}/imageFileList/${videoIndex}`)
    else{
      fs.rmdirSync(`${rootFolder}/imageFileList/${videoIndex}`, { recursive: true, force: true })
      fs.mkdirSync(`${rootFolder}/imageFileList/${videoIndex}`)
    }
  if(!fs.existsSync(`${rootFolder}/audioFileList/${videoIndex}`)) fs.mkdirSync(`${rootFolder}/audioFileList/${videoIndex}`)
    else{
      fs.rmdirSync(`${rootFolder}/audioFileList/${videoIndex}`, { recursive: true, force: true })
      fs.mkdirSync(`${rootFolder}/audioFileList/${videoIndex}`)
  }
  if(!fs.existsSync(`${rootFolder}/outputVideo/${videoIndex}`)) fs.mkdirSync(`${rootFolder}/outputVideo/${videoIndex}`)
    else{
      fs.rmdirSync(`${rootFolder}/outputVideo/${videoIndex}`, { recursive: true, force: true })
      fs.mkdirSync(`${rootFolder}/outputVideo/${videoIndex}`)
    }
    await createTxtThenCreateVideo();
}
module.exports = runMakeVideo;
//runMakeVideo()
