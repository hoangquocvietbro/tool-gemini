const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const readline = require('readline');
const { resolve } = require('dns');
const { rejects } = require('assert');

const cookies = [{"domain":".youtube.com","expirationDate":1750844013.85147,"hostOnly":false,"httpOnly":true,"name":"VISITOR_INFO1_LIVE","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":"0","value":"hf8GtEBrPmk"},{"domain":".youtube.com","expirationDate":1750844013.851706,"hostOnly":false,"httpOnly":true,"name":"VISITOR_PRIVACY_METADATA","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":"0","value":"CgJWThIEGgAgOQ%3D%3D"},{"domain":".youtube.com","expirationDate":1769678971.683911,"hostOnly":false,"httpOnly":true,"name":"HSID","path":"/","sameSite":"unspecified","secure":false,"session":false,"storeId":"0","value":"AH0_wIJl0TWHLR_k2"},{"domain":".youtube.com","expirationDate":1769678971.683953,"hostOnly":false,"httpOnly":true,"name":"SSID","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"ACR-FJrraNmqv78Pb"},{"domain":".youtube.com","expirationDate":1769678971.683993,"hostOnly":false,"httpOnly":false,"name":"APISID","path":"/","sameSite":"unspecified","secure":false,"session":false,"storeId":"0","value":"cNvg2IiHM1feU1cP/Aoap-Be8ma1qugN-W"},{"domain":".youtube.com","expirationDate":1769678971.684037,"hostOnly":false,"httpOnly":false,"name":"SAPISID","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"HZ9I10sHzi4ds3r7/AVCc26nexqbpkz938"},{"domain":".youtube.com","expirationDate":1769678971.684081,"hostOnly":false,"httpOnly":false,"name":"__Secure-1PAPISID","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"HZ9I10sHzi4ds3r7/AVCc26nexqbpkz938"},{"domain":".youtube.com","expirationDate":1769678971.684123,"hostOnly":false,"httpOnly":false,"name":"__Secure-3PAPISID","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":"0","value":"HZ9I10sHzi4ds3r7/AVCc26nexqbpkz938"},{"domain":".youtube.com","expirationDate":1769678971.683532,"hostOnly":false,"httpOnly":false,"name":"SID","path":"/","sameSite":"unspecified","secure":false,"session":false,"storeId":"0","value":"g.a000rAiz-f48HtD-nBu22eTGZlqH8ix2nusCGKcOlx4FGfgfvyhkH-AzRv5X4468QEKNSInuBQACgYKAZESARMSFQHGX2Mi5mf1s645X5-wQ182Kv58TBoVAUF8yKrlpCAI88-U99-YMeaYSz7j0076"},{"domain":".youtube.com","expirationDate":1769678971.683813,"hostOnly":false,"httpOnly":true,"name":"__Secure-1PSID","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"g.a000rAiz-f48HtD-nBu22eTGZlqH8ix2nusCGKcOlx4FGfgfvyhklqM-56FLliLi1s-_fwHYPgACgYKAScSARMSFQHGX2MiS1m9KJlvmeMdffd6ocYgZhoVAUF8yKrYhRvLFM71jvB5xRNWGV960076"},{"domain":".youtube.com","expirationDate":1769678971.683864,"hostOnly":false,"httpOnly":true,"name":"__Secure-3PSID","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":"0","value":"g.a000rAiz-f48HtD-nBu22eTGZlqH8ix2nusCGKcOlx4FGfgfvyhkONRXPhhQ7XaHcuRQHxNzZgACgYKAYUSARMSFQHGX2MiXLp3JMFsL0ZQ-REKhV1VWxoVAUF8yKo0ThhK_Jlr5_K7LVf7FeqI0076"},{"domain":".youtube.com","expirationDate":1769847301.212822,"hostOnly":false,"httpOnly":false,"name":"_ga","path":"/","sameSite":"unspecified","secure":false,"session":false,"storeId":"0","value":"GA1.1.339162215.1735287300"},{"domain":".youtube.com","expirationDate":1769847312.057716,"hostOnly":false,"httpOnly":false,"name":"_ga_HTXKR35SN9","path":"/","sameSite":"unspecified","secure":false,"session":false,"storeId":"0","value":"GS1.1.1735287301.1.1.1735287312.0.0.0"},{"domain":".youtube.com","expirationDate":1769934193.898278,"hostOnly":false,"httpOnly":false,"name":"PREF","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"tz=Asia.Bangkok&f7=100&f5=20000&hl=vi"},{"domain":".youtube.com","expirationDate":1769916231.506978,"hostOnly":false,"httpOnly":true,"name":"LOGIN_INFO","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":"0","value":"AFmmF2swRAIgE05zDUy27LcTMMkEGi2Z3lMb2S2BynjiaauyApLi748CIF4tSIqC3b_i3Yr2G9i8HuyG8f7w_iB03NmKLzYKEO8U:QUQ3MjNmeGtqckk0M29URWNub3gyY2swZS1fRmJ5UENXMVBFOGR2SWhGTktlTks2YzUzTHpjQzJBUnVDSW1XZ2txcjRNWHp6alI4eWQ0a1p4YlFTaGNsTmJEdzZ2X3kzSXQtWElZRUU4ODg4cXRPRXRiOUxUMFRyNm54dnVsWWphaFBJQmNCbHRWT1ZZUTRZVldLMjdadXNMamhpakFJeTln"},{"domain":".youtube.com","expirationDate":1735374199,"hostOnly":false,"httpOnly":false,"name":"ST-xuwub9","path":"/","sameSite":"unspecified","secure":false,"session":false,"storeId":"0","value":"session_logininfo=AFmmF2swRAIgE05zDUy27LcTMMkEGi2Z3lMb2S2BynjiaauyApLi748CIF4tSIqC3b_i3Yr2G9i8HuyG8f7w_iB03NmKLzYKEO8U%3AQUQ3MjNmeGtqckk0M29URWNub3gyY2swZS1fRmJ5UENXMVBFOGR2SWhGTktlTks2YzUzTHpjQzJBUnVDSW1XZ2txcjRNWHp6alI4eWQ0a1p4YlFTaGNsTmJEdzZ2X3kzSXQtWElZRUU4ODg4cXRPRXRiOUxUMFRyNm54dnVsWWphaFBJQmNCbHRWT1ZZUTRZVldLMjdadXNMamhpakFJeTln"},{"domain":".youtube.com","expirationDate":1766910197.425942,"hostOnly":false,"httpOnly":true,"name":"__Secure-1PSIDTS","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"sidts-CjEB7wV3sdU5r2t5hDw8Cqh59Jid7UvSIqMcdXUN-CcqV4Y3ZnnNq22szrNgCYA07W1lEAA"},{"domain":".youtube.com","expirationDate":1766910197.426083,"hostOnly":false,"httpOnly":true,"name":"__Secure-3PSIDTS","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":"0","value":"sidts-CjEB7wV3sdU5r2t5hDw8Cqh59Jid7UvSIqMcdXUN-CcqV4Y3ZnnNq22szrNgCYA07W1lEAA"},{"domain":".youtube.com","expirationDate":1766910197.470798,"hostOnly":false,"httpOnly":false,"name":"SIDCC","path":"/","sameSite":"unspecified","secure":false,"session":false,"storeId":"0","value":"AKEyXzVVT-nK-nhTfFXGAE8oxUnZRYxSTSWLEOY_l9DQL0PP7waPjVKv5Ot0gU9k7IQMB76KXDsO"},{"domain":".youtube.com","expirationDate":1766910197.470981,"hostOnly":false,"httpOnly":true,"name":"__Secure-1PSIDCC","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"AKEyXzWyUxUVKUqBmpwoUDBTjTtpzBvetOfB0UhSBo_Ve17z2F7FUDXDxKaZTZRz7-MsdQJ5fsvG"},{"domain":".youtube.com","expirationDate":1766910197.471073,"hostOnly":false,"httpOnly":true,"name":"__Secure-3PSIDCC","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":"0","value":"AKEyXzU2ESfrRVck794_A0YhJAWh7FWRLCnamJCzbHjH9ame81uUxx0t0FrffBGiXz0PJypK2Mc"}]
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
// (Optional) http-cookie-agent / undici agent options
// Below are examples, NOT the recommended options

// agent should be created once if you don't want to change your cookie
const agent = ytdl.createAgent(cookies);
console.log(agent)
async function listFormats(url,qualityLabel) {
  try {
    const info = await ytdl.getInfo(url, { agent });
    const formats = ytdl.filterFormats(info.formats, 'video', { agent });

    console.log('Available formats:');
    formats.forEach((format, index) => {
      console.log(`${index}: ${format.qualityLabel}, ${format.container}`);
    });
    const formatfilter= formats.filter((videoFormat)=>(videoFormat.container=='mp4' && videoFormat.qualityLabel==qualityLabel))
    return formats;
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
}

// Function to download YouTube video
async function downloadYouTubeVideo(url,format, outputPath) {
  try {
    const info = await ytdl.getInfo(url, { agent });
    const videoTitle = info.videoDetails.title;
    const videoReadableStream = ytdl(url, { format });

    let fileWritableStream = fs.createWriteStream(outputPath);
    videoReadableStream.pipe(fileWritableStream)

    const promise = new Promise((resolve, reject) => {
      fileWritableStream.on('finish', () => resolve());
    });
    await promise;
    console.log(`Downloaded: ${videoTitle}`)
    return Promise.resolve();
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
}

async function Run(videoUrl,outputFilePath,qualityLabel){
  // Read input from the command line
  const formats = await listFormats(videoUrl,qualityLabel);
  //const formats = await listFormats(videoUrl);
  await downloadYouTubeVideo(videoUrl, formats[0], outputFilePath);
  console.log("download format xong")
}

module.exports = Run;

//Run()
