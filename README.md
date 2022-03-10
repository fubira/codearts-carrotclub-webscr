# codearts-webscr

## 概要

node.jsによるWebスクレイピングツール実装例:

キャロットクラブ公式サイトにログインして出資馬の更新内容を取得しSlackに送信する

## 前提環境

- Windows
- [Node.js LTS](https://nodejs.org/ja/download/)

## Develop

### 初期設定

```sh
yarn
```

### デバッグ実行(更新監視による再実行)

```sh
yarn dev
```

### 実行

```sh
yarn start
```

## Options

| 項目            | Env           | 値          | 説明                                      |
| --------------- | ------------- |------------ | ----------------------------------------- |
| site-id         | SITE_ID       | undefined   | 解析するサイトのユーザID                  |
| site-pass       | SITE_PASS     | undefined   | 解析するサイトのパスワード                |
| slack-token     | SLACK_TOKEN   | undefined   | 解析結果の送信先Slackトークン             |
| slack-channel   | SLACK_CHANNEL | undefined   | 解析結果の送信先Slackチャンネル           |
| no-send         |               | false       | trueの場合、Slack送信を行わない           |
| force-send      |               | false       | trueの場合、更新がなくてもSlack送信を行う |
| no-sandbox      |               | false       | trueの場合、puppeteerをno-sandboxで実行   |

## Install Dependencies (for Debian)

```sh
sudo apt-get update && \
sudo apt-get install -yq gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 \
libexpat1 libfontconfig1 libgbm1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 \
libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
```
