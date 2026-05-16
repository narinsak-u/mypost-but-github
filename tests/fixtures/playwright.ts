import { test as base, expect, type Page } from "@playwright/test";

/**
 * Custom fixtures for Playwright tests.
 */
export const test = base.extend<{
  /**
   * Automatically navigate to home and attempt to sign in if the sign-in button is visible.
   */
  loginAsUser: () => Promise<void>;
}>({
  loginAsUser: async ({ page }: { page: Page }, use: (fn: () => Promise<void>) => Promise<void>) => {
    const login = async (): Promise<void> => {
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
