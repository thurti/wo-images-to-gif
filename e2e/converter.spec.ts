import { test, expect } from "@playwright/test";
import path from "path";

const __dirname = path.resolve() + "/e2e";
const __tempDir = path.resolve() + "/e2e/temp";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await page.waitForSelector(".container", { strict: false });

  await page
    .getByLabel("Add Images")
    .setInputFiles([
      path.join(__dirname, "test.jpg"),
      path.join(__dirname, "test2.jpg"),
    ]);

  await expect(page.getByRole("img", { name: "Preview" })).toHaveCount(2);
});

test.describe("Load/Remove File(s)", () => {
  test("convert button is enabled", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Create GIF" }),
    ).toBeEnabled();
  });

  test("removes all files", async ({ page }) => {
    await page.getByRole("button", { name: "Remove All Images" }).click();

    await expect(page.getByRole("img", { name: "Preview" })).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Create GIF" }),
    ).toBeDisabled();
  });
});

test.describe("Convert", () => {
  test("converts files with default settings", async ({ page }) => {
    await page.getByRole("button", { name: "Create GIF" }).click();

    // preview gif
    await expect(
      page.getByRole("img", { name: "Preview" }).nth(2),
    ).toBeVisible();

    // download button
    await expect(page.getByRole("button", { name: "Download" })).toBeVisible();
  });
});
