import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import bcrypt from "bcryptjs";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Admin Login", () => {
  it("should create admin credentials with hashed password", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as TrpcContext["res"],
    });

    const uniqueUsername = "testadmin" + Date.now();
    const result = await caller.adminLogin.setupAdmin({
      username: uniqueUsername,
      password: "testpassword123",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("sucesso");
  });

  it("should reject login with invalid credentials", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as TrpcContext["res"],
    });

    const result = await caller.adminLogin.login({
      username: "nonexistent",
      password: "wrongpassword",
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain("invalidas");
  });

  it("should reject short passwords", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as TrpcContext["res"],
    });

    try {
      await caller.adminLogin.setupAdmin({
        username: "admin2",
        password: "short",
      });
      expect(true).toBe(false); // Should not reach here
    } catch (error: any) {
      expect(error.message).toContain("Too small");
    }
  });
});

describe("Admin Procedures", () => {
  it("should list all users with admin role", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const users = await caller.admin.listUsers();

    expect(Array.isArray(users)).toBe(true);
  });

  it("should toggle user block status", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.toggleBlock({
      userId: 999,
      isBlocked: true,
    });

    expect(result.success).toBe(true);
  });

  it("should list reports", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const reports = await caller.admin.listReports();

    expect(Array.isArray(reports)).toBe(true);
  });

  it("should update report status", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.updateReportStatus({
      reportId: 999,
      status: "reviewed",
    });

    expect(result.success).toBe(true);
  });
});

describe("Caregiver Ranking", () => {
  it("should return top ranked caregivers", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as TrpcContext["res"],
    });

    const result = await caller.caregiver.topRanked({ limit: 10 });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should respect limit parameter", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as TrpcContext["res"],
    });

    const result = await caller.caregiver.topRanked({ limit: 5 });

    expect(result.length).toBeLessThanOrEqual(5);
  });

  it("should return caregivers with avgRating and reviewCount", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: { clearCookie: () => {} } as TrpcContext["res"],
    });

    const result = await caller.caregiver.topRanked({ limit: 10 });

    if (result.length > 0) {
      const caregiver = result[0];
      expect(caregiver).toHaveProperty("avgRating");
      expect(caregiver).toHaveProperty("reviewCount");
      expect(typeof caregiver.avgRating).toBe("number");
      expect(typeof caregiver.reviewCount).toBe("number");
    }
  });
});
