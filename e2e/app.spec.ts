import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await page.waitForSelector(".container", { strict: false });
});

test.describe("Basic App", () => {
  test("displays title", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Images To\nGIF Converter" }).first(),
    ).toBeVisible();
  });

  test("displays file input", async ({ page }) => {
    await expect(page.getByLabel("Add Images")).toBeAttached();
  });

  test("displays format settings from config", async ({ page }) => {
    await expect(page.getByLabel("GIF")).toBeVisible();
  });

  test("displays settings from config", async ({ page }) => {
    // Quality
    await page.getByRole("tab", { name: "Quality" }).click();
    await expect(page.getByLabel("Potato", { exact: true })).toBeVisible();
    // ...
    await expect(page.getByLabel("90s", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Ultra", { exact: true })).toBeChecked();

    // Duration/Speed
    await page.getByRole("tab", { name: "Duration/Speed" }).click();
    await expect(page.getByLabel("3s", { exact: true })).toBeChecked();
    await expect(page.getByLabel("5s", { exact: true })).toBeVisible();
    // ...

    // Width
    await page.getByRole("tab", { name: "Width" }).click();
    await expect(page.getByLabel("source", { exact: true })).toBeVisible();
    await expect(page.getByLabel("320px", { exact: true })).toBeChecked();
    await expect(page.getByLabel("640px", { exact: true })).toBeVisible();
    // ...

    // Loop
    await page.getByRole("tab", { name: "Loop" }).click();
    await expect(page.getByLabel("No Loop", { exact: true })).toBeVisible();
    await expect(page.getByLabel("One Loop", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Infinite", { exact: true })).toBeChecked();
  });

  test("display convert button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Create GIF" }),
    ).toBeDisabled();
  });
});

test.describe("Pages", () => {
  test("About page", async ({ page }) => {
    await page.getByRole("link", { name: "About" }).click();
    await expect(page.url()).toBe("http://localhost:5173/#/info");
    await expect(page.getByRole("heading", { name: "About" })).toBeVisible();
    await page.getByRole("link", { name: "Back to Home" }).click();
    await expect(page.url()).toBe("http://localhost:5173/#/");
  });

  test("Preferences page", async ({ page }) => {
    await page.getByRole("link", { name: "Preferences" }).click();
    await expect(page.url()).toBe("http://localhost:5173/#/preferences");
    await expect(
      page.getByRole("heading", { name: "Preferences" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Back to Home" }).click();
    await expect(page.url()).toBe("http://localhost:5173/#/");
  });

  test("Privacy page", async ({ page }) => {
    await page.getByRole("link", { name: "Privacy" }).click();
    await expect(page.url()).toBe("http://localhost:5173/#/privacy");
    await expect(page.getByRole("heading", { name: "Privacy" })).toBeVisible();
    await page.getByRole("link", { name: "Back to Home" }).click();
    await expect(page.url()).toBe("http://localhost:5173/#/");
  });

  test("Imprint page", async ({ page }) => {
    await page.getByRole("link", { name: "Imprint" }).click();
    await expect(page.url()).toBe("http://localhost:5173/#/imprint");
    await expect(page.getByRole("heading", { name: "Imprint" })).toBeVisible();
    await page.getByRole("link", { name: "Back to Home" }).click();
    await expect(page.url()).toBe("http://localhost:5173/#/");
  });

  test("FAQ page", async ({ page }) => {
    await page.getByRole("link", { name: "FAQ" }).click();
    await expect(page.url()).toBe("http://localhost:5173/#/faq");
    await expect(page.getByRole("heading", { name: "FAQ" })).toBeVisible();
    await page.getByRole("link", { name: "Back to Home" }).click();
    await expect(page.url()).toBe("http://localhost:5173/#/");
  });
});
