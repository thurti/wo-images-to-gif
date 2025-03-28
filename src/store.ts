import { derived, get, writable, readable } from "svelte/store";
import { type FormatOption, type SettingOption, config } from "./config";
import {
  createPersistentBooleanStore,
  createPersistentJsonStore,
  createPersistentNumberStore,
} from "./lib/utils/store";

export type SelectedSettings = {
  [key: string]: SettingOption;
};

/**
 * Show complete UI.
 */
export const isOpen = writable<boolean>(false);

/**
 * Array of selected files for conversion.
 */
export const selectedFiles = writable<File[]>([]);

export const customPresets = createPersistentJsonStore<Array<FormatOption>>(
  "customPresets",
  [],
);

/**
 * Available formates/presets for conversion.
 */
export const configFormats = derived(customPresets, ($customPresets) => {
  const configFormats = [...structuredClone(config.formats), ...$customPresets];
  return configFormats;
});

/**
 * Available settings for given id.
 */
export const configSettings = derived(customPresets, ($customPresets) => {
  const settings = structuredClone(config.settings);
  return settings;
});

export const getDefaultFormat = (): FormatOption =>
  // cast to FormatOption because default format must be set in config
  structuredClone(
    get(configFormats).find((format) => format.isDefault),
  ) as FormatOption;

/**
 * The selected target file format. (eg. mp3)
 */
export const selectedFormat = createPersistentJsonStore<FormatOption>(
  "selectedFormat",
  getDefaultFormat(),
);

/**
 * The default settings for the selected format.
 */
export const defaultSettings = derived(
  [selectedFormat, configSettings],
  ([$selectedFormat, $configSettings]) => {
    const settings = structuredClone(config.settings);
    const formatSelectedSettings = structuredClone(
      $selectedFormat?.selectedSettings ?? {},
    );

    const defaultSettings: SelectedSettings = {};

    for (const setting of settings) {
      const id = setting.id;
      const selectedSettingId = formatSelectedSettings[id]?.id;
      const value = formatSelectedSettings[id]?.value; // for custom values

      if (selectedSettingId && setting.options) {
        defaultSettings[id] =
          setting.options.find((o) => o.id === selectedSettingId) ??
          setting.options.find((option) => option.isDefault) ??
          setting.options[0];

        if (value) {
          defaultSettings[id].value = value;
        }
      }
    }

    return defaultSettings;
  },
);

/**
 * The selected settings for the conversion. (eg. sample rate, bit rate, etc.)
 */
export const selectedSettings = createPersistentJsonStore<SelectedSettings>(
  "selectedSettings",
  structuredClone(get(defaultSettings)),
);

/**
 * No custom command in this app.
 * But maybe add later.
 */
export const isCustomCommand = readable<boolean>(false);

/**
 * True if the app was opened with a url sharing params for format, settings.
 */
export const isSharedSettings = writable<boolean>(false);

/**
 * Log output from ffmpeg.
 */
export const logger = writable<string>("");

/**
 * True while ffmpeg files are being preloaded. (wasm, sw, script)
 */
export const isPreloadingFiles = writable<boolean>(false);

/**
 * True while files are being converted.
 */
export const isConverting = writable<boolean>(false);

/**
 * True if converted files are ready for download.
 */
export const isDownloadReady = writable<boolean>(false);

/**
 * Total files that have been converted all time.
 */
export const conversionCount = createPersistentNumberStore(
  "conversionCount",
  0,
);

/**
 * Array of files that are ready for download.
 */
export const filesReadyForDownload = writable<Set<string>>(new Set());

/**
 * If true the UI will show the reduced upload UI with an expanded dropzone.
 */
export const showReducedUploadUi = createPersistentBooleanStore(
  "showReducedUploadUi",
  false,
);

/**
 * If true the the advanced settings details tab is open.
 */
export const showAdvancedSettings = createPersistentBooleanStore(
  "showAdvancedSettings",
  false,
);

/**
 * If true a notification will be shown when files are ready for download.
 */
export const notifyOnConversionReady = createPersistentBooleanStore(
  "notifyOnConversionReady",
  false,
);

/**
 * If true a badge will be shown when files are ready for download.
 */
export const badgeOnConversionReady = createPersistentBooleanStore(
  "badgeOnConversionReady",
  false,
);

/**
 * Light, dark, or auto color scheme.
 */
export const preferedColorScheme = createPersistentJsonStore<
  "auto" | "light" | "dark"
>("prefersLightTheme", "auto");
