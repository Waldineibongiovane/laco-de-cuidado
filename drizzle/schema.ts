import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, float, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  userType: mysqlEnum("userType", ["caregiver", "family"]),
  isBlocked: boolean("isBlocked").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Caregiver profile with services, availability, location, etc.
 */
export const caregiverProfiles = mysqlTable("caregiver_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  age: int("age"),
  city: varchar("city", { length: 100 }),
  neighborhood: varchar("neighborhood", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  emailPublic: varchar("emailPublic", { length: 320 }),
  photoUrl: text("photoUrl"),
  bio: text("bio"),
  services: json("services").$type<string[]>(),
  availability: json("availability").$type<string[]>(),
  experienceYears: int("experienceYears").default(0),
  experienceTypes: json("experienceTypes").$type<string[]>(),
  acceptsHospitalCompanion: boolean("acceptsHospitalCompanion").default(false),
  isAvailable: boolean("isAvailable").default(true).notNull(),
  lat: float("lat"),
  lng: float("lng"),
  serviceRadiusKm: int("serviceRadiusKm").default(50),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CaregiverProfile = typeof caregiverProfiles.$inferSelect;
export type InsertCaregiverProfile = typeof caregiverProfiles.$inferInsert;

/**
 * Family job posting - only 1 active per family enforced at application level.
 */
export const familyJobs = mysqlTable("family_jobs", {
  id: int("id").autoincrement().primaryKey(),
  familyUserId: int("familyUserId").notNull(),
  elderAge: int("elderAge"),
  dependencyLevel: mysqlEnum("dependencyLevel", ["leve", "moderado", "alto"]),
  conditions: text("conditions"),
  tasks: json("tasks").$type<string[]>(),
  schedule: text("schedule"),
  city: varchar("city", { length: 100 }),
  neighborhood: varchar("neighborhood", { length: 100 }),
  lat: float("lat"),
  lng: float("lng"),
  pay: varchar("pay", { length: 50 }).default("A combinar"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FamilyJob = typeof familyJobs.$inferSelect;
export type InsertFamilyJob = typeof familyJobs.$inferInsert;

/**
 * Reviews from families to caregivers.
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  caregiverUserId: int("caregiverUserId").notNull(),
  familyUserId: int("familyUserId").notNull(),
  rating: int("rating").notNull(),
  comment: text("comment"),
  hiredCaregiver: boolean("hiredCaregiver").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Reports/denúncias.
 */
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  reporterUserId: int("reporterUserId").notNull(),
  reportedUserId: int("reportedUserId").notNull(),
  reason: mysqlEnum("reason", ["perfil_falso", "conduta_inadequada", "golpe", "outros"]).notNull(),
  details: text("details"),
  status: mysqlEnum("status", ["open", "reviewed", "closed"]).default("open").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

/**
 * Admin credentials for password-based login.
 */
export const adminCredentials = mysqlTable("admin_credentials", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminCredential = typeof adminCredentials.$inferSelect;
export type InsertAdminCredential = typeof adminCredentials.$inferInsert;

/**
 * User credentials for manual email/password registration.
 */
export const userCredentials = mysqlTable("user_credentials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserCredential = typeof userCredentials.$inferSelect;
export type InsertUserCredential = typeof userCredentials.$inferInsert;
