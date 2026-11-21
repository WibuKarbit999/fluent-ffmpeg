import { formatMapSpec, makeFilterStrings } from '../utils.js';



/*
 *! Custom & global options methods
 */

export default function(proto) {
  /**
   * Add custom input option(s)
   *
   * When passing a single string or an array, each string containing two
   * words is split (eg. inputOptions('-option value') is supported) for
   * compatibility reasons.  This is not the case when passing more than
   * one argument.
   *
   * @method FfmpegCommand#inputOptions
   * @category Custom options
   * @aliases addInputOption,addInputOptions,withInputOption,withInputOptions,inputOption
   *
   * @param {...String} options option string(s) or string array
   * @return FfmpegCommand
   */
  proto.addInputOption =
  proto.addInputOptions =
  proto.withInputOption =
  proto.withInputOptions =
  proto.inputOption =
  proto.inputOptions = function(options) {
    if (!this._currentInput) {
      throw new Error('No input specified');
    }

    let doSplit = true;

    if (arguments.length > 1) {
      options = [].slice.call(arguments);
      doSplit = false;
    }

    if (!Array.isArray(options)) {
      options = [options];
    }

    this._currentInput.options(options.reduce((options, option) => {
      const split = String(option).split(' ');

      if (doSplit && split.length === 2) {
        options.push(split[0], split[1]);
      } else {
        options.push(option);
      }

      return options;
    }, []));
    return this;
  };


  /**
   * Add custom output option(s)
   *
   * @method FfmpegCommand#outputOptions
   * @category Custom options
   * @aliases addOutputOption,addOutputOptions,addOption,addOptions,withOutputOption,withOutputOptions,withOption,withOptions,outputOption
   *
   * @param {...String} options option string(s) or string array
   * @return FfmpegCommand
   */
  proto.addOutputOption =
  proto.addOutputOptions =
  proto.addOption =
  proto.addOptions =
  proto.withOutputOption =
  proto.withOutputOptions =
  proto.withOption =
  proto.withOptions =
  proto.outputOption =
  proto.outputOptions = function(options) {
    let doSplit = true;

    if (arguments.length > 1) {
      options = [].slice.call(arguments);
      doSplit = false;
    }

    if (!Array.isArray(options)) {
      options = [options];
    }

    this._currentOutput.options(options.reduce((options, option) => {
      const split = String(option).split(' ');

      if (doSplit && split.length === 2) {
        options.push(split[0], split[1]);
      } else {
        options.push(option);
      }

      return options;
    }, []));
    return this;
  };


  /**
   * Add global ffmpeg option(s) (placed in the global options section, e.g. `-loglevel`, `-hide_banner`, `-nostdin`)
   *
   * @method FfmpegCommand#globalOptions
   * @category Custom options
   * @aliases globalOption,addGlobalOption,addGlobalOptions,withGlobalOption,withGlobalOptions
   *
   * @param {...String} options option string(s) or string array
   * @return FfmpegCommand
   */
  proto.addGlobalOption =
  proto.addGlobalOptions =
  proto.withGlobalOption =
  proto.withGlobalOptions =
  proto.globalOption =
  proto.globalOptions = function(options) {
    let doSplit = true;

    if (arguments.length > 1) {
      options = [].slice.call(arguments);
      doSplit = false;
    }

    if (!Array.isArray(options)) {
      options = [options];
    }

    this._global(options.reduce((acc, option) => {
      const split = String(option).split(' ');

      if (doSplit && split.length === 2) {
        acc.push(split[0], split[1]);
      } else {
        acc.push(option);
      }

      return acc;
    }, []));

    return this;
  };


  /**
   * Set FFmpeg logging level (`-loglevel`)
   *
   * @method FfmpegCommand#logLevel
   * @category Custom options
   *
   * @param {String} level one of 'quiet', 'panic', 'fatal', 'error', 'warning', 'info', 'verbose', 'debug', 'trace'
   * @return FfmpegCommand
   */
  proto.logLevel = function(level) {
    this._global('-loglevel', String(level));
    return this;
  };


  /**
   * Suppress FFmpeg version/configuration banner (`-hide_banner`)
   *
   * @method FfmpegCommand#hideBanner
   * @category Custom options
   *
   * @return FfmpegCommand
   */
  proto.hideBanner = function() {
    this._global('-hide_banner');
    return this;
  };


  /**
   * Disable interactive stdin reading (`-nostdin`)
   *
   * @method FfmpegCommand#noStdin
   * @category Custom options
   * @aliases nostdin
   *
   * @return FfmpegCommand
   */
  proto.nostdin =
  proto.noStdin = function() {
    this._global('-nostdin');
    return this;
  };


  /**
   * Control whether FFmpeg overwrites existing output files (`-y` vs `-n`)
   *
   * @method FfmpegCommand#overwrite
   * @category Custom options
   *
   * @param {Boolean} [enabled=true] `true` to overwrite (`-y`), `false` to fail if file exists (`-n`)
   * @return FfmpegCommand
   */
  proto.overwrite = function(enabled = true) {
    this._global.remove('-y');
    this._global.remove('-n');
    this._global(enabled ? '-y' : '-n');
    return this;
  };


  /**
   * Set FFmpeg thread count (`-threads`, 0 = optimal automatic threads)
   *
   * @method FfmpegCommand#threads
   * @category Custom options
   *
   * @param {Number} count number of threads (0 = auto)
   * @return FfmpegCommand
   */
  proto.threads = function(count) {
    this._currentOutput.options('-threads', String(count));
    return this;
  };


  /**
   * Specify a complex filtergraph
   *
   * Calling this method will override any previously set filtergraph, but you can set
   * as many filters as needed in one call.
   *
   * @method FfmpegCommand#complexFilter
   * @category Custom options
   * @aliases filterGraph
   *
   * @param {String|Array} spec filtergraph string or array of filter specification
   *   objects
   * @param {String|Array} [map] (array of) stream specifier(s) or pad labels to include in output
   * @return FfmpegCommand
   */
  proto.filterGraph =
  proto.complexFilter = function(spec, map) {
    this._complexFilters.clear();

    if (!Array.isArray(spec)) {
      spec = [spec];
    }

    this._complexFilters('-filter_complex', makeFilterStrings(spec).join(';'));

    if (Array.isArray(map)) {
      const self = this;
      map.forEach((streamSpec) => {
        self._complexFilters('-map', formatMapSpec(streamSpec));
      });
    } else if (typeof map === 'string') {
      this._complexFilters('-map', formatMapSpec(map));
    }

    return this;
  };
}
