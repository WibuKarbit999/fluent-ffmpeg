/**
 * CommonJS TypeScript definitions for @wibukarbitt/fluent-ffmpeg
 * Supports:
 *   const ffmpeg = require('@wibukarbitt/fluent-ffmpeg');
 *   import ffmpeg = require('@wibukarbitt/fluent-ffmpeg');
 *   import ffmpeg, { FfmpegCommand, ffprobe } from '@wibukarbitt/fluent-ffmpeg';
 */

/// <reference types="node" />

import type { ChildProcess } from 'child_process';
import type { EventEmitter } from 'events';
import type { PassThrough } from 'stream';

declare function ffmpeg(
  input?: string | NodeJS.ReadableStream | ffmpeg.FfmpegCommandOptions,
  options?: ffmpeg.FfmpegCommandOptions
): ffmpeg.FfmpegCommand;

declare class ffmpeg extends EventEmitter {
  options: ffmpeg.FfmpegCommandOptions;
  logger: ffmpeg.FfmpegLogger;
  ffmpegProc?: ChildProcess;

  constructor(
    input?: string | NodeJS.ReadableStream | ffmpeg.FfmpegCommandOptions,
    options?: ffmpeg.FfmpegCommandOptions
  );

  // ---- events ----
  on(event: 'start', listener: (commandLine: string) => void): this;
  on(event: 'codecData', listener: (data: ffmpeg.FfmpegCodecData, ...extraInputs: ffmpeg.FfmpegCodecData[]) => void): this;
  on(event: 'progress', listener: (progress: ffmpeg.FfmpegProgress) => void): this;
  on(event: 'stderr', listener: (line: string) => void): this;
  on(event: 'error', listener: (err: Error, stdout?: string | null, stderr?: string | null) => void): this;
  on(event: 'end', listener: (stdout?: string | null, stderr?: string | null) => void): this;
  on(event: 'filenames', listener: (filenames: string[]) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this;

  once(event: 'start', listener: (commandLine: string) => void): this;
  once(event: 'codecData', listener: (data: ffmpeg.FfmpegCodecData, ...extraInputs: ffmpeg.FfmpegCodecData[]) => void): this;
  once(event: 'progress', listener: (progress: ffmpeg.FfmpegProgress) => void): this;
  once(event: 'stderr', listener: (line: string) => void): this;
  once(event: 'error', listener: (err: Error, stdout?: string | null, stderr?: string | null) => void): this;
  once(event: 'end', listener: (stdout?: string | null, stderr?: string | null) => void): this;
  once(event: 'filenames', listener: (filenames: string[]) => void): this;
  once(event: string | symbol, listener: (...args: any[]) => void): this;

  addListener(event: 'start', listener: (commandLine: string) => void): this;
  addListener(event: 'codecData', listener: (data: ffmpeg.FfmpegCodecData, ...extraInputs: ffmpeg.FfmpegCodecData[]) => void): this;
  addListener(event: 'progress', listener: (progress: ffmpeg.FfmpegProgress) => void): this;
  addListener(event: 'stderr', listener: (line: string) => void): this;
  addListener(event: 'error', listener: (err: Error, stdout?: string | null, stderr?: string | null) => void): this;
  addListener(event: 'end', listener: (stdout?: string | null, stderr?: string | null) => void): this;
  addListener(event: 'filenames', listener: (filenames: string[]) => void): this;
  addListener(event: string | symbol, listener: (...args: any[]) => void): this;

  // ---- inputs ----
  input(source: string | NodeJS.ReadableStream): this;
  addInput(source: string | NodeJS.ReadableStream): this;
  mergeAdd(source: string | NodeJS.ReadableStream): this;
  inputFormat(format: string): this;
  withInputFormat(format: string): this;
  fromFormat(format: string): this;
  inputFps(fps: number | string): this;
  inputFPS(fps: number | string): this;
  withInputFps(fps: number | string): this;
  withInputFPS(fps: number | string): this;
  withFpsInput(fps: number | string): this;
  withFPSInput(fps: number | string): this;
  fpsInput(fps: number | string): this;
  FPSInput(fps: number | string): this;
  native(): this;
  nativeFramerate(): this;
  withNativeFramerate(): this;
  seekInput(seek: string | number): this;
  setStartTime(seek: string | number): this;
  inputTo(position: string | number): this;
  loop(duration?: string | number): this;
  streamLoop(count?: number): this;
  headers(headers: Record<string, string> | string): this;
  userAgent(ua: string): this;
  reconnect(options?: boolean | ffmpeg.ReconnectOptions): this;

  // ---- hardware acceleration ----
  hwaccel(method: ffmpeg.HwaccelMethod): this;
  withHwaccel(method: ffmpeg.HwaccelMethod): this;
  hwaccelDevice(device: string | number): this;
  withHwaccelDevice(device: string | number): this;
  hwaccelOutputFormat(format: ffmpeg.PixelFormatName): this;
  withHwaccelOutputFormat(format: ffmpeg.PixelFormatName): this;
  initHwDevice(spec: string): this;
  filterHwDevice(name: string): this;
  hardwareAcceleration(options: ffmpeg.HardwareAccelerationOptions): this;

  // ---- audio ----
  noAudio(): this;
  withNoAudio(): this;
  audioCodec(codec: ffmpeg.AudioCodecName): this;
  withAudioCodec(codec: ffmpeg.AudioCodecName): this;
  audioBitrate(bitrate: string | number): this;
  withAudioBitrate(bitrate: string | number): this;
  audioChannels(channels: number): this;
  withAudioChannels(channels: number): this;
  audioChannelLayout(layout: string): this;
  withAudioChannelLayout(layout: string): this;
  audioFrequency(freq: number): this;
  withAudioFrequency(freq: number): this;
  audioSampleFormat(format: string): this;
  withAudioSampleFormat(format: string): this;
  audioProfile(profile: string): this;
  withAudioProfile(profile: string): this;
  audioTag(tag: string): this;
  withAudioTag(tag: string): this;
  audioQuality(quality: number): this;
  withAudioQuality(quality: number): this;
  loudnessNormalize(options?: ffmpeg.LoudnessNormalizeOptions): this;
  loudnorm(options?: ffmpeg.LoudnessNormalizeOptions): this;
  audioFilter(...filters: ffmpeg.FilterInput[]): this;
  audioFilters(...filters: ffmpeg.FilterInput[]): this;
  withAudioFilter(...filters: ffmpeg.FilterInput[]): this;
  withAudioFilters(...filters: ffmpeg.FilterInput[]): this;

  // ---- video ----
  noVideo(): this;
  withNoVideo(): this;
  videoCodec(codec: ffmpeg.VideoCodecName): this;
  withVideoCodec(codec: ffmpeg.VideoCodecName): this;
  videoBitrate(bitrate: string | number, constant?: boolean): this;
  withVideoBitrate(bitrate: string | number, constant?: boolean): this;
  crf(value: number): this;
  videoQuality(value: number): this;
  videoPreset(preset: ffmpeg.VideoPresetName): this;
  encodePreset(preset: ffmpeg.VideoPresetName): this;
  videoTune(tune: string): this;
  encodeTune(tune: string): this;
  videoProfile(profile: string): this;
  withVideoProfile(profile: string): this;
  videoLevel(level: string | number): this;
  withVideoLevel(level: string | number): this;
  pixelFormat(format: ffmpeg.PixelFormatName): this;
  pixFmt(format: ffmpeg.PixelFormatName): this;
  withPixelFormat(format: ffmpeg.PixelFormatName): this;
  gopSize(size: number): this;
  keyframeInterval(size: number): this;
  bFrames(count: number): this;
  twoPass(pass: 1 | 2 | number, logFile?: string): this;
  fpsMode(mode: ffmpeg.FpsMode): this;
  colorSpace(options: ffmpeg.ColorSpaceOptions): this;
  videoTag(tag: string): this;
  withVideoTag(tag: string): this;
  videoFilter(...filters: ffmpeg.FilterInput[]): this;
  videoFilters(...filters: ffmpeg.FilterInput[]): this;
  withVideoFilter(...filters: ffmpeg.FilterInput[]): this;
  withVideoFilters(...filters: ffmpeg.FilterInput[]): this;
  fps(fps: number | string): this;
  FPS(fps: number | string): this;
  outputFps(fps: number | string): this;
  outputFPS(fps: number | string): this;
  withFps(fps: number | string): this;
  withFPS(fps: number | string): this;
  withOutputFps(fps: number | string): this;
  withOutputFPS(fps: number | string): this;
  withFpsOutput(fps: number | string): this;
  withFPSOutput(fps: number | string): this;
  fpsOutput(fps: number | string): this;
  FPSOutput(fps: number | string): this;
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
  autopad(pad?: boolean | string, color?: string): this;
  autoPad(pad?: boolean | string, color?: string): this;
  applyAutopad(pad?: boolean | string, color?: string): this;
  applyAutoPad(pad?: boolean | string, color?: string): this;
  applyAutopadding(pad?: boolean | string, color?: string): this;
  applyAutoPadding(pad?: boolean | string, color?: string): this;
  withAutopad(pad?: boolean | string, color?: string): this;
  withAutoPad(pad?: boolean | string, color?: string): this;
  withAutopadding(pad?: boolean | string, color?: string): this;
  withAutoPadding(pad?: boolean | string, color?: string): this;
  keepPixelAspect(keep?: boolean): this;
  keepDisplayAspect(keep?: boolean): this;
  keepDisplayAspectRatio(keep?: boolean): this;
  keepDAR(keep?: boolean): this;

  // ---- output & subtitles & metadata ----
  output(target?: string | NodeJS.WritableStream, pipeopts?: ffmpeg.PipeOptions): this;
  addOutput(target?: string | NodeJS.WritableStream, pipeopts?: ffmpeg.PipeOptions): this;
  format(format: string): this;
  toFormat(format: string): this;
  outputFormat(format: string): this;
  withOutputFormat(format: string): this;
  duration(duration: string | number): this;
  setDuration(duration: string | number): this;
  withDuration(duration: string | number): this;
  to(position: string | number): this;
  endTime(position: string | number): this;
  shortest(): this;
  seek(seek: string | number): this;
  seekOutput(seek: string | number): this;
  map(spec: string): this;
  noSubtitles(): this;
  withNoSubtitles(): this;
  noData(): this;
  withNoData(): this;
  subtitleCodec(codec: ffmpeg.SubtitleCodecName): this;
  withSubtitleCodec(codec: ffmpeg.SubtitleCodecName): this;
  burnSubtitles(filePath: string, options?: ffmpeg.BurnSubtitlesOptions): this;
  metadata(key: string, value: string | number, streamSpec?: string): this;
  metadata(entries: Record<string, string | number>, streamSpec?: string): this;
  mapMetadata(spec: string | number): this;
  mapChapters(spec: string | number): this;
  disposition(streamSpec: string, value: string): this;
  bitstreamFilter(filter: string | string[], streamType?: string): this;
  bsf(filter: string | string[], streamType?: string): this;
  movflags(flags: string | string[]): this;
  faststart(): this;
  copyAll(): this;
  streamCopy(): this;
  maxMuxingQueueSize(size: number): this;
  flvmeta(): this;
  updateFlvMetadata(): this;

  // ---- streaming ----
  hls(options?: ffmpeg.HlsOptions): this;
  dash(options?: ffmpeg.DashOptions): this;

  // ---- custom & global options ----
  inputOption(...options: Array<string | number | Array<string | number>>): this;
  inputOptions(...options: Array<string | number | Array<string | number>>): this;
  addInputOption(...options: Array<string | number | Array<string | number>>): this;
  addInputOptions(...options: Array<string | number | Array<string | number>>): this;
  withInputOption(...options: Array<string | number | Array<string | number>>): this;
  withInputOptions(...options: Array<string | number | Array<string | number>>): this;
  outputOption(...options: Array<string | number | Array<string | number>>): this;
  outputOptions(...options: Array<string | number | Array<string | number>>): this;
  addOutputOption(...options: Array<string | number | Array<string | number>>): this;
  addOutputOptions(...options: Array<string | number | Array<string | number>>): this;
  addOption(...options: Array<string | number | Array<string | number>>): this;
  addOptions(...options: Array<string | number | Array<string | number>>): this;
  withOutputOption(...options: Array<string | number | Array<string | number>>): this;
  withOutputOptions(...options: Array<string | number | Array<string | number>>): this;
  withOption(...options: Array<string | number | Array<string | number>>): this;
  withOptions(...options: Array<string | number | Array<string | number>>): this;
  globalOption(...options: Array<string | number | Array<string | number>>): this;
  globalOptions(...options: Array<string | number | Array<string | number>>): this;
  addGlobalOption(...options: Array<string | number | Array<string | number>>): this;
  addGlobalOptions(...options: Array<string | number | Array<string | number>>): this;
  withGlobalOption(...options: Array<string | number | Array<string | number>>): this;
  withGlobalOptions(...options: Array<string | number | Array<string | number>>): this;
  logLevel(level: ffmpeg.LogLevel): this;
  hideBanner(): this;
  noStdin(): this;
  nostdin(): this;
  overwrite(enabled?: boolean): this;
  threads(count: number): this;
  complexFilter(spec: string | ffmpeg.FilterSpecification | Array<string | ffmpeg.FilterSpecification>, map?: string | string[]): this;
  filterGraph(spec: string | ffmpeg.FilterSpecification | Array<string | ffmpeg.FilterSpecification>, map?: string | string[]): this;

  // ---- presets ----
  preset(preset: string | ((command: ffmpeg.FfmpegCommand) => void)): this;
  usingPreset(preset: string | ((command: ffmpeg.FfmpegCommand) => void)): this;

  // ---- processing ----
  getArguments(): Array<string | number>;
  run(): this;
  exec(): this;
  execute(): this;
  runAsync(): Promise<ffmpeg.FfmpegRunResult>;
  execAsync(): Promise<ffmpeg.FfmpegRunResult>;
  save(output: string): this;
  saveToFile(output: string): this;
  saveAsync(output: string): Promise<ffmpeg.FfmpegRunResult>;
  pipe(options?: ffmpeg.PipeOptions): PassThrough;
  pipe<T extends NodeJS.WritableStream>(stream: T, options?: ffmpeg.PipeOptions): T;
  stream(options?: ffmpeg.PipeOptions): PassThrough;
  stream<T extends NodeJS.WritableStream>(stream: T, options?: ffmpeg.PipeOptions): T;
  writeToStream(options?: ffmpeg.PipeOptions): PassThrough;
  writeToStream<T extends NodeJS.WritableStream>(stream: T, options?: ffmpeg.PipeOptions): T;
  screenshots(config?: number | ffmpeg.ScreenshotsConfig, folder?: string): this;
  screenshot(config?: number | ffmpeg.ScreenshotsConfig, folder?: string): this;
  thumbnails(config?: number | ffmpeg.ScreenshotsConfig, folder?: string): this;
  thumbnail(config?: number | ffmpeg.ScreenshotsConfig, folder?: string): this;
  takeScreenshots(config?: number | ffmpeg.ScreenshotsConfig, folder?: string): this;
  screenshotsAsync(config?: number | ffmpeg.ScreenshotsConfig, folder?: string): Promise<string[]>;
  mergeToFile(target: string | NodeJS.WritableStream, tmpFolder?: string | ffmpeg.PipeOptions): this;
  concat(target: string | NodeJS.WritableStream, options?: string | ffmpeg.PipeOptions): this;
  concatenate(target: string | NodeJS.WritableStream, options?: string | ffmpeg.PipeOptions): this;
  renice(niceness?: number): this;
  kill(signal?: NodeJS.Signals | string): this;
  clone(): ffmpeg.FfmpegCommand;

  // ---- ffprobe (instance — callback or Promise) ----
  ffprobe(): Promise<ffmpeg.FfprobeData>;
  ffprobe(index: number): Promise<ffmpeg.FfprobeData>;
  ffprobe(options: string[]): Promise<ffmpeg.FfprobeData>;
  ffprobe(index: number, options: string[]): Promise<ffmpeg.FfprobeData>;
  ffprobe(callback: ffmpeg.Callback<ffmpeg.FfprobeData>): void;
  ffprobe(index: number, callback: ffmpeg.Callback<ffmpeg.FfprobeData>): void;
  ffprobe(options: string[], callback: ffmpeg.Callback<ffmpeg.FfprobeData>): void;
  ffprobe(index: number, options: string[], callback: ffmpeg.Callback<ffmpeg.FfprobeData>): void;

  // ---- capabilities (instance — callback or Promise) ----
  availableFilters(): Promise<Record<string, ffmpeg.FfmpegFilterInfo>>;
  availableFilters(callback: ffmpeg.Callback<Record<string, ffmpeg.FfmpegFilterInfo>>): void;
  getAvailableFilters(): Promise<Record<string, ffmpeg.FfmpegFilterInfo>>;
  getAvailableFilters(callback: ffmpeg.Callback<Record<string, ffmpeg.FfmpegFilterInfo>>): void;
  availableCodecs(): Promise<Record<string, ffmpeg.FfmpegCodecInfo>>;
  availableCodecs(callback: ffmpeg.Callback<Record<string, ffmpeg.FfmpegCodecInfo>>): void;
  getAvailableCodecs(): Promise<Record<string, ffmpeg.FfmpegCodecInfo>>;
  getAvailableCodecs(callback: ffmpeg.Callback<Record<string, ffmpeg.FfmpegCodecInfo>>): void;
  availableEncoders(): Promise<Record<string, ffmpeg.FfmpegEncoderInfo>>;
  availableEncoders(callback: ffmpeg.Callback<Record<string, ffmpeg.FfmpegEncoderInfo>>): void;
  getAvailableEncoders(): Promise<Record<string, ffmpeg.FfmpegEncoderInfo>>;
  getAvailableEncoders(callback: ffmpeg.Callback<Record<string, ffmpeg.FfmpegEncoderInfo>>): void;
  availableDecoders(): Promise<Record<string, ffmpeg.FfmpegDecoderInfo>>;
  availableDecoders(callback: ffmpeg.Callback<Record<string, ffmpeg.FfmpegDecoderInfo>>): void;
  getAvailableDecoders(): Promise<Record<string, ffmpeg.FfmpegDecoderInfo>>;
  getAvailableDecoders(callback: ffmpeg.Callback<Record<string, ffmpeg.FfmpegDecoderInfo>>): void;
  availableFormats(): Promise<Record<string, ffmpeg.FfmpegFormatInfo>>;
  availableFormats(callback: ffmpeg.Callback<Record<string, ffmpeg.FfmpegFormatInfo>>): void;
  getAvailableFormats(): Promise<Record<string, ffmpeg.FfmpegFormatInfo>>;
  getAvailableFormats(callback: ffmpeg.Callback<Record<string, ffmpeg.FfmpegFormatInfo>>): void;
  availableHwaccels(): Promise<string[]>;
  availableHwaccels(callback: ffmpeg.Callback<string[]>): void;
  getAvailableHwaccels(): Promise<string[]>;
  getAvailableHwaccels(callback: ffmpeg.Callback<string[]>): void;
  availablePixelFormats(): Promise<Record<string, ffmpeg.FfmpegPixelFormatInfo>>;
  availablePixelFormats(callback: ffmpeg.Callback<Record<string, ffmpeg.FfmpegPixelFormatInfo>>): void;
  getAvailablePixelFormats(): Promise<Record<string, ffmpeg.FfmpegPixelFormatInfo>>;
  getAvailablePixelFormats(callback: ffmpeg.Callback<Record<string, ffmpeg.FfmpegPixelFormatInfo>>): void;
  availableBitstreamFilters(): Promise<string[]>;
  availableBitstreamFilters(callback: ffmpeg.Callback<string[]>): void;
  getAvailableBitstreamFilters(): Promise<string[]>;
  getAvailableBitstreamFilters(callback: ffmpeg.Callback<string[]>): void;
  availableProtocols(): Promise<ffmpeg.FfmpegProtocolsInfo>;
  availableProtocols(callback: ffmpeg.Callback<ffmpeg.FfmpegProtocolsInfo>): void;
  getAvailableProtocols(): Promise<ffmpeg.FfmpegProtocolsInfo>;
  getAvailableProtocols(callback: ffmpeg.Callback<ffmpeg.FfmpegProtocolsInfo>): void;
  ffmpegVersion(): Promise<ffmpeg.FfmpegVersionInfo>;
  ffmpegVersion(callback: ffmpeg.Callback<ffmpeg.FfmpegVersionInfo>): void;
  getFfmpegVersion(): Promise<ffmpeg.FfmpegVersionInfo>;
  getFfmpegVersion(callback: ffmpeg.Callback<ffmpeg.FfmpegVersionInfo>): void;

  setFfmpegPath(path: string): this;
  setFfprobePath(path: string): this;
  setFlvtoolPath(path: string): this;

  // ---- statics ----
  static readonly FfmpegCommand: typeof ffmpeg;
  static setFfmpegPath(path: string): void;
  static setFfprobePath(path: string): void;
  static setFlvtoolPath(path: string): void;
  static availableFilters(): Promise<Record<string, ffmpeg.FfmpegFilterInfo>>;
  static availableFilters(callback: ffmpeg.Callback<Record<string, ffmpeg.FfmpegFilterInfo>>): void;
  static getAvailableFilters(): Promise<Record<string, ffmpeg.FfmpegFilterInfo>>;
  static getAvailableFilters(callback: ffmpeg.Callback<Record<string, ffmpeg.FfmpegFilterInfo>>): void;
  static availableCodecs(): Promise<Record<string, ffmpeg.FfmpegCodecInfo>>;
  static availableCodecs(callback: ffmpeg.Callback<Record<string, ffmpeg.FfmpegCodecInfo>>): void;
  static getAvailableCodecs(): Promise<Record<string, ffmpeg.FfmpegCodecInfo>>;
  static getAvailableCodecs(callback: ffmpeg.Callback<Record<string, ffmpeg.FfmpegCodecInfo>>): void;
  static availableEncoders(): Promise<Record<string, ffmpeg.FfmpegEncoderInfo>>;
  static availableEncoders(callback: ffmpeg.Callback<Record<string, ffmpeg.FfmpegEncoderInfo>>): void;
  static getAvailableEncoders(): Promise<Record<string, ffmpeg.FfmpegEncoderInfo>>;
  static getAvailableEncoders(callback: ffmpeg.Callback<Record<string, ffmpeg.FfmpegEncoderInfo>>): void;
  static availableDecoders(): Promise<Record<string, ffmpeg.FfmpegDecoderInfo>>;
  static availableDecoders(callback: ffmpeg.Callback<Record<string, ffmpeg.FfmpegDecoderInfo>>): void;
  static getAvailableDecoders(): Promise<Record<string, ffmpeg.FfmpegDecoderInfo>>;
  static getAvailableDecoders(callback: ffmpeg.Callback<Record<string, ffmpeg.FfmpegDecoderInfo>>): void;
  static availableFormats(): Promise<Record<string, ffmpeg.FfmpegFormatInfo>>;
  static availableFormats(callback: ffmpeg.Callback<Record<string, ffmpeg.FfmpegFormatInfo>>): void;
  static getAvailableFormats(): Promise<Record<string, ffmpeg.FfmpegFormatInfo>>;
  static getAvailableFormats(callback: ffmpeg.Callback<Record<string, ffmpeg.FfmpegFormatInfo>>): void;
  static availableHwaccels(): Promise<string[]>;
  static availableHwaccels(callback: ffmpeg.Callback<string[]>): void;
  static getAvailableHwaccels(): Promise<string[]>;
  static getAvailableHwaccels(callback: ffmpeg.Callback<string[]>): void;
  static availablePixelFormats(): Promise<Record<string, ffmpeg.FfmpegPixelFormatInfo>>;
  static availablePixelFormats(callback: ffmpeg.Callback<Record<string, ffmpeg.FfmpegPixelFormatInfo>>): void;
  static getAvailablePixelFormats(): Promise<Record<string, ffmpeg.FfmpegPixelFormatInfo>>;
  static getAvailablePixelFormats(callback: ffmpeg.Callback<Record<string, ffmpeg.FfmpegPixelFormatInfo>>): void;
  static availableBitstreamFilters(): Promise<string[]>;
  static availableBitstreamFilters(callback: ffmpeg.Callback<string[]>): void;
  static getAvailableBitstreamFilters(): Promise<string[]>;
  static getAvailableBitstreamFilters(callback: ffmpeg.Callback<string[]>): void;
  static availableProtocols(): Promise<ffmpeg.FfmpegProtocolsInfo>;
  static availableProtocols(callback: ffmpeg.Callback<ffmpeg.FfmpegProtocolsInfo>): void;
  static getAvailableProtocols(): Promise<ffmpeg.FfmpegProtocolsInfo>;
  static getAvailableProtocols(callback: ffmpeg.Callback<ffmpeg.FfmpegProtocolsInfo>): void;
  static ffmpegVersion(): Promise<ffmpeg.FfmpegVersionInfo>;
  static ffmpegVersion(callback: ffmpeg.Callback<ffmpeg.FfmpegVersionInfo>): void;
  static getFfmpegVersion(): Promise<ffmpeg.FfmpegVersionInfo>;
  static getFfmpegVersion(callback: ffmpeg.Callback<ffmpeg.FfmpegVersionInfo>): void;
  static ffprobe(file: string | NodeJS.ReadableStream): Promise<ffmpeg.FfprobeData>;
  static ffprobe(file: string | NodeJS.ReadableStream, options: string[]): Promise<ffmpeg.FfprobeData>;
  static ffprobe(file: string | NodeJS.ReadableStream, callback: ffmpeg.Callback<ffmpeg.FfprobeData>): void;
  static ffprobe(file: string | NodeJS.ReadableStream, options: string[], callback: ffmpeg.Callback<ffmpeg.FfprobeData>): void;
  static ffprobe(file: string | NodeJS.ReadableStream, index: number, callback: ffmpeg.Callback<ffmpeg.FfprobeData>): void;
  static ffprobe(file: string | NodeJS.ReadableStream, index: number, options: string[], callback: ffmpeg.Callback<ffmpeg.FfprobeData>): void;
}

declare namespace ffmpeg {
  export type FfmpegCommand = ffmpeg;

  export type VideoCodecName =
    | 'libx264'
    | 'libx265'
    | 'libsvtav1'
    | 'libaom-av1'
    | 'librav1e'
    | 'libvpx'
    | 'libvpx-vp9'
    | 'h264'
    | 'hevc'
    | 'av1'
    | 'vp9'
    | 'h264_nvenc'
    | 'hevc_nvenc'
    | 'av1_nvenc'
    | 'h264_vaapi'
    | 'hevc_vaapi'
    | 'av1_vaapi'
    | 'h264_qsv'
    | 'hevc_qsv'
    | 'av1_qsv'
    | 'h264_videotoolbox'
    | 'hevc_videotoolbox'
    | 'h264_amf'
    | 'hevc_amf'
    | 'mpeg4'
    | 'prores_ks'
    | 'libwebp'
    | 'png'
    | 'mjpeg'
    | 'copy'
    | (string & {});

  export type AudioCodecName =
    | 'aac'
    | 'libfdk_aac'
    | 'libopus'
    | 'opus'
    | 'libmp3lame'
    | 'mp3'
    | 'libvorbis'
    | 'vorbis'
    | 'flac'
    | 'alac'
    | 'ac3'
    | 'eac3'
    | 'pcm_s16le'
    | 'pcm_s24le'
    | 'pcm_f32le'
    | 'copy'
    | (string & {});

  export type SubtitleCodecName =
    | 'mov_text'
    | 'srt'
    | 'subrip'
    | 'ass'
    | 'ssa'
    | 'webvtt'
    | 'dvbsub'
    | 'dvdsub'
    | 'copy'
    | (string & {});

  export type HwaccelMethod =
    | 'auto'
    | 'cuda'
    | 'nvdec'
    | 'vaapi'
    | 'qsv'
    | 'videotoolbox'
    | 'vulkan'
    | 'd3d11va'
    | 'dxva2'
    | 'drm'
    | 'opencl'
    | 'vdpau'
    | 'amf'
    | (string & {});

  export type PixelFormatName =
    | 'yuv420p'
    | 'yuv420p10le'
    | 'yuv422p'
    | 'yuv422p10le'
    | 'yuv444p'
    | 'yuv444p10le'
    | 'yuva420p'
    | 'nv12'
    | 'p010le'
    | 'rgb24'
    | 'rgba'
    | 'bgr24'
    | 'bgra'
    | 'gray'
    | 'cuda'
    | 'vaapi'
    | 'qsv'
    | 'vulkan'
    | (string & {});

  export type VideoPresetName =
    | 'ultrafast'
    | 'superfast'
    | 'veryfast'
    | 'faster'
    | 'fast'
    | 'medium'
    | 'slow'
    | 'slower'
    | 'veryslow'
    | 'placebo'
    | 'p1'
    | 'p2'
    | 'p3'
    | 'p4'
    | 'p5'
    | 'p6'
    | 'p7'
    | number
    | (string & {});

  export type FpsMode = 'passthrough' | 'cfr' | 'vfr' | 'drop' | 'auto' | (string & {});

  export type LogLevel =
    | 'quiet'
    | 'panic'
    | 'fatal'
    | 'error'
    | 'warning'
    | 'info'
    | 'verbose'
    | 'debug'
    | 'trace'
    | (string & {});

  export interface FfprobeSideData {
    side_data_type?: string;
    rotation?: number;
    [key: string]: any;
  }

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
    color_range?: string;
    color_space?: string;
    color_transfer?: string;
    color_primaries?: string;
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
    side_data_list?: FfprobeSideData[];
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

  export interface FfprobeChapter {
    id?: number;
    time_base?: string;
    start?: number;
    start_time?: number | string;
    end?: number;
    end_time?: number | string;
    tags?: Record<string, string>;
    [key: string]: any;
  }

  export interface FfprobeData {
    streams: FfprobeStream[];
    format: FfprobeFormat;
    chapters: FfprobeChapter[];
    programs?: Record<string, any>[];
    frames?: Record<string, any>[];
    packets?: Record<string, any>[];
    [key: string]: any;
  }

  export interface FfmpegProgress {
    frames: number;
    currentFps: number;
    currentKbps: number;
    targetSize: number;
    timemark: string;
    percent?: number;
    speed?: string;
  }

  export interface FfmpegCodecData {
    format: string;
    duration: string;
    audio: string;
    audio_details?: string[];
    video: string;
    video_details?: string[];
  }

  export interface FfmpegLogger {
    debug: (...args: any[]) => void;
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
  }

  export interface FfmpegCommandOptions {
    logger?: FfmpegLogger;
    niceness?: number;
    priority?: number;
    presets?: string;
    preset?: string;
    stdoutLines?: number;
    timeout?: number;
    cwd?: string;
    signal?: AbortSignal;
    source?: string | NodeJS.ReadableStream;
  }

  export interface FfmpegRunResult {
    stdout: string | null;
    stderr: string | null;
  }

  export interface FilterSpecification {
    filter: string;
    inputs?: string | string[];
    outputs?: string | string[];
    options?: string | number | Array<string | number> | Record<string, string | number | boolean>;
  }

  export type FilterInput = string | FilterSpecification | Array<string | FilterSpecification>;

  export interface ScreenshotsConfig {
    count?: number;
    timemarks?: Array<number | string>;
    timestamps?: Array<number | string>;
    filename?: string;
    folder?: string;
    size?: string;
    fastSeek?: boolean;
  }

  export interface PipeOptions {
    end?: boolean;
  }

  export interface HardwareAccelerationOptions {
    method?: HwaccelMethod;
    device?: string | number;
    outputFormat?: PixelFormatName;
    initDevice?: string;
    filterDevice?: string;
  }

  export interface ColorSpaceOptions {
    primaries?: string;
    transfer?: string;
    matrix?: string;
    range?: 'tv' | 'pc' | 'mpeg' | 'jpeg' | (string & {});
  }

  export interface LoudnessNormalizeOptions {
    integrated?: number;
    truePeak?: number;
    lra?: number;
    measuredI?: number;
    measuredTP?: number;
    measuredLRA?: number;
    measuredThresh?: number;
    offset?: number;
    linear?: boolean;
    dualMono?: boolean;
    printFormat?: 'none' | 'json' | 'summary' | (string & {});
  }

  export interface BurnSubtitlesOptions {
    forceStyle?: string;
    fontsDir?: string;
    charenc?: string;
    streamIndex?: number;
    originalSize?: string;
    useAssFilter?: boolean;
  }

  export interface ReconnectOptions {
    streamed?: boolean;
    onNetworkError?: boolean;
    onHttpError?: string | Array<string | number>;
    delayMax?: number;
  }

  export interface HlsOptions {
    time?: number;
    initTime?: number;
    listSize?: number;
    flags?: string | string[];
    segmentType?: 'mpegts' | 'fmp4' | (string & {});
    segmentFilename?: string;
    fmp4InitFilename?: string;
    playlistType?: 'event' | 'vod' | (string & {});
    baseUrl?: string;
    keyInfoFile?: string;
    masterPlName?: string;
    varStreamMap?: string;
    startNumber?: number;
    deleteThreshold?: number;
    allowCache?: boolean;
  }

  export interface DashOptions {
    segDuration?: number;
    windowSize?: number;
    extraWindowSize?: number;
    initSegName?: string;
    mediaSegName?: string;
    useTemplate?: boolean;
    useTimeline?: boolean;
    adaptationSets?: string;
    singleFile?: boolean;
    streaming?: boolean;
    ldash?: boolean;
    hlsPlaylist?: boolean;
    hlsMasterName?: string;
    removeAtExit?: boolean;
  }

  export interface FfmpegFilterInfo {
    description: string;
    input: 'audio' | 'video' | 'none' | 'dynamic';
    multipleInputs: boolean;
    output: 'audio' | 'video' | 'none' | 'dynamic';
    multipleOutputs: boolean;
  }

  export interface FfmpegCodecInfo {
    type: 'audio' | 'video' | 'subtitle' | 'data' | 'attachment';
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

  export type FfmpegDecoderInfo = FfmpegEncoderInfo;

  export interface FfmpegFormatInfo {
    description: string;
    canDemux: boolean;
    canMux: boolean;
    isDevice?: boolean;
  }

  export interface FfmpegPixelFormatInfo {
    canInput: boolean;
    canOutput: boolean;
    hardwareAccelerated: boolean;
    paletted: boolean;
    bitstream: boolean;
    nbComponents: number;
    bitsPerPixel: number;
    bitDepths?: string;
  }

  export interface FfmpegProtocolsInfo {
    input: string[];
    output: string[];
  }

  export interface FfmpegVersionInfo {
    version: string;
    configuration: string[];
    libraries: Record<string, string>;
  }

  export type Callback<T> = (err: Error | null, result: T) => void;
}

export = ffmpeg;
