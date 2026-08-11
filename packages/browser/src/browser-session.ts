import {
    chromium,
    type Browser,
    type BrowserContext,
    type Page,
  } from "playwright";
  import { BROWSER_ENGINE } from "./constants.js";
  import fs from "node:fs/promises";
import path from "node:path";
import { resolveLocator, type LocatorCandidate } from "./locators.js";

  export type WaitUntil = "load" | "domcontentloaded" | "networkidle" | "commit";

  
  export type BrowserSessionOptions = {
    headless?: boolean;
    /** Default navigation wait. Default: "domcontentloaded" */
    defaultWaitUntil?: WaitUntil;
    /** Navigation timeout in ms. Default: 30000 */
    navigationTimeoutMs?: number;
    screenshotsDir?: string;
    tracesDir?: string;
  };
  export type OpenOptions = {
    waitUntil?: WaitUntil;
    timeoutMs?: number;
  };

  export type ScreenshotOptions = {
    /** Absolute or relative output path. If omitted, a path under screenshotsDir is generated. */
    path?: string;
    fullPage?: boolean;
  };

  export type StopTraceOptions = {
    /** Absolute or relative output path. If omitted, generated under tracesDir. */
    path?: string;
  };
  
  export class BrowserSession {
    private browser: Browser | null = null;
    private context: BrowserContext | null = null;
    private page: Page | null = null;
    private tracing = false;
  
    constructor(private readonly options: BrowserSessionOptions = {}) {}
  
    /** launch → context → page */
    async start(): Promise<void> {
      if (this.browser) {
        throw new Error("BrowserSession already started");
      }
  
      this.browser = await chromium.launch({
        headless: this.options.headless ?? true,
        channel: undefined, // use Playwright's Chromium, not system Chrome
      });
  
      this.context = await this.browser.newContext();
      this.page = await this.context.newPage();
    }

    async open(url: string, options: OpenOptions = {}): Promise<void> {
      const page = this.getPage();
      const waitUntil =
        options.waitUntil ?? this.options.defaultWaitUntil ?? "domcontentloaded";
      const timeout =
        options.timeoutMs ?? this.options.navigationTimeoutMs ?? 30_000;
    
      await page.goto(url, { waitUntil, timeout });
    }

    async click(candidates: LocatorCandidate[]): Promise<void> {
      const locator = resolveLocator(this.getPage(), candidates);
      if (await locator.isDisabled().catch(() => false)) {
        throw new Error("Refusing to click disabled element");
      }
      await locator.click({ timeout: 10_000 });
    }
    async type(candidates: LocatorCandidate[], value: string): Promise<void> {
      const locator = resolveLocator(this.getPage(), candidates);
      if (await locator.isDisabled().catch(() => false)) {
        throw new Error("Refusing to type into disabled element");
      }
      await locator.fill(value, { timeout: 10_000 });
    }
    async select(candidates: LocatorCandidate[], value: string): Promise<void> {
      const locator = resolveLocator(this.getPage(), candidates);
      if (await locator.isDisabled().catch(() => false)) {
        throw new Error("Refusing to select on disabled element");
      }
      await locator.selectOption(value, { timeout: 10_000 });
    }

    async screenshot(options: ScreenshotOptions = {}): Promise<string> {
      const page = this.getPage();
      const dir = this.options.screenshotsDir ?? "artifacts/screenshots";
      const outPath =
        options.path ??
        path.join(dir, `screenshot-${Date.now()}.png`);
      await fs.mkdir(path.dirname(outPath), { recursive: true });
      await page.screenshot({
        path: outPath,
        fullPage: options.fullPage ?? false,
      });
      return outPath;
    }

    async startTrace(): Promise<void> {
      const context = this.getContext();
      if (this.tracing) {
        throw new Error("Trace already started");
      }
      await context.tracing.start({
        screenshots: true,
        snapshots: true,
        sources: false,
      });
      this.tracing = true;
    }
    
    async stopTrace(options: StopTraceOptions = {}): Promise<string> {
      const context = this.getContext();
      if (!this.tracing) {
        throw new Error("Trace not started");
      }
    
      const dir = this.options.tracesDir ?? "artifacts/traces";
      const outPath =
        options.path ?? path.join(dir, `trace-${Date.now()}.zip`);
    
      await fs.mkdir(path.dirname(outPath), { recursive: true });
      await context.tracing.stop({ path: outPath });
      this.tracing = false;
      return outPath;
    }
  
    getPage(): Page {
      if (!this.page) {
        throw new Error("BrowserSession not started");
      }
      return this.page;
    }
  
    getContext(): BrowserContext {
      if (!this.context) {
        throw new Error("BrowserSession not started");
      }
      return this.context;
    }
  
    getEngine(): typeof BROWSER_ENGINE {
      return BROWSER_ENGINE;
    }
  
    /** Close page/context/browser. Safe to call more than once. */
    async close(): Promise<void> {
      if (this.tracing && this.context) {
        const dir = this.options.tracesDir ?? "artifacts/traces";
        const outPath = path.join(dir, `trace-aborted-${Date.now()}.zip`);
        await fs.mkdir(path.dirname(outPath), { recursive: true });
        await this.context.tracing.stop({ path: outPath }).catch(() => undefined);
        this.tracing = false;
      }
      if (this.page) {
        await this.page.close().catch(() => undefined);
        this.page = null;
      }
      if (this.context) {
        await this.context.close().catch(() => undefined);
        this.context = null;
      }
      if (this.browser) {
        await this.browser.close().catch(() => undefined);
        this.browser = null;
      }
    }
  }