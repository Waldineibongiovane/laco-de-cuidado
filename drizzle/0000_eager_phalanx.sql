CREATE TABLE `caregiver_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`age` int,
	`city` varchar(100),
	`neighborhood` varchar(100),
	`phone` varchar(20),
	`emailPublic` varchar(320),
	`photoUrl` text,
	`bio` text,
	`services` json,
	`availability` json,
	`experienceYears` int DEFAULT 0,
	`experienceTypes` json,
	`acceptsHospitalCompanion` boolean DEFAULT false,
	`isAvailable` boolean NOT NULL DEFAULT true,
	`lat` float,
	`lng` float,
	`serviceRadiusKm` int DEFAULT 50,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `caregiver_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `caregiver_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `family_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`familyUserId` int NOT NULL,
	`elderAge` int,
	`dependencyLevel` enum('leve','moderado','alto'),
	`conditions` text,
	`tasks` json,
	`schedule` text,
	`city` varchar(100),
	`neighborhood` varchar(100),
	`lat` float,
	`lng` float,
	`pay` varchar(50) DEFAULT 'A combinar',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `family_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reporterUserId` int NOT NULL,
	`reportedUserId` int NOT NULL,
	`reason` enum('perfil_falso','conduta_inadequada','golpe','outros') NOT NULL,
	`details` text,
	`status` enum('open','reviewed','closed') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caregiverUserId` int NOT NULL,
	`familyUserId` int NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`hiredCaregiver` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`userType` enum('caregiver','family'),
	`isBlocked` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
