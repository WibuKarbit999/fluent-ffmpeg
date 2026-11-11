/**
 * Type definitions for fluent-ffmpeg (ESM modern fork)
 * @module fluent-ffmpeg
 */

/// <reference types="node" />

import { EventEmitter } from 'events';

// ───────────────────────── ffprobe ─────────────────────────

export interface FfprobeStream {
  index: number;
  codec_name?: string;
  codec_long_name?: string;
  profile?: string;
  codec_type?: 'video' | 'audio' | 'subtitle' | 'data' | 'attachment' | string;
  codec_tag_string?: string;
  codec_tag?: string;
  width?: number;
  height?: number;
  coded_width?: number;
  coded_height?: number;
  display_aspect_ratio?: string;
  sample_aspect_ratio?: string;
  pix_fmt?: string;
  level?: number;
  r_frame_rate?: string;
  avg_frame_rate?: string;
  time_base?: string;
  start_pts?: number;
  start_time?: number | string;
  duration_ts?: number;
  duration?: number | string;
  bit_rate?: number | string;
  nb_frames?: number | string;
  sample_fmt?: string;
  sample_rate?: number | string;
  channels?: number;
  channel_layout?: string;
  bits_per_sample?: number;
  tags?: Record<string, string>;
  disposition?: Record<string, number>;
  [key: string]: any;
}

export interface FfprobeFormat {
  filename?: string;
  nb_streams?: number;
  nb_programs?: number;
  format_name?: string;
  format_long_name?: string;
  start_time?: number | string;
  duration?: number | string;
  size?: number | string;
  bit_rate?: number | string;
  probe_score?: number;
  tags?: Record<string, string>;
  [key: string]: any;
}

export interface FfprobeData {
  streams: FfprobeStream[];
  format: FfprobeFormat;
  chapters: any[];
}

// ───────────────────────── events / options ─────────────────────────

export interface FfmpegProgress {
  frames: number;
  currentFps: number;
  currentKbps: number;
  targetSize: number;
  /** "hh:mm:ss.xx" */
  timemark: string;
  /** Hanya tersedia kalau durasi input diketahui */
  percent?: number;
}

export interface FfmpegCodecData {
  format: string;
  duration: string;
  audio: string;
  audio_details: string;
  video: string;
  video_details: string;
}

export interface FfmpegLogger {
  debug: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
}

export interface FfmpegCommandOptions {
  logger?: FfmpegLogger;
  /** Niceness proses ffmpeg (diabaikan di Windows) */
  niceness?: number;
  /** Alias `niceness` */
  priority?: number;
  /** Direktori preset */
  presets?: string;
  /** Alias `presets` */
  preset?: string;
  /** Maksimum baris output ffmpeg yang disimpan (0 = tanpa batas) */
  stdoutLines?: number;
  /** Timeout proses dalam detik */
  timeout?: number;
  /** Alias parameter `input` */
  source?: string | NodeJS.ReadableStream;
}

export interface FilterSpecification {
  filter: string;
  inputs?: string | string[];
  outputs?: string | string[];
  options?: string | string[] | Record<string, string | number | boolean>;
}

export interface ScreenshotsConfig {
  count?: number;
  /** Timemark(s): angka detik, "hh:mm:ss", atau persen ("50%") */
  timemarks?: Array<number | string> | string[];
  timestamps?: Array<number | string> | string[];
  /** Nama file, mendukung token %s %w %h %r %f %b %i */
  filename?: string;
  folder?: string;
  /** Contoh: "320x240", "50%", "?x240" */
  size?: string;
  fastSeek?: boolean;
}

export interface PipeOptions {
  end?: boolean;
}

// ───────────────────────── capabilities ─────────────────────────

export interface FfmpegFilterInfo {
  description: string;
  input: string;
  multipleInputs: boolean;
  output: string;
  multipleOutputs: boolean;
}

export interface FfmpegCodecInfo {
  type: 'audio' | 'video' | 'subtitle';
  description: string;
  canDecode: boolean;
  canEncode: boolean;
  drawHorizBand?: boolean;
  directRendering?: boolean;
  weirdFrameTruncation?: boolean;
  intraFrameOnly?: boolean;
  isLossy?: boolean;
  isLossless?: boolean;
}

export interface FfmpegEncoderInfo {
  type: 'audio' | 'video' | 'subtitle';
  description: string;
  frameMT: boolean;
  sliceMT: boolean;
  experimental: boolean;
  drawHorizBand: boolean;
  directRendering: boolean;
}

export interface FfmpegFormatInfo {
  description: string;
  canDemux: boolean;
  canMux: boolean;
}

type Callback<T> = (err: Error | null, result: T) => void;

// ───────────────────────── command ─────────────────────────

declare class FfmpegCommand extends EventEmitter {
  constructor(input?: string | NodeJS.ReadableStream | FfmpegCommandOptions, options?: FfmpegCommandOptions);

  // ---- events ----
  on(event: 'start', listener: (commandLine: string) => void): this;
  on(event: 'codecData', listener: (data: FfmpegCodecData) => void): this;
  on(event: 'progress', listener: (progress: FfmpegProgress) => void): this;
  on(event: 'stderr', listener: (line: string) => void): this;
  on(event: 'error', listener: (err: Error, stdout?: string | null, stderr?: string | null) => void): this;
  on(event: 'end', listener: (stdout?: string | null, stderr?: string | null) => void): this;
  on(event: 'filenames', listener: (filenames: string[]) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this;

  once(event: 'start', listener: (commandLine: string) => void): this;
  once(event: 'codecData', listener: (data: FfmpegCodecData) => void): this;
  once(event: 'progress', listener: (progress: FfmpegProgress) => void): this;
  once(event: 'stderr', listener: (line: string) => void): this;
  once(event: 'error', listener: (err: Error, stdout?: string | null, stderr?: string | null) => void): this;
  once(event: 'end', listener: (stdout?: string | null, stderr?: string | null) => void): this;
  once(event: 'filenames', listener: (filenames: string[]) => void): this;
  once(event: string | symbol, listener: (...args: any[]) => void): this;

  // ---- inputs ----
  input(source: string | NodeJS.ReadableStream): this;
  addInput(source: string | NodeJS.ReadableStream): this;
  mergeAdd(source: string | NodeJS.ReadableStream): this;
  inputFormat(format: string): this;
  withInputFormat(format: string): this;
  fromFormat(format: string): this;
  inputFps(fps: number): this;
  inputFPS(fps: number): this;
  withInputFps(fps: number): this;
  withInputFPS(fps: number): this;
  withFpsInput(fps: number): this;
  withFPSInput(fps: number): this;
  fpsInput(fps: number): this;
  FPSInput(fps: number): this;
  native(): this;
  nativeFramerate(): this;
  withNativeFramerate(): this;
  seekInput(seek: string | number): this;
  setStartTime(seek: string | number): this;
  loop(duration?: string | number): this;

  // ---- audio ----
  noAudio(): this;
  withNoAudio(): this;
  audioCodec(codec: string): this;
  withAudioCodec(codec: string): this;
  audioBitrate(bitrate: string | number): this;
  withAudioBitrate(bitrate: string | number): this;
  audioChannels(channels: number): this;
  withAudioChannels(channels: number): this;
  audioFrequency(freq: number): this;
  withAudioFrequency(freq: number): this;
  audioQuality(quality: number): this;
  withAudioQuality(quality: number): this;
  audioFilter(filters: string | string[] | FilterSpecification | FilterSpecification[]): this;
  audioFilters(filters: string | string[] | FilterSpecification | FilterSpecification[]): this;
  withAudioFilter(filters: string | string[] | FilterSpecification | FilterSpecification[]): this;
  withAudioFilters(filters: string | string[] | FilterSpecification | FilterSpecification[]): this;

  // ---- video ----
  noVideo(): this;
  withNoVideo(): this;
  videoCodec(codec: string): this;
  withVideoCodec(codec: string): this;
  videoBitrate(bitrate: string | number, constant?: boolean): this;
  withVideoBitrate(bitrate: string | number, constant?: boolean): this;
  videoFilter(filters: string | string[] | FilterSpecification | FilterSpecification[]): this;
  videoFilters(filters: string | string[] | FilterSpecification | FilterSpecification[]): this;
  withVideoFilter(filters: string | string[] | FilterSpecification | FilterSpecification[]): this;
  withVideoFilters(filters: string | string[] | FilterSpecification | FilterSpecification[]): this;
  fps(fps: number): this;
  FPS(fps: number): this;
  outputFps(fps: number): this;
  outputFPS(fps: number): this;
  withFps(fps: number): this;
  withFPS(fps: number): this;
  withOutputFps(fps: number): this;
  withOutputFPS(fps: number): this;
  withFpsOutput(fps: number): this;
  withFPSOutput(fps: number): this;
  fpsOutput(fps: number): this;
  FPSOutput(fps: number): this;
  frames(frames: number): this;
  takeFrames(frames: number): this;
  withFrames(frames: number): this;

  // ---- video size ----
  size(size: string): this;
  setSize(size: string): this;
  withSize(size: string): this;
  aspect(aspect: string | number): this;
  aspectRatio(aspect: string | number): this;
  setAspect(aspect: string | number): this;
  setAspectRatio(aspect: string | number): this;
  withAspect(aspect: string | number): this;
  withAspectRatio(aspect: string | number): this;
  autopad(pad?: boolean, color?: string): this;
  autoPad(pad?: boolean, color?: string): this;
  applyAutopad(pad?: boolean, color?: string): this;
  applyAutoPad(pad?: boolean, color?: string): this;
  applyAutopadding(pad?: boolean, color?: string): this;
  applyAutoPadding(pad?: boolean, color?: string): this;
  withAutopad(pad?: boolean, color?: string): this;
  withAutoPad(pad?: boolean, color?: string): this;
  withAutopadding(pad?: boolean, color?: string): this;
  withAutoPadding(pad?: boolean, color?: string): this;
  keepPixelAspect(keep?: boolean): this;
  keepDisplayAspect(keep?: boolean): this;
  keepDisplayAspectRatio(keep?: boolean): this;
  keepDAR(keep?: boolean): this;

  // ---- output ----
  output(target?: string | NodeJS.WritableStream, pipeopts?: PipeOptions): this;
  addOutput(target?: string | NodeJS.WritableStream, pipeopts?: PipeOptions): this;
  format(format: string): this;
  toFormat(format: string): this;
  outputFormat(format: string): this;
  withOutputFormat(format: string): this;
  duration(duration: string | number): this;
  setDuration(duration: string | number): this;
  withDuration(duration: string | number): this;
  seek(seek: string | number): this;
  seekOutput(seek: string | number): this;
  map(spec: string): this;
  flvmeta(): this;
  updateFlvMetadata(): this;

  // ---- custom options ----
  inputOption(...options: string[]): this;
  inputOptions(...options: Array<string | string[]>): this;
  addInputOption(...options: string[]): this;
  addInputOptions(...options: Array<string | string[]>): this;
  withInputOption(...options: string[]): this;
  withInputOptions(...options: Array<string | string[]>): this;
  outputOption(...options: string[]): this;
  outputOptions(...options: Array<string | string[]>): this;
  addOutputOption(...options: string[]): this;
  addOutputOptions(...options: Array<string | string[]>): this;
  addOption(...options: string[]): this;
  addOptions(...options: Array<string | string[]>): this;
  withOutputOption(...options: string[]): this;
  withOutputOptions(...options: Array<string | string[]>): this;
  withOption(...options: string[]): this;
  withOptions(...options: Array<string | string[]>): this;
  complexFilter(spec: string | Array<string | FilterSpecification>, map?: string | string[]): this;
  filterGraph(spec: string | Array<string | FilterSpecification>, map?: string | string[]): this;

  // ---- presets ----
  preset(preset: string | ((command: FfmpegCommand) => void)): this;
  usingPreset(preset: string | ((command: FfmpegCommand) => void)): this;

  // ---- processing ----
  run(): void;
  exec(): void;
  execute(): void;
  save(output: string): this;
  saveToFile(output: string): this;
  pipe(stream?: NodeJS.WritableStream, options?: PipeOptions): NodeJS.WritableStream;
  stream(stream?: NodeJS.WritableStream, options?: PipeOptions): NodeJS.WritableStream;
  writeToStream(stream?: NodeJS.WritableStream, options?: PipeOptions): NodeJS.WritableStream;
  screenshots(config?: number | ScreenshotsConfig, folder?: string): this;
  screenshot(config?: number | ScreenshotsConfig, folder?: string): this;
  thumbnails(config?: number | ScreenshotsConfig, folder?: string): this;
  thumbnail(config?: number | ScreenshotsConfig, folder?: string): this;
  takeScreenshots(config?: number | ScreenshotsConfig, folder?: string): this;
  /** Concat filter (re-encode). Semua input harus punya stream & parameter yang kompatibel. */
  mergeToFile(target: string | NodeJS.WritableStream, tmpFolder?: string | PipeOptions): this;
  concat(target: string | NodeJS.WritableStream, options?: string | PipeOptions): this;
  concatenate(target: string | NodeJS.WritableStream, options?: string | PipeOptions): this;
  renice(niceness?: number): this;
  kill(signal?: NodeJS.Signals | string): this;
  clone(): FfmpegCommand;

  // ---- ffprobe (instance) ----
  ffprobe(callback: Callback<FfprobeData>): void;
  ffprobe(index: number, callback: Callback<FfprobeData>): void;
  ffprobe(options: string[], callback: Callback<FfprobeData>): void;
  ffprobe(index: number, options: string[], callback: Callback<FfprobeData>): void;

  // ---- capabilities (instance) ----
  availableFilters(callback: Callback<Record<string, FfmpegFilterInfo>>): void;
  getAvailableFilters(callback: Callback<Record<string, FfmpegFilterInfo>>): void;
  availableCodecs(callback: Callback<Record<string, FfmpegCodecInfo>>): void;
  getAvailableCodecs(callback: Callback<Record<string, FfmpegCodecInfo>>): void;
  availableEncoders(callback: Callback<Record<string, FfmpegEncoderInfo>>): void;
  getAvailableEncoders(callback: Callback<Record<string, FfmpegEncoderInfo>>): void;
  availableFormats(callback: Callback<Record<string, FfmpegFormatInfo>>): void;
  getAvailableFormats(callback: Callback<Record<string, FfmpegFormatInfo>>): void;
  setFfmpegPath(path: string): this;
  setFfprobePath(path: string): this;
  setFlvtoolPath(path: string): this;

  // ---- statics ----
  static setFfmpegPath(path: string): void;
  static setFfprobePath(path: string): void;
  static setFlvtoolPath(path: string): void;
  static availableFilters(callback: Callback<Record<string, FfmpegFilterInfo>>): void;
  static getAvailableFilters(callback: Callback<Record<string, FfmpegFilterInfo>>): void;
  static availableCodecs(callback: Callback<Record<string, FfmpegCodecInfo>>): void;
  static getAvailableCodecs(callback: Callback<Record<string, FfmpegCodecInfo>>): void;
  static availableEncoders(callback: Callback<Record<string, FfmpegEncoderInfo>>): void;
  static getAvailableEncoders(callback: Callback<Record<string, FfmpegEncoderInfo>>): void;
  static availableFormats(callback: Callback<Record<string, FfmpegFormatInfo>>): void;
  static getAvailableFormats(callback: Callback<Record<string, FfmpegFormatInfo>>): void;
  static ffprobe(file: string, callback: Callback<FfprobeData>): void;
  static ffprobe(file: string, options: string[], callback: Callback<FfprobeData>): void;
}

/**
 * Default export bisa dipanggil tanpa `new` (Proxy), jadi:
 *   const cmd = ffmpeg('input.mp4')
 *   const cmd = new ffmpeg('input.mp4')   // juga valid
 */
declare const ffmpeg: typeof FfmpegCommand & {
  (input?: string | NodeJS.ReadableStream | FfmpegCommandOptions, options?: FfmpegCommandOptions): FfmpegCommand;
};

export type { FfmpegCommand };
export default ffmpeg;
