import { formatBitrate, makeFilterStrings } from '../utils.js';



/*
 *! Video-related methods
 */

export default function(proto) {
  /**
   * Disable video in the output
   *
   * @method FfmpegCommand#noVideo
   * @category Video
   * @aliases withNoVideo
   *
   * @return FfmpegCommand
   */
  proto.withNoVideo =
  proto.noVideo = function() {
    this._currentOutput.video.clear();
    this._currentOutput.videoFilters.clear();
    this._currentOutput.sizeFilters.clear();
    delete this._currentOutput.sizeData;
    this._currentOutput.video('-vn');

    return this;
  };


  /**
   * Specify video codec
   *
   * @method FfmpegCommand#videoCodec
   * @category Video
   * @aliases withVideoCodec
   *
   * @param {String} codec video codec name
   * @return FfmpegCommand
   */
  proto.withVideoCodec =
  proto.videoCodec = function(codec) {
    this._currentOutput.video('-vcodec', codec);
    return this;
  };


  /**
   * Specify video bitrate
   *
   * @method FfmpegCommand#videoBitrate
   * @category Video
   * @aliases withVideoBitrate
   *
   * @param {String|Number} bitrate video bitrate in kbps (with an optional 'k' suffix, or explicit unit like '5M')
   * @param {Boolean} [constant=false] enforce constant bitrate
   * @return FfmpegCommand
   */
  proto.withVideoBitrate =
  proto.videoBitrate = function(bitrate, constant) {
    bitrate = formatBitrate(bitrate);

    this._currentOutput.video('-b:v', bitrate);
    if (constant) {
      this._currentOutput.video(
        '-maxrate', bitrate,
        '-minrate', bitrate,
        '-bufsize', '3M'
      );
    }

    return this;
  };


  /**
   * Specify Constant Rate Factor (`-crf`) for quality-based video encoding
   * (libx264, libx265, libvpx-vp9, libsvtav1, libaom-av1, etc.)
   *
   * @method FfmpegCommand#crf
   * @category Video
   * @aliases videoQuality
   *
   * @param {Number} value CRF value (e.g. 18-28 for x264/x265, 24-35 for AV1/VP9)
   * @return FfmpegCommand
   */
  proto.videoQuality =
  proto.crf = function(value) {
    this._currentOutput.video('-crf', String(value));
    return this;
  };


  /**
   * Specify video encoder speed/compression preset (`-preset`)
   *
   * Note: distinct from {@link FfmpegCommand#preset} which loads JS preset modules.
   *
   * @method FfmpegCommand#videoPreset
   * @category Video
   * @aliases encodePreset
   *
   * @param {String|Number} preset encoder preset (e.g. 'ultrafast'..'veryslow', 'p1'..'p7' for NVENC, 0..13 for SVT-AV1)
   * @return FfmpegCommand
   */
  proto.encodePreset =
  proto.videoPreset = function(preset) {
    this._currentOutput.video('-preset', String(preset));
    return this;
  };


  /**
   * Specify video encoder tuning (`-tune`, e.g. 'film', 'animation', 'grain', 'zerolatency', 'hq', 'll')
   *
   * @method FfmpegCommand#videoTune
   * @category Video
   * @aliases encodeTune
   *
   * @param {String} tune encoder tune name
   * @return FfmpegCommand
   */
  proto.encodeTune =
  proto.videoTune = function(tune) {
    this._currentOutput.video('-tune', String(tune));
    return this;
  };


  /**
   * Specify video encoder profile (`-profile:v`, e.g. 'baseline', 'main', 'high', 'high10', 'main10')
   *
   * @method FfmpegCommand#videoProfile
   * @category Video
   * @aliases withVideoProfile
   *
   * @param {String} profile video profile name
   * @return FfmpegCommand
   */
  proto.withVideoProfile =
  proto.videoProfile = function(profile) {
    this._currentOutput.video('-profile:v', String(profile));
    return this;
  };


  /**
   * Specify video encoder level (`-level:v`, e.g. '3.1', '4.0', '4.1', '5.1')
   *
   * @method FfmpegCommand#videoLevel
   * @category Video
   * @aliases withVideoLevel
   *
   * @param {String|Number} level video level
   * @return FfmpegCommand
   */
  proto.withVideoLevel =
  proto.videoLevel = function(level) {
    this._currentOutput.video('-level:v', String(level));
    return this;
  };


  /**
   * Specify output pixel format (`-pix_fmt`, e.g. 'yuv420p', 'yuv420p10le', 'yuv444p', 'nv12', 'rgba')
   *
   * @method FfmpegCommand#pixelFormat
   * @category Video
   * @aliases pixFmt,withPixelFormat
   *
   * @param {String} format pixel format name
   * @return FfmpegCommand
   */
  proto.pixFmt =
  proto.withPixelFormat =
  proto.pixelFormat = function(format) {
    this._currentOutput.video('-pix_fmt', format);
    return this;
  };


  /**
   * Specify GOP size / keyframe interval (`-g`)
   *
   * @method FfmpegCommand#gopSize
   * @category Video
   * @aliases keyframeInterval
   *
   * @param {Number} size group of pictures size in frames
   * @return FfmpegCommand
   */
  proto.keyframeInterval =
  proto.gopSize = function(size) {
    this._currentOutput.video('-g', String(size));
    return this;
  };


  /**
   * Specify maximum number of B-frames (`-bf`)
   *
   * @method FfmpegCommand#bFrames
   * @category Video
   *
   * @param {Number} count maximum consecutive B-frames
   * @return FfmpegCommand
   */
  proto.bFrames = function(count) {
    this._currentOutput.video('-bf', String(count));
    return this;
  };


  /**
   * Configure 2-pass video encoding (`-pass` and optional `-passlogfile`)
   *
   * @method FfmpegCommand#twoPass
   * @category Video
   *
   * @param {Number} pass pass number (1 or 2)
   * @param {String} [logFile] prefix for two-pass log file
   * @return FfmpegCommand
   */
  proto.twoPass = function(pass, logFile) {
    this._currentOutput.video('-pass', String(pass));
    if (logFile) {
      this._currentOutput.video('-passlogfile', logFile);
    }
    return this;
  };


  /**
   * Set video frame rate mode (`-fps_mode`, FFmpeg 5.1+ replacement for deprecated `-vsync`)
   *
   * @method FfmpegCommand#fpsMode
   * @category Video
   *
   * @param {String} mode one of 'passthrough', 'cfr', 'vfr', 'drop', 'auto'
   * @return FfmpegCommand
   */
  proto.fpsMode = function(mode) {
    this._currentOutput.video('-fps_mode', mode);
    return this;
  };


  /**
   * Set video color space / HDR signaling metadata
   * (`-color_primaries`, `-color_trc`, `-colorspace`, `-color_range`)
   *
   * @method FfmpegCommand#colorSpace
   * @category Video
   *
   * @param {Object} options color signaling parameters
   * @param {String} [options.primaries] color primaries (e.g. 'bt709', 'bt2020')
   * @param {String} [options.transfer] transfer characteristics (e.g. 'bt709', 'smpte2084' for PQ/HDR10, 'arib-std-b67' for HLG)
   * @param {String} [options.matrix] color matrix/space (e.g. 'bt709', 'bt2020nc', 'bt2020c')
   * @param {String} [options.range] color range ('tv'/'mpeg' or 'pc'/'jpeg')
   * @return FfmpegCommand
   */
  proto.colorSpace = function(options) {
    if (!options || typeof options !== 'object') {
      throw new Error('colorSpace options must be an object');
    }

    if (options.primaries) {
      this._currentOutput.video('-color_primaries', options.primaries);
    }
    if (options.transfer) {
      this._currentOutput.video('-color_trc', options.transfer);
    }
    if (options.matrix) {
      this._currentOutput.video('-colorspace', options.matrix);
    }
    if (options.range) {
      this._currentOutput.video('-color_range', options.range);
    }

    return this;
  };


  /**
   * Specify video codec fourcc/tag (`-tag:v`, e.g. 'hvc1' for Safari/Apple HEVC compatibility)
   *
   * @method FfmpegCommand#videoTag
   * @category Video
   * @aliases withVideoTag
   *
   * @param {String} tag codec tag
   * @return FfmpegCommand
   */
  proto.withVideoTag =
  proto.videoTag = function(tag) {
    this._currentOutput.video('-tag:v', tag);
    return this;
  };


  /**
   * Specify custom video filter(s)
   *
   * Can be called both with one or many filters, or a filter array.
   *
   * @method FfmpegCommand#videoFilters
   * @category Video
   * @aliases withVideoFilter,withVideoFilters,videoFilter
   *
   * @param {...String|String[]|Object[]} filters video filter strings, string array or
   *   filter specification array, each with the following properties:
   * @param {String} filters.filter filter name
   * @param {String|String[]|Object} [filters.options] filter option string, array, or object
   * @return FfmpegCommand
   */
  proto.withVideoFilter =
  proto.withVideoFilters =
  proto.videoFilter =
  proto.videoFilters = function(filters) {
    if (arguments.length > 1) {
      filters = [].slice.call(arguments);
    }

    if (!Array.isArray(filters)) {
      filters = [filters];
    }

    this._currentOutput.videoFilters(makeFilterStrings(filters));

    return this;
  };


  /**
   * Specify output FPS
   *
   * @method FfmpegCommand#fps
   * @category Video
   * @aliases withOutputFps,withOutputFPS,withFpsOutput,withFPSOutput,withFps,withFPS,outputFPS,outputFps,fpsOutput,FPSOutput,FPS
   *
   * @param {Number|String} fps output FPS
   * @return FfmpegCommand
   */
  proto.withOutputFps =
  proto.withOutputFPS =
  proto.withFpsOutput =
  proto.withFPSOutput =
  proto.withFps =
  proto.withFPS =
  proto.outputFPS =
  proto.outputFps =
  proto.fpsOutput =
  proto.FPSOutput =
  proto.fps =
  proto.FPS = function(fps) {
    this._currentOutput.video('-r', fps);
    return this;
  };


  /**
   * Only transcode a certain number of frames
   *
   * @method FfmpegCommand#frames
   * @category Video
   * @aliases takeFrames,withFrames
   *
   * @param {Number} frames frame count
   * @return FfmpegCommand
   */
  proto.takeFrames =
  proto.withFrames =
  proto.frames = function(frames) {
    this._currentOutput.video('-vframes', frames);
    return this;
  };
}
