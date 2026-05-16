import { test as base, expect } from "@playwright/test";

export const test = base.extend<{
  loginAsUser: () => Promise<void>;
}>({
  loginAsUser: async ({ page }, use) => {
    const login = async () => {
      await page.goto("/");
      const signInButton = page
        .getByRole("button", { name: /sign in|log in|login/i })
        .first();
      if (await signInButton.isVisible()) {
        await signInButton.click();
      }
    };
    await use(login);
  },
});

export { expect };
