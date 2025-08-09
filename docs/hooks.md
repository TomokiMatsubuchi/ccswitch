# フック機能ガイド

## 概要

`ccswitch` v0.8.0では、フック機能を導入しました。フックを使用することで、ブランチの切り替えや作成の前後に自動的にカスタムスクリプトを実行できます。これにより、プロジェクト固有のセットアップや環境の自動化が可能になります。

## フックの種類

### 1. pre-switchフック
**実行タイミング**: ブランチ切り替えの**前**
- 切り替え前の確認処理
- 現在の作業の保存
- 依存関係のチェック

### 2. post-switchフック
**実行タイミング**: ブランチ切り替えの**後**
- 依存関係のインストール
- ビルドプロセスの実行
- 環境設定の更新

### 3. pre-createフック
**実行タイミング**: ブランチ作成の**前**
- ブランチ名の検証
- テンプレートの準備
- 権限チェック

### 4. post-createフック
**実行タイミング**: ブランチ作成の**後**
- 初期ファイルの作成
- 設定ファイルのコピー
- 初期化スクリプトの実行

## 設定方法

フックは`.ccswitchrc`ファイルの`hooks`セクションで設定します。

### 基本的な設定

```json
{
  "version": "1",
  "hooks": {
    "preSwitch": "echo 'Switching branch...'",
    "postSwitch": "npm install"
  }
}
```

### 複数コマンドの実行

配列形式で複数のコマンドを順番に実行できます：

```json
{
  "hooks": {
    "postSwitch": [
      "echo 'Installing dependencies...'",
      "npm install",
      "echo 'Building project...'",
      "npm run build",
      "echo 'Ready!'"
    ]
  }
}
```

## 環境変数

フック実行時に、以下の環境変数が自動的に設定されます：

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `CCSWITCH_COMMAND` | 実行中のコマンド | `switch`, `create` |
| `CCSWITCH_FROM_BRANCH` | 切り替え元のブランチ | `main` |
| `CCSWITCH_TO_BRANCH` | 切り替え先のブランチ | `feature/new` |
| `CCSWITCH_PROJECT_ROOT` | プロジェクトのルートディレクトリ | `/Users/name/project` |
| `CCSWITCH_CLAUDE_DIR` | Claudeディレクトリのパス | `~/.claude` |
| `CCSWITCH_TIMESTAMP` | 実行時刻（ISO 8601形式） | `2024-01-01T12:00:00.000Z` |

### 環境変数の使用例

```json
{
  "hooks": {
    "preSwitch": "echo 'Switching from $CCSWITCH_FROM_BRANCH to $CCSWITCH_TO_BRANCH'",
    "postSwitch": "echo 'Now on branch: $CCSWITCH_TO_BRANCH'"
  }
}
```

## 実践的な使用例

### 例1: Node.jsプロジェクト

依存関係の自動インストールとビルド：

```json
{
  "hooks": {
    "postSwitch": [
      "npm install",
      "npm run build"
    ],
    "postCreate": [
      "npm init -y",
      "npm install"
    ]
  }
}
```

### 例2: Pythonプロジェクト

仮想環境の切り替えと依存関係のインストール：

```json
{
  "hooks": {
    "preSwitch": "deactivate 2>/dev/null || true",
    "postSwitch": [
      "python -m venv venv",
      "source venv/bin/activate",
      "pip install -r requirements.txt"
    ]
  }
}
```

### 例3: データベースの準備

ブランチごとに異なるデータベースを使用：

```json
{
  "hooks": {
    "postSwitch": [
      "echo 'Setting up database for branch: $CCSWITCH_TO_BRANCH'",
      "mysql -e \"CREATE DATABASE IF NOT EXISTS project_$CCSWITCH_TO_BRANCH\"",
      "mysql project_$CCSWITCH_TO_BRANCH < schema.sql"
    ]
  }
}
```

### 例4: Git操作の自動化

作業内容の自動保存とステージング：

```json
{
  "hooks": {
    "preSwitch": [
      "git add -A",
      "git stash save 'Auto-stash before switching to $CCSWITCH_TO_BRANCH'"
    ],
    "postSwitch": "git stash list"
  }
}
```

### 例5: Docker環境の管理

Dockerコンテナの停止と起動：

```json
{
  "hooks": {
    "preSwitch": "docker-compose down",
    "postSwitch": [
      "docker-compose up -d",
      "docker-compose logs --tail=10"
    ]
  }
}
```

### 例6: 通知の送信

Slackへの通知：

```json
{
  "hooks": {
    "postSwitch": "curl -X POST -H 'Content-type: application/json' --data '{\"text\":\"Switched to branch: '$CCSWITCH_TO_BRANCH'\"}' YOUR_SLACK_WEBHOOK_URL"
  }
}
```

## エラーハンドリング

### pre-*フックのエラー
`pre-switch`や`pre-create`フックでエラーが発生した場合、**操作は中止されます**：

```json
{
  "hooks": {
    "preSwitch": "test -f .required-file || (echo 'Required file missing!' && exit 1)"
  }
}
```

### post-*フックのエラー
`post-switch`や`post-create`フックでエラーが発生しても、**切り替えや作成自体は完了しています**。エラーは表示されますが、操作は取り消されません。

## ベストプラクティス

### 1. 冪等性を保つ
フックは何度実行しても同じ結果になるように設計しましょう：

```json
{
  "hooks": {
    "postSwitch": [
      "mkdir -p logs",
      "touch logs/switch.log",
      "echo \"Switched at $(date)\" >> logs/switch.log"
    ]
  }
}
```

### 2. エラーを適切に処理
エラーが発生しても続行できる場合は、`|| true`を使用：

```json
{
  "hooks": {
    "preSwitch": "npm test || true"
  }
}
```

### 3. 長時間実行されるタスクには進捗を表示

```json
{
  "hooks": {
    "postSwitch": [
      "echo '🔄 Installing dependencies...'",
      "npm install",
      "echo '🔨 Building project...'",
      "npm run build",
      "echo '✅ Setup complete!'"
    ]
  }
}
```

### 4. プロジェクト固有とグローバルの使い分け

**グローバル設定** (`~/.ccswitchrc`):
```json
{
  "hooks": {
    "preSwitch": "echo 'Switching branch at $(date)'"
  }
}
```

**プロジェクト設定** (`.ccswitchrc`):
```json
{
  "hooks": {
    "postSwitch": "npm install && npm run build"
  }
}
```

### 5. デバッグ用の設定

開発中は詳細なログを出力：

```json
{
  "hooks": {
    "preSwitch": "echo \"[DEBUG] From: $CCSWITCH_FROM_BRANCH, To: $CCSWITCH_TO_BRANCH\"",
    "postSwitch": "echo \"[DEBUG] Current directory: $(pwd)\""
  }
}
```

## トラブルシューティング

### Q: フックが実行されない
A: 以下を確認してください：
- `.ccswitchrc`ファイルが正しいJSON形式か
- フックのキー名が正確か（`preSwitch`, `postSwitch`など）
- コマンドが文字列または文字列の配列になっているか

### Q: フックでエラーが発生する
A: エラーメッセージを確認し、以下を試してください：
- コマンドを手動で実行して動作を確認
- パスが正しいか確認（フックは`CCSWITCH_PROJECT_ROOT`で実行されます）
- 必要な実行権限があるか確認

### Q: 環境変数が使えない
A: シェルの構文を確認してください：
- Bashの場合: `$CCSWITCH_TO_BRANCH`
- Windowsの場合: `%CCSWITCH_TO_BRANCH%`

### Q: 複数のコマンドを条件付きで実行したい
A: シェルスクリプトファイルを作成して実行：

```json
{
  "hooks": {
    "postSwitch": "./scripts/post-switch.sh"
  }
}
```

`scripts/post-switch.sh`:
```bash
#!/bin/bash
if [ "$CCSWITCH_TO_BRANCH" = "production" ]; then
  npm run build:prod
else
  npm run build:dev
fi
```

## セキュリティに関する注意

1. **信頼できないプロジェクトの`.ccswitchrc`に注意**
   - フックは任意のコマンドを実行できます
   - 不明なプロジェクトでは設定を確認してから使用してください

2. **機密情報をフックに含めない**
   - パスワードやAPIキーを直接記述しない
   - 環境変数や別ファイルから読み込む

3. **実行権限の確認**
   - フックは現在のユーザー権限で実行されます
   - `sudo`を使用する場合は慎重に

## まとめ

フック機能により、以下が可能になります：

1. **自動化**: 繰り返し作業の自動実行
2. **標準化**: チーム全体で同じセットアップ手順
3. **効率化**: ブランチ切り替え時の手動作業を削減
4. **カスタマイズ**: プロジェクト固有のワークフローに対応

これらの機能を活用することで、開発ワークフローがより効率的になります。