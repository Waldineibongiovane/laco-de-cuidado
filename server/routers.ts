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
  signupUser, getUserCredentialByEmail, getUserByCredentialId,
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
    signup: publicProcedure
      .input(z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        userType: z.enum(["caregiver", "family"]),
      }))
      .mutation(async ({ input }) => {
        try {
          const hash = await bcrypt.hash(input.password, 10);
          const user = await signupUser({
            name: input.name,
            email: input.email,
            passwordHash: hash,
            userType: input.userType,
          });
          return { success: true, message: "Cadastro realizado com sucesso!", userId: user?.id };
        } catch (error: any) {
          return { success: false, message: error.message || "Erro ao cadastrar" };
        }
      }),
    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
      .mutation(async ({ input }) => {
        try {
          const credential = await getUserCredentialByEmail(input.email);
          if (!credential) return { success: false, message: "Email ou senha inválidos" };
          
          const isValid = await bcrypt.compare(input.password, credential.passwordHash);
          if (!isValid) return { success: false, message: "Email ou senha inválidos" };
          
          const user = await getUserByCredentialId(credential.id);
          if (!user) return { success: false, message: "Usuário não encontrado" };
          
          return { success: true, message: "Login realizado com sucesso!", userId: user.id };
        } catch (error) {
          return { success: false, message: "Erro ao fazer login" };
        }
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

    topRanked: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(50).optional() }))
      .query(async ({ input }) => {
        return getTopCaregiversByRating(input.limit ?? 10);
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
