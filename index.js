import ffmpeg, { FfmpegCommand } from './lib/fluent-ffmpeg.js';

export { FfmpegCommand };
export const {
  setFfmpegPath,
  setFfprobePath,
  setFlvtoolPath,
  availableFilters,
  getAvailableFilters,
  availableCodecs,
  getAvailableCodecs,
  availableEncoders,
  getAvailableEncoders,
  availableDecoders,
  getAvailableDecoders,
  availableFormats,
  getAvailableFormats,
  availableHwaccels,
  getAvailableHwaccels,
  availablePixelFormats,
  getAvailablePixelFormats,
  availableBitstreamFilters,
  getAvailableBitstreamFilters,
  availableProtocols,
  getAvailableProtocols,
  ffmpegVersion,
  getFfmpegVersion,
  ffprobe
} = ffmpeg;

export default ffmpeg;
