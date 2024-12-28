const fs = require("fs");
const youtubeVideoDownload = require("./youtubeVideoDownload");
const youtubeVideoDownloadWithFormat = require("./youtubeVideoDownloadWithFormat");
const sendVideoToGemini = require("./sendVideoToGemini");
const cutVideoByTimeStampThenSendToGemini = require("./cutVideoByTimeStampThenSendToGemini");
const sendVideoAndSubToReSub = require("./sendVideoAndSubToReSub");
const sendVideoToGeminiChatTwo = require("./sendVideoToGeminiChatTwo");
const sendFileToGeminiToTranslateText = require("./sendFileToGeminiToTranslateTextTHAILAN");
const extractImageAndMakeMp3 = require("./extractImageAndMakeMp3");
const createVideoFromImagesAndMp3Folder = require("./createVideoFromImagesAndMp3Folder");
const extractImageAndMakeMp3THAILAN = require("./extractImageAndMakeMp3THAILAN");
const createVideoFromImagesAndMp3FolderTHAILAN = require("./createVideoFromImagesAndMp3FolderTHAILAN");
const { error } = require("console");
const youtubeVideoDownloadAudioOnly = require("./youtubeVideoDownloadAudioOnly");
async function Run() {
  let apiKeys = process.env.API_KEY.split("|");
  fs.writeFileSync("Log.txt", "");

  if (!fs.existsSync("LogErrorIndex.txt"))
    fs.writeFileSync("./LogErrorIndex.txt", "");
  const textData = fs.readFileSync("./LogErrorIndex.txt", "utf-8");
  let rootFolder = `${Date.now()}`;
  let index = 0;
  //fs.writeFileSync("LogErrorIndex.txt",'');

  const urls = fs
    .readFileSync("./youtubeLinks.txt", "utf-8")
    .split("\n")
    .filter((line) => line.trim() !== "");
  //run

  for (const url of urls) {
    const urlParams = new URLSearchParams(url);
    if (!urlParams) continue;
    let indexInLink = parseInt(urlParams.get("index"));
    let videoID = urlParams.get("https://www.youtube.com/watch?v");
    if (indexInLink) {
      index = indexInLink;
      console.log("Index:", index); // Output: Index: 5
    } else {
      index++;
      console.log("Index not found in the URL");
    }
    if (urlParams.get("list")) rootFolder = urlParams.get("list");
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
        "./translatedSubTHAILAN",
        "./originVideo",
        "./mp3THAILAN",
        "./audioFileListTHAILAN",
        "./outputVideoTHAILAN",
        "./videoFileListTHAILAN",
        "./VideoTHAILANmese",
        "./VideoTranslated",
        "./timeStamps",
        "./outputVideoSliced",
        "./SubTurnOne",
      ].forEach((dir, index, dirs) => {

            if (!fs.existsSync("./" + rootFolder + "/" + dir)) {
      fs.mkdirSync("./" + rootFolder + "/" + dir);
    }
      });
    if (index < 25) continue;
    index = 1000000 + index;
    //if (!textData.includes(index.toString())) continue;
    try {
      // console.log("Bắt đầu download video");
      // try {
      //   try {
      //     await youtubeVideoDownload(
      //       url,
      //       "./" + rootFolder + `/originVideo/videoplayback${index}.mp4`
      //     );
      //   } catch {
      //     await youtubeVideoDownload(
      //       url,
      //       "./" + rootFolder + `/originVideo/videoplayback${index}.mp4`
      //     );
      //   }
      // } catch {
      //   await youtubeVideoDownload(
      //     url,
      //     "./" + rootFolder + `/originVideo/videoplayback${index}.mp4`
      //   );
      // }
      // console.log("Hoàn thành download video");

      // console.log("Bắt đầu download video âm thanh");
      // try {
      //   try {
      //     await youtubeVideoDownloadAudioOnly(
      //       url,
      //       "./" + rootFolder + `/mp3Video/videoplayback${index}.mp3`,
      //       "480p"
      //     );
      //   } catch {
      //     await youtubeVideoDownloadAudioOnly(
      //       url,
      //       "./" + rootFolder + `/mp3Video/videoplayback${index}.mp3`,
      //       "480p"
      //     );
      //   }
      // } catch {
      //   await youtubeVideoDownloadAudioOnly(
      //     url,
      //     "./" + rootFolder + `/mp3Video/videoplayback${index}.mp3`,
      //     "480p"
      //   );
      // }

      // console.log("Hoàn thành download video âm thanh");
      
      // console.log("Bắt đầu chuyển video thành văn bản");
      // try {
      //   try {
      //     await sendVideoToGemini(rootFolder, index, apiKeys[5]);
      //   } catch {
      //     await sendVideoToGemini(rootFolder, index, apiKeys[4]);
      //   }
      // } catch {
      //   await sendVideoToGemini(rootFolder, index, apiKeys[3]);
      // }
      // try {
      //   try {
      //     await cutVideoByTimeStampThenSendToGemini(rootFolder, index,apiKeys[0]);
      //   } catch {
      //     await cutVideoByTimeStampThenSendToGemini(rootFolder, index,apiKeys[1]);
      //   }
      // } catch {
      //   await cutVideoByTimeStampThenSendToGemini(rootFolder, index,apiKeys[2]);
      // }
      // await wait(100000);
      // try {
      //   try {
      //     try {
      //       try {
      //         await sendVideoAndSubToReSub(rootFolder, index, apiKeys[3]);
      //       } catch (error) {
      //         console.log(error);
      //         await sendVideoAndSubToReSub(rootFolder, index, apiKeys[4]);
      //       }
      //     } catch (error) {
      //       console.log(error);
      //       await sendVideoAndSubToReSub(rootFolder, index, apiKeys[5]);
      //     }
      //   } catch (error) {
      //     console.log(error);
      //     await sendVideoAndSubToReSub(rootFolder, index, apiKeys[2]);
      //   }
      // } catch (error) {
      //   console.log(error);
      //   await sendVideoAndSubToReSub(rootFolder, index, apiKeys[4]);
      // }

      // // await wait(100000);
      // // try {
      // //   try {
      // //     try {
      // //       try {
      // //         await sendVideoAndSubToReSub(rootFolder, index, apiKeys[4]);
      // //       } catch (error) {
      // //         console.log(error);
      // //         await sendVideoAndSubToReSub(rootFolder, index, apiKeys[1]);
      // //       }
      // //     } catch (error) {
      // //       console.log(error);
      // //       await sendVideoAndSubToReSub(rootFolder, index, apiKeys[5]);
      // //     }
      // //   } catch (error) {
      // //     console.log(error);
      // //     await sendVideoAndSubToReSub(rootFolder, index, apiKeys[2]);
      // //   }
      // // } catch (error) {
      // //   console.log(error);
      // //   await sendVideoAndSubToReSub(rootFolder, index, apiKeys[3]);
      // // }
     
      // // await wait(100000);
      // // try {
      // //   try {
      // //     try {
      // //       try {
      // //         await sendVideoAndSubToReSub(rootFolder, index, apiKeys[5]);
      // //       } catch (error) {
      // //         console.log(error);
      // //         await sendVideoAndSubToReSub(rootFolder, index, apiKeys[4]);
      // //       }
      // //     } catch (error) {
      // //       console.log(error);
      // //       await sendVideoAndSubToReSub(rootFolder, index, apiKeys[3]);
      // //     }
      // //   } catch (error) {
      // //     console.log(error);
      // //     await sendVideoAndSubToReSub(rootFolder, index, apiKeys[2]);
      // //   }
      // // } catch (error) {
      // //   console.log(error);
      // //   await sendVideoAndSubToReSub(rootFolder, index, apiKeys[4]);
      // // }

      // console.log("Hoàn thành chuyển video thành văn bản");
      // console.log("Bắt đầu download video chất lượng cao");
      // try {
      //   try {
      //     await youtubeVideoDownloadWithFormat(
      //       url,
      //       "./" + rootFolder + `/mp3Video/videoplayback${index}.mp4`,
      //       "480p"
      //     );
      //   } catch {
      //     await youtubeVideoDownloadWithFormat(
      //       url,
      //       "./" + rootFolder + `/mp3Video/videoplayback${index}.mp4`,
      //       "480p"
      //     );
      //   }
      // } catch {
      //   await youtubeVideoDownloadWithFormat(
      //     url,
      //     "./" + rootFolder + `/mp3Video/videoplayback${index}.mp4`,
      //     "480p"
      //   );
      // }

      // console.log("Hoàn thành download video chất lượng cao");
      

      console.log("Hoàn thành exatract image và download mp3 file THAILAN");
      console.log("Bắt đầu tạo video THAILAN");
      try {
        try {
          await createVideoFromImagesAndMp3FolderTHAILAN(rootFolder, index, videoID);
        } catch {
          await createVideoFromImagesAndMp3FolderTHAILAN(rootFolder, index, videoID);
        }
      } catch {
        await createVideoFromImagesAndMp3FolderTHAILAN(rootFolder, index, videoID);
      }

      console.log("Kết thúc tạo video THAILAN");

      // console.log("Bắt đầu exatract image và download mp3 file đã dịch");
      // try {
      //   try {
      //     await extractImageAndMakeMp3(rootFolder, index, apiKeys[0]);
      //   } catch {
      //     await extractImageAndMakeMp3(rootFolder, index, apiKeys[1]);
      //   }
      // } catch {
      //   await extractImageAndMakeMp3(rootFolder, index, apiKeys[2]);
      // }
      //   await wait(60000)
      // console.log("Hoàn thành exatract image và download mp3 file đã dịch");
      // console.log("Bắt đầu tạo video dịch");
      // try {
      //   try {
      //     await createVideoFromImagesAndMp3Folder(rootFolder, index, videoID);
      //   } catch {
      //     await createVideoFromImagesAndMp3Folder(rootFolder, index, videoID);
      //   }
      // } catch {
      //   await createVideoFromImagesAndMp3Folder(rootFolder, index, videoID);
      // }

      // console.log("Kết thúc tạo video dịch");
    } catch (error) {
      console.error(error);
      console.error("Lỗi khi tạo video từ link" + url);
      fs.appendFileSync("Log.txt", "Lỗi khi tạo video từ link: " + url + "\n");
      fs.appendFileSync("LogErrorIndex.txt", index + "\n");
    }
  }
  console.log("Hoàn thành toàn bộ");
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


Run();
