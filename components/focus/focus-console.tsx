"use client";

import { useEffect, useState, useTransition } from "react";
import { LoaderCircle, Pause, Play, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { finishFocusAction, startFocusAction } from "@/lib/actions/studyos";

type FocusConsoleProps = {
  courses: { id: string; name: string }[];
  tasks: { id: string; title: string }[];
  initialTaskId?: string;
  activeSession?: {
    id: string;
    startedAt: string;
  };
};

function formatSeconds(total: number) {
  const safe = Math.max(0, total);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function FocusConsole({
  courses,
  tasks,
  initialTaskId,
  activeSession,
}: FocusConsoleProps) {
  const [type, setType] = useState<"POMODORO" | "TIMER" | "COUNTDOWN">("POMODORO");
  const [courseId, setCourseId] = useState("");
  const [taskId, setTaskId] = useState(initialTaskId ?? "");
  const [sessionId, setSessionId] = useState<string | null>(activeSession?.id ?? null);
  const [startedAt, setStartedAt] = useState<string | null>(activeSession?.startedAt ?? null);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!startedAt || paused) return;
    const started = new Date(startedAt).getTime();
    const timer = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - started) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [startedAt, paused]);

  async function handleStart() {
    const formData = new FormData();
    formData.set("type", type);
    if (courseId) formData.set("courseId", courseId);
    if (taskId) formData.set("taskId", taskId);
    startTransition(async () => {
      const result = await startFocusAction(formData);
      setSessionId(result.sessionId);
      setStartedAt(result.startedAt);
      setPaused(false);
    });
  }

  async function handleFinish() {
    if (!sessionId) return;
    const formData = new FormData();
    formData.set("sessionId", sessionId);
    startTransition(async () => {
      await finishFocusAction(formData);
      setSessionId(null);
      setStartedAt(null);
      setElapsed(0);
      setPaused(false);
    });
  }

  const targetSeconds = type === "POMODORO" ? 25 * 60 : type === "COUNTDOWN" ? 10 * 60 : elapsed;
  const remaining = type === "TIMER" ? elapsed : Math.max(0, targetSeconds - elapsed);
  const isActive = Boolean(sessionId);

  return (
    <section className="mx-auto w-full max-w-2xl border border-line bg-surface p-6 md:p-10">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="grid w-full grid-cols-3 border border-line bg-canvas p-1">
          {(["POMODORO", "TIMER", "COUNTDOWN"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              disabled={isActive}
              onClick={() => setType(mode)}
              className={`px-3 py-2 text-sm transition-colors disabled:opacity-60 ${
                type === mode ? "bg-surface font-medium text-ink" : "text-secondary hover:text-ink"
              }`}
            >
              {mode === "POMODORO" ? "25 分钟" : mode === "TIMER" ? "计时" : "倒计时"}
            </button>
          ))}
        </div>

        <p
          className={`mt-10 text-center font-semibold tabular-nums ${
            type === "TIMER" ? "text-6xl text-ink" : "text-7xl text-ink"
          }`}
          aria-live="polite"
        >
          {formatSeconds(type === "TIMER" ? elapsed : remaining)}
        </p>
        <p className="mt-3 h-5 text-sm text-secondary">
          {isActive ? (paused ? "已暂停" : "专注中") : "准备开始"}
        </p>

        <div className="mt-8 flex items-center gap-2">
          {isActive ? (
            <>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => setPaused((value) => !value)}
              >
                {paused ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
                {paused ? "继续" : "暂停"}
              </Button>
              <Button type="button" variant="danger" size="lg" onClick={handleFinish} disabled={isPending}>
                {isPending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Square className="size-4" aria-hidden />}
                结束
              </Button>
            </>
          ) : (
            <Button type="button" variant="primary" size="lg" onClick={handleStart} disabled={isPending}>
              {isPending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Play className="size-4" aria-hidden />}
              开始
            </Button>
          )}
        </div>
      </div>

      <div className="mt-10 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-ink">
          课程
          <Select value={courseId} onChange={(event) => setCourseId(event.target.value)} disabled={isActive}>
            <option value="">自由学习</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </Select>
        </label>
        <label className="space-y-2 text-sm font-medium text-ink">
          任务
          <Select value={taskId} onChange={(event) => setTaskId(event.target.value)} disabled={isActive}>
            <option value="">不关联任务</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </Select>
        </label>
      </div>
    </section>
  );
}
