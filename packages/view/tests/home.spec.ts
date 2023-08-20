import { test, expect } from "@playwright/test";

test.describe("home", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has title", async ({ page }) => {
    await expect(page).toHaveTitle(/Githru/);
  });

  test("check BranchSelector", async ({ page }) => {
    await expect(page.getByText("Branches:")).toBeVisible();

    const options = await page.locator("section").getByRole("combobox").locator("option");
    const optionValues = await options.evaluateAll((elements) =>
      elements.map((option) => (option as HTMLOptionElement).value)
    );

    expect(optionValues).toContain("dev");
    expect(optionValues).toContain("feat");
    expect(optionValues).toContain("edit");
  });
});
