# hackjpn セキュリティ診断スキル

Claude Code 用のカスタムスキル。クライアントのWebサイトURL・モバイルアプリ（APK/IPA/ストアURL）を渡すだけで、外部から確認可能な脆弱性診断 → Markdownレポート生成 → 提案スライド（Reveal.js / Vercelデプロイ）→ 営業メッセージ作成までを全自動で実行する。

## できること

### Web診断
- **外部診断**: SSL/TLS、セキュリティヘッダー、Cookie属性、CMSバージョン、EOLソフトウェア検出、機密ファイル漏洩チェック、CORS、SRI
- **認証後診断（オプション）**: ログイン情報を渡すと認証後のページ・APIを全探索。IDOR、API情報漏洩、ブルートフォース耐性、XSS/SQLi、オープンリダイレクト、S3公開設定まで検査

### モバイルアプリ診断（iOS / Android）
- **静的解析**: APK/IPA を展開して AndroidManifest・Info.plist・バイナリを解析
- **秘密情報漏洩**: ハードコードされたAPI Key・トークン・認証情報を検出
- **通信保護**: cleartextTraffic / ATS 設定、証明書ピンニングの有無
- **バイナリ保護**: PIE/ARC/Stack Canary、ProGuard難読化、get-task-allow
- **権限チェック**: 過剰な permission、exported activity、URL Scheme ハイジャック耐性
- **ストアメタデータ**: App Privacy ラベル、プライバシーポリシー、最終更新日
- **バックエンドAPI連携**: アプリから抽出したエンドポイントを Web 診断フローへ接続

### 共通
- **レポート生成**: 100点満点のスコアリング（A〜F）と重大度別の詳細レポートをMarkdownで出力
- **提案スライド**: hackjpnブランドのReveal.jsスライドを生成してVercelにデプロイ
- **営業メッセージ**: 経営者に刺さるトーンのコピペ用メッセージを生成

## インストール

```bash
git clone https://github.com/hackjpnteam/claude-skill-hackjpn.git ~/.claude/skills/hackjpn
```

Claude Code を再起動すると `/hackjpn` で起動できるようになる。

## 使い方

### 外部診断のみ
```
/hackjpn https://www.example.co.jp/
```

### 認証後診断（ログイン情報あり）
```
/hackjpn https://www.example.co.jp/
ID: user@example.com
PASS: password123
```

### モバイルアプリ診断
```
# APK/IPA ファイル指定
/hackjpn app
APK: /path/to/app.apk
IPA: /path/to/app.ipa

# ストアURL指定
/hackjpn app
Android: https://play.google.com/store/apps/details?id=com.example.app
iOS: https://apps.apple.com/jp/app/example/id123456789

# Web + アプリ同時診断
/hackjpn https://api.example.com/
APK: /path/to/app.apk
```

## 前提ツール

### Web診断
- `curl`, `openssl`（標準搭載）
- `gh`（GitHub CLI、スライドデプロイ不要ならなくてもOK）
- `/slide`, `/msg` スキル（提案書・営業メッセージ生成に使用）

### モバイル診断
- 必須（macOS標準搭載）: `unzip`, `strings`, `otool`, `plutil`, `codesign`, `file`
- 推奨（深い解析用・未導入時はスキルが自動で `brew install` を提案）: `apktool`, `jadx`

## 出力ファイル

### Web診断
| ファイル | 保存先 |
|---|---|
| 診断レポート | `~/Desktop/cyber/{domain}_security_report_{YYYYMMDD}.md` |
| 提案書 | `~/Desktop/cyber/{domain}_security_proposal.md` |
| nginx設定 | `~/Desktop/cyber/{domain}_nginx_security.conf` |
| WPセキュリティPHP | `~/Desktop/cyber/{domain}_wp_security.php` |
| Laravel改修例 | `~/Desktop/cyber/{domain}_laravel_security.md` |
| スライドHTML | Vercelにデプロイされた公開URL |

### モバイルアプリ診断
| ファイル | 保存先 |
|---|---|
| アプリ診断レポート | `~/Desktop/cyber/{app_name}_mobile_security_report_{YYYYMMDD}.md` |
| 抽出エンドポイント一覧 | `~/Desktop/cyber/{app_name}_endpoints.txt` |
| 漏洩秘密情報候補 | `~/Desktop/cyber/{app_name}_secrets_candidates.txt` |
| Android改修例 | `~/Desktop/cyber/{app_name}_android_security.md` |
| iOS改修例 | `~/Desktop/cyber/{app_name}_ios_security.md` |
| 提案スライド | Vercelにデプロイされた公開URL |

## 注意

- 診断は**外部から確認できる範囲**に限定。ポートスキャンや侵入テストは行わない
- 認証後診断でも**破壊的な操作は行わない**
- ブルートフォーステストは**テスト用の間違ったパスワード**のみ使用
- **必ず対象サイトの運営者から事前に診断許諾を得てから実行すること**

## ⚠️ 利用上の注意（必読）

**本スキルの実行後は、必ず戸村（tomura@hackjpn.com）まで結果をご連絡ください。**

クライアントにセキュリティの知識がないまま、診断レポートや提案スライドをそのまま渡すことは避けてください。技術用語の正しい解釈・リスクの温度感・優先度の判断には、セキュリティ知識を持つ担当者のレビューが必須です。無確認でクライアントへ送付すると、過剰な不安を煽る／逆に重要リスクを軽視させる、といった誤解を招く恐れがあります。

フロー: **診断 → 戸村にレビュー依頼 → レビュー後にクライアント送付**

## ライセンス

MIT

## 作者

[hackjpn, Inc.](https://hackjpn.com)
