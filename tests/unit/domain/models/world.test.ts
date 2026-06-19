import { describe, it, expect } from "vitest";
import {
  canTransitionStatus,
  getStatusLabel,
  getStatusColor,
} from "@/domain/models/world";

describe("canTransitionStatus", () => {
  it("allows PRIMARY to SECONDARY", () => {
    expect(canTransitionStatus("PRIMARY", "SECONDARY")).toBe(true);
  });

  it("allows PRIMARY to PAUSED", () => {
    expect(canTransitionStatus("PRIMARY", "PAUSED")).toBe(true);
  });

  it("allows PAUSED to PRIMARY", () => {
    expect(canTransitionStatus("PAUSED", "PRIMARY")).toBe(true);
  });

  it("prevents same-status transition", () => {
    expect(canTransitionStatus("PRIMARY", "PRIMARY")).toBe(false);
  });

  it("allows COMPLETED to SECONDARY (reopen)", () => {
    expect(canTransitionStatus("COMPLETED", "SECONDARY")).toBe(true);
  });

  it("prevents COMPLETED to PRIMARY directly", () => {
    expect(canTransitionStatus("COMPLETED", "PRIMARY")).toBe(false);
  });

  it("allows MAINTENANCE to PAUSED", () => {
    expect(canTransitionStatus("MAINTENANCE", "PAUSED")).toBe(true);
  });

  it("allows all active statuses to COMPLETED", () => {
    expect(canTransitionStatus("PRIMARY", "COMPLETED")).toBe(true);
    expect(canTransitionStatus("SECONDARY", "COMPLETED")).toBe(true);
    expect(canTransitionStatus("MAINTENANCE", "COMPLETED")).toBe(true);
  });

  it("prevents PAUSED to COMPLETED", () => {
    expect(canTransitionStatus("PAUSED", "COMPLETED")).toBe(false);
  });
});

describe("getStatusLabel", () => {
  it("returns readable labels", () => {
    expect(getStatusLabel("PRIMARY")).toBe("Primary");
    expect(getStatusLabel("SECONDARY")).toBe("Secondary");
    expect(getStatusLabel("MAINTENANCE")).toBe("Maintenance");
    expect(getStatusLabel("PAUSED")).toBe("Paused");
    expect(getStatusLabel("COMPLETED")).toBe("Completed");
  });
});

describe("getStatusColor", () => {
  it("returns hex colors for each status", () => {
    expect(getStatusColor("PRIMARY")).toMatch(/^#/);
    expect(getStatusColor("PAUSED")).toMatch(/^#/);
  });
});
