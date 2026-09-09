"use server";

import type { GoalType, TaskPriority } from "@prisma/client";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUserId } from "@/lib/services/studyos";
import {
  courseMutations,
  focusMutations,
  goalMutations,
  knowledgeMutations,
  materialMutations,
  mistakeMutations,
  noteMutations,
  reviewMutations,
  semesterMutations,
  taskMutations,
} from "@/lib/services/mutations";

function formText(form: FormData, key: string): string {
  return String(form.get(key) ?? "");
}

function nullableText(form: FormData, key: string): string | null {
  const value = String(form.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

function nullableDate(form: FormData, key: string): Date | null {
  const value = String(form.get(key) ?? "");
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function nullableNumber(form: FormData, key: string): number | null {
  const value = String(form.get(key) ?? "").trim();
  if (!value) {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.round(number)) : null;
}

function enumValue<T extends string>(form: FormData, key: string, values: readonly T[], fallback: T): T {
  const value = String(form.get(key) ?? "");
  return values.includes(value as T) ? (value as T) : fallback;
}

async function requireUserId() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }
  return userId;
}

export async function createSemesterAction(formData: FormData) {
  const userId = await requireUserId();
  await semesterMutations.create(userId, {
    name: formText(formData, "name"),
    description: nullableText(formData, "description"),
    startDate: new Date(formText(formData, "startDate")),
    endDate: nullableDate(formData, "endDate"),
    isActive: formData.get("isActive") === "on",
  });
  revalidatePath("/semesters");
  redirect("/semesters");
}

export async function deleteSemesterAction(formData: FormData) {
  const userId = await requireUserId();
  await semesterMutations.remove(userId, formText(formData, "id"));
  revalidatePath("/semesters");
  redirect("/semesters");
}

export async function createGoalAction(formData: FormData) {
  const userId = await requireUserId();
  await goalMutations.create(userId, {
    title: formText(formData, "title"),
    type: enumValue(formData, "type", ["LONG_TERM", "SEMESTER", "SKILL"], "LONG_TERM") as GoalType,
    description: nullableText(formData, "description"),
    targetMetric: nullableText(formData, "targetMetric"),
    dueDate: nullableDate(formData, "dueDate"),
    semesterId: nullableText(formData, "semesterId"),
  });
  revalidatePath("/goals");
  redirect("/goals");
}

export async function deleteGoalAction(formData: FormData) {
  const userId = await requireUserId();
  await goalMutations.remove(userId, formText(formData, "id"));
  revalidatePath("/goals");
  redirect("/goals");
}

export async function createCourseAction(formData: FormData) {
  const userId = await requireUserId();
  await courseMutations.create(userId, {
    name: formText(formData, "name"),
    description: nullableText(formData, "description"),
    color: formText(formData, "color") || "#006edb",
    semesterId: nullableText(formData, "semesterId"),
  });
  revalidatePath("/courses");
  redirect("/courses");
}

export async function deleteCourseAction(formData: FormData) {
  const userId = await requireUserId();
  await courseMutations.remove(userId, formText(formData, "id"));
  revalidatePath("/courses");
  redirect("/courses");
}

export async function addChapterAction(formData: FormData) {
  const userId = await requireUserId();
  const courseId = formText(formData, "courseId");
  await courseMutations.addChapter(userId, courseId, {
    title: formText(formData, "title"),
    description: nullableText(formData, "description"),
    order: Number(formText(formData, "order") || 0),
  });
  revalidatePath(`/courses/${courseId}`);
  redirect(`/courses/${courseId}`);
}

export async function updateChapterProgressAction(formData: FormData) {
  const userId = await requireUserId();
  const chapterId = formText(formData, "chapterId");
  const progress = Math.min(100, Math.max(0, Number(formText(formData, "progress") || 0)));
  await courseMutations.setChapterProgress(userId, chapterId, progress);
  revalidatePath("/courses", "layout");
}

export async function createTaskAction(formData: FormData) {
  const userId = await requireUserId();
  await taskMutations.create(userId, {
    title: formText(formData, "title"),
    description: nullableText(formData, "description"),
    priority: enumValue(formData, "priority", ["LOW", "MEDIUM", "HIGH", "URGENT"], "MEDIUM") as TaskPriority,
    scheduledAt: nullableDate(formData, "scheduledAt"),
    dueDate: nullableDate(formData, "dueDate"),
    estimatedMinutes: nullableNumber(formData, "estimatedMinutes"),
    courseId: nullableText(formData, "courseId"),
    goalId: nullableText(formData, "goalId"),
    semesterId: nullableText(formData, "semesterId"),
  });
  revalidatePath("/tasks");
  redirect("/tasks");
}

export async function setTaskStatusAction(formData: FormData) {
  const userId = await requireUserId();
  const id = formText(formData, "id");
  const status = enumValue(formData, "status", ["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"], "TODO");
  await taskMutations.setStatus(userId, id, status);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function deleteTaskAction(formData: FormData) {
  const userId = await requireUserId();
  await taskMutations.remove(userId, formText(formData, "id"));
  revalidatePath("/tasks");
  redirect("/tasks");
}

export async function createMaterialAction(formData: FormData) {
  const userId = await requireUserId();
  await materialMutations.create(userId, {
    name: formText(formData, "name"),
    type: enumValue(formData, "type", ["PDF", "PPT", "DOC", "WEB", "VIDEO", "IMAGE", "TEXT"], "WEB"),
    url: nullableText(formData, "url"),
    description: nullableText(formData, "description"),
    courseId: nullableText(formData, "courseId"),
    chapterId: nullableText(formData, "chapterId"),
  });
  revalidatePath("/materials");
  redirect("/materials");
}

export async function deleteMaterialAction(formData: FormData) {
  const userId = await requireUserId();
  await materialMutations.remove(userId, formText(formData, "id"));
  revalidatePath("/materials");
  redirect("/materials");
}

export async function createNoteAction(formData: FormData) {
  const userId = await requireUserId();
  const tags = formText(formData, "tags")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 8);
  await noteMutations.create(userId, {
    title: formText(formData, "title"),
    content: formText(formData, "content"),
    tags,
    courseId: nullableText(formData, "courseId"),
    chapterId: nullableText(formData, "chapterId"),
    knowledgeId: nullableText(formData, "knowledgeId"),
  });
  revalidatePath("/notes");
  redirect("/notes");
}

export async function deleteNoteAction(formData: FormData) {
  const userId = await requireUserId();
  await noteMutations.remove(userId, formText(formData, "id"));
  revalidatePath("/notes");
  redirect("/notes");
}

export async function createKnowledgeAction(formData: FormData) {
  const userId = await requireUserId();
  await knowledgeMutations.create(userId, {
    title: formText(formData, "title"),
    summary: nullableText(formData, "summary"),
    content: nullableText(formData, "content"),
    courseId: nullableText(formData, "courseId"),
    chapterId: nullableText(formData, "chapterId"),
  });
  revalidatePath("/knowledge");
  redirect("/knowledge");
}

export async function updateKnowledgeMasteryAction(formData: FormData) {
  const userId = await requireUserId();
  const id = formText(formData, "id");
  const mastery = Math.min(100, Math.max(0, Number(formText(formData, "mastery") || 0)));
  const knowledge = await prismaKnowledgeFind(userId, id);
  if (knowledge) {
    await knowledgeMutations.update(userId, id, { ...knowledge, mastery });
  }
  revalidatePath("/knowledge");
}

async function prismaKnowledgeFind(userId: string, id: string) {
  const { prisma } = await import("@/lib/db");
  return prisma.knowledge.findFirst({ where: { id, userId } });
}

export async function deleteKnowledgeAction(formData: FormData) {
  const userId = await requireUserId();
  await knowledgeMutations.remove(userId, formText(formData, "id"));
  revalidatePath("/knowledge");
  redirect("/knowledge");
}

export async function createReviewAction(formData: FormData) {
  const userId = await requireUserId();
  await reviewMutations.create(userId, {
    question: formText(formData, "question"),
    answer: nullableText(formData, "answer"),
    dueAt: nullableDate(formData, "dueAt") ?? new Date(),
    courseId: nullableText(formData, "courseId"),
    knowledgeId: nullableText(formData, "knowledgeId"),
  });
  revalidatePath("/reviews");
  redirect("/reviews");
}

export async function answerReviewAction(formData: FormData) {
  const userId = await requireUserId();
  const outcome = enumValue(formData, "outcome", ["again", "hard", "good", "easy"], "good");
  await reviewMutations.answer(userId, formText(formData, "id"), outcome);
  revalidatePath("/reviews");
}

export async function deleteReviewAction(formData: FormData) {
  const userId = await requireUserId();
  await reviewMutations.remove(userId, formText(formData, "id"));
  revalidatePath("/reviews");
  redirect("/reviews");
}

export async function createMistakeAction(formData: FormData) {
  const userId = await requireUserId();
  await mistakeMutations.create(userId, {
    question: formText(formData, "question"),
    myAnswer: nullableText(formData, "myAnswer"),
    correctAnswer: nullableText(formData, "correctAnswer"),
    reason: nullableText(formData, "reason"),
    courseId: nullableText(formData, "courseId"),
    chapterId: nullableText(formData, "chapterId"),
    knowledgeId: nullableText(formData, "knowledgeId"),
  });
  revalidatePath("/reviews/mistakes");
  redirect("/reviews/mistakes");
}

export async function setMistakeStatusAction(formData: FormData) {
  const userId = await requireUserId();
  const status = enumValue(formData, "status", ["ACTIVE", "MASTERED", "ARCHIVED"], "ACTIVE");
  await mistakeMutations.setStatus(userId, formText(formData, "id"), status);
  revalidatePath("/reviews/mistakes");
}

export async function startFocusAction(formData: FormData) {
  const userId = await requireUserId();
  const session = await focusMutations.start(userId, {
    type: enumValue(formData, "type", ["POMODORO", "TIMER", "COUNTDOWN"], "POMODORO"),
    courseId: nullableText(formData, "courseId"),
    chapterId: nullableText(formData, "chapterId"),
    taskId: nullableText(formData, "taskId"),
  });
  revalidatePath("/focus");
  return { sessionId: session.id, startedAt: session.startAt.toISOString() };
}

export async function finishFocusAction(formData: FormData) {
  const userId = await requireUserId();
  const session = await focusMutations.finish(userId, formText(formData, "sessionId"));
  revalidatePath("/focus");
  revalidatePath("/dashboard");
  return {
    sessionId: session.id,
    durationSeconds: session.durationSeconds ?? 0,
  };
}

export async function createMilestoneAction(formData: FormData) {
  const userId = await requireUserId();
  const goalId = formText(formData, "goalId");
  const latest = await prisma.goalMilestone.findMany({
    where: { goalId, goal: { userId } },
    orderBy: { order: "desc" },
    take: 1,
  });
  await prisma.goalMilestone.create({
    data: {
      goalId,
      title: formText(formData, "title"),
      description: nullableText(formData, "description"),
      order: (latest[0]?.order ?? 0) + 1,
    },
  });
  revalidatePath(`/goals/${goalId}`);
}

export async function toggleMilestoneAction(formData: FormData) {
  const userId = await requireUserId();
  const id = formText(formData, "id");
  const completed = formData.get("completed") === "on";
  const milestone = await prisma.goalMilestone.findFirst({
    where: { id, goal: { userId } },
    include: { goal: { include: { milestones: true } } },
  });
  if (!milestone) return;
  await prisma.goalMilestone.update({
    where: { id },
    data: { completed, completedAt: completed ? new Date() : null },
  });
  const total = milestone.goal.milestones.length;
  const done = milestone.goal.milestones.filter((item) => item.completed).length + (completed ? 1 : -1);
  await prisma.goal.update({
    where: { id: milestone.goalId },
    data: { progress: total > 0 ? Math.round((Math.max(0, done) / total) * 100) : 0 },
  });
  revalidatePath("/goals", "layout");
}
export async function updateProfileAction(formData: FormData) {
  const userId = await requireUserId();
  await prisma.user.update({
    where: { id: userId },
    data: { name: formText(formData, "name") },
  });
  revalidatePath("/settings");
}
export async function deleteMistakeAction(formData: FormData) {
  const userId = await requireUserId();
  await mistakeMutations.remove(userId, formText(formData, "id"));
  revalidatePath("/reviews/mistakes");
  redirect("/reviews/mistakes");
}