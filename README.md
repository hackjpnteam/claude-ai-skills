# 🚀 Claude AI Skills

Claude Code で **業務を自動化する 23 個のスキル**

```
/dev    → プロジェクト完成・デプロイ・納品書まで自動
/slide  → 営業スライド自動生成
/pdf    → PDF 自動変換
/qa     → コード品質監査
/ads    → 広告分析（Google・Meta・TikTok など）
```

---

## ⚡ 5 分で始める

```bash
# 1. インストール
cd ~/.claude/skills
git clone https://github.com/hackjpnteam/claude-ai-skills.git temp
cp -r temp/commands/* . && cp -r temp/skills/* . && rm -rf temp

# 2. 使う
/dev ユーザー管理 SaaS を作成
/slide 営業提案資料を生成
/qa
```

---

## 📌 何ができる？

### 🎯 開発 (5個)

| コマンド | 何をするか |
|---------|-----------|
| `/dev` | 新規プロジェクト完成 → GitHub → Vercel デプロイ → 納品書 |
| `/qa` | コード品質監査（自動修正あり） |
| `/spreadsheet` | データ分析シート自動作成 |
| `/toppa` | プロジェクト分析・自動最適化 |
| `/remember` | Git 履歴から開発内容を復元 |

### 📢 広告 (13個)

**監査**: `/ads`, `/ads-audit`, `/ads-budget`, `/ads-competitor`, `/ads-creative`, `/ads-landing`, `/ads-plan`

**プラットフォーム別**:
- `/ads-google` (Google Ads)
- `/ads-meta` (Facebook/Instagram)
- `/ads-linkedin` (LinkedIn)
- `/ads-microsoft` (Microsoft Ads)
- `/ads-tiktok` (TikTok)
- `/ads-youtube` (YouTube)

### 🎨 デザイン (3個)

| コマンド | 出力 |
|---------|------|
| `/slide` | Vercel デプロイ済みスライド |
| `/pdf` | 高画質 PDF |
| `/lp-blue` | プレミアム LP |

### 💼 その他 (2個)

| コマンド | 役割 |
|---------|------|
| `/kaigyo` | 日本語改行最適化 |
| `/hackjpn` | 環境管理 |

---

## 💡 こういう時に使う

### 1️⃣ 新規プロジェクト立ち上げ（1日で完成）

```
/dev 以下を実装：
- ユーザー認証
- ダッシュボード
- Stripe 連携
```

✅ Next.js + MongoDB で実装  
✅ GitHub Private リポジトリ作成  
✅ Vercel デプロイ  
✅ 納品書スライド生成  

**成果物**: 本番 URL + GitHub + 納品書

---

### 2️⃣ 広告キャンペーン監査

```
/ads-meta
/ads-google
/ads-plan
```

✅ Pixel・EMQ・入札戦略を監査  
✅ 改善案を自動生成  

---

### 3️⃣ 営業資料生成

```
/slide "2026年 Q2 営業提案"
```

✅ Reveal.js スライド  
✅ Vercel 自動デプロイ  
✅ ブラウザで即座にプレビュー  

---

## 🔧 技術スタック

`/dev` で自動採用:

- **フロント**: Next.js, React, TypeScript, Tailwind
- **バック**: Next.js API Routes, Zod (バリデーション)
- **DB**: MongoDB + Mongoose
- **認証**: JWT, bcryptjs
- **デプロイ**: GitHub + Vercel
- **セキュリティ**: XSS・CSRF対策、Rate Limiting など完全対応

---

## 📥 インストール

### ステップ 1: クローン

```bash
cd ~/.claude/skills
git clone https://github.com/hackjpnteam/claude-ai-skills.git temp
```

### ステップ 2: コピー

```bash
cp -r temp/commands/* .
cp -r temp/skills/* .
rm -rf temp
```

### ステップ 3: 確認

```bash
ls ~/.claude/skills | grep dev
# → dev が表示されたら OK
```

### ステップ 4: 使用開始

```bash
/dev [仕様]
```

詳細は [INSTALL.md](INSTALL.md) を参照

---

## ❓ よくある質問

**Q: `/dev` でデプロイに失敗した**  
A: `gh auth status` でログイン確認、`npm install -g vercel` で Vercel CLI をインストール

**Q: スキルが認識されない**  
A: `rm -rf ~/.claude/skills/*` でリセットして再インストール

**Q: `/ads` を使いたい**  
A: 対象プラットフォームの API キーを `.env.local` に設定してください

---

## 📄 ライセンス

**PROPRIETARY** — hackjpn 株式会社 AI 研修プログラム受講者専用

✅ 個人・チーム学習 OK  
❌ 複製・再配布・商用利用 NG

詳細は [LICENSE](LICENSE) を参照

---

## 🤝 サポート

- **Issue**: https://github.com/hackjpnteam/claude-ai-skills/issues
- **連絡先**: tomura@hackjpn.com

---

**最終更新**: 2026年6月25日 | **スキル数**: 23個 | **バージョン**: 2.0
