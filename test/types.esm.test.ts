import ffmpeg, {
  FfmpegCommand,
  ffprobe,
  availableFilters,
  availableCodecs,
  availableEncoders,
  availableDecoders,
  availableFormats,
  availableHwaccels,
  availablePixelFormats,
  availableBitstreamFilters,
  availableProtocols,
  ffmpegVersion,
  setFfmpegPath,
  setFfprobePath,
  setFlvtoolPath,
  type FfprobeData,
  type FfmpegProgress,
  type FfmpegCodecData,
  type FfmpegRunResult,
  type FfmpegVersionInfo
} from '@wibukarbitt/fluent-ffmpeg';
import { PassThrough } from 'stream';

// Call with and without `new`
const cmd1: FfmpegCommand = ffmpeg('input.mp4');
const cmd2: FfmpegCommand = new ffmpeg('input.mp4', {
  timeout: 60,
  cwd: '/tmp',
  niceness: 5,
  stdoutLines: 200,
  signal: new AbortController().signal
});
const cmd3: FfmpegCommand = new FfmpegCommand({ source: 'input.mp4' });

// Verify original API + fixed overloads
cmd1
  .input('audio.mp3')
  .inputFormat('mp3')
  .inputFps('30000/1001')
  .native()
  .seekInput(10)
  .loop(5)
  .audioCodec('aac')
  .audioBitrate('192k')
  .audioChannels(2)
  .audioFrequency(48000)
  .audioQuality(2)
  .audioFilters('volume=0.8', { filter: 'atempo', options: 1.25 })
  .videoCodec('libx264')
  .videoBitrate('5M', true)
  .videoFilters('scale=1280:-2', { filter: 'transpose', options: 0 })
  .fps(30)
  .frames(100)
  .size('1280x720')
  .aspect('16:9')
  .autopad('white')
  .autopad(true, 'black')
  .keepDAR(true)
  .outputOptions('-t', 10)
  .inputOption('-re')
  .complexFilter([{ filter: 'overlay', inputs: ['0:v', '1:v'], outputs: 'v' }], ['[v]', '0:a'])
  .map('0:v')
  .preset('divx')
  .on('start', (cmdLine: string) => console.log(cmdLine))
  .on('codecData', (d1: FfmpegCodecData, d2: FfmpegCodecData) => {
    const details: string[] | undefined = d1.video_details;
    void details;
    void d2;
  })
  .on('progress', (p: FfmpegProgress) => {
    const spd: string | undefined = p.speed;
    void spd;
  })
  .on('end', (stdout?: string | null, stderr?: string | null) => {
    void stdout;
    void stderr;
  })
  .on('error', (err: Error) => console.error(err));

// Verify pipe overloads (with and without stream)
const pt: PassThrough = cmd1.pipe({ end: true });
const customOut: PassThrough = cmd1.pipe(new PassThrough(), { end: false });
void pt;
void customOut;

// Verify modern FFmpeg features
cmd2
  .hardwareAcceleration({
    method: 'cuda',
    device: 0,
    outputFormat: 'cuda',
    initDevice: 'cuda=cu:0',
    filterDevice: 'cu'
  })
  .streamLoop(-1)
  .inputTo('00:01:00')
  .headers({ Authorization: 'Bearer token' })
  .userAgent('MyApp/1.0')
  .reconnect({ delayMax: 5, onHttpError: '4xx,5xx' })
  .crf(20)
  .videoPreset('slow')
  .videoTune('film')
  .videoProfile('high')
  .videoLevel('4.1')
  .pixelFormat('yuv420p')
  .gopSize(60)
  .bFrames(3)
  .twoPass(1, 'pass.log')
  .fpsMode('cfr')
  .colorSpace({ primaries: 'bt2020', transfer: 'smpte2084', matrix: 'bt2020nc', range: 'tv' })
  .videoTag('hvc1')
  .audioSampleFormat('fltp')
  .audioChannelLayout('stereo')
  .audioProfile('aac_low')
  .audioTag('mp4a')
  .loudnessNormalize({ integrated: -14, truePeak: -1, lra: 9 })
  .noSubtitles()
  .noData()
  .subtitleCodec('mov_text')
  .burnSubtitles('subs.srt', { forceStyle: 'FontSize=24' })
  .metadata('title', 'Test')
  .metadata({ artist: 'Author' }, 'g')
  .mapMetadata(-1)
  .mapChapters(-1)
  .disposition('a:0', 'default')
  .bitstreamFilter('h264_mp4toannexb', 'v')
  .movflags(['+frag_keyframe', '+empty_moov'])
  .faststart()
  .copyAll()
  .maxMuxingQueueSize(1024)
  .to('00:00:30')
  .shortest()
  .hls({ time: 4, segmentType: 'fmp4', playlistType: 'vod' })
  .dash({ segDuration: 4, ldash: true, hlsPlaylist: true })
  .globalOptions('-stats')
  .logLevel('warning')
  .hideBanner()
  .noStdin()
  .overwrite(false)
  .threads(4);

const rawArgs: Array<string | number> = cmd2.getArguments();
void rawArgs;

// Async helpers & static methods
async function checkAsync() {
  const probe1: FfprobeData = await ffprobe('input.mp4');
  const probe2: FfprobeData = await ffmpeg.ffprobe('input.mp4', ['-show_chapters']);
  const probe3: FfprobeData = await cmd3.ffprobe();
  const res1: FfmpegRunResult = await cmd3.runAsync();
  const res2: FfmpegRunResult = await cmd3.saveAsync('out.mp4');
  const files: string[] = await cmd3.screenshotsAsync({ count: 3, fastSeek: true });
  const hw: string[] = await availableHwaccels();
  const ver: FfmpegVersionInfo = await ffmpegVersion();
  const filters = await availableFilters();
  const codecs = await availableCodecs();
  const encoders = await availableEncoders();
  const decoders = await availableDecoders();
  const formats = await availableFormats();
  const pixFmts = await availablePixelFormats();
  const bsfs = await availableBitstreamFilters();
  const protos = await availableProtocols();

  setFfmpegPath('/usr/bin/ffmpeg');
  setFfprobePath('/usr/bin/ffprobe');
  setFlvtoolPath('/usr/bin/flvmeta');

  // Callback style still works identically
  ffmpeg.ffprobe('input.mp4', (err, data) => {
    void err;
    void data;
  });
  ffmpeg.availableHwaccels((err, list) => {
    void err;
    void list;
  });

  void [probe1, probe2, probe3, res1, res2, files, hw, ver, filters, codecs, encoders, decoders, formats, pixFmts, bsfs, protos];
}

void checkAsync;
