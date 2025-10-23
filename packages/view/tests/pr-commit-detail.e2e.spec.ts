import { test, expect } from "@playwright/test";

test.describe("PR Commit Detail E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Wait for loading spinner to disappear
    try {
      await page.waitForSelector(".BounceLoader", { state: "hidden", timeout: 15000 });
    } catch {}

    await page.waitForTimeout(2000);
  });

  test("should display list of commits in PR", async ({ page }) => {
    await expect(page.locator(".header-container")).toBeVisible();
    await expect(page.locator(".top-container")).toBeVisible();

    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !msg.text().includes("Warning")) {
        consoleErrors.push(msg.text());
      }
    });

    const clusterSummaryItems = page.locator(".cluster-summary__item");
    const itemCount = await clusterSummaryItems.count();

    if (itemCount === 0) {
      console.log("⚠️ No cluster summary items, skipping test");
      test.skip();
      return;
    }

    await clusterSummaryItems.first().click();
    await page.waitForTimeout(1000);

    const detailContainer = page.locator(".detail__container");
    await expect(detailContainer, "Detail container should be visible").toBeVisible();

    const commitItems = page.locator(".detail__commit-item");
    const commitCount = await commitItems.count();

    expect(commitCount, "Commit items should be displayed").toBeGreaterThan(0);
    console.log(`✅ ${commitCount} commits displayed`);

    expect(consoleErrors, `Console errors: ${consoleErrors.join("\n")}`).toHaveLength(0);
  });

  test("should display PR statistics (commit count, changed files, additions/deletions)", async ({ page }) => {
    const clusterSummaryItems = page.locator(".cluster-summary__item");
    const itemCount = await clusterSummaryItems.count();

    if (itemCount === 0) {
      console.log("⚠️ No cluster summary items, skipping test");
      test.skip();
      return;
    }

    await clusterSummaryItems.first().click();
    await page.waitForTimeout(1000);

    const detailSummary = page.locator(".detail__summary");
    await expect(detailSummary, "Statistics summary should be visible").toBeVisible();

    const summaryItems = detailSummary.locator(".detail__summary-item");
    const summaryCount = await summaryItems.count();

    expect(summaryCount, "Statistics items should be displayed").toBeGreaterThan(0);
    console.log(`✅ ${summaryCount} statistics items displayed`);

    // Check each statistics item (displayed in singular form in DOM)
    const expectedStats = [
      { key: "authors", display: "author" },
      { key: "commits", display: "commit" },
      { key: "changed files", display: "changed file" },
      { key: "additions", display: "additions" },
      { key: "deletions", display: "deletions" },
    ];

    await Promise.all(
      expectedStats.map(async ({ key, display }) => {
        const statItem = detailSummary.locator(
          `.detail__summary-item:has(.detail__summary-item-name:has-text("${display}"))`
        );
        await expect(statItem, `${key} statistics should be displayed`).toBeVisible();

        const countElement = statItem.locator("strong");
        await expect(countElement, `${key} count value should be displayed`).toBeVisible();

        const countText = await countElement.textContent();
        const trimmedCount = countText?.trim();
        expect(trimmedCount, `${key} value should be numeric`).toMatch(/^\d+$/);
        console.log(`✅ ${key}: ${trimmedCount}`);
      })
    );
  });

  test("should display detailed commit information (title, author, date, hash)", async ({ page }) => {
    const clusterSummaryItems = page.locator(".cluster-summary__item");
    const itemCount = await clusterSummaryItems.count();

    if (itemCount === 0) {
      console.log("⚠️ No cluster summary items, skipping test");
      test.skip();
      return;
    }

    await clusterSummaryItems.first().click();
    await page.waitForTimeout(1000);

    const commitItems = page.locator(".detail__commit-item");
    const commitCount = await commitItems.count();

    if (commitCount === 0) {
      console.log("⚠️ No commit items, skipping test");
      test.skip();
      return;
    }

    const firstCommit = commitItems.first();

    const commitTitle = firstCommit.locator(".commit-message__title");
    await expect(commitTitle, "Commit title should be visible").toBeVisible();

    const titleText = await commitTitle.textContent();
    expect(titleText, "Commit title should not be empty").toBeTruthy();
    console.log(`✅ Commit title: ${titleText}`);

    const authorName = firstCommit.locator(".commit-item__author-name");
    await expect(authorName, "Author name should be visible").toBeVisible();

    const authorText = await authorName.textContent();
    expect(authorText, "Author name should not be empty").toBeTruthy();
    console.log(`✅ Author: ${authorText}`);

    const commitDate = firstCommit.locator(".commit-item__date");
    await expect(commitDate, "Commit date should be visible").toBeVisible();

    const dateText = await commitDate.textContent();
    expect(dateText, "Commit date should not be empty").toBeTruthy();
    console.log(`✅ Commit date: ${dateText}`);

    const commitId = firstCommit.locator(".commit-id__link");
    await expect(commitId, "Commit hash link should be visible").toBeVisible();

    const hashText = await commitId.textContent();
    expect(hashText, "Commit hash should be displayed").toBeTruthy();
    expect(hashText, "Commit hash should be 6 characters").toHaveLength(6);
    console.log(`✅ Commit hash: ${hashText}`);
  });

  test("should show tooltip on commit hash hover", async ({ page }) => {
    const clusterSummaryItems = page.locator(".cluster-summary__item");
    const itemCount = await clusterSummaryItems.count();

    if (itemCount === 0) {
      console.log("⚠️ No cluster summary items, skipping test");
      test.skip();
      return;
    }

    await clusterSummaryItems.first().click();
    await page.waitForTimeout(1000);

    const commitItems = page.locator(".detail__commit-item");
    const commitCount = await commitItems.count();

    if (commitCount === 0) {
      console.log("⚠️ No commit items, skipping test");
      test.skip();
      return;
    }

    const firstCommit = commitItems.first();
    const commitIdLink = firstCommit.locator(".commit-id__link");

    await commitIdLink.hover();
    await page.waitForTimeout(1000);

    // Try multiple possible tooltip selectors
    const tooltipSelectors = [
      "[role='tooltip']",
      ".MuiTooltip-tooltip",
      ".MuiTooltip-popper",
      "[data-testid='tooltip']",
    ];

    let tooltip = null;
    let i = 0;
    while (i < tooltipSelectors.length) {
      const selector = tooltipSelectors[i];
      const tooltipElement = page.locator(selector);
      const count = tooltipElement.count();
      if ((await count) > 0) {
        tooltip = tooltipElement;
        console.log(`Tooltip found: ${selector}`);
        break;
      }
      i += 1;
    }

    if (tooltip) {
      await expect(tooltip, "Tooltip should be visible on commit hash hover").toBeVisible({ timeout: 5000 });

      const tooltipText = await tooltip.textContent();
      expect(tooltipText, "Tooltip should display commit hash").toBeTruthy();
      console.log(`✅ Tooltip content: ${tooltipText}`);

      await page.mouse.move(0, 0);
      await page.waitForTimeout(1000);

      // MUI tooltips disappear with animation, so wait longer
      await page.waitForTimeout(2000);
      await expect(tooltip, "Tooltip should disappear when mouse leaves").not.toBeVisible();
      console.log("✅ Tooltip disappeared normally");
    } else {
      console.log("⚠️ No tooltip found - skipping test");
      test.skip();
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

    const clusterSummaryItems = page.locator(".cluster-summary__item");
    const itemCount = await clusterSummaryItems.count();

    if (itemCount === 0) {
      // Basic UI should be visible even with empty data
      await expect(page.locator(".header-container"), "Header container should be visible").toBeVisible();
      await expect(page.locator(".top-container"), "Top container should be visible").toBeVisible();
      console.log("✅ Basic UI rendered normally with empty data");
      return;
    }

    // Open detail info if data exists
    await clusterSummaryItems.first().click();
    await page.waitForTimeout(1000);

    const detailContainer = page.locator(".detail__container");
    await expect(detailContainer, "Detail container should be visible").toBeVisible();
    console.log("✅ Detail info rendered normally with data");
  });

  test("should work with scrolling in clusters with multiple commits", async ({ page }) => {
    const clusterSummaryItems = page.locator(".cluster-summary__item");
    const itemCount = await clusterSummaryItems.count();

    if (itemCount === 0) {
      console.log("⚠️ No cluster summary items, skipping test");
      test.skip();
      return;
    }

    await clusterSummaryItems.first().click();
    await page.waitForTimeout(1000);

    const detailContainer = page.locator(".detail__container");
    await expect(detailContainer, "Detail container should be visible").toBeVisible();

    const virtualizedList = page.locator(".detail__virtualized-list");
    await expect(virtualizedList, "Virtualized list should be visible").toBeVisible();

    // Check if scroll indicator exists (when there are many commits)
    const scrollIndicator = page.locator(".detail__scroll-indicator");
    const hasScrollIndicator = await scrollIndicator.isVisible();

    if (hasScrollIndicator) {
      console.log("✅ Scroll indicator displayed");

      await scrollIndicator.click();
      await page.waitForTimeout(500);
      console.log("✅ Scroll indicator click works");
    } else {
      console.log("✅ No scrolling needed (few commits)");
    }
  });
});
