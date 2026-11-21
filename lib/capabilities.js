import fs from 'fs';
import { join, dirname } from 'path';
import async from 'async';
import { copy, isWindows, which } from './utils.js';

/*
 *! Capability helpers
 */

const avCodecRegexp = /^\s*([D ])([E ])([VAS])([S ])([D ])([T ]) ([^ ]+) +(.*)$/;
const ffCodecRegexp = /^\s*([D\.])([E\.])([VASDT])([I\.])([L\.])([S\.]) ([^ ]+) +(.*)$/;
const ffEncodersRegexp = /\(encoders:([^\)]+)\)/;
const ffDecodersRegexp = /\(decoders:([^\)]+)\)/;
const encodersRegexp = /^\s*([VAS\.])([F\.])([S\.])([X\.])([B\.])([D\.]) ([^ ]+) +(.*)$/;
const formatRegexp = /^ ([D ])([E ])([d ]?)\s+([^ ]+)(?:\s+(.*))?$/;
const lineBreakRegexp = /\r\n|\r|\n/;
const filterRegexp = /^(?: [T\.][S\.][C\.] )?([^ ]+) +([AVN]+|\|)->([AVN]+|\|) +(.*)$/;
const pixFmtRegexp = /^([I\.])([O\.])([H\.])([P\.])([B\.])\s+([^ ]+)\s+(\d+)\s+(\d+)(?:\s+(.*))?$/;

const codecTypeMap = {
  V: 'video',
  A: 'audio',
  S: 'subtitle',
  D: 'data',
  T: 'attachment'
};

const cache = {};

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
  if (spec === '|') {
    return 'none';
  }
  if (spec.includes('N') || (spec.includes('A') && spec.includes('V'))) {
    return 'dynamic';
  }
  return spec.charAt(0) === 'A' ? 'audio' : 'video';
}

function withOptionalCallback(callback, executor) {
  if (typeof callback === 'function') {
    executor(callback);
    return;
  }

  return new Promise((resolve, reject) => {
    executor((err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

export default function(proto) {
  /**
   * Manually define the ffmpeg binary full path.
   *
   * @method FfmpegCommand#setFfmpegPath
   *
   * @param {String} ffmpegPath The full path to the ffmpeg binary.
   * @return FfmpegCommand
   */
  proto.setFfmpegPath = function(ffmpegPath) {
    if ('ffmpegPath' in cache && cache.ffmpegPath !== ffmpegPath) {
      clearCapabilityCache();
    }
    cache.ffmpegPath = ffmpegPath;
    return this;
  };

  /**
   * Manually define the ffprobe binary full path.
   *
   * @method FfmpegCommand#setFfprobePath
   *
   * @param {String} ffprobePath The full path to the ffprobe binary.
   * @return FfmpegCommand
   */
  proto.setFfprobePath = function(ffprobePath) {
    cache.ffprobePath = ffprobePath;
    return this;
  };

  /**
   * Manually define the flvtool2/flvmeta binary full path.
   *
   * @method FfmpegCommand#setFlvtoolPath
   *
   * @param {String} flvtool The full path to the flvtool2 or flvmeta binary.
   * @return FfmpegCommand
   */
  proto.setFlvtoolPath = function(flvtool) {
    cache.flvtoolPath = flvtool;
    return this;
  };

  /**
   * Forget executable paths
   *
   * (only used for testing purposes)
   *
   * @method FfmpegCommand#_forgetPaths
   * @private
   */
  proto._forgetPaths = function() {
    delete cache.ffmpegPath;
    delete cache.ffprobePath;
    delete cache.flvtoolPath;
  };

  /**
   * Check for ffmpeg availability
   *
   * If the FFMPEG_PATH environment variable is set, try to use it.
   * If it is unset or incorrect, try to find ffmpeg in the PATH instead.
   *
   * @method FfmpegCommand#_getFfmpegPath
   * @param {Function} callback callback with signature (err, path)
   * @private
   */
  proto._getFfmpegPath = function(callback) {
    if ('ffmpegPath' in cache) {
      return callback(null, cache.ffmpegPath);
    }

    async.waterfall([
      // Try FFMPEG_PATH
      function(cb) {
        if (process.env.FFMPEG_PATH) {
          fs.access(process.env.FFMPEG_PATH, (accessErr) => {
            const exists = !accessErr;
            if (exists) {
              cb(null, process.env.FFMPEG_PATH);
            } else {
              cb(null, '');
            }
          });
        } else {
          cb(null, '');
        }
      },

      // Search in the PATH
      function(ffmpeg, cb) {
        if (ffmpeg.length) {
          return cb(null, ffmpeg);
        }

        which('ffmpeg', (err, ffmpeg) => {
          cb(err, ffmpeg);
        });
      }
    ], (err, ffmpeg) => {
      if (err) {
        callback(err);
      } else {
        callback(null, cache.ffmpegPath = (ffmpeg || ''));
      }
    });
  };


  /**
   * Check for ffprobe availability
   *
   * If the FFPROBE_PATH environment variable is set, try to use it.
   * If it is unset or incorrect, try to find ffprobe in the PATH instead.
   * If this still fails, try to find ffprobe in the same directory as ffmpeg.
   *
   * @method FfmpegCommand#_getFfprobePath
   * @param {Function} callback callback with signature (err, path)
   * @private
   */
  proto._getFfprobePath = function(callback) {
    const self = this;

    if ('ffprobePath' in cache) {
      return callback(null, cache.ffprobePath);
    }

    async.waterfall([
      // Try FFPROBE_PATH
      function(cb) {
        if (process.env.FFPROBE_PATH) {
          fs.access(process.env.FFPROBE_PATH, (accessErr) => {
            const exists = !accessErr;
            cb(null, exists ? process.env.FFPROBE_PATH : '');
          });
        } else {
          cb(null, '');
        }
      },

      // Search in the PATH
      function(ffprobe, cb) {
        if (ffprobe.length) {
          return cb(null, ffprobe);
        }

        which('ffprobe', (err, ffprobe) => {
          cb(err, ffprobe);
        });
      },

      // Search in the same directory as ffmpeg
      function(ffprobe, cb) {
        if (ffprobe.length) {
          return cb(null, ffprobe);
        }

        self._getFfmpegPath((err, ffmpeg) => {
          if (err) {
            cb(err);
          } else if (ffmpeg.length) {
            const name = isWindows ? 'ffprobe.exe' : 'ffprobe';
            const ffprobe = join(dirname(ffmpeg), name);
            fs.access(ffprobe, (accessErr) => {
              const exists = !accessErr;
              cb(null, exists ? ffprobe : '');
            });
          } else {
            cb(null, '');
          }
        });
      }
    ], (err, ffprobe) => {
      if (err) {
        callback(err);
      } else {
        callback(null, cache.ffprobePath = (ffprobe || ''));
      }
    });
  };


  /**
   * Check for flvtool2/flvmeta availability
   *
   * If the FLVTOOL2_PATH or FLVMETA_PATH environment variable are set, try to use them.
   * If both are either unset or incorrect, try to find flvtool2 or flvmeta in the PATH instead.
   *
   * @method FfmpegCommand#_getFlvtoolPath
   * @param {Function} callback callback with signature (err, path)
   * @private
   */
  proto._getFlvtoolPath = function(callback) {
    if ('flvtoolPath' in cache) {
      return callback(null, cache.flvtoolPath);
    }

    async.waterfall([
      // Try FLVMETA_PATH
      function(cb) {
        if (process.env.FLVMETA_PATH) {
          fs.access(process.env.FLVMETA_PATH, (accessErr) => {
            const exists = !accessErr;
            cb(null, exists ? process.env.FLVMETA_PATH : '');
          });
        } else {
          cb(null, '');
        }
      },

      // Try FLVTOOL2_PATH
      function(flvtool, cb) {
        if (flvtool.length) {
          return cb(null, flvtool);
        }

        if (process.env.FLVTOOL2_PATH) {
          fs.access(process.env.FLVTOOL2_PATH, (accessErr) => {
            const exists = !accessErr;
            cb(null, exists ? process.env.FLVTOOL2_PATH : '');
          });
        } else {
          cb(null, '');
        }
      },

      // Search for flvmeta in the PATH
      function(flvtool, cb) {
        if (flvtool.length) {
          return cb(null, flvtool);
        }

        which('flvmeta', (err, flvmeta) => {
          cb(err, flvmeta);
        });
      },

      // Search for flvtool2 in the PATH
      function(flvtool, cb) {
        if (flvtool.length) {
          return cb(null, flvtool);
        }

        which('flvtool2', (err, flvtool2) => {
          cb(err, flvtool2);
        });
      }
    ], (err, flvtool) => {
      if (err) {
        callback(err);
      } else {
        callback(null, cache.flvtoolPath = (flvtool || ''));
      }
    });
  };


  /**
   * Query ffmpeg for available filters
   *
   * @method FfmpegCommand#availableFilters
   * @category Capabilities
   * @aliases getAvailableFilters
   *
   * @param {FfmpegCommand~filterCallback} [callback] callback function (omit to return a Promise)
   */
  proto.availableFilters =
  proto.getAvailableFilters = function(callback) {
    return withOptionalCallback(callback, (cb) => {
      if ('filters' in cache) {
        return cb(null, cache.filters);
      }

      this._spawnFfmpeg(['-filters'], { captureStdout: true, stdoutLines: 0 }, (err, stdoutRing) => {
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
              multipleInputs: match[2].length > 1 || match[2] === 'N',
              output: parseFilterIoType(match[3]),
              multipleOutputs: match[3].length > 1 || match[3] === 'N'
            };
          }
        });

        cb(null, cache.filters = data);
      });
    });
  };


  /**
   * Query ffmpeg for available codecs
   *
   * @method FfmpegCommand#availableCodecs
   * @category Capabilities
   * @aliases getAvailableCodecs
   *
   * @param {FfmpegCommand~codecCallback} [callback] callback function (omit to return a Promise)
   */
  proto.availableCodecs =
  proto.getAvailableCodecs = function(callback) {
    return withOptionalCallback(callback, (cb) => {
      if ('codecs' in cache) {
        return cb(null, cache.codecs);
      }

      this._spawnFfmpeg(['-codecs'], { captureStdout: true, stdoutLines: 0 }, (err, stdoutRing) => {
        if (err) {
          return cb(err);
        }

        const stdout = stdoutRing.get();
        const lines = stdout.split(lineBreakRegexp);
        const data = {};

        lines.forEach((line) => {
          let match = line.match(avCodecRegexp);
          if (match && match[7] !== '=') {
            data[match[7]] = {
              type: codecTypeMap[match[3]],
              description: match[8],
              canDecode: match[1] === 'D',
              canEncode: match[2] === 'E',
              drawHorizBand: match[4] === 'S',
              directRendering: match[5] === 'D',
              weirdFrameTruncation: match[6] === 'T'
            };
          }

          match = line.match(ffCodecRegexp);
          if (match && match[7] !== '=') {
            const codecData = data[match[7]] = {
              type: codecTypeMap[match[3]],
              description: match[8],
              canDecode: match[1] === 'D',
              canEncode: match[2] === 'E',
              intraFrameOnly: match[4] === 'I',
              isLossy: match[5] === 'L',
              isLossless: match[6] === 'S'
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


  /**
   * Query ffmpeg for available encoders
   *
   * @method FfmpegCommand#availableEncoders
   * @category Capabilities
   * @aliases getAvailableEncoders
   *
   * @param {FfmpegCommand~encodersCallback} [callback] callback function (omit to return a Promise)
   */
  proto.availableEncoders =
  proto.getAvailableEncoders = function(callback) {
    return withOptionalCallback(callback, (cb) => {
      if ('encoders' in cache) {
        return cb(null, cache.encoders);
      }

      this._spawnFfmpeg(['-encoders'], { captureStdout: true, stdoutLines: 0 }, (err, stdoutRing) => {
        if (err) {
          return cb(err);
        }

        const stdout = stdoutRing.get();
        const lines = stdout.split(lineBreakRegexp);
        const data = {};

        lines.forEach((line) => {
          const match = line.match(encodersRegexp);
          if (match && match[7] !== '=') {
            data[match[7]] = {
              type: codecTypeMap[match[1]],
              description: match[8],
              frameMT: match[2] === 'F',
              sliceMT: match[3] === 'S',
              experimental: match[4] === 'X',
              drawHorizBand: match[5] === 'B',
              directRendering: match[6] === 'D'
            };
          }
        });

        cb(null, cache.encoders = data);
      });
    });
  };


  /**
   * Query ffmpeg for available decoders (`ffmpeg -decoders`)
   *
   * @method FfmpegCommand#availableDecoders
   * @category Capabilities
   * @aliases getAvailableDecoders
   *
   * @param {Function} [callback] callback function (omit to return a Promise)
   */
  proto.availableDecoders =
  proto.getAvailableDecoders = function(callback) {
    return withOptionalCallback(callback, (cb) => {
      if ('decoders' in cache) {
        return cb(null, cache.decoders);
      }

      this._spawnFfmpeg(['-decoders'], { captureStdout: true, stdoutLines: 0 }, (err, stdoutRing) => {
        if (err) {
          return cb(err);
        }

        const stdout = stdoutRing.get();
        const lines = stdout.split(lineBreakRegexp);
        const data = {};

        lines.forEach((line) => {
          const match = line.match(encodersRegexp);
          if (match && match[7] !== '=') {
            data[match[7]] = {
              type: codecTypeMap[match[1]],
              description: match[8],
              frameMT: match[2] === 'F',
              sliceMT: match[3] === 'S',
              experimental: match[4] === 'X',
              drawHorizBand: match[5] === 'B',
              directRendering: match[6] === 'D'
            };
          }
        });

        cb(null, cache.decoders = data);
      });
    });
  };


  /**
   * Query ffmpeg for available formats (including FFmpeg 7+ device column `d`)
   *
   * @method FfmpegCommand#availableFormats
   * @category Capabilities
   * @aliases getAvailableFormats
   *
   * @param {FfmpegCommand~formatCallback} [callback] callback function (omit to return a Promise)
   */
  proto.availableFormats =
  proto.getAvailableFormats = function(callback) {
    return withOptionalCallback(callback, (cb) => {
      if ('formats' in cache) {
        return cb(null, cache.formats);
      }

      // Run ffmpeg -formats
      this._spawnFfmpeg(['-formats'], { captureStdout: true, stdoutLines: 0 }, (err, stdoutRing) => {
        if (err) {
          return cb(err);
        }

        // Parse output
        const stdout = stdoutRing.get();
        const lines = stdout.split(lineBreakRegexp);
        const data = {};

        lines.forEach((line) => {
          const match = line.match(formatRegexp);
          if (match && (match[1] === 'D' || match[2] === 'E')) {
            match[4].split(',').forEach((format) => {
              if (!(format in data)) {
                data[format] = {
                  description: (match[5] || '').trim(),
                  canDemux: false,
                  canMux: false,
                  isDevice: match[3] === 'd'
                };
              }

              if (match[1] === 'D') {
                data[format].canDemux = true;
              }
              if (match[2] === 'E') {
                data[format].canMux = true;
              }
              if (match[3] === 'd') {
                data[format].isDevice = true;
              }
            });
          }
        });

        cb(null, cache.formats = data);
      });
    });
  };


  /**
   * Query ffmpeg for available hardware acceleration methods (`ffmpeg -hwaccels`)
   *
   * @method FfmpegCommand#availableHwaccels
   * @category Capabilities
   * @aliases getAvailableHwaccels
   *
   * @param {Function} [callback] callback function (omit to return a Promise)
   */
  proto.availableHwaccels =
  proto.getAvailableHwaccels = function(callback) {
    return withOptionalCallback(callback, (cb) => {
      if ('hwaccels' in cache) {
        return cb(null, cache.hwaccels);
      }

      this._spawnFfmpeg(['-hwaccels'], { captureStdout: true, stdoutLines: 0 }, (err, stdoutRing) => {
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


  /**
   * Query ffmpeg for available pixel formats (`ffmpeg -pix_fmts`)
   *
   * @method FfmpegCommand#availablePixelFormats
   * @category Capabilities
   * @aliases getAvailablePixelFormats
   *
   * @param {Function} [callback] callback function (omit to return a Promise)
   */
  proto.availablePixelFormats =
  proto.getAvailablePixelFormats = function(callback) {
    return withOptionalCallback(callback, (cb) => {
      if ('pixFmts' in cache) {
        return cb(null, cache.pixFmts);
      }

      this._spawnFfmpeg(['-pix_fmts'], { captureStdout: true, stdoutLines: 0 }, (err, stdoutRing) => {
        if (err) {
          return cb(err);
        }

        const lines = stdoutRing.get().split(lineBreakRegexp);
        const data = {};

        lines.forEach((line) => {
          const match = line.match(pixFmtRegexp);
          if (match) {
            data[match[6]] = {
              canInput: match[1] === 'I',
              canOutput: match[2] === 'O',
              hardwareAccelerated: match[3] === 'H',
              paletted: match[4] === 'P',
              bitstream: match[5] === 'B',
              nbComponents: parseInt(match[7], 10),
              bitsPerPixel: parseInt(match[8], 10),
              bitDepths: match[9] ? match[9].trim() : undefined
            };
          }
        });

        cb(null, cache.pixFmts = data);
      });
    });
  };


  /**
   * Query ffmpeg for available bitstream filters (`ffmpeg -bsfs`)
   *
   * @method FfmpegCommand#availableBitstreamFilters
   * @category Capabilities
   * @aliases getAvailableBitstreamFilters
   *
   * @param {Function} [callback] callback function (omit to return a Promise)
   */
  proto.availableBitstreamFilters =
  proto.getAvailableBitstreamFilters = function(callback) {
    return withOptionalCallback(callback, (cb) => {
      if ('bsfs' in cache) {
        return cb(null, cache.bsfs);
      }

      this._spawnFfmpeg(['-bsfs'], { captureStdout: true, stdoutLines: 0 }, (err, stdoutRing) => {
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


  /**
   * Query ffmpeg for supported file/network protocols (`ffmpeg -protocols`)
   *
   * @method FfmpegCommand#availableProtocols
   * @category Capabilities
   * @aliases getAvailableProtocols
   *
   * @param {Function} [callback] callback function (omit to return a Promise)
   */
  proto.availableProtocols =
  proto.getAvailableProtocols = function(callback) {
    return withOptionalCallback(callback, (cb) => {
      if ('protocols' in cache) {
        return cb(null, cache.protocols);
      }

      this._spawnFfmpeg(['-protocols'], { captureStdout: true, stdoutLines: 0 }, (err, stdoutRing) => {
        if (err) {
          return cb(err);
        }

        const lines = stdoutRing.get().split(lineBreakRegexp);
        const data = { input: [], output: [] };
        let section = null;

        lines.forEach((line) => {
          const trimmed = line.trim();
          if (/^Input:/i.test(trimmed)) {
            section = 'input';
          } else if (/^Output:/i.test(trimmed)) {
            section = 'output';
          } else if (section && trimmed) {
            data[section].push(trimmed);
          }
        });

        cb(null, cache.protocols = data);
      });
    });
  };


  /**
   * Query ffmpeg binary version, build configuration flags, and libav library versions (`ffmpeg -version`)
   *
   * @method FfmpegCommand#ffmpegVersion
   * @category Capabilities
   * @aliases getFfmpegVersion
   *
   * @param {Function} [callback] callback function (omit to return a Promise)
   */
  proto.ffmpegVersion =
  proto.getFfmpegVersion = function(callback) {
    return withOptionalCallback(callback, (cb) => {
      if ('version' in cache) {
        return cb(null, cache.version);
      }

      this._spawnFfmpeg(['-version'], { captureStdout: true, stdoutLines: 0 }, (err, stdoutRing) => {
        if (err) {
          return cb(err);
        }

        const lines = stdoutRing.get().split(lineBreakRegexp);
        const info = {
          version: '',
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
            info.libraries[libMatch[1]] = libMatch[2].replace(/\s+/g, '');
          }
        });

        cb(null, cache.version = info);
      });
    });
  };


  /**
   * Check capabilities before executing a command
   *
   * Checks whether all used codecs and formats are indeed available
   *
   * @method FfmpegCommand#_checkCapabilities
   * @param {Function} callback callback with signature (err)
   * @private
   */
  proto._checkCapabilities = function(callback) {
    const self = this;
    async.waterfall([
      // Get available formats
      function(cb) {
        self.availableFormats(cb);
      },

      // Check whether specified formats are available
      function(formats, cb) {
        let unavailable;

        // Output format(s)
        unavailable = self._outputs
          .reduce((fmts, output) => {
            const format = output.options.find('-f', 1);
            if (format) {
              if (!(format[0] in formats) || !(formats[format[0]].canMux)) {
                fmts.push(format[0]);
              }
            }

            return fmts;
          }, []);

        if (unavailable.length === 1) {
          return cb(new Error('Output format ' + unavailable[0] + ' is not available'));
        } else if (unavailable.length > 1) {
          return cb(new Error('Output formats ' + unavailable.join(', ') + ' are not available'));
        }

        // Input format(s)
        unavailable = self._inputs
          .reduce((fmts, input) => {
            const format = input.options.find('-f', 1);
            if (format) {
              if (!(format[0] in formats) || !(formats[format[0]].canDemux)) {
                fmts.push(format[0]);
              }
            }

            return fmts;
          }, []);

        if (unavailable.length === 1) {
          return cb(new Error('Input format ' + unavailable[0] + ' is not available'));
        } else if (unavailable.length > 1) {
          return cb(new Error('Input formats ' + unavailable.join(', ') + ' are not available'));
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
          const acodec = output.audio.find('-acodec', 1);
          if (acodec && acodec[0] !== 'copy') {
            if (!(acodec[0] in encoders) || encoders[acodec[0]].type !== 'audio') {
              cdcs.push(acodec[0]);
            }
          }
          return cdcs;
        }, []);

        const missingVideo = self._outputs.reduce((cdcs, output) => {
          const vcodec = output.video.find('-vcodec', 1);
          if (vcodec && vcodec[0] !== 'copy') {
            if (!(vcodec[0] in encoders) || encoders[vcodec[0]].type !== 'video') {
              cdcs.push(vcodec[0]);
            }
          }
          return cdcs;
        }, []);

        const missingSub = self._outputs.reduce((cdcs, output) => {
          const scodec = output.options.find('-c:s', 1);
          if (scodec && scodec[0] !== 'copy') {
            if (!(scodec[0] in encoders) || encoders[scodec[0]].type !== 'subtitle') {
              cdcs.push(scodec[0]);
            }
          }
          return cdcs;
        }, []);

        if (!missingAudio.length && !missingVideo.length && !missingSub.length) {
          return cb();
        }

        // Lazily check generic codecs (e.g. 'h264', 'hevc', 'av1', 'vp9', 'mp3') that FFmpeg resolves to a default encoder
        self.availableCodecs((err, codecs) => {
          if (err) {
            return cb(err);
          }

          const unavailableAudio = missingAudio.filter((name) => {
            return !((name in codecs) && codecs[name].canEncode && codecs[name].type === 'audio');
          });
          if (unavailableAudio.length === 1) {
            return cb(new Error('Audio codec ' + unavailableAudio[0] + ' is not available'));
          } else if (unavailableAudio.length > 1) {
            return cb(new Error('Audio codecs ' + unavailableAudio.join(', ') + ' are not available'));
          }

          const unavailableVideo = missingVideo.filter((name) => {
            return !((name in codecs) && codecs[name].canEncode && codecs[name].type === 'video');
          });
          if (unavailableVideo.length === 1) {
            return cb(new Error('Video codec ' + unavailableVideo[0] + ' is not available'));
          } else if (unavailableVideo.length > 1) {
            return cb(new Error('Video codecs ' + unavailableVideo.join(', ') + ' are not available'));
          }

          const unavailableSub = missingSub.filter((name) => {
            return !((name in codecs) && codecs[name].canEncode && codecs[name].type === 'subtitle');
          });
          if (unavailableSub.length === 1) {
            return cb(new Error('Subtitle codec ' + unavailableSub[0] + ' is not available'));
          } else if (unavailableSub.length > 1) {
            return cb(new Error('Subtitle codecs ' + unavailableSub.join(', ') + ' are not available'));
          }

          cb();
        });
      }
    ], callback);
  };
}
