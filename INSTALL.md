# インストール方法

## 前提条件

- Claude Code がインストール済みであること
- GitHub CLI (`gh`) がインストール済みであること

## セットアップ

### 1. コマンドのインストール

`commands/` 内の `.md` ファイルを `~/.claude/commands/` にコピーします。

```bash
# コマンドディレクトリがなければ作成
mkdir -p ~/.claude/commands

# コマンドをコピー（使いたいものだけでOK）
cp commands/dev.md ~/.claude/commands/
cp commands/contract.md ~/.claude/commands/
cp commands/ad.md ~/.claude/commands/
cp commands/finance.md ~/.claude/commands/
cp commands/msg.md ~/.claude/commands/
cp commands/remember.md ~/.claude/commands/
cp commands/long.md ~/.claude/commands/
cp commands/test.md ~/.claude/commands/
```

### 2. スキルのインストール

`skills/` 内のディレクトリを `~/.claude/skills/` にコピーします。

```bash
# スキルディレクトリがなければ作成
mkdir -p ~/.claude/skills

# スキルをコピー（使いたいものだけでOK）
cp -r skills/slide ~/.claude/skills/
cp -r skills/pdf ~/.claude/skills/
cp -r skills/qa ~/.claude/skills/
cp -r skills/ad ~/.claude/skills/
```

### 3. 環境変数の設定

各スキル内のプレースホルダー（`YOUR_...`, `{{...}}`）を自分の情報に書き換えてください。

#### `/dev` で必要な環境変数
```
MONGODB_URI=          # MongoDB Atlas 接続文字列
GOOGLE_SERVICE_ACCOUNT_EMAIL=  # Google Sheets API 用
GOOGLE_PRIVATE_KEY=   # Google Sheets API 用
```

#### `/contract` で必要な環境変数
```
RESEND_API_KEY=       # Resend SMTP メール送信用
```

#### `/ad` で必要な環境変数
```
META_ACCESS_TOKEN=    # Meta Business API
META_AD_ACCOUNT_ID=   # 広告アカウントID
META_APP_ID=          # Meta App ID
META_APP_SECRET=      # HMAC署名用
```

#### `/finance` で必要な環境変数
```
MF_ACCESS_TOKEN=      # MoneyForward API
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
```

### 4. カスタマイズ

各ファイル内の以下のプレースホルダーを自社情報に置き換えてください：

| プレースホルダー | 説明 |
|----------------|------|
| `YOUR_COMPANY_NAME` | 会社名 |
| `YOUR_NAME` | 代表者名 |
| `YOUR_ADDRESS` | 住所 |
| `YOUR_EMAIL` | メールアドレス |
| `YOUR_BRAND_NAME` | ブランド名 |
| `YOUR_DEPLOY_URL` | Vercel デプロイ先URL |

## 使い方

Claude Code のプロンプトで `/コマンド名` を入力するだけです：

```
/dev 仕様書に基づいてシステムを開発してください
/contract 業務委託契約書を作成してください
/ad 広告のパフォーマンスを分析してください
/slide 営業資料を作成してください
```

## 注意事項

- 各スキルは独立しています。必要なものだけインストールしてOKです
- 環境変数やAPIキーはスキルファイルに直接書かず、`.env` ファイルで管理してください
- スキルの内容を理解してからカスタマイズすることを推奨します
