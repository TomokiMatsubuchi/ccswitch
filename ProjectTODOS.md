# ProjectTODOS.md - ccswitch v1.0 リリースまでのロードマップ

## 🎯 プロジェクトゴール
`ccswitch` v1.0 - プロダクションレディなClaude Code設定切り替えツール

## 📊 バージョン計画

### v0.0.1 - 開発準備（✅ 完了）
**目標**: プロジェクト基盤とTDD環境の確立
- [x] プロジェクト初期化（Bun init）
- [x] ドキュメント整備（ProjectTODOS.md, CLAUDE.md）
- [x] GitStrategy.md要件分析（docs/REQUIREMENTS.md作成）
- [x] TDD環境セットアップ（Bun test動作確認済み）
- [x] プロジェクト構造設計（src/, test/, docs/作成済み）
- [x] 最小限の依存関係インストール（commander, simple-git, chalk）

### v0.1.0 - 最小限のcurrent機能（✅ 完了）
**目標**: currentコマンドのみ動作する最小バージョン
- [x] テスト環境の動作確認
- [x] getCurrentBranch関数のTDD実装
- [x] currentコマンドのTDD実装
- [x] CLIエントリーポイント作成
- [x] ローカル動作確認

### v0.2.0 - 基本3コマンド（✅ 完了）
**目標**: switch, list, currentの基本動作
- [x] ~/.claudeがGit管理されていない場合の親切なエラーメッセージ
- [x] initコマンドへの誘導メッセージ
- [x] getBranches関数のTDD実装
- [x] switchBranch関数のTDD実装
- [x] listコマンドのTDD実装
- [x] switchコマンドのTDD実装（基本機能）
- [x] エラーハンドリング基礎

### v0.3.0 - 設定管理とinit（✅ 完了）
**目標**: ~/.claude管理の基本機能
- [x] initコマンド - Git初期化
- [x] 設定ファイル管理機能
- [x] バックアップ機能（基本）
- [x] createコマンド - ブランチ作成

### v0.4.0 - UX改善（✅ 完了）
**目標**: 使いやすさの向上
- [x] カラー出力（chalk）
- [x] プログレス表示（ora）
- [x] インタラクティブモード（inquirer）
- [x] ヘルプメッセージ改善

### v0.5.0 - パフォーマンステスト（✅ 完了）
**目標**: GitStrategy.mdのtest機能実装
- [x] testコマンド実装
- [x] トークン数計測機能
- [x] パフォーマンス測定
- [x] 設定検証機能

### v0.6.0 - 自動化基礎（✅ 完了）
**目標**: プロジェクト検出の基本実装
- [x] autoコマンド（基本版）
- [x] プロジェクトタイプ検出（package.json, Gemfile等）
- [x] 自動切り替え機能

### v0.7.0 - 設定ファイル
**目標**: 設定の永続化と共有
- [x] .ccswitchrc設定ファイル
- [x] プリセット機能
- [x] グローバル/ローカル設定

### v0.8.0 - フック機能
**目標**: 拡張性の実装
- [x] pre-switchフック
- [x] post-switchフック
- [x] カスタムスクリプト実行
**注記**: 実装完了。ただし、この機能の実用性については要検討

### v0.9.0 - 品質保証
**目標**: プロダクション品質達成
- [ ] 包括的なユニットテスト（カバレッジ80%以上）
- [ ] E2Eテスト
- [ ] パフォーマンス最適化
- [ ] クロスプラットフォーム対応

### v0.10.0 - RC (Release Candidate)
**目標**: リリース準備完了
- [ ] npm パッケージ設定
- [ ] CI/CD（GitHub Actions）
- [ ] セキュリティ監査
- [ ] ドキュメント完成
  - [ ] README.md作成（インストール、基本使用法）
  - [ ] autoコマンドの使用例とベストプラクティス
  - [ ] プロジェクトタイプ別の推奨設定例
  - [ ] 設定ブランチの作成ガイド
- [ ] ベータテスト

### v1.0.0 - 正式リリース
**目標**: npm公開とコミュニティ展開
- [ ] npm publish
- [ ] GitHub Release
- [ ] ドキュメントサイト
- [ ] アナウンス

### v1.0.1 - 設定改善
**目標**: 設定機能の実用性向上
- [ ] 設定ファイルで定義されたブランチの自動作成機能
  - [ ] プリセットで定義されたブランチが存在しない場合に自動作成
  - [ ] エイリアスで参照されているブランチの存在確認と作成オプション
  - [ ] `ccswitch init --from-config`コマンドで設定から一括ブランチ作成
- [ ] 設定の検証機能
  - [ ] 存在しないブランチへの参照を警告
  - [ ] 設定ファイルのバリデーション強化

## 🏃 現在の進捗

### 現在のバージョン: v0.7.0 (準備中)
**フォーカス**: 設定ファイル

#### 次の目標（v0.7.0）
1. .ccswitchrc設定ファイル
2. プリセット機能
3. グローバル/ローカル設定

#### 実装順序（TDD方式）
1. **テスト環境構築** (STEP 1-3)
   - Bunテストランナー設定
   - テストディレクトリ構造作成 (test/, test/unit/, test/integration/)
   - package.jsonにテストスクリプト追加

2. **基盤構築（TDDサイクル）** (STEP 4-7)
   - ディレクトリ構造作成
   - 依存関係インストール
   - 型定義ファイル作成
   - Git基本関数実装（各関数でRED→GREEN→REFACTOR）
     - getCurrentBranch
     - getBranches
     - switchBranch

3. **CLIフレームワーク（TDDサイクル）** (STEP 8-9)
   - エントリーポイント作成（テストファースト）
   - Commander設定（テストファースト）

4. **コマンド実装（TDDサイクル）** (STEP 10-12)
   - current（RED→GREEN→REFACTOR）
   - list（RED→GREEN→REFACTOR）
   - switch（RED→GREEN→REFACTOR）

5. **動作確認** (STEP 13-15)
   - ローカルテスト
   - npm link確認
   - テストカバレッジ確認（>80%目標）

#### 次のアクション
→ テスト環境構築から開始（TDDの基盤作り）

## 📝 開発原則

### 開発手法
- **TDD (Test-Driven Development)**: t-wada流のTDDを厳守
  - RED: 失敗するテストを書く
  - GREEN: テストを通す最小限の実装
  - REFACTOR: コードを改善
- **テストファースト**: 実装前に必ずテストを書く
- **小さなサイクル**: 一度に一つの振る舞いのみ実装

### 技術的制約
- **Bun for development**: 開発時の高速性（テストランナーも含む）
- **Node.js compatible**: npm配布のための互換性
- **TypeScript**: 型安全性の確保
- **No Bun-specific APIs**: Node.js標準APIのみ使用

### パフォーマンス目標
- 起動時間: <30ms
- ブランチ切り替え: <100ms
- メモリ使用量: <50MB
- ファイルサイズ: <10MB (bundled)

### 品質基準
- テストカバレッジ: >80%
- TypeScript strict mode
- ESLint/Prettier準拠
- コミット規約: Conventional Commits

## 🔄 更新履歴

### 2025-01-09
- ProjectTODOS.md 作成
- v1.0までのロードマップ策定
- v0.0.1 開発準備フェーズ完了
  - GitStrategy.md要件分析完了
  - TDD環境構築完了
  - プロジェクト基本構造完成
  - 依存関係インストール完了
- v0.1.0 開発完了
  - currentコマンド実装
- v0.2.0 開発完了
  - list, switchコマンド実装
  - エラーハンドリング改善
- v0.3.0 開発完了
  - init, createコマンド実装
  - 設定ファイル管理機能
  - バックアップ機能（基本）
- v0.4.0 開発完了
  - ora, @inquirer/prompts, chalk導入
  - インタラクティブモード実装
  - ヘルプメッセージ改善
- v0.5.0 開発完了
  - testコマンド実装
  - トークン数計測機能
  - パフォーマンス測定機能
  - 設定検証機能
- v0.6.0 開発完了
  - autoコマンド実装
  - プロジェクトタイプ検出（13種類のプロジェクトタイプ対応）
  - 自動ブランチ切り替え機能

## 📌 重要な決定事項

### ツール名
- **名前**: ccswitch (Claude Code Switch)
- **npm パッケージ名**: ccswitch (予定)
- **実行コマンド**: ccswitch

### ブランチ命名規則（GitStrategy.mdより）
- `slim/*` - 最小構成
- `project/*` - プロジェクト特化
- `client/*` - クライアント特化
- `persona/*` - ペルソナ重視
- `experimental/*` - 実験的設定

### サポート対象
- macOS, Linux, Windows (WSL)
- Node.js 18+
- Git 2.0+

## 🤝 コントリビューション

現在はプライベート開発中。v1.0リリース後にオープンソース化を検討。

## 📚 関連ドキュメント

- [GitStrategy.md](~/.claude/GitStrategy.md) - 全体戦略
- [CLAUDE.md](./CLAUDE.md) - 開発環境設定
- [README.md](./README.md) - プロジェクト説明

---

*このドキュメントは ccswitch プロジェクトのマスタープランです。*
*細かな作業タスクは TodoWrite で管理されます。*
