import { platform } from 'os';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import whichBin from 'which';

export const isWindows = platform().match(/win(32|64)/);
export const streamRegexp = /^\[?(.*?)\]?$/;

const nlRegexp = /\r\n|\r|\n/g;
const filterEscapeRegexp = /[,]/;
const inputStreamSpecRegexp = /^-?\d+(?:[:?]|$)/;
const progressKnownKeys = new Set(['frame', 'fps', 'q', 'size', 'Lsize', 'time', 'bitrate', 'dup', 'drop', 'speed', 'elapsed']);
const whichCache = {};

/**
 * Resolve the built-in presets directory in both ESM and bundled CJS environments.
 *
 * @return {String}
 * @private
 */
export function getBuiltinPresetsDir() {
  if (typeof __FLUENT_FFMPEG_CJS__ !== 'undefined' && __FLUENT_FFMPEG_CJS__) {
    return resolve(__dirname, '../lib/presets');
  }

  return resolve(dirname(fileURLToPath(import.meta.url)), 'presets');
}

/**
 * Return a CommonJS `require` function anchored at the caller module
 * (works in both ESM and bundled CJS).
 *
 * @param {String} [metaUrl]
 * @return {Function}
 * @private
 */
export function getLocalRequire(metaUrl) {
  if (typeof __FLUENT_FFMPEG_CJS__ !== 'undefined' && __FLUENT_FFMPEG_CJS__) {
    return require;
  }

  return createRequire(metaUrl || import.meta.url);
}

/**
 * Format a stream map specifier for FFmpeg `-map`.
 *
 * - Keeps already-bracketed labels (`[out]`) intact.
 * - Keeps numeric input stream specifiers (`0`, `0:v`, `0:a:0?`, `-0:s`, `0:m:language:eng`)
 *   unbracketed so FFmpeg resolves them as input streams instead of filtergraph labels.
 * - Wraps bare filtergraph pad labels (`out`, `screen0`) in square brackets for backwards compatibility.
 *
 * @param {String} spec
 * @return {String}
 * @private
 */
export function formatMapSpec(spec) {
  const str = String(spec);
  if (str.startsWith('[') && str.endsWith(']')) {
    return str;
  }

  if (inputStreamSpecRegexp.test(str)) {
    return str;
  }

  return str.replace(streamRegexp, '[$1]');
}

/**
 * Format a bitrate argument for FFmpeg (`-b:a`, `-b:v`, etc.).
 * Appends `k` only for plain numeric values; preserves explicit suffixes like `k`, `K`, `M`, `m`, `b`.
 *
 * @param {String|Number} bitrate
 * @return {String}
 * @private
 */
export function formatBitrate(bitrate) {
  const str = String(bitrate).trim();
  if (/^[0-9]+(?:\.[0-9]+)?$/.test(str)) {
    return str + 'k';
  }
  return str;
}

/**
 * Escape a file path or value for use inside FFmpeg filtergraph options (e.g. `subtitles=...`).
 *
 * @param {String} value
 * @return {String}
 * @private
 */
export function escapeFilterPath(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/:/g, '\\:')
    .replace(/'/g, "\\\\'")
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

/**
 * Parse progress line from ffmpeg stderr
 *
 * @param {String} line progress line
 * @return progress object
 * @private
 */
function parseProgressLine(line) {
  const progress = {};

  // Remove all spaces after = and trim
  line = line.replace(/=\s+/g, '=').trim();
  if (!line) {
    return null;
  }

  const progressParts = line.split(/\s+/);
  let hasKnownKey = false;

  // Split every progress part by "=" to get key and value
  for (let i = 0; i < progressParts.length; i++) {
    const eqIndex = progressParts[i].indexOf('=');
    if (eqIndex <= 0) {
      return null;
    }

    const key = progressParts[i].slice(0, eqIndex);
    const value = progressParts[i].slice(eqIndex + 1);

    if (progressKnownKeys.has(key)) {
      hasKnownKey = true;
    }

    progress[key] = value;
  }

  if (!hasKnownKey || (!('time' in progress) && !('frame' in progress) && !('size' in progress) && !('Lsize' in progress))) {
    return null;
  }

  return progress;
}


/**
 * Copy an object keys into another one
 *
 * @param {Object} source source object
 * @param {Object} dest destination object
 * @private
 */
export function copy(source, dest) {
  Object.keys(source).forEach((key) => {
    dest[key] = source[key];
  });
}


/**
 * Create an argument list
 *
 * Returns a function that adds new arguments to the list.
 * It also has the following methods:
 * - clear() empties the argument list
 * - get() returns the argument list
 * - find(arg, count) finds 'arg' in the list and return the following 'count' items, or undefined if not found
 * - remove(arg, count) remove 'arg' in the list as well as the following 'count' items
 *
 * @private
 */
export function args() {
  const list = [];

  // Append argument(s) to the list
  const argfunc = function() {
    if (arguments.length === 1 && Array.isArray(arguments[0])) {
      list.push(...arguments[0]);
    } else {
      list.push(...[].slice.call(arguments));
    }
  };

  // Clear argument list
  argfunc.clear = function() {
    list.length = 0;
  };

  // Return argument list
  argfunc.get = function() {
    return list;
  };

  // Find argument 'arg' in list, and if found, return an array of the 'count' items that follow it
  argfunc.find = function(arg, count) {
    const index = list.indexOf(arg);
    if (index !== -1) {
      return list.slice(index + 1, index + 1 + (count || 0));
    }
  };

  // Find argument 'arg' in list, and if found, remove it as well as the following 'count' items
  argfunc.remove = function(arg, count) {
    const index = list.indexOf(arg);
    if (index !== -1) {
      list.splice(index, (count || 0) + 1);
    }
  };

  // Clone argument list
  argfunc.clone = function() {
    const cloned = args();
    cloned(list);
    return cloned;
  };

  return argfunc;
}


/**
 * Generate filter strings
 *
 * @param {String[]|Object[]} filters filter specifications. When using objects,
 *   each must have the following properties:
 * @param {String} filters.filter filter name
 * @param {String|Array} [filters.inputs] (array of) input stream specifier(s) for the filter,
 *   defaults to ffmpeg automatically choosing the first unused matching streams
 * @param {String|Array} [filters.outputs] (array of) output stream specifier(s) for the filter,
 *   defaults to ffmpeg automatically assigning the output to the output file
 * @param {Object|String|Array|Number} [filters.options] filter options, can be omitted to not set any options
 * @return String[]
 * @private
 */
export function makeFilterStrings(filters) {
  return filters.map((filterSpec) => {
    if (typeof filterSpec === 'string') {
      return filterSpec;
    }

    let filterString = '';

    // Filter string format is:
    // [input1][input2]...filter[output1][output2]...
    // The 'filter' part can optionaly have arguments:
    //   filter=arg1:arg2:arg3
    //   filter=arg1=v1:arg2=v2:arg3=v3

    // Add inputs
    if (Array.isArray(filterSpec.inputs)) {
      filterString += filterSpec.inputs.map((streamSpec) => {
        return streamSpec.replace(streamRegexp, '[$1]');
      }).join('');
    } else if (typeof filterSpec.inputs === 'string') {
      filterString += filterSpec.inputs.replace(streamRegexp, '[$1]');
    }

    // Add filter
    filterString += filterSpec.filter;

    // Add options (handle numeric 0 properly!)
    if (typeof filterSpec.options === 'number') {
      filterString += '=' + filterSpec.options;
    } else if (filterSpec.options) {
      if (typeof filterSpec.options === 'string') {
        // Option string
        filterString += '=' + filterSpec.options;
      } else if (Array.isArray(filterSpec.options)) {
        // Option array (unnamed options)
        filterString += '=' + filterSpec.options.map((option) => {
          if (typeof option === 'string' && option.match(filterEscapeRegexp)) {
            return '\'' + option + '\'';
          } else {
            return option;
          }
        }).join(':');
      } else if (Object.keys(filterSpec.options).length) {
        // Option object (named options)
        filterString += '=' + Object.keys(filterSpec.options).map((option) => {
          let value = filterSpec.options[option];

          if (typeof value === 'string' && value.match(filterEscapeRegexp)) {
            value = '\'' + value + '\'';
          }

          return option + '=' + value;
        }).join(':');
      }
    }

    // Add outputs
    if (Array.isArray(filterSpec.outputs)) {
      filterString += filterSpec.outputs.map((streamSpec) => {
        return streamSpec.replace(streamRegexp, '[$1]');
      }).join('');
    } else if (typeof filterSpec.outputs === 'string') {
      filterString += filterSpec.outputs.replace(streamRegexp, '[$1]');
    }

    return filterString;
  });
}


/**
 * Search for an executable
 *
 * Uses 'which' or 'where' depending on platform
 *
 * @param {String} name executable name
 * @param {Function} callback callback with signature (err, path)
 * @private
 */
export function which(name, callback) {
  const cacheKey = `${process.env.PATH || ''}\0${name}`;
  if (cacheKey in whichCache) {
    return callback(null, whichCache[cacheKey]);
  }

  whichBin(name, (err, result) => {
    if (err) {
      // Treat errors as not found
      return callback(null, whichCache[cacheKey] = '');
    }
    callback(null, whichCache[cacheKey] = result);
  });
}


/**
 * Convert a [[hh:]mm:]ss[.xxx] timemark into seconds
 *
 * @param {String|Number} timemark timemark string
 * @return Number
 * @private
 */
export function timemarkToSeconds(timemark) {
  if (typeof timemark === 'number') {
    return timemark;
  }

  if (typeof timemark !== 'string') {
    return NaN;
  }

  let str = timemark.trim();
  if (!str || str === 'N/A') {
    return NaN;
  }

  let sign = 1;
  if (str.startsWith('-')) {
    sign = -1;
    str = str.slice(1);
  }

  if (str.indexOf(':') === -1 && str.indexOf('.') >= 0) {
    return sign * Number(str);
  }

  const parts = str.split(':');

  // add seconds
  let secs = Number(parts.pop());

  if (parts.length) {
    // add minutes
    secs += Number(parts.pop()) * 60;
  }

  if (parts.length) {
    // add hours
    secs += Number(parts.pop()) * 3600;
  }

  return sign * secs;
}


/**
 * Extract codec data from ffmpeg stderr and emit 'codecData' event if appropriate
 * Call it with an initially empty codec object once with each line of stderr output until it returns true
 *
 * @param {FfmpegCommand} command event emitter
 * @param {String} stderrLine ffmpeg stderr output line
 * @param {Object} codecObject object used to accumulate codec data between calls
 * @return {Boolean} true if codec data is complete (and event was emitted), false otherwise
 * @private
 */
export function extractCodecData(command, stderrLine, codecsObject) {
  const inputPattern = /Input #[0-9]+, ([^ ]+),/;
  const durPattern = /Duration\: ([^,]+)/;
  const audioPattern = /^\s*Stream #.*?\bAudio:\s*(.*)/;
  const videoPattern = /^\s*Stream #.*?\bVideo:\s*(.*)/;

  if (!('inputStack' in codecsObject)) {
    codecsObject.inputStack = [];
    codecsObject.inputIndex = -1;
    codecsObject.inInput = false;
  }

  const inputStack = codecsObject.inputStack;
  let inputIndex = codecsObject.inputIndex;
  let inInput = codecsObject.inInput;

  let format, dur, audio, video;

  if ((format = stderrLine.match(inputPattern))) {
    inInput = codecsObject.inInput = true;
    inputIndex = codecsObject.inputIndex = codecsObject.inputIndex + 1;

    inputStack[inputIndex] = { format: format[1], audio: '', video: '', duration: '' };
  } else if (inInput && (dur = stderrLine.match(durPattern))) {
    inputStack[inputIndex].duration = dur[1];
  } else if (inInput && (audio = stderrLine.match(audioPattern))) {
    if (!inputStack[inputIndex].audio) {
      audio = audio[1].split(', ');
      inputStack[inputIndex].audio = audio[0];
      inputStack[inputIndex].audio_details = audio;
    }
  } else if (inInput && (video = stderrLine.match(videoPattern))) {
    // Do not let attached cover art overwrite an already-detected primary video stream
    if (!inputStack[inputIndex].video || !/\(attached pic\)/i.test(stderrLine)) {
      if (!inputStack[inputIndex].video) {
        video = video[1].split(', ');
        inputStack[inputIndex].video = video[0];
        inputStack[inputIndex].video_details = video;
      }
    }
  } else if (/Output #\d+/.test(stderrLine)) {
    inInput = codecsObject.inInput = false;
  } else if (/Stream mapping:|Press (\[q\]|ctrl-c) to stop/.test(stderrLine)) {
    command.emit.apply(command, ['codecData'].concat(inputStack));
    return true;
  }

  return false;
}


/**
 * Parse ffmpeg bitrate string (e.g. '1234.5kbits/s', '1.5Mbits/s', '500bits/s', 'N/A') into kbps
 *
 * @param {String} [bitrateStr]
 * @return {Number}
 * @private
 */
function parseBitrateKbps(bitrateStr) {
  if (!bitrateStr || bitrateStr === 'N/A') {
    return 0;
  }

  const value = parseFloat(bitrateStr);
  if (isNaN(value)) {
    return 0;
  }

  if (/Mbits\/s$/i.test(bitrateStr)) {
    return value * 1000;
  }
  if (/Gbits\/s$/i.test(bitrateStr)) {
    return value * 1000000;
  }
  if (/^[\d.]+bits\/s$/i.test(bitrateStr)) {
    return value / 1000;
  }

  return value;
}

/**
 * Extract progress data from ffmpeg stderr and emit 'progress' event if appropriate
 *
 * @param {FfmpegCommand} command event emitter
 * @param {String} stderrLine ffmpeg stderr data
 * @private
 */
export function extractProgress(command, stderrLine) {
  const progress = parseProgressLine(stderrLine);

  if (progress) {
    // build progress report object
    const ret = {
      frames: parseInt(progress.frame, 10),
      currentFps: parseInt(progress.fps, 10),
      currentKbps: parseBitrateKbps(progress.bitrate),
      targetSize: parseInt(progress.size || progress.Lsize, 10),
      timemark: progress.time
    };

    if (progress.speed && progress.speed !== 'N/A') {
      ret.speed = progress.speed;
    }

    // calculate percent progress using duration
    if (
      ret.timemark &&
      ret.timemark !== 'N/A' &&
      command._ffprobeData &&
      command._ffprobeData.format &&
      command._ffprobeData.format.duration
    ) {
      const duration = Number(command._ffprobeData.format.duration);
      const currentSeconds = timemarkToSeconds(ret.timemark);
      if (!isNaN(duration) && duration > 0 && !isNaN(currentSeconds)) {
        ret.percent = (currentSeconds / duration) * 100;
      }
    }
    command.emit('progress', ret);
  }
}


/**
 * Extract error message(s) from ffmpeg stderr
 *
 * @param {String} stderr ffmpeg stderr data
 * @return {String}
 * @private
 */
export function extractError(stderr) {
  if (!stderr) {
    return '';
  }

  const lines = stderr.split(nlRegexp);

  // Only return the last stderr lines that don't start with a space or a square bracket
  const extracted = lines.reduce((messages, message) => {
    if (message.charAt(0) === ' ' || message.charAt(0) === '[') {
      return [];
    } else {
      messages.push(message);
      return messages;
    }
  }, []).filter((line) => line.length > 0).join('\n');

  if (extracted) {
    return extracted;
  }

  // Fallback for FFmpeg 7+ where final error lines start with `[component @ 0x...]`
  const nonEmpty = lines.filter((line) => line.trim().length > 0);
  return nonEmpty.length ? nonEmpty[nonEmpty.length - 1] : '';
}


/**
 * Creates a line ring buffer object with the following methods:
 * - append(str) : appends a string or buffer
 * - get() : returns the whole string
 * - close() : prevents further append() calls and does a last call to callbacks
 * - callback(cb) : calls cb for each line (incl. those already in the ring)
 *
 * @param {Number} maxLines maximum number of lines to store (<= 0 for unlimited)
 */
export function linesRing(maxLines) {
  const cbs = [];
  const lines = [];
  let current = null;
  let closed = false;
  const max = maxLines - 1;

  function emit(line) {
    cbs.forEach((cb) => { cb(line); });
  }

  return {
    callback: function(cb) {
      lines.forEach((l) => { cb(l); });
      cbs.push(cb);
    },

    append: function(str) {
      if (closed) return;
      if (str instanceof Buffer) str = '' + str;
      if (!str || str.length === 0) return;

      const newLines = str.split(nlRegexp);

      if (newLines.length === 1) {
        if (current !== null) {
          current = current + newLines.shift();
        } else {
          current = newLines.shift();
        }
      } else {
        if (current !== null) {
          current = current + newLines.shift();
          emit(current);
          lines.push(current);
        }

        current = newLines.pop();

        newLines.forEach((l) => {
          emit(l);
          lines.push(l);
        });

        if (max > -1 && lines.length > max) {
          lines.splice(0, lines.length - max);
        }
      }
    },

    get: function() {
      if (current !== null) {
        return lines.concat([current]).join('\n');
      } else {
        return lines.join('\n');
      }
    },

    close: function() {
      if (closed) return;

      if (current !== null) {
        emit(current);
        lines.push(current);

        if (max > -1 && lines.length > max) {
          lines.shift();
        }

        current = null;
      }

      closed = true;
    }
  };
}
