-- AlterTable
ALTER TABLE "UserSettings" ADD COLUMN     "sidebarAutoHide" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sidebarHideDelay" INTEGER NOT NULL DEFAULT 60;
