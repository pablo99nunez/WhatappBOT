function getNumber(number) {
  let finalnumber = number
  if (number.startsWith('549')) {
    finalnumber = number.substring(0, 2) + number.substring(3)
  }
  return finalnumber
}

async function downloadFile(url, filename = './audio1') {
  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': 'Bearer ' + process.env.WHATSAPP_TOKEN
      }, responseType: 'arraybuffer'
    });

    if (response.headers['content-type'].startsWith('audio')) {
      writeFile(filename, response.data, 'binary', async (err) => {
        if (err) {
          console.error('Error writing file:', err);
        } else {
          console.log('Ogg audio file downloaded and saved as:', filename);
          return await convertAudio(filename, 'mp3');
        }
      });
    } else {
      console.error('Invalid content type. Expected audio/*.');
    }
  } catch (error) {
    console.error('Error downloading Ogg audio:', error);
  }
}

function checkFileExistence(filepath) {
  return new Promise((resolve, reject) => {
    console.log('Searching for ' + filepath);

    let timeoutId;
    const intervalId = setInterval(() => {
      if (existsSync(filepath)) {
        console.log('File found');
        clearInterval(intervalId);
        clearTimeout(timeoutId);
        setTimeout(() => {
          resolve();
        }, 500)
      }
    }, 100);

    timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      reject(new Error('File does not exist.'));
    }, 10000);
  });
}


module.exports = {
  getNumber,
  downloadFile,
  checkFileExistence
}