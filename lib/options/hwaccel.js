/*
 *! Hardware acceleration methods (CUDA/NVENC, VAAPI, QSV, VideoToolbox, Vulkan, D3D11VA, etc.)
 */

export default function(proto) {
  /**
   * Specify hardware acceleration method for the last specified input
   *
   * @method FfmpegCommand#hwaccel
   * @category Hardware Acceleration
   * @aliases withHwaccel
   *
   * @param {String} method hardware acceleration method (e.g. 'cuda', 'vaapi', 'qsv', 'videotoolbox', 'vulkan', 'd3d11va', 'auto')
   * @return FfmpegCommand
   */
  proto.withHwaccel =
  proto.hwaccel = function(method) {
    if (!this._currentInput) {
      throw new Error('No input specified');
    }

    this._currentInput.options('-hwaccel', method);
    return this;
  };


  /**
   * Specify hardware acceleration device for the last specified input
   *
   * @method FfmpegCommand#hwaccelDevice
   * @category Hardware Acceleration
   * @aliases withHwaccelDevice
   *
   * @param {String|Number} device device path or index (e.g. '/dev/dri/renderD128', '0', 'cuda:0')
   * @return FfmpegCommand
   */
  proto.withHwaccelDevice =
  proto.hwaccelDevice = function(device) {
    if (!this._currentInput) {
      throw new Error('No input specified');
    }

    this._currentInput.options('-hwaccel_device', String(device));
    return this;
  };


  /**
   * Keep decoded frames in GPU/hardware memory in the specified pixel format
   *
   * @method FfmpegCommand#hwaccelOutputFormat
   * @category Hardware Acceleration
   * @aliases withHwaccelOutputFormat
   *
   * @param {String} format hardware pixel format (e.g. 'cuda', 'vaapi', 'qsv', 'videotoolbox_vld', 'vulkan')
   * @return FfmpegCommand
   */
  proto.withHwaccelOutputFormat =
  proto.hwaccelOutputFormat = function(format) {
    if (!this._currentInput) {
      throw new Error('No input specified');
    }

    this._currentInput.options('-hwaccel_output_format', format);
    return this;
  };


  /**
   * Initialise a new hardware device globally (`-init_hw_device`)
   *
   * @method FfmpegCommand#initHwDevice
   * @category Hardware Acceleration
   *
   * @param {String} spec hardware device specification (e.g. 'vaapi=va:/dev/dri/renderD128', 'vulkan=vk:0')
   * @return FfmpegCommand
   */
  proto.initHwDevice = function(spec) {
    this._global('-init_hw_device', spec);
    return this;
  };


  /**
   * Set the default hardware device for filtering (`-filter_hw_device`)
   *
   * @method FfmpegCommand#filterHwDevice
   * @category Hardware Acceleration
   *
   * @param {String} name name of an initialised hardware device
   * @return FfmpegCommand
   */
  proto.filterHwDevice = function(name) {
    this._global('-filter_hw_device', name);
    return this;
  };


  /**
   * Configure hardware acceleration options in a single call
   *
   * @method FfmpegCommand#hardwareAcceleration
   * @category Hardware Acceleration
   *
   * @param {Object} options hardware acceleration configuration
   * @param {String} [options.method] `-hwaccel` method for current input
   * @param {String|Number} [options.device] `-hwaccel_device` for current input
   * @param {String} [options.outputFormat] `-hwaccel_output_format` for current input
   * @param {String} [options.initDevice] global `-init_hw_device` spec
   * @param {String} [options.filterDevice] global `-filter_hw_device` name
   * @return FfmpegCommand
   */
  proto.hardwareAcceleration = function(options) {
    if (!options || typeof options !== 'object') {
      throw new Error('Hardware acceleration options must be an object');
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
    if (options.device !== undefined && options.device !== null) {
      this.hwaccelDevice(options.device);
    }
    if (options.outputFormat) {
      this.hwaccelOutputFormat(options.outputFormat);
    }

    return this;
  };
}
