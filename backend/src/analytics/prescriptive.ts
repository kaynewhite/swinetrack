// Rule-based prescriptive analytics engine
// Based on FAO guidelines, WOAH standards, and Philippine BAI protocols

export interface PrescriptiveInput {
  municipality: string;
  riskLevel: "low" | "moderate" | "high" | "critical";
  diseaseCategory: "high_risk_viral" | "bacterial" | "parasitic";
  diseaseName: string;
  predictedCases: number;
  trendSlope: number;
  farmCount: number;
}

export interface Recommendation {
  actionType: string;
  recommendation: string;
  priority: "low" | "medium" | "high" | "urgent";
}

const VIRAL_DISEASES = ["African Swine Fever", "PRRS", "Classical Swine Fever"];

export function generateRecommendations(input: PrescriptiveInput): Recommendation[] {
  const recs: Recommendation[] = [];
  const { riskLevel, diseaseCategory, diseaseName, trendSlope, municipality } = input;
  const isViral = diseaseCategory === "high_risk_viral" || VIRAL_DISEASES.includes(diseaseName);
  const isRising = trendSlope > 0;

  // === CRITICAL RISK ===
  if (riskLevel === "critical") {
    recs.push({
      actionType: "Quarantine",
      recommendation: `Impose immediate full quarantine on ${municipality}. No swine movement in or out. Notify BAI and PAO within 24 hours.`,
      priority: "urgent",
    });
    if (isViral) {
      recs.push({
        actionType: "Culling Protocol",
        recommendation: `Initiate controlled depopulation of affected herds in high-density areas. Follow BAI culling protocols and ensure proper carcass disposal.`,
        priority: "urgent",
      });
      recs.push({
        actionType: "Movement Restriction",
        recommendation: `Suspend all meat transport permits originating from ${municipality}. Issue movement ban on live animals.`,
        priority: "urgent",
      });
    }
    recs.push({
      actionType: "Emergency Response",
      recommendation: `Deploy rapid response veterinary team to ${municipality} within 48 hours. Conduct emergency farm inspections.`,
      priority: "urgent",
    });
    recs.push({
      actionType: "Biosecurity Enhancement",
      recommendation: `Mandatory disinfection of all farm entry points in ${municipality}. Enforce strict visitor protocols and PPE use.`,
      priority: "urgent",
    });
  }

  // === HIGH RISK ===
  else if (riskLevel === "high") {
    recs.push({
      actionType: "Movement Restriction",
      recommendation: `Restrict swine transport from ${municipality}. All permits require MAO-level approval with veterinary clearance.`,
      priority: "high",
    });
    recs.push({
      actionType: "Enhanced Surveillance",
      recommendation: `Conduct mandatory weekly disease surveillance in all farms in ${municipality}. Report all suspected cases within 24 hours.`,
      priority: "high",
    });
    if (isViral) {
      recs.push({
        actionType: "Quarantine Zone",
        recommendation: `Establish 3km control zone around reported outbreak farms. Restrict access to essential personnel only.`,
        priority: "high",
      });
    }
    recs.push({
      actionType: "Biosecurity",
      recommendation: `Require all farms in ${municipality} to implement enhanced biosecurity: perimeter fencing, visitor logs, and disinfection stations.`,
      priority: "high",
    });
  }

  // === MODERATE RISK ===
  else if (riskLevel === "moderate") {
    recs.push({
      actionType: "Increased Monitoring",
      recommendation: `Increase inspection frequency to bi-weekly for all farms in ${municipality}. Submit monthly disease summary reports to MAO.`,
      priority: "medium",
    });
    recs.push({
      actionType: "Biosecurity Advisory",
      recommendation: `Issue biosecurity advisory to all farms in ${municipality}. Recommend reviewing entry protocols and feed sourcing practices.`,
      priority: "medium",
    });
    if (isRising) {
      recs.push({
        actionType: "Trend Alert",
        recommendation: `Disease trend is rising in ${municipality}. Pre-position veterinary supplies and alert field officers for rapid response if cases escalate.`,
        priority: "medium",
      });
    }
    if (diseaseCategory === "bacterial") {
      recs.push({
        actionType: "Treatment Protocol",
        recommendation: `Provide guidance on appropriate antibiotic treatment protocols for ${diseaseName}. Promote responsible antimicrobial use to prevent resistance.`,
        priority: "medium",
      });
    }
  }

  // === LOW RISK ===
  else {
    recs.push({
      actionType: "Routine Surveillance",
      recommendation: `Maintain standard monthly surveillance in ${municipality}. Continue regular farm registration updates and health certificate processing.`,
      priority: "low",
    });
    if (diseaseCategory === "parasitic") {
      recs.push({
        actionType: "Prevention",
        recommendation: `Promote regular deworming programs and improved sanitation practices in ${municipality} to prevent parasitic disease escalation.`,
        priority: "low",
      });
    }
  }

  // Parasitic-specific
  if (diseaseCategory === "parasitic" && riskLevel !== "low") {
    recs.push({
      actionType: "Farm Management",
      recommendation: `Recommend facility improvements for backyard farms in ${municipality}: improved flooring, drainage, and hygiene to reduce parasite load.`,
      priority: riskLevel === "moderate" ? "medium" : "high",
    });
  }

  return recs;
}
