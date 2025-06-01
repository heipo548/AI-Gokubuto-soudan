#!/bin/bash

echo "--- Starting custom build script (in .platform/hooks/predeploy) ---"

# Elastic Beanstalkのデプロイプロセス中、
# アプリケーションのソースコードは /var/app/staging ディレクトリにあります。
# また、このスクリプトが実行される時点で、npm install は完了しています。
# カレントディレクトリをアプリケーションのルートに変更します。
cd /var/app/staging

echo "Current directory: $(pwd)"
echo "Listing files in current directory:"
ls -la

# Next.jsのビルドコマンドを実行します。
# package.json の "scripts" に "build": "next build" が定義されていることを前提とします。
echo "Running 'npm run build'..."
npm run build

# ビルドコマンドの終了ステータスを確認します (任意ですが推奨)。
if [ $? -eq 0 ]; then
  echo "Build command completed successfully."
else
  echo "Build command FAILED. Please check the logs for errors."
  # エラーが発生した場合、デプロイを停止させるために非ゼロで終了します。
  exit 1
fi

echo "--- Finished custom build script ---"