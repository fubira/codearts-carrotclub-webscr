# codearts-betai-tateyamakun

## 概要

競馬AIたてやまくん

## 前提環境

- [Node.js LTS](https://nodejs.org/ja/download/)

## 使い方

### 1. JRA-VANデータ取得

```sh
yarn install
yarn csv
```

JV2Linkからデータを取得します。 ./.csv ディレクトリに取得データが出力されます。
※ 事前にJV2Linkの設定を行ってください。

### 2. 機械学習の実行

```sh
yarn start learn
```

### 3. 予測の実行

```sh
yarn start run
```
