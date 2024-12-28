const { exec } = require('child_process');

async function runPythonPhoWhisperScript() {

    exec(`python3 createPhoWhisperServer.py`, (error, stdout, stderr) => {

    });

}
  runPythonPhoWhisperScript();
  console.log("Đã khỏi động PhoWhisperAI");