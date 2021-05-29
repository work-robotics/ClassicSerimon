# 開発者向け情報

## 1. 環境構築

以下のアプリケーションを開発環境へインストールします。

| アプリケーション名                                   | バージョン(指定がある場合のみ、記載する)            | インストール条件                   |
| ---------------------------------------------------- | --------------------------------------------------- | ---------------------------------- |
| [Node.js](https://nodejs.org/ja/)                    | v12.18.3 以上 （動作確認済のバージョンは v12.18.3） | 必須                               |
| [yarn](https://classic.yarnpkg.com/ja/)              |    1.21.1 以上 (それ以前のバージョンには[不具合がある](https://blog.cybozu.io/entry/npm-vulnerabilities-and-postinstall)ため)      | 必須 (依存するnpmパッケージのインストールおよび本プログラムの実行に使用) |
| [Python](https://www.python.org/downloads/)              |    3 以上      | 必須 ([node-gyp](https://github.com/nodejs/node-gyp)が依存) |
| [Visual Studio Code](https://code.visualstudio.com/) |                                                     | Visual Studio Code を利用する場合  |

### 1-1. Visual Studio Code の拡張機能

Visual Studio Code を利用する場合は、以下の拡張機能をインストールします。

| 拡張機能                                                                                                | インストール条件 |
| ------------------------------------------------------------------------------------------------------- | ---------------- |
| [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)                    | 任意             |
| [TSLint](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-tslint-plugin) | 任意             |

---

## 2. 実行

コマンドの実行は、プロジェクトのルートディレクトリでおこないます。

### 2-1. デバッグ用ビルド

デバッグ用ビルドの場合はホットリロードに対応したアプリケーションを起動します。

#### 2-1-1. 依存関係を構築する

以下のコマンドを実行し、依存パッケージをインストールします。

```bash
# install dependencies
$ yarn install
```

#### 2-1-2. プログラムを実行する

以下のコマンドを実行すると、アプリケーションが立ち上がります。

```bash
# build and start
$ yarn dev
```

### 2-2. リリース用ビルド

リリース用ビルドはNode.jsの開発環境がないマシンでも動作するよう、Windows向けであれば`.exe`などポータブルなバイナリを書き出します。


#### 2-2-1. 依存関係を構築する

以下のコマンドを実行し、依存パッケージをインストールします。

```bash
# install dependencies
$ yarn install
```

#### 2-2-2. プログラムを実行する

以下のコマンドを実行すると、バイナリをreleaseディレクトリ（フォルダ）に書き出します。

```bash
# build and release
$ yarn build
$ yarn dist
```
