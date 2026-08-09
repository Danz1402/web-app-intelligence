import { DISCOVERY_CONTRACT_VERSION } from "@wai/shared";

/** Storage package entry. DB client comes in 1.7. */
export function getContractVersion(): string {
  return DISCOVERY_CONTRACT_VERSION;
}
