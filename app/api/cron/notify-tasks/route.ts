import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';
import { EmailTemplate } from '@/components/email/EmailTemplate';
import * as React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  return handleCronRequest(request);
}

export async function POST(request: Request) {
  return handleCronRequest(request);
}

async function handleCronRequest(request: Request) {
  try {
    // 1. セキュリティ検証
    // Authorization ヘッダー または クエリパラメータから CRON_SECRET を確認
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const querySecret = searchParams.get('secret');
    
    const validSecret = process.env.CRON_SECRET;
    
    if (!validSecret) {
      console.error('CRON_SECRET is not set in environment variables.');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const isAuthorized = 
      authHeader === `Bearer ${validSecret}` || 
      querySecret === validSecret;

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. 現在時刻（JST）と曜日の取得
    const now = new Date();
    // JST (UTC+9) に変換
    const jstOffset = 9 * 60 * 60 * 1000;
    const jstNow = new Date(now.getTime() + jstOffset);

    // 時間と分を取得し、分を直近の15分刻みに丸める (Cronの実行ズレを許容するため)
    const hours = String(jstNow.getUTCHours()).padStart(2, '0');
    let minutes = jstNow.getUTCMinutes();
    const roundedMinutes = Math.round(minutes / 15) * 15;
    
    // もし丸めて60になったら時間を繰り上げる
    let finalHoursNum = parseInt(hours, 10);
    let finalMinutesNum = roundedMinutes;
    if (finalMinutesNum === 60) {
      finalMinutesNum = 0;
      finalHoursNum = (finalHoursNum + 1) % 24;
    }
    
    const finalHoursStr = String(finalHoursNum).padStart(2, '0');
    const finalMinutesStr = String(finalMinutesNum).padStart(2, '0');
    const currentTimeStr = `${finalHoursStr}:${finalMinutesStr}`; // "09:00", "09:15" などの形式

    const currentDay = jstNow.getUTCDay().toString(); // 0(日) 〜 6(土)

    console.log(`Cron triggered at ${now.toISOString()} -> JST Time: ${currentTimeStr}, Day: ${currentDay}`);

    // 3. 該当するタスクの取得
    // is_template = true, notification_time = currentTimeStr のものを全て取得
    const tasks = await prisma.task.findMany({
      where: {
        is_template: true,
        notification_time: currentTimeStr,
        // recurrenceによるフィルタリングはプログラム側で行う（複数曜日のパースがあるため）
      },
      include: {
        goal: {
          include: {
            owner: true,
          },
        },
      },
    });

    // 4. 通知対象の選別
    const tasksToNotify = tasks.filter((task) => {
      if (!task.recurrence) return false;

      if (task.recurrence === 'daily') {
        return true;
      }

      if (task.recurrence === 'weekly' && task.notification_days) {
        // notification_days は "1,3,5" のような形式を想定
        const daysArray = task.notification_days.split(',');
        return daysArray.includes(currentDay);
      }

      return false;
    });

    if (tasksToNotify.length === 0) {
      return NextResponse.json({ message: 'No tasks to notify at this time.', time: currentTimeStr }, { status: 200 });
    }

    // 5. メールの送信
    const sendPromises = tasksToNotify.map(async (task) => {
      const email = task.goal.owner.email;
      const userName = task.goal.owner.id; // DBの制約で名前が無い場合があるのでidなどをフォールバックにするか、emailのみとする

      const body = `定期タスクの時間です！\n\nタスク名: ${task.title}\n${task.memo ? `メモ: ${task.memo}\n` : ''}\n今日も目標に向かって進めましょう！`;

      try {
        await resend.emails.send({
          from: 'Pathieve <onboarding@resend.dev>',
          to: email,
          subject: `【Pathieve通知】${task.title}`,
          react: EmailTemplate({ body }) as React.ReactElement,
        });
        return { success: true, taskId: task.id, email };
      } catch (err) {
        console.error(`Failed to send email for task ${task.id} to ${email}`, err);
        return { success: false, taskId: task.id, email, error: err };
      }
    });

    const results = await Promise.all(sendPromises);

    return NextResponse.json({
      message: `Sent ${results.filter((r) => r.success).length} notifications.`,
      time: currentTimeStr,
      results,
    }, { status: 200 });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
