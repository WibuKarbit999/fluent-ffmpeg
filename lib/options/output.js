import { args, escapeFilterPath, formatMapSpec } from '../utils.js';



/*
 *! Output-related methods
 */

export default function(proto) {
  /**
   * Add output
   *
   * @method FfmpegCommand#output
   * @category Output
   * @aliases addOutput
   *
   * @param {String|Writable} target target file path or writable stream
   * @param {Object} [pipeopts={}] pipe options (only applies to streams)
   * @return FfmpegCommand
   */
  proto.addOutput =
  proto.output = function(target, pipeopts) {
    let isFile = false;

    if (!target && this._currentOutput) {
      // No target is only allowed when called from constructor
      throw new Error('Invalid output');
    }

    if (target && typeof target !== 'string') {
      if (typeof target !== 'object' || !('writable' in target) || !(target.writable)) {
        throw new Error('Invalid output');
      }
    } else if (typeof target === 'string') {
      const protocol = target.match(/^([a-z]{2,}):/i);
      isFile = !protocol || protocol[1].toLowerCase() === 'file';
    }

    if (target && !('target' in this._currentOutput)) {
      // For backwards compatibility, set target for first output
      this._currentOutput.target = target;
      this._currentOutput.isFile = isFile;
      this._currentOutput.pipeopts = pipeopts || {};
    } else {
      if (target && typeof target !== 'string') {
        const hasOutputStream = this._outputs.some((output) => {
          return 'target' in output && typeof output.target !== 'string';
        });

        if (hasOutputStream) {
          throw new Error('Only one output stream is supported');
        }
      }

      this._outputs.push(this._currentOutput = {
        target: target,
        isFile: isFile,
        flags: {},
        pipeopts: pipeopts || {}
      });

      const self = this;
      ['audio', 'audioFilters', 'video', 'videoFilters', 'sizeFilters', 'options'].forEach((key) => {
        self._currentOutput[key] = args();
      });

      if (!target) {
        // Call from constructor: remove target key
        delete this._currentOutput.target;
      }
    }

    return this;
  };


  /**
   * Specify output seek time
   *
   * @method FfmpegCommand#seek
   * @category Output
   * @aliases seekOutput
   *
   * @param {String|Number} seek seek time in seconds or as a '[hh:[mm:]]ss[.xxx]' string
   * @return FfmpegCommand
   */
  proto.seekOutput =
  proto.seek = function(seek) {
    this._currentOutput.options('-ss', seek);
    return this;
  };


  /**
   * Set output duration
   *
   * @method FfmpegCommand#duration
   * @category Output
   * @aliases withDuration,setDuration
   *
   * @param {String|Number} duration duration in seconds or as a '[[hh:]mm:]ss[.xxx]' string
   * @return FfmpegCommand
   */
  proto.withDuration =
  proto.setDuration =
  proto.duration = function(duration) {
    this._currentOutput.options('-t', duration);
    return this;
  };


  /**
   * Stop writing output at position (`-to`)
   *
   * @method FfmpegCommand#to
   * @category Output
   * @aliases endTime
   *
   * @param {String|Number} position stop position in seconds or as a '[[hh:]mm:]ss[.xxx]' string
   * @return FfmpegCommand
   */
  proto.endTime =
  proto.to = function(position) {
    this._currentOutput.options('-to', position);
    return this;
  };


  /**
   * Finish encoding when the shortest input stream ends (`-shortest`)
   *
   * @method FfmpegCommand#shortest
   * @category Output
   *
   * @return FfmpegCommand
   */
  proto.shortest = function() {
    this._currentOutput.options('-shortest');
    return this;
  };


  /**
   * Set output format
   *
   * @method FfmpegCommand#format
   * @category Output
   * @aliases toFormat,withOutputFormat,outputFormat
   *
   * @param {String} format output format name
   * @return FfmpegCommand
   */
  proto.toFormat =
  proto.withOutputFormat =
  proto.outputFormat =
  proto.format = function(format) {
    this._currentOutput.options('-f', format);
    return this;
  };


  /**
   * Add stream mapping to output (`-map`).
   *
   * Supports both filtergraph pad labels (`'out'`, `'[out]'`) and input stream specifiers
   * (`'0:v'`, `'0:a:0?'`, `'-0:s'`, `'0'`).
   *
   * @method FfmpegCommand#map
   * @category Output
   *
   * @param {String} spec stream specification string or filtergraph label
   * @return FfmpegCommand
   */
  proto.map = function(spec) {
    this._currentOutput.options('-map', formatMapSpec(spec));
    return this;
  };


  /**
   * Disable subtitle streams in the output (`-sn`)
   *
   * @method FfmpegCommand#noSubtitles
   * @category Output
   * @aliases withNoSubtitles
   *
   * @return FfmpegCommand
   */
  proto.withNoSubtitles =
  proto.noSubtitles = function() {
    this._currentOutput.options('-sn');
    return this;
  };


  /**
   * Disable data streams in the output (`-dn`)
   *
   * @method FfmpegCommand#noData
   * @category Output
   * @aliases withNoData
   *
   * @return FfmpegCommand
   */
  proto.withNoData =
  proto.noData = function() {
    this._currentOutput.options('-dn');
    return this;
  };


  /**
   * Specify subtitle codec (`-c:s`, e.g. 'mov_text', 'srt', 'ass', 'webvtt', 'copy')
   *
   * @method FfmpegCommand#subtitleCodec
   * @category Output
   * @aliases withSubtitleCodec
   *
   * @param {String} codec subtitle codec name
   * @return FfmpegCommand
   */
  proto.withSubtitleCodec =
  proto.subtitleCodec = function(codec) {
    this._currentOutput.options('-c:s', codec);
    return this;
  };


  /**
   * Burn (hardcode) external subtitles into the video stream using the `subtitles` or `ass` filter
   * with proper FFmpeg filtergraph path escaping.
   *
   * @method FfmpegCommand#burnSubtitles
   * @category Output
   *
   * @param {String} filePath path to `.srt`, `.vtt`, `.ass`, or `.ssa` subtitle file
   * @param {Object} [options={}] subtitle filter options
   * @param {String} [options.forceStyle] ASS style overrides (e.g. 'FontSize=24,PrimaryColour=&Hffffff&')
   * @param {String} [options.fontsDir] directory containing custom fonts (`fontsdir`)
   * @param {String} [options.charenc] character encoding (e.g. 'UTF-8')
   * @param {Number} [options.streamIndex] subtitle stream index inside container (`si`)
   * @param {String} [options.originalSize] original video size (`original_size`, e.g. '1920x1080')
   * @param {Boolean} [options.useAssFilter=false] use `ass` filter instead of `subtitles`
   * @return FfmpegCommand
   */
  proto.burnSubtitles = function(filePath, options = {}) {
    const filterName = options.useAssFilter ? 'ass' : 'subtitles';
    const parts = [`filename='${escapeFilterPath(filePath)}'`];

    if (options.fontsDir) {
      parts.push(`fontsdir='${escapeFilterPath(options.fontsDir)}'`);
    }
    if (options.charenc && !options.useAssFilter) {
      parts.push(`charenc=${options.charenc}`);
    }
    if (options.streamIndex !== undefined && !options.useAssFilter) {
      parts.push(`si=${options.streamIndex}`);
    }
    if (options.originalSize && !options.useAssFilter) {
      parts.push(`original_size=${options.originalSize}`);
    }
    if (options.forceStyle && !options.useAssFilter) {
      parts.push(`force_style='${String(options.forceStyle).replace(/'/g, "\\\\'")}'`);
    }

    return this.videoFilters(`${filterName}=${parts.join(':')}`);
  };


  /**
   * Set output metadata (`-metadata` or `-metadata:<streamSpec>`)
   *
   * @method FfmpegCommand#metadata
   * @category Output
   *
   * @param {String|Object} keyOrObj metadata key or map of key/value pairs
   * @param {String|Number} [value] metadata value (when `keyOrObj` is a string)
   * @param {String} [streamSpec] optional stream specifier (e.g. 's:a:0', 's:v:0', 'g')
   * @return FfmpegCommand
   */
  proto.metadata = function(keyOrObj, value, streamSpec) {
    if (keyOrObj && typeof keyOrObj === 'object') {
      const spec = typeof value === 'string' ? value : undefined;
      const flag = spec ? `-metadata:${spec}` : '-metadata';
      for (const [k, v] of Object.entries(keyOrObj)) {
        this._currentOutput.options(flag, `${k}=${v}`);
      }
      return this;
    }

    const flag = streamSpec ? `-metadata:${streamSpec}` : '-metadata';
    this._currentOutput.options(flag, `${keyOrObj}=${value ?? ''}`);
    return this;
  };


  /**
   * Map metadata from an input file (`-map_metadata`, use `'-1'` to strip all metadata)
   *
   * @method FfmpegCommand#mapMetadata
   * @category Output
   *
   * @param {String|Number} spec metadata mapping spec (e.g. '-1', '0', '0:g')
   * @return FfmpegCommand
   */
  proto.mapMetadata = function(spec) {
    this._currentOutput.options('-map_metadata', String(spec));
    return this;
  };


  /**
   * Map chapters from an input file (`-map_chapters`, use `'-1'` to strip chapters)
   *
   * @method FfmpegCommand#mapChapters
   * @category Output
   *
   * @param {String|Number} spec input file index or '-1'
   * @return FfmpegCommand
   */
  proto.mapChapters = function(spec) {
    this._currentOutput.options('-map_chapters', String(spec));
    return this;
  };


  /**
   * Set stream disposition (`-disposition:<spec> <value>`, e.g. `.disposition('a:0', 'default')`)
   *
   * @method FfmpegCommand#disposition
   * @category Output
   *
   * @param {String} streamSpec stream specifier (e.g. 'a:0', 's:0', 'v:0')
   * @param {String} value disposition flags (e.g. 'default', 'forced', '0', '+default-forced')
   * @return FfmpegCommand
   */
  proto.disposition = function(streamSpec, value) {
    this._currentOutput.options(`-disposition:${streamSpec}`, String(value));
    return this;
  };


  /**
   * Apply a bitstream filter to output streams (`-bsf[:streamType] <filter>`)
   *
   * @method FfmpegCommand#bitstreamFilter
   * @category Output
   * @aliases bsf
   *
   * @param {String|String[]} filter bitstream filter name(s) (e.g. 'h264_mp4toannexb', 'aac_adtstoasc')
   * @param {String} [streamType] optional stream specifier ('v', 'a', 's', 'v:0', etc.)
   * @return FfmpegCommand
   */
  proto.bsf =
  proto.bitstreamFilter = function(filter, streamType) {
    const value = Array.isArray(filter) ? filter.join(',') : String(filter);
    const flag = streamType ? `-bsf:${streamType}` : '-bsf';
    this._currentOutput.options(flag, value);
    return this;
  };


  /**
   * Set MOV/MP4 muxer flags (`-movflags`, e.g. '+faststart' or ['+frag_keyframe', '+empty_moov'])
   *
   * @method FfmpegCommand#movflags
   * @category Output
   *
   * @param {String|String[]} flags movflags string or array of flags
   * @return FfmpegCommand
   */
  proto.movflags = function(flags) {
    const value = Array.isArray(flags)
      ? flags.map((f) => (f.startsWith('+') || f.startsWith('-') ? f : `+${f}`)).join('')
      : String(flags);
    this._currentOutput.options('-movflags', value);
    return this;
  };


  /**
   * Enable MP4 faststart (`-movflags +faststart`) for progressive web playback
   *
   * @method FfmpegCommand#faststart
   * @category Output
   *
   * @return FfmpegCommand
   */
  proto.faststart = function() {
    return this.movflags('+faststart');
  };


  /**
   * Copy all streams without re-encoding (`-c copy`)
   *
   * @method FfmpegCommand#copyAll
   * @category Output
   * @aliases streamCopy
   *
   * @return FfmpegCommand
   */
  proto.streamCopy =
  proto.copyAll = function() {
    this._currentOutput.options('-c', 'copy');
    return this;
  };


  /**
   * Set maximum muxing queue size (`-max_muxing_queue_size`)
   *
   * @method FfmpegCommand#maxMuxingQueueSize
   * @category Output
   *
   * @param {Number} size maximum packets buffered
   * @return FfmpegCommand
   */
  proto.maxMuxingQueueSize = function(size) {
    this._currentOutput.options('-max_muxing_queue_size', String(size));
    return this;
  };


  /**
   * Run flvtool2/flvmeta on output
   *
   * @method FfmpegCommand#flvmeta
   * @category Output
   * @aliases updateFlvMetadata
   *
   * @return FfmpegCommand
   */
  proto.updateFlvMetadata =
  proto.flvmeta = function() {
    this._currentOutput.flags.flvmeta = true;
    return this;
  };
}
