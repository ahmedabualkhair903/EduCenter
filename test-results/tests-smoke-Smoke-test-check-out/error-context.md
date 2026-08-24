# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\smoke.spec.ts >> Smoke test: /check-out
- Location: tests\smoke.spec.ts:22:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://localhost:3000/check-out", waiting until "networkidle"

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | const routes = [
  4  |   "/",
  5  |   "/_not-found",
  6  |   "/attendance",
  7  |   "/check-out",
  8  |   "/dashboard",
  9  |   "/exams",
  10 |   "/excel",
  11 |   "/groups",
  12 |   "/lessons",
  13 |   "/login",
  14 |   "/messages",
  15 |   "/payments",
  16 |   "/reports",
  17 |   "/settings",
  18 |   "/students",
  19 | ];
  20 | 
  21 | for (const route of routes) {
  22 |   test(`Smoke test: ${route}`, async ({ page }) => {
  23 |     const consoleErrors: string[] = [];
  24 | 
  25 |     page.on("console", (message) => {
  26 |       if (message.type() === "error") {
  27 |         consoleErrors.push(message.text());
  28 |       }
  29 |     });
  30 | 
  31 |     page.on("pageerror", (error) => {
  32 |       consoleErrors.push(error.message);
  33 |     });
  34 | 
> 35 |     const response = await page.goto(
     |                                 ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  36 |       `http://localhost:3000${route}`,
  37 |       {
  38 |         waitUntil: "networkidle",
  39 |       },
  40 |     );
  41 | 
  42 |     expect(
  43 |       response,
  44 |       `No response received for ${route}`,
  45 |     ).not.toBeNull();
  46 | 
  47 |     expect(
  48 |       response!.status(),
  49 |       `Unexpected HTTP status for ${route}`,
  50 |     ).toBeLessThan(400);
  51 | 
  52 |     await expect(page.locator("body")).toBeVisible();
  53 | 
  54 |     expect(
  55 |       consoleErrors,
  56 |       `JavaScript errors found on ${route}`,
  57 |     ).toEqual([]);
  58 |   });
  59 | }
```