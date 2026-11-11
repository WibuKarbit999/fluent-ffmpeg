import ffmpeg from '../index.js';

/*
 replicates this sequence of commands:

 ffmpeg -i title.mp4 -qscale:v 1 intermediate1.mpg
 ffmpeg -i source.mp4 -qscale:v 1 intermediate2.mpg
 ffmpeg -i concat:"intermediate1.mpg|intermediate2.mpg" -c copy intermediate_all.mpg
 ffmpeg -i intermediate_all.mpg -qscale:v 2 output.mp4

 Create temporary .mpg files for each video and deletes them after merge is completed.
 These files are created by filename pattern like [videoFilename.ext].temp.mpg [outputFilename.ext].temp.merged.mp4
 */

const firstFile = "title.mp4";
const secondFile = "source.mp4";
const thirdFile = "third.mov";
const outPath = "out.mp4";

const proc = ffmpeg(firstFile)
    .input(secondFile)
    .input(thirdFile)
    //.input(fourthFile)
    //.input(...)
    .on('end', () => {
      console.log('files have been merged succesfully');
    })
    .on('error', (err) => {
      console.log('an error happened: ' + err.message);
    })
    .mergeToFile(outPath);