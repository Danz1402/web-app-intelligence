import { DISCOVERY_CONTRACT_VERSION } from "@wai/shared";

export { createPool, getDatabaseUrl, type Db } from "./db.js";
export { migrate } from "./migrate.js";

export function getContractVersion(): string {
  return DISCOVERY_CONTRACT_VERSION;
}