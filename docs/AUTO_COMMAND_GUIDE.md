# autoコマンド使用ガイド（README.md記載予定）

## autoコマンドの目的

`ccswitch auto`は、現在のプロジェクトタイプを自動検出し、最適な`~/.claude`設定に切り替えるコマンドです。

## 使用シーン

### 1. プロジェクト間の移動時
```bash
# Rubyプロジェクトに移動
cd ~/projects/my-rails-app
ccswitch auto
# → 自動的に project/ruby-app ブランチを提案

# Node.jsプロジェクトに移動
cd ~/projects/my-react-app  
ccswitch auto
# → 自動的に project/react-app ブランチを提案
```

### 2. 新規プロジェクトの開始時
```bash
git clone https://github.com/example/python-project
cd python-project
ccswitch auto
# → Pythonプロジェクトを検出し、適切な設定を提案
```

## プロジェクトタイプ別推奨設定

### Node.js/TypeScript プロジェクト
**ブランチ名**: `project/node-app`
```bash
# ~/.claude/CLAUDE.md の推奨内容
- TypeScript/JavaScript向けのルール
- npm/yarn/pnpm コマンドのエイリアス
- ESLint/Prettier設定への言及
```

### Ruby/Rails プロジェクト  
**ブランチ名**: `project/ruby-app`
```bash
# ~/.claude/CLAUDE.md の推奨内容
- Ruby慣例（2スペースインデント等）
- RSpec/Minitest向けのテスト記述
- Bundler/Gem管理の考慮
```

### Python プロジェクト
**ブランチ名**: `project/python-app`
```bash
# ~/.claude/CLAUDE.md の推奨内容
- PEP 8準拠のコーディングスタイル
- pytest/unittest向けのテスト
- pip/poetry/pipenvの使い分け
```

## 設定ブランチの作成方法

### 1. 基本的な作成
```bash
# 新しいプロジェクトタイプ用のブランチを作成
ccswitch create project/flutter-app

# 切り替えて設定を編集
ccswitch switch project/flutter-app
cd ~/.claude
vim CLAUDE.md  # Flutter向けの設定を記述
```

### 2. 既存設定からの派生
```bash
# 既存のproject/node-appから派生
ccswitch switch project/node-app
ccswitch create project/nextjs-app
# Node.jsの設定をベースにNext.js固有の設定を追加
```

### 3. テンプレートの活用
```bash
# slim/minimalから始める
ccswitch switch slim/minimal
ccswitch create project/custom-app
# 最小構成から必要な設定のみ追加
```

## ベストプラクティス

### 1. 命名規則の遵守
- `project/*`: プロジェクトタイプ別
- `client/*`: クライアント別
- `persona/*`: AIペルソナ重視
- `slim/*`: 最小構成

### 2. 設定の継承と差分管理
```bash
# 共通設定は main ブランチに
# プロジェクト固有設定は project/* ブランチに
# 差分を最小限に保つ
```

### 3. 定期的な設定の見直し
```bash
# パフォーマンステストで確認
ccswitch test project/node-app
# トークン使用量が多い場合は設定を削減
```

## トラブルシューティング

### プロジェクトタイプが検出されない
```bash
ccswitch auto --verbose
# 検出されたファイルを確認
# 必要に応じて手動で切り替え
ccswitch switch project/appropriate-branch
```

### 誤ったブランチが提案される
```bash
# package.jsonの内容を確認（React/Vue検出用）
# 手動で適切なブランチを選択
ccswitch switch
```

### ブランチが存在しない
```bash
# 新規作成するか、既存ブランチから選択
ccswitch create project/new-type
# または
ccswitch list  # 利用可能なブランチを確認
```