const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const ffprobePath = require("ffprobe-static").path;

if (fs.existsSync("/usr/bin/ffmpeg")) {
  ffmpeg.setFfmpegPath("/usr/bin/ffmpeg");
} else {
  ffmpeg.setFfmpegPath(ffmpegPath);
}
ffmpeg.setFfprobePath(ffprobePath);

const inputPath = "./PLc2ttf_U-sGMyBUJRND7Qod9SAQxvXpEG/originVideo/videoplayback1000001.mp4";
const outputDir = "./CaoVoXuyenKhong/originVideo";
const segmentDuration = 5 * 60; // 5 minutes in seconds

async function splitVideo() {
  let timeToCut = 0;
  let indexName = 0;

  // Ensure the output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  while (true) {
    console.log(`Processing segment ${indexName}`);
    const outputPath = `${outputDir}/videoplayback${indexName + 1000000}.mp4`;

    try {
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .setStartTime(timeToCut)
          .setDuration(segmentDuration)
          .output(outputPath)
          .on("end", () => {
            console.log(`Created segment: ${outputPath}`);
            resolve();
          })
          .on("error", (err) => {
            if (err.message.includes("Input file is shorter")) {
              console.log("No more segments to process.");
              resolve();
            } else {
              console.error(`Error creating segment: ${err.message}`);
              reject(err);
            }
          })
          .run();
      });

      // Increment the start time and segment index for the next iteration
      timeToCut += segmentDuration;
      indexName++;
    } catch (err) {
      console.error(`Failed to process segment ${indexName}: ${err.message}`);
      break;
    }
  }
}

splitVideo();
