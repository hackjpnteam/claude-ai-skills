# 🚀 Claude AI Skills Collection

> hackjpn 株式会社 AI 研修プログラム用スキルコレクション
> 
> Claude Code で業務を自動化する **23個の実践的なスキル・コマンド**

---

## 📌 概要

Claude Code で使える実践的なスキル（カスタムコマンド）のコレクションです。  
**フルスタック開発**、**広告運用**、**営業資料作成** など、日常業務を AI で高速化・自動化します。

### ✨ 特徴

- ✅ **一気通貫実行** — 開発 → デプロイ → 納品書を自動化
- ✅ **広告専門** — 13個の広告プラットフォーム監査スキル
- ✅ **デザイン対応** — スライド・PDF・LP 自動生成
- ✅ **品質保証** — 5並列エージェントによる本番監査
- ✅ **日本語対応** — 日本語改行最適化、ビジネス文面生成

---

## 🎯 クイックスタート

### 1. インストール

```bash
cd ~/.claude/skills
git clone https://github.com/hackjpnteam/claude-ai-skills.git temp
cp -r temp/commands/* . && cp -r temp/skills/* . && rm -rf temp
```

### 2. 使用例

**例1: 新規プロジェクトを完成・デプロイまで自動実行**
```
/dev ユーザー管理 SaaS を作成してください：
- ユーザー認証（OAuth + 2FA）
- プロフィール管理
- ダッシュボード
```
→ GitHub プッシュ + Vercel デプロイ + 納品書生成まで自動完了

**例2: 営業スライドを自動生成**
```
/slide 2026年Q2営業提案資料を作成
```
→ Reveal.js スライド → Vercel デプロイ（自動）

**例3: 本番リリース前に品質監査**
```
/qa
```
→ 5つのエージェントが並列で監査・修正

---

## 📊 スキル一覧（全23個）

### 🎯 開発・デプロイ スキル（5個）

| スキル | 説明 | 使用例 |
|--------|------|--------|
| **`/dev`** | フルスタック開発 → GitHub → Vercel デプロイ → 納品書自動生成 | `/dev [仕様書]` |
| **`/qa`** | 5並列エージェントによる本番品質監査 | `/qa` |
| **`/spreadsheet`** | データ分析スプレッドシート自動作成 | `/spreadsheet [データソース]` |
| **`/toppa`** | 自走型プロジェクト分析・最適化 | `/toppa` |
| **`/remember`** | Git 履歴から開発内容を復元 | `/remember` |

### 📢 広告運用スキル（13個）

**統合・監査系**

| スキル | 説明 | 対象 |
|--------|------|------|
| **`/ads`** | 統合広告分析・最適化 | 複数プラットフォーム |
| **`/ads-audit`** | 広告監査スペシャリスト | 全般監査 |
| **`/ads-budget`** | 予算配分・入札戦略最適化 | 予算・ROI |
| **`/ads-competitor`** | 競合広告分析 | 競合調査 |
| **`/ads-creative`** | クリエイティブ品質・疲労度監査 | 広告素材 |
| **`/ads-landing`** | ランディングページ最適化 | LP 改善 |
| **`/ads-plan`** | キャンペーン企画自動生成 | 企画 |

**プラットフォーム専門**

| スキル | プラットフォーム | 監査項目 |
|--------|------------------|---------|
| **`/ads-google`** | Google Ads | QS・キーワード・Asset |
| **`/ads-meta`** | Facebook / Instagram | Pixel・EMQ・LPA |
| **`/ads-linkedin`** | LinkedIn Ads | B2B・ターゲティング |
| **`/ads-microsoft`** | Microsoft Ads | 構成・キーワード |
| **`/ads-tiktok`** | TikTok Ads | クリエイティブ・オーディエンス |
| **`/ads-youtube`** | YouTube Ads | 配置・フォーマット |

### 🎨 デザイン・コンテンツスキル（3個）

| スキル | 説明 | 出力 |
|--------|------|------|
| **`/slide`** | Reveal.js 営業スライド自動生成 | Vercel デプロイ済み HTML |
| **`/pdf`** | URL / HTML → 高画質 PDF 変換（3x解像度） | PDF ファイル |
| **`/lp-blue`** | ブルー基調プレミアム LP 生成 | イベント・フェス LP |

### 💼 ビジネス・その他スキル（2個）

| スキル | 説明 | 対象 |
|--------|------|------|
| **`/kaigyo`** | 日本語改行最適化 | 日本語テキスト |
| **`/hackjpn`** | HackJPN 作業セッション管理 | 開発環境 |

### 📋 コマンド（`/コマンド名` で起動）

| コマンド | 説明 | トリガー |
|---------|------|---------|
| **`/dev`** | ↑ スキル一覧参照 | スラッシュコマンド |
| **`/contract`** | クラウドサイン電子契約書作成・PDF生成・送信 | `/contract` |
| **`/ad`** | Meta/X/Shopify 広告分析・入稿 | `/ad` |
| **`/finance`** | 財務データ確認・分析・レポート生成 | `/finance` |
| **`/msg`** | クライアント向けビジネスメッセージ生成 | `/msg` |
| **`/long`** | 長文プロンプトの安全な入力支援 | `/long` |
| **`/test`** | QA テスト手順の自動生成 | `/test` |

---

## 💡 実戦例

### シナリオ 1: 新規 SaaS プロジェクト（1日で完成・デプロイ）

```bash
/dev マルチテナント SaaS を構築：
- ユーザー管理（RBAC）
- ワークスペース機能
- Stripe 請求統合
- ダッシュボード
```

**自動実行される処理**:
1. ✅ Next.js + MongoDB で実装
2. ✅ API エンドポイント実装 + バリデーション
3. ✅ セキュリティ対策（bcrypt, JWT, CORS, Rate Limiting）
4. ✅ GitHub Private リポジトリ作成
5. ✅ Vercel 本番デプロイ
6. ✅ Google Sheets 同期設定
7. ✅ 納品書スライド（Reveal.js）自動生成

**成果物**:
- 本番 URL
- GitHub リポジトリ
- 納品書（HTML スライド）
- スプレッドシート

---

### シナリオ 2: 広告キャンペーン監査・最適化

```bash
/ads-meta              # Meta 広告を監査（Pixel・EMQ・LPA）
/ads-google            # Google Ads 監査（QS・キーワード）
/ads-plan              # キャンペーン改善案を企画
```

**監査対象**: Pixel 健全性、EMQ スコア、創造性の疲労、オーディエンス、入札戦略、予算配分

---

### シナリオ 3: 営業資料の自動生成・デプロイ

```bash
/slide "AI 顧客分析プラットフォーム提案資料"
```

**出力**:
- Reveal.js プロフェッショナルスライド
- Vercel 自動デプロイ
- ブラウザで即座にプレビュー可能
- SNS シェアリンク生成

---

## 📦 プロジェクト構成

```
claude-ai-skills/
├── commands/              # 7 つのコマンド実装
│   ├── dev.md
│   ├── contract.md
│   ├── ad.md
│   ├── finance.md
│   ├── msg.md
│   ├── remember.md
│   ├── long.md
│   └── test.md
├── skills/                # 23 個のスキル実装
│   ├── dev/               # フルスタック開発
│   ├── ads*/              # 広告運用スキル群
│   ├── slide/             # スライド生成
│   ├── pdf/               # PDF 変換
│   ├── qa/                # 品質監査
│   ├── lp-blue/           # プレミアム LP
│   ├── spreadsheet/       # スプレッドシート
│   ├── toppa/             # 自走型最適化
│   └── ...
├── INSTALL.md             # インストール手順
├── LICENSE                # ライセンス（PROPRIETARY）
└── README.md              # このファイル
```

---

## 🔧 技術スタック

### `/dev` スキルで自動採用

- **フロントエンド**: Next.js (App Router), React, TypeScript, Tailwind CSS
- **バックエンド**: Next.js API Routes, Zod（バリデーション）
- **認証**: bcryptjs, JWT, NextAuth.js（必要に応じて）
- **データベース**: MongoDB + Mongoose
- **デプロイ**: GitHub (Private) + Vercel
- **その他**: Google Sheets API, Framer Motion

### セキュリティ標準

- ✅ 環境変数管理（`.env.local`）
- ✅ API バリデーション（Zod）
- ✅ XSS / CSRF / インジェクション対策
- ✅ レート制限（重要 API）
- ✅ パスワード bcrypt ハッシュ化（rounds: 12）
- ✅ HTTPS Cookie（Secure, HttpOnly, SameSite）

---

## 📥 インストール方法

### 前提条件

- Claude Code（ローカル CLI）がインストール済み
- Git がインストール済み
- GitHub CLI（`gh`）推奨

### ステップ 1: スキルをクローン

```bash
cd ~/.claude/skills
git clone https://github.com/hackjpnteam/claude-ai-skills.git temp
```

### ステップ 2: コマンド・スキルをコピー

```bash
cp -r temp/commands/* .
cp -r temp/skills/* .
rm -rf temp
```

### ステップ 3: 確認

```bash
ls ~/.claude/skills/ | grep -E "^(dev|ads|slide|qa|pdf)" | head -5
# 出力例: ad, ads, ads-audit, ads-budget, ads-competitor
```

### ステップ 4: 使用開始

```bash
# Claude Code で起動
/dev [仕様]
/slide [内容]
/qa
# ... その他のコマンド
```

詳細は [INSTALL.md](INSTALL.md) を参照してください。

---

## 🤝 サポート

### 質問・問題がある場合

- **GitHub Issues**: https://github.com/hackjpnteam/claude-ai-skills/issues
- **内部連絡先**: tomura@hackjpn.com

### トラブルシューティング

**Q: インストール後、コマンドが認識されない**
```bash
# スキルディレクトリをリセット
rm -rf ~/.claude/skills/*
git clone https://github.com/hackjpnteam/claude-ai-skills.git temp
cp -r temp/commands/* ~/.claude/skills/
cp -r temp/skills/* ~/.claude/skills/
```

**Q: `/dev` でデプロイに失敗**
- `gh` コマンドでログインを確認: `gh auth status`
- Vercel CLI をインストール: `npm install -g vercel`

**Q: 広告スキルが動かない**
- 対象プラットフォームの API キーを設定してください
- 各スキルの `SKILL.md` で必要な環境変数を確認

---

## 📄 ライセンス

**PROPRIETARY** — hackjpn 株式会社 AI 研修プログラム受講者専用

- ✅ **許可**: 個人・チームでの研修・学習目的での使用
- ❌ **禁止**: 複製、再配布、派生物の作成、商用利用

詳細は [LICENSE](LICENSE) を参照してください。

---

## 📊 使用統計

| カテゴリ | スキル数 | 主な用途 |
|---------|---------|--------|
| 開発・デプロイ | 5 個 | 新規プロジェクト、品質監査 |
| 広告運用 | 13 個 | キャンペーン管理、監査、最適化 |
| デザイン・コンテンツ | 3 個 | 営業資料、PDF、LP |
| その他 | 2 個 | テキスト最適化、環境管理 |
| **合計** | **23 個** | 業務全般の自動化 |

---

**最終更新**: 2026年6月25日  
**バージョン**: 2.0（全スキル実装版）

👉 [インストール手順を見る](INSTALL.md) | [ライセンスを確認](LICENSE)
