import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  color?: "green" | "yellow" | "orange" | "red" | "blue" | "slate";
  size?: "sm" | "md";
}

const colorMap: Record<string, string> = {
  green: "bg-green-50 text-green-700 ring-green-600/20",
  yellow: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
  orange: "bg-orange-50 text-orange-700 ring-orange-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
  slate: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export function Badge({ children, color = "slate", size = "sm" }: BadgeProps) {
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm";
  return (
    <span className={`inline-flex items-center rounded-full font-medium ring-1 ring-inset ${colorMap[color]} ${sizeClass}`}>
      {children}
    </span>
  );
}

export function riskColor(level: string): "green" | "yellow" | "orange" | "red" {
  if (level === "critical") return "red";
  if (level === "high") return "orange";
  if (level === "moderate") return "yellow";
  return "green";
}

export function priorityColor(p: string): "slate" | "blue" | "orange" | "red" {
  if (p === "urgent") return "red";
  if (p === "high") return "orange";
  if (p === "medium") return "blue";
  return "slate";
}
