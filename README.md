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
| siteId          | SITE_ID       | undefined   | 解析するサイトのユーザID                  |
| sitePass        | SITE_PASS     | undefined   | 解析するサイトのパスワード                |
| slackToken      | SLACK_TOKEN   | undefined   | 解析結果の送信先Slackトークン             |
| slackChannel    | SLACK_CHANNEL | undefined   | 解析結果の送信先Slackチャンネル           |
| force           |               | false       | trueの場合、更新がなくてもSlack送信を行う |

