import { test, expect } from "@playwright/test";
import path from "path";

const __dirname = path.resolve() + "/e2e";
const __tempDir = path.resolve() + "/e2e/temp";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:5173/#/preferences");
});

test.afterEach(async ({ page }) => {
  await page.evaluate(() =>
    window.localStorage.removeItem("wo-images-to-gif-customPresets"),
  );
});

test.describe("Preferences", () => {
  test("import custom presets", async ({ page }) => {
    await addPresets(page);

    // open modal and set file
    await page.getByRole("button", { name: "Import Presets" }).click();
    await page
      .getByLabel("Selecte Preset File")
      .setInputFiles(path.join(__dirname, "images-to-gif-presets.json"));

    // check preview
    await expect(page.getByText("images-to-gif-presets.json")).toBeVisible();
    await expect(page.getByText("My Preset")).toBeVisible();
    await expect(page.getByText("Test 2 - already exists")).toBeVisible();

    // import
    await page
      .getByRole("button", { name: "Import Presets", exact: true })
      .click();
    await expect(page.getByText("Import complete")).toBeVisible();

    // close modal, prefrerences page
    await page.getByRole("button", { name: "Close" }).click();
    await page.getByRole("link", { name: "Back to Home" }).click();

    // check if presets are imported
    await expect(page.getByLabel("My Preset")).toBeVisible();
    await expect(page.getByLabel("Test 2")).toBeVisible();
  });

  test("import replace existing presets", async ({ page }) => {
    await addPresets(page);

    // open modal and set file
    await page.getByRole("button", { name: "Import presets" }).click();
    await page
      .getByLabel("Selecte Preset File")
      .setInputFiles(path.join(__dirname, "images-to-gif-presets.json"));

    // import
    await page.getByLabel("replace all").check();
    await page
      .getByRole("button", { name: "Import Presets", exact: true })
      .click();

    // close modal, prefrerences page
    await page.getByRole("button", { name: "Close" }).click();
    await page.getByRole("link", { name: "Back to Home" }).click();

    // check if presets are imported
    await expect(page.getByLabel("Existing Preset")).not.toBeAttached();
    await expect(page.getByLabel("My Preset")).toBeVisible();
    await expect(page.getByLabel("Test 2")).toBeVisible();
  });
});

async function addPresets(page) {
  await page.evaluate(() => {
    window.localStorage.setItem(
      "wo-images-to-gif-customPresets",
      JSON.stringify([
        {
          id: "Existing Preset",
          label: "Existing Preset",
          value: "Existing Preset",
          ext: "gif",
          mimetype: "image/gif",
          isCustomPreset: false,
          isRemovable: true,
          selectedSettings: {
            filter_complex: { id: "filter_complex-8" },
            duration: { id: "gif-duration-custom", value: "0.5" },
            scale: { id: "gif-scale-custom", value: "80" },
            loop: { id: "gif-loop-0" },
          },
        },
        {
          id: "2",
          label: "Test 2",
          value: "val2",
          ext: "gif",
          mimetype: "image/gif",
          isCustomPreset: false,
          isRemovable: true,
          selectedSettings: {
            filter_complex: { id: "filter_complex-8" },
            duration: { id: "gif-duration-custom", value: "0.5" },
            scale: { id: "gif-scale-custom", value: "80" },
            loop: { id: "gif-loop-0" },
          },
        },
      ]),
    );
  });
}
