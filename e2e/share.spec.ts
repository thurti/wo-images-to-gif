import { test, expect } from "@playwright/test";

const format = {
  id: "gif",
  label: "GIF",
  value: "GIF",
  ext: "gif",
  mimetype: "image/gif",
  isCustomPreset: false,
  isDefault: true,
  // defaults
  selectedSettings: {
    filter_complex: { id: "filter_complex-hi" },
    duration: { id: "gif-duration-3" },
    scale: { id: "gif-scale-320" },
    loop: { id: "gif-loop-1" },
  },
};

const settings = {
  filter_complex: {
    id: "filter_complex-8",
    label: "Potato",
    value:
      "-filter_complex scale={scale}[s];[s]split[a][b];[a]palettegen=max_colors=8:reserve_transparent=1[palette];[b][palette]paletteuse=alpha_threshold=128 -loop {loop}",
  },
  duration: {
    id: "gif-duration-1",
    label: "1s",
    value: "1",
  },
  scale: { id: "gif-scale-80", label: "80px", value: "80:-1" },
  loop: { id: "gif-loop-0", label: "No Loop", value: "-1" },
};

test.describe("Share Settings", () => {
  test("display share settings modal", async ({ page }) => {
    await page.goto("http://localhost:5173");
    await page.waitForSelector(".container", { strict: false });
    await page.getByRole("button", { name: "Share" }).click();

    await expect(
      page.getByRole("heading", { name: "Share Settings" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Close" }).click();
    await expect(
      page.getByRole("heading", { name: "Share Settings" }),
    ).not.toBeVisible();
  });

  test("copy settings url to clipboard", async ({ page }) => {
    await page.goto("http://localhost:5173");
    await page.waitForSelector(".container", { strict: false });

    // select some settings
    await page.getByRole("tab", { name: "Quality" }).click();
    await page.getByLabel("Potato", { exact: true }).click();

    await page.getByRole("tab", { name: "Duration/Speed" }).click();
    await page.getByLabel("1s", { exact: true }).click();

    await page.getByRole("tab", { name: "Width" }).click();
    await page.getByLabel("80px", { exact: true }).click();

    await page.getByRole("tab", { name: "Loop" }).click();
    await page.getByLabel("No Loop", { exact: true }).click();

    // click copy
    await page.getByRole("button", { name: "Share" }).click();
    await page.getByRole("button", { name: "Copy" }).click();
    await expect(page.locator("text=Copied to clipboard")).toBeVisible();

    let clipboardText = await page.evaluate("navigator.clipboard.readText()");
    await page.getByRole("button", { name: "Copy" }).click();

    // expected settings
    expect(clipboardText).toBe(mockSettingsUrl(format, settings));
  });

  test("open url with shared settings selects the settings", async ({
    page,
  }) => {
    const url = mockSettingsUrl(format, settings);
    await page.goto(url);

    await page.getByRole("tab", { name: "Quality" }).click();
    await expect(page.getByRole("radio", { name: "Potato" })).toBeChecked();

    await page.getByRole("tab", { name: "Duration/Speed" }).click();
    await expect(page.getByRole("radio", { name: "1s" })).toBeChecked();

    await page.getByRole("tab", { name: "Width" }).click();
    await expect(
      page.getByRole("radio", { name: "80px", exact: true }),
    ).toBeChecked();

    await page.getByRole("tab", { name: "Loop" }).click();
    await expect(page.getByRole("radio", { name: "No Loop" })).toBeChecked();
  });

  test('opens settgings url with "Custom" format and settings', async ({
    page,
  }) => {
    const format = {
      id: "My Preset",
      label: "My Preset",
      value: "My Preset",
      ext: "gif",
      mimetype: "image/gif",
      isCustomPreset: false,
      isRemovable: true,
      selectedSettings: {
        filter_complex: {
          id: "filter_complex-8",
        },
        duration: {
          id: "gif-duration-custom",
          value: "1",
        },
        scale: {
          id: "gif-scale-custom",
          value: "80",
        },
        loop: {
          id: "gif-loop-0",
        },
      },
    };

    const url = mockSettingsUrl(format, {});
    await page.goto(url);

    await expect(page.getByLabel("My Preset")).toBeChecked();

    await page.evaluate(() =>
      window.localStorage.removeItem(
        "wo-images-to-gif-converter-customPresets",
      ),
    );
  });
});

function mockSettingsUrl(format, settings) {
  const url = new URL("http://localhost:5173");
  url.searchParams.set("format", JSON.stringify(format));
  url.searchParams.set("settings", JSON.stringify(settings));
  return url.toString();
}
