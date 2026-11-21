/* Auto-generated CommonJS bundle for @wibukarbitt/fluent-ffmpeg. Do not edit manually. */
const __importMetaUrl = require('url').pathToFileURL(__filename).href;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod2, isNodeMode, target) => (target = mod2 != null ? __create(__getProtoOf(mod2)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod2 || !mod2.__esModule ? __defProp(target, "default", { value: mod2, enumerable: true }) : target,
  mod2
));
var __toCommonJS = (mod2) => __copyProps(__defProp({}, "__esModule", { value: true }), mod2);

// lib/utils.js
function getBuiltinPresetsDir() {
  if (true) {
    return (0, import_path.resolve)(__dirname, "../lib/presets");
  }
  return (0, import_path.resolve)((0, import_path.dirname)((0, import_url.fileURLToPath)(__importMetaUrl)), "presets");
}
function getLocalRequire(metaUrl) {
  if (true) {
    return require;
  }
  return (0, import_module.createRequire)(metaUrl || __importMetaUrl);
}
function formatMapSpec(spec) {
  const str = String(spec);
  if (str.startsWith("[") && str.endsWith("]")) {
    return str;
  }
  if (inputStreamSpecRegexp.test(str)) {
    return str;
  }
  return str.replace(streamRegexp, "[$1]");
}
function formatBitrate(bitrate) {
  const str = String(bitrate).trim();
  if (/^[0-9]+(?:\.[0-9]+)?$/.test(str)) {
    return str + "k";
  }
  return str;
}
function escapeFilterPath(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/:/g, "\\:").replace(/'/g, "\\\\'").replace(/\[/g, "\\[").replace(/\]/g, "\\]").replace(/,/g, "\\,").replace(/;/g, "\\;");
}
function parseProgressLine(line) {
  const progress = {};
  line = line.replace(/=\s+/g, "=").trim();
  if (!line) {
    return null;
  }
  const progressParts = line.split(/\s+/);
  let hasKnownKey = false;
  for (let i = 0; i < progressParts.length; i++) {
    const eqIndex = progressParts[i].indexOf("=");
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
  if (!hasKnownKey || !("time" in progress) && !("frame" in progress) && !("size" in progress) && !("Lsize" in progress)) {
    return null;
  }
  return progress;
}
function copy(source, dest) {
  Object.keys(source).forEach((key) => {
    dest[key] = source[key];
  });
}
function args() {
  const list = [];
  const argfunc = function() {
    if (arguments.length === 1 && Array.isArray(arguments[0])) {
      list.push(...arguments[0]);
    } else {
      list.push(...[].slice.call(arguments));
    }
  };
  argfunc.clear = function() {
    list.length = 0;
  };
  argfunc.get = function() {
    return list;
  };
  argfunc.find = function(arg, count) {
    const index = list.indexOf(arg);
    if (index !== -1) {
      return list.slice(index + 1, index + 1 + (count || 0));
    }
  };
  argfunc.remove = function(arg, count) {
    const index = list.indexOf(arg);
    if (index !== -1) {
      list.splice(index, (count || 0) + 1);
    }
  };
  argfunc.clone = function() {
    const cloned = args();
    cloned(list);
    return cloned;
  };
  return argfunc;
}
function makeFilterStrings(filters) {
  return filters.map((filterSpec) => {
    if (typeof filterSpec === "string") {
      return filterSpec;
    }
    let filterString = "";
    if (Array.isArray(filterSpec.inputs)) {
      filterString += filterSpec.inputs.map((streamSpec) => {
        return streamSpec.replace(streamRegexp, "[$1]");
      }).join("");
    } else if (typeof filterSpec.inputs === "string") {
      filterString += filterSpec.inputs.replace(streamRegexp, "[$1]");
    }
    filterString += filterSpec.filter;
    if (typeof filterSpec.options === "number") {
      filterString += "=" + filterSpec.options;
    } else if (filterSpec.options) {
      if (typeof filterSpec.options === "string") {
        filterString += "=" + filterSpec.options;
      } else if (Array.isArray(filterSpec.options)) {
        filterString += "=" + filterSpec.options.map((option) => {
          if (typeof option === "string" && option.match(filterEscapeRegexp)) {
            return "'" + option + "'";
          } else {
            return option;
          }
        }).join(":");
      } else if (Object.keys(filterSpec.options).length) {
        filterString += "=" + Object.keys(filterSpec.options).map((option) => {
          let value = filterSpec.options[option];
          if (typeof value === "string" && value.match(filterEscapeRegexp)) {
            value = "'" + value + "'";
          }
          return option + "=" + value;
        }).join(":");
      }
    }
    if (Array.isArray(filterSpec.outputs)) {
      filterString += filterSpec.outputs.map((streamSpec) => {
        return streamSpec.replace(streamRegexp, "[$1]");
      }).join("");
    } else if (typeof filterSpec.outputs === "string") {
      filterString += filterSpec.outputs.replace(streamRegexp, "[$1]");
    }
    return filterString;
  });
}
function which(name, callback) {
  const cacheKey = `${process.env.PATH || ""}\0${name}`;
  if (cacheKey in whichCache) {
    return callback(null, whichCache[cacheKey]);
  }
  (0, import_which.default)(name, (err, result) => {
    if (err) {
      return callback(null, whichCache[cacheKey] = "");
    }
    callback(null, whichCache[cacheKey] = result);
  });
}
function timemarkToSeconds(timemark) {
  if (typeof timemark === "number") {
    return timemark;
  }
  if (typeof timemark !== "string") {
    return NaN;
  }
  let str = timemark.trim();
  if (!str || str === "N/A") {
    return NaN;
  }
  let sign = 1;
  if (str.startsWith("-")) {
    sign = -1;
    str = str.slice(1);
  }
  if (str.indexOf(":") === -1 && str.indexOf(".") >= 0) {
    return sign * Number(str);
  }
  const parts = str.split(":");
  let secs = Number(parts.pop());
  if (parts.length) {
    secs += Number(parts.pop()) * 60;
  }
  if (parts.length) {
    secs += Number(parts.pop()) * 3600;
  }
  return sign * secs;
}
function extractCodecData(command, stderrLine, codecsObject) {
  const inputPattern = /Input #[0-9]+, ([^ ]+),/;
  const durPattern = /Duration\: ([^,]+)/;
  const audioPattern = /^\s*Stream #.*?\bAudio:\s*(.*)/;
  const videoPattern = /^\s*Stream #.*?\bVideo:\s*(.*)/;
  if (!("inputStack" in codecsObject)) {
    codecsObject.inputStack = [];
    codecsObject.inputIndex = -1;
    codecsObject.inInput = false;
  }
  const inputStack = codecsObject.inputStack;
  let inputIndex = codecsObject.inputIndex;
  let inInput = codecsObject.inInput;
  let format, dur, audio, video;
  if (format = stderrLine.match(inputPattern)) {
    inInput = codecsObject.inInput = true;
    inputIndex = codecsObject.inputIndex = codecsObject.inputIndex + 1;
    inputStack[inputIndex] = { format: format[1], audio: "", video: "", duration: "" };
  } else if (inInput && (dur = stderrLine.match(durPattern))) {
    inputStack[inputIndex].duration = dur[1];
  } else if (inInput && (audio = stderrLine.match(audioPattern))) {
    if (!inputStack[inputIndex].audio) {
      audio = audio[1].split(", ");
      inputStack[inputIndex].audio = audio[0];
      inputStack[inputIndex].audio_details = audio;
    }
  } else if (inInput && (video = stderrLine.match(videoPattern))) {
    if (!inputStack[inputIndex].video || !/\(attached pic\)/i.test(stderrLine)) {
      if (!inputStack[inputIndex].video) {
        video = video[1].split(", ");
        inputStack[inputIndex].video = video[0];
        inputStack[inputIndex].video_details = video;
      }
    }
  } else if (/Output #\d+/.test(stderrLine)) {
    inInput = codecsObject.inInput = false;
  } else if (/Stream mapping:|Press (\[q\]|ctrl-c) to stop/.test(stderrLine)) {
    command.emit.apply(command, ["codecData"].concat(inputStack));
    return true;
  }
  return false;
}
function parseBitrateKbps(bitrateStr) {
  if (!bitrateStr || bitrateStr === "N/A") {
    return 0;
  }
  const value = parseFloat(bitrateStr);
  if (isNaN(value)) {
    return 0;
  }
  if (/Mbits\/s$/i.test(bitrateStr)) {
    return value * 1e3;
  }
  if (/Gbits\/s$/i.test(bitrateStr)) {
    return value * 1e6;
  }
  if (/^[\d.]+bits\/s$/i.test(bitrateStr)) {
    return value / 1e3;
  }
  return value;
}
function extractProgress(command, stderrLine) {
  const progress = parseProgressLine(stderrLine);
  if (progress) {
    const ret = {
      frames: parseInt(progress.frame, 10),
      currentFps: parseInt(progress.fps, 10),
      currentKbps: parseBitrateKbps(progress.bitrate),
      targetSize: parseInt(progress.size || progress.Lsize, 10),
      timemark: progress.time
    };
    if (progress.speed && progress.speed !== "N/A") {
      ret.speed = progress.speed;
    }
    if (ret.timemark && ret.timemark !== "N/A" && command._ffprobeData && command._ffprobeData.format && command._ffprobeData.format.duration) {
      const duration = Number(command._ffprobeData.format.duration);
      const currentSeconds = timemarkToSeconds(ret.timemark);
      if (!isNaN(duration) && duration > 0 && !isNaN(currentSeconds)) {
        ret.percent = currentSeconds / duration * 100;
      }
    }
    command.emit("progress", ret);
  }
}
function extractError(stderr) {
  if (!stderr) {
    return "";
  }
  const lines = stderr.split(nlRegexp);
  const extracted = lines.reduce((messages, message) => {
    if (message.charAt(0) === " " || message.charAt(0) === "[") {
      return [];
    } else {
      messages.push(message);
      return messages;
    }
  }, []).filter((line) => line.length > 0).join("\n");
  if (extracted) {
    return extracted;
  }
  const nonEmpty = lines.filter((line) => line.trim().length > 0);
  return nonEmpty.length ? nonEmpty[nonEmpty.length - 1] : "";
}
function linesRing(maxLines) {
  const cbs = [];
  const lines = [];
  let current = null;
  let closed = false;
  const max = maxLines - 1;
  function emit(line) {
    cbs.forEach((cb) => {
      cb(line);
    });
  }
  return {
    callback: function(cb) {
      lines.forEach((l) => {
        cb(l);
      });
      cbs.push(cb);
    },
    append: function(str) {
      if (closed) return;
      if (str instanceof Buffer) str = "" + str;
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
        return lines.concat([current]).join("\n");
      } else {
        return lines.join("\n");
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
var import_os, import_path, import_url, import_module, import_which, isWindows, streamRegexp, nlRegexp, filterEscapeRegexp, inputStreamSpecRegexp, progressKnownKeys, whichCache;
var init_utils = __esm({
  "lib/utils.js"() {
    "use strict";
    import_os = require("os");
    import_path = require("path");
    import_url = require("url");
    import_module = require("module");
    import_which = __toESM(require("which"), 1);
    isWindows = (0, import_os.platform)().match(/win(32|64)/);
    streamRegexp = /^\[?(.*?)\]?$/;
    nlRegexp = /\r\n|\r|\n/g;
    filterEscapeRegexp = /[,]/;
    inputStreamSpecRegexp = /^-?\d+(?:[:?]|$)/;
    progressKnownKeys = /* @__PURE__ */ new Set(["frame", "fps", "q", "size", "Lsize", "time", "bitrate", "dup", "drop", "speed", "elapsed"]);
    whichCache = {};
  }
});

// lib/options/inputs.js
function inputs_default(proto) {
  proto.mergeAdd = proto.addInput = proto.input = function(source) {
    let isFile = false;
    let isStream = false;
    if (typeof source !== "string") {
      if (!source || typeof source !== "object" || !("readable" in source) || !source.readable) {
        throw new Error("Invalid input");
      }
      const hasInputStream = this._inputs.some((input) => {
        return input.isStream;
      });
      if (hasInputStream) {
        throw new Error("Only one input stream is supported");
      }
      isStream = true;
      source.pause();
    } else {
      const protocol = source.match(/^([a-z]{2,}):/i);
      isFile = !protocol || protocol[1].toLowerCase() === "file";
    }
    this._inputs.push(this._currentInput = {
      source,
      isFile,
      isStream,
      options: args()
    });
    return this;
  };
  proto.withInputFormat = proto.inputFormat = proto.fromFormat = function(format) {
    if (!this._currentInput) {
      throw new Error("No input specified");
    }
    this._currentInput.options("-f", format);
    return this;
  };
  proto.withInputFps = proto.withInputFPS = proto.withFpsInput = proto.withFPSInput = proto.inputFPS = proto.inputFps = proto.fpsInput = proto.FPSInput = function(fps) {
    if (!this._currentInput) {
      throw new Error("No input specified");
    }
    this._currentInput.options("-r", fps);
    return this;
  };
  proto.nativeFramerate = proto.withNativeFramerate = proto.native = function() {
    if (!this._currentInput) {
      throw new Error("No input specified");
    }
    this._currentInput.options("-re");
    return this;
  };
  proto.setStartTime = proto.seekInput = function(seek) {
    if (!this._currentInput) {
      throw new Error("No input specified");
    }
    this._currentInput.options("-ss", seek);
    return this;
  };
  proto.inputTo = function(position) {
    if (!this._currentInput) {
      throw new Error("No input specified");
    }
    this._currentInput.options("-to", position);
    return this;
  };
  proto.loop = function(duration) {
    if (!this._currentInput) {
      throw new Error("No input specified");
    }
    this._currentInput.options("-loop", "1");
    if (typeof duration !== "undefined") {
      this.duration(duration);
    }
    return this;
  };
  proto.streamLoop = function(count = -1) {
    if (!this._currentInput) {
      throw new Error("No input specified");
    }
    this._currentInput.options("-stream_loop", String(count));
    return this;
  };
  proto.headers = function(headers) {
    if (!this._currentInput) {
      throw new Error("No input specified");
    }
    let formatted;
    if (typeof headers === "string") {
      formatted = headers.endsWith("\r\n") ? headers : headers + "\r\n";
    } else if (headers && typeof headers === "object") {
      formatted = Object.entries(headers).map(([key, value]) => `${key}: ${value}\r
`).join("");
    } else {
      throw new Error("Invalid headers");
    }
    this._currentInput.options("-headers", formatted);
    return this;
  };
  proto.userAgent = function(ua) {
    if (!this._currentInput) {
      throw new Error("No input specified");
    }
    this._currentInput.options("-user_agent", String(ua));
    return this;
  };
  proto.reconnect = function(options = true) {
    if (!this._currentInput) {
      throw new Error("No input specified");
    }
    if (options === false) {
      this._currentInput.options("-reconnect", "0");
      return this;
    }
    const cfg = typeof options === "object" && options !== null ? options : {};
    this._currentInput.options("-reconnect", "1");
    if (cfg.streamed !== false) {
      this._currentInput.options("-reconnect_streamed", "1");
    }
    if (cfg.onNetworkError !== false) {
      this._currentInput.options("-reconnect_on_network_error", "1");
    }
    if (cfg.onHttpError !== void 0) {
      const codes = Array.isArray(cfg.onHttpError) ? cfg.onHttpError.join(",") : String(cfg.onHttpError);
      this._currentInput.options("-reconnect_on_http_error", codes);
    }
    if (cfg.delayMax !== void 0) {
      this._currentInput.options("-reconnect_delay_max", String(cfg.delayMax));
    }
    return this;
  };
}
var init_inputs = __esm({
  "lib/options/inputs.js"() {
    "use strict";
    init_utils();
  }
});

// lib/options/audio.js
function audio_default(proto) {
  proto.withNoAudio = proto.noAudio = function() {
    this._currentOutput.audio.clear();
    this._currentOutput.audioFilters.clear();
    this._currentOutput.audio("-an");
    return this;
  };
  proto.withAudioCodec = proto.audioCodec = function(codec) {
    this._currentOutput.audio("-acodec", codec);
    return this;
  };
  proto.withAudioBitrate = proto.audioBitrate = function(bitrate) {
    this._currentOutput.audio("-b:a", formatBitrate(bitrate));
    return this;
  };
  proto.withAudioChannels = proto.audioChannels = function(channels) {
    this._currentOutput.audio("-ac", channels);
    return this;
  };
  proto.withAudioChannelLayout = proto.audioChannelLayout = function(layout) {
    this._currentOutput.audio("-channel_layout", layout);
    return this;
  };
  proto.withAudioFrequency = proto.audioFrequency = function(freq) {
    this._currentOutput.audio("-ar", freq);
    return this;
  };
  proto.withAudioSampleFormat = proto.audioSampleFormat = function(format) {
    this._currentOutput.audio("-sample_fmt", format);
    return this;
  };
  proto.withAudioProfile = proto.audioProfile = function(profile) {
    this._currentOutput.audio("-profile:a", profile);
    return this;
  };
  proto.withAudioTag = proto.audioTag = function(tag) {
    this._currentOutput.audio("-tag:a", tag);
    return this;
  };
  proto.withAudioQuality = proto.audioQuality = function(quality) {
    this._currentOutput.audio("-aq", quality);
    return this;
  };
  proto.loudnorm = proto.loudnessNormalize = function(options = {}) {
    const filterOpts = {
      I: options.integrated !== void 0 ? options.integrated : -16,
      TP: options.truePeak !== void 0 ? options.truePeak : -1.5,
      LRA: options.lra !== void 0 ? options.lra : 11
    };
    if (options.measuredI !== void 0) filterOpts.measured_I = options.measuredI;
    if (options.measuredTP !== void 0) filterOpts.measured_TP = options.measuredTP;
    if (options.measuredLRA !== void 0) filterOpts.measured_LRA = options.measuredLRA;
    if (options.measuredThresh !== void 0) filterOpts.measured_thresh = options.measuredThresh;
    if (options.offset !== void 0) filterOpts.offset = options.offset;
    if (options.linear !== void 0) filterOpts.linear = options.linear ? "true" : "false";
    if (options.dualMono !== void 0) filterOpts.dual_mono = options.dualMono ? "true" : "false";
    if (options.printFormat) filterOpts.print_format = options.printFormat;
    return this.audioFilters({ filter: "loudnorm", options: filterOpts });
  };
  proto.withAudioFilter = proto.withAudioFilters = proto.audioFilter = proto.audioFilters = function(filters) {
    if (arguments.length > 1) {
      filters = [].slice.call(arguments);
    }
    if (!Array.isArray(filters)) {
      filters = [filters];
    }
    this._currentOutput.audioFilters(makeFilterStrings(filters));
    return this;
  };
}
var init_audio = __esm({
  "lib/options/audio.js"() {
    "use strict";
    init_utils();
  }
});

// lib/options/video.js
function video_default(proto) {
  proto.withNoVideo = proto.noVideo = function() {
    this._currentOutput.video.clear();
    this._currentOutput.videoFilters.clear();
    this._currentOutput.sizeFilters.clear();
    delete this._currentOutput.sizeData;
    this._currentOutput.video("-vn");
    return this;
  };
  proto.withVideoCodec = proto.videoCodec = function(codec) {
    this._currentOutput.video("-vcodec", codec);
    return this;
  };
  proto.withVideoBitrate = proto.videoBitrate = function(bitrate, constant) {
    bitrate = formatBitrate(bitrate);
    this._currentOutput.video("-b:v", bitrate);
    if (constant) {
      this._currentOutput.video(
        "-maxrate",
        bitrate,
        "-minrate",
        bitrate,
        "-bufsize",
        "3M"
      );
    }
    return this;
  };
  proto.videoQuality = proto.crf = function(value) {
    this._currentOutput.video("-crf", String(value));
    return this;
  };
  proto.encodePreset = proto.videoPreset = function(preset) {
    this._currentOutput.video("-preset", String(preset));
    return this;
  };
  proto.encodeTune = proto.videoTune = function(tune) {
    this._currentOutput.video("-tune", String(tune));
    return this;
  };
  proto.withVideoProfile = proto.videoProfile = function(profile) {
    this._currentOutput.video("-profile:v", String(profile));
    return this;
  };
  proto.withVideoLevel = proto.videoLevel = function(level) {
    this._currentOutput.video("-level:v", String(level));
    return this;
  };
  proto.pixFmt = proto.withPixelFormat = proto.pixelFormat = function(format) {
    this._currentOutput.video("-pix_fmt", format);
    return this;
  };
  proto.keyframeInterval = proto.gopSize = function(size) {
    this._currentOutput.video("-g", String(size));
    return this;
  };
  proto.bFrames = function(count) {
    this._currentOutput.video("-bf", String(count));
    return this;
  };
  proto.twoPass = function(pass, logFile) {
    this._currentOutput.video("-pass", String(pass));
    if (logFile) {
      this._currentOutput.video("-passlogfile", logFile);
    }
    return this;
  };
  proto.fpsMode = function(mode) {
    this._currentOutput.video("-fps_mode", mode);
    return this;
  };
  proto.colorSpace = function(options) {
    if (!options || typeof options !== "object") {
      throw new Error("colorSpace options must be an object");
    }
    if (options.primaries) {
      this._currentOutput.video("-color_primaries", options.primaries);
    }
    if (options.transfer) {
      this._currentOutput.video("-color_trc", options.transfer);
    }
    if (options.matrix) {
      this._currentOutput.video("-colorspace", options.matrix);
    }
    if (options.range) {
      this._currentOutput.video("-color_range", options.range);
    }
    return this;
  };
  proto.withVideoTag = proto.videoTag = function(tag) {
    this._currentOutput.video("-tag:v", tag);
    return this;
  };
  proto.withVideoFilter = proto.withVideoFilters = proto.videoFilter = proto.videoFilters = function(filters) {
    if (arguments.length > 1) {
      filters = [].slice.call(arguments);
    }
    if (!Array.isArray(filters)) {
      filters = [filters];
    }
    this._currentOutput.videoFilters(makeFilterStrings(filters));
    return this;
  };
  proto.withOutputFps = proto.withOutputFPS = proto.withFpsOutput = proto.withFPSOutput = proto.withFps = proto.withFPS = proto.outputFPS = proto.outputFps = proto.fpsOutput = proto.FPSOutput = proto.fps = proto.FPS = function(fps) {
    this._currentOutput.video("-r", fps);
    return this;
  };
  proto.takeFrames = proto.withFrames = proto.frames = function(frames) {
    this._currentOutput.video("-vframes", frames);
    return this;
  };
}
var init_video = __esm({
  "lib/options/video.js"() {
    "use strict";
    init_utils();
  }
});

// lib/options/videosize.js
function getScalePadFilters(width, height, aspect, color) {
  return [
    /*
      In both cases, we first have to scale the input to match the requested size.
      When using computed width/height, we truncate them to multiples of 2
     */
    {
      filter: "scale",
      options: {
        w: "if(gt(a," + aspect + ")," + width + ",trunc(" + height + "*a/2)*2)",
        h: "if(lt(a," + aspect + ")," + height + ",trunc(" + width + "/a/2)*2)"
      }
    },
    /*
      Then we pad the scaled input to match the target size
      (here iw and ih refer to the padding input, i.e the scaled output)
     */
    {
      filter: "pad",
      options: {
        w: width,
        h: height,
        x: "if(gt(a," + aspect + "),0,(" + width + "-iw)/2)",
        y: "if(lt(a," + aspect + "),0,(" + height + "-ih)/2)",
        color
      }
    }
  ];
}
function createSizeFilters(output, key, value) {
  const data = output.sizeData = output.sizeData || {};
  data[key] = value;
  if (!("size" in data)) {
    return [];
  }
  const sizeStr = String(data.size);
  const fixedSize = sizeStr.match(/([0-9]+)x([0-9]+)/);
  const fixedWidth = sizeStr.match(/([0-9]+)x\?/);
  const fixedHeight = sizeStr.match(/\?x([0-9]+)/);
  const percentRatio = sizeStr.match(/\b([0-9]+(?:\.[0-9]+)?)%/);
  let width, height, aspect;
  if (percentRatio) {
    const ratio = Number(percentRatio[1]) / 100;
    return [{
      filter: "scale",
      options: {
        w: "trunc(iw*" + ratio + "/2)*2",
        h: "trunc(ih*" + ratio + "/2)*2"
      }
    }];
  } else if (fixedSize) {
    width = Math.round(Number(fixedSize[1]) / 2) * 2;
    height = Math.round(Number(fixedSize[2]) / 2) * 2;
    aspect = width / height;
    if (data.pad) {
      return getScalePadFilters(width, height, aspect, data.pad);
    } else {
      return [{ filter: "scale", options: { w: width, h: height } }];
    }
  } else if (fixedWidth || fixedHeight) {
    if ("aspect" in data) {
      width = fixedWidth ? fixedWidth[1] : Math.round(Number(fixedHeight[1]) * data.aspect);
      height = fixedHeight ? fixedHeight[1] : Math.round(Number(fixedWidth[1]) / data.aspect);
      width = Math.round(width / 2) * 2;
      height = Math.round(height / 2) * 2;
      if (data.pad) {
        return getScalePadFilters(width, height, data.aspect, data.pad);
      } else {
        return [{ filter: "scale", options: { w: width, h: height } }];
      }
    } else {
      if (fixedWidth) {
        return [{
          filter: "scale",
          options: {
            w: Math.round(Number(fixedWidth[1]) / 2) * 2,
            h: "trunc(ow/a/2)*2"
          }
        }];
      } else {
        return [{
          filter: "scale",
          options: {
            w: "trunc(oh*a/2)*2",
            h: Math.round(Number(fixedHeight[1]) / 2) * 2
          }
        }];
      }
    }
  } else {
    throw new Error("Invalid size specified: " + data.size);
  }
}
function videosize_default(proto) {
  proto.keepPixelAspect = // Only for compatibility, this is not about keeping _pixel_ aspect ratio
  proto.keepDisplayAspect = proto.keepDisplayAspectRatio = proto.keepDAR = function(keep) {
    if (keep === false) {
      return this;
    }
    return this.videoFilters([
      {
        filter: "scale",
        options: {
          w: "if(gt(sar,1),iw*sar,iw)",
          h: "if(lt(sar,1),ih/sar,ih)"
        }
      },
      {
        filter: "setsar",
        options: "1"
      }
    ]);
  };
  proto.withSize = proto.setSize = proto.size = function(size) {
    const filters = createSizeFilters(this._currentOutput, "size", size);
    this._currentOutput.sizeFilters.clear();
    this._currentOutput.sizeFilters(filters);
    return this;
  };
  proto.withAspect = proto.withAspectRatio = proto.setAspect = proto.setAspectRatio = proto.aspect = proto.aspectRatio = function(aspect) {
    if (aspect === null || aspect === void 0 || aspect === "") {
      throw new Error("Invalid aspect ratio: " + aspect);
    }
    let a = Number(aspect);
    if (isNaN(a)) {
      const match = typeof aspect === "string" && aspect.match(/^\s*(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)\s*$/);
      if (match && Number(match[2]) > 0) {
        a = Number(match[1]) / Number(match[2]);
      } else {
        throw new Error("Invalid aspect ratio: " + aspect);
      }
    }
    if (!isFinite(a) || a <= 0) {
      throw new Error("Invalid aspect ratio: " + aspect);
    }
    const filters = createSizeFilters(this._currentOutput, "aspect", a);
    this._currentOutput.sizeFilters.clear();
    this._currentOutput.sizeFilters(filters);
    return this;
  };
  proto.applyAutopadding = proto.applyAutoPadding = proto.applyAutopad = proto.applyAutoPad = proto.withAutopadding = proto.withAutoPadding = proto.withAutopad = proto.withAutoPad = proto.autoPad = proto.autopad = function(pad, color) {
    if (typeof pad === "string") {
      color = pad;
      pad = true;
    }
    if (typeof pad === "undefined") {
      pad = true;
    }
    const filters = createSizeFilters(this._currentOutput, "pad", pad ? color || "black" : false);
    this._currentOutput.sizeFilters.clear();
    this._currentOutput.sizeFilters(filters);
    return this;
  };
}
var init_videosize = __esm({
  "lib/options/videosize.js"() {
    "use strict";
  }
});

// lib/options/output.js
function output_default(proto) {
  proto.addOutput = proto.output = function(target, pipeopts) {
    let isFile = false;
    if (!target && this._currentOutput) {
      throw new Error("Invalid output");
    }
    if (target && typeof target !== "string") {
      if (typeof target !== "object" || !("writable" in target) || !target.writable) {
        throw new Error("Invalid output");
      }
    } else if (typeof target === "string") {
      const protocol = target.match(/^([a-z]{2,}):/i);
      isFile = !protocol || protocol[1].toLowerCase() === "file";
    }
    if (target && !("target" in this._currentOutput)) {
      this._currentOutput.target = target;
      this._currentOutput.isFile = isFile;
      this._currentOutput.pipeopts = pipeopts || {};
    } else {
      if (target && typeof target !== "string") {
        const hasOutputStream = this._outputs.some((output) => {
          return "target" in output && typeof output.target !== "string";
        });
        if (hasOutputStream) {
          throw new Error("Only one output stream is supported");
        }
      }
      this._outputs.push(this._currentOutput = {
        target,
        isFile,
        flags: {},
        pipeopts: pipeopts || {}
      });
      const self = this;
      ["audio", "audioFilters", "video", "videoFilters", "sizeFilters", "options"].forEach((key) => {
        self._currentOutput[key] = args();
      });
      if (!target) {
        delete this._currentOutput.target;
      }
    }
    return this;
  };
  proto.seekOutput = proto.seek = function(seek) {
    this._currentOutput.options("-ss", seek);
    return this;
  };
  proto.withDuration = proto.setDuration = proto.duration = function(duration) {
    this._currentOutput.options("-t", duration);
    return this;
  };
  proto.endTime = proto.to = function(position) {
    this._currentOutput.options("-to", position);
    return this;
  };
  proto.shortest = function() {
    this._currentOutput.options("-shortest");
    return this;
  };
  proto.toFormat = proto.withOutputFormat = proto.outputFormat = proto.format = function(format) {
    this._currentOutput.options("-f", format);
    return this;
  };
  proto.map = function(spec) {
    this._currentOutput.options("-map", formatMapSpec(spec));
    return this;
  };
  proto.withNoSubtitles = proto.noSubtitles = function() {
    this._currentOutput.options("-sn");
    return this;
  };
  proto.withNoData = proto.noData = function() {
    this._currentOutput.options("-dn");
    return this;
  };
  proto.withSubtitleCodec = proto.subtitleCodec = function(codec) {
    this._currentOutput.options("-c:s", codec);
    return this;
  };
  proto.burnSubtitles = function(filePath, options = {}) {
    const filterName = options.useAssFilter ? "ass" : "subtitles";
    const parts = [`filename='${escapeFilterPath(filePath)}'`];
    if (options.fontsDir) {
      parts.push(`fontsdir='${escapeFilterPath(options.fontsDir)}'`);
    }
    if (options.charenc && !options.useAssFilter) {
      parts.push(`charenc=${options.charenc}`);
    }
    if (options.streamIndex !== void 0 && !options.useAssFilter) {
      parts.push(`si=${options.streamIndex}`);
    }
    if (options.originalSize && !options.useAssFilter) {
      parts.push(`original_size=${options.originalSize}`);
    }
    if (options.forceStyle && !options.useAssFilter) {
      parts.push(`force_style='${String(options.forceStyle).replace(/'/g, "\\\\'")}'`);
    }
    return this.videoFilters(`${filterName}=${parts.join(":")}`);
  };
  proto.metadata = function(keyOrObj, value, streamSpec) {
    if (keyOrObj && typeof keyOrObj === "object") {
      const spec = typeof value === "string" ? value : void 0;
      const flag2 = spec ? `-metadata:${spec}` : "-metadata";
      for (const [k, v] of Object.entries(keyOrObj)) {
        this._currentOutput.options(flag2, `${k}=${v}`);
      }
      return this;
    }
    const flag = streamSpec ? `-metadata:${streamSpec}` : "-metadata";
    this._currentOutput.options(flag, `${keyOrObj}=${value ?? ""}`);
    return this;
  };
  proto.mapMetadata = function(spec) {
    this._currentOutput.options("-map_metadata", String(spec));
    return this;
  };
  proto.mapChapters = function(spec) {
    this._currentOutput.options("-map_chapters", String(spec));
    return this;
  };
  proto.disposition = function(streamSpec, value) {
    this._currentOutput.options(`-disposition:${streamSpec}`, String(value));
    return this;
  };
  proto.bsf = proto.bitstreamFilter = function(filter, streamType) {
    const value = Array.isArray(filter) ? filter.join(",") : String(filter);
    const flag = streamType ? `-bsf:${streamType}` : "-bsf";
    this._currentOutput.options(flag, value);
    return this;
  };
  proto.movflags = function(flags) {
    const value = Array.isArray(flags) ? flags.map((f) => f.startsWith("+") || f.startsWith("-") ? f : `+${f}`).join("") : String(flags);
    this._currentOutput.options("-movflags", value);
    return this;
  };
  proto.faststart = function() {
    return this.movflags("+faststart");
  };
  proto.streamCopy = proto.copyAll = function() {
    this._currentOutput.options("-c", "copy");
    return this;
  };
  proto.maxMuxingQueueSize = function(size) {
    this._currentOutput.options("-max_muxing_queue_size", String(size));
    return this;
  };
  proto.updateFlvMetadata = proto.flvmeta = function() {
    this._currentOutput.flags.flvmeta = true;
    return this;
  };
}
var init_output = __esm({
  "lib/options/output.js"() {
    "use strict";
    init_utils();
  }
});

// lib/options/custom.js
function custom_default(proto) {
  proto.addInputOption = proto.addInputOptions = proto.withInputOption = proto.withInputOptions = proto.inputOption = proto.inputOptions = function(options) {
    if (!this._currentInput) {
      throw new Error("No input specified");
    }
    let doSplit = true;
    if (arguments.length > 1) {
      options = [].slice.call(arguments);
      doSplit = false;
    }
    if (!Array.isArray(options)) {
      options = [options];
    }
    this._currentInput.options(options.reduce((options2, option) => {
      const split = String(option).split(" ");
      if (doSplit && split.length === 2) {
        options2.push(split[0], split[1]);
      } else {
        options2.push(option);
      }
      return options2;
    }, []));
    return this;
  };
  proto.addOutputOption = proto.addOutputOptions = proto.addOption = proto.addOptions = proto.withOutputOption = proto.withOutputOptions = proto.withOption = proto.withOptions = proto.outputOption = proto.outputOptions = function(options) {
    let doSplit = true;
    if (arguments.length > 1) {
      options = [].slice.call(arguments);
      doSplit = false;
    }
    if (!Array.isArray(options)) {
      options = [options];
    }
    this._currentOutput.options(options.reduce((options2, option) => {
      const split = String(option).split(" ");
      if (doSplit && split.length === 2) {
        options2.push(split[0], split[1]);
      } else {
        options2.push(option);
      }
      return options2;
    }, []));
    return this;
  };
  proto.addGlobalOption = proto.addGlobalOptions = proto.withGlobalOption = proto.withGlobalOptions = proto.globalOption = proto.globalOptions = function(options) {
    let doSplit = true;
    if (arguments.length > 1) {
      options = [].slice.call(arguments);
      doSplit = false;
    }
    if (!Array.isArray(options)) {
      options = [options];
    }
    this._global(options.reduce((acc, option) => {
      const split = String(option).split(" ");
      if (doSplit && split.length === 2) {
        acc.push(split[0], split[1]);
      } else {
        acc.push(option);
      }
      return acc;
    }, []));
    return this;
  };
  proto.logLevel = function(level) {
    this._global("-loglevel", String(level));
    return this;
  };
  proto.hideBanner = function() {
    this._global("-hide_banner");
    return this;
  };
  proto.nostdin = proto.noStdin = function() {
    this._global("-nostdin");
    return this;
  };
  proto.overwrite = function(enabled = true) {
    this._global.remove("-y");
    this._global.remove("-n");
    this._global(enabled ? "-y" : "-n");
    return this;
  };
  proto.threads = function(count) {
    this._currentOutput.options("-threads", String(count));
    return this;
  };
  proto.filterGraph = proto.complexFilter = function(spec, map) {
    this._complexFilters.clear();
    if (!Array.isArray(spec)) {
      spec = [spec];
    }
    this._complexFilters("-filter_complex", makeFilterStrings(spec).join(";"));
    if (Array.isArray(map)) {
      const self = this;
      map.forEach((streamSpec) => {
        self._complexFilters("-map", formatMapSpec(streamSpec));
      });
    } else if (typeof map === "string") {
      this._complexFilters("-map", formatMapSpec(map));
    }
    return this;
  };
}
var init_custom = __esm({
  "lib/options/custom.js"() {
    "use strict";
    init_utils();
  }
});

// lib/options/hwaccel.js
function hwaccel_default(proto) {
  proto.withHwaccel = proto.hwaccel = function(method) {
    if (!this._currentInput) {
      throw new Error("No input specified");
    }
    this._currentInput.options("-hwaccel", method);
    return this;
  };
  proto.withHwaccelDevice = proto.hwaccelDevice = function(device) {
    if (!this._currentInput) {
      throw new Error("No input specified");
    }
    this._currentInput.options("-hwaccel_device", String(device));
    return this;
  };
  proto.withHwaccelOutputFormat = proto.hwaccelOutputFormat = function(format) {
    if (!this._currentInput) {
      throw new Error("No input specified");
    }
    this._currentInput.options("-hwaccel_output_format", format);
    return this;
  };
  proto.initHwDevice = function(spec) {
    this._global("-init_hw_device", spec);
    return this;
  };
  proto.filterHwDevice = function(name) {
    this._global("-filter_hw_device", name);
    return this;
  };
  proto.hardwareAcceleration = function(options) {
    if (!options || typeof options !== "object") {
      throw new Error("Hardware acceleration options must be an object");
    }
    if (options.initDevice) {
      this.initHwDevice(options.initDevice);
    }
    if (options.filterDevice) {
      this.filterHwDevice(options.filterDevice);
    }
    if (options.method) {
      this.hwaccel(options.method);
    }
    if (options.device !== void 0 && options.device !== null) {
      this.hwaccelDevice(options.device);
    }
    if (options.outputFormat) {
      this.hwaccelOutputFormat(options.outputFormat);
    }
    return this;
  };
}
var init_hwaccel = __esm({
  "lib/options/hwaccel.js"() {
    "use strict";
  }
});

// lib/options/streaming.js
function streaming_default(proto) {
  proto.hls = function(options = {}) {
    this.format("hls");
    if (options.time !== void 0) {
      this._currentOutput.options("-hls_time", String(options.time));
    }
    if (options.initTime !== void 0) {
      this._currentOutput.options("-hls_init_time", String(options.initTime));
    }
    if (options.listSize !== void 0) {
      this._currentOutput.options("-hls_list_size", String(options.listSize));
    }
    if (options.flags !== void 0) {
      const flags = Array.isArray(options.flags) ? options.flags.join("+") : String(options.flags);
      this._currentOutput.options("-hls_flags", flags);
    }
    if (options.segmentType) {
      this._currentOutput.options("-hls_segment_type", options.segmentType);
    }
    if (options.segmentFilename) {
      this._currentOutput.options("-hls_segment_filename", options.segmentFilename);
    }
    if (options.fmp4InitFilename) {
      this._currentOutput.options("-hls_fmp4_init_filename", options.fmp4InitFilename);
    }
    if (options.playlistType) {
      this._currentOutput.options("-hls_playlist_type", options.playlistType);
    }
    if (options.baseUrl) {
      this._currentOutput.options("-hls_base_url", options.baseUrl);
    }
    if (options.keyInfoFile) {
      this._currentOutput.options("-hls_key_info_file", options.keyInfoFile);
    }
    if (options.masterPlName) {
      this._currentOutput.options("-master_pl_name", options.masterPlName);
    }
    if (options.varStreamMap) {
      this._currentOutput.options("-var_stream_map", options.varStreamMap);
    }
    if (options.startNumber !== void 0) {
      this._currentOutput.options("-start_number", String(options.startNumber));
    }
    if (options.deleteThreshold !== void 0) {
      this._currentOutput.options("-hls_delete_threshold", String(options.deleteThreshold));
    }
    if (options.allowCache !== void 0) {
      this._currentOutput.options("-hls_allow_cache", options.allowCache ? "1" : "0");
    }
    return this;
  };
  proto.dash = function(options = {}) {
    this.format("dash");
    if (options.segDuration !== void 0) {
      this._currentOutput.options("-seg_duration", String(options.segDuration));
    }
    if (options.windowSize !== void 0) {
      this._currentOutput.options("-window_size", String(options.windowSize));
    }
    if (options.extraWindowSize !== void 0) {
      this._currentOutput.options("-extra_window_size", String(options.extraWindowSize));
    }
    if (options.initSegName) {
      this._currentOutput.options("-init_seg_name", options.initSegName);
    }
    if (options.mediaSegName) {
      this._currentOutput.options("-media_seg_name", options.mediaSegName);
    }
    if (options.useTemplate !== void 0) {
      this._currentOutput.options("-use_template", options.useTemplate ? "1" : "0");
    }
    if (options.useTimeline !== void 0) {
      this._currentOutput.options("-use_timeline", options.useTimeline ? "1" : "0");
    }
    if (options.adaptationSets) {
      this._currentOutput.options("-adaptation_sets", options.adaptationSets);
    }
    if (options.singleFile !== void 0) {
      this._currentOutput.options("-single_file", options.singleFile ? "1" : "0");
    }
    if (options.streaming !== void 0) {
      this._currentOutput.options("-streaming", options.streaming ? "1" : "0");
    }
    if (options.ldash !== void 0) {
      this._currentOutput.options("-ldash", options.ldash ? "1" : "0");
    }
    if (options.hlsPlaylist !== void 0) {
      this._currentOutput.options("-hls_playlist", options.hlsPlaylist ? "1" : "0");
    }
    if (options.hlsMasterName) {
      this._currentOutput.options("-hls_master_name", options.hlsMasterName);
    }
    if (options.removeAtExit !== void 0) {
      this._currentOutput.options("-remove_at_exit", options.removeAtExit ? "1" : "0");
    }
    return this;
  };
}
var init_streaming = __esm({
  "lib/options/streaming.js"() {
    "use strict";
  }
});

// lib/presets/divx.js
var divx_exports = {};
__export(divx_exports, {
  load: () => load
});
function load(ffmpeg3) {
  ffmpeg3.format("avi").videoBitrate("1024k").videoCodec("mpeg4").size("720x?").audioBitrate("128k").audioChannels(2).audioCodec("libmp3lame").outputOptions(["-vtag DIVX"]);
}
var init_divx = __esm({
  "lib/presets/divx.js"() {
    "use strict";
  }
});

// lib/presets/flashvideo.js
var flashvideo_exports = {};
__export(flashvideo_exports, {
  load: () => load2
});
function load2(ffmpeg3) {
  ffmpeg3.format("flv").flvmeta().size("320x?").videoBitrate("512k").videoCodec("libx264").fps(24).audioBitrate("96k").audioCodec("aac").audioFrequency(22050).audioChannels(2);
}
var init_flashvideo = __esm({
  "lib/presets/flashvideo.js"() {
    "use strict";
  }
});

// lib/presets/podcast.js
var podcast_exports = {};
__export(podcast_exports, {
  load: () => load3
});
function load3(ffmpeg3) {
  ffmpeg3.format("m4v").videoBitrate("512k").videoCodec("libx264").size("320x176").audioBitrate("128k").audioCodec("aac").audioChannels(1).outputOptions([
    "-flags",
    "+loop",
    "-cmp",
    "+chroma",
    "-partitions",
    "+parti4x4+partp8x8+partb8x8",
    "-flags2",
    "+mixed_refs",
    "-me_method umh",
    "-subq 5",
    "-bufsize 2M",
    "-rc_eq 'blurCplx^(1-qComp)'",
    "-qcomp 0.6",
    "-qmin 10",
    "-qmax 51",
    "-qdiff 4",
    "-level 13"
  ]);
}
var init_podcast = __esm({
  "lib/presets/podcast.js"() {
    "use strict";
  }
});

// lib/options/misc.js
function misc_default(proto) {
  proto.usingPreset = proto.preset = function(preset) {
    if (typeof preset === "function") {
      preset(this);
      return this;
    }
    let modulePath;
    try {
      modulePath = (0, import_path2.join)(this.options.presets, preset);
      const mod2 = (0, import_path2.resolve)(this.options.presets) === builtinPresetsDir && Object.hasOwn(builtinPresets, preset) ? builtinPresets[preset] : localRequire(modulePath);
      const load4 = typeof mod2.load === "function" ? mod2.load : mod2.default?.load;
      if (typeof load4 !== "function") {
        throw new Error(`preset ${modulePath} has no load() function`);
      }
      load4(this);
    } catch (err) {
      throw new Error(`preset ${modulePath} could not be loaded: ${err.message}`);
    }
    return this;
  };
}
var import_path2, builtinPresets, builtinPresetsDir, localRequire;
var init_misc = __esm({
  "lib/options/misc.js"() {
    "use strict";
    import_path2 = require("path");
    init_utils();
    init_divx();
    init_flashvideo();
    init_podcast();
    builtinPresets = { divx: divx_exports, flashvideo: flashvideo_exports, podcast: podcast_exports };
    builtinPresetsDir = getBuiltinPresetsDir();
    localRequire = getLocalRequire(__importMetaUrl);
  }
});

// lib/processor.js
function runFfprobe(command) {
  const inputProbeIndex = 0;
  if (!command._inputs[inputProbeIndex] || command._inputs[inputProbeIndex].isStream) {
    return;
  }
  command.ffprobe(inputProbeIndex, (err, data) => {
    if (!err && data) {
      command._ffprobeData = data;
    }
  });
}
function processor_default(proto) {
  proto._spawnFfmpeg = function(args2, options, processCB, endCB) {
    if (typeof options === "function") {
      endCB = processCB;
      processCB = options;
      options = {};
    }
    if (typeof endCB === "undefined") {
      endCB = processCB;
      processCB = function() {
      };
    }
    const maxLines = "stdoutLines" in options ? options.stdoutLines : this.options.stdoutLines;
    let finished = false;
    function finish(err, stdoutRing, stderrRing) {
      if (!finished) {
        finished = true;
        endCB(err, stdoutRing, stderrRing);
      }
    }
    this._getFfmpegPath((err, command) => {
      if (err) {
        return finish(err);
      } else if (!command || command.length === 0) {
        return finish(new Error("Cannot find ffmpeg"));
      }
      let spawnArgs = args2;
      if (options.niceness && options.niceness !== 0 && !isWindows) {
        spawnArgs = ["-n", String(options.niceness), command, ...args2];
        command = "nice";
      }
      const stdoutRing = linesRing(maxLines);
      let stdoutClosed = false;
      const stderrRing = linesRing(maxLines);
      let stderrClosed = false;
      const ffmpegProc = (0, import_child_process.spawn)(command, spawnArgs, options);
      if (options.captureStdout && ffmpegProc.stdout) {
        ffmpegProc.stdout.setEncoding("utf8");
      }
      if (ffmpegProc.stderr) {
        ffmpegProc.stderr.setEncoding("utf8");
      }
      ffmpegProc.on("error", (err2) => {
        finish(err2, stdoutRing, stderrRing);
      });
      let exitError = null;
      function handleExit(err2) {
        if (err2) {
          exitError = err2;
        }
        if (processExited && (stdoutClosed || !options.captureStdout) && stderrClosed) {
          finish(exitError, stdoutRing, stderrRing);
        }
      }
      let processExited = false;
      ffmpegProc.on("exit", (code, signal) => {
        processExited = true;
        if (signal) {
          handleExit(new Error("ffmpeg was killed with signal " + signal));
        } else if (code) {
          handleExit(new Error("ffmpeg exited with code " + code));
        } else {
          handleExit();
        }
      });
      if (options.captureStdout) {
        ffmpegProc.stdout.on("data", (data) => {
          stdoutRing.append(data);
        });
        ffmpegProc.stdout.on("close", () => {
          stdoutRing.close();
          stdoutClosed = true;
          handleExit();
        });
      }
      ffmpegProc.stderr.on("data", (data) => {
        stderrRing.append(data);
      });
      ffmpegProc.stderr.on("close", () => {
        stderrRing.close();
        stderrClosed = true;
        handleExit();
      });
      processCB(ffmpegProc, stdoutRing, stderrRing);
    });
  };
  proto._getArguments = function() {
    const complexFilters = this._complexFilters.get();
    const fileOutput = this._outputs.some((output) => {
      return output.isFile;
    });
    const globalArgs = this._global.get();
    const hasExplicitOverwriteFlag = Boolean(this._global.find("-y") || this._global.find("-n"));
    return [].concat(
      // Inputs and input options
      this._inputs.reduce((args2, input) => {
        const source = typeof input.source === "string" ? input.source : "pipe:0";
        return args2.concat(
          input.options.get(),
          ["-i", source]
        );
      }, []),
      // Global options
      globalArgs,
      // Overwrite if we have file outputs and user did not explicitly pass -y / -n
      fileOutput && !hasExplicitOverwriteFlag ? ["-y"] : [],
      // Complex filters
      complexFilters,
      // Outputs, filters and output options
      this._outputs.reduce((args2, output) => {
        const sizeFilters = makeFilterStrings(output.sizeFilters.get());
        const audioFilters = output.audioFilters.get();
        const videoFilters = output.videoFilters.get().concat(sizeFilters);
        let outputArg;
        if (!output.target) {
          outputArg = [];
        } else if (typeof output.target === "string") {
          outputArg = [output.target];
        } else {
          outputArg = ["pipe:1"];
        }
        return args2.concat(
          output.audio.get(),
          audioFilters.length ? ["-filter:a", audioFilters.join(",")] : [],
          output.video.get(),
          videoFilters.length ? ["-filter:v", videoFilters.join(",")] : [],
          output.options.get(),
          outputArg
        );
      }, [])
    );
  };
  proto.getArguments = function() {
    return this._getArguments().slice();
  };
  proto._prepare = function(callback, readMetadata) {
    const self = this;
    import_async.default.waterfall([
      // Check codecs and formats
      function(cb) {
        self._checkCapabilities(cb);
      },
      // Read metadata if required
      function(cb) {
        if (!readMetadata) {
          return cb();
        }
        self.ffprobe(0, (err, data) => {
          if (!err) {
            self._ffprobeData = data;
          }
          cb();
        });
      },
      // Check for flvtool2/flvmeta if necessary
      function(cb) {
        const flvmeta = self._outputs.some((output) => {
          if (output.flags.flvmeta && !output.isFile) {
            self.logger.warn("Updating flv metadata is only supported for files");
            output.flags.flvmeta = false;
          }
          return output.flags.flvmeta;
        });
        if (flvmeta) {
          self._getFlvtoolPath((err, flvtool) => {
            if (err) {
              return cb(err);
            }
            if (!flvtool) {
              return cb(new Error("Cannot find flvtool2 or flvmeta"));
            }
            cb();
          });
        } else {
          cb();
        }
      },
      // Build argument list
      function(cb) {
        let args2;
        try {
          args2 = self._getArguments();
        } catch (e) {
          return cb(e);
        }
        cb(null, args2);
      },
      // Add "-strict experimental" option where needed
      function(args2, cb) {
        self.availableEncoders((err, encoders) => {
          if (err) {
            return cb(err);
          }
          const hasStrict = args2.indexOf("-strict") !== -1;
          for (let i = 0; i < args2.length; i++) {
            if (codecArgFlags.has(args2[i])) {
              i++;
              if (i < args2.length && !hasStrict && args2[i] in encoders && encoders[args2[i]].experimental) {
                args2.splice(i + 1, 0, "-strict", "experimental");
                i += 2;
              }
            }
          }
          cb(null, args2);
        });
      }
    ], callback);
    if (!readMetadata) {
      if (this.listeners("progress").length > 0) {
        runFfprobe(this);
      } else {
        const onNewListener = (event) => {
          if (event === "progress") {
            this.removeListener("newListener", onNewListener);
            runFfprobe(this);
          }
        };
        const cleanupListener = () => {
          this.removeListener("newListener", onNewListener);
        };
        this.on("newListener", onNewListener);
        this.once("end", cleanupListener);
        this.once("error", cleanupListener);
      }
    }
  };
  proto.exec = proto.execute = proto.run = function() {
    const self = this;
    const outputPresent = this._outputs.some((output) => {
      return "target" in output;
    });
    if (!outputPresent) {
      throw new Error("No output specified");
    }
    const outputStream = this._outputs.filter((output) => {
      return "target" in output && typeof output.target !== "string";
    })[0];
    const inputStream = this._inputs.filter((input) => {
      return typeof input.source !== "string";
    })[0];
    const abortSignal = this.options.signal;
    let outputCloseTimer = null;
    let onAbort = null;
    let ended = false;
    function emitEnd(err, stdout, stderr) {
      if (!ended) {
        ended = true;
        if (outputCloseTimer) {
          clearTimeout(outputCloseTimer);
          outputCloseTimer = null;
        }
        if (abortSignal && onAbort) {
          abortSignal.removeEventListener("abort", onAbort);
          onAbort = null;
        }
        if (err) {
          self.emit("error", err, stdout, stderr);
        } else {
          self.emit("end", stdout, stderr);
        }
      }
    }
    if (abortSignal && abortSignal.aborted) {
      const abortErr = abortSignal.reason instanceof Error ? abortSignal.reason : new Error("ffmpeg process was aborted");
      abortErr.name = abortErr.name || "AbortError";
      process.nextTick(() => emitEnd(abortErr));
      return this;
    }
    self._prepare((err, args2) => {
      if (err) {
        return emitEnd(err);
      }
      if (abortSignal && abortSignal.aborted) {
        const abortErr = abortSignal.reason instanceof Error ? abortSignal.reason : new Error("ffmpeg process was aborted");
        return emitEnd(abortErr);
      }
      self._spawnFfmpeg(
        args2,
        {
          captureStdout: !outputStream,
          niceness: self.options.niceness,
          cwd: self.options.cwd,
          windowsHide: true
        },
        function processCB(ffmpegProc, stdoutRing, stderrRing) {
          self.ffmpegProc = ffmpegProc;
          self.emit("start", "ffmpeg " + args2.join(" "));
          if (abortSignal) {
            onAbort = () => {
              const abortErr = abortSignal.reason instanceof Error ? abortSignal.reason : new Error("ffmpeg process was aborted");
              emitEnd(abortErr, stdoutRing ? stdoutRing.get() : null, stderrRing ? stderrRing.get() : null);
              ffmpegProc.kill();
            };
            if (abortSignal.aborted) {
              onAbort();
              return;
            }
            abortSignal.addEventListener("abort", onAbort, { once: true });
          }
          if (inputStream) {
            inputStream.source.on("error", (err2) => {
              const reportingErr = new Error("Input stream error: " + err2.message);
              reportingErr.inputStreamError = err2;
              emitEnd(reportingErr);
              ffmpegProc.kill();
            });
            inputStream.source.resume();
            inputStream.source.pipe(ffmpegProc.stdin);
            ffmpegProc.stdin.on("error", () => {
            });
          }
          if (self.options.timeout) {
            self.processTimer = setTimeout(() => {
              const msg = "process ran into a timeout (" + self.options.timeout + "s)";
              emitEnd(new Error(msg), stdoutRing ? stdoutRing.get() : null, stderrRing ? stderrRing.get() : null);
              ffmpegProc.kill();
            }, self.options.timeout * 1e3);
          }
          if (outputStream) {
            ffmpegProc.stdout.on("error", () => {
            });
            ffmpegProc.stdout.pipe(outputStream.target, outputStream.pipeopts);
            outputStream.target.on("close", () => {
              if (ended) {
                return;
              }
              self.logger.debug("Output stream closed, scheduling kill for ffmpeg process");
              outputCloseTimer = setTimeout(() => {
                outputCloseTimer = null;
                if (!ended) {
                  emitEnd(new Error("Output stream closed"));
                  ffmpegProc.kill();
                }
              }, 20);
            });
            outputStream.target.on("error", (err2) => {
              self.logger.debug("Output stream error, killing ffmpeg process");
              const reportingErr = new Error("Output stream error: " + err2.message);
              reportingErr.outputStreamError = err2;
              emitEnd(reportingErr, stdoutRing ? stdoutRing.get() : null, stderrRing ? stderrRing.get() : null);
              ffmpegProc.kill("SIGKILL");
            });
          }
          if (stderrRing) {
            if (self.listeners("stderr").length) {
              stderrRing.callback((line) => {
                self.emit("stderr", line);
              });
            }
            if (self.listeners("codecData").length) {
              let codecDataSent = false;
              const codecObject = {};
              stderrRing.callback((line) => {
                if (!codecDataSent)
                  codecDataSent = extractCodecData(self, line, codecObject);
              });
            }
            if (self.listeners("progress").length) {
              stderrRing.callback((line) => {
                extractProgress(self, line);
              });
            }
          }
        },
        function endCB(err2, stdoutRing, stderrRing) {
          clearTimeout(self.processTimer);
          delete self.ffmpegProc;
          const stdoutStr = stdoutRing ? stdoutRing.get() : null;
          const stderrStr = stderrRing ? stderrRing.get() : null;
          if (err2) {
            if (err2.message.match(/ffmpeg exited with code/) && stderrStr) {
              err2.message += ": " + extractError(stderrStr);
            }
            emitEnd(err2, stdoutStr, stderrStr);
          } else {
            const flvmeta = self._outputs.filter((output) => {
              return output.flags.flvmeta;
            });
            if (flvmeta.length) {
              self._getFlvtoolPath((err3, flvtool) => {
                if (err3) {
                  return emitEnd(err3);
                }
                if (!flvtool) {
                  return emitEnd(new Error("Cannot find flvtool2 or flvmeta"));
                }
                import_async.default.each(
                  flvmeta,
                  (output, cb) => {
                    (0, import_child_process.spawn)(flvtool, ["-U", output.target], { windowsHide: true }).on("error", (err4) => {
                      cb(new Error("Error running " + flvtool + " on " + output.target + ": " + err4.message));
                    }).on("exit", (code, signal) => {
                      if (code !== 0 || signal) {
                        cb(
                          new Error(flvtool + " " + (signal ? "received signal " + signal : "exited with code " + code)) + " when running on " + output.target
                        );
                      } else {
                        cb();
                      }
                    });
                  },
                  (err4) => {
                    if (err4) {
                      emitEnd(err4);
                    } else {
                      emitEnd(null, stdoutStr, stderrStr);
                    }
                  }
                );
              });
            } else {
              emitEnd(null, stdoutStr, stderrStr);
            }
          }
        }
      );
    });
    return this;
  };
  proto.execAsync = proto.runAsync = function() {
    return new Promise((resolve3, reject) => {
      this.once("end", (stdout, stderr) => {
        resolve3({ stdout: stdout ?? null, stderr: stderr ?? null });
      }).once("error", (err) => {
        reject(err);
      });
      try {
        this.run();
      } catch (err) {
        reject(err);
      }
    });
  };
  proto.renice = function(niceness) {
    if (!isWindows) {
      niceness = niceness || 0;
      if (niceness < -20 || niceness > 20) {
        this.logger.warn("Invalid niceness value: " + niceness + ", must be between -20 and 20");
      }
      niceness = Math.min(20, Math.max(-20, niceness));
      this.options.niceness = niceness;
      if (this.ffmpegProc) {
        const logger = this.logger;
        const pid = this.ffmpegProc.pid;
        const renice = (0, import_child_process.spawn)("renice", [String(niceness), "-p", String(pid)], { windowsHide: true });
        renice.on("error", (err) => {
          logger.warn("could not renice process " + pid + ": " + err.message);
        });
        renice.on("exit", (code, signal) => {
          if (signal) {
            logger.warn("could not renice process " + pid + ": renice was killed by signal " + signal);
          } else if (code) {
            logger.warn("could not renice process " + pid + ": renice exited with " + code);
          } else {
            logger.info("successfully reniced process " + pid + " to " + niceness + " niceness");
          }
        });
      }
    }
    return this;
  };
  proto.kill = function(signal) {
    if (!this.ffmpegProc) {
      this.logger.warn("No running ffmpeg process, cannot send signal");
    } else {
      this.ffmpegProc.kill(signal || "SIGKILL");
    }
    return this;
  };
}
var import_child_process, import_async, codecArgFlags;
var init_processor = __esm({
  "lib/processor.js"() {
    "use strict";
    import_child_process = require("child_process");
    import_async = __toESM(require("async"), 1);
    init_utils();
    codecArgFlags = /* @__PURE__ */ new Set(["-acodec", "-vcodec", "-c:a", "-c:v", "-codec:a", "-codec:v"]);
  }
});

// lib/capabilities.js
function clearCapabilityCache() {
  delete cache.filters;
  delete cache.codecs;
  delete cache.encoders;
  delete cache.decoders;
  delete cache.formats;
  delete cache.hwaccels;
  delete cache.pixFmts;
  delete cache.bsfs;
  delete cache.protocols;
  delete cache.version;
}
function parseFilterIoType(spec) {
  if (spec === "|") {
    return "none";
  }
  if (spec.includes("N") || spec.includes("A") && spec.includes("V")) {
    return "dynamic";
  }
  return spec.charAt(0) === "A" ? "audio" : "video";
}
function withOptionalCallback(callback, executor) {
  if (typeof callback === "function") {
    executor(callback);
    return;
  }
  return new Promise((resolve3, reject) => {
    executor((err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve3(result);
      }
    });
  });
}
function capabilities_default(proto) {
  proto.setFfmpegPath = function(ffmpegPath) {
    if ("ffmpegPath" in cache && cache.ffmpegPath !== ffmpegPath) {
      clearCapabilityCache();
    }
    cache.ffmpegPath = ffmpegPath;
    return this;
  };
  proto.setFfprobePath = function(ffprobePath) {
    cache.ffprobePath = ffprobePath;
    return this;
  };
  proto.setFlvtoolPath = function(flvtool) {
    cache.flvtoolPath = flvtool;
    return this;
  };
  proto._forgetPaths = function() {
    delete cache.ffmpegPath;
    delete cache.ffprobePath;
    delete cache.flvtoolPath;
  };
  proto._getFfmpegPath = function(callback) {
    if ("ffmpegPath" in cache) {
      return callback(null, cache.ffmpegPath);
    }
    import_async2.default.waterfall([
      // Try FFMPEG_PATH
      function(cb) {
        if (process.env.FFMPEG_PATH) {
          import_fs.default.access(process.env.FFMPEG_PATH, (accessErr) => {
            const exists = !accessErr;
            if (exists) {
              cb(null, process.env.FFMPEG_PATH);
            } else {
              cb(null, "");
            }
          });
        } else {
          cb(null, "");
        }
      },
      // Search in the PATH
      function(ffmpeg3, cb) {
        if (ffmpeg3.length) {
          return cb(null, ffmpeg3);
        }
        which("ffmpeg", (err, ffmpeg4) => {
          cb(err, ffmpeg4);
        });
      }
    ], (err, ffmpeg3) => {
      if (err) {
        callback(err);
      } else {
        callback(null, cache.ffmpegPath = ffmpeg3 || "");
      }
    });
  };
  proto._getFfprobePath = function(callback) {
    const self = this;
    if ("ffprobePath" in cache) {
      return callback(null, cache.ffprobePath);
    }
    import_async2.default.waterfall([
      // Try FFPROBE_PATH
      function(cb) {
        if (process.env.FFPROBE_PATH) {
          import_fs.default.access(process.env.FFPROBE_PATH, (accessErr) => {
            const exists = !accessErr;
            cb(null, exists ? process.env.FFPROBE_PATH : "");
          });
        } else {
          cb(null, "");
        }
      },
      // Search in the PATH
      function(ffprobe, cb) {
        if (ffprobe.length) {
          return cb(null, ffprobe);
        }
        which("ffprobe", (err, ffprobe2) => {
          cb(err, ffprobe2);
        });
      },
      // Search in the same directory as ffmpeg
      function(ffprobe, cb) {
        if (ffprobe.length) {
          return cb(null, ffprobe);
        }
        self._getFfmpegPath((err, ffmpeg3) => {
          if (err) {
            cb(err);
          } else if (ffmpeg3.length) {
            const name = isWindows ? "ffprobe.exe" : "ffprobe";
            const ffprobe2 = (0, import_path3.join)((0, import_path3.dirname)(ffmpeg3), name);
            import_fs.default.access(ffprobe2, (accessErr) => {
              const exists = !accessErr;
              cb(null, exists ? ffprobe2 : "");
            });
          } else {
            cb(null, "");
          }
        });
      }
    ], (err, ffprobe) => {
      if (err) {
        callback(err);
      } else {
        callback(null, cache.ffprobePath = ffprobe || "");
      }
    });
  };
  proto._getFlvtoolPath = function(callback) {
    if ("flvtoolPath" in cache) {
      return callback(null, cache.flvtoolPath);
    }
    import_async2.default.waterfall([
      // Try FLVMETA_PATH
      function(cb) {
        if (process.env.FLVMETA_PATH) {
          import_fs.default.access(process.env.FLVMETA_PATH, (accessErr) => {
            const exists = !accessErr;
            cb(null, exists ? process.env.FLVMETA_PATH : "");
          });
        } else {
          cb(null, "");
        }
      },
      // Try FLVTOOL2_PATH
      function(flvtool, cb) {
        if (flvtool.length) {
          return cb(null, flvtool);
        }
        if (process.env.FLVTOOL2_PATH) {
          import_fs.default.access(process.env.FLVTOOL2_PATH, (accessErr) => {
            const exists = !accessErr;
            cb(null, exists ? process.env.FLVTOOL2_PATH : "");
          });
        } else {
          cb(null, "");
        }
      },
      // Search for flvmeta in the PATH
      function(flvtool, cb) {
        if (flvtool.length) {
          return cb(null, flvtool);
        }
        which("flvmeta", (err, flvmeta) => {
          cb(err, flvmeta);
        });
      },
      // Search for flvtool2 in the PATH
      function(flvtool, cb) {
        if (flvtool.length) {
          return cb(null, flvtool);
        }
        which("flvtool2", (err, flvtool2) => {
          cb(err, flvtool2);
        });
      }
    ], (err, flvtool) => {
      if (err) {
        callback(err);
      } else {
        callback(null, cache.flvtoolPath = flvtool || "");
      }
    });
  };
  proto.availableFilters = proto.getAvailableFilters = function(callback) {
    return withOptionalCallback(callback, (cb) => {
      if ("filters" in cache) {
        return cb(null, cache.filters);
      }
      this._spawnFfmpeg(["-filters"], { captureStdout: true, stdoutLines: 0 }, (err, stdoutRing) => {
        if (err) {
          return cb(err);
        }
        const stdout = stdoutRing.get();
        const lines = stdout.split(lineBreakRegexp);
        const data = {};
        lines.forEach((line) => {
          const match = line.match(filterRegexp);
          if (match) {
            data[match[1]] = {
              description: match[4],
              input: parseFilterIoType(match[2]),
              multipleInputs: match[2].length > 1 || match[2] === "N",
              output: parseFilterIoType(match[3]),
              multipleOutputs: match[3].length > 1 || match[3] === "N"
            };
          }
        });
        cb(null, cache.filters = data);
      });
    });
  };
  proto.availableCodecs = proto.getAvailableCodecs = function(callback) {
    return withOptionalCallback(callback, (cb) => {
      if ("codecs" in cache) {
        return cb(null, cache.codecs);
      }
      this._spawnFfmpeg(["-codecs"], { captureStdout: true, stdoutLines: 0 }, (err, stdoutRing) => {
        if (err) {
          return cb(err);
        }
        const stdout = stdoutRing.get();
        const lines = stdout.split(lineBreakRegexp);
        const data = {};
        lines.forEach((line) => {
          let match = line.match(avCodecRegexp);
          if (match && match[7] !== "=") {
            data[match[7]] = {
              type: codecTypeMap[match[3]],
              description: match[8],
              canDecode: match[1] === "D",
              canEncode: match[2] === "E",
              drawHorizBand: match[4] === "S",
              directRendering: match[5] === "D",
              weirdFrameTruncation: match[6] === "T"
            };
          }
          match = line.match(ffCodecRegexp);
          if (match && match[7] !== "=") {
            const codecData = data[match[7]] = {
              type: codecTypeMap[match[3]],
              description: match[8],
              canDecode: match[1] === "D",
              canEncode: match[2] === "E",
              intraFrameOnly: match[4] === "I",
              isLossy: match[5] === "L",
              isLossless: match[6] === "S"
            };
            let encoders = codecData.description.match(ffEncodersRegexp);
            encoders = encoders ? encoders[1].trim().split(/\s+/).filter(Boolean) : [];
            let decoders = codecData.description.match(ffDecodersRegexp);
            decoders = decoders ? decoders[1].trim().split(/\s+/).filter(Boolean) : [];
            if (encoders.length || decoders.length) {
              const coderData = {};
              copy(codecData, coderData);
              coderData.canEncode = false;
              coderData.canDecode = false;
              encoders.forEach((name) => {
                if (name in data) {
                  data[name].canEncode = true;
                } else {
                  data[name] = {};
                  copy(coderData, data[name]);
                  data[name].canEncode = true;
                }
              });
              decoders.forEach((name) => {
                if (name in data) {
                  data[name].canDecode = true;
                } else {
                  data[name] = {};
                  copy(coderData, data[name]);
                  data[name].canDecode = true;
                }
              });
            }
          }
        });
        cb(null, cache.codecs = data);
      });
    });
  };
  proto.availableEncoders = proto.getAvailableEncoders = function(callback) {
    return withOptionalCallback(callback, (cb) => {
      if ("encoders" in cache) {
        return cb(null, cache.encoders);
      }
      this._spawnFfmpeg(["-encoders"], { captureStdout: true, stdoutLines: 0 }, (err, stdoutRing) => {
        if (err) {
          return cb(err);
        }
        const stdout = stdoutRing.get();
        const lines = stdout.split(lineBreakRegexp);
        const data = {};
        lines.forEach((line) => {
          const match = line.match(encodersRegexp);
          if (match && match[7] !== "=") {
            data[match[7]] = {
              type: codecTypeMap[match[1]],
              description: match[8],
              frameMT: match[2] === "F",
              sliceMT: match[3] === "S",
              experimental: match[4] === "X",
              drawHorizBand: match[5] === "B",
              directRendering: match[6] === "D"
            };
          }
        });
        cb(null, cache.encoders = data);
      });
    });
  };
  proto.availableDecoders = proto.getAvailableDecoders = function(callback) {
    return withOptionalCallback(callback, (cb) => {
      if ("decoders" in cache) {
        return cb(null, cache.decoders);
      }
      this._spawnFfmpeg(["-decoders"], { captureStdout: true, stdoutLines: 0 }, (err, stdoutRing) => {
        if (err) {
          return cb(err);
        }
        const stdout = stdoutRing.get();
        const lines = stdout.split(lineBreakRegexp);
        const data = {};
        lines.forEach((line) => {
          const match = line.match(encodersRegexp);
          if (match && match[7] !== "=") {
            data[match[7]] = {
              type: codecTypeMap[match[1]],
              description: match[8],
              frameMT: match[2] === "F",
              sliceMT: match[3] === "S",
              experimental: match[4] === "X",
              drawHorizBand: match[5] === "B",
              directRendering: match[6] === "D"
            };
          }
        });
        cb(null, cache.decoders = data);
      });
    });
  };
  proto.availableFormats = proto.getAvailableFormats = function(callback) {
    return withOptionalCallback(callback, (cb) => {
      if ("formats" in cache) {
        return cb(null, cache.formats);
      }
      this._spawnFfmpeg(["-formats"], { captureStdout: true, stdoutLines: 0 }, (err, stdoutRing) => {
        if (err) {
          return cb(err);
        }
        const stdout = stdoutRing.get();
        const lines = stdout.split(lineBreakRegexp);
        const data = {};
        lines.forEach((line) => {
          const match = line.match(formatRegexp);
          if (match && (match[1] === "D" || match[2] === "E")) {
            match[4].split(",").forEach((format) => {
              if (!(format in data)) {
                data[format] = {
                  description: (match[5] || "").trim(),
                  canDemux: false,
                  canMux: false,
                  isDevice: match[3] === "d"
                };
              }
              if (match[1] === "D") {
                data[format].canDemux = true;
              }
              if (match[2] === "E") {
                data[format].canMux = true;
              }
              if (match[3] === "d") {
                data[format].isDevice = true;
              }
            });
          }
        });
        cb(null, cache.formats = data);
      });
    });
  };
  proto.availableHwaccels = proto.getAvailableHwaccels = function(callback) {
    return withOptionalCallback(callback, (cb) => {
      if ("hwaccels" in cache) {
        return cb(null, cache.hwaccels);
      }
      this._spawnFfmpeg(["-hwaccels"], { captureStdout: true, stdoutLines: 0 }, (err, stdoutRing) => {
        if (err) {
          return cb(err);
        }
        const lines = stdoutRing.get().split(lineBreakRegexp);
        const methods = [];
        let started = false;
        lines.forEach((line) => {
          const trimmed = line.trim();
          if (!started) {
            if (/^Hardware acceleration methods:/i.test(trimmed)) {
              started = true;
            }
          } else if (trimmed) {
            methods.push(trimmed);
          }
        });
        cb(null, cache.hwaccels = methods);
      });
    });
  };
  proto.availablePixelFormats = proto.getAvailablePixelFormats = function(callback) {
    return withOptionalCallback(callback, (cb) => {
      if ("pixFmts" in cache) {
        return cb(null, cache.pixFmts);
      }
      this._spawnFfmpeg(["-pix_fmts"], { captureStdout: true, stdoutLines: 0 }, (err, stdoutRing) => {
        if (err) {
          return cb(err);
        }
        const lines = stdoutRing.get().split(lineBreakRegexp);
        const data = {};
        lines.forEach((line) => {
          const match = line.match(pixFmtRegexp);
          if (match) {
            data[match[6]] = {
              canInput: match[1] === "I",
              canOutput: match[2] === "O",
              hardwareAccelerated: match[3] === "H",
              paletted: match[4] === "P",
              bitstream: match[5] === "B",
              nbComponents: parseInt(match[7], 10),
              bitsPerPixel: parseInt(match[8], 10),
              bitDepths: match[9] ? match[9].trim() : void 0
            };
          }
        });
        cb(null, cache.pixFmts = data);
      });
    });
  };
  proto.availableBitstreamFilters = proto.getAvailableBitstreamFilters = function(callback) {
    return withOptionalCallback(callback, (cb) => {
      if ("bsfs" in cache) {
        return cb(null, cache.bsfs);
      }
      this._spawnFfmpeg(["-bsfs"], { captureStdout: true, stdoutLines: 0 }, (err, stdoutRing) => {
        if (err) {
          return cb(err);
        }
        const lines = stdoutRing.get().split(lineBreakRegexp);
        const bsfs = [];
        let started = false;
        lines.forEach((line) => {
          const trimmed = line.trim();
          if (!started) {
            if (/^Bitstream filters:/i.test(trimmed)) {
              started = true;
            }
          } else if (trimmed) {
            bsfs.push(trimmed);
          }
        });
        cb(null, cache.bsfs = bsfs);
      });
    });
  };
  proto.availableProtocols = proto.getAvailableProtocols = function(callback) {
    return withOptionalCallback(callback, (cb) => {
      if ("protocols" in cache) {
        return cb(null, cache.protocols);
      }
      this._spawnFfmpeg(["-protocols"], { captureStdout: true, stdoutLines: 0 }, (err, stdoutRing) => {
        if (err) {
          return cb(err);
        }
        const lines = stdoutRing.get().split(lineBreakRegexp);
        const data = { input: [], output: [] };
        let section = null;
        lines.forEach((line) => {
          const trimmed = line.trim();
          if (/^Input:/i.test(trimmed)) {
            section = "input";
          } else if (/^Output:/i.test(trimmed)) {
            section = "output";
          } else if (section && trimmed) {
            data[section].push(trimmed);
          }
        });
        cb(null, cache.protocols = data);
      });
    });
  };
  proto.ffmpegVersion = proto.getFfmpegVersion = function(callback) {
    return withOptionalCallback(callback, (cb) => {
      if ("version" in cache) {
        return cb(null, cache.version);
      }
      this._spawnFfmpeg(["-version"], { captureStdout: true, stdoutLines: 0 }, (err, stdoutRing) => {
        if (err) {
          return cb(err);
        }
        const lines = stdoutRing.get().split(lineBreakRegexp);
        const info = {
          version: "",
          configuration: [],
          libraries: {}
        };
        lines.forEach((line) => {
          const verMatch = line.match(/^ffmpeg version ([^ ]+)/i);
          if (verMatch) {
            info.version = verMatch[1];
            return;
          }
          const cfgMatch = line.match(/^\s*configuration:\s*(.+)$/);
          if (cfgMatch) {
            info.configuration = cfgMatch[1].trim().split(/\s+/);
            return;
          }
          const libMatch = line.match(/^\s*(lib[a-z0-9]+)\s+(\d+\.\s*\d+\.\s*\d+)/);
          if (libMatch) {
            info.libraries[libMatch[1]] = libMatch[2].replace(/\s+/g, "");
          }
        });
        cb(null, cache.version = info);
      });
    });
  };
  proto._checkCapabilities = function(callback) {
    const self = this;
    import_async2.default.waterfall([
      // Get available formats
      function(cb) {
        self.availableFormats(cb);
      },
      // Check whether specified formats are available
      function(formats, cb) {
        let unavailable;
        unavailable = self._outputs.reduce((fmts, output) => {
          const format = output.options.find("-f", 1);
          if (format) {
            if (!(format[0] in formats) || !formats[format[0]].canMux) {
              fmts.push(format[0]);
            }
          }
          return fmts;
        }, []);
        if (unavailable.length === 1) {
          return cb(new Error("Output format " + unavailable[0] + " is not available"));
        } else if (unavailable.length > 1) {
          return cb(new Error("Output formats " + unavailable.join(", ") + " are not available"));
        }
        unavailable = self._inputs.reduce((fmts, input) => {
          const format = input.options.find("-f", 1);
          if (format) {
            if (!(format[0] in formats) || !formats[format[0]].canDemux) {
              fmts.push(format[0]);
            }
          }
          return fmts;
        }, []);
        if (unavailable.length === 1) {
          return cb(new Error("Input format " + unavailable[0] + " is not available"));
        } else if (unavailable.length > 1) {
          return cb(new Error("Input formats " + unavailable.join(", ") + " are not available"));
        }
        cb();
      },
      // Get available encoders
      function(cb) {
        self.availableEncoders(cb);
      },
      // Check whether specified codecs are available (falling back to generic codec names like h264, hevc, av1, mp3)
      function(encoders, cb) {
        const missingAudio = self._outputs.reduce((cdcs, output) => {
          const acodec = output.audio.find("-acodec", 1);
          if (acodec && acodec[0] !== "copy") {
            if (!(acodec[0] in encoders) || encoders[acodec[0]].type !== "audio") {
              cdcs.push(acodec[0]);
            }
          }
          return cdcs;
        }, []);
        const missingVideo = self._outputs.reduce((cdcs, output) => {
          const vcodec = output.video.find("-vcodec", 1);
          if (vcodec && vcodec[0] !== "copy") {
            if (!(vcodec[0] in encoders) || encoders[vcodec[0]].type !== "video") {
              cdcs.push(vcodec[0]);
            }
          }
          return cdcs;
        }, []);
        const missingSub = self._outputs.reduce((cdcs, output) => {
          const scodec = output.options.find("-c:s", 1);
          if (scodec && scodec[0] !== "copy") {
            if (!(scodec[0] in encoders) || encoders[scodec[0]].type !== "subtitle") {
              cdcs.push(scodec[0]);
            }
          }
          return cdcs;
        }, []);
        if (!missingAudio.length && !missingVideo.length && !missingSub.length) {
          return cb();
        }
        self.availableCodecs((err, codecs) => {
          if (err) {
            return cb(err);
          }
          const unavailableAudio = missingAudio.filter((name) => {
            return !(name in codecs && codecs[name].canEncode && codecs[name].type === "audio");
          });
          if (unavailableAudio.length === 1) {
            return cb(new Error("Audio codec " + unavailableAudio[0] + " is not available"));
          } else if (unavailableAudio.length > 1) {
            return cb(new Error("Audio codecs " + unavailableAudio.join(", ") + " are not available"));
          }
          const unavailableVideo = missingVideo.filter((name) => {
            return !(name in codecs && codecs[name].canEncode && codecs[name].type === "video");
          });
          if (unavailableVideo.length === 1) {
            return cb(new Error("Video codec " + unavailableVideo[0] + " is not available"));
          } else if (unavailableVideo.length > 1) {
            return cb(new Error("Video codecs " + unavailableVideo.join(", ") + " are not available"));
          }
          const unavailableSub = missingSub.filter((name) => {
            return !(name in codecs && codecs[name].canEncode && codecs[name].type === "subtitle");
          });
          if (unavailableSub.length === 1) {
            return cb(new Error("Subtitle codec " + unavailableSub[0] + " is not available"));
          } else if (unavailableSub.length > 1) {
            return cb(new Error("Subtitle codecs " + unavailableSub.join(", ") + " are not available"));
          }
          cb();
        });
      }
    ], callback);
  };
}
var import_fs, import_path3, import_async2, avCodecRegexp, ffCodecRegexp, ffEncodersRegexp, ffDecodersRegexp, encodersRegexp, formatRegexp, lineBreakRegexp, filterRegexp, pixFmtRegexp, codecTypeMap, cache;
var init_capabilities = __esm({
  "lib/capabilities.js"() {
    "use strict";
    import_fs = __toESM(require("fs"), 1);
    import_path3 = require("path");
    import_async2 = __toESM(require("async"), 1);
    init_utils();
    avCodecRegexp = /^\s*([D ])([E ])([VAS])([S ])([D ])([T ]) ([^ ]+) +(.*)$/;
    ffCodecRegexp = /^\s*([D\.])([E\.])([VASDT])([I\.])([L\.])([S\.]) ([^ ]+) +(.*)$/;
    ffEncodersRegexp = /\(encoders:([^\)]+)\)/;
    ffDecodersRegexp = /\(decoders:([^\)]+)\)/;
    encodersRegexp = /^\s*([VAS\.])([F\.])([S\.])([X\.])([B\.])([D\.]) ([^ ]+) +(.*)$/;
    formatRegexp = /^ ([D ])([E ])([d ]?)\s+([^ ]+)(?:\s+(.*))?$/;
    lineBreakRegexp = /\r\n|\r|\n/;
    filterRegexp = /^(?: [T\.][S\.][C\.] )?([^ ]+) +([AVN]+|\|)->([AVN]+|\|) +(.*)$/;
    pixFmtRegexp = /^([I\.])([O\.])([H\.])([P\.])([B\.])\s+([^ ]+)\s+(\d+)\s+(\d+)(?:\s+(.*))?$/;
    codecTypeMap = {
      V: "video",
      A: "audio",
      S: "subtitle",
      D: "data",
      T: "attachment"
    };
    cache = {};
  }
});

// lib/ffprobe.js
function legacyTag(key) {
  return key.match(/^TAG:/);
}
function legacyDisposition(key) {
  return key.match(/^DISPOSITION:/);
}
function parseFfprobeOutput(out) {
  const trimmed = out.trimStart();
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(out);
      if (parsed && typeof parsed === "object") {
        return {
          streams: parsed.streams || [],
          format: parsed.format || {},
          chapters: parsed.chapters || [],
          ...parsed
        };
      }
    } catch {
    }
  }
  const lines = out.split(/\r\n|\r|\n/);
  const filteredLines = lines.filter((line2) => {
    return line2.length > 0;
  });
  const data = {
    streams: [],
    format: {},
    chapters: []
  };
  function parseBlock(name) {
    const blockData = {};
    let line2 = filteredLines.shift();
    while (typeof line2 !== "undefined") {
      if (line2.toLowerCase() === "[/" + name + "]") {
        return blockData;
      } else if (line2.match(/^\[/)) {
        const nestedMatch = line2.match(/^\[([a-z0-9_]+)\]$/i);
        if (nestedMatch) {
          const nestedName = nestedMatch[1].toLowerCase();
          const nestedBlock = parseBlock(nestedName);
          if (nestedName === "side_data") {
            blockData.side_data_list = blockData.side_data_list || [];
            blockData.side_data_list.push(nestedBlock);
          } else {
            blockData[nestedName] = blockData[nestedName] || [];
            blockData[nestedName].push(nestedBlock);
          }
        }
        line2 = filteredLines.shift();
        continue;
      }
      const kv = line2.match(/^([^=]+)=(.*)$/);
      if (kv) {
        if (!kv[1].match(/^TAG:/) && kv[2].match(/^-?[0-9]+(\.[0-9]+)?$/)) {
          blockData[kv[1]] = Number(kv[2]);
        } else {
          blockData[kv[1]] = kv[2];
        }
      }
      line2 = filteredLines.shift();
    }
    return blockData;
  }
  let line = filteredLines.shift();
  while (typeof line !== "undefined") {
    if (line.match(/^\[stream\]$/i)) {
      const stream = parseBlock("stream");
      data.streams.push(stream);
    } else if (line.match(/^\[chapter\]$/i)) {
      const chapter = parseBlock("chapter");
      data.chapters.push(chapter);
    } else if (line.toLowerCase() === "[format]") {
      data.format = parseBlock("format");
    } else if (line.match(/^\[program\]$/i)) {
      data.programs = data.programs || [];
      data.programs.push(parseBlock("program"));
    } else if (line.match(/^\[frame\]$/i)) {
      data.frames = data.frames || [];
      data.frames.push(parseBlock("frame"));
    } else if (line.match(/^\[packet\]$/i)) {
      data.packets = data.packets || [];
      data.packets.push(parseBlock("packet"));
    }
    line = filteredLines.shift();
  }
  return data;
}
function ffprobe_default(proto) {
  proto.ffprobe = function() {
    const argsList = Array.from(arguments);
    let callback = null;
    if (argsList.length > 0 && typeof argsList[argsList.length - 1] === "function") {
      callback = argsList.pop();
    }
    let input, index = null, options = [];
    if (argsList.length >= 2) {
      index = argsList[0];
      options = argsList[1] || [];
    } else if (argsList.length === 1) {
      if (typeof argsList[0] === "number") {
        index = argsList[0];
      } else if (Array.isArray(argsList[0])) {
        options = argsList[0];
      }
    }
    const execute = (done) => {
      let ended = false;
      function handleCallback(err, data) {
        if (!ended) {
          ended = true;
          done(err, data);
        }
      }
      if (index === null) {
        if (!this._currentInput) {
          return handleCallback(new Error("No input specified"));
        }
        input = this._currentInput;
      } else {
        input = this._inputs[index];
        if (!input) {
          return handleCallback(new Error("Invalid input index"));
        }
      }
      this._getFfprobePath((err, path) => {
        if (err) {
          return handleCallback(err);
        } else if (!path) {
          return handleCallback(new Error("Cannot find ffprobe"));
        }
        let stdout = "";
        let stdoutClosed = false;
        let stderr = "";
        let stderrClosed = false;
        const src = input.isStream ? "pipe:0" : input.source;
        const ffprobe = (0, import_child_process2.spawn)(path, ["-show_streams", "-show_format"].concat(options, src), { windowsHide: true });
        if (ffprobe.stdout) {
          ffprobe.stdout.setEncoding("utf8");
        }
        if (ffprobe.stderr) {
          ffprobe.stderr.setEncoding("utf8");
        }
        if (input.isStream) {
          ffprobe.stdin.on("error", (err2) => {
            if (["ECONNRESET", "EPIPE", "EOF"].indexOf(err2.code) >= 0) {
              return;
            }
            handleCallback(err2);
          });
          ffprobe.stdin.on("close", () => {
            input.source.pause();
            input.source.unpipe(ffprobe.stdin);
          });
          input.source.pipe(ffprobe.stdin);
        }
        ffprobe.on("error", handleCallback);
        let exitError = null;
        function handleExit(err2) {
          if (err2) {
            exitError = err2;
          }
          if (processExited && stdoutClosed && stderrClosed) {
            if (exitError) {
              if (stderr) {
                exitError.message += "\n" + stderr;
              }
              return handleCallback(exitError);
            }
            const data = parseFfprobeOutput(stdout);
            [data.format].concat(data.streams, data.chapters).forEach((target) => {
              if (target) {
                const legacyTagKeys = Object.keys(target).filter(legacyTag);
                if (legacyTagKeys.length) {
                  target.tags = target.tags || {};
                  legacyTagKeys.forEach((tagKey) => {
                    target.tags[tagKey.slice(4)] = target[tagKey];
                    delete target[tagKey];
                  });
                }
                const legacyDispositionKeys = Object.keys(target).filter(legacyDisposition);
                if (legacyDispositionKeys.length) {
                  target.disposition = target.disposition || {};
                  legacyDispositionKeys.forEach((dispositionKey) => {
                    target.disposition[dispositionKey.slice(12)] = target[dispositionKey];
                    delete target[dispositionKey];
                  });
                }
              }
            });
            handleCallback(null, data);
          }
        }
        let processExited = false;
        ffprobe.on("exit", (code, signal) => {
          processExited = true;
          if (code) {
            handleExit(new Error("ffprobe exited with code " + code));
          } else if (signal) {
            handleExit(new Error("ffprobe was killed with signal " + signal));
          } else {
            handleExit();
          }
        });
        ffprobe.stdout.on("data", (data) => {
          stdout += data;
        });
        ffprobe.stdout.on("close", () => {
          stdoutClosed = true;
          handleExit();
        });
        ffprobe.stderr.on("data", (data) => {
          stderr += data;
        });
        ffprobe.stderr.on("close", () => {
          stderrClosed = true;
          handleExit();
        });
      });
    };
    if (callback) {
      execute(callback);
      return;
    }
    return new Promise((resolve3, reject) => {
      execute((err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve3(data);
        }
      });
    });
  };
}
var import_child_process2;
var init_ffprobe = __esm({
  "lib/ffprobe.js"() {
    "use strict";
    import_child_process2 = require("child_process");
  }
});

// lib/recipes.js
function recipes(proto) {
  proto.saveToFile = proto.save = function(output) {
    this.output(output).run();
    return this;
  };
  proto.saveAsync = function(output) {
    return this.output(output).runAsync();
  };
  proto.writeToStream = proto.pipe = proto.stream = function(stream, options) {
    if (stream && (typeof stream !== "object" || !("writable" in stream))) {
      options = stream;
      stream = void 0;
    }
    if (!stream) {
      if (process.version.match(/v0\.8\./)) {
        throw new Error("PassThrough stream is not supported on node v0.8");
      }
      stream = new import_stream.PassThrough();
    }
    this.output(stream, options).run();
    return stream;
  };
  proto.takeScreenshots = proto.thumbnail = proto.thumbnails = proto.screenshot = proto.screenshots = function(config, folder) {
    const self = this;
    if (!this._currentInput) {
      throw new Error("No input specified");
    }
    const source = this._currentInput.source;
    if (typeof config === "number") {
      config = { count: config };
    } else if (config && typeof config === "object") {
      config = { ...config };
    } else {
      config = { count: 1 };
    }
    if (!config.folder) {
      config.folder = folder || ".";
    }
    if (config.timestamps !== void 0) {
      config.timemarks = config.timestamps;
    }
    if (!config.timemarks) {
      if (!config.count) {
        throw new Error("Cannot take screenshots: neither a count nor a timemark list are specified");
      }
      const interval = 100 / (1 + config.count);
      config.timemarks = [];
      for (let i = 0; i < config.count; i++) {
        config.timemarks.push(interval * (i + 1) + "%");
      }
    } else if (!Array.isArray(config.timemarks) || config.timemarks.length === 0) {
      throw new Error("Cannot take screenshots: neither a count nor a timemark list are specified");
    } else {
      config.timemarks = config.timemarks.slice();
    }
    let fixedSize, fixedWidth, fixedHeight, percentSize;
    if (config.size) {
      fixedSize = config.size.match(/^(\d+)x(\d+)$/);
      fixedWidth = config.size.match(/^(\d+)x\?$/);
      fixedHeight = config.size.match(/^\?x(\d+)$/);
      percentSize = config.size.match(/^(\d+(?:\.\d+)?)%$/);
      if (!fixedSize && !fixedWidth && !fixedHeight && !percentSize) {
        throw new Error("Invalid size parameter: " + config.size);
      }
    }
    let metadata;
    function getMetadata(cb) {
      if (metadata) {
        cb(null, metadata);
      } else {
        self.ffprobe((err, meta) => {
          metadata = meta;
          cb(err, meta);
        });
      }
    }
    import_async3.default.waterfall([
      // Compute percent timemarks if any
      function computeTimemarks(next) {
        if (config.timemarks.some((t) => {
          return ("" + t).match(/^[\d.]+%$/);
        })) {
          if (typeof source !== "string") {
            return next(new Error("Cannot compute screenshot timemarks with an input stream, please specify fixed timemarks"));
          }
          getMetadata((err, meta) => {
            if (err) {
              next(err);
            } else {
              const vstream = meta.streams.reduce((biggest, stream) => {
                if (stream.codec_type === "video" && stream.width * stream.height > biggest.width * biggest.height) {
                  return stream;
                } else {
                  return biggest;
                }
              }, { width: 0, height: 0 });
              if (vstream.width === 0) {
                return next(new Error("No video stream in input, cannot take screenshots"));
              }
              let duration = Number(vstream.duration);
              if (isNaN(duration)) {
                duration = Number(meta.format.duration);
              }
              if (isNaN(duration)) {
                return next(new Error("Could not get input duration, please specify fixed timemarks"));
              }
              config.timemarks = config.timemarks.map((mark) => {
                if (("" + mark).match(/^([\d.]+)%$/)) {
                  return duration * parseFloat(mark) / 100;
                } else {
                  return mark;
                }
              });
              next();
            }
          });
        } else {
          next();
        }
      },
      // Turn all timemarks into numbers and sort them
      function normalizeTimemarks(next) {
        config.timemarks = config.timemarks.map((mark) => {
          return timemarkToSeconds(mark);
        }).sort((a, b) => {
          return a - b;
        });
        next();
      },
      // Add '_%i' to pattern when requesting multiple screenshots and no variable token is present
      function fixPattern(next) {
        let pattern = config.filename || "tn.png";
        if (pattern.indexOf(".") === -1) {
          pattern += ".png";
        }
        if (config.timemarks.length > 1 && !pattern.match(/%(s|0*i)/)) {
          const ext = (0, import_path4.extname)(pattern);
          pattern = (0, import_path4.join)((0, import_path4.dirname)(pattern), (0, import_path4.basename)(pattern, ext) + "_%i" + ext);
        }
        next(null, pattern);
      },
      // Replace filename tokens (%f, %b) in pattern
      function replaceFilenameTokens(pattern, next) {
        if (pattern.match(/%[bf]/)) {
          if (typeof source !== "string") {
            return next(new Error("Cannot replace %f or %b when using an input stream"));
          }
          pattern = pattern.replace(/%f/g, (0, import_path4.basename)(source)).replace(/%b/g, (0, import_path4.basename)(source, (0, import_path4.extname)(source)));
        }
        next(null, pattern);
      },
      // Compute size if needed
      function getSize(pattern, next) {
        if (pattern.match(/%[whr]/)) {
          if (fixedSize) {
            return next(null, pattern, fixedSize[1], fixedSize[2]);
          }
          getMetadata((err, meta) => {
            if (err) {
              return next(new Error("Could not determine video resolution to replace %w, %h or %r"));
            }
            const vstream = meta.streams.reduce((biggest, stream) => {
              if (stream.codec_type === "video" && stream.width * stream.height > biggest.width * biggest.height) {
                return stream;
              } else {
                return biggest;
              }
            }, { width: 0, height: 0 });
            if (vstream.width === 0) {
              return next(new Error("No video stream in input, cannot replace %w, %h or %r"));
            }
            let width = vstream.width;
            let height = vstream.height;
            if (fixedWidth) {
              height = height * Number(fixedWidth[1]) / width;
              width = Number(fixedWidth[1]);
            } else if (fixedHeight) {
              width = width * Number(fixedHeight[1]) / height;
              height = Number(fixedHeight[1]);
            } else if (percentSize) {
              width = width * Number(percentSize[1]) / 100;
              height = height * Number(percentSize[1]) / 100;
            }
            next(null, pattern, Math.round(width / 2) * 2, Math.round(height / 2) * 2);
          });
        } else {
          next(null, pattern, -1, -1);
        }
      },
      // Replace size tokens (%w, %h, %r) in pattern
      function replaceSizeTokens(pattern, width, height, next) {
        pattern = pattern.replace(/%r/g, "%wx%h").replace(/%w/g, width).replace(/%h/g, height);
        next(null, pattern);
      },
      // Replace variable tokens in pattern (%s, %i) and generate filename list
      function replaceVariableTokens(pattern, next) {
        const filenames = config.timemarks.map((t, i) => {
          return pattern.replace(/%s/g, timemarkToSeconds(t)).replace(/%(0*)i/g, (match, padding) => {
            const idx = "" + (i + 1);
            return padding.slice(0, Math.max(0, padding.length + 1 - idx.length)) + idx;
          });
        });
        self.emit("filenames", filenames);
        next(null, filenames);
      },
      // Create output directory (supports nested directories and avoids EEXIST race)
      function createDirectory(filenames, next) {
        import_fs2.default.mkdir(config.folder, { recursive: true }, (err) => {
          if (err) {
            next(err);
          } else {
            next(null, filenames);
          }
        });
      }
    ], function runCommand(err, filenames) {
      if (err) {
        return self.emit("error", err);
      }
      const count = config.timemarks.length;
      if (config.fastSeek && typeof source === "string") {
        const baseInputIndex = self._inputs.length - 1;
        for (let i = 0; i < count; i++) {
          const inputIdx = baseInputIndex + i;
          if (i === 0) {
            self.inputOptions("-noaccurate_seek").seekInput(config.timemarks[i]);
          } else {
            self.input(source).inputOptions("-noaccurate_seek").seekInput(config.timemarks[i]);
          }
          self.output((0, import_path4.join)(config.folder, filenames[i])).frames(1).map(`${inputIdx}:v:0`);
          if (config.size) {
            self.size(config.size);
          }
        }
        self.run();
        return;
      }
      let split;
      let filters = [split = {
        filter: "split",
        options: count,
        outputs: []
      }];
      if (config.size) {
        self.size(config.size);
        const sizeFilters = self._currentOutput.sizeFilters.get().map((f, i) => {
          if (i > 0) {
            f.inputs = "size" + (i - 1);
          }
          f.outputs = "size" + i;
          return f;
        });
        split.inputs = "size" + (sizeFilters.length - 1);
        filters = sizeFilters.concat(filters);
        self._currentOutput.sizeFilters.clear();
      }
      let first = 0;
      for (let i = 0; i < count; i++) {
        const stream = "screen" + i;
        split.outputs.push(stream);
        if (i === 0) {
          first = config.timemarks[i];
          if (config.fastSeek) {
            self.inputOptions("-noaccurate_seek");
          }
          self.seekInput(first);
        }
        self.output((0, import_path4.join)(config.folder, filenames[i])).frames(1).map(stream);
        if (i > 0) {
          self.seek(config.timemarks[i] - first);
        }
      }
      self.complexFilter(filters);
      self.run();
    });
    return this;
  };
  proto.screenshotsAsync = function(config, folder) {
    return new Promise((resolve3, reject) => {
      let generatedFilenames = [];
      this.once("filenames", (filenames) => {
        generatedFilenames = filenames;
      }).once("end", () => {
        resolve3(generatedFilenames);
      }).once("error", (err) => {
        reject(err);
      });
      try {
        this.screenshots(config, folder);
      } catch (err) {
        reject(err);
      }
    });
  };
  proto.mergeToFile = proto.concatenate = proto.concat = function(target, options) {
    if (!this._inputs.length) {
      process.nextTick(() => this.emit("error", new Error("No input specified")));
      return this;
    }
    const fileInput = this._inputs.filter((input) => {
      return !input.isStream;
    })[0];
    if (!fileInput) {
      process.nextTick(() => this.emit("error", new Error("Cannot concat without at least one non-stream input")));
      return this;
    }
    const pipeOpts = options && typeof options === "object" ? options : void 0;
    const self = this;
    this.ffprobe(this._inputs.indexOf(fileInput), (err, data) => {
      if (err) {
        return self.emit("error", err);
      }
      const hasAudioStreams = data.streams.some((stream) => {
        return stream.codec_type === "audio";
      });
      const hasVideoStreams = data.streams.some((stream) => {
        return stream.codec_type === "video";
      });
      self.output(target, pipeOpts).complexFilter({
        filter: "concat",
        options: {
          n: self._inputs.length,
          v: hasVideoStreams ? 1 : 0,
          a: hasAudioStreams ? 1 : 0
        }
      }).run();
    });
    return this;
  };
}
var import_fs2, import_path4, import_stream, import_async3;
var init_recipes = __esm({
  "lib/recipes.js"() {
    "use strict";
    import_fs2 = __toESM(require("fs"), 1);
    import_path4 = require("path");
    import_stream = require("stream");
    import_async3 = __toESM(require("async"), 1);
    init_utils();
  }
});

// lib/fluent-ffmpeg.js
var fluent_ffmpeg_exports = {};
__export(fluent_ffmpeg_exports, {
  FfmpegCommand: () => FfmpegCommand,
  default: () => fluent_ffmpeg_default
});
var import_events, FfmpegCommand, ffmpeg, fluent_ffmpeg_default;
var init_fluent_ffmpeg = __esm({
  "lib/fluent-ffmpeg.js"() {
    "use strict";
    import_events = require("events");
    init_inputs();
    init_audio();
    init_video();
    init_videosize();
    init_output();
    init_custom();
    init_hwaccel();
    init_streaming();
    init_misc();
    init_processor();
    init_capabilities();
    init_ffprobe();
    init_recipes();
    init_utils();
    FfmpegCommand = class _FfmpegCommand extends import_events.EventEmitter {
      constructor(input, options) {
        super();
        if (input && typeof input === "object" && !("readable" in input)) {
          options = { ...input };
        } else {
          options = options ? { ...options } : {};
          if (input !== void 0 && input !== null) {
            options.source = input;
          }
        }
        this._inputs = [];
        if (options.source) {
          this.input(options.source);
        }
        this._outputs = [];
        this.output();
        const self = this;
        ["_global", "_complexFilters"].forEach((prop) => {
          self[prop] = args();
        });
        options.stdoutLines = "stdoutLines" in options ? options.stdoutLines : 100;
        options.presets = options.presets || options.preset || getBuiltinPresetsDir();
        options.niceness = options.niceness || options.priority || 0;
        this.options = options;
        this.logger = options.logger || {
          debug: function() {
          },
          info: function() {
          },
          warn: function() {
          },
          error: function() {
          }
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
        const clone = new _FfmpegCommand();
        const self = this;
        clone.options = { ...this.options };
        clone.logger = this.logger;
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
          clone._currentInput = currentIdx >= 0 ? clone._inputs[currentIdx] : clone._inputs[clone._inputs.length - 1];
        }
        if ("target" in this._outputs[0]) {
          clone._outputs = [];
          clone.output();
        } else {
          clone._outputs = [
            clone._currentOutput = {
              isFile: this._currentOutput.isFile,
              flags: {},
              pipeopts: this._currentOutput.pipeopts ? { ...this._currentOutput.pipeopts } : {}
            }
          ];
          ["audio", "audioFilters", "video", "videoFilters", "sizeFilters", "options"].forEach((key) => {
            clone._currentOutput[key] = self._currentOutput[key].clone();
          });
          if (this._currentOutput.sizeData) {
            clone._currentOutput.sizeData = {};
            copy(this._currentOutput.sizeData, clone._currentOutput.sizeData);
          }
          copy(this._currentOutput.flags, clone._currentOutput.flags);
        }
        ["_global", "_complexFilters"].forEach((prop) => {
          clone[prop] = self[prop].clone();
        });
        return clone;
      }
    };
    inputs_default(FfmpegCommand.prototype);
    audio_default(FfmpegCommand.prototype);
    video_default(FfmpegCommand.prototype);
    videosize_default(FfmpegCommand.prototype);
    output_default(FfmpegCommand.prototype);
    custom_default(FfmpegCommand.prototype);
    hwaccel_default(FfmpegCommand.prototype);
    streaming_default(FfmpegCommand.prototype);
    misc_default(FfmpegCommand.prototype);
    processor_default(FfmpegCommand.prototype);
    capabilities_default(FfmpegCommand.prototype);
    FfmpegCommand.setFfmpegPath = function(path) {
      new FfmpegCommand().setFfmpegPath(path);
    };
    FfmpegCommand.setFfprobePath = function(path) {
      new FfmpegCommand().setFfprobePath(path);
    };
    FfmpegCommand.setFlvtoolPath = function(path) {
      new FfmpegCommand().setFlvtoolPath(path);
    };
    FfmpegCommand.availableFilters = FfmpegCommand.getAvailableFilters = function(callback) {
      return new FfmpegCommand().availableFilters(callback);
    };
    FfmpegCommand.availableCodecs = FfmpegCommand.getAvailableCodecs = function(callback) {
      return new FfmpegCommand().availableCodecs(callback);
    };
    FfmpegCommand.availableFormats = FfmpegCommand.getAvailableFormats = function(callback) {
      return new FfmpegCommand().availableFormats(callback);
    };
    FfmpegCommand.availableEncoders = FfmpegCommand.getAvailableEncoders = function(callback) {
      return new FfmpegCommand().availableEncoders(callback);
    };
    FfmpegCommand.availableDecoders = FfmpegCommand.getAvailableDecoders = function(callback) {
      return new FfmpegCommand().availableDecoders(callback);
    };
    FfmpegCommand.availableHwaccels = FfmpegCommand.getAvailableHwaccels = function(callback) {
      return new FfmpegCommand().availableHwaccels(callback);
    };
    FfmpegCommand.availablePixelFormats = FfmpegCommand.getAvailablePixelFormats = function(callback) {
      return new FfmpegCommand().availablePixelFormats(callback);
    };
    FfmpegCommand.availableBitstreamFilters = FfmpegCommand.getAvailableBitstreamFilters = function(callback) {
      return new FfmpegCommand().availableBitstreamFilters(callback);
    };
    FfmpegCommand.availableProtocols = FfmpegCommand.getAvailableProtocols = function(callback) {
      return new FfmpegCommand().availableProtocols(callback);
    };
    FfmpegCommand.ffmpegVersion = FfmpegCommand.getFfmpegVersion = function(callback) {
      return new FfmpegCommand().ffmpegVersion(callback);
    };
    ffprobe_default(FfmpegCommand.prototype);
    FfmpegCommand.ffprobe = function(file, ...rest) {
      const instance = new FfmpegCommand(file);
      return instance.ffprobe(...rest);
    };
    recipes(FfmpegCommand.prototype);
    ffmpeg = new Proxy(FfmpegCommand, {
      apply(target, thisArg, argList) {
        return new target(...argList);
      }
    });
    FfmpegCommand.FfmpegCommand = FfmpegCommand;
    fluent_ffmpeg_default = ffmpeg;
  }
});

// cjs-entry.cjs
var mod = (init_fluent_ffmpeg(), __toCommonJS(fluent_ffmpeg_exports));
var ffmpeg2 = mod.default;
module.exports = ffmpeg2;
