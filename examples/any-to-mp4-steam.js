import fs from 'fs';
import path from 'path';
import ffmpeg from '../index.js';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// The solution based on adding -movflags for mp4 output
// For more movflags details check ffmpeg docs
// https://ffmpeg.org/ffmpeg-formats.html#toc-Options-9

const pathToSourceFile = path.resolve(__dirname, '../test/assets/testvideo-169.avi');
const readStream = fs.createReadStream(pathToSourceFile);
const writeStream = fs.createWriteStream('./output.mp4');

ffmpeg(readStream)
  .addOutputOptions('-movflags +frag_keyframe+separate_moof+omit_tfhd_offset+empty_moov')
  .format('mp4')
  .pipe(writeStream);
