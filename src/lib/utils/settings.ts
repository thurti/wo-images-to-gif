import type { FormatOption } from "@/config";
import type { SelectedSettings } from "@/store";
import { getOutputFilename } from "./file";

export function createFFmegCommandArgs(
  file: File | string,
  format: FormatOption,
  settings: SelectedSettings,
  outputFilename?: string,
): string[] {
  if (!file || !format || !settings) return [];

  const inputName = typeof file === "string" ? file : file.name;
  const outputName = outputFilename || getOutputFilename(inputName, format);

  return [
    "-i",
    inputName,
    ...getSettingsString(settings).split(" "),
    outputName,
  ];
}

export function getSettingsString(settings: SelectedSettings): string {
  if (!settings) return "";

  let values = Object.values(settings);

  if (settings.filter_complex) {
    values = [{ ...settings.filter_complex }];

    Object.keys(settings)
      .filter((key) => key !== "filter_complex")
      .forEach((key) => {
        let value = settings[key].value;

        if (key === "scale" && !value.includes(":")) {
          value = value + ":-1";
        }

        values[0].value = values[0].value.replace(`{${key}}`, value);
      });
  }

  return values
    .reduce((acc, setting) => {
      return `${acc} ${setting.value}`.trim();
    }, "")
    .trim()
    .padStart(1, '"')
    .padEnd(1, '"');
}

export function createSettingsFromString(
  value: string,
  key = "custom",
): SelectedSettings {
  if (!value) return {};

  const settings: SelectedSettings = {};

  settings[key] = {
    id: key,
    label: "Custom",
    value,
  };

  return settings;
}

export function settingsIsForFormat(
  settings: SelectedSettings,
  formatId: string,
): boolean {
  if (!settings || !formatId) return false;
  return Object.values(settings).some((setting) =>
    setting.id.startsWith(formatId),
  );
}

export function isCustomPreset(data: any): boolean {
  const keys = Object.keys(data);
  const requiredKeys = ["id", "label", "value", "ext", "selectedSettings"];

  return requiredKeys.every((key) => keys.includes(key));
}
