// packages/sovereignty/runtime/SovereignResidencyEnforcementEngine.ts

export type SovereignZoneId =
  | "EU_SOVEREIGN"
  | "US_SOVEREIGN"
  | "FINANCE_GLOBAL"
  | "HEALTH_GLOBAL"
  | "GOV_NATIONAL";

export interface ResidencyRule {
  zone: SovereignZoneId;
  allowedRegions: string[];
  forbiddenRegions: string[];
}

export interface WorkloadResidencyProfile {
  workloadId: string;
  residencyLocked: boolean;
  requiredZones: SovereignZoneId[];
}

export interface ResidencyDecision {
  allowed: boolean;
  reason: string;
}

/**
 * Enforces residency rules ensuring workloads never leave allowed regions.
 * Residency is a hard constraint checked before any routing or optimization decisions.
 */
export class SovereignResidencyEnforcementEngine {
  private regions: Map<string, SovereignZoneId[]>;
  private rules: Map<SovereignZoneId, ResidencyRule>;

  constructor(
    regions: Map<string, SovereignZoneId[]>,
    rules: ResidencyRule[]
  ) {
    this.regions = regions;
    this.rules = new Map(rules.map((r) => [r.zone, r]));
  }

  /**
   * Decide whether a workload may move from one region to another.
   */
  decideMove(
    workload: WorkloadResidencyProfile,
    fromRegionId: string,
    toRegionId: string
  ): ResidencyDecision {
    if (!workload.residencyLocked) {
      return { allowed: true, reason: "Workload is not residency-locked" };
    }

    for (const zone of workload.requiredZones) {
      const rule = this.rules.get(zone);
      if (!rule) {
        return {
          allowed: false,
          reason: `No residency rule for zone ${zone}`,
        };
      }

      const forbiddenRegions = new Set(rule.forbiddenRegions);
      const allowedRegions = new Set(rule.allowedRegions);

      if (forbiddenRegions.has(toRegionId)) {
        return {
          allowed: false,
          reason: `Region ${toRegionId} forbidden for zone ${zone}`,
        };
      }

      if (
        allowedRegions.size > 0 &&
        !allowedRegions.has(toRegionId)
      ) {
        return {
          allowed: false,
          reason: `Region ${toRegionId} not in allowed set for zone ${zone}`,
        };
      }
    }

    return {
      allowed: true,
      reason: "All residency rules satisfied",
    };
  }
}
