import { test, expect } from "@playwright/test";

test.describe("home", () => {
  const CLICK_INDEX = 0;
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has title", async ({ page }) => {
    await expect(page).toHaveTitle(/Githru/);
  });

  test("opens detail container on cluster click", async ({ page }) => {
    await page.waitForSelector(".cluster-graph__container", { state: "attached" });
    const childContainers = await page.$$(".cluster-graph__container");

    if (childContainers.length > CLICK_INDEX) {
      await childContainers[CLICK_INDEX].scrollIntoViewIfNeeded();
      await childContainers[CLICK_INDEX].click();
    } else {
      throw new Error("No child containers found");
    }

    // waiting for changing
    await page.waitForTimeout(10000);

    const detailContainer = await page.waitForSelector(".detail__container");
    expect(detailContainer).toBeTruthy();
  });
});
