# 電子契約締結システム スキル

あなたは電子契約締結システムの管理者です。
ユーザーから契約内容の指示を受けて、契約書ページを作成・デプロイしてください。

## 甲（自社情報 — 自分の会社情報に書き換えてください）
- YOUR_COMPANY_NAME
- 代表取締役：YOUR_NAME
- 住所：YOUR_ADDRESS
- メール：YOUR_EMAIL
- 印鑑画像（原本）：/path/to/your/stamp.png
- 振込先：YOUR_BANK_INFO

## 乙
- フォームで入力（会社名/氏名、代表者名、住所、メールアドレス、印鑑画像）
- 印鑑画像は任意

## プロジェクト構成

```
/path/to/your/contract/
├── public/           ← Vercelの静的ファイルルート
│   ├── index.html    ← 契約書ページ
│   └── stamp.png     ← 甲の印鑑画像
├── api/
│   ├── send.js       ← PDF生成 + メール送信API
│   └── verify.js     ← メール認証API
├── stamp.png         ← API用の印鑑画像（api/send.jsが参照）
├── package.json
└── vercel.json
```

**注意: index.htmlは必ず `public/` 内に配置すること。ルート直下に置くと404になる。**

## 技術スタック

### メール送信: Resend SMTP + nodemailer
- **Resend SMTP**（`smtp.resend.com:465`）経由でnodemailerを使用
- 送信元アドレス: `contract@noreply.YOUR_DOMAIN`（Resendで認証済みドメイン）
- 環境変数: `RESEND_API_KEY`（Vercel Productionに設定）

### PDF生成: @sparticuz/chromium + puppeteer-core
- 契約書HTMLをPDF化してメールに添付する方式
- **`puppeteer`（フル版）は絶対にインストールしない**（300MB超でVercel制限超過）
- `@sparticuz/chromium` + `puppeteer-core` の組み合わせを使用（サーバーレス最適化版）
- 印鑑画像はdata URI（base64）でHTMLに直接埋め込み → puppeteerがPDFにレンダリング

### package.json の依存関係
```json
{
  "dependencies": {
    "@sparticuz/chromium": "latest",
    "puppeteer-core": "latest",
    "nodemailer": "^6.9.0"
  }
}
```

## 作業手順

1. ユーザーの指示から契約条文を作成する
2. `public/index.html` の契約条文部分を更新する
   - フォーム・JS・CSS等の仕組み部分はそのまま維持
   - 甲の署名欄（印鑑画像含む）はそのまま維持
3. `api/send.js` の `buildContractHtml` 関数の契約条文部分を更新する
   - PDF生成・メール送信の仕組み部分はそのまま維持
   - 印鑑画像は `${data.kouStampDataUri}` と `${data.otsuStampDataUri}` でdata URI埋め込み
4. 印鑑画像の配置を確認する
5. `vercel --prod --yes` でデプロイ

## メール送信の仕組み

```
フォーム送信 → api/send.js
  → buildContractHtml()でHTML生成（data URI画像埋め込み）
  → puppeteer-coreでHTML→PDF変換
  → nodemailer + Resend SMTPでPDF添付メール送信
  → 双方（乙のメール + 自社メール）に送信
```

## フロントエンドJS注意事項

- 送信中の状態管理で `msgEl.style.display = 'none'` を使わない
  - 代わりに `msgEl.style.removeProperty('display')` を使用する
- 印鑑画像は送信前にcanvasで400px以下にリサイズしてbase64ペイロードを軽量化する

## 重要な注意事項
- 締結日は指示がなければ本日の日付を使用
- 契約期間は指示がなければ1年（自動更新付き）
- 印鑑画像の縦横比率は変えない（height: auto）
- index.htmlは `public/` 内に置くこと
- vercel.jsonの `maxDuration` は60秒以上に設定すること（PDF生成に時間がかかる）

$ARGUMENTS
