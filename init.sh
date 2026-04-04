#!/bin/bash

# --- 設定項目 ---
PORT=3001
ENV_FILE=".env.local"
EXAMPLE_FILE=".env.example"

# 1. 既存のキャッシュとライブラリを削除
echo "🧹 Cleaning up node_modules and .next..."
rm -rf node_modules .next

# 2. .env.example があれば .env としてコピー (既存の .env は上書きしない)
if [ -f "$EXAMPLE_FILE" ]; then
    if [ ! -f ".env" ]; then
        echo "📄 Creating .env from .env.example..."
        cp "$EXAMPLE_FILE" .env
    fi
fi

# 3. .env.local の作成とポート情報の書き込み
echo "📝 Updating $ENV_FILE with PORT $PORT..."
# 既存のファイルを上書き（または新規作成）
echo "NEXT_PUBLIC_API_URL=http://localhost:$PORT" > "$ENV_FILE"

# 4. パッケージの再インストール
echo "📦 Installing dependencies..."
npm install

# 5. 指定したポートで開発サーバーを起動
echo "🚀 Starting development server on port $PORT..."
npm run dev -- -p $PORT