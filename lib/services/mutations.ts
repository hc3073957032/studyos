import type {
  GoalType,
  MaterialType,
  SessionType,
  TaskPriority,
  TaskStatus,
} from "@prisma/client";

import { addDays, nextReviewInterval } from "@/lib/algorithms/study";
import { prisma } from "@/lib/db";

export type SemesterInput = {
  name: string;
  description?: string | null;
  startDate: Date;
  endDate?: Date | null;
  isActive?: boolean;
};

export type GoalInput = {
  title: string;
  type?: GoalType;
  description?: string | null;
  targetMetric?: string | null;
  dueDate?: Date | null;
  progress?: number;
  semesterId?: string | null;
};

export type CourseInput = {
  name: string;
  description?: string | null;
  color?: string;
  progress?: number;
  semesterId?: string | null;
};

export type ChapterInput = {
  title: string;
  description?: string | null;
  order: number;
  progress?: number;
};

export type TaskInput = {
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  scheduledAt?: Date | null;
  dueDate?: Date | null;
  estimatedMinutes?: number | null;
  semesterId?: string | null;
  courseId?: string | null;
  chapterId?: string | null;
  goalId?: string | null;
};

export type MaterialInput = {
  name: string;
  type: MaterialType;
  url?: string | null;
  description?: string | null;
  courseId?: string | null;
  chapterId?: string | null;
};

export type NoteInput = {
  title: string;
  content: string;
  tags?: string[];
  courseId?: string | null;
  chapterId?: string | null;
  knowledgeId?: string | null;
};

export type KnowledgeInput = {
  title: string;
  summary?: string | null;
  content?: string | null;
  mastery?: number;
  parentId?: string | null;
  courseId?: string | null;
  chapterId?: string | null;
};

export type ReviewInput = {
  question: string;
  answer?: string | null;
  dueAt?: Date | null;
  courseId?: string | null;
  knowledgeId?: string | null;
};

export type MistakeInput = {
  question: string;
  myAnswer?: string | null;
  correctAnswer?: string | null;
  reason?: string | null;
  courseId?: string | null;
  chapterId?: string | null;
  knowledgeId?: string | null;
};

export type FocusStartInput = {
  type: SessionType;
  courseId?: string | null;
  chapterId?: string | null;
  taskId?: string | null;
};

async function assertSemester(userId: string, id: string) {
  return prisma.semester.findFirstOrThrow({ where: { id, userId } });
}

async function assertGoal(userId: string, id: string) {
  return prisma.goal.findFirstOrThrow({ where: { id, userId } });
}

async function assertCourse(userId: string, id: string) {
  return prisma.course.findFirstOrThrow({ where: { id, userId } });
}

async function assertChapter(userId: string, id: string) {
  return prisma.chapter.findFirstOrThrow({ where: { id, userId } });
}

async function assertTask(userId: string, id: string) {
  return prisma.task.findFirstOrThrow({ where: { id, userId } });
}

async function assertKnowledge(userId: string, id: string) {
  return prisma.knowledge.findFirstOrThrow({ where: { id, userId } });
}

async function assertMaterial(userId: string, id: string) {
  return prisma.courseMaterial.findFirstOrThrow({ where: { id, userId } });
}

async function assertNote(userId: string, id: string) {
  return prisma.note.findFirstOrThrow({ where: { id, userId } });
}

async function assertReview(userId: string, id: string) {
  return prisma.review.findFirstOrThrow({ where: { id, userId } });
}

async function assertMistake(userId: string, id: string) {
  return prisma.mistake.findFirstOrThrow({ where: { id, userId } });
}

export const semesterMutations = {
  async create(userId: string, input: SemesterInput) {
    return prisma.semester.create({ data: { userId, ...input } });
  },
  async update(userId: string, id: string, input: SemesterInput) {
    await assertSemester(userId, id);
    return prisma.semester.update({ where: { id }, data: input });
  },
  async remove(userId: string, id: string) {
    await assertSemester(userId, id);
    return prisma.semester.delete({ where: { id } });
  },
};

export const goalMutations = {
  async create(userId: string, input: GoalInput) {
    return prisma.goal.create({ data: { userId, ...input } });
  },
  async update(userId: string, id: string, input: GoalInput) {
    await assertGoal(userId, id);
    return prisma.goal.update({ where: { id }, data: input });
  },
  async remove(userId: string, id: string) {
    await assertGoal(userId, id);
    return prisma.goal.delete({ where: { id } });
  },
  async toggleMilestone(userId: string, milestoneId: string, completed: boolean) {
    const milestone = await prisma.goalMilestone.findFirst({
      where: { id: milestoneId, goal: { userId } },
    });
    if (!milestone) {
      throw new Error("Not found");
    }
    return prisma.goalMilestone.update({
      where: { id: milestoneId },
      data: { completed, completedAt: completed ? new Date() : null },
    });
  },
};

export const courseMutations = {
  async create(userId: string, input: CourseInput) {
    return prisma.course.create({ data: { userId, ...input } });
  },
  async update(userId: string, id: string, input: CourseInput) {
    await assertCourse(userId, id);
    return prisma.course.update({ where: { id }, data: input });
  },
  async remove(userId: string, id: string) {
    await assertCourse(userId, id);
    return prisma.course.delete({ where: { id } });
  },
  async addChapter(userId: string, courseId: string, input: ChapterInput) {
    await assertCourse(userId, courseId);
    return prisma.chapter.create({
      data: { userId, courseId, ...input },
    });
  },
  async updateChapter(userId: string, chapterId: string, input: ChapterInput) {
    await assertChapter(userId, chapterId);
    return prisma.chapter.update({ where: { id: chapterId }, data: input });
  },
  async setChapterProgress(userId: string, chapterId: string, progress: number) {
    const chapter = await prisma.chapter.findFirst({
      where: { id: chapterId, userId },
      include: { course: { select: { chapters: { select: { id: true, progress: true } } } } },
    });
    if (!chapter) {
      throw new Error("Not found");
    }
    const updated = await prisma.chapter.update({
      where: { id: chapterId },
      data: { progress },
    });
    const chapterProgresses = chapter.course.chapters.map((item) =>
      item.id === chapterId ? progress : item.progress,
    );
    const courseProgress =
      chapterProgresses.length > 0
        ? Math.round(chapterProgresses.reduce((sum, value) => sum + value, 0) / chapterProgresses.length)
        : 0;
    await prisma.course.update({ where: { id: chapter.courseId }, data: { progress: courseProgress } });
    return updated;
  },
  async removeChapter(userId: string, chapterId: string) {
    await assertChapter(userId, chapterId);
    return prisma.chapter.delete({ where: { id: chapterId } });
  },
};

export const taskMutations = {
  async create(userId: string, input: TaskInput) {
    return prisma.task.create({ data: { userId, ...input } });
  },
  async update(userId: string, id: string, input: Partial<TaskInput>) {
    await assertTask(userId, id);
    return prisma.task.update({ where: { id }, data: input });
  },
  async setStatus(userId: string, id: string, status: TaskStatus) {
    await assertTask(userId, id);
    return prisma.task.update({
      where: { id },
      data: { status, actualMinutes: status === "COMPLETED" ? undefined : undefined },
    });
  },
  async remove(userId: string, id: string) {
    await assertTask(userId, id);
    return prisma.task.delete({ where: { id } });
  },
};

export const materialMutations = {
  async create(userId: string, input: MaterialInput) {
    return prisma.courseMaterial.create({ data: { userId, ...input } });
  },
  async update(userId: string, id: string, input: MaterialInput) {
    await assertMaterial(userId, id);
    return prisma.courseMaterial.update({ where: { id }, data: input });
  },
  async remove(userId: string, id: string) {
    await assertMaterial(userId, id);
    return prisma.courseMaterial.delete({ where: { id } });
  },
};

export const noteMutations = {
  async create(userId: string, input: NoteInput) {
    return prisma.note.create({ data: { userId, ...input } });
  },
  async update(userId: string, id: string, input: NoteInput) {
    await assertNote(userId, id);
    return prisma.note.update({ where: { id }, data: input });
  },
  async remove(userId: string, id: string) {
    await assertNote(userId, id);
    return prisma.note.delete({ where: { id } });
  },
};

export const knowledgeMutations = {
  async create(userId: string, input: KnowledgeInput) {
    return prisma.knowledge.create({ data: { userId, ...input } });
  },
  async update(userId: string, id: string, input: KnowledgeInput) {
    await assertKnowledge(userId, id);
    return prisma.knowledge.update({ where: { id }, data: input });
  },
  async remove(userId: string, id: string) {
    await assertKnowledge(userId, id);
    return prisma.knowledge.delete({ where: { id } });
  },
};

export const reviewMutations = {
  async create(userId: string, input: ReviewInput) {
    return prisma.review.create({
      data: {
        userId,
        question: input.question,
        answer: input.answer,
        dueAt: input.dueAt ?? new Date(),
        courseId: input.courseId,
        knowledgeId: input.knowledgeId,
      },
    });
  },
  async answer(userId: string, id: string, outcome: "again" | "hard" | "good" | "easy") {
    const review = await assertReview(userId, id);
    const intervalDays = nextReviewInterval(review.intervalDays, outcome);
    const status = outcome === "again" ? "LEARNING" : outcome === "easy" && intervalDays >= 30 ? "MASTERED" : "REVIEWING";
    return prisma.review.update({
      where: { id },
      data: {
        status,
        intervalDays,
        reviewCount: { increment: 1 },
        lastReviewedAt: new Date(),
        dueAt: addDays(new Date(), intervalDays),
      },
    });
  },
  async remove(userId: string, id: string) {
    await assertReview(userId, id);
    return prisma.review.delete({ where: { id } });
  },
};

export const mistakeMutations = {
  async create(userId: string, input: MistakeInput) {
    return prisma.mistake.create({ data: { userId, ...input } });
  },
  async setStatus(userId: string, id: string, status: "ACTIVE" | "MASTERED" | "ARCHIVED") {
    await assertMistake(userId, id);
    return prisma.mistake.update({ where: { id }, data: { status } });
  },
  async remove(userId: string, id: string) {
    await assertMistake(userId, id);
    return prisma.mistake.delete({ where: { id } });
  },
};

export const focusMutations = {
  async start(userId: string, input: FocusStartInput) {
    return prisma.studySession.create({
      data: {
        userId,
        type: input.type,
        courseId: input.courseId,
        chapterId: input.chapterId,
        taskId: input.taskId,
      },
    });
  },
  async finish(userId: string, sessionId: string) {
    const session = await prisma.studySession.findFirst({ where: { id: sessionId, userId } });
    if (!session || session.endAt) {
      throw new Error("Session not found or already finished");
    }
    const endAt = new Date();
    const durationSeconds = Math.max(60, Math.floor((endAt.getTime() - session.startAt.getTime()) / 1000));
    return prisma.studySession.update({
      where: { id: sessionId },
      data: { endAt, durationSeconds },
    });
  },
};
