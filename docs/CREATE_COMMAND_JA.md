# Create コマンド ガイド

## 概要

`create` コマンドは、Claude.ai の異なる設定プロファイルを管理するために `~/.claude` に新しい Git ブランチを作成します。デフォルトでは、ブランチ作成後に自動的に IDE でディレクトリを開きます。

## 基本的な使い方

### ブランチを作成してIDEで開く（デフォルト）
```bash
ccswitch create <ブランチ名>
```
新しいブランチを作成し、自動的に `~/.claude` を IDE で開きます。

### IDEを開かずにブランチを作成
```bash
ccswitch create <ブランチ名> --no-edit
```
IDE を開かずにブランチのみを作成します。

## 使用例

### 最小限の設定を作成
```bash
# 作成してIDEで開く
ccswitch create slim/minimal
# 出力:
# ✓ Created branch: slim/minimal
# Switched to branch 'slim/minimal'
# Opening ~/.claude in VS Code...
# ✓ Opened ~/.claude in your IDE
```

### プロジェクト固有の設定を作成
```bash
# Webプロジェクト用に作成
ccswitch create project/my-web-app

# バックエンドサービス用に作成
ccswitch create project/api-server
```

### IDE を開かずに作成
```bash
# ブランチのみ作成、IDEは開かない
ccswitch create client/acme-corp --no-edit
# 出力:
# ✓ Created branch: client/acme-corp
# Switched to branch 'client/acme-corp'
```

## ブランチ命名規則

構造化されたブランチ名の使用を推奨します：

- **`slim/*`** - コンテキストを削減した最小限の設定
- **`project/*`** - プロジェクト固有の設定と指示
- **`client/*`** - クライアント固有の設定
- **`persona/*`** - ペルソナに焦点を当てた設定（例：persona/teacher、persona/coder）

### 良いブランチ名の例
```bash
# 最小限の設定
ccswitch create slim/basic
ccswitch create slim/no-context

# プロジェクト設定
ccswitch create project/react-app
ccswitch create project/python-backend
ccswitch create project/data-analysis

# クライアント設定
ccswitch create client/startup-x
ccswitch create client/enterprise-y

# ペルソナ設定
ccswitch create persona/educator
ccswitch create persona/reviewer
ccswitch create persona/architect
```

## ブランチ名の検証

ブランチ名は Git の命名規則に従う必要があります：
- 文字、数字、`/`、`-`、`_` を含むことができます
- スペースや特殊文字を含むことはできません
- ドット（.）で始めることはできません
- .lock で終わることはできません

### 無効なブランチ名
```bash
# スペースは使用不可
ccswitch create "my branch"  # ❌ エラー

# 特殊文字は使用不可
ccswitch create feature@new   # ❌ エラー
ccswitch create config#1      # ❌ エラー
```

### 有効なブランチ名
```bash
ccswitch create feature/new-config     # ✅
ccswitch create test_branch_123        # ✅
ccswitch create v2-configuration       # ✅
```

## IDE 統合

ブランチ作成後、コマンドは自動的に：
1. 新しいブランチに切り替えます
2. 検出された IDE（VS Code、Cursor など）で `~/.claude` を開きます
3. 成功メッセージを表示します

### サポートされている IDE
- **VS Code**（最優先）
- **Cursor**
- **Vim**（ターミナル）
- **Nano**（ターミナル）

### IDE の起動をスキップ
以下の場合に `--no-edit` フラグを使用します：
- 複数のブランチを素早く作成したい
- ヘッドレス環境で作業している
- 別のエディタを手動で使用したい

```bash
# IDE の中断なしに複数のブランチを作成
ccswitch create slim/minimal --no-edit
ccswitch create slim/basic --no-edit
ccswitch create project/web --no-edit
```

## ワークフローの例

### 基本的なワークフロー
```bash
# 1. 必要に応じて初期化
ccswitch init

# 2. 新しい設定ブランチを作成
ccswitch create project/my-app

# 3. IDE で設定ファイルを編集
# （IDE が自動的に開きます）

# 4. 設定をテスト
ccswitch test

# 5. 完了したら別のブランチに切り替え
ccswitch switch master
```

### バッチ作成ワークフロー
```bash
# IDE なしで複数の設定を作成
ccswitch create slim/minimal --no-edit
ccswitch create slim/basic --no-edit
ccswitch create project/frontend --no-edit
ccswitch create project/backend --no-edit

# すべてのブランチをリスト
ccswitch list

# 特定のブランチを編集
ccswitch edit project/frontend
```

## エラー処理

### ブランチが既に存在する
```bash
ccswitch create existing-branch
# Error: Branch 'existing-branch' already exists
# Use 'ccswitch switch' to switch to an existing branch
```

**解決策**: 代わりに `switch` コマンドを使用：
```bash
ccswitch switch existing-branch
```

### Git リポジトリではない
```bash
ccswitch create my-branch
# Error: ~/.claude is not a Git repository
# Run 'ccswitch init' to initialize Git in ~/.claude
```

**解決策**: 最初に初期化：
```bash
ccswitch init
ccswitch create my-branch
```

### 無効なブランチ名
```bash
ccswitch create "invalid name"
# Error: Invalid branch name format
# Branch names should only contain letters, numbers, /, -, and _
```

**解決策**: 有効なブランチ名を使用：
```bash
ccswitch create valid-name
```

## ヒントとベストプラクティス

1. **一貫した命名**: 命名規則を採用し、それに従う
2. **ブランチの文書化**: 各ブランチの用途をメモしておく
3. **古いブランチの削除**: 不要になったブランチは削除する
4. **作成後のテスト**: 作成後は必ず設定をテストする

### 新規プロジェクトの推奨ワークフロー
```bash
# 1. プロジェクト固有のブランチを作成
ccswitch create project/my-new-project

# 2. CLAUDE.md にプロジェクトコンテキストを追加
echo "# プロジェクト: My New Project" >> ~/.claude/CLAUDE.md
echo "技術スタック: React, TypeScript, TailwindCSS" >> ~/.claude/CLAUDE.md

# 3. 設定をテスト
ccswitch test

# 4. 変更をコミット
cd ~/.claude
git add .
git commit -m "my-new-project の設定を追加"
```

## 関連コマンド

- **`edit [branch]`** - ~/.claude を IDE で開く、オプションでブランチ切り替え
- **`switch [branch]`** - 既存のブランチ間で切り替え
- **`list`** - 利用可能なすべてのブランチを表示
- **`test [branch]`** - 設定のパフォーマンスをテスト