var NodeWebcam = require('node-webcam')
const fs = require('fs');
const request = require('request');

var sys = require('sys');
var exec = require('child_process').exec;
function puts(error, stdout, stderr){ sys.puts(stdout); return stdout; }

var Webcam = NodeWebcam.create();

async function ttsCommand(msg) {
  var commandLine = 'python3.6 /root/tts.py ' + msg;
  await execPromise(commandLine);
}

const execPromise = str => {
  return new Promise ((resolve, reject) => {
    exec(str, (err, stdout, stderr) => {
      if(err) reject (err);
      else resolve(stdout);
  })
  })
};

const captureImage = path => new Promise ((resolve, reject) => {
  Webcam.capture(path, (err, data) => {
      if (err) reject(err)
      else resolve(data);
  })
});

const fileSend = (url, key, filepath, filename) =>
 new Promise((resolve, reject) => {
   const r = request.post(url, (err, response, body) => {
     if (err) reject(err);
     else resolve(body);
   });
   const form = r.form();
   form.append(key, fs.createReadStream(filepath), {
     filename
   });
 });

module.exports = {
  camModule : async function(){
    await captureImage('/root/image');

    result = await fileSend(
      'http://ec2-54-180-8-155.ap-northeast-2.compute.amazonaws.com:5000/image',
      'abc',
      '/root/image.jpg',
      'image.jpg'
     )
    
     await ttsCommand(result);
  },


  objectCamModule : async function(){
    await ttsCommand("찾으려는 물건을 말씀하세요.");
    searchKeyword = await sttCommand('2');
    const FIND_URL = 'ec2-54-180-8-155.ap-northeast-2.compute.amazonaws.com:5000/findobject';
    const findObjectUrl = new URL(FIND_URL);
    const findOptions = {
      url: findObjectUrl.toString(),
      method: "GET",
      headers,
      body: {
        object: searchKeyword.toString()
      }
    };


    while(1){
      await captureImage('/root/imgae');
  
      result = await fileSend(
        'http://ec2-54-180-8-155.ap-northeast-2.compute.amazonaws.com:5000/findobject',
        'abc',
        '/root/image.jpg',
        'image.jpg'
       )
       if(result==0){
        continue;
       }else{
        await ttsCommand(result);
        break;
       }
    }
  }
};

