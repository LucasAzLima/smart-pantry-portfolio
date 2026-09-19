import { expect, test } from "@playwright/test";

const GUEST_PANTRY_STORAGE_KEY = "smart-pantry-guest-v1";

test.describe("Guest pantry happy path", () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies();
    await page.addInitScript((storageKey: string) => {
      window.localStorage.removeItem(storageKey);
    }, GUEST_PANTRY_STORAGE_KEY);
  });

  test("seeds sample items, filters, searches, and opens edit", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByLabel("Guest mode").first()).toBeVisible();
    await expect(page.getByText("8 items")).toBeVisible();
    await expect(page.getByText("Milk")).toBeVisible();

    await page.getByRole("button", { name: "Fridge" }).click();
    await expect(page.getByText("Milk")).toBeVisible();
    await expect(page.getByText("Olive oil")).toHaveCount(0);

    await page.locator("#pantry-search").fill("milk");
    const pantryList = page.getByRole("list", { name: "Pantry items" });
    await expect(pantryList.getByText("Milk")).toBeVisible();
    await expect(pantryList.getByText("Yogurt")).toHaveCount(0);

    await page.getByRole("button", { name: "Edit Milk" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel("Item name")).toHaveValue("Milk");
  });
});
