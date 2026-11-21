import Ffmpeg, {
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
  ffmpegVersion
} from '../index.js';
import * as utils from '../lib/utils.js';
import path from 'path';
import fs from 'fs';
import os from 'os';
import assert from 'assert';
import { createRequire } from 'module';
import { execFile } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testVideo = path.join(__dirname, 'assets', 'testvideo-43.avi');
const testVideoBig = path.join(__dirname, 'assets', 'testvideo-5m.mpg');
const testAudio1 = path.join(__dirname, 'assets', 'testaudio-one.wav');

describe('Bug fixes & backward compatibility', () => {
  describe('Constructor & clone()', () => {
    it('should handle null or undefined input without throwing', () => {
      const cmd1 = Ffmpeg(null);
      const cmd2 = Ffmpeg(undefined);
      cmd1.should.instanceof(Ffmpeg);
      cmd2.should.instanceof(FfmpegCommand);
    });

    it('should not mutate caller options object', () => {
      const opts = { timeout: 30 };
      const cmd = Ffmpeg(testVideo, opts);
      assert.strictEqual('source' in opts, false);
      assert.strictEqual('stdoutLines' in opts, false);
      assert.strictEqual(cmd.options.timeout, 30);
    });

    it('should preserve _currentInput, isFile, isStream and isolate options on clone()', () => {
      const cmd = Ffmpeg(testVideo, { niceness: 0 });
      const cloned = cmd.clone();

      cloned.renice(5);
      cmd.options.niceness.should.equal(0);
      cloned.options.niceness.should.equal(5);

      // Should allow adding input options to cloned command without throwing "No input specified"
      cloned.seekInput(1);
      const args = cloned.getArguments();
      args.indexOf('-ss').should.above(-1);
      args.indexOf(1).should.above(-1);

      // Original command should not be mutated by clone's seekInput
      cmd.getArguments().indexOf('-ss').should.equal(-1);
      cloned._inputs[0].isFile.should.equal(true);
      cloned._inputs[0].isStream.should.equal(false);
    });

    it('should recognize file:// protocol as file input and output', () => {
      const cmd = Ffmpeg('file:///tmp/in.mp4').output('file:///tmp/out.mp4');
      cmd._inputs[0].isFile.should.equal(true);
      cmd._outputs[0].isFile.should.equal(true);
      cmd.getArguments().indexOf('-y').should.above(-1);
    });

    it('should throw Invalid input for null/primitive inputs instead of TypeError', () => {
      (() => Ffmpeg().input(null)).should.throw(/Invalid input/);
      (() => Ffmpeg().input(123)).should.throw(/Invalid input/);
      (() => Ffmpeg().output(123)).should.throw(/Invalid output/);
    });
  });

  describe('Bitrate, video size, noVideo, and filter fixes', () => {
    it('should preserve explicit bitrate units (M, K, b) in videoBitrate and audioBitrate', () => {
      const args = Ffmpeg(testVideo)
        .videoBitrate('5M')
        .audioBitrate('192K')
        .getArguments();

      args[args.indexOf('-b:v') + 1].should.equal('5M');
      args[args.indexOf('-b:a') + 1].should.equal('192K');

      const argsNum = Ffmpeg(testVideo)
        .videoBitrate(2500)
        .audioBitrate(128)
        .getArguments();
      argsNum[argsNum.indexOf('-b:v') + 1].should.equal('2500k');
      argsNum[argsNum.indexOf('-b:a') + 1].should.equal('128k');
    });

    it('should clear sizeFilters and sizeData when noVideo() is called', () => {
      const args = Ffmpeg(testVideo)
        .size('320x?')
        .noVideo()
        .getArguments();

      args.indexOf('-vn').should.above(-1);
      args.indexOf('-filter:v').should.equal(-1);
    });

    it('should keep numeric 0 option in makeFilterStrings', () => {
      const res = utils.makeFilterStrings([
        { filter: 'transpose', options: 0 }
      ]);
      res[0].should.equal('transpose=0');
    });

    it('should support decimal aspect ratios and reject invalid/zero aspect ratios', () => {
      const cmd = Ffmpeg(testVideo).size('100x?').aspect('2.5:1');
      const args = cmd.getArguments();
      args.join(' ').indexOf('scale=w=100:h=40').should.not.equal(-1);

      (() => Ffmpeg().aspect(0)).should.throw(/Invalid aspect ratio/);
      (() => Ffmpeg().aspect(-1)).should.throw(/Invalid aspect ratio/);
      (() => Ffmpeg().aspect('16:0')).should.throw(/Invalid aspect ratio/);
      (() => Ffmpeg().aspect(null)).should.throw(/Invalid aspect ratio/);
      (() => Ffmpeg().aspect('')).should.throw(/Invalid aspect ratio/);
    });

    it('should respect keepDAR(false) as a no-op', () => {
      const args = Ffmpeg(testVideo).keepDAR(false).getArguments();
      args.indexOf('-filter:v').should.equal(-1);
    });
  });

  describe('Stream mapping (-map) fix', () => {
    it('should not wrap numeric input stream specifiers in square brackets', () => {
      const args = Ffmpeg(testVideo)
        .map('0:v')
        .map('0:a:0?')
        .map('-0:s')
        .map('0')
        .map('outLabel')
        .map('[alreadyBracketed]')
        .getArguments();

      const mapValues = [];
      for (let i = 0; i < args.length; i++) {
        if (args[i] === '-map') {
          mapValues.push(args[i + 1]);
        }
      }

      assert.deepStrictEqual(mapValues, [
        '0:v',
        '0:a:0?',
        '-0:s',
        '0',
        '[outLabel]',
        '[alreadyBracketed]'
      ]);
    });

    it('should handle mixed filter labels and input stream specifiers in complexFilter map', () => {
      const args = Ffmpeg(testVideo)
        .complexFilter('[0:v]scale=320:240[vout]', ['[vout]', '0:a?'])
        .getArguments();

      const mapValues = [];
      for (let i = 0; i < args.length; i++) {
        if (args[i] === '-map') {
          mapValues.push(args[i + 1]);
        }
      }

      assert.deepStrictEqual(mapValues, ['[vout]', '0:a?']);
    });
  });

  describe('Progress, timemark, codecData, and error extraction fixes', () => {
    it('should handle negative and N/A timemarks in timemarkToSeconds', () => {
      utils.timemarkToSeconds('-00:01:30.50').should.equal(-90.5);
      utils.timemarkToSeconds('-12.5').should.equal(-12.5);
      assert.ok(Number.isNaN(utils.timemarkToSeconds('N/A')));
      assert.ok(Number.isNaN(utils.timemarkToSeconds(undefined)));
    });

    it('should safely parse FFmpeg 7 progress lines with multiple spaces, N/A, and speed', () => {
      const cmd = Ffmpeg(testVideo);
      cmd._ffprobeData = { format: { duration: 10 } };
      const events = [];
      cmd.on('progress', (p) => events.push(p));

      // Multi-space + KiB + speed
      utils.extractProgress(cmd, 'frame=   10  fps=25.0 q=28.0 size=    256KiB time=00:00:02.50 bitrate= 838.9kbits/s speed=2.50x   ');
      events.length.should.equal(1);
      events[0].frames.should.equal(10);
      events[0].currentFps.should.equal(25);
      events[0].targetSize.should.equal(256);
      events[0].timemark.should.equal('00:00:02.50');
      events[0].percent.should.equal(25);
      events[0].speed.should.equal('2.50x');

      // N/A time & bitrate should not crash or produce NaN percent
      utils.extractProgress(cmd, 'frame=    0 fps=0.0 q=0.0 Lsize=N/A time=N/A bitrate=N/A speed=N/A');
      events.length.should.equal(2);
      events[1].currentKbps.should.equal(0);
      assert.strictEqual(events[1].percent, undefined);

      // Unrelated key=value stderr line should not emit bogus progress
      utils.extractProgress(cmd, 'foo=bar baz=qux');
      events.length.should.equal(2);
    });

    it('should fall back to last non-empty line in extractError for bracketed FFmpeg 7 errors', () => {
      const stderr = [
        'ffmpeg version 7.1.5',
        '[libx264 @ 0x1234] height not divisible by 2 (320x241)',
        '[vost#0:0/libx264 @ 0x5678] Error while opening encoder'
      ].join('\n');

      utils.extractError(stderr).should.equal('[vost#0:0/libx264 @ 0x5678] Error while opening encoder');
    });

    it('should emit error cleanly instead of crashing when ffmpeg binary cannot be spawned', (done) => {
      const cmd = Ffmpeg(testVideo);
      cmd.setFfmpegPath('/nonexistent/path/to/ffmpeg-binary');

      cmd
        .on('error', (err) => {
          assert.ok(err instanceof Error);
          cmd._forgetPaths();
          done();
        })
        .save(path.join(os.tmpdir(), 'should-not-exist-fluent-ffmpeg.mp4'));
    });

    it('should not mutate args array when niceness is set', (done) => {
      const outPath = path.join(os.tmpdir(), `fluent-ffmpeg-nice-${Date.now()}.mp4`);
      const cmd = Ffmpeg(testVideo, { niceness: 1 })
        .outputOptions('-f', 'null')
        .on('start', (cmdLine) => {
          cmdLine.startsWith('ffmpeg -i ').should.equal(true);
        })
        .on('error', (err) => done(err))
        .on('end', () => done());

      cmd.save(os.platform() === 'win32' ? 'NUL' : '/dev/null');
      void outPath;
    });
  });

  describe('FFmpeg 7 capability parsing fixes', () => {
    it('should parse device formats (3rd column `d`) like lavfi in availableFormats', async () => {
      const formats = await availableFormats();
      assert.ok('lavfi' in formats, 'Expected lavfi format to be detected on FFmpeg 7');
      formats.lavfi.canDemux.should.equal(true);
      formats.lavfi.isDevice.should.equal(true);
      assert.strictEqual('d' in formats, false, 'Device flag "d" should not be parsed as format name');
    });

    it('should parse dynamic I/O (N) filters like split, concat, amix, hstack in availableFilters', async () => {
      const filters = await availableFilters();
      assert.ok('split' in filters, 'Expected split filter to be detected');
      filters.split.input.should.equal('video');
      filters.split.output.should.equal('dynamic');
      filters.split.multipleOutputs.should.equal(true);

      assert.ok('concat' in filters, 'Expected concat filter to be detected');
      filters.concat.multipleInputs.should.equal(true);
      filters.concat.multipleOutputs.should.equal(true);

      assert.ok('amix' in filters, 'Expected amix filter to be detected');
      filters.amix.multipleInputs.should.equal(true);
    });

    it('should allow generic codec names (h264, mp3) that FFmpeg maps to available encoders', (done) => {
      Ffmpeg(testVideo)
        .videoCodec('h264')
        .audioCodec('mp3')
        .toFormat('mp4')
        ._checkCapabilities((err) => {
          assert.ok(!err, err ? err.message : '');
          done();
        });
    });

    it('should set boolean canEncode/canDecode on expanded codec entries', async () => {
      const codecs = await availableCodecs();
      assert.strictEqual(typeof codecs.libx264.canEncode, 'boolean');
      assert.strictEqual(typeof codecs.libx264.canDecode, 'boolean');
      codecs.libx264.canEncode.should.equal(true);
    });
  });
});

describe('Modern FFmpeg features', () => {
  describe('New capability discovery methods (callback & Promise)', () => {
    it('should query availableDecoders via Promise and callback', async () => {
      const decoders = await availableDecoders();
      assert.ok(Object.keys(decoders).length > 0);
      assert.ok('mpeg4' in decoders);
      decoders.mpeg4.type.should.equal('video');

      await new Promise((resolve, reject) => {
        Ffmpeg.getAvailableDecoders((err, res) => {
          if (err) return reject(err);
          assert.ok('mpeg4' in res);
          resolve();
        });
      });
    });

    it('should query availableHwaccels', async () => {
      const hwaccels = await availableHwaccels();
      Array.isArray(hwaccels).should.equal(true);
    });

    it('should query availablePixelFormats', async () => {
      const pixFmts = await availablePixelFormats();
      assert.ok('yuv420p' in pixFmts);
      pixFmts.yuv420p.canInput.should.equal(true);
      pixFmts.yuv420p.canOutput.should.equal(true);
      pixFmts.yuv420p.nbComponents.should.equal(3);
      pixFmts.yuv420p.bitsPerPixel.should.equal(12);
    });

    it('should query availableBitstreamFilters', async () => {
      const bsfs = await availableBitstreamFilters();
      Array.isArray(bsfs).should.equal(true);
      assert.ok(bsfs.includes('h264_mp4toannexb'));
    });

    it('should query availableProtocols', async () => {
      const protocols = await availableProtocols();
      Array.isArray(protocols.input).should.equal(true);
      Array.isArray(protocols.output).should.equal(true);
      assert.ok(protocols.input.includes('file'));
      assert.ok(protocols.input.includes('pipe'));
      assert.ok(protocols.output.includes('file'));
    });

    it('should query ffmpegVersion', async () => {
      const ver = await ffmpegVersion();
      assert.ok(ver.version.length > 0);
      Array.isArray(ver.configuration).should.equal(true);
      assert.ok(typeof ver.libraries.libavcodec === 'string');
    });

    it('should support Promise mode for existing capability methods and ffprobe', async () => {
      const [codecs, encoders, filters, formats, probe] = await Promise.all([
        availableCodecs(),
        availableEncoders(),
        availableFilters(),
        availableFormats(),
        ffprobe(testVideo)
      ]);
      assert.ok(Object.keys(codecs).length > 0);
      assert.ok(Object.keys(encoders).length > 0);
      assert.ok(Object.keys(filters).length > 0);
      assert.ok(Object.keys(formats).length > 0);
      probe.format.format_name.should.equal('avi');
      probe.streams[0].codec_name.should.equal('mpeg4');

      // ffprobe with JSON print_format option
      const jsonProbe = await ffprobe(testVideo, ['-print_format', 'json']);
      jsonProbe.format.format_name.should.equal('avi');
    });
  });

  describe('Modern CLI argument builders', () => {
    it('should build hardware acceleration arguments', () => {
      const args = Ffmpeg(testVideo)
        .hardwareAcceleration({
          initDevice: 'vaapi=va:/dev/dri/renderD128',
          filterDevice: 'va',
          method: 'vaapi',
          device: '/dev/dri/renderD128',
          outputFormat: 'vaapi'
        })
        .getArguments();

      const iIdx = args.indexOf('-i');
      args.indexOf('-hwaccel').should.above(-1).and.below(iIdx);
      args[args.indexOf('-hwaccel') + 1].should.equal('vaapi');
      args[args.indexOf('-hwaccel_device') + 1].should.equal('/dev/dri/renderD128');
      args[args.indexOf('-hwaccel_output_format') + 1].should.equal('vaapi');
      args[args.indexOf('-init_hw_device') + 1].should.equal('vaapi=va:/dev/dri/renderD128');
      args[args.indexOf('-filter_hw_device') + 1].should.equal('va');
    });

    it('should build modern video encoding, HDR colorSpace, and audio arguments', () => {
      const args = Ffmpeg(testVideo)
        .videoCodec('libx265')
        .crf(22)
        .videoPreset('slow')
        .videoTune('grain')
        .videoProfile('main10')
        .videoLevel('5.1')
        .pixelFormat('yuv420p10le')
        .gopSize(60)
        .bFrames(4)
        .twoPass(1, '/tmp/passlog')
        .fpsMode('cfr')
        .videoTag('hvc1')
        .colorSpace({
          primaries: 'bt2020',
          transfer: 'smpte2084',
          matrix: 'bt2020nc',
          range: 'tv'
        })
        .audioCodec('aac')
        .audioSampleFormat('fltp')
        .audioChannelLayout('stereo')
        .audioProfile('aac_low')
        .audioTag('mp4a')
        .loudnessNormalize({ integrated: -14, truePeak: -1, lra: 9 })
        .getArguments();

      args[args.indexOf('-crf') + 1].should.equal('22');
      args[args.indexOf('-preset') + 1].should.equal('slow');
      args[args.indexOf('-tune') + 1].should.equal('grain');
      args[args.indexOf('-profile:v') + 1].should.equal('main10');
      args[args.indexOf('-level:v') + 1].should.equal('5.1');
      args[args.indexOf('-pix_fmt') + 1].should.equal('yuv420p10le');
      args[args.indexOf('-g') + 1].should.equal('60');
      args[args.indexOf('-bf') + 1].should.equal('4');
      args[args.indexOf('-pass') + 1].should.equal('1');
      args[args.indexOf('-passlogfile') + 1].should.equal('/tmp/passlog');
      args[args.indexOf('-fps_mode') + 1].should.equal('cfr');
      args[args.indexOf('-tag:v') + 1].should.equal('hvc1');
      args[args.indexOf('-color_primaries') + 1].should.equal('bt2020');
      args[args.indexOf('-color_trc') + 1].should.equal('smpte2084');
      args[args.indexOf('-colorspace') + 1].should.equal('bt2020nc');
      args[args.indexOf('-color_range') + 1].should.equal('tv');
      args[args.indexOf('-sample_fmt') + 1].should.equal('fltp');
      args[args.indexOf('-channel_layout') + 1].should.equal('stereo');
      args[args.indexOf('-profile:a') + 1].should.equal('aac_low');
      args[args.indexOf('-tag:a') + 1].should.equal('mp4a');
      args[args.indexOf('-filter:a') + 1].should.equal('loudnorm=I=-14:TP=-1:LRA=9');
    });

    it('should build subtitle, metadata, stream control, and global option arguments', () => {
      const args = Ffmpeg(testVideo)
        .streamLoop(2)
        .inputTo('00:00:05')
        .headers({ Authorization: 'Bearer tok', 'X-Custom': '1' })
        .userAgent('FluentFFmpeg/1.0')
        .reconnect({ delayMax: 10, onHttpError: [429, 503] })
        .logLevel('warning')
        .hideBanner()
        .noStdin()
        .overwrite(false)
        .threads(4)
        .to('00:00:02')
        .shortest()
        .noSubtitles()
        .noData()
        .subtitleCodec('mov_text')
        .burnSubtitles("/tmp/sub's:1.srt", { forceStyle: 'FontSize=24' })
        .metadata({ title: 'Demo', artist: 'Test' })
        .metadata('language', 'eng', 's:a:0')
        .mapMetadata(-1)
        .mapChapters(-1)
        .disposition('a:0', 'default')
        .bitstreamFilter('h264_mp4toannexb', 'v')
        .movflags(['frag_keyframe', '+empty_moov'])
        .faststart()
        .copyAll()
        .maxMuxingQueueSize(1024)
        .output('/tmp/out.mp4')
        .getArguments();

      args[args.indexOf('-stream_loop') + 1].should.equal('2');
      args[args.indexOf('-headers') + 1].should.equal('Authorization: Bearer tok\r\nX-Custom: 1\r\n');
      args[args.indexOf('-user_agent') + 1].should.equal('FluentFFmpeg/1.0');
      args[args.indexOf('-reconnect') + 1].should.equal('1');
      args[args.indexOf('-reconnect_delay_max') + 1].should.equal('10');
      args[args.indexOf('-reconnect_on_http_error') + 1].should.equal('429,503');
      args[args.indexOf('-loglevel') + 1].should.equal('warning');
      args.indexOf('-hide_banner').should.above(-1);
      args.indexOf('-nostdin').should.above(-1);
      args.indexOf('-n').should.above(-1);
      // overwrite(false) prevents auto -y
      args.indexOf('-y').should.equal(-1);
      args[args.indexOf('-threads') + 1].should.equal('4');
      args.indexOf('-shortest').should.above(-1);
      args.indexOf('-sn').should.above(-1);
      args.indexOf('-dn').should.above(-1);
      args[args.indexOf('-c:s') + 1].should.equal('mov_text');
      args[args.indexOf('-filter:v') + 1].indexOf("subtitles=filename='/tmp/sub\\\\'s\\:1.srt'").should.equal(0);
      args[args.indexOf('-metadata:s:a:0') + 1].should.equal('language=eng');
      args[args.indexOf('-map_metadata') + 1].should.equal('-1');
      args[args.indexOf('-map_chapters') + 1].should.equal('-1');
      args[args.indexOf('-disposition:a:0') + 1].should.equal('default');
      args[args.indexOf('-bsf:v') + 1].should.equal('h264_mp4toannexb');
      args[args.indexOf('-movflags') + 1].should.equal('+frag_keyframe+empty_moov');
      args[args.indexOf('-max_muxing_queue_size') + 1].should.equal('1024');
    });

    it('should build HLS and MPEG-DASH arguments', () => {
      const hlsArgs = Ffmpeg(testVideo)
        .hls({
          time: 4,
          listSize: 0,
          segmentType: 'fmp4',
          fmp4InitFilename: 'init.mp4',
          segmentFilename: 'seg_%03d.m4s',
          playlistType: 'vod',
          flags: ['independent_segments', 'temp_file']
        })
        .output('/tmp/playlist.m3u8')
        .getArguments();

      hlsArgs[hlsArgs.indexOf('-f') + 1].should.equal('hls');
      hlsArgs[hlsArgs.indexOf('-hls_time') + 1].should.equal('4');
      hlsArgs[hlsArgs.indexOf('-hls_list_size') + 1].should.equal('0');
      hlsArgs[hlsArgs.indexOf('-hls_segment_type') + 1].should.equal('fmp4');
      hlsArgs[hlsArgs.indexOf('-hls_fmp4_init_filename') + 1].should.equal('init.mp4');
      hlsArgs[hlsArgs.indexOf('-hls_segment_filename') + 1].should.equal('seg_%03d.m4s');
      hlsArgs[hlsArgs.indexOf('-hls_playlist_type') + 1].should.equal('vod');
      hlsArgs[hlsArgs.indexOf('-hls_flags') + 1].should.equal('independent_segments+temp_file');

      const dashArgs = Ffmpeg(testVideo)
        .dash({
          segDuration: 4,
          useTemplate: true,
          useTimeline: true,
          ldash: true,
          hlsPlaylist: true
        })
        .output('/tmp/manifest.mpd')
        .getArguments();

      dashArgs[dashArgs.indexOf('-f') + 1].should.equal('dash');
      dashArgs[dashArgs.indexOf('-seg_duration') + 1].should.equal('4');
      dashArgs[dashArgs.indexOf('-use_template') + 1].should.equal('1');
      dashArgs[dashArgs.indexOf('-use_timeline') + 1].should.equal('1');
      dashArgs[dashArgs.indexOf('-ldash') + 1].should.equal('1');
      dashArgs[dashArgs.indexOf('-hls_playlist') + 1].should.equal('1');
    });
  });

  describe('Real FFmpeg 7 execution of modern features', () => {
    let tmpDir;

    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fluent-ffmpeg-modern-'));
    });

    afterEach(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('should execute saveAsync with modern H.264/CRF/pixFmt/faststart/metadata and probe result', async function() {
      this.timeout(15000);
      const outMp4 = path.join(tmpDir, 'modern.mp4');

      await Ffmpeg(testVideo)
        .videoCodec('libx264')
        .crf(28)
        .videoPreset('ultrafast')
        .pixelFormat('yuv420p')
        .fpsMode('cfr')
        .faststart()
        .metadata({ title: 'ModernTest' })
        .saveAsync(outMp4);

      assert.ok(fs.existsSync(outMp4));
      const info = await ffprobe(outMp4);
      info.streams[0].codec_name.should.equal('h264');
      info.streams[0].pix_fmt.should.equal('yuv420p');
      info.format.tags.title.should.equal('ModernTest');
    });

    it('should execute lavfi virtual input using fixed FFmpeg 7 format parser', async function() {
      this.timeout(15000);
      const outMp4 = path.join(tmpDir, 'lavfi.mp4');

      await Ffmpeg('testsrc=duration=1:size=160x120:rate=10')
        .inputFormat('lavfi')
        .videoCodec('libx264')
        .videoPreset('ultrafast')
        .pixelFormat('yuv420p')
        .saveAsync(outMp4);

      const info = await ffprobe(outMp4);
      info.streams[0].width.should.equal(160);
      info.streams[0].height.should.equal(120);
    });

    it('should execute loudnessNormalize on real audio file via runAsync', async function() {
      this.timeout(15000);
      const outWav = path.join(tmpDir, 'norm.wav');

      await Ffmpeg(testAudio1)
        .loudnessNormalize({ integrated: -16, truePeak: -1.5, lra: 11 })
        .output(outWav)
        .runAsync();

      assert.ok(fs.statSync(outWav).size > 0);
    });

    it('should execute HLS output with fMP4 segments', async function() {
      this.timeout(15000);
      const playlist = path.join(tmpDir, 'index.m3u8');

      await Ffmpeg(testVideo)
        .videoCodec('libx264')
        .videoPreset('ultrafast')
        .pixelFormat('yuv420p')
        .hls({
          time: 1,
          listSize: 0,
          segmentType: 'fmp4',
          playlistType: 'vod',
          segmentFilename: path.join(tmpDir, 'seg_%03d.m4s')
        })
        .saveAsync(playlist);

      assert.ok(fs.existsSync(playlist));
      const content = fs.readFileSync(playlist, 'utf8');
      assert.ok(content.includes('#EXTM3U'));
    });

    it('should support screenshotsAsync with fastSeek and nested output directory without mutating config', async function() {
      this.timeout(15000);
      const nestedDir = path.join(tmpDir, 'a', 'b', 'thumbs');
      const cfg = {
        timemarks: [0.5, 1.5],
        filename: 'thumb_%i.png',
        size: '160x?',
        fastSeek: true,
        folder: nestedDir
      };

      const files = await Ffmpeg(testVideo).screenshotsAsync(cfg);
      assert.deepStrictEqual(files, ['thumb_1.png', 'thumb_2.png']);
      assert.deepStrictEqual(cfg.timemarks, [0.5, 1.5]);
      assert.ok(fs.existsSync(path.join(nestedDir, 'thumb_1.png')));
      assert.ok(fs.existsSync(path.join(nestedDir, 'thumb_2.png')));
    });

    it('should cancel a running command via AbortSignal', async function() {
      this.timeout(15000);
      const controller = new AbortController();
      const outAvi = path.join(tmpDir, 'aborted.avi');

      setTimeout(() => controller.abort(new Error('User cancelled')), 200);

      let caught = null;
      try {
        await Ffmpeg(testVideoBig, { signal: controller.signal })
          .usingPreset('divx')
          .saveAsync(outAvi);
      } catch (err) {
        caught = err;
      }

      assert.ok(caught instanceof Error);
      caught.message.should.match(/User cancelled/);
    });
  });

  describe('Dual JS (CommonJS + ESM) & TypeScript interoperability', () => {
    it('should load and execute via CommonJS require() from dist/index.cjs', async () => {
      const require = createRequire(import.meta.url);
      const cjsFfmpeg = require('../dist/index.cjs');

      assert.strictEqual(typeof cjsFfmpeg, 'function');
      assert.strictEqual(typeof cjsFfmpeg.ffprobe, 'function');
      assert.strictEqual(typeof cjsFfmpeg.availableHwaccels, 'function');
      assert.strictEqual(typeof cjsFfmpeg.FfmpegCommand, 'function');

      const cmd1 = cjsFfmpeg(testVideo).videoCodec('libx264').crf(23).faststart();
      const cmd2 = new cjsFfmpeg(testVideo).usingPreset('divx');

      assert.ok(cmd1 instanceof cjsFfmpeg);
      assert.ok(cmd2 instanceof cjsFfmpeg.FfmpegCommand);
      assert.ok(cmd1.getArguments().includes('-crf'));
      assert.ok(cmd2.getArguments().includes('-vtag'));

      const probe = await cjsFfmpeg.ffprobe(testVideo);
      probe.format.format_name.should.equal('avi');
    });

    it('should run directly in Node.js native TypeScript execution', function(done) {
      this.timeout(10000);
      const majorNode = parseInt(process.versions.node.split('.')[0], 10);
      if (majorNode < 22) {
        return this.skip();
      }
      const script = `
        import ffmpeg, { type FfprobeData } from '@wibukarbitt/fluent-ffmpeg';
        const data: FfprobeData = await ffmpeg.ffprobe(${JSON.stringify(testVideo)});
        if (data.format.format_name !== 'avi') throw new Error('unexpected format');
        console.log('TS_OK:' + data.streams[0].codec_name);
      `;

      execFile(process.execPath, ['--input-type=module-typescript', '-e', script], {
        cwd: path.resolve(__dirname, '..')
      }, (err, stdout) => {
        if (err) return done(err);
        stdout.trim().should.equal('TS_OK:mpeg4');
        done();
      });
    });
  });
});
