import { expect, test } from "@playwright/test";

const fakeUser = {
  id: "user_123",
  stellarPublicKey: "GBAIXQ3G4Y5QX5X5Y7OUQ3F2R2Q7H7VKS4NQO72L7K5R4S7A3TUJS5NQ",
  displayName: "Ava Patel",
  avatarUrl: null,
  createdAt: "2024-01-01T00:00:00.000Z",
};

test("user can navigate from the landing page and create a group", async ({ page }) => {
  await page.route("**/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ user: fakeUser }),
    });
  });

  await page.route("**/groups", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ groups: [] }),
      });
      return;
    }

    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        group: {
          id: "group_123",
          name: "Trip to Kyoto",
          description: "Spring getaway",
          createdByUserId: fakeUser.id,
          treasuryEnabled: false,
          treasuryAccountPublicKey: null,
          treasuryRequiredSigners: null,
          archived: false,
          createdAt: "2024-01-02T00:00:00.000Z",
        },
      }),
    });
  });

  await page.route("**/groups/group_123", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        group: {
          id: "group_123",
          name: "Trip to Kyoto",
          description: "Spring getaway",
          createdByUserId: fakeUser.id,
          treasuryEnabled: false,
          treasuryAccountPublicKey: null,
          treasuryRequiredSigners: null,
          archived: false,
          createdAt: "2024-01-02T00:00:00.000Z",
        },
        members: [
          {
            id: "member_1",
            groupId: "group_123",
            userId: fakeUser.id,
            role: "admin",
            joinedAt: "2024-01-02T00:00:00.000Z",
            user: fakeUser,
          },
        ],
        yourRole: "admin",
      }),
    });
  });

  await page.route("**/groups/group_123/expenses", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ expenses: [] }),
    });
  });

  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /split bills\. settle on stellar\./i })
  ).toBeVisible();
  await page.getByRole("link", { name: /launch app/i }).first().click();

  await expect(page).toHaveURL(/\/login$/);
  await page.evaluate((user) => {
    localStorage.setItem(
      "mergepay.token",
      JSON.stringify({ state: { token: "dev-test-token", user }, version: 1 })
    );
  }, fakeUser);
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: /hi, ava/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /new group/i })).toBeVisible();

  await page.getByRole("button", { name: /new group/i }).click();

  const dialog = page.getByRole("dialog", { name: /new group/i });
  await expect(dialog).toBeVisible();

  await dialog.getByLabel("Group name").fill("Trip to Kyoto");
  await dialog.getByLabel("Description (optional)").fill("Spring getaway");
  await dialog.getByRole("button", { name: /^Create group$/i }).click();

  await page.waitForURL(/\/groups\/group_123$/);
  await expect(page).toHaveURL(/\/groups\/group_123$/);
  await expect(page.getByRole("heading", { name: /trip to kyoto/i })).toBeVisible();
});