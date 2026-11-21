import fs from 'fs';
import { join, basename, extname, dirname } from 'path';
import { PassThrough } from 'stream';
import async from 'async';
import { timemarkToSeconds } from './utils.js';


/*
 * Useful recipes for commands
 */

export default function recipes(proto) {
  /**
   * Execute ffmpeg command and save output to a file
   *
   * @method FfmpegCommand#save
   * @category Processing
   * @aliases saveToFile
   *
   * @param {String} output file path
   * @return FfmpegCommand
   */
  proto.saveToFile =
  proto.save = function(output) {
    this.output(output).run();
    return this;
  };


  /**
   * Execute ffmpeg command, save output to a file, and return a Promise
   *
   * @method FfmpegCommand#saveAsync
   * @category Processing
   *
   * @param {String} output file path
   * @return {Promise<{stdout: String|null, stderr: String|null}>}
   */
  proto.saveAsync = function(output) {
    return this.output(output).runAsync();
  };


  /**
   * Execute ffmpeg command and save output to a stream
   *
   * If 'stream' is not specified, a PassThrough stream is created and returned.
   * 'options' will be used when piping ffmpeg output to the output stream
   * (@see http://nodejs.org/api/stream.html#stream_readable_pipe_destination_options)
   *
   * @method FfmpegCommand#pipe
   * @category Processing
   * @aliases stream,writeToStream
   *
   * @param {stream.Writable} [stream] output stream
   * @param {Object} [options={}] pipe options
   * @return Output stream
   */
  proto.writeToStream =
  proto.pipe =
  proto.stream = function(stream, options) {
    if (stream && (typeof stream !== 'object' || !('writable' in stream))) {
      options = stream;
      stream = undefined;
    }

    if (!stream) {
      if (process.version.match(/v0\.8\./)) {
        throw new Error('PassThrough stream is not supported on node v0.8');
      }

      stream = new PassThrough();
    }

    this.output(stream, options).run();
    return stream;
  };


  /**
   * Generate images from a video
   *
   * Note: this method makes the command emit a 'filenames' event with an array of
   * the generated image filenames.
   *
   * @method FfmpegCommand#screenshots
   * @category Processing
   * @aliases takeScreenshots,thumbnail,thumbnails,screenshot
   *
   * @param {Number|Object} [config=1] screenshot count or configuration object
   * @param {String} [folder] output folder (legacy alias for 'config.folder')
   * @return FfmpegCommand
   */
  proto.takeScreenshots =
  proto.thumbnail =
  proto.thumbnails =
  proto.screenshot =
  proto.screenshots = function(config, folder) {
    const self = this;

    if (!this._currentInput) {
      throw new Error('No input specified');
    }

    const source = this._currentInput.source;

    // Accept a number of screenshots instead of a config object; clone object to avoid mutating caller config
    if (typeof config === 'number') {
      config = { count: config };
    } else if (config && typeof config === 'object') {
      config = { ...config };
    } else {
      config = { count: 1 };
    }

    // Accept a second 'folder' parameter instead of config.folder
    if (!config.folder) {
      config.folder = folder || '.';
    }

    // Accept 'timestamps' instead of 'timemarks'
    if (config.timestamps !== undefined) {
      config.timemarks = config.timestamps;
    }

    // Compute timemarks from count if not present
    if (!config.timemarks) {
      if (!config.count) {
        throw new Error('Cannot take screenshots: neither a count nor a timemark list are specified');
      }

      const interval = 100 / (1 + config.count);
      config.timemarks = [];
      for (let i = 0; i < config.count; i++) {
        config.timemarks.push((interval * (i + 1)) + '%');
      }
    } else if (!Array.isArray(config.timemarks) || config.timemarks.length === 0) {
      throw new Error('Cannot take screenshots: neither a count nor a timemark list are specified');
    } else {
      config.timemarks = config.timemarks.slice();
    }

    // Parse size option
    let fixedSize, fixedWidth, fixedHeight, percentSize;
    if (config.size) {
      fixedSize = config.size.match(/^(\d+)x(\d+)$/);
      fixedWidth = config.size.match(/^(\d+)x\?$/);
      fixedHeight = config.size.match(/^\?x(\d+)$/);
      percentSize = config.size.match(/^(\d+(?:\.\d+)?)%$/);

      if (!fixedSize && !fixedWidth && !fixedHeight && !percentSize) {
        throw new Error('Invalid size parameter: ' + config.size);
      }
    }

    // Metadata helper
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

    async.waterfall([
      // Compute percent timemarks if any
      function computeTimemarks(next) {
        if (config.timemarks.some((t) => { return ('' + t).match(/^[\d.]+%$/); })) {
          if (typeof source !== 'string') {
            return next(new Error('Cannot compute screenshot timemarks with an input stream, please specify fixed timemarks'));
          }

          getMetadata((err, meta) => {
            if (err) {
              next(err);
            } else {
              // Select video stream with the highest resolution
              const vstream = meta.streams.reduce((biggest, stream) => {
                if (stream.codec_type === 'video' && stream.width * stream.height > biggest.width * biggest.height) {
                  return stream;
                } else {
                  return biggest;
                }
              }, { width: 0, height: 0 });

              if (vstream.width === 0) {
                return next(new Error('No video stream in input, cannot take screenshots'));
              }

              let duration = Number(vstream.duration);
              if (isNaN(duration)) {
                duration = Number(meta.format.duration);
              }

              if (isNaN(duration)) {
                return next(new Error('Could not get input duration, please specify fixed timemarks'));
              }

              config.timemarks = config.timemarks.map((mark) => {
                if (('' + mark).match(/^([\d.]+)%$/)) {
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
        }).sort((a, b) => { return a - b; });

        next();
      },

      // Add '_%i' to pattern when requesting multiple screenshots and no variable token is present
      function fixPattern(next) {
        let pattern = config.filename || 'tn.png';

        if (pattern.indexOf('.') === -1) {
          pattern += '.png';
        }

        if (config.timemarks.length > 1 && !pattern.match(/%(s|0*i)/)) {
          const ext = extname(pattern);
          pattern = join(dirname(pattern), basename(pattern, ext) + '_%i' + ext);
        }

        next(null, pattern);
      },

      // Replace filename tokens (%f, %b) in pattern
      function replaceFilenameTokens(pattern, next) {
        if (pattern.match(/%[bf]/)) {
          if (typeof source !== 'string') {
            return next(new Error('Cannot replace %f or %b when using an input stream'));
          }

          pattern = pattern
            .replace(/%f/g, basename(source))
            .replace(/%b/g, basename(source, extname(source)));
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
              return next(new Error('Could not determine video resolution to replace %w, %h or %r'));
            }

            const vstream = meta.streams.reduce((biggest, stream) => {
              if (stream.codec_type === 'video' && stream.width * stream.height > biggest.width * biggest.height) {
                return stream;
              } else {
                return biggest;
              }
            }, { width: 0, height: 0 });

            if (vstream.width === 0) {
              return next(new Error('No video stream in input, cannot replace %w, %h or %r'));
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
        pattern = pattern
          .replace(/%r/g, '%wx%h')
          .replace(/%w/g, width)
          .replace(/%h/g, height);

        next(null, pattern);
      },

      // Replace variable tokens in pattern (%s, %i) and generate filename list
      function replaceVariableTokens(pattern, next) {
        const filenames = config.timemarks.map((t, i) => {
          return pattern
            .replace(/%s/g, timemarkToSeconds(t))
            .replace(/%(0*)i/g, (match, padding) => {
              const idx = '' + (i + 1);
              return padding.slice(0, Math.max(0, padding.length + 1 - idx.length)) + idx;
            });
        });

        self.emit('filenames', filenames);
        next(null, filenames);
      },

      // Create output directory (supports nested directories and avoids EEXIST race)
      function createDirectory(filenames, next) {
        fs.mkdir(config.folder, { recursive: true }, (err) => {
          if (err) {
            next(err);
          } else {
            next(null, filenames);
          }
        });
      }
    ], function runCommand(err, filenames) {
      if (err) {
        return self.emit('error', err);
      }

      const count = config.timemarks.length;

      // Fast-seek mode: use keyframe input seeking (-noaccurate_seek -ss T -i source) per screenshot
      if (config.fastSeek && typeof source === 'string') {
        const baseInputIndex = self._inputs.length - 1;
        for (let i = 0; i < count; i++) {
          const inputIdx = baseInputIndex + i;
          if (i === 0) {
            self.inputOptions('-noaccurate_seek').seekInput(config.timemarks[i]);
          } else {
            self.input(source).inputOptions('-noaccurate_seek').seekInput(config.timemarks[i]);
          }

          self.output(join(config.folder, filenames[i]))
            .frames(1)
            .map(`${inputIdx}:v:0`);

          if (config.size) {
            self.size(config.size);
          }
        }

        self.run();
        return;
      }

      let split;
      let filters = [split = {
        filter: 'split',
        options: count,
        outputs: []
      }];

      if (config.size) {
        // Set size to generate size filters
        self.size(config.size);

        // Get size filters and chain them with 'sizeN' stream names
        const sizeFilters = self._currentOutput.sizeFilters.get().map((f, i) => {
          if (i > 0) {
            f.inputs = 'size' + (i - 1);
          }

          f.outputs = 'size' + i;

          return f;
        });

        // Input last size filter output into split filter
        split.inputs = 'size' + (sizeFilters.length - 1);

        // Add size filters in front of split filter
        filters = sizeFilters.concat(filters);

        // Remove size filters
        self._currentOutput.sizeFilters.clear();
      }

      let first = 0;
      for (let i = 0; i < count; i++) {
        const stream = 'screen' + i;
        split.outputs.push(stream);

        if (i === 0) {
          first = config.timemarks[i];
          if (config.fastSeek) {
            self.inputOptions('-noaccurate_seek');
          }
          self.seekInput(first);
        }

        self.output(join(config.folder, filenames[i]))
          .frames(1)
          .map(stream);

        if (i > 0) {
          self.seek(config.timemarks[i] - first);
        }
      }

      self.complexFilter(filters);
      self.run();
    });

    return this;
  };


  /**
   * Generate images from a video and return a Promise resolving to the generated filenames array.
   *
   * @method FfmpegCommand#screenshotsAsync
   * @category Processing
   *
   * @param {Number|Object} [config=1] screenshot count or configuration object
   * @param {String} [folder] output folder
   * @return {Promise<String[]>}
   */
  proto.screenshotsAsync = function(config, folder) {
    return new Promise((resolve, reject) => {
      let generatedFilenames = [];

      this
        .once('filenames', (filenames) => {
          generatedFilenames = filenames;
        })
        .once('end', () => {
          resolve(generatedFilenames);
        })
        .once('error', (err) => {
          reject(err);
        });

      try {
        this.screenshots(config, folder);
      } catch (err) {
        reject(err);
      }
    });
  };


  /**
   * Merge (concatenate) inputs to a single file
   *
   * @method FfmpegCommand#concat
   * @category Processing
   * @aliases concatenate,mergeToFile
   *
   * @param {String|Writable} target output file or writable stream
   * @param {Object} [options] pipe options (only used when outputting to a writable stream)
   * @return FfmpegCommand
   */
  proto.mergeToFile =
  proto.concatenate =
  proto.concat = function(target, options) {
    if (!this._inputs.length) {
      process.nextTick(() => this.emit('error', new Error('No input specified')));
      return this;
    }

    // Find out which streams are present in the first non-stream input
    const fileInput = this._inputs.filter((input) => {
      return !input.isStream;
    })[0];

    if (!fileInput) {
      process.nextTick(() => this.emit('error', new Error('Cannot concat without at least one non-stream input')));
      return this;
    }

    const pipeOpts = options && typeof options === 'object' ? options : undefined;

    const self = this;
    this.ffprobe(this._inputs.indexOf(fileInput), (err, data) => {
      if (err) {
        return self.emit('error', err);
      }

      const hasAudioStreams = data.streams.some((stream) => {
        return stream.codec_type === 'audio';
      });

      const hasVideoStreams = data.streams.some((stream) => {
        return stream.codec_type === 'video';
      });

      // Setup concat filter and start processing
      self.output(target, pipeOpts)
        .complexFilter({
          filter: 'concat',
          options: {
            n: self._inputs.length,
            v: hasVideoStreams ? 1 : 0,
            a: hasAudioStreams ? 1 : 0
          }
        })
        .run();
    });

    return this;
  };
}
