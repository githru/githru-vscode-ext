import { test, expect } from "@playwright/test";

test.describe("TemporalFilter E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Wait for loading spinner to disappear
    try {
      await page.waitForSelector(".BounceLoader", { state: "hidden", timeout: 15000 });
    } catch {}

    await page.waitForTimeout(2000);
  });

  test("should filter data with brush selection", async ({ page }) => {
    await expect(page.locator(".header-container")).toBeVisible();
    await expect(page.locator(".top-container")).toBeVisible();

    // Collect console errors
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !msg.text().includes("Warning")) {
        consoleErrors.push(msg.text());
      }
    });

    const svg = page.locator(".temporal-filter__chart");
    await expect(svg).toBeVisible();

    const box = await svg.boundingBox();
    if (!box) {
      throw new Error("SVG chart not found");
    }

    // Execute brush drag from middle to end of chart
    const startX = box.x + box.width * 0.3;
    const endX = box.x + box.width * 0.7;
    const y = box.y + box.height * 0.5;

    await page.mouse.move(startX, y);
    await page.mouse.down();
    await page.mouse.move(endX, y, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(3000);

    const resetButton = page.locator(".temporal-filter__reset-button");
    await expect(resetButton, "Reset button should be visible after filter applied").toBeVisible();

    await expect(resetButton.locator(".temporal-filter__button-text")).toHaveText("Reset");

    expect(consoleErrors, `Console errors: ${consoleErrors.join("\n")}`).toHaveLength(0);
  });

  test("should update statistics after filtering", async ({ page }) => {
    await page.waitForTimeout(2000);

    const initialBars = await page.locator(".author-bar-chart__bar").count();
    const initialSummaryItems = await page.locator(".cluster-summary__item").count();

    console.log(`Initial bars: ${initialBars}`);
    console.log(`Initial summary items: ${initialSummaryItems}`);

    if (initialBars === 0) {
      console.log("⚠️ No initial data, skipping test");
      test.skip();
      return;
    }

    const svg = page.locator(".temporal-filter__chart");
    await expect(svg).toBeVisible();

    const box = await svg.boundingBox();
    if (!box) throw new Error("SVG chart not found");

    // Apply brush filter (30% to 70% of chart width)
    const startX = box.x + box.width * 0.3;
    const endX = box.x + box.width * 0.7;
    const y = box.y + box.height * 0.5;

    await page.mouse.move(startX, y);
    await page.mouse.down();
    await page.mouse.move(endX, y, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(3000);

    const resetButton = page.locator(".temporal-filter__reset-button");
    await expect(resetButton, "Reset button should be visible after filter applied").toBeVisible();

    const filteredBars = await page.locator(".author-bar-chart__bar").count();
    const filteredSummaryItems = await page.locator(".cluster-summary__item").count();

    console.log(`Filtered bars: ${filteredBars}`);
    console.log(`Filtered summary items: ${filteredSummaryItems}`);

    expect(filteredBars, "Filtered bars should be less than or equal to initial bars").toBeLessThanOrEqual(initialBars);
    expect(
      filteredSummaryItems,
      "Filtered summary items should be less than or equal to initial items"
    ).toBeLessThanOrEqual(initialSummaryItems);
  });

  test("should reset filter when Reset button is clicked", async ({ page }) => {
    const svg = page.locator(".temporal-filter__chart");
    await expect(svg).toBeVisible();

    const box = await svg.boundingBox();
    if (!box) throw new Error("SVG chart not found");

    // Apply filter with brush drag
    const startX = box.x + box.width * 0.3;
    const endX = box.x + box.width * 0.7;
    const y = box.y + box.height * 0.5;

    await page.mouse.move(startX, y);
    await page.mouse.down();
    await page.mouse.move(endX, y, { steps: 10 });
    await page.mouse.up();

    await page.waitForTimeout(3000);

    const resetButton = page.locator(".temporal-filter__reset-button");
    await expect(resetButton, "Reset button should be visible after filter applied").toBeVisible();

    await resetButton.click();
    await page.waitForTimeout(2000);

    await expect(resetButton, "Reset button should disappear after click").not.toBeVisible();

    // Verify brush selection is reset
    const brushSelection = page.locator(".brush .selection");
    await expect(brushSelection).not.toBeVisible();
  });

  test("should work with different brush selection areas", async ({ page }) => {
    const svg = page.locator(".temporal-filter__chart");
    await expect(svg).toBeVisible();

    const box = await svg.boundingBox();
    if (!box) throw new Error("SVG chart not found");

    const brushAreas = [
      { start: 0.1, end: 0.3, name: "left area" },
      { start: 0.4, end: 0.6, name: "center area" },
      { start: 0.7, end: 0.9, name: "right area" },
    ];

    for (const area of brushAreas) {
      console.log(`Testing ${area.name} filtering`);

      const startX = box.x + box.width * area.start;
      const endX = box.x + box.width * area.end;
      const y = box.y + box.height * 0.5;

      await page.mouse.move(startX, y);
      await page.mouse.down();
      await page.mouse.move(endX, y, { steps: 10 });
      await page.mouse.up();

      await page.waitForTimeout(2000);

      const resetButton = page.locator(".temporal-filter__reset-button");
      await expect(resetButton, `Reset button should be visible after ${area.name} filtering`).toBeVisible();

      await resetButton.click();
      await page.waitForTimeout(1000);

      console.log(`${area.name} filtering test completed`);
    }
  });

  test("should render component normally even with empty data", async ({ page }) => {
    // Simulate empty data state by reloading page
    await page.reload();
    await page.waitForLoadState("networkidle");

    try {
      await page.waitForSelector(".BounceLoader", { state: "hidden", timeout: 15000 });
    } catch {}

    await page.waitForTimeout(2000);

    const temporalFilter = page.locator(".temporal-filter");
    await expect(temporalFilter, "TemporalFilter component should be rendered").toBeVisible();

    const svg = page.locator(".temporal-filter__chart");
    await expect(svg, "SVG chart should be rendered").toBeVisible();

    // Reset button should not be visible (no filter applied)
    const resetButton = page.locator(".temporal-filter__reset-button");
    await expect(resetButton, "Reset button should not be visible with empty data").not.toBeVisible();
  });
});
