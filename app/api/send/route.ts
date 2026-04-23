import { Resend } from 'resend';
import { EmailTemplate } from '@/components/email/EmailTemplate';
import { NextResponse } from 'next/server';
import * as React from 'react';

// 念のため API Key がない場合はエラーになるように設定
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, body: emailBody } = body;

    // バリデーション
    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        { error: '必要な情報(to, subject, body)が不足しています。' },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: 'Pathieve <onboarding@resend.dev>', // ※独自ドメイン取得前は onboarding@resend.dev のみ使用可能（送信先も登録アドレスのみに制限されます）
      to: to,
      subject: subject,
      react: EmailTemplate({ body: emailBody }) as React.ReactElement,
    });

    // ResendのAPIからエラーが返ってきた場合
    if (error) {
      console.error('Resend Error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error('Email Send Exception:', error);
    return NextResponse.json(
      { error: 'メール送信処理中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}
