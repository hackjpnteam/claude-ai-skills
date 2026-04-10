---
name: slide
description: >
  プロ仕様のReveal.jsスライドを自動生成。
  ユーザーが内容を伝えるだけで、統一されたブランドデザインのHTML営業資料を作成し、
  Vercelにデプロイする。「/slide」「スライド作成」「プレゼン作成」で起動。
---

# スライド生成スキル

## 重要: 文章の表示ルール
- **文章が途中で改行されることは絶対に禁止。** 1行に収まらない場合は文章を短くすること。
- **文章がスライドからはみ出すことは絶対に禁止。** overflow: hidden で見切れるのはNG。
- 長い文章は短く簡潔に書き直す。無理に1行に詰め込まず、情報を削って収める。

## 重要: 画像の縦横比
- **画像の縦横比（アスペクト比）は絶対に変えてはならない。**
- 必ず `object-fit: contain` を使用し、`max-width` と `max-height` で制約する。

## 概要
ユーザーから提供された内容（テキスト、URL、PDF等）をブランドデザインのReveal.jsプレゼンテーションに変換する。

## ワークフロー

1. **内容の取得**: ユーザーが提供するテキスト、URL、またはPDFからスライド内容を読み取る
2. **構成設計**: 内容を最適なスライド構成に整理（10-16枚程度）
3. **HTML生成**: デザインシステムに準拠したReveal.js HTMLファイルを生成
4. **保存先**: 新しい一時ディレクトリ `/tmp/slide-{filename}/` にHTMLファイルとして保存
5. **デプロイ**: `vercel --yes --prod` でデプロイ（新規Vercelプロジェクトとして作成される）
6. **URL共有**: Vercelが返すURLを返す

## 絶対禁止事項（デプロイ）

- **既存のVercelプロジェクトに上書きデプロイは絶対にしない**
- **`.vercel` フォルダが存在するディレクトリからデプロイしない**
- **毎回必ず新規ディレクトリ・新規Vercelプロジェクトとしてデプロイする**

## デザインシステム仕様

### Reveal.js 設定
```javascript
Reveal.initialize({
  hash: true,
  slideNumber: 'c/t',
  transition: 'fade',
  transitionSpeed: 'fast',
  width: 1280,
  height: 720,
  margin: 0.04,
  center: true,
  controls: true,
  progress: true,
});
```

### 必須CDN
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4.6.1/dist/reveal.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4.6.1/dist/theme/white.min.css">
<script src="https://cdn.jsdelivr.net/npm/reveal.js@4.6.1/dist/reveal.min.js"></script>
```

### フォント
```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700;900&display=swap');
```

### カラーパレット（CSS変数）
```css
:root {
  --black: #1a1a1a;
  --white: #ffffff;
  --gray-100: #f5f5f5;
  --gray-200: #e8e8e8;
  --gray-400: #999999;
  --gray-600: #666666;
  --gray-800: #333333;
  --accent-blue: #4285F4;
  --accent-green: #34A853;
  --accent-yellow: #F4B400;
  --accent-coral: #EA6B5D;
  --accent-purple: #9B72CB;
  --accent-orange: #F09937;
}
```

### スライド背景の交互パターン（必須ルール）
スライドは必ず以下の順序で背景を交互にする:
1. **dark** (タイトル)
2. **white** (通常)
3. **dark**
4. **white** or **soft** (グレー背景)
5. 以降交互に繰り返す

**絶対に同じ背景が2枚連続しないこと。**

### コンポーネント

| 内容タイプ | 使うコンポーネント |
|---|---|
| KPI・数値ハイライト | カードグリッド（grid-3, grid-4） |
| Before/After比較 | 2カラム比較レイアウト |
| 手順・ステップ | ステップ行（番号 + テキスト） |
| データ表 | テーブル |
| 箇条書き | リスト |
| 強調ボックス | ボーダーボックス or 塗りボックス |

### 6色の使い分け
- **Blue (#4285F4)**: メイン提案色、信頼、データ
- **Green (#34A853)**: ポジティブ結果、改善、成功
- **Yellow (#F4B400)**: 注目・強調、darkスライドのアクセント
- **Coral (#EA6B5D)**: 問題提起、課題、注意
- **Purple (#9B72CB)**: 運用・プロセス、差別化
- **Orange (#F09937)**: アクション、CTA、クリエイティブ

## デプロイ手順

1. `mkdir -p /tmp/slide-{filename}`
2. HTMLファイルを `/tmp/slide-{filename}/index.html` に保存
3. `cd /tmp/slide-{filename} && vercel --yes --prod`
4. Vercelが返すURLをユーザーに共有
