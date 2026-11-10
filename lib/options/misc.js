/*jshint node:true*/
'use strict';

import { join } from 'path';

/*
 *! Miscellaneous methods
 */

export default function(proto) {
  /**
   * Use preset
   *
   * @method FfmpegCommand#preset
   * @category Miscellaneous
   * @aliases usingPreset
   *
   * @param {String|Function} preset preset name or preset function
   */
  proto.usingPreset =
  proto.preset = function(preset) {
    if (typeof preset === 'function') {
      preset(this);
    } else {
      try {
        const modulePath = join(this.options.presets, preset);
        
        // Use dynamic import for ESM
        const module = await import(modulePath);

        if (typeof module.default?.load === 'function') {
          module.default.load(this);
        } else if (typeof module.load === 'function') {
          module.load(this);
        } else {
          throw new Error('preset ' + modulePath + ' has no load() function');
        }
      } catch (err) {
        throw new Error('preset ' + modulePath + ' could not be loaded: ' + err.message);
      }
    }

    return this;
  };
};
