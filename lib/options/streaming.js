/*
 *! Modern adaptive streaming helpers (HLS, MPEG-DASH, CMAF)
 */

export default function(proto) {
  /**
   * Configure modern HLS output options (`-f hls` + `-hls_*` flags)
   *
   * @method FfmpegCommand#hls
   * @category Streaming
   *
   * @param {Object} [options={}] HLS muxer options
   * @param {Number} [options.time] target segment length in seconds (`-hls_time`)
   * @param {Number} [options.listSize] maximum number of playlist entries (`-hls_list_size`, 0 = all)
   * @param {String|String[]} [options.flags] HLS flags (`-hls_flags`, e.g. 'delete_segments+append_list' or ['independent_segments', 'temp_file'])
   * @param {String} [options.segmentType] segment format: `'mpegts'` or `'fmp4'` (`-hls_segment_type`)
   * @param {String} [options.segmentFilename] segment filename pattern (`-hls_segment_filename`)
   * @param {String} [options.fmp4InitFilename] fMP4 init segment filename (`-hls_fmp4_init_filename`)
   * @param {String} [options.playlistType] playlist type: `'event'` or `'vod'` (`-hls_playlist_type`)
   * @param {String} [options.baseUrl] base URL prepended to playlist entries (`-hls_base_url`)
   * @param {String} [options.keyInfoFile] AES encryption key info file (`-hls_key_info_file`)
   * @param {String} [options.masterPlName] master playlist filename (`-master_pl_name`)
   * @param {String} [options.varStreamMap] variant stream map for ABR (`-var_stream_map`)
   * @param {Number} [options.startNumber] initial sequence number (`-start_number`)
   * @param {Number} [options.initTime] initial segment length in seconds (`-hls_init_time`)
   * @param {Number} [options.deleteThreshold] unreferenced segments to keep on disk (`-hls_delete_threshold`)
   * @param {Boolean} [options.allowCache] explicitly set EXT-X-ALLOW-CACHE (`-hls_allow_cache`)
   * @return FfmpegCommand
   */
  proto.hls = function(options = {}) {
    this.format('hls');

    if (options.time !== undefined) {
      this._currentOutput.options('-hls_time', String(options.time));
    }
    if (options.initTime !== undefined) {
      this._currentOutput.options('-hls_init_time', String(options.initTime));
    }
    if (options.listSize !== undefined) {
      this._currentOutput.options('-hls_list_size', String(options.listSize));
    }
    if (options.flags !== undefined) {
      const flags = Array.isArray(options.flags) ? options.flags.join('+') : String(options.flags);
      this._currentOutput.options('-hls_flags', flags);
    }
    if (options.segmentType) {
      this._currentOutput.options('-hls_segment_type', options.segmentType);
    }
    if (options.segmentFilename) {
      this._currentOutput.options('-hls_segment_filename', options.segmentFilename);
    }
    if (options.fmp4InitFilename) {
      this._currentOutput.options('-hls_fmp4_init_filename', options.fmp4InitFilename);
    }
    if (options.playlistType) {
      this._currentOutput.options('-hls_playlist_type', options.playlistType);
    }
    if (options.baseUrl) {
      this._currentOutput.options('-hls_base_url', options.baseUrl);
    }
    if (options.keyInfoFile) {
      this._currentOutput.options('-hls_key_info_file', options.keyInfoFile);
    }
    if (options.masterPlName) {
      this._currentOutput.options('-master_pl_name', options.masterPlName);
    }
    if (options.varStreamMap) {
      this._currentOutput.options('-var_stream_map', options.varStreamMap);
    }
    if (options.startNumber !== undefined) {
      this._currentOutput.options('-start_number', String(options.startNumber));
    }
    if (options.deleteThreshold !== undefined) {
      this._currentOutput.options('-hls_delete_threshold', String(options.deleteThreshold));
    }
    if (options.allowCache !== undefined) {
      this._currentOutput.options('-hls_allow_cache', options.allowCache ? '1' : '0');
    }

    return this;
  };


  /**
   * Configure modern MPEG-DASH / CMAF / LL-DASH output options (`-f dash`)
   *
   * @method FfmpegCommand#dash
   * @category Streaming
   *
   * @param {Object} [options={}] DASH muxer options
   * @param {Number} [options.segDuration] segment duration in seconds (`-seg_duration`)
   * @param {Number} [options.windowSize] maximum segments kept in manifest (`-window_size`)
   * @param {Number} [options.extraWindowSize] extra segments kept outside manifest (`-extra_window_size`)
   * @param {String} [options.initSegName] init segment filename pattern (`-init_seg_name`)
   * @param {String} [options.mediaSegName] media segment filename pattern (`-media_seg_name`)
   * @param {Boolean} [options.useTemplate] use SegmentTemplate (`-use_template`)
   * @param {Boolean} [options.useTimeline] use SegmentTimeline (`-use_timeline`)
   * @param {String} [options.adaptationSets] adaptation set assignments (`-adaptation_sets`)
   * @param {Boolean} [options.singleFile] store all segments in one file (`-single_file`)
   * @param {Boolean} [options.streaming] enable chunk streaming (`-streaming`)
   * @param {Boolean} [options.ldash] enable Low-Latency DASH (`-ldash`)
   * @param {Boolean} [options.hlsPlaylist] also generate HLS playlists (CMAF dual output, `-hls_playlist`)
   * @param {String} [options.hlsMasterName] HLS master playlist name when `hlsPlaylist` is true (`-hls_master_name`)
   * @param {Boolean} [options.removeAtExit] remove all segments when finished (`-remove_at_exit`)
   * @return FfmpegCommand
   */
  proto.dash = function(options = {}) {
    this.format('dash');

    if (options.segDuration !== undefined) {
      this._currentOutput.options('-seg_duration', String(options.segDuration));
    }
    if (options.windowSize !== undefined) {
      this._currentOutput.options('-window_size', String(options.windowSize));
    }
    if (options.extraWindowSize !== undefined) {
      this._currentOutput.options('-extra_window_size', String(options.extraWindowSize));
    }
    if (options.initSegName) {
      this._currentOutput.options('-init_seg_name', options.initSegName);
    }
    if (options.mediaSegName) {
      this._currentOutput.options('-media_seg_name', options.mediaSegName);
    }
    if (options.useTemplate !== undefined) {
      this._currentOutput.options('-use_template', options.useTemplate ? '1' : '0');
    }
    if (options.useTimeline !== undefined) {
      this._currentOutput.options('-use_timeline', options.useTimeline ? '1' : '0');
    }
    if (options.adaptationSets) {
      this._currentOutput.options('-adaptation_sets', options.adaptationSets);
    }
    if (options.singleFile !== undefined) {
      this._currentOutput.options('-single_file', options.singleFile ? '1' : '0');
    }
    if (options.streaming !== undefined) {
      this._currentOutput.options('-streaming', options.streaming ? '1' : '0');
    }
    if (options.ldash !== undefined) {
      this._currentOutput.options('-ldash', options.ldash ? '1' : '0');
    }
    if (options.hlsPlaylist !== undefined) {
      this._currentOutput.options('-hls_playlist', options.hlsPlaylist ? '1' : '0');
    }
    if (options.hlsMasterName) {
      this._currentOutput.options('-hls_master_name', options.hlsMasterName);
    }
    if (options.removeAtExit !== undefined) {
      this._currentOutput.options('-remove_at_exit', options.removeAtExit ? '1' : '0');
    }

    return this;
  };
}
