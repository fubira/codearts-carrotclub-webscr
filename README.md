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

### 3. DBからデータセットを生成


```sh
# 2022年1月～6月までのデータを学習用として出力
yarn start dataset -o "20220[1-6]" train.json

# 2022年7月のデータを検証用として出力
yarn start dataset -o "202207" test.json
```

### 4. 機械学習と検証

```sh
# 学習状況を初期化し、学習データとして train.json 検証データとして test.json を指定する
yarn start run --init --train-data train.json --test-data test.json 
```
