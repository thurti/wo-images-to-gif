import { FFmpegConverter } from "./FFmpegConverter";
import { get, type Writable } from "svelte/store";
import { fetchFile } from "@ffmpeg/util";
import { logger, type SelectedSettings } from "@/store";
import { config, type FormatOption } from "@/config";
import { getIndexedFilenames, getOutputFilename } from "./utils/file";
import { createFFmegCommandArgs } from "./utils/settings";
import {
  getImageDimensions,
  getMaxImageDimensions,
  imageToPng,
} from "./utils/image";

export class FFmpegConverterImagesToGif extends FFmpegConverter {
  files: Map<string, File> = new Map();

  constructor(progress?: Writable<number>, logger?: Writable<string>) {
    super(null, progress, logger);
  }

  async setFiles(files: File[]): Promise<void> {
    this.removeFilesFromWasm();

    // convert all images to png, because image2 demuxer can't mix formats and png supports transparency
    files = await Promise.all(
      files.map(async (file) => await imageToPng(file)),
    );

    const filenamesWithIndex = getIndexedFilenames(files);

    this.files = new Map(
      filenamesWithIndex.map((filename, idx) => [filename, files[idx]]),
    );

    await this.writeFileToWasm();
  }

  /**
   * @override
   */
  async writeFileToWasm() {
    if (!this.ffmpeg || this.files.size <= 0) return;

    for (const [filename, file] of this.files.entries()) {
      await this.ffmpeg.writeFile(filename, await fetchFile(file));
    }
  }

  async removeFilesFromWasm() {
    if (!this.ffmpeg || this.files.size <= 0) return;

    for (const [filename] of this.files.entries()) {
      await this.ffmpeg.deleteFile(filename);
    }
  }

  /**
   * @override
   */
  async convert(
    format: FormatOption,
    settings: SelectedSettings,
  ): Promise<Uint8Array | null> {
    if (!this.isLoaded() || !this.ffmpeg) {
      console.warn("Convert: FFmpeg is not loaded. Run init() first.");
      return null;
    }

    if (this.files.size <= 0) {
      console.warn("Convert: No files to convert. Run setFiles() first.");
      return null;
    }

    const filenames = [...this.files.keys()];
    const files = [...this.files.values()];
    const outputFilename = getOutputFilename(files[0].name, format);

    // get gif duration
    const gifDuration = parseFloat(settings["duration"]?.value);
    const duration = isFinite(gifDuration) && gifDuration > 0 ? gifDuration : 1;

    // create mp4 from images
    await this.convertImagesToMp4(filenames, duration, "temp.mp4");

    // create gif from mp4
    const commandArgs = createFFmegCommandArgs(
      "temp.mp4",
      format,
      settings,
      outputFilename,
    );

    logger.set(
      get(logger) + `\nGenerate GIF\nCommand: ${commandArgs.join(" ")}\n`,
    );

    await this.ffmpeg.exec(commandArgs);
    return (await this.ffmpeg.readFile(outputFilename)) as Uint8Array;
  }

  async convertImagesToMp4(
    filenames: string[],
    duration: number,
    outputFilename: string,
    padColor: string = "ffffff00",
  ): Promise<void> {
    if (!this.ffmpeg || this.files.size <= 0) return;

    const inputFilename = filenames[0].replace(/^(.+)_1(\..+)$/, "$1_%d.png");
    const fps = filenames.length / duration;

    const { width, height } = await getMaxImageDimensions([
      ...this.files.values(),
    ]);

    // Build filter chain conditionally
    const filterParts = [
      "format=rgba",

      // Scale and crop/pad depending on input size
      // If input is larger: scale to cover and crop to center
      // If input is smaller: scale to fit and pad to center
      `scale=w='if(gt(a,${width}/${height}),${width},${height}*(iw/ih))':h='if(gt(a,${width}/${height}),${width}/(iw/ih),${height})'`,

      // Crop if scaled dimensions are larger than target
      `crop=w='min(iw,${width})':h='min(ih,${height})':x='(iw-ow)/2':y='(ih-oh)/2'`,

      // Pad if cropped dimensions are smaller than target
      `pad=w=${width}:h=${height}:x='(ow-iw)/2':y='(oh-ih)/2':color=${padColor}`,
    ];

    const filter = filterParts.join(",");

    const command = [
      "-framerate",
      `${fps}`,
      "-f",
      "image2",
      "-i",
      inputFilename,
      "-vf",
      filter,
      "-c:v",
      "png",
      "-an",
      outputFilename,
    ];

    logger.set(
      get(logger) + `\nGenerate temporary mp4\nCommand: ${command.join(" ")}\n`,
    );

    await this.ffmpeg.exec(command);
  }
}
