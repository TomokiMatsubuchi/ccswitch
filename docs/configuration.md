# 設定ファイル機能ガイド

## 概要

`ccswitch` v0.7.0では、設定ファイル機能を導入しました。これにより、プロジェクトごとの設定を永続化し、チーム間で共有できるようになります。

## 設定ファイルの種類と優先順位

### 1. デフォルト設定（内蔵）
アプリケーションに組み込まれた基本設定です。

### 2. グローバル設定（`~/.ccswitchrc`）
**目的**: ユーザー個人の全プロジェクトで共通して使用する設定
- ホームディレクトリに配置
- すべてのプロジェクトで有効
- 個人の好みやよく使うエイリアスを定義

**使用例**:
```json
{
  "version": "1",
  "defaultBranch": "main",
  "aliases": {
    "m": "main",
    "d": "develop",
    "s": "slim/minimal",
    "f": "full/comprehensive"
  },
  "colors": {
    "enabled": true,
    "theme": "default"
  }
}
```

### 3. ローカル設定（`.ccswitchrc`）
**目的**: 特定のプロジェクト固有の設定
- プロジェクトルートに配置
- そのプロジェクトでのみ有効
- チーム間で共有される設定

**使用例**:
```json
{
  "version": "1",
  "defaultBranch": "project/company-app",
  "presets": [
    {
      "name": "api",
      "branch": "project/api-development",
      "description": "API開発用の設定"
    },
    {
      "name": "frontend",
      "branch": "project/frontend-app",
      "description": "フロントエンド開発用の設定"
    }
  ],
  "aliases": {
    "api": "project/api-development",
    "fe": "project/frontend-app",
    "test": "project/testing"
  }
}
```

### 優先順位
```
ローカル設定 > グローバル設定 > デフォルト設定
```
- 同じ設定項目がある場合、より優先度の高い設定が使用されます
- 設定はマージされるため、部分的な上書きが可能です

## プリセット機能

### プリセットとは？
プリセットは、特定のプロジェクトタイプに対して推奨されるブランチ設定のテンプレートです。

### デフォルトプリセット（14種類）

| プリセット名 | ブランチ | 用途 |
|-------------|---------|------|
| minimal | slim/minimal | 最小限の設定 |
| standard | project/standard | 標準的なプロジェクト設定 |
| comprehensive | full/comprehensive | 包括的な設定 |
| frontend | project/frontend | フロントエンド開発 |
| backend | project/backend | バックエンド開発 |
| fullstack | project/fullstack | フルスタック開発 |
| mobile | project/mobile | モバイルアプリ開発 |
| api | project/api | API開発 |
| ml | project/ml | 機械学習プロジェクト |
| data | project/data | データ分析 |
| devops | project/devops | DevOps/インフラ |
| testing | project/testing | テスト専用 |
| documentation | project/docs | ドキュメント作成 |
| experiment | project/experimental | 実験的な開発 |

### カスタムプリセットの定義
設定ファイルでカスタムプリセットを定義できます：

```json
{
  "presets": [
    {
      "name": "microservice",
      "branch": "project/microservice-auth",
      "description": "認証マイクロサービス用設定",
      "projectTypes": ["node", "typescript"]
    }
  ]
}
```

### プリセットの自動選択
`ccswitch auto`コマンドは、プロジェクトタイプを検出して適切なプリセットを提案します：

```bash
# プロジェクトタイプを検出して自動切り替え
ccswitch auto

# 検出されたタイプ: Node.js
# 推奨プリセット: backend
# ブランチ: project/backend に切り替えますか？
```

## 使用方法

### 1. グローバル設定の作成
```bash
# ホームディレクトリに設定ファイルを作成
cat > ~/.ccswitchrc << EOF
{
  "version": "1",
  "defaultBranch": "main",
  "aliases": {
    "m": "main",
    "d": "develop"
  }
}
EOF
```

### 2. プロジェクト固有設定の作成
```bash
# プロジェクトルートに設定ファイルを作成
cat > .ccswitchrc << EOF
{
  "version": "1",
  "defaultBranch": "project/my-app",
  "presets": [
    {
      "name": "feature",
      "branch": "project/feature-dev",
      "description": "機能開発用"
    }
  ]
}
EOF

# Gitにコミットしてチームで共有
git add .ccswitchrc
git commit -m "Add ccswitch configuration"
```

### 3. エイリアスを使った切り替え
```bash
# エイリアスを使用してブランチ切り替え
ccswitch switch m  # "main"ブランチに切り替え
ccswitch switch d  # "develop"ブランチに切り替え
```

### 4. プリセットの活用
```bash
# 利用可能なプリセットを確認
ccswitch list

# プロジェクトタイプを自動検出して切り替え
ccswitch auto

# 特定のプリセットに基づいてブランチ作成
ccswitch create project/new-feature
```

## 実践的な使用例

### シナリオ1: 個人開発者
**グローバル設定**で個人的な好みを設定：
```json
{
  "aliases": {
    "w": "work-in-progress",
    "p": "personal/side-project"
  },
  "colors": {
    "enabled": true
  }
}
```

### シナリオ2: チーム開発
**ローカル設定**でチーム共通のルールを定義：
```json
{
  "defaultBranch": "project/acme-corp",
  "presets": [
    {
      "name": "sprint1",
      "branch": "project/sprint-1",
      "description": "スプリント1の開発"
    }
  ],
  "aliases": {
    "prod": "project/production",
    "stage": "project/staging",
    "dev": "project/development"
  }
}
```

### シナリオ3: マルチプロジェクト
異なるプロジェクトごとに`.ccswitchrc`を配置：

**Webアプリプロジェクト**:
```json
{
  "defaultBranch": "project/web-app",
  "presets": [
    {
      "name": "react",
      "branch": "project/react-frontend",
      "projectTypes": ["react", "typescript"]
    }
  ]
}
```

**APIプロジェクト**:
```json
{
  "defaultBranch": "project/api-server",
  "presets": [
    {
      "name": "graphql",
      "branch": "project/graphql-api",
      "projectTypes": ["node", "graphql"]
    }
  ]
}
```

## 設定ファイルのスキーマ

```typescript
interface CCSwitchConfig {
  version?: string;           // 設定ファイルのバージョン
  defaultBranch?: string;      // デフォルトブランチ名
  claudeDir?: string;         // Claudeディレクトリのパス（デフォルト: ~/.claude）
  
  presets?: Preset[];         // カスタムプリセット
  aliases?: Record<string, string>;  // ブランチ名のエイリアス
  
  colors?: {
    enabled: boolean;         // カラー出力の有効/無効
    theme?: 'default' | 'minimal' | 'none';
  };
  
  backup?: {
    enabled: boolean;         // バックアップの有効/無効
    maxBackups?: number;      // 保持する最大バックアップ数
    autoBackup?: boolean;     // 自動バックアップ
  };
  
  autoSwitch?: {
    enabled: boolean;         // 自動切り替えの有効/無効
    rules: AutoSwitchRule[];  // 自動切り替えルール
  };
}
```

## トラブルシューティング

### Q: 設定が反映されない
A: 設定ファイルの優先順位を確認してください。ローカル設定がグローバル設定を上書きします。

### Q: エイリアスが動作しない
A: 設定ファイルのJSON構文が正しいか確認してください：
```bash
# 設定ファイルの検証
cat .ccswitchrc | jq .
```

### Q: チームメンバーと設定を共有したい
A: `.ccswitchrc`をGitリポジトリにコミットしてください：
```bash
git add .ccswitchrc
git commit -m "Add team ccswitch configuration"
git push
```

### Q: 設定をリセットしたい
A: 設定ファイルを削除するだけです：
```bash
rm ~/.ccswitchrc      # グローバル設定を削除
rm .ccswitchrc        # ローカル設定を削除
```

## まとめ

設定ファイル機能により、以下が可能になります：

1. **個人の生産性向上**: よく使うブランチにエイリアスを設定
2. **チーム間の標準化**: プロジェクト固有の設定を共有
3. **自動化**: プロジェクトタイプに応じた自動設定
4. **柔軟性**: グローバルとローカルの設定を組み合わせて利用

これらの機能を活用することで、Claude.aiとの開発がより効率的になります。