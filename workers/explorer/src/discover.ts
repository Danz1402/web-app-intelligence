import path from "node:path";
import { BrowserSession } from "@wai/browser";
import {
  DiscoverySessionController,
  captureSnapshot,
  toObservedState,
  detectMeaningfulElements,
  toObservedElements,
  runExplorationLoop,
  ExploreLoopSummary,
} from "@wai/discovery";
import {
  EvidenceStatus,
  Ids,
  type Application,
  type Artifact,
  type Environment,
} from "@wai/shared";
import {
  createPool,
  getDatabaseUrl,
  insertApplication,
  insertArtifact,
  insertDiscoverySession,
  insertEnvironment,
  insertState,
  updateDiscoverySession,
  insertElements,
} from "@wai/storage";

export type DiscoverResult = {
  applicationId: string;
  sessionId: string;
  stateId: string;
  artifactId: string;
  screenshotPath: string;
  explore?: ExploreLoopSummary;
};

export async function discover(url: string, repoRoot: string): Promise<DiscoverResult> {
  const screenshotsDir = path.join(repoRoot, "artifacts/screenshots");
  const db = createPool(getDatabaseUrl());
  const browser = new BrowserSession({
    headless: true,
    screenshotsDir,
  });

  const appId = Ids.application();
  const envId = Ids.environment();
  const artifactId = Ids.artifact();

  const app: Application = {
    id: appId,
    name: new URL(url).hostname,
    baseUrl: new URL(url).origin,
    createdAt: new Date().toISOString(),
  };
  const env: Environment = {
    id: envId,
    applicationId: appId,
    name: "default",
    baseUrl: app.baseUrl,
  };

  const controller = new DiscoverySessionController();
  let session = controller.create({
    applicationId: appId,
    environmentId: envId,
    startUrl: url,
  });

  try {
    await insertApplication(db, app);
    await insertEnvironment(db, env);
    await insertDiscoverySession(db, session);

    session = controller.start();
    await updateDiscoverySession(db, session);

    await browser.start();
    await browser.open(url);



    const hostname = new URL(url).hostname;

const summary = await runExplorationLoop({
  session: browser,
  startUrl: url,
  discoverySessionId: session.id,
  db,
  applicationId: appId,
  limits: {
    maxDepth: 6,
    maxActions: 200,
    maxStates: 80,
    maxRuntimeMs: 600_000,
    allowedDomains: [hostname, "127.0.0.1", "localhost"],
  },
});

const screenshotPath = await browser.screenshot({
  path: path.join(screenshotsDir, `${session.id}.png`),
});

const artifact: Artifact = {
  id: artifactId,
  discoverySessionId: session.id,
  kind: "screenshot",
  path: screenshotPath,
  createdAt: new Date().toISOString(),
  evidenceStatus: EvidenceStatus.OBSERVED,
};
await insertArtifact(db, artifact);

session = controller.complete();
await updateDiscoverySession(db, session);

return {
  applicationId: appId,
  sessionId: session.id,
  stateId: "", // optional: drop or set from summary later
  artifactId,
  screenshotPath,
  explore: summary,
};


  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    try {
      session = controller.fail(message);
      await updateDiscoverySession(db, session);
    } catch {
      // session may not be creatable/updatable if failure was very early
    }
    throw err;
  } finally {
    await browser.close();
    await db.end();
  }
}