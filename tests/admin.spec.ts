import { expect, test, type Page, type APIRequestContext } from "@playwright/test";

const API = "http://127.0.0.1:4401";

async function control(request: APIRequestContext, query: string) {
  const result = await request.get(API + "/__control?" + query);
  expect(result.ok()).toBeTruthy();
}

async function signIn(page: Page, password = "demo-pass") {
  await page.getByLabel("Username", { exact: true }).fill("demo");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
}

async function fillProduct(page: Page, title: string) {
  await page.getByLabel("Product title").fill(title);
  await page.getByLabel("Description", { exact: false }).fill("A bag for everyday use");
  await page.getByLabel("Price (toman)").fill("۲۴۹۹۰۰۰");
  await page.getByLabel("Category").selectOption("women's clothing");
  await page.getByLabel("Image URL").fill(API + "/photos/bag.jpg");
}

test.beforeEach(async ({ page, request }) => {
  await control(request, "reset=1");
  await page.addInitScript(() => {
    if (!localStorage.getItem("nova-admin:locale")) localStorage.setItem("nova-admin:locale", "en");
  });
});

test("gates deep links, validates credentials, returns to the intended page and signs out", async ({
  page,
  request,
}) => {
  await page.goto("/users/new");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Sign in to NOVA Admin" })).toBeVisible();
  const stats = await (await request.get(API + "/__stats")).json();
  expect(stats.requests["/users"]).toBeUndefined();
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText("Complete the highlighted fields.");
  await signIn(page, "wrong");
  await expect(page.getByRole("alert")).toContainText("The username or password is incorrect.");
  await signIn(page);
  await expect(page).toHaveURL(/\/users\/new$/);
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(
    "fixture-demo-token"
  );
});

test("preserves the failed product form and adds rows with repeated mock IDs", async ({
  page,
  request,
}) => {
  await page.goto("/login");
  await signIn(page);
  await expect(page.getByRole("table")).toContainText("Everyday Sneakers");
  await page.getByRole("link", { name: "Add product" }).click();
  await expect(page.getByLabel("Category").locator("option")).toHaveCount(5);
  await page.getByRole("button", { name: "Save product" }).click();
  await expect(page.getByRole("alert")).toContainText("Review the form");
  await fillProduct(page, "City Sling Bag A");
  await control(request, "mode=reject-post");
  await page.getByRole("button", { name: "Save product" }).click();
  await expect(page.getByRole("alert")).toContainText("The record was not saved");
  await expect(page.getByLabel("Product title")).toHaveValue("City Sling Bag A");
  await control(request, "mode=slow-post");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("button", { name: "Saving…" })).toBeDisabled();
  await expect(page.getByRole("table")).toContainText("City Sling Bag A");
  await control(request, "mode=ok");
  await page.getByRole("link", { name: "Add product" }).click();
  await fillProduct(page, "City Sling Bag B");
  await page.getByRole("button", { name: "Save product" }).click();
  await expect(page.getByRole("table")).toContainText("City Sling Bag A");
  await expect(page.getByRole("table")).toContainText("City Sling Bag B");
  await page.getByRole("searchbox").fill("City Sling Bag B");
  await expect(page.getByRole("row")).toHaveCount(2);
  const stats = await (await request.get(API + "/__stats")).json();
  expect(stats.mutations["/products"]).toBe(3);
});

test("shows user loading, empty, request error and recovery, then creates a sanitized user", async ({
  page,
  request,
}) => {
  await page.goto("/users");
  await control(request, "mode=slow");
  await signIn(page);
  await expect(page.getByText("Loading…", { exact: true })).toBeVisible();
  await expect(page.getByRole("table")).toContainText("Ava Ahmadi");
  await page.getByRole("searchbox").fill("nobody");
  await expect(page.getByRole("heading", { name: "No matching results" })).toBeVisible();
  await page.getByRole("button", { name: "Clear search" }).click();
  await page.getByRole("link", { name: "Products", exact: true }).click();
  await control(request, "mode=error");
  await page.getByRole("link", { name: "Users", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Users could not be loaded");
  await control(request, "mode=empty");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("heading", { name: "No users yet" })).toBeVisible();
  await page.getByRole("link", { name: "Add user" }).click();
  await page.getByLabel("First name").fill("Parsa");
  await page.getByLabel("Last name").fill("Moradi");
  await page.getByLabel("Username").fill("parsa.moradi");
  await page.getByLabel("Email").fill("parsa@example.com");
  await page.getByLabel("Password *", { exact: true }).fill("fixture-only-password");
  await page.getByLabel("Phone").fill("۰۹۱۲۳۴۵۶۷۸۹");
  await page.getByRole("button", { name: "Save user" }).click();
  await expect(page.getByRole("table")).toContainText("Parsa Moradi");
  await expect(page.getByRole("table")).not.toContainText("fixture-only-password");
  await page.reload();
  await expect(page).toHaveURL(/\/login$/);
});

test("matches the desktop layout widths and captures representative Figma states", async ({
  page,
  request,
}, info) => {
  await control(request, "locale=fa");
  await page.goto("/login");
  await page.getByRole("button", { name: "فارسی" }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: info.outputPath("admin-login.png"),
    fullPage: true,
    caret: "initial",
  });
  await page.getByLabel("نام کاربری", { exact: true }).fill("demo");
  await page.getByLabel("رمز عبور", { exact: true }).fill("demo-pass");
  await page.getByRole("button", { name: "ورود", exact: true }).click();
  await expect(page.getByRole("table")).toContainText("کتانی ورزشی");
  await page.getByRole("button", { name: "تغییر پوسته" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page
    .locator("table img")
    .first()
    .evaluate((node) => (node as HTMLImageElement).decode());
  await page.screenshot({
    path: info.outputPath("admin-products-dark.png"),
    fullPage: true,
    caret: "initial",
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(1280);
  await page.getByRole("link", { name: "افزودن محصول" }).click();
  await expect(page.getByRole("heading", { name: "افزودن محصول" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(1280);
  await page.setViewportSize({ width: 1440, height: 920 });
  await page.screenshot({
    path: info.outputPath("admin-create-product.png"),
    fullPage: true,
    caret: "initial",
  });
});
