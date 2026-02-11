import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createGuestContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUserContext(overrides: Partial<AuthenticatedUser> = {}): {
  ctx: TrpcContext;
  clearedCookies: { name: string; options: Record<string, unknown> }[];
} {
  const clearedCookies: { name: string; options: Record<string, unknown> }[] = [];

  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    userType: null,
    isBlocked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };

  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

function createAdminContext() {
  return createUserContext({ role: "admin", id: 99 });
}

// ─── Auth Tests ──────────────────────────────────────────────────────

describe("auth.me", () => {
  it("returns null for unauthenticated users", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user data for authenticated users", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.name).toBe("Test User");
    expect(result?.email).toBe("test@example.com");
  });
});

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const { ctx, clearedCookies } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({ maxAge: -1 });
  });
});

// ─── User Type Tests ─────────────────────────────────────────────────

describe("user.setType", () => {
  it("rejects unauthenticated users", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.user.setType({ userType: "caregiver" })).rejects.toThrow();
  });

  it("validates userType enum", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.user.setType({ userType: "invalid" as any })).rejects.toThrow();
  });
});

// ─── Caregiver Profile Tests ─────────────────────────────────────────

describe("caregiver.upsertProfile", () => {
  it("rejects unauthenticated users", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.caregiver.upsertProfile({ firstName: "Maria" })
    ).rejects.toThrow();
  });

  it("validates firstName is required and non-empty", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.caregiver.upsertProfile({ firstName: "" })
    ).rejects.toThrow();
  });

  it("validates age must be >= 18", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.caregiver.upsertProfile({ firstName: "Maria", age: 15 })
    ).rejects.toThrow();
  });
});

describe("caregiver.search", () => {
  it("accepts empty filters (public procedure)", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    // Should not throw - it's a public procedure
    const result = await caller.caregiver.search({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("validates sortBy enum", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.caregiver.search({ sortBy: "invalid" as any })
    ).rejects.toThrow();
  });
});

describe("caregiver.getProfile", () => {
  it("returns null for non-existent user", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.caregiver.getProfile({ userId: 99999 });
    expect(result).toBeNull();
  });
});

// ─── Review Tests ────────────────────────────────────────────────────

describe("review.create", () => {
  it("rejects unauthenticated users", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.review.create({
        caregiverUserId: 1,
        rating: 5,
        hiredCaregiver: true,
      })
    ).rejects.toThrow();
  });

  it("validates rating range (1-5)", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.review.create({
        caregiverUserId: 1,
        rating: 0,
        hiredCaregiver: false,
      })
    ).rejects.toThrow();

    await expect(
      caller.review.create({
        caregiverUserId: 1,
        rating: 6,
        hiredCaregiver: false,
      })
    ).rejects.toThrow();
  });
});

// ─── Report Tests ────────────────────────────────────────────────────

describe("report.create", () => {
  it("rejects unauthenticated users", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.report.create({
        reportedUserId: 1,
        reason: "perfil_falso",
      })
    ).rejects.toThrow();
  });

  it("validates reason enum", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.report.create({
        reportedUserId: 1,
        reason: "invalid_reason" as any,
      })
    ).rejects.toThrow();
  });
});

// ─── Job Tests ───────────────────────────────────────────────────────

describe("job.upsert", () => {
  it("rejects unauthenticated users", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.job.upsert({})).rejects.toThrow();
  });

  it("validates dependencyLevel enum", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.job.upsert({ dependencyLevel: "invalid" as any })
    ).rejects.toThrow();
  });
});

// ─── Admin Tests ─────────────────────────────────────────────────────

describe("admin.listUsers", () => {
  it("rejects non-admin users", async () => {
    const { ctx } = createUserContext({ role: "user" });
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.listUsers()).rejects.toThrow();
  });

  it("rejects unauthenticated users", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.listUsers()).rejects.toThrow();
  });
});

describe("admin.toggleBlock", () => {
  it("rejects non-admin users", async () => {
    const { ctx } = createUserContext({ role: "user" });
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.admin.toggleBlock({ userId: 1, isBlocked: true })
    ).rejects.toThrow();
  });
});

describe("admin.updateReportStatus", () => {
  it("rejects non-admin users", async () => {
    const { ctx } = createUserContext({ role: "user" });
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.admin.updateReportStatus({ reportId: 1, status: "closed" })
    ).rejects.toThrow();
  });

  it("validates status enum", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.admin.updateReportStatus({ reportId: 1, status: "invalid" as any })
    ).rejects.toThrow();
  });
});
