/**
 * Type definitions for fluent-ffmpeg (ESM modern fork)
 * @module fluent-ffmpeg
 */

/// <reference types="node" />

declare class FfmpegCommand extends EventEmitter {
  /**
   * Create an ffmpeg command
   * @param input input file path or readable stream
   * @param options command options
   */
  constructor(input?: string | NodeJS.ReadableStream, options?: {
    logger?: {
      debug: (...args: any[]) => void;
      info: (...args: any[]) => void;
      warn: (...args: any[]) => void;
      error: (...args: any[]) => void;
    };
    niceness?: number;
    priority?: number;
    presets?: string;
    preset?: string;
    stdoutLines?: number;
    timeout?: number;
    source?: string | NodeJS.ReadableStream;
  });

  // Core fluent methods (from inputs, audio, video, output, etc.)
  input(input: string | NodeJS.ReadableStream): this;
  output(output: string | NodeJS.WritableStream): this;
  format(format: string): this;
  size(size: string): this;
  audioCodec(codec: string): this;
  videoCodec(codec: string): this;
  audioBitrate(bitrate: string | number): this;
  videoBitrate(bitrate: string | number): this;
  audioFrequency(freq: number): this;
  videoFrameRate(fps: string | number): this;
  aspect(aspect: string): this;
  fps(fps: string | number): this;
  duration(duration: string | number): this;
  seekInput(time: string | number): this;
  seekOutput(time: string | number): this;
  loop(times: number): this;
  volume(volume: number): this;
  bitrate(bitrate: string | number): this;
  quality(quality: number): this;
  preset(preset: string): this;
  threads(threads: number): this;
  pass(pass: number): this;
  save(output: string): this;
  pipe(output: NodeJS.WritableStream): this;
  on(event: string, listener: (...args: any[]) => void): this;
  once(event: string, listener: (...args: any[]) => void): this;
  clone(): FfmpegCommand;

  // Static methods
  static setFfmpegPath(path: string): void;
  static setFfprobePath(path: string): void;
  static setFlvtoolPath(path: string): void;
  static availableFilters(callback: (err: Error | null, filters: string[]) => void): void;
  static getAvailableFilters(callback: (err: Error | null, filters: string[]) => void): void;
  static availableCodecs(callback: (err: Error | null, codecs: string[]) => void): void;
  static getAvailableCodecs(callback: (err: Error | null, codecs: string[]) => void): void;
  static availableFormats(callback: (err: Error | null, formats: string[]) => void): void;
  static getAvailableFormats(callback: (err: Error | null, formats: string[]) => void): void;
  static availableEncoders(callback: (err: Error | null, encoders: string[]) => void): void;
  static getAvailableEncoders(callback: (err: Error | null, encoders: string[]) => void): void;
  static ffprobe(file: string, ...rest: any[]): void;
}

export default FfmpegCommand;
