import {
    Ids,
    type ApplicationId,
    type DiscoverySession,
    type DiscoverySessionId,
    type DiscoverySessionStatus,
    type EnvironmentId,
    type RoleProfileId,
  } from "@wai/shared";
  
  export type CreateDiscoverySessionInput = {
    applicationId: ApplicationId;
    environmentId: EnvironmentId;
    startUrl: string;
    roleProfileId?: RoleProfileId;
    id?: DiscoverySessionId;
  };
  
  export class DiscoverySessionController {
    private session: DiscoverySession | null = null;
  
    create(input: CreateDiscoverySessionInput): DiscoverySession {
      if (this.session) {
        throw new Error("DiscoverySession already created on this controller");
      }
  
      this.session = {
        id: input.id ?? Ids.discoverySession(),
        applicationId: input.applicationId,
        environmentId: input.environmentId,
        status: "pending",
        startedAt: new Date().toISOString(),
        browser: "chromium",
        startUrl: input.startUrl,
        roleProfileId: input.roleProfileId,
      };
  
      return this.getSession();
    }
  
    start(): DiscoverySession {
      const session = this.requireSession();
      this.assertStatus(session, ["pending"]);
      session.status = "running";
      session.startedAt = new Date().toISOString();
      return this.getSession();
    }
  
    complete(): DiscoverySession {
      const session = this.requireSession();
      this.assertStatus(session, ["running"]);
      session.status = "completed";
      session.endedAt = new Date().toISOString();
      session.errorMessage = undefined;
      return this.getSession();
    }
  
    fail(errorMessage: string): DiscoverySession {
      const session = this.requireSession();
      this.assertStatus(session, ["pending", "running"]);
      session.status = "failed";
      session.endedAt = new Date().toISOString();
      session.errorMessage = errorMessage;
      return this.getSession();
    }
  
    getSession(): DiscoverySession {
      return structuredClone(this.requireSession());
    }
  
    private requireSession(): DiscoverySession {
      if (!this.session) {
        throw new Error("DiscoverySession not created");
      }
      return this.session;
    }
  
    private assertStatus(
      session: DiscoverySession,
      allowed: DiscoverySessionStatus[],
    ): void {
      if (!allowed.includes(session.status)) {
        throw new Error(
          `Invalid session transition from status "${session.status}"`,
        );
      }
    }
  }