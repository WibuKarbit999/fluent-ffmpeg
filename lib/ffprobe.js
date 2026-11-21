import { spawn } from 'child_process';

function legacyTag(key) { return key.match(/^TAG:/); }
function legacyDisposition(key) { return key.match(/^DISPOSITION:/); }

function parseFfprobeOutput(out) {
  const trimmed = out.trimStart();
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(out);
      if (parsed && typeof parsed === 'object') {
        return {
          streams: parsed.streams || [],
          format: parsed.format || {},
          chapters: parsed.chapters || [],
          ...parsed
        };
      }
    } catch {
      // Fall back to default INI-like parser
    }
  }

  const lines = out.split(/\r\n|\r|\n/);

  const filteredLines = lines.filter((line) => {
    return line.length > 0;
  });

  const data = {
    streams: [],
    format: {},
    chapters: []
  };

  function parseBlock(name) {
    const blockData = {};

    let line = filteredLines.shift();
    while (typeof line !== 'undefined') {
      if (line.toLowerCase() === '[/' + name + ']') {
        return blockData;
      } else if (line.match(/^\[/)) {
        const nestedMatch = line.match(/^\[([a-z0-9_]+)\]$/i);
        if (nestedMatch) {
          const nestedName = nestedMatch[1].toLowerCase();
          const nestedBlock = parseBlock(nestedName);
          if (nestedName === 'side_data') {
            blockData.side_data_list = blockData.side_data_list || [];
            blockData.side_data_list.push(nestedBlock);
          } else {
            blockData[nestedName] = blockData[nestedName] || [];
            blockData[nestedName].push(nestedBlock);
          }
        }
        line = filteredLines.shift();
        continue;
      }

      const kv = line.match(/^([^=]+)=(.*)$/);
      if (kv) {
        if (!(kv[1].match(/^TAG:/)) && kv[2].match(/^-?[0-9]+(\.[0-9]+)?$/)) {
          blockData[kv[1]] = Number(kv[2]);
        } else {
          blockData[kv[1]] = kv[2];
        }
      }

      line = filteredLines.shift();
    }

    return blockData;
  }

  let line = filteredLines.shift();
  while (typeof line !== 'undefined') {
    if (line.match(/^\[stream\]$/i)) {
      const stream = parseBlock('stream');
      data.streams.push(stream);
    } else if (line.match(/^\[chapter\]$/i)) {
      const chapter = parseBlock('chapter');
      data.chapters.push(chapter);
    } else if (line.toLowerCase() === '[format]') {
      data.format = parseBlock('format');
    } else if (line.match(/^\[program\]$/i)) {
      data.programs = data.programs || [];
      data.programs.push(parseBlock('program'));
    } else if (line.match(/^\[frame\]$/i)) {
      data.frames = data.frames || [];
      data.frames.push(parseBlock('frame'));
    } else if (line.match(/^\[packet\]$/i)) {
      data.packets = data.packets || [];
      data.packets.push(parseBlock('packet'));
    }

    line = filteredLines.shift();
  }

  return data;
}



export default function(proto) {
  /**
   * Run ffprobe on last specified input (or input at `index`).
   *
   * Supports both callback style and Promise style (when `callback` is omitted).
   *
   * @method FfmpegCommand#ffprobe
   * @category Metadata
   *
   * @param {?Number} [index] 0-based index of input to probe (defaults to last input)
   * @param {?String[]} [options] array of output options to return
   * @param {FfmpegCommand~ffprobeCallback} [callback] callback function (omit to return a Promise)
   * @return {Promise|undefined}
   */
  proto.ffprobe = function() {
    const argsList = Array.from(arguments);
    let callback = null;

    if (argsList.length > 0 && typeof argsList[argsList.length - 1] === 'function') {
      callback = argsList.pop();
    }

    let input, index = null, options = [];

    if (argsList.length >= 2) {
      index = argsList[0];
      options = argsList[1] || [];
    } else if (argsList.length === 1) {
      if (typeof argsList[0] === 'number') {
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
          return handleCallback(new Error('No input specified'));
        }

        input = this._currentInput;
      } else {
        input = this._inputs[index];

        if (!input) {
          return handleCallback(new Error('Invalid input index'));
        }
      }

      // Find ffprobe
      this._getFfprobePath((err, path) => {
        if (err) {
          return handleCallback(err);
        } else if (!path) {
          return handleCallback(new Error('Cannot find ffprobe'));
        }

        let stdout = '';
        let stdoutClosed = false;
        let stderr = '';
        let stderrClosed = false;

        // Spawn ffprobe
        const src = input.isStream ? 'pipe:0' : input.source;
        const ffprobe = spawn(path, ['-show_streams', '-show_format'].concat(options, src), { windowsHide: true });

        if (ffprobe.stdout) {
          ffprobe.stdout.setEncoding('utf8');
        }
        if (ffprobe.stderr) {
          ffprobe.stderr.setEncoding('utf8');
        }

        if (input.isStream) {
          // Skip errors on stdin. These get thrown when ffprobe is complete and
          // there seems to be no way hook in and close stdin before it throws.
          ffprobe.stdin.on('error', (err) => {
            if (['ECONNRESET', 'EPIPE', 'EOF'].indexOf(err.code) >= 0) { return; }
            handleCallback(err);
          });

          // Once ffprobe's input stream closes, we need no more data from the input
          ffprobe.stdin.on('close', () => {
            input.source.pause();
            input.source.unpipe(ffprobe.stdin);
          });

          input.source.pipe(ffprobe.stdin);
        }

        ffprobe.on('error', handleCallback);

        // Ensure we wait for captured streams to end before calling callback
        let exitError = null;
        function handleExit(err) {
          if (err) {
            exitError = err;
          }

          if (processExited && stdoutClosed && stderrClosed) {
            if (exitError) {
              if (stderr) {
                exitError.message += '\n' + stderr;
              }

              return handleCallback(exitError);
            }

            // Process output
            const data = parseFfprobeOutput(stdout);

            // Handle legacy output with "TAG:x" and "DISPOSITION:x" keys
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

        // Handle ffprobe exit
        let processExited = false;
        ffprobe.on('exit', (code, signal) => {
          processExited = true;

          if (code) {
            handleExit(new Error('ffprobe exited with code ' + code));
          } else if (signal) {
            handleExit(new Error('ffprobe was killed with signal ' + signal));
          } else {
            handleExit();
          }
        });

        // Handle stdout/stderr streams
        ffprobe.stdout.on('data', (data) => {
          stdout += data;
        });

        ffprobe.stdout.on('close', () => {
          stdoutClosed = true;
          handleExit();
        });

        ffprobe.stderr.on('data', (data) => {
          stderr += data;
        });

        ffprobe.stderr.on('close', () => {
          stderrClosed = true;
          handleExit();
        });
      });
    };

    if (callback) {
      execute(callback);
      return;
    }

    return new Promise((resolve, reject) => {
      execute((err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  };
}
