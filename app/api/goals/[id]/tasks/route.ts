import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, extractBearerToken } from '@/lib/session'

async function getUser(request: Request) {
  const token = await extractBearerToken(request.headers.get('authorization'))
  if (!token) return null
  const payload = await verifyToken(token)
  return payload?.sub as string | null
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUser(request)
    if (!userId) return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 })

    const { id: goalId } = await context.params
    const goal = await prisma.goal.findUnique({ where: { id: goalId } })
    if (!goal || goal.user_id !== userId) {
      return NextResponse.json({ detail: 'Goal not found' }, { status: 404 })
    }

    // --- 日付判定ヘルパー（JST基準） ---
    const getJSTDateString = (d: Date) => {
      return new Date(d.getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0];
    };
    const getJSTYearWeek = (d: Date) => {
      const target = new Date(d.getTime() + 9 * 60 * 60 * 1000);
      const day = target.getDay() || 7;
      target.setDate(target.getDate() + 4 - day);
      const year = target.getFullYear();
      const firstDay = new Date(target.getTime());
      firstDay.setMonth(0, 1);
      const week = Math.ceil((((target.getTime() - firstDay.getTime()) / 86400000) + 1) / 7);
      return `${year}-W${week}`;
    };

    // --- 定期タスクの自動生成チェック ---
    const templates = await prisma.task.findMany({
      where: { goal_id: goalId, is_template: true },
      include: {
        generated_tasks: {
          orderBy: { created_at: 'desc' },
        }
      }
    });

    const now = new Date();
    const todayStr = getJSTDateString(now);
    const thisWeekStr = getJSTYearWeek(now);

    for (const tmpl of templates) {
      const generated = tmpl.generated_tasks;
      
      // 未完了のタスクがあれば生成しない
      const hasIncomplete = generated.some(t => t.progress < 100);
      if (hasIncomplete) continue;

      let shouldCreate = false;

      if (generated.length === 0) {
        shouldCreate = true;
      } else {
        const latestTask = generated[0];
        if (tmpl.recurrence === 'daily') {
          if (getJSTDateString(latestTask.created_at) !== todayStr) {
            shouldCreate = true;
          }
        } else if (tmpl.recurrence === 'weekly') {
          if (getJSTYearWeek(latestTask.created_at) !== thisWeekStr) {
            shouldCreate = true;
          }
        }
      }

      if (shouldCreate) {
        await prisma.task.create({
          data: {
            goal_id: goalId,
            title: tmpl.title,
            memo: tmpl.memo,
            progress: 0,
            template_id: tmpl.id,
            is_template: false,
          }
        });
      }
    }
    // --- 終了 ---

    const tasks = await prisma.task.findMany({
      where: { goal_id: goalId, is_template: false },
      orderBy: [
        { order: 'asc' },
        { created_at: 'asc' },
      ],
    })

    return NextResponse.json(tasks)
  } catch (error: any) {
    return NextResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
  }
}
