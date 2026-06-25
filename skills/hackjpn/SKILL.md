---
name: hackjpn
description: >
  Webサイト／モバイルアプリ（iOS/Android）のセキュリティ診断 → 課題発見 → 提案書スライド自動生成 → 営業メッセージ作成。
  URL・APK/IPAファイル・ストアURLのいずれかを受け取り、外部から確認可能なセキュリティリスクを網羅的に診断し、
  hackjpnブランドの提案スライドと営業メッセージまで一気通貫で生成する。
  「/hackjpn」「セキュリティ診断」「サイト診断」「脆弱性チェック」「アプリ診断」で起動。
---

# hackjpn セキュリティ診断 → 提案 オールインワンスキル

## ⚠️ 利用上の注意（必読）

**本スキルの実行後は、必ず戸村（tomura@hackjpn.com）まで結果をご連絡ください。**

クライアントにセキュリティの知識がないまま、診断レポートや提案スライドをそのまま渡すことは避けてください。
技術用語の正しい解釈・リスクの温度感・優先度の判断には、セキュリティ知識を持つ担当者のレビューが必須です。
無確認でクライアントへ送付すると、過剰な不安を煽る／逆に重要リスクを軽視させる、といった誤解を招く恐れがあります。

**フロー:**
1. 本スキルで診断 → レポート・スライド・営業メッセージを生成
2. **戸村に結果を共有 → 内容レビューを受ける**
3. レビュー後、クライアントへ送付・提案

## 概要

クライアントのWebサイトURLを1つ受け取るだけで、以下を全自動で実行する:

1. **セキュリティ診断** — 外部から確認可能な脆弱性を網羅チェック
2. **認証後診断（オプション）** — ログイン情報提供時、認証後の全ページ・APIを探索
3. **診断レポート** — Markdown形式の詳細レポートを生成（重大度分類付き）
4. **提案スライド** — `/slide` スキルを使ってhackjpnブランドのReveal.js提案書を生成・デプロイ
5. **営業メッセージ** — `/msg` スキルを使ってクライアントに送れるコピペ用メッセージを生成

## 実行モード

### モード1: 外部診断のみ（デフォルト）
```
/hackjpn https://www.example.co.jp/
```
ログイン不要。外部から確認可能な範囲で診断。

### モード2: 認証後診断（ログイン情報あり）
```
/hackjpn https://www.example.co.jp/
ID: user@example.com
PASS: password123
```
ログインして認証後のページ・APIも全探索。IDOR・認可チェックも実施。

### モード3: 既存クライアント（メモリ参照）
```
/hackjpn https://www.example.co.jp/
```
メモリにログイン情報がある場合は自動参照して認証後診断も実施。

### モード4: モバイルアプリ診断（iOS / Android）
以下のいずれかの入力で起動:

```
# APKファイル直接指定
/hackjpn app
APK: /path/to/app.apk

# IPAファイル直接指定
/hackjpn app
IPA: /path/to/app.ipa

# ストアURL指定（両OS同時診断も可）
/hackjpn app
Android: https://play.google.com/store/apps/details?id=jp.pokemon.pokemonsleep
iOS: https://apps.apple.com/jp/app/pokemon-sleep/id1489007383

# Webとアプリの同時診断（バックエンドAPIも包括的に）
/hackjpn https://api.example.com/
APK: /path/to/app.apk
```

---

## ワークフロー

### Step 1: 情報収集（並列実行）

以下を**すべて並列**で実行（15項目）:

```
1.  WebFetch でトップページのHTML全体を取得（技術情報・リンク・JS・メタ情報抽出）
2.  curl -sI でHTTPレスポンスヘッダー取得（トップページ）
3.  curl -sI でログインページのHTTPレスポンスヘッダー取得
4.  robots.txt 取得
5.  sitemap.xml 取得
6.  openssl で SSL/TLS 証明書情報取得
7.  openssl で TLS プロトコルバージョン確認（1.0/1.1/1.2/1.3）
8.  HTTP（非SSL）→ HTTPS リダイレクト確認
9.  dig で DNS レコード一括取得（A/AAAA/MX/NS/TXT/CAA/SOA）
10. dig _dmarc / _mta-sts / _smtp._tls / default._bimi の TXT レコード
11. dig DKIM 複数セレクタ（google/default/selector1/selector2/amazonses/mailgun 等）
12. dig +dnssec で DNSSEC 確認（RRSIG / ad flag）
13. HSTS preload list 登録状態（hstspreload.org API）
14. Certificate Transparency ログからサブドメイン列挙（crt.sh）
15. Wayback Machine で過去の露出確認（archive.org CDX API）
```

### Step 2: フレームワーク・技術スタック検出

HTMLソース・レスポンスヘッダーから以下を自動検出:

| 検出対象 | 検出方法 |
|---|---|
| **Laravel** | XSRF-TOKEN Cookie、`_token` hiddenフィールド、セッションCookie名 |
| **WordPress** | `/wp-json/`, generator タグ, `/feed/`, `readme.html` |
| **Django** | `csrfmiddlewaretoken`, `csrftoken` Cookie |
| **Rails** | `X-Request-Id`, `_rails_session` Cookie |
| **Next.js** | `__NEXT_DATA__`, `/_next/` パス |
| **PHP** | `X-Powered-By: PHP/x.x.x` ヘッダー |
| **Apache** | `Server: Apache/x.x.x` ヘッダー |
| **nginx** | `Server: nginx/x.x.x` ヘッダー |
| **AWS** | ALBヘッダー、S3 URL、CloudFront |
| **管理テンプレート** | AdminLTE、Bootstrap Admin等のCSS/JS |
| **トラッキング** | GTM ID、Meta Pixel ID、Google Ads ID |

**EOL（サポート終了）判定**: 検出されたソフトウェアのバージョンがEOLかどうかを判定。EOLの場合は**致命的**として報告。

主要EOL日付（2026年時点）:

| ソフトウェア | EOL 日付 | ステータス |
|---|---|---|
| PHP 7.4 | 2022年11月28日 | EOL済 |
| PHP 8.0 | 2023年11月26日 | EOL済 |
| PHP 8.1 | 2025年12月31日 | EOL済 |
| PHP 8.2 | 2026年12月31日 | 期限迫る |
| PHP 8.3 | 2027年11月23日 | 推奨 |
| PHP 8.4 | 2028年12月31日 | 最新・推奨 |
| Python 3.8 | 2024年10月 | EOL済 |
| Python 3.9 | 2025年10月 | EOL済 |
| Node.js 16 | 2023年9月 | EOL済 |
| Node.js 18 | 2025年4月30日 | EOL済 |
| Node.js 20 | 2026年4月30日 | 期限迫る（LTS） |
| Node.js 22 | 2027年4月30日 | 推奨（LTS） |
| Apache HTTP 2.4.x | サポート中 | バージョン別CVE確認 |
| nginx 1.24 | メインライン | 最新推奨 |
| Ubuntu 18.04 | 2023年5月 | EOL済 |
| Ubuntu 20.04 | 2025年4月 | EOL済 |
| Ubuntu 22.04 | 2027年4月 | LTS中 |
| CentOS 7 | 2024年6月30日 | EOL済 |
| Debian 10 | 2024年6月30日 | EOL済 |
| WordPress | メジャー毎に確認 | 6.x系推奨 |
| jQuery 1.x / 2.x | サポート終了 | 3.7以降推奨 |
| AngularJS (1.x) | 2022年1月 | EOL済 |
| Moment.js | メンテナンスモード | Day.js/date-fns 推奨 |
| Bootstrap 3 | 2019年 | EOL済 |
| Bootstrap 4 | 2023年1月 | EOL済 |

**外部クラウドサービスの計測停止（経営インパクト有）**:
- Google Analytics Universal Analytics (UA-XXXXXXX): 2023年7月1日計測停止 / 2024年7月1日データ削除
- Adobe Flash: 2020年12月31日 EOL済
- Internet Explorer: 2022年6月15日 サポート終了

---

## 【全42診断項目の一覧】拡張版

本スキルでは以下42項目を網羅的にチェックする（2026年版）。従来の項目 (基本18) + 拡張追加項目 (24)。

### A. 基本診断（18項目）
1. SSL/TLS 証明書情報・TLSバージョン
2. セキュリティヘッダー6種（HSTS/CSP/X-Frame/X-Content-Type/Referrer/Permissions）
3. Cookie セキュリティ属性（HttpOnly/Secure/SameSite）
4. CMS 検出 + バージョン確認
5. 機密ファイル・パス漏洩（.env/.git/wp-config等）
6. リダイレクトチェーン
7. CORS 基本設定
8. Subresource Integrity (SRI)
9. WordPress 固有（該当時）: REST API列挙、XML-RPC、wp-login等
10. エラーハンドリング情報漏洩（404/500）
11. サーバー情報開示（Server/X-Powered-By）
12. HTTPからHTTPSリダイレクト
13. TRACE メソッド拒否
14. ディレクトリリスティング
15. クリックジャッキング防御
16. XSS反射（クエリパラメータ）
17. SQLi探索
18. オープンリダイレクト（基本）

### B. 拡張診断（24項目・2026年追加）
19. **DMARC ポリシー**（p=none は致命的）
20. **SPF レコード存在・妥当性**（主要ドメインに必須）
21. **DKIM 複数セレクタ**（Google/AWS SES/Mailgun 対応）
22. **MTA-STS**（SMTP TLS 強制）
23. **TLS-RPT**（TLS失敗検知）
24. **BIMI**（受信トレイのブランド認証）
25. **DNSSEC**（DNS経路改ざん検知）
26. **CAA レコード**（CA証明書発行制限）
27. **HTTP メソッド制御**（DELETE/PUT/PATCH/CONNECT）
28. **HTTP メソッド override 攻撃**（X-HTTP-Method-Override）
29. **Cache-Control**（フォーム・認証ページ）
30. **HSTS preload list 登録状態**
31. **Certificate Transparency サブドメイン列挙**
32. **サブドメインテイクオーバー脆弱性**
33. **WAF 検出 + OWASP ルール有無**
34. **JS ライブラリバージョン・既知CVE**
35. **ソースマップ漏洩**
36. **Open Redirect 深掘り（多パラメータ・エンコード回避）**
37. **インライン秘密情報・APIキー漏洩**（HTML/JS内のAIza/sk_live/Bearer等）
38. **Mixed Content + 第三者スクリプトSRI不整備**
39. **CORS Origin 反射 + credentials 組み合わせ**
40. **TLS 暗号スイート詳細評価 + OCSP stapling**
41. **HTTP/2 + HTTP/3 対応 / IPv6 対応**
42. **Wayback Machine 過去露出 / .well-known 情報漏洩 / CRLF**

### Step 3: セキュリティ診断（並列実行）

#### 3-1. SSL/TLS チェック
```bash
# 証明書情報
echo | openssl s_client -connect {domain}:443 -servername {domain} 2>/dev/null | openssl x509 -noout -dates -subject -issuer

# TLSバージョン・暗号スイート
echo | openssl s_client -connect {domain}:443 -servername {domain} 2>&1 | grep -E "Protocol|Cipher|TLS"
```

#### 3-2. セキュリティヘッダーチェック（6項目 + 追加）
以下のヘッダーの有無を確認:
- `Strict-Transport-Security (HSTS)` — HTTPS強制
- `Content-Security-Policy (CSP)` — XSS防止
- `X-Content-Type-Options` — MIMEスニッフィング防止
- `X-Frame-Options` — クリックジャッキング防止
- `Referrer-Policy` — リファラー情報漏洩防止
- `Permissions-Policy` — ブラウザ機能制限

追加チェック:
- `X-Powered-By` — **存在すべきでない**（技術情報漏洩）
- `Server` — バージョン情報の詳細度を評価
- `X-XSS-Protection` — レガシーだが存在確認

#### 3-3. Cookie セキュリティ（詳細分析）
```
各Cookieに対して以下を確認:
- HttpOnly フラグ — セッションCookieに必須
- Secure フラグ — HTTPS専用通信の保証
- SameSite 属性 — CSRF防止（Lax or Strict）
- Domain スコープ — 過度に広範でないか
- Max-Age/Expires — セッション有効期限の適切性
- Cookie名からフレームワーク推定
```

#### 3-4. CMS 検出・バージョンチェック
- WordPress: `/wp-json/`, generator タグ, `/feed/`, `readme.html`
- その他CMS: ソースコードのパターンマッチング

#### 3-5. WordPress 固有チェック（WPの場合）
```
- REST API ユーザー列挙: /wp-json/wp/v2/users
- Author enumeration: /?author=1,2,3,4,5
- XML-RPC: /xmlrpc.php（メソッド列挙）
- ログインページ: /wp-login.php（アクセス可否、レート制限）
- 管理画面: /wp-admin/
- readme.html, license.txt
- wp-cron.php
- debug.log
- uploads ディレクトリリスティング
- プラグイン検出（ソースコードから抽出）
```

#### 3-6. 機密ファイル・パス漏洩チェック（並列で全チェック）
```bash
# 各パスに対して HTTP ステータスコードを取得
for path in \
  ".env" ".git/config" ".git/HEAD" \
  "wp-config.php.bak" "config.php.bak" \
  "storage/" "vendor/" \
  "admin" "phpmyadmin" "adminer" \
  "telescope" "horizon" "nova" \
  "debug" "server-status" "server-info" \
  ".well-known/security.txt" \
  "api" "graphql" \
  "backup.sql" "dump.sql" "database.sql"; do
  curl -s -o /dev/null -w "%{http_code}" "https://{domain}/${path}"
done
```

#### 3-7. リダイレクトチェック
```
- HTTP → HTTPS リダイレクト（ALB or Webサーバーレベル）
- non-www → www（または逆）リダイレクト
- 内部リダイレクトがHTTPにフォールバックしないか確認
```

#### 3-8. CORS 設定チェック
```bash
curl -sI -H "Origin: https://evil.example.com" https://{domain}/ | grep -iE 'access-control|origin|cors'
```

#### 3-9. Subresource Integrity (SRI) チェック
```bash
# 外部スクリプトに integrity 属性があるか確認
curl -s https://{domain}/ | grep -c 'integrity='
```

#### 3-10. 【拡張】メール認証系 DNS レコード診断（必須9項目）

上場企業・金融・不動産・医療など「信頼性が商品の一部」となる業種では、メール認証系の欠落は**致命的として扱う**。

```bash
DOMAIN={domain}

# DMARC
dig +short TXT _dmarc.$DOMAIN
# 判定: レコードなし → 致命的、p=none → 致命的、p=quarantine → 中、p=reject → 良好

# SPF
dig +short TXT $DOMAIN | grep -i "v=spf1"
# 判定: なし → 致命的、?all/+all → 高、~all → 中、-all → 良好

# DKIM（複数セレクタを試行）
for sel in google default mail selector1 selector2 k1 s1 s2 amazonses mailgun sendgrid postmark; do
  R=$(dig +short TXT ${sel}._domainkey.$DOMAIN | head -1)
  [ -n "$R" ] && echo "${sel}: OK"
done
# 判定: 0件 → 致命的、1件 → 中（ESP分岐がある場合）、2件以上 → 良好

# MTA-STS
dig +short TXT _mta-sts.$DOMAIN
curl -s --max-time 5 https://mta-sts.$DOMAIN/.well-known/mta-sts.txt
# 判定: なし → 中（SMTPダウングレード攻撃可能）

# TLS-RPT
dig +short TXT _smtp._tls.$DOMAIN
# 判定: なし → 中（TLS失敗を検知不可）

# BIMI
dig +short TXT default._bimi.$DOMAIN
# 判定: なし → 低（受信トレイでロゴ表示不可、なりすまし判別困難）

# DNSSEC
dig +dnssec $DOMAIN | grep -E "RRSIG|ad"
# 判定: RRSIGなし・adフラグなし → 高（DNSキャッシュポイズニング対策不可）

# CAA
dig +short CAA $DOMAIN
# 判定: なし → 高（任意CAから不正証明書発行可能）

# DNS ゾーン委譲
dig +short NS $DOMAIN
# AWS Route53 / Cloudflare / 内製DNSサーバー等の特定
```

#### 3-11. 【拡張】HTTP メソッド制御診断（全サイト）

**2024年以降、Apache / nginx / ALB でのメソッド制限は業界標準化**。DELETE/PUT/PATCH が 200 応答を返すサイトは認可バイパス経路の温床。

```bash
for method in OPTIONS TRACE DELETE PUT PATCH CONNECT PROPFIND MKCOL LOCK; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X $method "https://{domain}/" --max-time 5)
  echo "${method}: ${CODE}"
done

# 判定基準:
# - GET/POST/HEAD 以外が 200 → 致命的（特に DELETE/PUT/PATCH）
# - OPTIONS が全ヘッダー露出 → 中（情報ディスクロージャー）
# - TRACE が 200 → 高（Cross-Site Tracing 攻撃）
# - PROPFIND/MKCOL/LOCK が 200 → WebDAV 有効（設定ミスの可能性）
```

HTTP メソッド override 攻撃の確認:
```bash
# X-HTTP-Method-Override ヘッダー
curl -s -X POST -H "X-HTTP-Method-Override: DELETE" "https://{domain}/path" -o /dev/null -w "%{http_code}"

# _method POST パラメータ（Laravel / Rails）
curl -s -X POST -d "_method=DELETE" "https://{domain}/path" -o /dev/null -w "%{http_code}"
```

#### 3-12. 【拡張】Cache-Control / 情報漏洩防止診断

機密情報を扱うページ（ログイン、フォーム、マイページ）で Cache-Control が未設定だと、中間プロキシ・共有PCキャッシュ経由で情報漏洩のリスク。

```bash
# 以下のページ種別で no-store / no-cache を確認
for path in /login /mypage /member /forms/freeAssessment/input /user/profile /account; do
  curl -sI "https://{domain}${path}" | grep -iE "cache-control|pragma|expires"
done

# 判定: フォーム・認証系で no-store/no-cache/private なし → 中
```

#### 3-13. 【拡張】HSTS preload list 登録状態の確認

```bash
curl -s "https://hstspreload.org/api/v2/status?domain={domain}"
# status: "preloaded" → 良好、"pending" → 中、"unknown" → 中
```

#### 3-14. 【拡張】サブドメイン列挙（Certificate Transparency ログ）

```bash
# crt.sh から既発行の証明書ログを取得して隠れサブドメインを発見
curl -s "https://crt.sh/?q=%25.{domain}&output=json" --max-time 30 | \
  python3 -c "import json,sys; [print(n.strip().lower()) for c in json.load(sys.stdin) for n in c.get('name_value','').split() if '{domain}' in n.lower()]" | \
  sort -u

# DNS ブルートフォース（補助的に）
for sub in www mail api dev staging test admin portal member my account login secure vpn blog shop m mobile system crm erp salesforce hr; do
  IP=$(dig +short ${sub}.{domain} | head -1)
  [ -n "$IP" ] && echo "${sub}.{domain} → ${IP}"
done
```

#### 3-15. 【拡張】サブドメインテイクオーバー脆弱性スキャン

CNAME が外部サービス（Heroku、AWS S3、GitHub Pages等）を指しているのに該当サービスで未登録のサブドメインは乗っ取り可能:

```bash
for sub in $(cat subdomains.txt); do
  CNAME=$(dig +short CNAME ${sub})
  CODE=$(curl -s -o /dev/null -w "%{http_code}" https://${sub}/ --max-time 5)
  # パターン判定:
  # - CNAME が s3.amazonaws.com かつ 404 NoSuchBucket → テイクオーバー可能
  # - CNAME が github.io かつ "There isn't a GitHub Pages site here" → テイクオーバー可能
  # - CNAME が herokuapp.com かつ 404 "No such app" → テイクオーバー可能
  # - CNAME が azurewebsites.net かつ 404 → 要確認
done
```

#### 3-16. 【拡張】WAF / 上流防御層の検出

```bash
# レスポンスヘッダー・Cookie・エラーページから WAF 指紋を検出
curl -sI "https://{domain}/" | grep -iE "cf-ray|x-sucuri|x-amzn-waf|x-aws-waf|x-akamai|x-incapsula|x-sitelock"

# WAF があれば XSS/SQLi ペイロードで 403/406 が返る
for payload in "?test=<script>alert(1)</script>" "?id=1 OR 1=1" "?path=../../../etc/passwd"; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://{domain}/${payload}")
  echo "${payload}: ${CODE}"
done

# 判定: WAF 層なし（ALB/Apache 直接露出）→ 低〜中（OWASP ルール欠如）
```

#### 3-17. 【拡張】JavaScript ライブラリのバージョン・CVE 確認

```bash
# HTMLソースから JS ライブラリの利用を抽出
curl -s "https://{domain}/" > /tmp/page.html
grep -oE '(jquery|bootstrap|react|vue|angular|slick|swiper|lodash|moment)[^"]*\.js' /tmp/page.html | sort -u

# 主要 EOL ライブラリ・既知脆弱性バージョン:
# - jQuery < 3.5.0 (XSS in jQuery.htmlPrefilter)
# - Bootstrap < 4.3.1 (XSS in data-target)
# - AngularJS (1.x は 2022年1月 EOL)
# - Moment.js（メンテナンスモード、代替: Day.js / date-fns）
# - Lodash < 4.17.21 (Prototype pollution)

# npm audit 相当を手動で確認
```

#### 3-18. 【拡張】ソースマップ・内部ファイル露出

```bash
for path in /assets/main.js.map /static/js/main.js.map /app.js.map /vendor.js.map /runtime.js.map /common/v2/js/run.js.map; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://{domain}${path}")
  echo "${CODE}  ${path}"
done
# 判定: 200 → 高（ソースコード完全復元可能、API パス・ビジネスロジック露出）
```

#### 3-19. 【拡張】Open Redirect 深掘りテスト

```bash
for param in redirect redirect_to return return_url returnTo next url callback continue goto; do
  for target in "https://evil.example.com" "//evil.example.com" "/\/evil.example.com" "javascript:alert(1)"; do
    RESP=$(curl -sI "https://{domain}/?${param}=${target}" | grep -i "^location:")
    [ -n "$RESP" ] && echo "${param}=${target} → ${RESP}"
  done
done

# 判定: Location ヘッダーが外部ドメインを示す → 高（フィッシング・認可コード窃取経路）
```

#### 3-20. 【拡張】インライン秘密情報・機密データ検出

```bash
# HTMLソース内の秘匿情報漏洩
curl -s "https://{domain}/" -o /tmp/page.html
grep -oE "(api[_-]?key|access[_-]?key|secret|token|AIza[A-Za-z0-9_-]{35}|sk_(live|test)_[A-Za-z0-9]+|Bearer [A-Za-z0-9+/=]+|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)" /tmp/page.html

# JSファイル内の秘密情報（主要なJSをダウンロードして検査）
for js in $(grep -oE 'src="[^"]+\.js"' /tmp/page.html | sed 's/src="//' | sed 's/"//'); do
  curl -s "https://{domain}${js}" | grep -oE "(api_key|apikey|secret|AIza[A-Za-z0-9_-]+|sk_(live|test)_[A-Za-z0-9]+)" | head -5
done

# 判定: AWS/Stripe/Firebase/Google Maps等のキー検出 → 致命的
```

#### 3-21. 【拡張】Mixed Content / 第三者スクリプト整合性

```bash
# HTTP（非SSL）リソースの読み込み
curl -s "https://{domain}/" | grep -oE '(src|href)="http://[^"]+"' | head -10
# 判定: 1件でも存在 → 中（ブラウザ警告、MITM可能）

# 第三者ドメインのスクリプト（SRI なし）
curl -s "https://{domain}/" | grep -oE '<script[^>]+src="https://(?!'"${domain}"')[^"]+"[^>]*>' | grep -v "integrity="
# 判定: 1件以上 → 中（第三者CDN侵害時に任意コード実行）
```

#### 3-22. 【拡張】CORS Origin 反射型脆弱性テスト

```bash
# 任意の Origin を反射するか確認（credentials対応確認）
for origin in "https://evil.example.com" "null" "https://attacker.{domain}"; do
  curl -sI -H "Origin: ${origin}" "https://{domain}/api/" | grep -iE "access-control-allow-(origin|credentials)"
done
# 判定:
# - Origin を反射 + Allow-Credentials: true → 致命的（セッション情報の越境窃取可能）
# - * のみ → 中（認証情報は漏洩しないが読み取り可能）
# - null 許可 → 高（sandboxed iframe 等から攻撃可能）
```

#### 3-23. 【拡張】TLS 暗号スイート評価

```bash
# TLS 1.3 対応確認
echo | openssl s_client -connect {domain}:443 -tls1_3 2>&1 | grep "Protocol"

# TLS 1.0/1.1 拒否確認（拒否されていれば良好）
echo | openssl s_client -connect {domain}:443 -tls1 2>&1 | grep -E "handshake failure|Protocol"
echo | openssl s_client -connect {domain}:443 -tls1_1 2>&1 | grep -E "handshake failure|Protocol"

# 弱い暗号スイートの検査（存在すれば中〜高）
nmap --script ssl-enum-ciphers -p 443 {domain} 2>/dev/null | grep -E "NULL|RC4|DES|EXPORT|MD5|CBC"

# OCSP stapling
echo | openssl s_client -connect {domain}:443 -status 2>&1 | grep -A 3 "OCSP Response Status"
```

#### 3-24. 【拡張】HTTP/2 / HTTP/3 対応

```bash
# HTTP/2 対応
curl -sI --http2 "https://{domain}/" | head -1
# 出力: HTTP/2 200 → 対応済

# HTTP/3 (QUIC) 対応
curl -sI --http3 "https://{domain}/" 2>/dev/null | head -1 || echo "HTTP/3 未対応"
# または Alt-Svc ヘッダー確認
curl -sI "https://{domain}/" | grep -i "alt-svc"
```

#### 3-25. 【拡張】IPv6 対応

```bash
dig +short AAAA {domain}
# 判定: 未対応 → 低（将来的にモバイル・IoT 接続性影響）
```

#### 3-26. 【拡張】robots.txt / sitemap.xml / feed からの情報漏洩

```bash
# robots.txt に管理パス・ステージングパス等の情報漏洩がないか
curl -s "https://{domain}/robots.txt" | grep -iE "admin|staging|dev|test|backup|internal|.git"

# sitemap.xml に機密URLが露出していないか
curl -s "https://{domain}/sitemap.xml" | grep -oE "<loc>[^<]+</loc>" | grep -iE "admin|staging|internal|test"

# WordPress feed
curl -sI "https://{domain}/feed/" | head -5

# .well-known 配下の情報
for path in security.txt humans.txt apple-app-site-association assetlinks.json openid-configuration; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://{domain}/.well-known/${path}")
  echo "${CODE}  /.well-known/${path}"
done
```

#### 3-27. 【拡張】HTTP Response Splitting / CRLF インジェクション検査

```bash
# User-Agent や Referer 経由で CRLF を反射するかテスト
curl -sI -H "User-Agent: test%0D%0AInjected-Header: evil" "https://{domain}/"
curl -sI -H "Referer: https://{domain}/%0D%0AInjected-Header: evil" "https://{domain}/"
```

#### 3-28. 【拡張】アプリケーション指紋の多角確認

```bash
# .php / .aspx / .jsp / .do / .action / .cfm で拡張子別ステータス確認
for ext in php aspx jsp do action cfm py rb; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://{domain}/index.${ext}")
  echo "${CODE}  /index.${ext}"
done

# favicon.ico のハッシュで既知CMSを特定（mmh3）
curl -s "https://{domain}/favicon.ico" | md5sum

# Cookie 命名規則から推定
# - PHPSESSID, Laravel セッション, _session_id（Rails）, sessionid（Django）, JSESSIONID, ASP.NET_SessionId
```

#### 3-29. 【拡張】Clickjacking / UI Redress 深掘り

```bash
# X-Frame-Options / CSP frame-ancestors の網羅性
curl -sI "https://{domain}/" | grep -iE "x-frame-options|content-security-policy" | grep -i "frame-ancestors"

# 主要ページ（ログイン、決済、フォーム）で個別確認
for path in /login /form /payment /transfer /settings; do
  HDR=$(curl -sI "https://{domain}${path}" | grep -iE "x-frame-options|frame-ancestors")
  echo "${path}: ${HDR}"
done
```

#### 3-30. 【拡張】Wayback Machine / 過去露出確認

```bash
# Wayback Machine API で過去のスナップショット検索
curl -s "https://web.archive.org/cdx/search/cdx?url={domain}/*&output=json&limit=100&filter=statuscode:200" | \
  python3 -c "import json,sys; data=json.load(sys.stdin); [print(r[2]) for r in data[1:] if '.env' in r[2] or 'backup' in r[2] or '.sql' in r[2] or '.git' in r[2]]"

# 過去に一瞬でも露出した機密ファイルは現在も攻撃者の手元にある可能性が高い
```

### Step 4: 認証後診断（ログイン情報がある場合のみ）

#### 4-1. ログイン
```bash
# CSRFトークン取得
curl -s -c /tmp/{domain}_cookies.txt https://{domain}/auth/login | grep '_token'

# ログイン実行
curl -s -b /tmp/{domain}_cookies.txt -c /tmp/{domain}_cookies.txt \
  -X POST https://{domain}/auth/login \
  -d "_token={token}&email={email}&password={password}" \
  -D /tmp/{domain}_login_headers.txt \
  -w "%{http_code} %{redirect_url}"
```

#### 4-2. 認証後ページの全探索
ログイン後のトップページから:
1. **全内部リンクを抽出**（href属性）
2. **全AJAXエンドポイントを抽出**（$.ajax, fetch, XMLHttpRequest のURL）
3. **全フォームアクションを抽出**（form action属性）
4. **外部リソースURLを抽出**（S3, CDN等のURL）

各ページを並列で取得し、さらにサブリンク・サブAPIを再帰的に発見。

#### 4-3. IDOR（安全でない直接オブジェクト参照）テスト
```
検出パターン:
1. URLに連番ID → /item/detail/1, /item/detail/2 ...
2. クエリパラメータにID → ?company_cd=12345, ?user_id=1
3. APIリクエストボディにID → {"destination_no": 1}

テスト方法:
- 自分のIDでのレスポンスと、別のIDでのレスポンスを比較
- 200が返る場合: レスポンスボディの内容が異なるか確認
- 他ユーザーのデータが見えたら IDOR 脆弱性として報告
```

#### 4-4. API 情報漏洩チェック
```
APIレスポンスに以下が含まれていないか確認:
- 内部スタッフのメールアドレス（created_user_id等）
- DB内部カラム名（updated_cnt, deleted_at等）
- タイムスタンプ（created_at, updated_at）
- 内部ID（社員番号、内部管理番号）
- スタックトレース、デバッグ情報
```

#### 4-5. ブルートフォース耐性テスト
```bash
# 10回連続で不正パスワードでログイン試行
for i in $(seq 1 10); do
  # 毎回新しいセッションとCSRFトークンを取得
  RESP=$(curl -s -c /tmp/bf${i}.txt https://{domain}/auth/login)
  TOKEN=$(echo "$RESP" | grep '_token' | head -1 | sed 's/.*value="//' | sed 's/".*//')
  CODE=$(curl -s -b /tmp/bf${i}.txt -c /tmp/bf${i}.txt \
    -X POST https://{domain}/auth/login \
    -d "_token=${TOKEN}&email={email}&password=wrongpass${i}" \
    -o /dev/null -w "%{http_code}")
  echo "Attempt ${i}: HTTP ${CODE}"
done

# 判定:
# - 全て同じステータス → レート制限なし（脆弱）
# - 429が返る → レート制限あり（良好）
# - ロックアウトメッセージ → アカウントロックあり（良好）
```

#### 4-6. 入力バリデーション・インジェクションテスト
```bash
# XSS反射テスト（URLパラメータ）
curl -s "https://{domain}/path?param=%3Cscript%3Ealert(1)%3C/script%3E" | grep '<script>alert(1)</script>'

# SQLインジェクション探索（シングルクォート）
curl -s "https://{domain}/path?id=1'" | grep -iE 'sql|syntax|query|mysql|error|exception'

# オープンリダイレクトテスト
curl -sI "https://{domain}/auth/login?redirect=https://evil.com" | grep -i location
```

#### 4-7. クラウドストレージセキュリティ
```bash
# S3バケットの公開設定チェック
curl -sI "https://{bucket}.s3.amazonaws.com/" | head -5  # ルートリスティング
curl -sI "https://{bucket}.s3.amazonaws.com/{known_path}" | head -5  # 個別ファイルアクセス

# 画像URLパターンの予測可能性を分析
# /images/{auction_id}/{item_id}/{item_id}_{n}.jpg → 列挙可能

# GCS / Azure Blob Storage も同様にチェック
```

#### 4-8. エラーハンドリング分析
```
- 404ページ: スタックトレースやフレームワーク情報の漏洩
- 500ページ: デバッグ情報の漏洩
- 不正パラメータ: SQLエラーメッセージの漏洩
- ログイン失敗: 適切なHTTPステータスコード（302 or 422）が返るか（500は不適切）
```

#### 4-9. パスワードポリシー分析
```
- 最小長: 8文字以上か
- 最大長: 制限が不適切でないか（16文字以下は弱い。64文字以上を推奨）
- 複雑性要件: 英数字記号の要求
- パスワード変更: 旧パスワードの検証があるか
- パスワードリセット: CAPTCHA・レート制限の有無
```

#### 4-10. セッション管理
```
- ログアウト後のセッション無効化
- セッションタイムアウトの設定
- 同時ログインの制限
```

### Step 4.5: モバイルアプリ診断（モード4）

モード4（APK/IPA/ストアURL指定）の場合のみ実行。

#### 前提ツール確認 & 自動インストール

```bash
# 必須（macOS標準搭載）: unzip, strings, otool, plutil, codesign, file
# 推奨（より深い解析用・不足時のみ brew で自動インストールを提案）
for tool in apktool jadx; do
  command -v $tool >/dev/null 2>&1 || MISSING+=" $tool"
done
```

不足ツールがある場合、ユーザーに確認してから:
```bash
brew install apktool jadx
```
※ Tier 1（標準ツールのみ）でも7割のチェックは可能。apktool/jadx があると AndroidManifest 完全復号・Javaバイトコード解析まで踏み込める。

#### 4.5-1. ストアメタデータ診断（ストアURLがある場合）

```bash
# Google Play
WebFetch https://play.google.com/store/apps/details?id={pkg}&hl=ja
# → アプリ名、開発者名、最終更新日、必要権限一覧、対象Androidバージョン、
#    プライバシーポリシーURL、ダウンロード数レンジ、レビュー傾向（セキュリティ不満の有無）

# App Store
WebFetch https://apps.apple.com/jp/app/{name}/id{appid}
# → アプリ名、最終更新日、対応iOSバージョン、サイズ、カテゴリ、
#    App Privacy ラベル（収集データの種別）、プライバシーポリシーURL
```

**評価観点:**
- 最終更新日が1年以上前 → **放置アプリ**（中リスク）
- 要求権限が用途に対して過剰（例: ゲームで連絡先・SMS要求） → 高リスク
- プライバシーポリシーURLが404/期限切れ → **法的リスク**（個人情報保護法違反可能性）
- iOS App Privacy ラベルと実際の挙動の乖離 → Appleガイドライン違反

#### 4.5-2. APK 静的解析（Android）

```bash
APK={path_to_apk}
WORKDIR=/tmp/hackjpn_apk_$$
mkdir -p $WORKDIR && cd $WORKDIR

# APKはZIP。unzipで展開
unzip -q $APK

# 1. AndroidManifest.xml（バイナリXML）のパーミッション抽出
#    Tier 1: strings + パターン抽出（不完全だがパーミッション名は取れる）
strings AndroidManifest.xml | grep -E "android.permission\.[A-Z_]+" | sort -u
#    Tier 2: apktool があれば完全復号
[ -x "$(command -v apktool)" ] && apktool d -f $APK -o $WORKDIR/decoded

# 2. 機密情報の静的漏洩チェック（全ファイル横断）
find . -type f \( -name "*.xml" -o -name "*.json" -o -name "*.properties" -o -name "classes*.dex" \) \
  -exec strings {} \; | grep -iE \
  "(api[_-]?key|secret|token|password|aws_access|firebase|sk_live|sk_test|bearer|private[_-]?key)" \
  | grep -vE "^(//|/\*|\*)" | head -50

# 3. ハードコードされたエンドポイントURL抽出
find . -type f -exec strings {} \; 2>/dev/null \
  | grep -oE "https?://[a-zA-Z0-9./_-]+" | sort -u \
  | grep -vE "(schemas\.android\.com|www\.w3\.org|github\.com/google)" > endpoints.txt

# 4. ネットワークセキュリティ設定
[ -f "res/xml/network_security_config.xml" ] && cat res/xml/network_security_config.xml
# 確認: cleartextTrafficPermitted=true → 平文通信許可（致命的）
#       trust-anchors に user 証明書含む → 中間者攻撃耐性なし

# 5. DEX解析（classes.dex 内のクラス列挙）
strings classes.dex | grep -E "^L[a-z]+/[A-Za-z]+" | head -100
# Tier 2: jadx classes.dex -d $WORKDIR/jadx_out で完全デコンパイル
```

**Android 必須チェック項目:**

| 項目 | 確認内容 | リスク |
|---|---|---|
| `android:debuggable` | AndroidManifest.xml に `true` がないか | 致命的（本番で有効＝端末上で任意コード実行可） |
| `android:allowBackup` | デフォルト true になっていないか | 高（adb backup でユーザーデータ抽出可） |
| `cleartextTrafficPermitted` | true なら中間者攻撃耐性なし | 致命的 |
| `usesCleartextTraffic` | 同上 | 致命的 |
| 過剰な permission | `READ_CONTACTS`, `SEND_SMS`, `READ_SMS`, `SYSTEM_ALERT_WINDOW` 等 | 中〜高 |
| exported activities/services | `android:exported="true"` で permission 未指定 | 高（他アプリから起動可） |
| ハードコード秘密情報 | API Key, Firebase config, AWS credentials | 致命的 |
| 証明書ピンニング | OkHttp CertificatePinner, network_security_config の pin-set | なしなら中（通信改ざんリスク） |
| ProGuard/R8 難読化 | classes.dex のクラス名が1-2文字か | なしは低（解析容易化） |
| 第三者SDK | Firebase, AdMob, Unity 等のバージョンが既知CVEあるか | CVEあれば致命的 |

#### 4.5-3. IPA 静的解析（iOS）

```bash
IPA={path_to_ipa}
WORKDIR=/tmp/hackjpn_ipa_$$
mkdir -p $WORKDIR && cd $WORKDIR

# IPAはZIP。Payload/{AppName}.app/ が実体
unzip -q $IPA
APP=$(find Payload -maxdepth 1 -type d -name "*.app" | head -1)
BIN="$APP/$(plutil -extract CFBundleExecutable raw "$APP/Info.plist")"

# 1. Info.plist をXMLに変換して内容確認
plutil -convert xml1 -o $WORKDIR/Info.xml "$APP/Info.plist"

# 2. App Transport Security (ATS) 設定確認
plutil -extract NSAppTransportSecurity xml1 -o - "$APP/Info.plist" 2>/dev/null
# 確認: NSAllowsArbitraryLoads=true → 平文通信許可（致命的）
#       NSExceptionDomains に広い例外 → 部分的に平文許可

# 3. 権限記述（プライバシー説明文字列）
for key in NSCameraUsageDescription NSPhotoLibraryUsageDescription NSLocationWhenInUseUsageDescription \
           NSContactsUsageDescription NSMicrophoneUsageDescription NSBluetoothAlwaysUsageDescription \
           NSHealthShareUsageDescription NSFaceIDUsageDescription; do
  plutil -extract $key raw "$APP/Info.plist" 2>/dev/null && echo "  ^ $key"
done
# 確認: 実装機能に対して過剰な権限要求がないか

# 4. URLスキーム（他アプリから起動可能なエントリ）
plutil -extract CFBundleURLTypes xml1 -o - "$APP/Info.plist" 2>/dev/null
# 確認: 認証トークンをURLスキーム経由で受け取る実装は危険

# 5. Entitlements（署名権限）
codesign -d --entitlements :- "$APP" 2>/dev/null
# 確認: keychain-access-groups、aps-environment、iCloud 等の範囲

# 6. バイナリ保護（PIE / Stack Canary / ARC）
otool -hv "$BIN" | grep -E "PIE|MH_"
otool -Iv "$BIN" | grep -E "stack_chk|objc_release"
# 確認: PIE なし → ASLR 無効化、stack_chk なし → スタック保護なし

# 7. 機密情報の静的漏洩チェック
strings "$BIN" | grep -iE "(api[_-]?key|secret|token|password|sk_live|sk_test|bearer)" | head -50
strings "$BIN" | grep -oE "https?://[a-zA-Z0-9./_-]+" | sort -u > endpoints_ios.txt

# 8. 埋め込みプロビジョニングプロファイル
[ -f "$APP/embedded.mobileprovision" ] && \
  security cms -D -i "$APP/embedded.mobileprovision" | plutil -p - | head -40
# 確認: get-task-allow=true なら debuggable（本番配布で危険）
```

**iOS 必須チェック項目:**

| 項目 | 確認内容 | リスク |
|---|---|---|
| `NSAllowsArbitraryLoads` | true は致命的。例外ドメインも最小化 | 致命的 |
| `get-task-allow` entitlement | 本番バイナリで true なら致命的（デバッガアタッチ可） | 致命的 |
| PIE (Position Independent Executable) | otool出力に PIE フラグ | なしは中 |
| Stack Canary | `__stack_chk_guard` シンボル存在 | なしは中 |
| ARC (Automatic Reference Counting) | `objc_release` 等の存在 | なしは低 |
| URL Scheme ハイジャック耐性 | CFBundleURLSchemes が汎用名でないか（例: `myapp` よりドメインベース） | 中 |
| Keychain access group | 過度に広い共有設定でないか | 中 |
| ハードコード秘密情報 | 同上 | 致命的 |
| 証明書ピンニング | NSPinnedDomains or コード内実装 | なしは中 |
| Jailbreak 検知 | なくても致命的ではないが、金融/決済アプリでは推奨 | 低〜中 |

#### 4.5-4. バックエンドAPI連携診断

静的解析で抽出した `endpoints.txt` の各URLに対して、Step 3〜4のWeb診断を適用:

```bash
# アプリから抽出したエンドポイントをWeb診断フローに流し込む
while read endpoint; do
  DOMAIN=$(echo $endpoint | awk -F/ '{print $3}')
  # SSL/TLS チェック、セキュリティヘッダーチェック等を並列実行
  curl -sI $endpoint
  curl -s -o /dev/null -w "%{http_code} %{url_effective}\n" $endpoint
done < endpoints.txt
```

**追加チェック:**
- API認証なしでアクセスできるエンドポイントがないか
- Swagger/OpenAPI ドキュメントが公開されていないか（`/swagger`, `/api-docs`, `/openapi.json`）
- バージョン情報・デバッグ情報がレスポンスに含まれないか
- 認証トークンを URL クエリパラメータで渡していないか（ログに残る）

#### 4.5-5. プライバシー法令適合性チェック

```
- プライバシーポリシーURLが有効か（ストアURLから取得 → 200応答・日本語対応）
- 個人情報保護法（2022改正）適合:
  - 利用目的の明示
  - 第三者提供の同意取得フロー
  - 保有個人データの開示請求窓口
- GDPR（海外配信がある場合）: Cookie同意、データポータビリティ
- 子ども向けアプリの場合: COPPA（米国）/ 13歳未満の扱い
- ストアのプライバシーラベル vs 実際の通信先の整合性
  （AppStoreで「位置情報を収集しない」と宣言しつつ位置情報APIを叩いている等）
```

#### 4.5-6. クリーンアップ

```bash
rm -rf /tmp/hackjpn_apk_$$ /tmp/hackjpn_ipa_$$
```

### Step 5: スコアリング

診断対象に応じて以下の基準で100点満点のスコアを算出し、A〜Fのグレードを付与。

#### Web診断（モード1〜3）【拡張版・7カテゴリ100点】

| カテゴリ | 配点 | チェック内容 |
|---|---|---|
| インフラ・プラットフォーム | 15点 | OS/Webサーバー/言語のEOL、バージョン公開、HTTP/2・HTTP/3対応、アプリケーション指紋 |
| **メール認証・DNS保護** | **20点** | DMARC/SPF/DKIM複数セレクタ/MTA-STS/TLS-RPT/BIMI/DNSSEC/CAA（9項目） |
| 認証・セッション管理 | 15点 | ブルートフォース対策、ロックアウト、Cookie属性（HttpOnly/Secure/SameSite）、セッション管理 |
| アクセス制御 | 15点 | IDOR、認可チェック、**HTTPメソッド制御（DELETE/PUT/PATCH）**、CORS（Origin反射含む）、サブドメインテイクオーバー |
| 入力バリデーション | 10点 | XSS、SQLi、オープンリダイレクト、CRLFインジェクション、ファイルアップロード |
| HTTPセキュリティ設定 | 15点 | 6種ヘッダー + HSTS preload + Cache-Control（フォーム/認証系） + 過剰カスタムヘッダー削減 |
| データ保護 | 10点 | API情報漏洩、S3公開、機密ファイル保護、ソースマップ露出、インライン秘密情報、Mixed Content、SRI |

**各カテゴリのスコア計算ルール:**
- カテゴリ内の各チェック項目を以下の基準で配点（目安）:
  - 致命的な欠陥 1件: -5〜-10点
  - 高リスク: -3〜-5点
  - 中リスク: -1〜-2点
  - 低リスク: -0.5点
- カテゴリ下限は 0 点（マイナスにはしない）
- **メール認証・DNS保護カテゴリ**は上場企業・金融・不動産業態で重み増し（×1.2）

**減点が発生しやすい見落としがちな項目**:
- DMARC が存在するが `p=none` → メール認証を**していない**に等しい（-8点）
- HTTP メソッド（DELETE/PUT/PATCH）が 200 応答 → 致命的カテゴリ（-8点）
- CAA レコード未設定 → CA経路での不正証明書発行リスク（-4点）
- DNSSEC 未設定 → DNS改ざん検出不可（-5点）
- HSTS preload 未登録 → 初回アクセスHTTP経由リスク（-2点）
- ソースマップ露出 → ソースコード完全復元可能（-6点）
- フォームページに Cache-Control なし → 共有PC・プロキシキャッシュ露出（-2点）

#### モバイルアプリ診断（モード4）

| カテゴリ | 配点 | チェック内容 |
|---|---|---|
| 通信保護 | 20点 | ATS/cleartextTraffic、証明書ピンニング、バックエンドAPIのTLS |
| 秘密情報管理 | 20点 | ハードコードされたAPI Key・トークン・認証情報の有無 |
| バイナリ保護 | 15点 | PIE/ARC/Stack Canary、ProGuard難読化、get-task-allow |
| 権限・エクスポート制御 | 15点 | 過剰なpermission、exported activityの認可、URL Scheme |
| プライバシー法令適合性 | 15点 | プライバシーポリシー、ストア宣言との整合性、個情法・GDPR |
| バックエンドAPI | 15点 | アプリから抽出したエンドポイントのWeb診断結果 |

#### Web+アプリ両方（複合診断）

両方診断した場合は **それぞれのスコアを併記**し、総合スコアは加重平均（Web:アプリ=40:60、アプリのほうが一般的にリスクが集中するため重みを大きく）。

| スコア | グレード |
|---|---|
| 90-100 | A（優秀） |
| 75-89 | B（良好） |
| 60-74 | C（要改善） |
| 40-59 | D（危険） |
| 0-39 | F（緊急対応必要） |

### Step 6: レポート生成

診断結果をMarkdownファイルとして保存:
- 保存先: `/Users/hikarutomura/Desktop/cyber/{domain}_security_report_{YYYYMMDD}.md`

#### レポート構成

```markdown
# {サイト名} セキュリティ診断レポート

**対象サイト**: URL
**運営会社**: 会社名
**診断実施日**: YYYY年MM月DD日
**診断者**: hackjpn株式会社

---

## エグゼクティブサマリー
致命的 X件、高 X件、中 X件、低 X件、情報 X件の計N件検出。

## 総合リスクスコア: XX / 100（グレード）
カテゴリ別スコア表

---

## 検出された脆弱性一覧

### 致命的（Critical）
各脆弱性:
- 重大度
- 検出箇所（URL / ヘッダー / APIエンドポイント）
- 詳細（技術的な説明）
- 実際のレスポンス/証跡
- リスク（攻撃シナリオ）
- 対策（具体的なコード/設定例）

### 高（High）
### 中（Medium）
### 低（Low）
### 情報（Informational）

---

## 検出されなかった脆弱性（良好な点）
チェック項目と結果の表

---

## 推奨対応優先度
### 即時対応（1週間以内）
### 短期対応（1ヶ月以内）
### 中期対応（3ヶ月以内）

---

## 免責事項
```

### Step 7: 提案スライド生成

`/slide` スキルを呼び出して、以下の構成でスライドを生成:

#### スライドの読者 = 非エンジニアの経営者・役員

提案先の意思決定者はエンジニアではない。すべてのスライドは以下のルールに従う:

##### 表現ルール
1. **技術用語には必ず「何が起きるか」を併記する**。技術名だけ書いて終わりにしない。
   - NG: 「X-Frame-Options が未設定」
   - OK: 「画面の乗っ取り防止（X-Frame-Options）が未設定」
   - OK: テーブルのヘッダーを「防御機構」「状態」「未設定時に何が起きるか」にする
2. **各脆弱性スライドに `analogy-box`（備考ボックス）を1つ付ける**。ラベルは「💡 備考」。
   - ビジネスや日常の状況に置き換えて、リスクの大きさを伝える
   - **幼稚・子供向けの言い回しは禁止**。経営者が読んで違和感のない表現にする
   - 具体的な事実やロジックで伝える。ふわっとした比喩より「〜と同じ法的構造」「〜と同等の状態」のほうが刺さる
   - 例: 「メーカーがリコール対応を終了した車で営業運転しているのと同じ構造です。事故時の責任は全て運行管理者に帰属します。」
   - 例: 「受付カウンターに社員名簿と内線番号が置かれている状態です。」
3. **「たとえるなら」は使わない**。「💡 備考」とする。
4. **見積り・金額スライドは入れない**（説明会で口頭提示する方が交渉力が高い）
5. **最終スライドのCTAは「まずは1時間、お話しさせてください」**にする。金額ではなく対話をゴールにする。

##### 正円スコアリングの必須CSS
スコア表示の円は**必ず正円**にする。楕円形は禁止:
```css
.score-ring {
  width: 170px;
  height: 170px;
  min-width: 170px;
  min-height: 170px;
  border-radius: 50%;
  border: 12px solid var(--danger);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
  aspect-ratio: 1 / 1;
  box-sizing: border-box;
}
```

##### 備考ボックスの必須CSS
```css
/* darkスライド用 */
.analogy-box {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 18px 24px;
  max-width: 720px;
  margin: 14px auto;
  text-align: left;
}
/* 白/softスライド用 */
.analogy-box-light {
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  padding: 18px 24px;
  max-width: 720px;
  margin: 14px auto;
  text-align: left;
}
```

#### 必須スライド構成（10〜14枚）

1. **タイトル** (dark accent-bar-top) — hackjpnロゴ + 「セキュリティ診断レポート」+ クライアント名 + 日付 + Confidential
2. **エグゼクティブサマリー** (white) — score-ring（正円）+ 重大度別件数（grid-5のcard-brand）+ 備考ボックスで意味を補足
3. **扱うデータの重さ** (dark) — サイトが預かっている機密データを列挙（銀行口座・身分証等）+ 備考で「これが保護不十分な状態」
4. **致命的な脆弱性①** (soft) — EOLソフトウェア等。VS比較レイアウト（現状 → あるべき姿）+ 備考
5. **致命的な脆弱性②** (dark) — API情報漏洩等。実際のレスポンスをcode-blockで表示 + 「これで何ができてしまうか」を併記 + 備考
6. **高リスク脆弱性** (soft) — テーブル。列名は技術名でなく「防御機構」「状態」「ないとどうなる？」+ 備考
7. **上場企業/法的リスク** (dark) — 該当する場合のみ。grid-2のcard-brand + 備考で「重過失」認定ロジックを説明
8. **最悪のシナリオ** (white) — chain-flowで連鎖を視覚化 + 類似事例（実際に起きた漏洩事故）を備考に
9. **良好な点** (dark) — grid-2 + lst-yesで正常項目。「建て直しではなく補強で済む」
10. **推奨対応ロードマップ** (white) — step-rowで即時/短期/中期/定期。各ステップに「→ これで何割のリスクが消える」を添える
11. **なぜhackjpnか** (dark) — grid-3のcard-brandで3つの強み。非エンジニアに刺さる表現（「発見して終わりではない」「経営目線で対話できる」「その日から動ける」）
12. **CTA** (dark accent-bar-top) — 「まずは1時間、お話しさせてください」+ step-row（説明→相談→即日対応）+ 連絡先

#### スライドの色・ラベル使い分け
- `label-tag danger`（赤）: Critical脆弱性スライド
- `label-tag coral`: High Risk、Compliance Risk、Data at Risk
- `label-tag yellow`: Roadmap（darkスライド上）
- `label-tag green`: Positive Findings
- `label-tag blue`: Why hackjpn
- `badge-danger`: 「未設定」「EOL」「なし」等の警告ラベル
- `c-coral` / `c-danger`: 危険な数値・テキスト
- `c-green`: 良好な項目

#### 見積り基準

##### 企業タイプ別

| タイプ | 初回診断 | 改修支援 | 定期契約（年間） |
|---|---|---|---|
| **上場企業** | ¥1,500,000〜2,000,000 | ¥2,000,000〜4,000,000 | ¥3,000,000〜5,000,000 |
| **中堅企業** | ¥800,000〜1,500,000 | ¥1,000,000〜2,000,000 | ¥1,500,000〜3,000,000 |
| **中小企業** | ¥300,000〜800,000 | ¥500,000〜1,000,000 | ¥500,000〜1,000,000 |
| **スタートアップ** | ¥150,000〜300,000 | ¥200,000〜500,000 | ¥300,000〜600,000 |

##### サイト種別加算

| サイト種別 | 加算理由 | 加算率 |
|---|---|---|
| ECサイト・決済あり | PCI DSS関連 | +30% |
| 金融・保険 | 金融庁ガイドライン | +50% |
| 医療・ヘルスケア | 要配慮個人情報 | +30% |
| 会員制サービス（認証後ページあり） | 認証後診断コスト | +20% |
| BtoBプラットフォーム | 企業間取引データ | +20% |
| モバイルアプリ（iOS+Android両方） | 両OS静的解析・API連携検証 | +40% |
| モバイルアプリ（片方のみ） | 静的解析のみ | +20% |
| ゲームアプリ | 課金・チート耐性・RMT対策の観点追加 | +20% |

##### 個別項目

| 項目 | 価格帯 |
|---|---|
| セキュリティ診断レポート | ¥150,000〜2,000,000 |
| PHP/Apache/nginx アップグレード支援 | ¥1,000,000〜2,000,000 |
| セキュリティヘッダー + Cookie改修 | ¥500,000〜800,000 |
| API情報漏洩の改修 | ¥300,000〜500,000 |
| IDOR/認可の改修 | ¥500,000〜1,000,000 |
| S3/クラウドストレージのアクセス制御改修 | ¥300,000〜500,000 |
| ブルートフォース対策（ロックアウト+CAPTCHA） | ¥200,000〜400,000 |
| 改修後の再診断 | ¥500,000〜800,000 |
| WPメジャーバージョンアップグレード | ¥800,000〜1,200,000 |
| WPセキュリティ設定のみ | ¥150,000〜300,000 |
| **モバイルアプリ静的解析（片OS）** | ¥300,000〜800,000 |
| **モバイルアプリ静的解析（両OS）** | ¥500,000〜1,500,000 |
| **証明書ピンニング実装支援** | ¥300,000〜600,000 |
| **ハードコード秘密情報の環境変数化＋Keychain/Keystore移行** | ¥400,000〜800,000 |
| **ATS/cleartextTraffic設定の適正化** | ¥150,000〜300,000 |
| **ProGuard/R8 難読化導入** | ¥200,000〜400,000 |
| **プライバシーポリシー改訂（法務連携込み）** | ¥300,000〜600,000 |

### Step 8: 営業メッセージ生成

`/msg` スキルの形式で、以下を含むコピペ用メッセージを生成:

- 診断した経緯（自然な導入）
- 危機感の伝え方（技術用語は使わない、経営リスクとして伝える）
- 上場企業の場合: 法的リスクへの言及（個人情報保護法、J-SOX）
- 具体的な発見事項（1〜2個、インパクトの大きいもの）
- スライドURL
- 次のアクション（説明会の提案、1時間程度）

---

## 診断後のクリーンアップ

```bash
# 一時Cookieファイルの削除
rm -f /tmp/{domain}_cookies.txt /tmp/bf*.txt /tmp/{domain}_*.txt /tmp/{domain}_*.html
```

## 上場企業判定

以下の手がかりから上場企業かどうかを推定（ユーザーからの情報も参照）:
- IR情報ページの存在（`/ir/`, `/investor/`）
- 株主総会関連ページ
- 適時開示情報
- 証券コードの記載
- ユーザーからの情報（「上場企業」「東証」等のキーワード）

上場企業と判定された場合:
1. レポートに**法的リスクセクション**を追加
2. スライドに**コンプライアンスリスク**スライドを追加
3. 見積もりを**上場企業基準**に調整
4. 最悪のシナリオに**株価暴落 → 株主代表訴訟**を含める

### 上場企業向け法的リスク項目

| 法令・規制 | リスク内容 |
|---|---|
| 改正個人情報保護法（2022年施行） | 漏洩時は個人情報保護委員会への報告義務。最大1億円の罰金 |
| J-SOX（内部統制報告制度） | EOLソフトウェアの使用はIT統制の重大な欠陥 |
| 東証 適時開示義務 | 漏洩事故発生時はIR開示が必要。株価に直接影響 |
| 株主代表訴訟 | 既知の脆弱性放置は善管注意義務違反。「重過失」認定リスク |

---

## 補足ルール

- 認証後診断でも**破壊的な操作は行わない**（削除API等はステータスコードのみ確認）
- 診断は外部から確認できる範囲に限定（ポートスキャン等の侵入テストは行わない）
- ブルートフォーステストは**テスト用の間違ったパスワード**のみ使用（正規パスワードは最初のログインのみ）
- クライアント名が不明な場合はサイトから自動取得（title, OGP, 利用規約等）
- 送信先（Facebook, メール, チャット等）が指定されている場合はトーンを調整
- セキュリティ上の問題が少ない場合は、パフォーマンス改善やSEO改善の提案に切り替える
- **一時ファイルは診断完了後に必ず削除**する

---

## nginx セキュリティ設定テンプレート

WordPress サイトの場合、以下のnginx設定コードも生成する:

### 必須項目
- セキュリティヘッダー6種（HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy）
- XML-RPC 無効化
- REST API ユーザーエンドポイント制限
- WordPress情報ファイルのアクセスブロック（readme.html, license.txt）
- wp-login.php レート制限
- wp-cron.php 外部アクセスブロック
- 機密ファイル保護（wp-config.php, .env, .git）
- uploads内PHP実行制限
- server_tokens off

### WP PHP セキュリティコード
functions.php または mu-plugins に追加するコード:
- REST API ユーザーエンドポイント無効化（未ログイン時）
- WPバージョン情報非表示（generator, ver パラメータ）
- Author アーカイブリダイレクト
- XML-RPC 無効化（PHP側二重ブロック）
- ログインエラーメッセージ曖昧化
- wp-json リンクヘッダー非表示
- WLW/EditURI リンク削除

---

## Laravel / カスタムアプリ向け改修テンプレート

Laravel等のカスタムアプリの場合、以下の改修コード例も生成する:

### Apache .htaccess / httpd.conf
```apache
ServerTokens Prod
ServerSignature Off

Header always set X-Frame-Options "DENY"
Header always set X-Content-Type-Options "nosniff"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
Header always unset X-Powered-By
```

### Laravel Cookie 設定 (config/session.php)
```php
'secure' => true,
'same_site' => 'lax',
'http_only' => true,
```

### API レスポンス整形（DTOパターン）
```
- 内部管理フィールド（created_user_id, updated_cnt等）を除外
- 必要なフィールドのみ返すResourceクラスの使用
```

### ブルートフォース対策（Laravel ThrottleRequests）
```php
Route::post('/login', [LoginController::class, 'login'])
    ->middleware('throttle:5,1');  // 1分間に5回まで
```

---

## DNS / メール認証 改修テンプレート（Route 53 / Cloudflare 共通）

メール認証系・DNS保護系の欠落は**ほぼすべて DNS レコード修正のみで改修可能**で、工数に対してリスク低減効果が極めて大きい。以下は即戦力テンプレート。

### DMARC（最優先）
```
レコード名: _dmarc.{domain}
タイプ:     TXT
値:         "v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@{domain}; ruf=mailto:dmarc-forensics@{domain}; pct=100; adkim=s; aspf=s; fo=1"

段階移行:
  Phase 1 (1週間):  p=none + rua で観測（現状把握）
  Phase 2 (1ヶ月):  p=quarantine（隔離開始）
  Phase 3 (3ヶ月):  p=reject（完全拒否）
```

### SPF（主要ドメイン・サブドメインに必須）
```
レコード名: {domain}
タイプ:     TXT
値（Google Workspace の場合）:
  "v=spf1 include:_spf.google.com ~all"

値（複数ESP利用の場合）:
  "v=spf1 include:_spf.google.com include:mailgun.org include:amazonses.com ~all"

注意: DNSルックアップが10回を超えるとSPF構文が破綻するため、include数を監視
```

### DKIM（各ESPで複数セレクタ発行）
```
Google Workspace 管理コンソールで生成後、以下の形式:
レコード名: google._domainkey.{domain}
タイプ:     TXT
値:         "v=DKIM1; k=rsa; p=MIGfMA0..."

Amazon SES:
  amazonses._domainkey.{domain} → SES コンソールで生成

Mailgun:
  s1._domainkey.{domain}, s2._domainkey.{domain} → Mailgun ダッシュボードで生成
```

### MTA-STS
```
レコード名: _mta-sts.{domain}
タイプ:     TXT
値:         "v=STSv1; id=20260421001"

+ https://mta-sts.{domain}/.well-known/mta-sts.txt にポリシーファイル配置:
  version: STSv1
  mode: enforce
  max_age: 604800
  mx: *.l.google.com
```

### TLS-RPT
```
レコード名: _smtp._tls.{domain}
タイプ:     TXT
値:         "v=TLSRPTv1; rua=mailto:tls-reports@{domain}"
```

### BIMI（DMARCを p=quarantine 以上にした後）
```
レコード名: default._bimi.{domain}
タイプ:     TXT
値:         "v=BIMI1; l=https://{domain}/bimi-logo.svg; a=https://{domain}/bimi-cert.pem"

# VMC（認証済ロゴマーク証明書）は DigiCert/Entrust で別途取得
```

### DNSSEC（Route 53）
```
AWS コンソール:
  Route 53 > Hosted zones > {domain} > DNSSEC signing > Enable
  → 親ゾーン（JPRS/レジストラ）に DS レコード提出

Cloudflare:
  DNS > Settings > DNSSEC > Enable
  → 表示される DS レコードをレジストラ側に登録
```

### CAA（必須）
```
レコード名: {domain}
タイプ:     CAA

# AWS Certificate Manager 利用の場合:
0 issue "amazon.com"
0 issue "amazontrust.com"
0 issue "awstrust.com"
0 issuewild "amazon.com"

# Let's Encrypt 利用の場合:
0 issue "letsencrypt.org"

# 不正発行通知先:
0 iodef "mailto:security@{domain}"
```

### HSTS preload list 登録
```
1. Apache/nginx で以下を設定:
   Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
2. 全サブドメインが HTTPS で動作することを確認
3. https://hstspreload.org/ で送信
4. Chrome / Firefox / Safari 等のブラウザに 2〜6週間で反映
```

---

## HTTP メソッド制限 改修テンプレート（Apache / nginx / ALB）

### Apache
```apache
# 許可メソッド以外を全て拒否
<LimitExcept GET POST HEAD OPTIONS>
    Require all denied
</LimitExcept>

# TRACE は明示的にも拒否
TraceEnable off

# OPTIONS に対して詳細レスポンスを返さない
<If "%{REQUEST_METHOD} == 'OPTIONS'">
    Header unset X-Powered-By
    Header unset Server
</If>
```

### nginx
```nginx
# 許可メソッド以外は 405
if ($request_method !~ ^(GET|POST|HEAD|OPTIONS)$) {
    return 405;
}
```

### AWS ALB リスナールール
```
条件: http-request-method is not (GET, POST, HEAD, OPTIONS)
アクション: Return fixed response 403
```

---

## 出力ファイル

### Web診断

| ファイル | 保存先 |
|---|---|
| 診断レポート | `/Users/hikarutomura/Desktop/cyber/{domain}_security_report_{YYYYMMDD}.md` |
| 提案書（Markdown） | `/Users/hikarutomura/Desktop/cyber/{domain}_security_proposal.md` |
| 営業メッセージ | `/Users/hikarutomura/Desktop/cyber/{domain}_message.md` |
| nginx 設定 | `/Users/hikarutomura/Desktop/cyber/{domain}_nginx_security.conf` |
| Apache 設定 | `/Users/hikarutomura/Desktop/cyber/{domain}_apache_security.conf` |
| **DNS レコード改修セット** | `/Users/hikarutomura/Desktop/cyber/{domain}_dns_security.zone` |
| **メール認証設定手順書** | `/Users/hikarutomura/Desktop/cyber/{domain}_email_auth_setup.md` |
| WP セキュリティPHP | `/Users/hikarutomura/Desktop/cyber/{domain}_wp_security.php` |
| Laravel 改修例 | `/Users/hikarutomura/Desktop/cyber/{domain}_laravel_security.md` |
| スライドHTML | `/tmp/slide-{name}/index.html`（Vercelデプロイ） |

### モバイルアプリ診断

| ファイル | 保存先 |
|---|---|
| アプリ診断レポート | `/Users/hikarutomura/Desktop/cyber/{app_name}_mobile_security_report_{YYYYMMDD}.md` |
| 抽出エンドポイント一覧 | `/Users/hikarutomura/Desktop/cyber/{app_name}_endpoints.txt` |
| 漏洩秘密情報一覧（要手動確認） | `/Users/hikarutomura/Desktop/cyber/{app_name}_secrets_candidates.txt` |
| Android改修例（network_security_config 等） | `/Users/hikarutomura/Desktop/cyber/{app_name}_android_security.md` |
| iOS改修例（ATS/Info.plist/証明書ピンニング） | `/Users/hikarutomura/Desktop/cyber/{app_name}_ios_security.md` |
| 提案スライド | `/tmp/slide-{app_name}/index.html`（Vercelデプロイ） |
