const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const readline = require('readline');


const createTimeStampsFile = (rootPath,videoIndex) => {
    const inputVideoPath ="./" +rootPath+`/originVideo/videoplayback${videoIndex}.mp4`;
    const outputSenceFolder ="./" +rootPath+`/timeStamps`;
  return new Promise((resolve, reject) => {
    // Lấy độ dài của file
     const command = `scenedetect -i "${inputVideoPath}" detect-content -t 46 list-scenes --output "${outputSenceFolder}"`;
      console.log(command);
      exec(command, (error, stdout, stderr) => {
        if (error) {
          return reject(`Error trimming file: ${stderr}`);
        }
        resolve(`File saved: ${outputSenceFolder}`);
      });
  });
};
async function processTextFile(rootPath, videoIndex) {
  const inputVideoPath ="./" +rootPath+`/originVideo/videoplayback${videoIndex}.mp4`;
  const timeSenceChangeFilePath = "./" +rootPath+`/timeStamps/videoplayback${videoIndex}-Scenes.csv`;
  const timeStampsFilePath = "./" +rootPath+`/timeStamps/timeStamps${videoIndex}.txt`;
  let timeSenceChangeData = "";
   await readFirstLineCsv(timeSenceChangeFilePath).then((firstLine) => {
    console.log('First line:', firstLine); timeSenceChangeData = firstLine;
  }).catch((err) => {
    console.error(err);
  });
  const timeChangeSenceLines = timeSenceChangeData.split(",");
  timeChangeSenceLines.shift();
  let startTimeChangeSence = "00:00:00.000";
      fs.writeFileSync(timeStampsFilePath,""); 
  for(const timeChangeSenceLine of timeChangeSenceLines ){
    const endTimeChangeSence = timeChangeSenceLine;
    fs.appendFileSync(timeStampsFilePath,startTimeChangeSence.substring(3).replace(".",",")+'|'+endTimeChangeSence.substring(3).replace(".",",")+"\n");    
    startTimeChangeSence = endTimeChangeSence
  }
  fs.appendFileSync(timeStampsFilePath,startTimeChangeSence.substring(3).replace(".",",")+'|'+(await getVideoDuration(inputVideoPath).then().catch()).substring(3).replace(".",",")+"0"+"\n");   
}
async function readFirstLineCsv(filePath) {
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    rl.close(); // Đóng interface sau khi đọc dòng đầu tiên
    return line;
  }
}


function getVideoDuration(filePath) {
  return new Promise((resolve, reject) => {
      const command = `ffmpeg -i "${filePath}" 2>&1 | grep "Duration" | awk '{print $2}' | tr -d ,`;
      
      exec(command, (error, stdout, stderr) => {
          if (error) {
              reject(`exec error: ${error}`);
              return;
          }
          const duration = stdout.trim();
          resolve(duration);
      });
  });
}

async function Run(rootPath,videoIndex){
  await createTimeStampsFile(rootPath, videoIndex)
      .then()
      .catch(error => console.error(error));
  await processTextFile(rootPath, videoIndex)
}

module.exports = Run;

