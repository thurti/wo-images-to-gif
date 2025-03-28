<script context="module" lang="ts">
  const exports = {} as {
    convert: () => Promise<void>;
    cancel: () => Promise<void>;
    download: () => void;
    getResult: () => { data: Blob; filename: string };
  };

  export const convertAll = async () => {
    return exports.convert();
  };

  export const cancelAll = async () => {
    return exports.cancel();
  };

  export const downloadAll = async (useNative = false) => {
    if (useNative && "showDirectoryPicker" in window) {
      const results = exports.getResult();

      try {
        await saveAllFiles([results], "downloadAllDir");
      } catch (e) {
        console.warn(e);
      }
    } else {
      exports.download();
    }
  };

  export const getResult = () => {
    return exports.getResult();
  };
</script>

<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from "svelte";
  import { get, writable, type Writable } from "svelte/store";
  import { getOutputFilename, saveAllFiles } from "@/lib/utils/file";
  import {
    conversionCount,
    filesReadyForDownload,
    type SelectedSettings,
  } from "@/store";
  import type { FormatOption } from "@/config";
  import { FFmpegConverterImagesToGif } from "@/lib/FFmpegConverterImagesToGif";

  export let files: File[];
  export let format: FormatOption;
  export let settings: SelectedSettings;
  export let logger: Writable<string>;

  let ffmpeg: FFmpegConverterImagesToGif;
  let result: Uint8Array | null = null;
  let progress = writable<number>(0);
  let isLoading: boolean = false;
  let isConverting: boolean = false;
  let isError: boolean = false;
  let errorMessage: string = "";
  let isCanceled: boolean = false;
  let outputFilename = "";

  const init = async (): Promise<void> => {
    if (ffmpeg.isLoaded()) {
      isLoading = false;
      return;
    }

    isLoading = true;

    try {
      await ffmpeg.init();
    } catch (error) {
      console.warn(error);
    } finally {
      isLoading = false;
    }
  };

  let waitTimeout: number;
  const waitWhileLoading = async () => {
    while (isLoading) {
      await new Promise(
        (resolve) => (waitTimeout = window.setTimeout(resolve, 200)),
      );
    }
  };

  const convert = async () => {
    isError = false;
    errorMessage = "";
    result = null;

    $filesReadyForDownload = new Set();

    await waitWhileLoading();

    try {
      isConverting = true;

      await ffmpeg.setFiles(files);

      outputFilename = getOutputFilename(files[0].name, format);
      result = await ffmpeg.convert(format, settings);

      if (result && result.length === 0) {
        throw new Error("FFmpeg returned empty result");
      } else {
        filesReadyForDownload.set($filesReadyForDownload.add(outputFilename));
      }
    } catch (error) {
      if (!isCanceled) {
        console.warn(error);
        errorMessage = error as string;
        await ffmpeg.cancel();
        isError = true;
      }
    } finally {
      if (!isCanceled && !isError) {
        $conversionCount += 1;
      }
      isConverting = false;
    }
  };

  const cancel = async () => {
    await waitWhileLoading();

    isCanceled = true;
    await ffmpeg.cancel();
    isConverting = false;
    isError = false;
    errorMessage = "";
    isCanceled = false;
  };

  let downloadLink: HTMLDivElement;

  const download = () => {
    console.warn("TODO: implement download?");
  };

  const getResult = (): { data: Blob; filename: string } => ({
    data: new Blob([result ?? ""], { type: format.mimetype }),
    filename: outputFilename,
  });

  onMount(async () => {
    ffmpeg = new FFmpegConverterImagesToGif(progress, logger);

    exports.cancel = cancel;
    exports.convert = convert;
    exports.download = download;
    exports.getResult = getResult;

    init();
  });

  onDestroy(async () => {
    clearTimeout(waitTimeout);
    isLoading = false;
    ffmpeg?.destroy();
  });
</script>
