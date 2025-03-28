import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await page.waitForSelector(".container", { strict: false });
});

test.afterEach(async ({ page }) => {
  await page.evaluate(() =>
    window.localStorage.removeItem("wo-images-to-gif-customPresets"),
  );
});

test.describe("Custom Presets", () => {
  test("adds custom preset ", async ({ page }) => {
    await page.getByRole("button", { name: "+ Add" }).click();
    await expect(page.getByLabel("Preset Name")).toHaveValue("My Preset");

    await page.getByLabel("Preset Name").fill("Custom Preset");
    await page.getByLabel("Duration in Seconds").fill("11");
    await page.getByLabel("width (empty for original)").fill("123");

    await page.getByRole("button", { name: "Save Preset" }).click();

    await expect(page.getByLabel("Custom Preset")).toBeChecked();
  });

  test("deletes custom preset", async ({ page }) => {
    await createCustomSettings(page);

    // accept confirm dialog
    page.on("dialog", (dialog) => dialog.accept());

    await page.getByTitle("Remove").click();
    await expect(page.getByLabel("Custom Preset")).not.toBeAttached();
  });

  test("doesnt delete if confirm dialog is cancelled", async ({ page }) => {
    await createCustomSettings(page);

    // cancel confirm dialog
    page.on("dialog", (dialog) => dialog.dismiss());

    await page.getByTitle("Remove").click();
    await expect(page.getByLabel("Custom Preset")).toBeChecked();
  });

  test("show warning if name exists", async ({ page }) => {
    await createCustomSettings(page);

    await page.getByRole("button", { name: "+ Add Preset" }).click();
    await page.getByLabel("Preset Name").fill("Custom Preset");

    await expect(page.getByText("name already exists")).toBeVisible();
  });
});

async function createCustomSettings(page) {
  await page.getByRole("button", { name: "+ Add Preset" }).click();

  await page.getByLabel("Preset Name").fill("Custom Preset");

  await page.getByRole("button", { name: "Save Preset" }).click();
  await expect(page.getByLabel("Custom Preset")).toBeChecked();
}
