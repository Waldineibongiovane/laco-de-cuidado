import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  setUserType, setUserBlocked, listAllUsers, getUserById,
  getCaregiverProfileByUserId, upsertCaregiverProfile, toggleCaregiverAvailability,
  searchCaregiversSimple, getCaregiverWithReviews,
  getActiveJobByFamilyId, upsertFamilyJob, deactivateFamilyJob,
  createReview, getReviewsByFamily, getReviewsByCaregiver,
  createReport, listReports, updateReportStatus,
} from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  user: router({
    setType: protectedProcedure
      .input(z.object({ userType: z.enum(["caregiver", "family"]) }))
      .mutation(async ({ ctx, input }) => {
        await setUserType(ctx.user.id, input.userType);
        return { success: true };
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const user = await getUserById(input.id);
        if (!user) return null;
        return { id: user.id, name: user.name, userType: user.userType };
      }),
  }),

  caregiver: router({
    myProfile: protectedProcedure.query(async ({ ctx }) => {
      return getCaregiverProfileByUserId(ctx.user.id);
    }),

    getProfile: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return getCaregiverWithReviews(input.userId);
      }),

    upsertProfile: protectedProcedure
      .input(z.object({
        firstName: z.string().min(1).max(100),
        age: z.number().min(18).max(120).optional(),
        city: z.string().max(100).optional(),
        neighborhood: z.string().max(100).optional(),
        phone: z.string().max(20).optional(),
        emailPublic: z.string().email().max(320).optional(),
        bio: z.string().max(2000).optional(),
        services: z.array(z.string()).optional(),
        availability: z.array(z.string()).optional(),
        experienceYears: z.number().min(0).max(50).optional(),
        experienceTypes: z.array(z.string()).optional(),
        acceptsHospitalCompanion: z.boolean().optional(),
        lat: z.number().optional(),
        lng: z.number().optional(),
        serviceRadiusKm: z.number().min(1).max(100).optional(),
        photoUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await setUserType(ctx.user.id, "caregiver");
        await upsertCaregiverProfile({
          userId: ctx.user.id,
          firstName: input.firstName,
          age: input.age ?? null,
          city: input.city ?? null,
          neighborhood: input.neighborhood ?? null,
          phone: input.phone ?? null,
          emailPublic: input.emailPublic ?? null,
          bio: input.bio ?? null,
          services: input.services ?? [],
          availability: input.availability ?? [],
          experienceYears: input.experienceYears ?? 0,
          experienceTypes: input.experienceTypes ?? [],
          acceptsHospitalCompanion: input.acceptsHospitalCompanion ?? false,
          lat: input.lat ?? null,
          lng: input.lng ?? null,
          serviceRadiusKm: input.serviceRadiusKm ?? 50,
          photoUrl: input.photoUrl ?? null,
        });
        return { success: true };
      }),

    toggleAvailability: protectedProcedure.mutation(async ({ ctx }) => {
      await toggleCaregiverAvailability(ctx.user.id);
      return { success: true };
    }),

    uploadPhoto: protectedProcedure
      .input(z.object({
        base64: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const ext = input.mimeType.split("/")[1] || "jpg";
        const key = `caregiver-photos/${ctx.user.id}-${nanoid(8)}.${ext}`;
        const buffer = Buffer.from(input.base64, "base64");
        const { url } = await storagePut(key, buffer, input.mimeType);
        return { url };
      }),

    search: publicProcedure
      .input(z.object({
        city: z.string().optional(),
        maxDistance: z.number().optional(),
        lat: z.number().optional(),
        lng: z.number().optional(),
        services: z.array(z.string()).optional(),
        availability: z.array(z.string()).optional(),
        minExperience: z.number().optional(),
        experienceTypes: z.array(z.string()).optional(),
        acceptsHospitalCompanion: z.boolean().optional(),
        minRating: z.number().optional(),
        sortBy: z.enum(["distance", "rating", "newest", "recommended"]).optional(),
      }))
      .query(async ({ input }) => {
        return searchCaregiversSimple(input);
      }),
  }),

  job: router({
    myJob: protectedProcedure.query(async ({ ctx }) => {
      return getActiveJobByFamilyId(ctx.user.id);
    }),

    upsert: protectedProcedure
      .input(z.object({
        elderAge: z.number().min(1).max(150).optional(),
        dependencyLevel: z.enum(["leve", "moderado", "alto"]).optional(),
        conditions: z.string().max(2000).optional(),
        tasks: z.array(z.string()).optional(),
        schedule: z.string().max(500).optional(),
        city: z.string().max(100).optional(),
        neighborhood: z.string().max(100).optional(),
        lat: z.number().optional(),
        lng: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await setUserType(ctx.user.id, "family");
        await upsertFamilyJob({
          familyUserId: ctx.user.id,
          elderAge: input.elderAge ?? null,
          dependencyLevel: input.dependencyLevel ?? null,
          conditions: input.conditions ?? null,
          tasks: input.tasks ?? [],
          schedule: input.schedule ?? null,
          city: input.city ?? null,
          neighborhood: input.neighborhood ?? null,
          lat: input.lat ?? null,
          lng: input.lng ?? null,
          isActive: true,
        });
        return { success: true };
      }),

    deactivate: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deactivateFamilyJob(input.jobId, ctx.user.id);
        return { success: true };
      }),
  }),

  review: router({
    create: protectedProcedure
      .input(z.object({
        caregiverUserId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().max(1000).optional(),
        hiredCaregiver: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        await createReview({
          caregiverUserId: input.caregiverUserId,
          familyUserId: ctx.user.id,
          rating: input.rating,
          comment: input.comment ?? null,
          hiredCaregiver: input.hiredCaregiver,
        });
        return { success: true };
      }),

    myReviews: protectedProcedure.query(async ({ ctx }) => {
      return getReviewsByFamily(ctx.user.id);
    }),
  }),

  report: router({
    create: protectedProcedure
      .input(z.object({
        reportedUserId: z.number(),
        reason: z.enum(["perfil_falso", "conduta_inadequada", "golpe", "outros"]),
        details: z.string().max(1000).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await createReport({
          reporterUserId: ctx.user.id,
          reportedUserId: input.reportedUserId,
          reason: input.reason,
          details: input.details ?? null,
        });
        return { success: true };
      }),
  }),

  admin: router({
    listUsers: adminProcedure.query(async () => {
      return listAllUsers();
    }),

    toggleBlock: adminProcedure
      .input(z.object({ userId: z.number(), isBlocked: z.boolean() }))
      .mutation(async ({ input }) => {
        await setUserBlocked(input.userId, input.isBlocked);
        return { success: true };
      }),

    listReports: adminProcedure.query(async () => {
      return listReports();
    }),

    updateReportStatus: adminProcedure
      .input(z.object({
        reportId: z.number(),
        status: z.enum(["open", "reviewed", "closed"]),
      }))
      .mutation(async ({ input }) => {
        await updateReportStatus(input.reportId, input.status);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
