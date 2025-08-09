# Edit コマンド ガイド

## 概要

`edit` コマンドは、設定を簡単に編集できるように、お好みの IDE（VS Code、Cursor など）で `~/.claude` ディレクトリを開きます。

## 基本的な使い方

### 現在のブランチを IDE で開く
```bash
ccswitch edit
```
現在の Git ブランチのまま、`~/.claude` ディレクトリを IDE で開きます。

### ブランチを切り替えて IDE で開く
```bash
ccswitch edit <ブランチ名>
```
指定されたブランチに切り替えてから、`~/.claude` を IDE で開きます。

## 使用例

### 現在のブランチで開く
```bash
# 単に ~/.claude を IDE で開く
ccswitch edit
```

### 特定のブランチに切り替えて編集
```bash
# 'slim/minimal' ブランチに切り替えて IDE で開く
ccswitch edit slim/minimal

# プロジェクト固有のブランチに切り替えて編集
ccswitch edit project/web-app
```

### エラー処理
```bash
# ブランチが存在しない場合
ccswitch edit non-existent-branch
# Error: Branch 'non-existent-branch' does not exist
# Run 'ccswitch list' to see available branches
```

## IDE サポート

コマンドは以下の IDE を優先順位順に自動検出して使用します：

1. **VS Code**（最優先）
2. **Cursor**
3. **Vim**（ターミナルエディタ）
4. **Nano**（ターミナルエディタ）

### macOS 固有の動作
macOS では、コマンドラインツールとの潜在的な競合を避けるため、利用可能な場合は VS Code.app を直接開きます。

## 他のコマンドとの統合

### Create と Edit
`create` コマンドを使用する場合、デフォルトで IDE が自動的に開きます：

```bash
# ブランチを作成して IDE を開く（デフォルト動作）
ccswitch create feature/new-config

# IDE を開かずにブランチを作成
ccswitch create feature/new-config --no-edit
```

### ワークフローの例
```bash
# 1. 利用可能なブランチをリスト
ccswitch list

# 2. ブランチに切り替えて IDE で開く
ccswitch edit project/backend

# 3. IDE で設定を変更

# 4. 設定をテスト
ccswitch test

# 5. 前のブランチに戻る
ccswitch switch -
```

## トラブルシューティング

### IDE が見つからない
サポートされている IDE がインストールされていない場合：
```
Error: No suitable text editor found
Please install VS Code, Cursor, or another text editor
```

**解決策**: サポートされている IDE のいずれかをインストール：
- VS Code: https://code.visualstudio.com/
- Cursor: https://cursor.sh/

### ディレクトリが見つからない
`~/.claude` が存在しない場合：
```
Error: ~/.claude directory does not exist
Run 'ccswitch init' to create the directory first
```

**解決策**: 最初にディレクトリを初期化：
```bash
ccswitch init
```

### アクセス権限拒否
権限の問題がある場合：
```
Error: Permission denied accessing ~/.claude
Please check your directory permissions
```

**解決策**: ディレクトリの権限を確認して修正：
```bash
ls -la ~/.claude
chmod 755 ~/.claude
```

## ヒント

- `edit` コマンドは、異なる設定ブランチ間を素早く切り替えたい場合に特に便利です
- より良い整理のためにブランチ命名規則を使用します：
  - `slim/*` - 最小限の設定
  - `project/*` - プロジェクト固有の設定
  - `client/*` - クライアント固有の設定
  - `persona/*` - ペルソナに焦点を当てた設定

## 高度な使用法

### ブランチ切り替えワークフロー
```bash
# 現在のブランチを確認
ccswitch list

# プロジェクトブランチに切り替えて編集
ccswitch edit project/frontend

# 変更を加える...

# 別のプロジェクトに切り替え
ccswitch edit project/backend

# 変更を加える...

# マスターブランチに戻る
ccswitch switch master
```

### チーム共有ワークフロー
```bash
# チーム用の共通設定ブランチを作成
ccswitch create team/shared-config

# 設定を編集
ccswitch edit team/shared-config

# 変更をコミット
cd ~/.claude
git add .
git commit -m "チーム共有設定を追加"

# チームメンバーと共有（別途 Git リモートの設定が必要）
```

## ベストプラクティス

1. **頻繁に使用するブランチ**: よく使うブランチには短い名前を付ける
2. **定期的な更新**: 設定を定期的に見直して更新する
3. **バックアップ**: 重要な設定は定期的にバックアップする
4. **コメント**: CLAUDE.md ファイルに設定の説明を記載する

### 推奨される設定管理
```bash
# 1. 基本設定を作成
ccswitch create slim/base

# 2. 基本設定を編集
ccswitch edit slim/base

# 3. CLAUDE.md に説明を追加
echo "# 基本設定" >> ~/.claude/CLAUDE.md
echo "最小限のコンテキストで高速な応答を重視" >> ~/.claude/CLAUDE.md

# 4. 変更をコミット
cd ~/.claude
git add .
git commit -m "基本設定を作成"
```