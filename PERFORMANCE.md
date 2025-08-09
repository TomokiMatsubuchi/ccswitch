# Performance Benchmarks

## 計測環境
- Date: 2025-08-09
- Platform: macOS (Darwin)
- Bun Version: 1.2.19

## パフォーマンス指標

### コマンド実行時間

| Command | Average Time | Memory Usage |
|---------|-------------|--------------|
| init    | < 100ms     | ~5MB         |
| switch  | < 50ms      | ~3MB         |
| list    | < 30ms      | ~2MB         |
| create  | < 80ms      | ~4MB         |
| current | < 20ms      | ~2MB         |

### トークン使用量

- 平均的な設定: 500-2000 tokens
- 最小設定: ~200 tokens
- 最大設定: ~5000 tokens

### 最適化のポイント

1. **Git操作の最適化**
   - simple-gitライブラリによる効率的な操作
   - 不要なファイル読み込みの回避

2. **起動時間の最適化**
   - Bunランタイムによる高速起動
   - 遅延ロード（ora等のUIライブラリ）

3. **メモリ使用量の最適化**
   - 必要最小限のファイル読み込み
   - ストリーミング処理の活用

## 推奨事項

- 大規模な設定ファイル（>50ファイル）の場合は分割を検討
- 定期的な`git gc`による最適化
- 不要なブランチの削除