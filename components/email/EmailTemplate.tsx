import * as React from 'react';
import { Html, Head, Body, Container, Heading, Text, Preview } from '@react-email/components';

interface EmailTemplateProps {
  body: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  body,
}) => (
  <Html>
    <Head />
    <Preview>Pathieveからの通知</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Pathieve</Heading>
        {/* 改行を含むテキストをそのまま表示できるように white-space: pre-wrap を指定 */}
        <Text style={text}>{body}</Text>
      </Container>
    </Body>
  </Html>
);

// インラインスタイルの定義 (React Emailの推奨手法)
const main = {
  backgroundColor: '#f4f4f5',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  padding: '20px 0 48px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
};

const h1 = {
  color: '#18181b', // 濃いグレー
  fontSize: '24px',
  fontWeight: 'bold',
  padding: '0 48px',
  textAlign: 'center' as const,
};

const text = {
  color: '#3f3f46', // やや濃いグレー
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 48px',
  whiteSpace: 'pre-wrap' as const,
};
