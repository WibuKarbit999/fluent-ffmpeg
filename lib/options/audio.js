import { formatBitrate, makeFilterStrings } from '../utils.js';



/*
 *! Audio-related methods
 */

export default function(proto) {
  /**
   * Disable audio in the output
   *
   * @method FfmpegCommand#noAudio
   * @category Audio
   * @aliases withNoAudio
   * @return FfmpegCommand
   */
  proto.withNoAudio =
  proto.noAudio = function() {
    this._currentOutput.audio.clear();
    this._currentOutput.audioFilters.clear();
    this._currentOutput.audio('-an');

    return this;
  };


  /**
   * Specify audio codec
   *
   * @method FfmpegCommand#audioCodec
   * @category Audio
   * @aliases withAudioCodec
   *
   * @param {String} codec audio codec name
   * @return FfmpegCommand
   */
  proto.withAudioCodec =
  proto.audioCodec = function(codec) {
    this._currentOutput.audio('-acodec', codec);

    return this;
  };


  /**
   * Specify audio bitrate
   *
   * @method FfmpegCommand#audioBitrate
   * @category Audio
   * @aliases withAudioBitrate
   *
   * @param {String|Number} bitrate audio bitrate in kbps (with an optional 'k' suffix, or explicit unit like '1M')
   * @return FfmpegCommand
   */
  proto.withAudioBitrate =
  proto.audioBitrate = function(bitrate) {
    this._currentOutput.audio('-b:a', formatBitrate(bitrate));
    return this;
  };


  /**
   * Specify audio channel count
   *
   * @method FfmpegCommand#audioChannels
   * @category Audio
   * @aliases withAudioChannels
   *
   * @param {Number} channels channel count
   * @return FfmpegCommand
   */
  proto.withAudioChannels =
  proto.audioChannels = function(channels) {
    this._currentOutput.audio('-ac', channels);
    return this;
  };


  /**
   * Specify audio channel layout (`-channel_layout`, e.g. 'mono', 'stereo', '5.1', '7.1')
   *
   * @method FfmpegCommand#audioChannelLayout
   * @category Audio
   * @aliases withAudioChannelLayout
   *
   * @param {String} layout channel layout specifier
   * @return FfmpegCommand
   */
  proto.withAudioChannelLayout =
  proto.audioChannelLayout = function(layout) {
    this._currentOutput.audio('-channel_layout', layout);
    return this;
  };


  /**
   * Specify audio frequency
   *
   * @method FfmpegCommand#audioFrequency
   * @category Audio
   * @aliases withAudioFrequency
   *
   * @param {Number} freq audio frequency in Hz
   * @return FfmpegCommand
   */
  proto.withAudioFrequency =
  proto.audioFrequency = function(freq) {
    this._currentOutput.audio('-ar', freq);
    return this;
  };


  /**
   * Specify audio sample format (`-sample_fmt`, e.g. 's16', 's16p', 'fltp', 's32')
   *
   * @method FfmpegCommand#audioSampleFormat
   * @category Audio
   * @aliases withAudioSampleFormat
   *
   * @param {String} format audio sample format name
   * @return FfmpegCommand
   */
  proto.withAudioSampleFormat =
  proto.audioSampleFormat = function(format) {
    this._currentOutput.audio('-sample_fmt', format);
    return this;
  };


  /**
   * Specify audio encoder profile (`-profile:a`, e.g. 'aac_low', 'aac_he', 'aac_he_v2')
   *
   * @method FfmpegCommand#audioProfile
   * @category Audio
   * @aliases withAudioProfile
   *
   * @param {String} profile audio profile name
   * @return FfmpegCommand
   */
  proto.withAudioProfile =
  proto.audioProfile = function(profile) {
    this._currentOutput.audio('-profile:a', profile);
    return this;
  };


  /**
   * Specify audio codec fourcc/tag (`-tag:a`)
   *
   * @method FfmpegCommand#audioTag
   * @category Audio
   * @aliases withAudioTag
   *
   * @param {String} tag codec tag
   * @return FfmpegCommand
   */
  proto.withAudioTag =
  proto.audioTag = function(tag) {
    this._currentOutput.audio('-tag:a', tag);
    return this;
  };


  /**
   * Specify audio quality
   *
   * @method FfmpegCommand#audioQuality
   * @category Audio
   * @aliases withAudioQuality
   *
   * @param {Number} quality audio quality factor
   * @return FfmpegCommand
   */
  proto.withAudioQuality =
  proto.audioQuality = function(quality) {
    this._currentOutput.audio('-aq', quality);
    return this;
  };


  /**
   * Apply EBU R128 loudness normalization via the `loudnorm` audio filter
   *
   * @method FfmpegCommand#loudnessNormalize
   * @category Audio
   * @aliases loudnorm
   *
   * @param {Object} [options={}] loudnorm filter parameters
   * @param {Number} [options.integrated=-16] integrated loudness target in LUFS (`I`)
   * @param {Number} [options.truePeak=-1.5] maximum true peak in dBTP (`TP`)
   * @param {Number} [options.lra=11] loudness range target in LU (`LRA`)
   * @param {Number} [options.measuredI] measured integrated loudness (for 2-pass)
   * @param {Number} [options.measuredTP] measured true peak (for 2-pass)
   * @param {Number} [options.measuredLRA] measured LRA (for 2-pass)
   * @param {Number} [options.measuredThresh] measured threshold (for 2-pass)
   * @param {Number} [options.offset] offset gain (for 2-pass)
   * @param {Boolean} [options.linear] normalize linearly if possible
   * @param {Boolean} [options.dualMono] treat mono input files as dual-mono
   * @param {String} [options.printFormat] stats output format ('none', 'json', 'summary')
   * @return FfmpegCommand
   */
  proto.loudnorm =
  proto.loudnessNormalize = function(options = {}) {
    const filterOpts = {
      I: options.integrated !== undefined ? options.integrated : -16,
      TP: options.truePeak !== undefined ? options.truePeak : -1.5,
      LRA: options.lra !== undefined ? options.lra : 11
    };

    if (options.measuredI !== undefined) filterOpts.measured_I = options.measuredI;
    if (options.measuredTP !== undefined) filterOpts.measured_TP = options.measuredTP;
    if (options.measuredLRA !== undefined) filterOpts.measured_LRA = options.measuredLRA;
    if (options.measuredThresh !== undefined) filterOpts.measured_thresh = options.measuredThresh;
    if (options.offset !== undefined) filterOpts.offset = options.offset;
    if (options.linear !== undefined) filterOpts.linear = options.linear ? 'true' : 'false';
    if (options.dualMono !== undefined) filterOpts.dual_mono = options.dualMono ? 'true' : 'false';
    if (options.printFormat) filterOpts.print_format = options.printFormat;

    return this.audioFilters({ filter: 'loudnorm', options: filterOpts });
  };


  /**
   * Specify custom audio filter(s)
   *
   * Can be called both with one or many filters, or a filter array.
   *
   * @method FfmpegCommand#audioFilters
   * @aliases withAudioFilter,withAudioFilters,audioFilter
   * @category Audio
   *
   * @param {...String|String[]|Object[]} filters audio filter strings, string array or
   *   filter specification array, each with the following properties:
   * @param {String} filters.filter filter name
   * @param {String|String[]|Object} [filters.options] filter option string, array, or object
   * @return FfmpegCommand
   */
  proto.withAudioFilter =
  proto.withAudioFilters =
  proto.audioFilter =
  proto.audioFilters = function(filters) {
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
