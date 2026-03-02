import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  setUserType, setUserBlocked, listAllUsers, getUserById,
  getCaregiverProfileByUserId, upsertCaregiverProfile, toggleCaregiverAvailability,
  searchCaregiversSimple, getCaregiverWithReviews, getTopCaregiversByRating,
  getActiveJobByFamilyId, upsertFamilyJob, deactivateFamilyJob,
  createReview, getReviewsByFamily, getReviewsByCaregiver,
  createReport, listReports, updateReportStatus,
  getAdminCredentialByUsername, createAdminCredential, updateAdminPassword,
  createUserWithRole, updateUserRole, updateUserType, deleteUser, getAllUsersWithProfiles, deleteReport, deleteCaregiverProfile,
} from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";

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

    updateProfile: protectedProcedure
      .input(z.object({
        firstName: z.string().min(2),
        age: z.number().min(18).max(120).optional(),
        city: z.string().optional(),
        neighborhood: z.string().optional(),
        phone: z.string().optional(),
        emailPublic: z.string().email().optional(),
        bio: z.string().max(2000).optional(),
        services: z.array(z.string()).optional(),
        availability: z.array(z.string()).optional(),
        experienceYears: z.number().min(0).optional(),
        experienceTypes: z.array(z.string()).optional(),
        acceptsHospitalCompanion: z.boolean().optional(),
        isAvailable: z.boolean().optional(),
        lat: z.number().optional(),
        lng: z.number().optional(),
        serviceRadiusKm: z.number().min(1).max(100).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await upsertCaregiverProfile({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),

    uploadPhoto: protectedProcedure
      .input(z.object({ photoBase64: z.string(), fileName: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.photoBase64, "base64");
        const fileKey = `caregiver-photos/${ctx.user.id}-${nanoid()}.jpg`;
        const { url } = await storagePut(fileKey, buffer, "image/jpeg");
        
        const profile = await getCaregiverProfileByUserId(ctx.user.id);
        await upsertCaregiverProfile({
          userId: ctx.user.id,
          firstName: profile?.firstName || "Cuidador",
          photoUrl: url,
        });
        
        return { success: true, photoUrl: url };
      }),

    toggleAvailability: protectedProcedure
      .input(z.object({ isAvailable: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        await toggleCaregiverAvailability(ctx.user.id);
        return { success: true };
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
        sortBy: z.enum(["newest", "distance", "rating", "recommended"]).optional(),
      }))
      .query(async ({ input }) => {
        return searchCaregiversSimple(input);
      }),

    getProfile: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return getCaregiverWithReviews(input.userId);
      }),

    topRanked: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(6) }))
      .query(async ({ input }) => {
        return getTopCaregiversByRating(input.limit);
      }),
  }),

  family: router({
    myJob: protectedProcedure.query(async ({ ctx }) => {
      return getActiveJobByFamilyId(ctx.user.id);
    }),

    updateJob: protectedProcedure
      .input(z.object({
        title: z.string().min(5),
        description: z.string().min(20),
        requiredServices: z.array(z.string()),
        requiredAvailability: z.array(z.string()),
        minExperience: z.number().min(0).optional(),
        acceptsCaregiverTypes: z.array(z.string()).optional(),
        city: z.string(),
        neighborhood: z.string().optional(),
        lat: z.number(),
        lng: z.number(),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        await upsertFamilyJob({
          familyUserId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),

    deactivateJob: protectedProcedure
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
          familyUserId: ctx.user.id,
          caregiverUserId: input.caregiverUserId,
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

  adminLogin: router({
    login: publicProcedure
      .input(z.object({ username: z.string().min(1), password: z.string().min(1) }))
      .mutation(async ({ input }) => {
        const credential = await getAdminCredentialByUsername(input.username);
        if (!credential) return { success: false, message: "Credenciais invalidas" };
        
        const isValid = await bcrypt.compare(input.password, credential.passwordHash);
        if (!isValid) return { success: false, message: "Credenciais invalidas" };
        
        return { success: true, message: "Login realizado com sucesso" };
      }),

    setupAdmin: publicProcedure
      .input(z.object({ username: z.string().min(3), password: z.string().min(6) }))
      .mutation(async ({ input }) => {
        const existing = await getAdminCredentialByUsername(input.username);
        if (existing) return { success: false, message: "Usuario admin ja existe" };
        
        const hash = await bcrypt.hash(input.password, 10);
        await createAdminCredential(input.username, hash);
        return { success: true, message: "Admin criado com sucesso" };
      }),

    changePassword: publicProcedure
      .input(z.object({ username: z.string().min(1), oldPassword: z.string().min(1), newPassword: z.string().min(6) }))
      .mutation(async ({ input }) => {
        const credential = await getAdminCredentialByUsername(input.username);
        if (!credential) return { success: false, message: "Usuario nao encontrado" };
        
        const isValid = await bcrypt.compare(input.oldPassword, credential.passwordHash);
        if (!isValid) return { success: false, message: "Senha atual incorreta" };
        
        const newHash = await bcrypt.hash(input.newPassword, 10);
        await updateAdminPassword(input.username, newHash);
        return { success: true, message: "Senha alterada com sucesso" };
      }),
  }),

  admin: router({
    listUsers: adminProcedure.query(async () => {
      return getAllUsersWithProfiles();
    }),

    createUser: adminProcedure
      .input(z.object({
        name: z.string().min(2),
        email: z.string().email(),
        userType: z.enum(["caregiver", "family"]),
        role: z.enum(["user", "admin"]),
      }))
      .mutation(async ({ input }) => {
        const result = await createUserWithRole(input);
        return { success: !!result, message: result ? "Usuario criado com sucesso" : "Erro ao criar usuario" };
      }),

    updateUserRole: adminProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
      .mutation(async ({ input }) => {
        await updateUserRole(input.userId, input.role);
        return { success: true };
      }),

    updateUserType: adminProcedure
      .input(z.object({ userId: z.number(), userType: z.enum(["caregiver", "family"]) }))
      .mutation(async ({ input }) => {
        await updateUserType(input.userId, input.userType);
        return { success: true };
      }),

    toggleBlock: adminProcedure
      .input(z.object({ userId: z.number(), isBlocked: z.boolean() }))
      .mutation(async ({ input }) => {
        await setUserBlocked(input.userId, input.isBlocked);
        return { success: true };
      }),

    deleteUser: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        await deleteUser(input.userId);
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

    deleteReport: adminProcedure
      .input(z.object({ reportId: z.number() }))
      .mutation(async ({ input }) => {
        await deleteReport(input.reportId);
        return { success: true };
      }),

    deleteCaregiverProfile: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        await deleteCaregiverProfile(input.userId);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
