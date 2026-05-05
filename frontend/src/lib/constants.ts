export const MUNICIPALITIES = [
  "Biñan","Calamba","Los Baños","San Pablo","Santa Rosa",
  "Cabuyao","Calauan","Pagsanjan","Lumban","Majayjay",
];

export const DISEASES_HIGH_RISK = [
  "African Swine Fever",
  "PRRS (Porcine Reproductive and Respiratory Syndrome)",
  "Classical Swine Fever",
];

export const DISEASES_BACTERIAL = [
  "Swine Erysipelas",
  "Salmonellosis",
  "Swine Dysentery",
  "Pasteurellosis",
];

export const DISEASES_PARASITIC = [
  "Ascariasis (Roundworm)",
  "Swine Mange",
  "Trichuriasis (Whipworm)",
  "Coccidiosis",
];

export const RISK_COLORS: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  moderate: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

export const RISK_BADGE_COLORS: Record<string, string> = {
  low: "text-green-700 bg-green-50 ring-green-600/20",
  moderate: "text-yellow-700 bg-yellow-50 ring-yellow-600/20",
  high: "text-orange-700 bg-orange-50 ring-orange-600/20",
  critical: "text-red-700 bg-red-50 ring-red-600/20",
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: "text-slate-600 bg-slate-100",
  medium: "text-blue-700 bg-blue-50",
  high: "text-orange-700 bg-orange-50",
  urgent: "text-red-700 bg-red-50",
};
