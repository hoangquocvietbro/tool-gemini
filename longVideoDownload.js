const fs = require("fs");
  const youtubeVideoDownload = require("./youtubeVideoDownload");
  const longYoutubeVideoDownload = require("./longYoutubeVideoDownload");
const removeAudioFromVideo = require("./removeAudioFromVideo");
const youtubeVideoDownloadWithFormat = require("./youtubeVideoDownloadWithFormat");
const createTimeStamps = require("./createTimeStamps");
const sendVideoToGemini = require("./sendVideoToGemini");
const cutVideoByTimeStampThenSendToGemini = require("./cutVideoByTimeStampThenSendToGemini");
const cutVideoByTimeStampThenConvertToText = require("./cutVideoByTimeStampThenConvertToText");
const cutVideoThenSpeechToTextPhoWhisper = require("./cutVideoThenSpeechToTextPhoWhisper")
const sendVideoAndSubToReSub = require("./sendAudioAndSubToReSub");
const sendVideoToGeminiChatTwo = require("./sendVideoToGeminiChatTwo");
const reSendVideoToGemini = require("./reSendVideoToGemini");
const sendFileToGeminiToTranslateText = require("./sendFileToGeminiToTranslateText");
const extractImageAndMakeMp3 = require("./extractImageAndMakeMp3");
const createVideoFromImagesAndMp3Folder = require("./createVideoFromImagesAndMp3Folder");
const extractImageAndMakeMp3VN = require("./extractImageAndMakeMp3VN");
const createVideoFromImagesAndMp3FolderVN = require("./createVideoFromImagesAndMp3FolderVN");
const { error } = require("console");
const youtubeVideoDownloadAudioOnly = require("./youtubeVideoDownloadAudioOnly");
async function Run() {
  let apiKeys = process.env.API_KEY_PROCESS_SEGMENT.split("|");
  fs.writeFileSync("Log.txt", "");

  if (!fs.existsSync("LogErrorIndex.txt"))
    fs.writeFileSync("./LogErrorIndex.txt", "");
  const textData = fs.readFileSync("./LogErrorIndex.txt", "utf-8");
  let youtubeChannel = "QuanQueReview";
  let rootFolder = `${Date.now()}`;
  let index = 0;
  fs.writeFileSync("LogErrorIndex.txt",'');

  const urls = fs
    .readFileSync("./youtubeLinks.txt", "utf-8")
    .split("\n")
    .filter((line) => line.trim() !== "");

  for (const url of urls) {
    const urlParams = new URLSearchParams(url);
    if (!urlParams) continue;
    let indexInLink = parseInt(urlParams.get("index"));
    let videoID = urlParams.get("https://www.youtube.com/watch?v");
    rootFolder = videoID
    if (indexInLink) {
      index = indexInLink;
      console.log("Index:", index);  Output: Index: 5
    } else {
      index++;
      console.log("Index not found in the URL");
    }
    if (!fs.existsSync(youtubeChannel)) {
      fs.mkdirSync(youtubeChannel);
    }
    if (!fs.existsSync(rootFolder)) {
      fs.mkdirSync(rootFolder);
    }
        [
      "./images",
      "./mp3",
      "./mp3Video",
      "./audioFileList",
      "./imageFileList",
      "./videoFileList",
      "./outputVideo",
      "./originSub",
      "./translatedSub",
      "./originVideo",
      "./mp3VN",
      "./noAudioVideo",
      "./audioFileListVN",
      "./outputVideoVN",
      "./videoFileListVN",
      "./VideoVNmese",
      "./VideoTranslated",
      "./timeStamps",
      "./outputVideoSliced",
      "./SubTurnOne",
    ].forEach((dir, index, dirs) => {
      if (!fs.existsSync("./" + rootFolder + "/" + dir)) {
        fs.mkdirSync("./" + rootFolder + "/" + dir);
      }
    });
    if (index < 0) continue;
    index = 1000 + index;
      if (fs.existsSync("./" + rootFolder + "/" + "VideoVNmese/"+`${index}_null.mp4`)) continue;
      if (fs.existsSync("./" + rootFolder + "/" + "VideoVNmese/"+`${index}_.mp4`)) continue;
    //if (!textData.includes(index.toString())) continue;
    try { 

                console.log("Bắt đầu download video");
      try {
        try {
           longYoutubeVideoDownload(
            url,
            "./" + rootFolder + `/originVideo/videoplayback${index}.mp4`);
        } catch {
            longYoutubeVideoDownload(
            url,
            "./" + rootFolder + `/originVideo/videoplayback${index}.mp4`
          );
        }
      } catch {
          longYoutubeVideoDownload(
          url,
          "./" + rootFolder + `/originVideo/videoplayback${index}.mp4`
        );
      }
      console.log("Hoàn thành download video");

                  console.log("Bắt đầu download video chất lượng cao");
      try {
        try {
           youtubeVideoDownloadWithFormat(
            url,
            "./" + rootFolder + `/originVideo/videoHightQuality${index}.mp4`,'720p');
        } catch {
           youtubeVideoDownloadWithFormat(
            url,
            "./" + rootFolder + `/originVideo/videoHightQuality${index}.mp4`,'720p');
        }
      } catch {
           youtubeVideoDownloadWithFormat(
            url,
            "./" + rootFolder + `/originVideo/videoHightQuality${index}.mp4`,'720p');
      }
      console.log("Hoàn thành download video chất lượng cao");
     
    } catch (error) {
      console.error(error);
      console.error("Lỗi khi tạo video từ link" + url);
      fs.appendFileSync("Log.txt", "Lỗi khi tạo video từ link: " + url + "\n");
      fs.appendFileSync("LogErrorIndex.txt", index + "\n");
    }
  }

}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


Run();
