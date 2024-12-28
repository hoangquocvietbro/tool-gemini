const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const readline = require('readline');
const { resolve } = require('dns');
const { rejects } = require('assert');

const cookies = [{"domain":".youtube.com","expirationDate":1737466010.12058,"hostOnly":false,"httpOnly":true,"name":"NID","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"516=bA_UCrab7s908vvckC1ObWAUr04GFlv0kO6MOpgbdyrzibrYDpv8cZJAQSM-vLzNHIMJijUL6Mu9zBA6oxzYfUjX624esCujmDqmprngtxzfeIZQaqprAalBUkDkA5Gcmlv7LxyVH-HkfQU2dx17kQjPzJjjgNPknwf_UgQxib82zILSXTUFDxVYouNj0etynXGFRrjYwR1z55qfO_o5fByLK0O3yAEmBWS06fM_ZmdyiFo","index":0,"isSearch":false},{"domain":".youtube.com","expirationDate":1769928896.338542,"hostOnly":false,"httpOnly":false,"name":"PREF","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"f4=4000000&f6=40000000&tz=Asia.Bangkok&f7=100&f5=20000&hl=en","index":1,"isSearch":false},{"domain":".youtube.com","expirationDate":1769928807.35236,"hostOnly":false,"httpOnly":false,"name":"__Secure-3PAPISID","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":"0","value":"Ls0YN24V5Ot98UCs/AB50FP_CUGY33bk69","index":2,"isSearch":false},{"domain":".youtube.com","expirationDate":1769928807.352039,"hostOnly":false,"httpOnly":true,"name":"HSID","path":"/","sameSite":"unspecified","secure":false,"session":false,"storeId":"0","value":"A1WByBS8LFALhdcwI","index":3,"isSearch":false},{"domain":".youtube.com","expirationDate":1769928807.352166,"hostOnly":false,"httpOnly":true,"name":"SSID","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"Ay-Md84irRwnxIlbc","index":4,"isSearch":false},{"domain":".youtube.com","expirationDate":1769928807.352202,"hostOnly":false,"httpOnly":false,"name":"APISID","path":"/","sameSite":"unspecified","secure":false,"session":false,"storeId":"0","value":"ZkM18QePz9Hlaiiq/ARC11zT9zcgrMsH5T","index":5,"isSearch":false},{"domain":".youtube.com","expirationDate":1769928807.352236,"hostOnly":false,"httpOnly":false,"name":"SAPISID","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"Ls0YN24V5Ot98UCs/AB50FP_CUGY33bk69","index":6,"isSearch":false},{"domain":".youtube.com","expirationDate":1769928807.35229,"hostOnly":false,"httpOnly":false,"name":"__Secure-1PAPISID","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"Ls0YN24V5Ot98UCs/AB50FP_CUGY33bk69","index":7,"isSearch":false},{"domain":".youtube.com","expirationDate":1767268091.630912,"hostOnly":false,"httpOnly":true,"name":"LOGIN_INFO","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":"0","value":"AFmmF2swRQIhAOG_zrmpKu1g1Cd6sClRx02noXOsmyQoYGmG0z94dykKAiAgC1-3YuGeIPge99a1b5b-H763eddUtVIUpvNV_elqBQ:QUQ3MjNmekRkbVBpNGd3UkF4anVrN2dvZTlGM3ZTc1BlamlSTHhJekdzNFpiSlBrZTM3TkdnWlI4eGtfWHgzWHBxNG4zdGtveDNxUHRKeU5Bcnlsa1EyR1ZoQy1kcmt5TldVMkQ5VjNXZ01nY1RrRXdWdnVhZE9Mdlh1b3prWVIzcWFSZDN1Mno2dzEwWEp3X2RpOXZLbXBNcDBELWR5Nkh3","index":8,"isSearch":false},{"domain":".youtube.com","expirationDate":1769928807.352694,"hostOnly":false,"httpOnly":false,"name":"SID","path":"/","sameSite":"unspecified","secure":false,"session":false,"storeId":"0","value":"g.a000rwg8MV-T_uvcBL6XSKXXn2tvazdlalhY3I_v3THZJjKF_WN-rm4CGwQxX4frrO2WJGR4IgACgYKAU4SARESFQHGX2MiWMIcbB3NsuTUC9wuJIqRaxoVAUF8yKpuaKaq5auTyXzB5ISYlYwq0076","index":9,"isSearch":false},{"domain":".youtube.com","expirationDate":1769928807.352732,"hostOnly":false,"httpOnly":true,"name":"__Secure-1PSID","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"g.a000rwg8MV-T_uvcBL6XSKXXn2tvazdlalhY3I_v3THZJjKF_WN-9Eq6boyNGqwauFD6BM3voAACgYKAbgSARESFQHGX2MiDRYQ2EY-SlHyjJAkSLD3HxoVAUF8yKrKlraM7YtmwLsnX2ubvrnv0076","index":10,"isSearch":false},{"domain":".youtube.com","expirationDate":1769928807.352764,"hostOnly":false,"httpOnly":true,"name":"__Secure-3PSID","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":"0","value":"g.a000rwg8MV-T_uvcBL6XSKXXn2tvazdlalhY3I_v3THZJjKF_WN-p3XedCK6CT4BnrVDQZRWswACgYKAfsSARESFQHGX2Mi13LaFZfXDpahh4vFnQ-B0hoVAUF8yKq5b0zKVLqRg_fi7-_SjknB0076","index":11,"isSearch":false},{"domain":".youtube.com","expirationDate":1766904900.124339,"hostOnly":false,"httpOnly":true,"name":"__Secure-1PSIDTS","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"sidts-CjEB7wV3sUhVxw-WjFiamHwYZtSQ8Yzg07QDcQ94VAWo3iVuUb4HBPCVfGFD6e5pahq-EAA","index":12,"isSearch":false},{"domain":".youtube.com","expirationDate":1766904900.124635,"hostOnly":false,"httpOnly":true,"name":"__Secure-3PSIDTS","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":"0","value":"sidts-CjEB7wV3sUhVxw-WjFiamHwYZtSQ8Yzg07QDcQ94VAWo3iVuUb4HBPCVfGFD6e5pahq-EAA","index":13,"isSearch":false},{"domain":".youtube.com","expirationDate":1766904902.296554,"hostOnly":false,"httpOnly":false,"name":"SIDCC","path":"/","sameSite":"unspecified","secure":false,"session":false,"storeId":"0","value":"AKEyXzXDR-eL3r7vm4vJPvUPRsQWzizLiVnxXvFiTekTdscItFBJJxCBcFe4dP8rQzOKLcMUSDY","index":14,"isSearch":false},{"domain":".youtube.com","expirationDate":1766904902.296676,"hostOnly":false,"httpOnly":true,"name":"__Secure-1PSIDCC","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"AKEyXzXLz1pmKcf1IxjyRqO5I54LvH6hHb7sZgKfhldu_8kRvX8klHr4dAr3QQ0sVfRddMNqow","index":15,"isSearch":false},{"domain":".youtube.com","expirationDate":1766904902.296719,"hostOnly":false,"httpOnly":true,"name":"__Secure-3PSIDCC","path":"/","sameSite":"no_restriction","secure":true,"session":false,"storeId":"0","value":"AKEyXzWEV9Mzc1bCYeLazRAcZQzWoM6E-9hDgn33kR2er3YHL6MqWOPHxeqYaJa1yTqjIDSH81o","index":16,"isSearch":false}]

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
