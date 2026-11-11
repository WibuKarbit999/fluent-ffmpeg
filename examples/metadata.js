import ffmpeg from '../index.js';
import { inspect } from 'util';

// make sure you set the correct path to your video file
ffmpeg.ffprobe('/path/to/your_movie.avi',(err, metadata) => {
  console.log(inspect(metadata, false, null));
});
