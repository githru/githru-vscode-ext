import { test, expect } from "@playwright/test";

test.describe("home", () => {
  const CLICK_INDEX = 0;
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has title", async ({ page }) => {
    await expect(page).toHaveTitle(/Githru/);
  });

  test("when click cluster", async ({ page }) => {
    await page.waitForSelector(".cluster-graph");

    await page.waitForSelector(".cluster-graph > .cluster-graph__container", { state: "attached" });

    const childContainers = await page.$$(".cluster-graph > .cluster-graph__container");

    if (childContainers.length > CLICK_INDEX) {
      await childContainers[CLICK_INDEX].scrollIntoViewIfNeeded();
      await childContainers[CLICK_INDEX].click();
    } else {
      throw new Error("No child containers found");
    }

    // waiting for changing
    await page.waitForTimeout(1000);

    const newChildContainers = await page.$$(".cluster-graph > .cluster-graph__container");

    const targetIndexForCheck = CLICK_INDEX + 1;
    const transformPositionForCheck = 10 + targetIndexForCheck * 50 + 220;
    if (newChildContainers.length > targetIndexForCheck) {
      const transformValue = await newChildContainers[targetIndexForCheck].getAttribute("transform");

      if (transformValue !== null) {
        expect(transformValue).toBe(`translate(2, ${transformPositionForCheck})`);
      } else {
        throw new Error("Transform attribute not found");
      }
    } else {
      throw new Error("Not enough child containers found");
    }
  });
});
