import { EventEmitter } from 'events';

import inputs from './options/inputs.js';
import audio from './options/audio.js';
import video from './options/video.js';
import videosize from './options/videosize.js';
import output from './options/output.js';
import custom from './options/custom.js';
import hwaccel from './options/hwaccel.js';
import streaming from './options/streaming.js';
import misc from './options/misc.js';
import processor from './processor.js';
import capabilities from './capabilities.js';
import ffprobe from './ffprobe.js';
import recipes from './recipes.js';
import { args, copy, getBuiltinPresetsDir } from './utils.js';


/**
 * Create an ffmpeg command
 *
 * Can be called with or without the 'new' operator, and the 'input' parameter
 * may be specified as 'options.source' instead (or passed later with the
 * addInput method).
 *
 * @constructor
 * @param {String|ReadableStream|Object} [input] input file path, readable stream, or options object
 * @param {Object} [options] command options
 * @param {Object} [options.logger=<no logging>] logger object with 'error', 'warn', 'info' and 'debug' methods
 * @param {Number} [options.niceness=0] ffmpeg process niceness, ignored on Windows
 * @param {Number} [options.priority=0] alias for `niceness`
 * @param {String} [options.presets="fluent-ffmpeg/lib/presets"] directory to load presets from
 * @param {String} [options.preset="fluent-ffmpeg/lib/presets"] alias for `presets`
 * @param {Number} [options.stdoutLines=100] maximum lines of ffmpeg output to keep in memory, use 0 for unlimited
 * @param {Number} [options.timeout=<no timeout>] ffmpeg processing timeout in seconds
 * @param {String} [options.cwd] working directory for spawned ffmpeg process
 * @param {AbortSignal} [options.signal] AbortSignal to cancel the running ffmpeg process
 * @param {String|ReadableStream} [options.source=<no input>] alias for the `input` parameter
 */
class FfmpegCommand extends EventEmitter {
  constructor(input, options) {
    super();

    if (input && typeof input === 'object' && !('readable' in input)) {
      // Options object passed directly (shallow-copy to avoid mutating caller object)
      options = { ...input };
    } else {
      // Input passed first
      options = options ? { ...options } : {};
      if (input !== undefined && input !== null) {
        options.source = input;
      }
    }

    // Add input if present
    this._inputs = [];
    if (options.source) {
      this.input(options.source);
    }

    // Add target-less output for backwards compatibility
    this._outputs = [];
    this.output();

    // Create argument lists
    const self = this;
    ['_global', '_complexFilters'].forEach((prop) => {
      self[prop] = args();
    });

    // Set default option values
    options.stdoutLines = 'stdoutLines' in options ? options.stdoutLines : 100;
    options.presets = options.presets || options.preset || getBuiltinPresetsDir();
    options.niceness = options.niceness || options.priority || 0;

    // Save options
    this.options = options;

    // Setup logger
    this.logger = options.logger || {
      debug: function() {},
      info: function() {},
      warn: function() {},
      error: function() {}
    };
  }

  /**
   * Clone an ffmpeg command
   *
   * This method is useful when you want to process the same input multiple times.
   * It returns a new FfmpegCommand instance with the exact same options.
   *
   * All options set _after_ the clone() call will only be applied to the instance
   * it has been called on.
   *
   * @method FfmpegCommand#clone
   * @return FfmpegCommand
   */
  clone() {
    const clone = new FfmpegCommand();
    const self = this;

    // Clone options and logger (shallow copy options so mutations don't leak across clones)
    clone.options = { ...this.options };
    clone.logger = this.logger;

    // Clone inputs preserving isFile, isStream, and _currentInput
    clone._inputs = this._inputs.map((input) => {
      return {
        source: input.source,
        isFile: input.isFile,
        isStream: input.isStream,
        options: input.options.clone()
      };
    });

    if (this._currentInput) {
      const currentIdx = this._inputs.indexOf(this._currentInput);
      clone._currentInput = currentIdx >= 0
        ? clone._inputs[currentIdx]
        : clone._inputs[clone._inputs.length - 1];
    }

    // Create first output
    if ('target' in this._outputs[0]) {
      // We have outputs set, don't clone them and create first output
      clone._outputs = [];
      clone.output();
    } else {
      // No outputs set, clone first output options
      clone._outputs = [
        clone._currentOutput = {
          isFile: this._currentOutput.isFile,
          flags: {},
          pipeopts: this._currentOutput.pipeopts ? { ...this._currentOutput.pipeopts } : {}
        }
      ];

      ['audio', 'audioFilters', 'video', 'videoFilters', 'sizeFilters', 'options'].forEach((key) => {
        clone._currentOutput[key] = self._currentOutput[key].clone();
      });

      if (this._currentOutput.sizeData) {
        clone._currentOutput.sizeData = {};
        copy(this._currentOutput.sizeData, clone._currentOutput.sizeData);
      }

      copy(this._currentOutput.flags, clone._currentOutput.flags);
    }

    // Clone argument lists
    ['_global', '_complexFilters'].forEach((prop) => {
      clone[prop] = self[prop].clone();
    });

    return clone;
  }
}


// Add methods from options submodules
inputs(FfmpegCommand.prototype);
audio(FfmpegCommand.prototype);
video(FfmpegCommand.prototype);
videosize(FfmpegCommand.prototype);
output(FfmpegCommand.prototype);
custom(FfmpegCommand.prototype);
hwaccel(FfmpegCommand.prototype);
streaming(FfmpegCommand.prototype);
misc(FfmpegCommand.prototype);

// Add processor methods
processor(FfmpegCommand.prototype);

// Add capabilities methods
capabilities(FfmpegCommand.prototype);

// Static methods
FfmpegCommand.setFfmpegPath = function(path) {
  (new FfmpegCommand()).setFfmpegPath(path);
};

FfmpegCommand.setFfprobePath = function(path) {
  (new FfmpegCommand()).setFfprobePath(path);
};

FfmpegCommand.setFlvtoolPath = function(path) {
  (new FfmpegCommand()).setFlvtoolPath(path);
};

FfmpegCommand.availableFilters =
FfmpegCommand.getAvailableFilters = function(callback) {
  return (new FfmpegCommand()).availableFilters(callback);
};

FfmpegCommand.availableCodecs =
FfmpegCommand.getAvailableCodecs = function(callback) {
  return (new FfmpegCommand()).availableCodecs(callback);
};

FfmpegCommand.availableFormats =
FfmpegCommand.getAvailableFormats = function(callback) {
  return (new FfmpegCommand()).availableFormats(callback);
};

FfmpegCommand.availableEncoders =
FfmpegCommand.getAvailableEncoders = function(callback) {
  return (new FfmpegCommand()).availableEncoders(callback);
};

FfmpegCommand.availableDecoders =
FfmpegCommand.getAvailableDecoders = function(callback) {
  return (new FfmpegCommand()).availableDecoders(callback);
};

FfmpegCommand.availableHwaccels =
FfmpegCommand.getAvailableHwaccels = function(callback) {
  return (new FfmpegCommand()).availableHwaccels(callback);
};

FfmpegCommand.availablePixelFormats =
FfmpegCommand.getAvailablePixelFormats = function(callback) {
  return (new FfmpegCommand()).availablePixelFormats(callback);
};

FfmpegCommand.availableBitstreamFilters =
FfmpegCommand.getAvailableBitstreamFilters = function(callback) {
  return (new FfmpegCommand()).availableBitstreamFilters(callback);
};

FfmpegCommand.availableProtocols =
FfmpegCommand.getAvailableProtocols = function(callback) {
  return (new FfmpegCommand()).availableProtocols(callback);
};

FfmpegCommand.ffmpegVersion =
FfmpegCommand.getFfmpegVersion = function(callback) {
  return (new FfmpegCommand()).ffmpegVersion(callback);
};

// Add ffprobe methods
ffprobe(FfmpegCommand.prototype);

FfmpegCommand.ffprobe = function(file, ...rest) {
  const instance = new FfmpegCommand(file);
  return instance.ffprobe(...rest);
};

// Add processing recipes
recipes(FfmpegCommand.prototype);

// Keep the documented ability to call the export without 'new'.
// A Proxy keeps `prototype`, static methods and `instanceof` working as before.
const ffmpeg = new Proxy(FfmpegCommand, {
  apply(target, thisArg, argList) {
    return new target(...argList);
  }
});

// Expose named class reference on the callable export (useful for CommonJS destructuring)
FfmpegCommand.FfmpegCommand = FfmpegCommand;

export { FfmpegCommand };
export default ffmpeg;
