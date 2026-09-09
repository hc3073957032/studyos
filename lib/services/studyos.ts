import { auth } from "@/lib/auth";
import {
  addDays,
  calculateStreak,
  endOfDay,
  minutesFromMilliseconds,
  startOfDay,
  startOfWeek,
} from "@/lib/algorithms/study";
import { prisma } from "@/lib/db";

export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function getDashboardData(userId: string) {
  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);
  const weekStart = startOfWeek(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todayTasks, weekSessions, monthSessions, activeTasks, courses, goals, activeSession, recentSessions] =
    await Promise.all([
      prisma.task.findMany({
        where: {
          userId,
          status: { in: ["TODO", "IN_PROGRESS"] },
          OR: [
            { scheduledAt: { gte: dayStart, lte: dayEnd } },
            { dueDate: { gte: dayStart, lte: dayEnd } },
          ],
        },
        include: {
          course: { select: { id: true, name: true, color: true } },
          goal: { select: { id: true, title: true } },
        },
        orderBy: [{ scheduledAt: "asc" }, { priority: "desc" }],
      }),
      prisma.studySession.findMany({
        where: { userId, startAt: { gte: weekStart } },
        select: { startAt: true, durationSeconds: true },
      }),
      prisma.studySession.findMany({
        where: { userId, startAt: { gte: monthStart } },
        select: { startAt: true, durationSeconds: true },
      }),
      prisma.task.count({
        where: { userId, status: { in: ["TODO", "IN_PROGRESS"] } },
      }),
      prisma.course.findMany({
        where: { userId },
        select: { id: true, name: true, color: true, progress: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.goal.findMany({
        where: { userId, status: "ACTIVE" },
        select: { id: true, title: true, type: true, progress: true },
        orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
        take: 5,
      }),
      prisma.studySession.findFirst({
        where: { userId, endAt: null },
        orderBy: { startAt: "desc" },
        include: { course: { select: { id: true, name: true } } },
      }),
      prisma.studySession.findMany({
        where: { userId, startAt: { gte: addDays(now, -90) } },
        select: { startAt: true, durationSeconds: true },
        orderBy: { startAt: "desc" },
      }),
    ]);

  const weekMinutes = minutesFromMilliseconds(
    weekSessions.reduce((total, session) => total + (session.durationSeconds ?? 0) * 1000, 0),
  );
  const monthMinutes = minutesFromMilliseconds(
    monthSessions.reduce((total, session) => total + (session.durationSeconds ?? 0) * 1000, 0),
  );
  const streak = calculateStreak(recentSessions.map((session) => session.startAt));

  return {
    todayTasks,
    activeTaskCount: activeTasks,
    plannedMinutes: todayTasks.reduce((sum, task) => sum + (task.estimatedMinutes ?? 0), 0),
    weekMinutes,
    monthMinutes,
    streak,
    courses,
    goals,
    activeSession,
  };
}

export async function listSemesters(userId: string) {
  return prisma.semester.findMany({
    where: { userId },
    include: {
      _count: { select: { courses: true, tasks: true, goals: true } },
    },
    orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
  });
}

export async function getSemester(userId: string, id: string) {
  return prisma.semester.findFirst({
    where: { id, userId },
    include: {
      courses: { include: { _count: { select: { chapters: true } } } },
      goals: true,
      tasks: { include: { course: { select: { name: true } } } },
    },
  });
}

export async function listGoals(userId: string) {
  return prisma.goal.findMany({
    where: { userId, status: { not: "ARCHIVED" } },
    include: {
      semester: { select: { id: true, name: true } },
      milestones: { orderBy: { order: "asc" } },
      _count: { select: { tasks: true } },
    },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  });
}

export async function getGoal(userId: string, id: string) {
  return prisma.goal.findFirst({
    where: { id, userId },
    include: {
      semester: true,
      milestones: { orderBy: { order: "asc" } },
      tasks: { include: { course: { select: { id: true, name: true } } } },
    },
  });
}

export async function listCourses(userId: string) {
  return prisma.course.findMany({
    where: { userId },
    include: {
      semester: { select: { id: true, name: true } },
      chapters: { orderBy: { order: "asc" }, select: { id: true, title: true, progress: true, order: true } },
      _count: { select: { tasks: true, notes: true, materials: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getCourse(userId: string, id: string) {
  return prisma.course.findFirst({
    where: { id, userId },
    include: {
      semester: true,
      chapters: {
        orderBy: { order: "asc" },
        include: {
          knowledge: { select: { id: true, title: true } },
          _count: { select: { tasks: true, materials: true, notes: true } },
        },
      },
      materials: { orderBy: { updatedAt: "desc" }, take: 10 },
      notes: { orderBy: { updatedAt: "desc" }, take: 8 },
      tasks: {
        where: { status: { in: ["TODO", "IN_PROGRESS"] } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
}

export async function listTasks(userId: string, day?: Date) {
  const filter = day
    ? {
        userId,
        OR: [
          { scheduledAt: { gte: startOfDay(day), lte: endOfDay(day) } },
          { dueDate: { gte: startOfDay(day), lte: endOfDay(day) } },
        ],
      }
    : { userId };

  return prisma.task.findMany({
    where: filter,
    include: {
      course: { select: { id: true, name: true, color: true } },
      goal: { select: { id: true, title: true } },
      chapter: { select: { id: true, title: true } },
      semester: { select: { id: true, name: true } },
    },
    orderBy: [{ status: "asc" }, { scheduledAt: "asc" }, { priority: "desc" }],
  });
}

export async function listKnowledge(userId: string) {
  return prisma.knowledge.findMany({
    where: { userId },
    include: {
      course: { select: { id: true, name: true } },
      chapter: { select: { id: true, title: true } },
      _count: { select: { notes: true, reviews: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function listNotes(userId: string) {
  return prisma.note.findMany({
    where: { userId },
    include: {
      course: { select: { id: true, name: true } },
      chapter: { select: { id: true, title: true } },
      knowledge: { select: { id: true, title: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function listMaterials(userId: string) {
  return prisma.courseMaterial.findMany({
    where: { userId },
    include: {
      course: { select: { id: true, name: true } },
      chapter: { select: { id: true, title: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function listReviews(userId: string, dueOnly = false) {
  return prisma.review.findMany({
    where: {
      userId,
      ...(dueOnly ? { status: { not: "MASTERED" }, dueAt: { lte: endOfDay(new Date()) } } : {}),
    },
    include: {
      course: { select: { id: true, name: true, color: true } },
      knowledge: { select: { id: true, title: true } },
    },
    orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
  });
}

export async function listMistakes(userId: string) {
  return prisma.mistake.findMany({
    where: { userId, status: { not: "ARCHIVED" } },
    include: {
      course: { select: { id: true, name: true } },
      chapter: { select: { id: true, title: true } },
      knowledge: { select: { id: true, title: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function searchAll(userId: string, query: string) {
  const contains = query;
  const filter = { contains, mode: "insensitive" as const };
  const [courses, tasks, notes, knowledge, materials] = await Promise.all([
    prisma.course.findMany({ where: { userId, name: filter }, take: 8, select: { id: true, name: true } }),
    prisma.task.findMany({ where: { userId, title: filter }, take: 12, select: { id: true, title: true, status: true } }),
    prisma.note.findMany({ where: { userId, title: filter }, take: 12, select: { id: true, title: true } }),
    prisma.knowledge.findMany({ where: { userId, title: filter }, take: 12, select: { id: true, title: true } }),
    prisma.courseMaterial.findMany({ where: { userId, name: filter }, take: 12, select: { id: true, name: true, type: true } }),
  ]);
  return { courses, tasks, notes, knowledge, materials };
}

export async function getAnalyticsData(userId: string) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const [sessions, tasks, courses] = await Promise.all([
    prisma.studySession.findMany({
      where: { userId, startAt: { gte: monthStart, lt: nextMonth } },
      select: { startAt: true, durationSeconds: true },
      orderBy: { startAt: "asc" },
    }),
    prisma.task.findMany({
      where: { userId, updatedAt: { gte: monthStart } },
      select: { status: true, updatedAt: true },
    }),
    prisma.course.findMany({
      where: { userId },
      select: { id: true, name: true, progress: true, _count: { select: { studySessions: true, knowledge: true } } },
    }),
  ]);

  const dailyMinutes = sessions.map((session) => ({
    date: startOfDay(session.startAt).toISOString(),
    minutes: Math.max(0, Math.round((session.durationSeconds ?? 0) / 60)),
  }));
  const totalMinutes = sessions.reduce((sum, session) => sum + Math.round((session.durationSeconds ?? 0) / 60), 0);
  const completedTasks = tasks.filter((task) => task.status === "COMPLETED").length;

  return {
    dailyMinutes,
    totalMinutes,
    totalSessions: sessions.length,
    completedTasks,
    allTasks: tasks.length,
    courses,
  };
}

export async function getUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      _count: {
        select: {
          courses: true,
          tasks: true,
          notes: true,
          studySessions: true,
          reviews: true,
        },
      },
    },
  });
}