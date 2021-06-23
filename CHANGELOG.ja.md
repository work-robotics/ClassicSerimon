<a name="unreleased"></a>
## [Unreleased]

<a name="v0.1.2"></a>
## [v0.1.2] - 2021-06-08

- 保存したファイルのバージョン表記がundefinedになる問題を解消 ([#31](https://github.com/work-robotics/Serimon/pull/31))


<a name="v0.1.1"></a>
## [v0.1.1] - 2021-05-29

- 埋め込みフォントのライセンス表記を追加 ([#26](https://github.com/work-robotics/Serimon/pull/26))

<a name="v0.1.0"></a>
## v0.1.0 - 2021-05-29

- シリアル通信機能
- 接続するデバイスの一覧表示
- ボーレートの選択機能
- 設定画面の表示機能
- 受信データをバイナリで保存する機能
- 画面クリア機能
- 列番号の表示
- 1KHzでの受信に対応 
- バイナリ表示時の改行場所の変更
- バイナリ表示モード
- アスキー表示モード
- オリジナルのホットリード機能の追加 ([#13](https://github.com/work-robotics/Serimon/pull/13))
- （ロゴ+名前付き）の会社ロゴを入れる
    - ロゴをクリックしたら会社のホームページを開く（現状はElectronのブラウザで開きます）
- 保存時のファイル名にデバイスコードとタイムスタンプを付加
    - デバイスコード_タイムスタンプ.wrelで保存
- メタ情報の付加
    - ハードコーディングでメタ情報を付加
    - 保存ウィンドウを作成し、メタ情報を入力できるように
        -  デバイスコードの入力欄
    - 過去のメタ情報の入力データを設定ファイル等で保持できるようにする
    - データ受信開始時のタイムスタンプを追加
- 設定ファイルの導入
    - 実行ファイルの側に設定ファイルを配置 
- OSSライセンスページの追加 ([#23](https://github.com/work-robotics/Serimon/pull/23))

[Unreleased]: https://github.com/work-robotics/Serimon/compare/v0.1.2...HEAD
[v0.1.2]: https://github.com/work-robotics/Serimon/compare/v0.1.1...v0.1.2
[v0.1.1]: https://github.com/work-robotics/Serimon/compare/v0.1.0...v0.1.1