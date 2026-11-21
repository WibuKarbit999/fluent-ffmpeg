import ffmpeg = require('@wibukarbitt/fluent-ffmpeg');

const cmd: ffmpeg.FfmpegCommand = ffmpeg('input.mp4')
  .hwaccel('vaapi')
  .videoCodec('libx264')
  .crf(23)
  .videoPreset('fast')
  .pixelFormat('yuv420p')
  .faststart()
  .metadata({ title: 'CJS Test' })
  .on('progress', (p: ffmpeg.FfmpegProgress) => {
    void p.speed;
  });

const cmdNew = new ffmpeg('input.mp4');
const cmdClass = new ffmpeg.FfmpegCommand('input.mp4');

async function verifyCjsTypes() {
  const probe: ffmpeg.FfprobeData = await ffmpeg.ffprobe('input.mp4');
  const hw: string[] = await ffmpeg.availableHwaccels();
  const ver: ffmpeg.FfmpegVersionInfo = await ffmpeg.ffmpegVersion();
  const out: ffmpeg.FfmpegRunResult = await cmd.saveAsync('out.mp4');

  ffmpeg.ffprobe('input.mp4', (err, data) => {
    void err;
    void data;
  });

  void [cmdNew, cmdClass, probe, hw, ver, out];
}

void verifyCjsTypes;
