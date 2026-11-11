import { createRequire } from 'module';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

import * as divx from '../presets/divx.js';
import * as flashvideo from '../presets/flashvideo.js';
import * as podcast from '../presets/podcast.js';

/*
 *! Miscellaneous methods
 */

// Presets shipped with the library, resolved without touching the file system
const builtinPresets = { divx, flashvideo, podcast };
const builtinPresetsDir = resolve(fileURLToPath(new URL('../presets', import.meta.url)));

// Presets from a custom folder are loaded synchronously, as before
const require = createRequire(import.meta.url);

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
      return this;
    }

    let modulePath;

    try {
      modulePath = join(this.options.presets, preset);

      const mod = resolve(this.options.presets) === builtinPresetsDir && Object.hasOwn(builtinPresets, preset)
        ? builtinPresets[preset]
        : require(modulePath);

      const load = typeof mod.load === 'function' ? mod.load : mod.default?.load;

      if (typeof load !== 'function') {
        throw new Error(`preset ${modulePath} has no load() function`);
      }

      load(this);
    } catch (err) {
      throw new Error(`preset ${modulePath} could not be loaded: ${err.message}`);
    }

    return this;
  };
}
