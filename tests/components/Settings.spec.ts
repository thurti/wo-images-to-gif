import "@testing-library/jest-dom";
import { render, cleanup, screen } from "@testing-library/svelte";
import { html } from "@playpilot/svelte-htm";
import Settings from "@/components/Settings.svelte";
import userEvent from "@testing-library/user-event";
import { get, writable } from "svelte/store";
import { selectedFormat, selectedSettings } from "@/store";

const formats = [
  {
    id: "gif",
    label: "GIF",
    value: "GIF",
    ext: "gif",
    mimetype: "image/gif",
    isCustomPreset: false,
    isDefault: true,
    selectedSettings: {
      duration: { id: "gif-duration-3" },
      loop: { id: "gif-loop-1" },
    },
  },
  {
    id: "custom",
    label: "Custom",
    value: "My Custom",
    ext: "gif",
    mimetype: "image/gif",
    isCustomPreset: false,
    selectedSettings: {
      duration: { id: "gif-duration-3" },
      loop: { id: "gif-loop-1" },
    },
  },
];

const settings = [
  {
    id: "duration",
    label: "Duration",
    value: "duration",
    options: [
      { id: "gif-duration-1", label: "1s", value: "1" },
      { id: "gif-duration-3", label: "3s", value: "3", isDefault: true },
    ],
  },
  {
    id: "loop",
    label: "Loop",
    value: "loop",
    options: [
      { id: "gif-loop-0", label: "No Loop", value: "-1" },
      { id: "gif-loop-2", label: "One Loop", value: "1" },
    ],
  },
];

const defaultSettings = {
  duration: {
    id: "gif-duration-3",
    label: "3s",
    value: "3",
  },
  loop: {
    id: "gif-loop-0",
    label: "No Loop",
    value: "-1",
  },
};

describe("Settings", () => {
  afterEach(() => cleanup());

  const user = userEvent.setup();

  it("should render correctly", async () => {
    render(
      html`<${Settings}
        formats=${formats}
        settings=${settings}
        defaultSettings=${defaultSettings}
      />`,
    );
    expect(screen.getByText("GIF")).toBeInTheDocument();
    expect(screen.getByLabelText("Duration")).toBeInTheDocument();
    expect(screen.getByLabelText("Loop")).toBeInTheDocument();

    await user.click(screen.getByText("Duration"));

    expect(screen.getByText("Duration")).toBeInTheDocument();
    expect(screen.getByLabelText("1s")).toBeInTheDocument();
    expect(screen.getByLabelText("3s")).toBeInTheDocument();
    expect(screen.getByLabelText("3s")).toBeChecked();
  });

  it("should update selectedFormat", async () => {
    render(
      html`<${Settings}
        formats=${formats}
        settings=${settings}
        defaultSettings=${defaultSettings}
      />`,
    );

    expect(screen.getByLabelText("Custom")).not.toBeChecked();
    await user.click(screen.getByLabelText("Custom"));

    expect(screen.getByLabelText("Custom")).toBeChecked();
    expect(get(selectedFormat)).toEqual({
      id: "custom",
      label: "Custom",
      value: "My Custom",
      ext: "gif",
      mimetype: "image/gif",
      isCustomPreset: false,
      selectedSettings: {
        duration: { id: "gif-duration-3" },
        loop: { id: "gif-loop-1" },
      },
    });
  });

  it("should update selectedSettings", async () => {
    render(
      html`<${Settings}
        formats=${formats}
        settings=${settings}
        defaultSettings=${defaultSettings}
      />`,
    );

    await user.click(screen.getByLabelText("Duration"));
    await user.click(screen.getByText("1s"));
    await user.click(screen.getByLabelText("Loop"));
    await user.click(screen.getByText("One Loop"));

    expect(get(selectedSettings)).toEqual({
      duration: {
        id: "gif-duration-1",
        label: "1s",
        value: "1",
      },
      loop: {
        id: "gif-loop-2",
        label: "One Loop",
        value: "1",
      },
    });
  });
});
