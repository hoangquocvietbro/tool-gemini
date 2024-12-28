const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require("ffmpeg-static");
const readline = require('readline');


const args = process.argv.slice(2);
// Kiểm tra nếu có tham số truyền vào
    let startIndex = 0; // lấy tham số đầu tiên
    let endIndex = 300; // lấy tham số thứ hai
if (args[0]) {
     startIndex = args[0]; // lấy tham số đầu tiên
}
if (args[1]) {
     endIndex = args[1]; // lấy tham số thứ hai
}

if (fs.existsSync("/usr/bin/ffmpeg")) ffmpeg.setFfmpegPath("/usr/bin/ffmpeg");
else ffmpeg.setFfmpegPath(ffmpegPath);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Please enter the path to the video directory: ', (inputDir) => {
  const videoDir = path.resolve(inputDir);

  // Get all video files in the directory
  const videoFiles = fs.readdirSync(videoDir).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ext === '.mp4' || ext === '.avi' || ext === '.mov'; // add other video formats if needed
  });

  if (videoFiles.length === 0) {
    console.log('No video files found in the specified directory.');
    rl.close();
    process.exit(1);
  }

  // Create a file list for ffmpeg
  if(fs.existsSync(path.join(videoDir, 'output.mp4'))) fs.unlinkSync(path.join(videoDir, 'output.mp4'));
  const fileListPath = path.join(videoDir, 'filelist.txt');
  let fileListContent = videoFiles.map(file => `file '${path.join(videoDir, file)}'`).join('\n');

  if(startIndex&&endIndex) fileListContent = videoFiles.slice(startIndex,endIndex).map(file => `file '${path.join(videoDir, file)}'`).join('\n');

  fs.writeFileSync(fileListPath, fileListContent);

  // Concatenate videos using ffmpeg
ffmpeg()
  .input(fileListPath)
  .inputOptions('-f concat')
  .inputOptions('-safe 0')
  .outputOption('-c copy')
  .on('start', (cmdline) => {
    console.log('Spawned FFmpeg with command: ' + cmdline);
  })
  .on('end', () => {
    console.log('Videos have been concatenated successfully.');
    fs.unlinkSync(fileListPath); // clean up
    rl.close();
  })
  .on('stderr', (stderrLine) => {
    console.warn('FFmpeg stderr: ' + stderrLine);
  })
  .on('error', (err) => {
    console.error('An error occurred: ' + err.message);
    fs.unlinkSync(fileListPath); // clean up
    rl.close();
  })
  .save(path.join(videoDir, 'output.mp4'));

});
