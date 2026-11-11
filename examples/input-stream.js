import fs from 'fs';
import ffmpeg from '../index.js';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// open input stream
const infs = fs.createReadStream(__dirname + '../test/assets/testvideo-43.avi');

infs.on('error', (err) => {
  console.log(err);
});

// create new ffmpeg processor instance using input stream
// instead of file path (can be any ReadableStream)
const proc = ffmpeg(infs)
  .preset('flashvideo')
  // setup event handlers
  .on('end', () => {
    console.log('done processing input stream');
  })
  .on('error', (err) => {
    console.log('an error happened: ' + err.message);
  })
  // save to file
  .save('/path/to/your_target.flv');
