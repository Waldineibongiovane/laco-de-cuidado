import { eq, and, sql, desc, asc, gte, lte, ne } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  caregiverProfiles, InsertCaregiverProfile, CaregiverProfile,
  familyJobs, InsertFamilyJob,
  reviews, InsertReview,
  reports, InsertReport,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ───────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function setUserType(userId: number, userType: "caregiver" | "family") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ userType }).where(eq(users.id, userId));
}

export async function setUserBlocked(userId: number, isBlocked: boolean) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ isBlocked }).where(eq(users.id, userId));
}

export async function listAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    userType: users.userType,
    isBlocked: users.isBlocked,
    createdAt: users.createdAt,
  }).from(users).orderBy(desc(users.createdAt));
}

// ─── Caregiver Profiles ─────────────────────────────────────────────

export async function getCaregiverProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(caregiverProfiles).where(eq(caregiverProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertCaregiverProfile(data: InsertCaregiverProfile) {
  const db = await getDb();
  if (!db) return;
  const existing = await getCaregiverProfileByUserId(data.userId);
  if (existing) {
    const { userId, ...updateData } = data;
    await db.update(caregiverProfiles).set(updateData).where(eq(caregiverProfiles.userId, data.userId));
  } else {
    await db.insert(caregiverProfiles).values(data);
  }
}

export async function toggleCaregiverAvailability(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(caregiverProfiles)
    .set({ isAvailable: sql`NOT ${caregiverProfiles.isAvailable}` })
    .where(eq(caregiverProfiles.userId, userId));
}

export type CaregiverSearchFilters = {
  city?: string;
  maxDistance?: number;
  lat?: number;
  lng?: number;
  services?: string[];
  availability?: string[];
  minExperience?: number;
  experienceTypes?: string[];
  acceptsHospitalCompanion?: boolean;
  minRating?: number;
  sortBy?: "distance" | "rating" | "newest" | "recommended";
};

export async function searchCaregivers(filters: CaregiverSearchFilters) {
  const db = await getDb();
  if (!db) return [];

  // Build a raw SQL query for distance calculation and filtering
  const conditions: string[] = [
    "u.isBlocked = false",
    "cp.isAvailable = true OR cp.isAvailable = false", // Show all, mark availability
  ];
  const params: unknown[] = [];

  let distanceSelect = "NULL as distance";
  if (filters.lat != null && filters.lng != null) {
    distanceSelect = `(6371 * acos(cos(radians(?)) * cos(radians(cp.lat)) * cos(radians(cp.lng) - radians(?)) + sin(radians(?)) * sin(radians(cp.lat)))) as distance`;
    params.push(filters.lat, filters.lng, filters.lat);
  }

  if (filters.city) {
    conditions.push("cp.city = ?");
    params.push(filters.city);
  }

  if (filters.minExperience != null) {
    conditions.push("cp.experienceYears >= ?");
    params.push(filters.minExperience);
  }

  if (filters.acceptsHospitalCompanion) {
    conditions.push("cp.acceptsHospitalCompanion = true");
  }

  // We need to filter blocked users
  conditions.push("u.isBlocked = false");

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  let havingClause = "";
  if (filters.maxDistance != null && filters.lat != null && filters.lng != null) {
    havingClause = `HAVING distance <= ${Number(filters.maxDistance)}`;
  }

  let orderClause = "ORDER BY cp.createdAt DESC";
  if (filters.sortBy === "distance" && filters.lat != null) {
    orderClause = "ORDER BY distance ASC";
  } else if (filters.sortBy === "newest") {
    orderClause = "ORDER BY cp.createdAt DESC";
  } else if (filters.sortBy === "rating") {
    orderClause = "ORDER BY avgRating DESC";
  } else if (filters.sortBy === "recommended" && filters.lat != null) {
    orderClause = "ORDER BY (COALESCE(avgRating, 0) * 0.4 + (1 / (1 + COALESCE(distance, 100))) * 0.4 + (CASE WHEN cp.bio IS NOT NULL AND cp.photoUrl IS NOT NULL THEN 0.2 ELSE 0 END)) DESC";
  }

  const queryStr = `
    SELECT cp.*, u.isBlocked, u.userType,
      ${distanceSelect},
      (SELECT AVG(r.rating) FROM reviews r WHERE r.caregiverUserId = cp.userId) as avgRating,
      (SELECT COUNT(*) FROM reviews r WHERE r.caregiverUserId = cp.userId) as reviewCount
    FROM caregiver_profiles cp
    JOIN users u ON u.id = cp.userId
    ${whereClause}
    ${havingClause}
    ${orderClause}
    LIMIT 100
  `;

  const result = await db.execute(sql.raw(queryStr));
  // params need to be bound - use drizzle raw
  // Actually let's use a simpler approach with drizzle
  return (result as any)[0] || [];
}

export async function searchCaregiversSimple(filters: CaregiverSearchFilters) {
  const db = await getDb();
  if (!db) return [];

  const allProfiles = await db
    .select({
      id: caregiverProfiles.id,
      userId: caregiverProfiles.userId,
      firstName: caregiverProfiles.firstName,
      age: caregiverProfiles.age,
      city: caregiverProfiles.city,
      neighborhood: caregiverProfiles.neighborhood,
      phone: caregiverProfiles.phone,
      emailPublic: caregiverProfiles.emailPublic,
      photoUrl: caregiverProfiles.photoUrl,
      bio: caregiverProfiles.bio,
      services: caregiverProfiles.services,
      availability: caregiverProfiles.availability,
      experienceYears: caregiverProfiles.experienceYears,
      experienceTypes: caregiverProfiles.experienceTypes,
      acceptsHospitalCompanion: caregiverProfiles.acceptsHospitalCompanion,
      isAvailable: caregiverProfiles.isAvailable,
      lat: caregiverProfiles.lat,
      lng: caregiverProfiles.lng,
      serviceRadiusKm: caregiverProfiles.serviceRadiusKm,
      createdAt: caregiverProfiles.createdAt,
      isBlocked: users.isBlocked,
    })
    .from(caregiverProfiles)
    .innerJoin(users, eq(users.id, caregiverProfiles.userId))
    .where(eq(users.isBlocked, false))
    .orderBy(desc(caregiverProfiles.createdAt));

  // Apply filters in JS for simplicity
  let results = allProfiles.map(p => {
    let distance: number | null = null;
    if (filters.lat != null && filters.lng != null && p.lat != null && p.lng != null) {
      distance = haversineDistance(filters.lat, filters.lng, p.lat, p.lng);
    }
    return { ...p, distance, avgRating: 0 as number, reviewCount: 0 as number };
  });

  if (filters.city) {
    results = results.filter(p => p.city?.toLowerCase().includes(filters.city!.toLowerCase()));
  }
  if (filters.maxDistance != null && filters.lat != null && filters.lng != null) {
    results = results.filter(p => p.distance != null && p.distance <= filters.maxDistance!);
  }
  if (filters.minExperience != null) {
    results = results.filter(p => (p.experienceYears ?? 0) >= filters.minExperience!);
  }
  if (filters.acceptsHospitalCompanion) {
    results = results.filter(p => p.acceptsHospitalCompanion);
  }
  if (filters.services && filters.services.length > 0) {
    results = results.filter(p => {
      const pServices = (p.services as string[]) || [];
      return filters.services!.some(s => pServices.includes(s));
    });
  }
  if (filters.availability && filters.availability.length > 0) {
    results = results.filter(p => {
      const pAvail = (p.availability as string[]) || [];
      return filters.availability!.some(a => pAvail.includes(a));
    });
  }
  if (filters.experienceTypes && filters.experienceTypes.length > 0) {
    results = results.filter(p => {
      const pTypes = (p.experienceTypes as string[]) || [];
      return filters.experienceTypes!.some(t => pTypes.includes(t));
    });
  }

  // Fetch ratings
  const allReviews = await db.select({
    caregiverUserId: reviews.caregiverUserId,
    rating: reviews.rating,
  }).from(reviews);

  const ratingMap = new Map<number, { sum: number; count: number }>();
  for (const r of allReviews) {
    const existing = ratingMap.get(r.caregiverUserId) || { sum: 0, count: 0 };
    existing.sum += r.rating;
    existing.count += 1;
    ratingMap.set(r.caregiverUserId, existing);
  }

  results = results.map(p => {
    const rData = ratingMap.get(p.userId);
    return {
      ...p,
      avgRating: rData ? rData.sum / rData.count : 0,
      reviewCount: rData ? rData.count : 0,
    };
  });

  if (filters.minRating != null) {
    results = results.filter(p => p.avgRating >= filters.minRating!);
  }

  // Sort
  if (filters.sortBy === "distance") {
    results.sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));
  } else if (filters.sortBy === "rating") {
    results.sort((a, b) => b.avgRating - a.avgRating);
  } else if (filters.sortBy === "recommended") {
    results.sort((a, b) => {
      const scoreA = (a.avgRating * 0.4) + (1 / (1 + (a.distance ?? 100))) * 0.4 + (a.bio && a.photoUrl ? 0.2 : 0);
      const scoreB = (b.avgRating * 0.4) + (1 / (1 + (b.distance ?? 100))) * 0.4 + (b.bio && b.photoUrl ? 0.2 : 0);
      return scoreB - scoreA;
    });
  }
  // default: newest (already sorted by createdAt DESC)

  return results.slice(0, 100);
}

export async function getCaregiverWithReviews(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const profileResult = await db.select()
    .from(caregiverProfiles)
    .innerJoin(users, eq(users.id, caregiverProfiles.userId))
    .where(and(eq(caregiverProfiles.userId, userId), eq(users.isBlocked, false)))
    .limit(1);

  if (profileResult.length === 0) return null;

  const caregiverReviews = await db.select({
    id: reviews.id,
    rating: reviews.rating,
    comment: reviews.comment,
    hiredCaregiver: reviews.hiredCaregiver,
    createdAt: reviews.createdAt,
    familyUserId: reviews.familyUserId,
  })
    .from(reviews)
    .where(eq(reviews.caregiverUserId, userId))
    .orderBy(desc(reviews.createdAt));

  const profile = profileResult[0];
  const avgRating = caregiverReviews.length > 0
    ? caregiverReviews.reduce((sum, r) => sum + r.rating, 0) / caregiverReviews.length
    : 0;

  return {
    ...profile.caregiver_profiles,
    isBlocked: profile.users.isBlocked,
    reviews: caregiverReviews,
    avgRating,
    reviewCount: caregiverReviews.length,
  };
}

// ─── Family Jobs ─────────────────────────────────────────────────────

export async function getActiveJobByFamilyId(familyUserId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(familyJobs)
    .where(and(eq(familyJobs.familyUserId, familyUserId), eq(familyJobs.isActive, true)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertFamilyJob(data: InsertFamilyJob) {
  const db = await getDb();
  if (!db) return;

  // Check if there's an existing active job
  const existing = await getActiveJobByFamilyId(data.familyUserId);
  if (existing) {
    const { familyUserId, id, ...updateData } = data as any;
    await db.update(familyJobs).set(updateData).where(eq(familyJobs.id, existing.id));
  } else {
    await db.insert(familyJobs).values(data);
  }
}

export async function deactivateFamilyJob(jobId: number, familyUserId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(familyJobs)
    .set({ isActive: false })
    .where(and(eq(familyJobs.id, jobId), eq(familyJobs.familyUserId, familyUserId)));
}

// ─── Reviews ─────────────────────────────────────────────────────────

export async function createReview(data: InsertReview) {
  const db = await getDb();
  if (!db) return;
  await db.insert(reviews).values(data);
}

export async function getReviewsByFamily(familyUserId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews)
    .where(eq(reviews.familyUserId, familyUserId))
    .orderBy(desc(reviews.createdAt));
}

export async function getReviewsByCaregiver(caregiverUserId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews)
    .where(eq(reviews.caregiverUserId, caregiverUserId))
    .orderBy(desc(reviews.createdAt));
}

// ─── Reports ─────────────────────────────────────────────────────────

export async function createReport(data: InsertReport) {
  const db = await getDb();
  if (!db) return;
  await db.insert(reports).values(data);
}

export async function listReports() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reports).orderBy(desc(reports.createdAt));
}

export async function updateReportStatus(reportId: number, status: "open" | "reviewed" | "closed") {
  const db = await getDb();
  if (!db) return;
  await db.update(reports).set({ status }).where(eq(reports.id, reportId));
}

// ─── Haversine ───────────────────────────────────────────────────────

export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
