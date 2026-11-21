import { args } from '../utils.js';


/*
 *! Input-related methods
 */

export default function(proto) {
  /**
   * Add an input to command
   *
   * Also switches "current input", that is the input that will be affected
   * by subsequent input-related methods.
   *
   * Note: only one stream input is supported for now.
   *
   * @method FfmpegCommand#input
   * @category Input
   * @aliases mergeAdd,addInput
   *
   * @param {String|Readable} source input file path or readable stream
   * @return FfmpegCommand
   */
  proto.mergeAdd =
  proto.addInput =
  proto.input = function(source) {
    let isFile = false;
    let isStream = false;

    if (typeof source !== 'string') {
      if (!source || typeof source !== 'object' || !('readable' in source) || !(source.readable)) {
        throw new Error('Invalid input');
      }

      const hasInputStream = this._inputs.some((input) => {
        return input.isStream;
      });

      if (hasInputStream) {
        throw new Error('Only one input stream is supported');
      }

      isStream = true;
      source.pause();
    } else {
      const protocol = source.match(/^([a-z]{2,}):/i);
      isFile = !protocol || protocol[1].toLowerCase() === 'file';
    }

    this._inputs.push(this._currentInput = {
      source: source,
      isFile: isFile,
      isStream: isStream,
      options: args()
    });

    return this;
  };


  /**
   * Specify input format for the last specified input
   *
   * @method FfmpegCommand#inputFormat
   * @category Input
   * @aliases withInputFormat,fromFormat
   *
   * @param {String} format input format
   * @return FfmpegCommand
   */
  proto.withInputFormat =
  proto.inputFormat =
  proto.fromFormat = function(format) {
    if (!this._currentInput) {
      throw new Error('No input specified');
    }

    this._currentInput.options('-f', format);
    return this;
  };


  /**
   * Specify input FPS for the last specified input
   * (only valid for raw video formats)
   *
   * @method FfmpegCommand#inputFps
   * @category Input
   * @aliases withInputFps,withInputFPS,withFpsInput,withFPSInput,inputFPS,inputFps,fpsInput
   *
   * @param {Number|String} fps input FPS
   * @return FfmpegCommand
   */
  proto.withInputFps =
  proto.withInputFPS =
  proto.withFpsInput =
  proto.withFPSInput =
  proto.inputFPS =
  proto.inputFps =
  proto.fpsInput =
  proto.FPSInput = function(fps) {
    if (!this._currentInput) {
      throw new Error('No input specified');
    }

    this._currentInput.options('-r', fps);
    return this;
  };


  /**
   * Use native framerate for the last specified input
   *
   * @method FfmpegCommand#native
   * @category Input
   * @aliases nativeFramerate,withNativeFramerate
   *
   * @return FfmpegCommand
   */
  proto.nativeFramerate =
  proto.withNativeFramerate =
  proto.native = function() {
    if (!this._currentInput) {
      throw new Error('No input specified');
    }

    this._currentInput.options('-re');
    return this;
  };


  /**
   * Specify input seek time for the last specified input
   *
   * @method FfmpegCommand#seekInput
   * @category Input
   * @aliases setStartTime
   *
   * @param {String|Number} seek seek time in seconds or as a '[hh:[mm:]]ss[.xxx]' string
   * @return FfmpegCommand
   */
  proto.setStartTime =
  proto.seekInput = function(seek) {
    if (!this._currentInput) {
      throw new Error('No input specified');
    }

    this._currentInput.options('-ss', seek);

    return this;
  };


  /**
   * Specify input end position (`-to`) for the last specified input (FFmpeg 4.0+)
   *
   * @method FfmpegCommand#inputTo
   * @category Input
   *
   * @param {String|Number} position stop reading input at position (seconds or '[[hh:]mm:]ss[.xxx]')
   * @return FfmpegCommand
   */
  proto.inputTo = function(position) {
    if (!this._currentInput) {
      throw new Error('No input specified');
    }

    this._currentInput.options('-to', position);
    return this;
  };


  /**
   * Loop over the last specified input (for image inputs; uses `-loop 1`)
   *
   * @method FfmpegCommand#loop
   * @category Input
   *
   * @param {String|Number} [duration] loop duration in seconds or as a '[[hh:]mm:]ss[.xxx]' string
   * @return FfmpegCommand
   */
  proto.loop = function(duration) {
    if (!this._currentInput) {
      throw new Error('No input specified');
    }

    this._currentInput.options('-loop', '1');

    if (typeof duration !== 'undefined') {
      this.duration(duration);
    }

    return this;
  };


  /**
   * Loop over the last specified input stream (`-stream_loop`, works on video & audio inputs)
   *
   * @method FfmpegCommand#streamLoop
   * @category Input
   *
   * @param {Number} [count=-1] number of times to loop (`-1` = infinite loop, `0` = no loop)
   * @return FfmpegCommand
   */
  proto.streamLoop = function(count = -1) {
    if (!this._currentInput) {
      throw new Error('No input specified');
    }

    this._currentInput.options('-stream_loop', String(count));
    return this;
  };


  /**
   * Set custom HTTP headers for the last specified network input (`-headers`)
   *
   * @method FfmpegCommand#headers
   * @category Input
   *
   * @param {Object|String} headers map of header names to values, or pre-formatted CRLF header string
   * @return FfmpegCommand
   */
  proto.headers = function(headers) {
    if (!this._currentInput) {
      throw new Error('No input specified');
    }

    let formatted;
    if (typeof headers === 'string') {
      formatted = headers.endsWith('\r\n') ? headers : headers + '\r\n';
    } else if (headers && typeof headers === 'object') {
      formatted = Object.entries(headers)
        .map(([key, value]) => `${key}: ${value}\r\n`)
        .join('');
    } else {
      throw new Error('Invalid headers');
    }

    this._currentInput.options('-headers', formatted);
    return this;
  };


  /**
   * Override the HTTP User-Agent for the last specified network input (`-user_agent`)
   *
   * @method FfmpegCommand#userAgent
   * @category Input
   *
   * @param {String} ua user agent string
   * @return FfmpegCommand
   */
  proto.userAgent = function(ua) {
    if (!this._currentInput) {
      throw new Error('No input specified');
    }

    this._currentInput.options('-user_agent', String(ua));
    return this;
  };


  /**
   * Enable automatic HTTP reconnect options for the last specified network input
   *
   * @method FfmpegCommand#reconnect
   * @category Input
   *
   * @param {Object|Boolean} [options=true] boolean or reconnect configuration
   * @param {Boolean} [options.streamed=true] reconnect even for non-seekable streams (`-reconnect_streamed`)
   * @param {Boolean} [options.onNetworkError=true] reconnect on TCP/TLS errors (`-reconnect_on_network_error`)
   * @param {String|Number[]} [options.onHttpError] HTTP error codes to reconnect on (e.g. '4xx,5xx')
   * @param {Number} [options.delayMax=5] maximum delay in seconds between reconnect attempts (`-reconnect_delay_max`)
   * @return FfmpegCommand
   */
  proto.reconnect = function(options = true) {
    if (!this._currentInput) {
      throw new Error('No input specified');
    }

    if (options === false) {
      this._currentInput.options('-reconnect', '0');
      return this;
    }

    const cfg = typeof options === 'object' && options !== null ? options : {};
    this._currentInput.options('-reconnect', '1');

    if (cfg.streamed !== false) {
      this._currentInput.options('-reconnect_streamed', '1');
    }
    if (cfg.onNetworkError !== false) {
      this._currentInput.options('-reconnect_on_network_error', '1');
    }
    if (cfg.onHttpError !== undefined) {
      const codes = Array.isArray(cfg.onHttpError) ? cfg.onHttpError.join(',') : String(cfg.onHttpError);
      this._currentInput.options('-reconnect_on_http_error', codes);
    }
    if (cfg.delayMax !== undefined) {
      this._currentInput.options('-reconnect_delay_max', String(cfg.delayMax));
    }

    return this;
  };
}
