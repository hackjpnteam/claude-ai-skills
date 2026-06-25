# kaigyo — 日本語改行最適化スキル

## 概要
HTML・CSS・テキストファイル内の不適切な日本語改行を自動検出・修正するスキル。
美しいタイポグラフィを実現するため、単語の途中での改行を防ぎ、適切な改行制御を追加する。

## 主な機能

### 1. 改行問題検出
- 日本語単語の途中での改行
- 英数字と日本語の混在での不適切な改行
- 固有名詞・ブランド名の分割
- 単位や記号の分離

### 2. 自動修正
- `white-space: nowrap` の適用
- `word-break: keep-all` の設定
- `<span class="no-break">` での囲み
- CSSクラスの自動追加

### 3. 対象ファイル
- HTML (.html, .htm)
- CSS (.css, .scss, .sass)
- Markdown (.md)
- Vue (.vue)
- React (.jsx, .tsx)
- テキスト (.txt)

## 検出パターン

### よくある問題例
- ❌ `シリコンバレー研[改行]修`
- ❌ `Google[改行]広告`
- ❌ `10[改行]万円`
- ❌ `AI[改行]技術`

### 修正後
- ✅ `<span class="no-break">シリコンバレー研修</span>`
- ✅ `<span class="no-break">Google広告</span>`
- ✅ `<span class="no-break">10万円</span>`
- ✅ `<span class="no-break">AI技術</span>`

## 使用方法

```bash
/kaigyo [ファイルパス] [オプション]
```

### オプション
- `--auto` - 確認なしで自動修正
- `--css-only` - CSSクラスのみ追加
- `--preview` - 修正内容をプレビューのみ
- `--recursive` - ディレクトリ内を再帰検索

### 例
```bash
/kaigyo index.html --auto
/kaigyo src/ --recursive --preview
/kaigyo style.css --css-only
```

## 自動追加されるCSS

```css
/* 改行制御クラス */
.no-break {
  white-space: nowrap !important;
}

.keep-words {
  word-break: keep-all;
  overflow-wrap: anywhere;
}

.jp-text {
  word-break: keep-all;
  overflow-wrap: anywhere;
  line-break: strict;
}
```

## 検出対象の単語カテゴリ

### 1. 技術・ビジネス用語
- シリコンバレー、AI技術、DX推進、IoT機器、など

### 2. 固有名詞・ブランド名
- Google、Apple、Microsoft、Amazon、など

### 3. 数値・単位
- 10万円、1000名、24時間、など

### 4. 専門用語
- マーケティング、エンジニア、デザイナー、など

## 実行フロー

1. **ファイル解析** - 対象ファイルの読み込み
2. **問題検出** - 改行問題のパターンマッチング
3. **修正案生成** - 適切な修正方法の提案
4. **確認・実行** - ユーザー確認後の自動修正
5. **CSS追加** - 必要なスタイルクラスの追加
6. **結果レポート** - 修正内容のサマリー表示

## 注意事項

- 既存のスタイルを破壊しないよう、`!important` は最小限に使用
- レスポンシブデザインに配慮した修正
- ユーザーの意図を尊重し、必要な場合のみ修正提案
- バックアップファイルの自動作成

## 連携機能

- `/lp-blue` スキルとの連携
- `/slide` スキルとの連携
- Vercelデプロイ前の自動実行
- Git hooks での自動実行

---

*美しい日本語タイポグラフィのためのスキル*