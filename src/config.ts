import type { SelectedSettings } from "./store";
import type { UIInputItem } from "./types/UIInputItem";

export interface FormatOption extends UIInputItem {
  mimetype?: string;
  ext: string;
  isDefault?: boolean;
  isCustomPreset: boolean;
  selectedSettings?: { [key: string]: { id: string; value?: string } };
}

export interface SettingOption extends UIInputItem<string> {
  isDefault?: boolean;
  options?: SettingOption[];
}

export const config = {
  debug: false,
  disableServiceWorker: false,
  updateInterval: 20000,
  version: import.meta.env.PACKAGE_VERSION,
  url: "https://worksoffline.app/images-to-gif-converter",
  github: "https://github.com/thurti/wo-images-to-gif",
  title: "Images to Gif Converter",
  titleHeader: "Images to\n Gif Converter",
  localStoragePrefix: "wo-images-to-gif",
  notificationIcon: "/icons/android-chrome-192x192.png",
  colorScheme: "zinc-cyan",
  allowedFormats: "image/*",
  maxFileSizeMb: 2000, //2GB hard wasm max
  fileDropLabel: "Add Images",
  formats: <FormatOption[]>[
    // aka. presets
    {
      id: "gif",
      label: "GIF",
      value: "GIF",
      ext: "gif",
      mimetype: "image/gif",
      isCustomPreset: false,
      isDefault: true,
      selectedSettings: {
        filter_complex: { id: "filter_complex-hi" },
        duration: { id: "gif-duration-3" },
        scale: { id: "gif-scale-320" },
        loop: { id: "gif-loop-1" },
      },
    },
  ],
  settings: <SettingOption[]>[
    {
      id: "filter_complex",
      label: "Quality",
      value: "-filter_complex",
      options: [
        {
          id: "filter_complex-8",
          label: "Potato",
          value:
            "-filter_complex scale={scale}[s];[s]split[a][b];[a]palettegen=max_colors=8:reserve_transparent=1[palette];[b][palette]paletteuse=alpha_threshold=128 -loop {loop}",
        },
        {
          id: "filter_complex-64",
          label: "Retro",
          value:
            "-filter_complex scale={scale}[s];[s]split[a][b];[a]palettegen=max_colors=64:reserve_transparent=1[palette];[b][palette]paletteuse=alpha_threshold=128 -loop {loop}",
        },
        {
          id: "filter_complex-128",
          label: "90s",
          value:
            "-filter_complex scale={scale}[s];[s]split[a][b];[a]palettegen=max_colors=128:reserve_transparent=1[palette];[b][palette]paletteuse=alpha_threshold=128 -loop {loop}",
        },
        {
          id: "filter_complex-256",
          label: "Millennial",
          value:
            "-filter_complex scale={scale}[s];[s]split[a][b];[a]palettegen=max_colors=256:reserve_transparent=1[palette];[b][palette]paletteuse=alpha_threshold=128 -loop {loop}",
        },
        {
          id: "filter_complex-hi",
          label: "Ultra",
          value:
            "-filter_complex scale={scale}[s];[s]split[a][b];[a]palettegen=stats_mode=single:reserve_transparent=1[palette];[b][palette]paletteuse=new=1:alpha_threshold=128 -loop {loop}",
          isDefault: true,
        },
      ],
    },
    {
      id: "duration",
      label: "Duration/Speed",
      value: "duration",
      options: [
        { id: "gif-duration-05", label: "0.5s", value: "0.5" },
        { id: "gif-duration-1", label: "1s", value: "1" },
        { id: "gif-duration-3", label: "3s", value: "3", isDefault: true },
        { id: "gif-duration-5", label: "5s", value: "5" },
        { id: "gif-duration-7", label: "7s", value: "7" },
        { id: "gif-duration-10", label: "10s", value: "10" },
        {
          id: "gif-duration-custom",
          label: "Custom Duration",
          value: "",
          isInput: true,
          type: "number",
        },
      ],
    },
    {
      id: "scale",
      label: "Width",
      value: "scale",
      options: [
        { id: "gif-scale-source", label: "source", value: "" },
        { id: "gif-scale-80", label: "80px", value: "80:-1" },
        {
          id: "gif-scale-160",
          label: "160px",
          value: "160:-1",
        },
        {
          id: "gif-scale-320",
          label: "320px",
          value: "320:-1",
          isDefault: true,
        },
        { id: "gif-scale-480", label: "480px", value: "480:-1" },
        { id: "gif-scale-640", label: "640px", value: "640:-1" },
        {
          id: "gif-scale-custom",
          label: "Custom Width",
          value: "",
          isInput: true,
          type: "number",
        },
      ],
    },
    {
      id: "loop",
      label: "Loop",
      value: "loop",
      options: [
        { id: "gif-loop-0", label: "No Loop", value: "-1" },
        { id: "gif-loop-2", label: "One Loop", value: "1" },
        {
          id: "gif-loop-1",
          label: "Infinite",
          value: "0",
          isDefault: true,
        },
      ],
    },
  ],
};
