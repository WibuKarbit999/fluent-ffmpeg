import ffmpeg from '../index.js';
import fs from 'fs';

// create the target stream (can be any WritableStream)
const stream = fs.createWriteStream('/path/to/yout_target.flv')

// make sure you set the correct path to your video file
const proc = ffmpeg('/path/to/your_movie.avi')
  // use the 'flashvideo' preset (located in /lib/presets/flashvideo.js)
  .preset('flashvideo')
  // setup event handlers
  .on('end', () => {
    console.log('file has been converted succesfully');
  })
  .on('error', (err) => {
    console.log('an error happened: ' + err.message);
  })
  // save to stream
  .pipe(stream, {end:true}); //end = true, close output stream after writing
