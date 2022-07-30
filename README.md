# codearts-betai-tateyamakun

## 概要

競馬AIたてやまくん

## 前提環境

- [Node.js LTS](https://nodejs.org/ja/download/)

## 使い方

### 1. 競馬ブックSmartからのスクレイピング

```sh
yarn install
SITE_ID="{ID}" SITE_PASS="{PASS}" yarn scraping --year={year}
```

スクレイピングを実行します。./.site ディレクトリに結果が出力されます。
Smart有料アカウントを想定しているので、環境変数SITE_ID, SITE_PASSにアカウント情報を入力してください。
デフォルトでは今年の情報を取得しますが、 --year={year} を指定することで任意の年のデータを取得できます。

### 2. スクレイピングしたデータを分析してDB化

```sh
yarn start makedb
```

./.db ディレクトリが生成されます。

### 3. 学習実行

```sh
yarn start train
```

### 4. 予想実行

```sh
yarn start run
```

### 実行例

```sh
# 2022年の1～6月のデータを学習する
yarn start train "20220[1-6]" --clean
# 2022年の7～8月のデータを予想する
yarn start run "202207"
```
