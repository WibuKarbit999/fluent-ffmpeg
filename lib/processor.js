import { spawn } from 'child_process';
import async from 'async';
import { extractCodecData, extractError, extractProgress, isWindows, linesRing, makeFilterStrings } from './utils.js';

/*
 *! Processor methods
 */

const codecArgFlags = new Set(['-acodec', '-vcodec', '-c:a', '-c:v', '-codec:a', '-codec:v']);


/**
 * Run ffprobe asynchronously and store data in command
 *
 * @param {FfmpegCommand} command
 * @private
 */
function runFfprobe(command) {
  const inputProbeIndex = 0;
  if (!command._inputs[inputProbeIndex] || command._inputs[inputProbeIndex].isStream) {
    // Don't probe missing inputs or input streams as this will consume them
    return;
  }
  command.ffprobe(inputProbeIndex, (err, data) => {
    if (!err && data) {
      command._ffprobeData = data;
    }
  });
}


export default function(proto) {
  /**
   * Spawn an ffmpeg process
   *
   * @method FfmpegCommand#_spawnFfmpeg
   * @param {Array} args ffmpeg command line argument list
   * @param {Object} [options] spawn options
   * @param {Function} [processCB] callback called with process object and stdout/stderr ring buffers when process has been created
   * @param {Function} endCB callback called with error (if applicable) and stdout/stderr ring buffers when process finished
   * @private
   */
  proto._spawnFfmpeg = function(args, options, processCB, endCB) {
    // Enable omitting options
    if (typeof options === 'function') {
      endCB = processCB;
      processCB = options;
      options = {};
    }

    // Enable omitting processCB
    if (typeof endCB === 'undefined') {
      endCB = processCB;
      processCB = function() {};
    }

    const maxLines = 'stdoutLines' in options ? options.stdoutLines : this.options.stdoutLines;

    let finished = false;
    function finish(err, stdoutRing, stderrRing) {
      if (!finished) {
        finished = true;
        endCB(err, stdoutRing, stderrRing);
      }
    }

    // Find ffmpeg
    this._getFfmpegPath((err, command) => {
      if (err) {
        return finish(err);
      } else if (!command || command.length === 0) {
        return finish(new Error('Cannot find ffmpeg'));
      }

      // Apply niceness without mutating caller's args array
      let spawnArgs = args;
      if (options.niceness && options.niceness !== 0 && !isWindows) {
        spawnArgs = ['-n', String(options.niceness), command, ...args];
        command = 'nice';
      }

      const stdoutRing = linesRing(maxLines);
      let stdoutClosed = false;

      const stderrRing = linesRing(maxLines);
      let stderrClosed = false;

      // Spawn process
      const ffmpegProc = spawn(command, spawnArgs, options);

      if (options.captureStdout && ffmpegProc.stdout) {
        ffmpegProc.stdout.setEncoding('utf8');
      }

      if (ffmpegProc.stderr) {
        ffmpegProc.stderr.setEncoding('utf8');
      }

      ffmpegProc.on('error', (err) => {
        finish(err, stdoutRing, stderrRing);
      });

      // Ensure we wait for captured streams to end before calling endCB
      let exitError = null;
      function handleExit(err) {
        if (err) {
          exitError = err;
        }

        if (processExited && (stdoutClosed || !options.captureStdout) && stderrClosed) {
          finish(exitError, stdoutRing, stderrRing);
        }
      }

      // Handle process exit
      let processExited = false;
      ffmpegProc.on('exit', (code, signal) => {
        processExited = true;

        if (signal) {
          handleExit(new Error('ffmpeg was killed with signal ' + signal));
        } else if (code) {
          handleExit(new Error('ffmpeg exited with code ' + code));
        } else {
          handleExit();
        }
      });

      // Capture stdout if specified
      if (options.captureStdout) {
        ffmpegProc.stdout.on('data', (data) => {
          stdoutRing.append(data);
        });

        ffmpegProc.stdout.on('close', () => {
          stdoutRing.close();
          stdoutClosed = true;
          handleExit();
        });
      }

      // Capture stderr
      ffmpegProc.stderr.on('data', (data) => {
        stderrRing.append(data);
      });

      ffmpegProc.stderr.on('close', () => {
        stderrRing.close();
        stderrClosed = true;
        handleExit();
      });

      // Call process callback
      processCB(ffmpegProc, stdoutRing, stderrRing);
    });
  };


  /**
   * Build the argument list for an ffmpeg command
   *
   * @method FfmpegCommand#_getArguments
   * @return argument list
   * @private
   */
  proto._getArguments = function() {
    const complexFilters = this._complexFilters.get();

    const fileOutput = this._outputs.some((output) => {
      return output.isFile;
    });

    const globalArgs = this._global.get();
    const hasExplicitOverwriteFlag = Boolean(this._global.find('-y') || this._global.find('-n'));

    return [].concat(
      // Inputs and input options
      this._inputs.reduce((args, input) => {
        const source = (typeof input.source === 'string') ? input.source : 'pipe:0';

        // For each input, add input options, then '-i <source>'
        return args.concat(
          input.options.get(),
          ['-i', source]
        );
      }, []),

      // Global options
      globalArgs,

      // Overwrite if we have file outputs and user did not explicitly pass -y / -n
      fileOutput && !hasExplicitOverwriteFlag ? ['-y'] : [],

      // Complex filters
      complexFilters,

      // Outputs, filters and output options
      this._outputs.reduce((args, output) => {
        const sizeFilters = makeFilterStrings(output.sizeFilters.get());
        const audioFilters = output.audioFilters.get();
        const videoFilters = output.videoFilters.get().concat(sizeFilters);
        let outputArg;

        if (!output.target) {
          outputArg = [];
        } else if (typeof output.target === 'string') {
          outputArg = [output.target];
        } else {
          outputArg = ['pipe:1'];
        }

        return args.concat(
          output.audio.get(),
          audioFilters.length ? ['-filter:a', audioFilters.join(',')] : [],
          output.video.get(),
          videoFilters.length ? ['-filter:v', videoFilters.join(',')] : [],
          output.options.get(),
          outputArg
        );
      }, [])
    );
  };


  /**
   * Return a shallow copy of the ffmpeg CLI argument list that will be executed.
   *
   * @method FfmpegCommand#getArguments
   * @category Processing
   *
   * @return {Array<String|Number>}
   */
  proto.getArguments = function() {
    return this._getArguments().slice();
  };


  /**
   * Prepare execution of an ffmpeg command
   *
   * Checks prerequisites for the execution of the command (codec/format availability, flvtool...),
   * then builds the argument list for ffmpeg and pass them to 'callback'.
   *
   * @method FfmpegCommand#_prepare
   * @param {Function} callback callback with signature (err, args)
   * @param {Boolean} [readMetadata=false] read metadata before processing
   * @private
   */
  proto._prepare = function(callback, readMetadata) {
    const self = this;

    async.waterfall([
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
          // Remove flvmeta flag on non-file output
          if (output.flags.flvmeta && !output.isFile) {
            self.logger.warn('Updating flv metadata is only supported for files');
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
              return cb(new Error('Cannot find flvtool2 or flvmeta'));
            }
            cb();
          });
        } else {
          cb();
        }
      },

      // Build argument list
      function(cb) {
        let args;
        try {
          args = self._getArguments();
        } catch (e) {
          return cb(e);
        }

        cb(null, args);
      },

      // Add "-strict experimental" option where needed
      function(args, cb) {
        self.availableEncoders((err, encoders) => {
          if (err) {
            return cb(err);
          }

          const hasStrict = args.indexOf('-strict') !== -1;

          for (let i = 0; i < args.length; i++) {
            if (codecArgFlags.has(args[i])) {
              i++;

              if (i < args.length && !hasStrict && (args[i] in encoders) && encoders[args[i]].experimental) {
                args.splice(i + 1, 0, '-strict', 'experimental');
                i += 2;
              }
            }
          }

          cb(null, args);
        });
      }
    ], callback);

    if (!readMetadata) {
      // Read metadata as soon as 'progress' listeners are added
      if (this.listeners('progress').length > 0) {
        // Read metadata in parallel
        runFfprobe(this);
      } else {
        // Watch for 'progress' listener without getting consumed by unrelated events
        const onNewListener = (event) => {
          if (event === 'progress') {
            this.removeListener('newListener', onNewListener);
            runFfprobe(this);
          }
        };
        const cleanupListener = () => {
          this.removeListener('newListener', onNewListener);
        };
        this.on('newListener', onNewListener);
        this.once('end', cleanupListener);
        this.once('error', cleanupListener);
      }
    }
  };


  /**
   * Run ffmpeg command
   *
   * @method FfmpegCommand#run
   * @category Processing
   * @aliases exec,execute
   * @return FfmpegCommand
   */
  proto.exec =
  proto.execute =
  proto.run = function() {
    const self = this;

    // Check if at least one output is present
    const outputPresent = this._outputs.some((output) => {
      return 'target' in output;
    });

    if (!outputPresent) {
      throw new Error('No output specified');
    }

    // Get output stream if any
    const outputStream = this._outputs.filter((output) => {
      return 'target' in output && typeof output.target !== 'string';
    })[0];

    // Get input stream if any
    const inputStream = this._inputs.filter((input) => {
      return typeof input.source !== 'string';
    })[0];

    const abortSignal = this.options.signal;
    let outputCloseTimer = null;
    let onAbort = null;

    // Ensure we send 'end' or 'error' only once
    let ended = false;
    function emitEnd(err, stdout, stderr) {
      if (!ended) {
        ended = true;

        if (outputCloseTimer) {
          clearTimeout(outputCloseTimer);
          outputCloseTimer = null;
        }

        if (abortSignal && onAbort) {
          abortSignal.removeEventListener('abort', onAbort);
          onAbort = null;
        }

        if (err) {
          self.emit('error', err, stdout, stderr);
        } else {
          self.emit('end', stdout, stderr);
        }
      }
    }

    // Handle pre-aborted AbortSignal
    if (abortSignal && abortSignal.aborted) {
      const abortErr = abortSignal.reason instanceof Error
        ? abortSignal.reason
        : new Error('ffmpeg process was aborted');
      abortErr.name = abortErr.name || 'AbortError';
      process.nextTick(() => emitEnd(abortErr));
      return this;
    }

    self._prepare((err, args) => {
      if (err) {
        return emitEnd(err);
      }

      if (abortSignal && abortSignal.aborted) {
        const abortErr = abortSignal.reason instanceof Error
          ? abortSignal.reason
          : new Error('ffmpeg process was aborted');
        return emitEnd(abortErr);
      }

      // Run ffmpeg
      self._spawnFfmpeg(
        args,
        {
          captureStdout: !outputStream,
          niceness: self.options.niceness,
          cwd: self.options.cwd,
          windowsHide: true
        },

        function processCB(ffmpegProc, stdoutRing, stderrRing) {
          self.ffmpegProc = ffmpegProc;
          self.emit('start', 'ffmpeg ' + args.join(' '));

          // Hook AbortSignal cancellation
          if (abortSignal) {
            onAbort = () => {
              const abortErr = abortSignal.reason instanceof Error
                ? abortSignal.reason
                : new Error('ffmpeg process was aborted');
              emitEnd(abortErr, stdoutRing ? stdoutRing.get() : null, stderrRing ? stderrRing.get() : null);
              ffmpegProc.kill();
            };

            if (abortSignal.aborted) {
              onAbort();
              return;
            }
            abortSignal.addEventListener('abort', onAbort, { once: true });
          }

          // Pipe input stream if any
          if (inputStream) {
            inputStream.source.on('error', (err) => {
              const reportingErr = new Error('Input stream error: ' + err.message);
              reportingErr.inputStreamError = err;
              emitEnd(reportingErr);
              ffmpegProc.kill();
            });

            inputStream.source.resume();
            inputStream.source.pipe(ffmpegProc.stdin);

            // Set stdin error handler on ffmpeg (prevents nodejs catching the error, but
            // ffmpeg will fail anyway, so no need to actually handle anything)
            ffmpegProc.stdin.on('error', () => {});
          }

          // Setup timeout if requested
          if (self.options.timeout) {
            self.processTimer = setTimeout(() => {
              const msg = 'process ran into a timeout (' + self.options.timeout + 's)';

              emitEnd(new Error(msg), stdoutRing ? stdoutRing.get() : null, stderrRing ? stderrRing.get() : null);
              ffmpegProc.kill();
            }, self.options.timeout * 1000);
          }


          if (outputStream) {
            // Prevent unhandled EPIPE on premature output stream close
            ffmpegProc.stdout.on('error', () => {});

            // Pipe ffmpeg stdout to output stream
            ffmpegProc.stdout.pipe(outputStream.target, outputStream.pipeopts);

            // Handle output stream events
            outputStream.target.on('close', () => {
              if (ended) {
                return;
              }
              self.logger.debug('Output stream closed, scheduling kill for ffmpeg process');

              // Don't kill process yet, to give a chance to ffmpeg to
              // terminate successfully first. This is necessary because
              // under load, the process 'exit' event sometimes happens
              // after the output stream 'close' event.
              outputCloseTimer = setTimeout(() => {
                outputCloseTimer = null;
                if (!ended) {
                  emitEnd(new Error('Output stream closed'));
                  ffmpegProc.kill();
                }
              }, 20);
            });

            outputStream.target.on('error', (err) => {
              self.logger.debug('Output stream error, killing ffmpeg process');
              const reportingErr = new Error('Output stream error: ' + err.message);
              reportingErr.outputStreamError = err;
              emitEnd(reportingErr, stdoutRing ? stdoutRing.get() : null, stderrRing ? stderrRing.get() : null);
              ffmpegProc.kill('SIGKILL');
            });
          }

          // Setup stderr handling
          if (stderrRing) {

            // 'stderr' event
            if (self.listeners('stderr').length) {
              stderrRing.callback((line) => {
                self.emit('stderr', line);
              });
            }

            // 'codecData' event
            if (self.listeners('codecData').length) {
              let codecDataSent = false;
              const codecObject = {};

              stderrRing.callback((line) => {
                if (!codecDataSent)
                  codecDataSent = extractCodecData(self, line, codecObject);
              });
            }

            // 'progress' event
            if (self.listeners('progress').length) {
              stderrRing.callback((line) => {
                extractProgress(self, line);
              });
            }
          }
        },

        function endCB(err, stdoutRing, stderrRing) {
          clearTimeout(self.processTimer);
          delete self.ffmpegProc;

          const stdoutStr = stdoutRing ? stdoutRing.get() : null;
          const stderrStr = stderrRing ? stderrRing.get() : null;

          if (err) {
            if (err.message.match(/ffmpeg exited with code/) && stderrStr) {
              // Add ffmpeg error message
              err.message += ': ' + extractError(stderrStr);
            }

            emitEnd(err, stdoutStr, stderrStr);
          } else {
            // Find out which outputs need flv metadata
            const flvmeta = self._outputs.filter((output) => {
              return output.flags.flvmeta;
            });

            if (flvmeta.length) {
              self._getFlvtoolPath((err, flvtool) => {
                if (err) {
                  return emitEnd(err);
                }
                if (!flvtool) {
                  return emitEnd(new Error('Cannot find flvtool2 or flvmeta'));
                }

                async.each(
                  flvmeta,
                  (output, cb) => {
                    spawn(flvtool, ['-U', output.target], { windowsHide: true })
                      .on('error', (err) => {
                        cb(new Error('Error running ' + flvtool + ' on ' + output.target + ': ' + err.message));
                      })
                      .on('exit', (code, signal) => {
                        if (code !== 0 || signal) {
                          cb(
                            new Error(flvtool + ' ' +
                              (signal ? 'received signal ' + signal
                                : 'exited with code ' + code)) +
                              ' when running on ' + output.target
                          );
                        } else {
                          cb();
                        }
                      });
                  },
                  (err) => {
                    if (err) {
                      emitEnd(err);
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


  /**
   * Run ffmpeg command and return a Promise that resolves on completion
   * with `{ stdout, stderr }` or rejects on error.
   *
   * @method FfmpegCommand#runAsync
   * @category Processing
   * @aliases execAsync
   *
   * @return {Promise<{stdout: String|null, stderr: String|null}>}
   */
  proto.execAsync =
  proto.runAsync = function() {
    return new Promise((resolve, reject) => {
      this
        .once('end', (stdout, stderr) => {
          resolve({ stdout: stdout ?? null, stderr: stderr ?? null });
        })
        .once('error', (err) => {
          reject(err);
        });

      try {
        this.run();
      } catch (err) {
        reject(err);
      }
    });
  };


  /**
   * Renice current and/or future ffmpeg processes
   *
   * Ignored on Windows platforms.
   *
   * @method FfmpegCommand#renice
   * @category Processing
   *
   * @param {Number} [niceness=0] niceness value between -20 (highest priority) and 20 (lowest priority)
   * @return FfmpegCommand
   */
  proto.renice = function(niceness) {
    if (!isWindows) {
      niceness = niceness || 0;

      if (niceness < -20 || niceness > 20) {
        this.logger.warn('Invalid niceness value: ' + niceness + ', must be between -20 and 20');
      }

      niceness = Math.min(20, Math.max(-20, niceness));
      this.options.niceness = niceness;

      if (this.ffmpegProc) {
        const logger = this.logger;
        const pid = this.ffmpegProc.pid;
        const renice = spawn('renice', [String(niceness), '-p', String(pid)], { windowsHide: true });

        renice.on('error', (err) => {
          logger.warn('could not renice process ' + pid + ': ' + err.message);
        });

        renice.on('exit', (code, signal) => {
          if (signal) {
            logger.warn('could not renice process ' + pid + ': renice was killed by signal ' + signal);
          } else if (code) {
            logger.warn('could not renice process ' + pid + ': renice exited with ' + code);
          } else {
            logger.info('successfully reniced process ' + pid + ' to ' + niceness + ' niceness');
          }
        });
      }
    }

    return this;
  };


  /**
   * Kill current ffmpeg process, if any
   *
   * @method FfmpegCommand#kill
   * @category Processing
   *
   * @param {String} [signal=SIGKILL] signal name
   * @return FfmpegCommand
   */
  proto.kill = function(signal) {
    if (!this.ffmpegProc) {
      this.logger.warn('No running ffmpeg process, cannot send signal');
    } else {
      this.ffmpegProc.kill(signal || 'SIGKILL');
    }

    return this;
  };
}
