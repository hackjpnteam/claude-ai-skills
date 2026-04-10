---
name: pdf
description: >
  URLまたはローカルHTMLを高画質PDFに変換。Reveal.jsスライドは1枚ずつスクショ、
  通常Webページはフルページスクショでキャプチャし、3x解像度でPDF化する。
  「/pdf」「PDF化」「PDFにして」で起動。
---

# 高画質PDF変換スキル

## 重要ルール
- **絶対に `?print-pdf` モードを使わない**（デザインが崩れるため）
- **必ず `deviceScaleFactor: 3` でスクリーンショットを取る**（画質を荒くしないため）
- **画像の縦横比は絶対に変えない**
- Reveal.jsスライドは1枚ずつ `Reveal.slide(i)` でナビゲートしてスクショ
- 通常Webページは `page.emulateMedia({ media: 'screen' })` でPDF化

## 使い方
ユーザーがURLを指定 → 自動判定（Reveal.js or 通常ページ）→ PDF出力

## Reveal.jsスライドの場合

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 3,  // 必須: 3x解像度
  });

  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);

  const totalSlides = await page.evaluate(() => Reveal.getTotalSlides());

  const screenshots = [];
  for (let i = 0; i < totalSlides; i++) {
    await page.evaluate((idx) => Reveal.slide(idx), i);
    await page.waitForTimeout(800);
    const path = `/tmp/pdf_slide_${String(i).padStart(2, '0')}.png`;
    await page.screenshot({ path, type: 'png' });
    screenshots.push(path);
  }
  await browser.close();

  // スクショからPDF生成
  const browser2 = await chromium.launch({ headless: true });
  const pdfPage = await browser2.newPage();
  const fs = require('fs');

  const imgTags = screenshots.map(p => {
    const b64 = fs.readFileSync(p).toString('base64');
    return `<div class="page"><img src="data:image/png;base64,${b64}"></div>`;
  }).join('\n');

  const html = `<!DOCTYPE html><html><head><style>
    * { margin: 0; padding: 0; }
    @page { size: 1280px 720px; margin: 0; }
    .page { width: 1280px; height: 720px; page-break-after: always; overflow: hidden; }
    .page:last-child { page-break-after: avoid; }
    .page img { width: 1280px; height: 720px; display: block; }
  </style></head><body>${imgTags}</body></html>`;

  await pdfPage.setContent(html, { waitUntil: 'load' });
  await pdfPage.waitForTimeout(2000);
  await pdfPage.pdf({
    path: OUTPUT_PATH,
    width: '1280px',
    height: '720px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  await browser2.close();
})();
```

## 通常Webページの場合

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1024, height: 768 },
    deviceScaleFactor: 3,
  });

  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);

  await page.emulateMedia({ media: 'screen' });
  await page.pdf({
    path: OUTPUT_PATH,
    format: 'A4',
    printBackground: true,
    scale: 0.85,
    margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
  });
  await browser.close();
})();
```

## 自動判定ロジック
1. ページを開く
2. `page.evaluate(() => typeof Reveal !== 'undefined')` で判定
3. `true` → Reveal.jsフロー、`false` → 通常ページフロー

## 出力先
- デフォルト: `~/Desktop/{ファイル名}.pdf`
- ファイル名はURLやページタイトルから自動生成

## 前提
- Playwrightがインストール済み (`npm install playwright`)
- Chromiumブラウザがインストール済み (`npx playwright install chromium`)
