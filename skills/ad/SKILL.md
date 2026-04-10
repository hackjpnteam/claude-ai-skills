---
name: ad
description: >
  Meta広告の高速分析。APIデータ取得済みのヘルパースクリプトで即座に
  アカウント概要、キャンペーン分析、CV=0広告、無駄遣い分析、トップ広告、
  日別推移を出力。「/ad」「広告分析」「ad analysis」で起動。
---

# Meta広告 高速分析スキル

## ヘルパースクリプト

`/path/to/your/scripts/meta_api.py` を使用してMeta APIデータを取得する。
このスクリプトは認証・ページネーション・CV event判定を全て内蔵している。

## 使い方

```bash
# アカウント一覧
python3 /path/to/your/scripts/meta_api.py accounts

# アカウント概要
python3 /path/to/your/scripts/meta_api.py overview
python3 /path/to/your/scripts/meta_api.py overview act_XXXXXXXXXXXX

# キャンペーン別パフォーマンス
python3 /path/to/your/scripts/meta_api.py campaigns

# 全広告パフォーマンス
python3 /path/to/your/scripts/meta_api.py ads

# CV=0で予算消化中の広告
python3 /path/to/your/scripts/meta_api.py zero-cv

# トップパフォーマー（CPA順）
python3 /path/to/your/scripts/meta_api.py top

# 無駄遣い総合分析
python3 /path/to/your/scripts/meta_api.py waste

# 特定広告のクリエイティブ詳細
python3 /path/to/your/scripts/meta_api.py creative AD_ID

# 日別推移
python3 /path/to/your/scripts/meta_api.py daily
python3 /path/to/your/scripts/meta_api.py daily act_XXXXXXXXXXXX 60
```

## 分析フロー

ユーザーが `/ad` または広告分析を依頼したら:

1. **まずヘルパーで即データ取得** — `overview` + `campaigns` を並列実行
2. **問題特定** — `zero-cv` と `waste` で無駄を可視化
3. **詳細掘り下げ** — 問題のある広告は `creative AD_ID` で詳細確認
4. **トレンド確認** — `daily` で直近の傾向を把握
5. **アクションプラン提示** — 停止すべき広告、スケールすべき広告を明確に

## 出力ルール

- 数値は必ず通貨記号付き（¥ or $）で表示
- CVゼロ広告は ACTIVE/PAUSED を明示
- 広告名だけでなくキャンペーン名・広告セット名・ターゲティング・LP URLも記載
- 「どの広告か」が一目でわかるレベルの詳細を出す
- 日本語で出力

## 認証情報

- `.env` ファイルに `META_ACCESS_TOKEN`, `META_APP_SECRET` を設定
- `appsecret_proof` (HMAC-SHA256) は自動付与
- トークン期限切れの場合は `.env` のメモに従って再取得

## 重要な注意

- daily_budget の単位はセント（USD）
- 期間のデフォルトは直近90日。ユーザー指定があれば調整
