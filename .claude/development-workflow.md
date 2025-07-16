# 開発タスクワークフロー

このドキュメントは、yuhakuプロジェクトにおける開発タスクの標準的なワークフローを定義します。

## 📋 タスク管理

### TodoList活用の原則

- 複雑なタスク（3ステップ以上）は必ずTodoWriteツールで管理
- 1つのタスクを`in_progress`にしてから作業開始
- 完了したら即座に`completed`にマーク
- 新たな課題が見つかったら新規タスクとして追加

### タスク管理が必要な場面

1. 複数ステップの機能実装
2. バグ修正と関連テスト
3. リファクタリング作業
4. 調査・探索タスク

## 🔍 調査・探索フェーズ

### 1. 外部パッケージ・ライブラリの調査

**使用ツール**: gitingest（GitHub URLの'hub'を'ingest'に置換）

```bash
# 例: React Hook Formの実装を調査
https://gitingest.com/react-hook-form/react-hook-form

# 例: SWRの内部実装を理解
https://gitingest.com/vercel/swr

# GitHub URLから変換する場合
# https://github.com/vercel/swr → https://gitingest.com/vercel/swr
```

**活用場面**:

- NPMパッケージの内部実装理解
- ベストプラクティスの学習
- トラブルシューティング（issuesやソースコード確認）
- 型定義の詳細確認

### 2. フレームワーク・言語ドキュメントの参照

**使用ツール**: Context7 MCP (`mcp__context7__`)

```typescript
// 1. ライブラリIDの解決
await mcp__context7__resolve-library-id({ 
  libraryName: "next.js" 
})

// 2. ドキュメント取得
await mcp__context7__get-library-docs({
  context7CompatibleLibraryID: "/vercel/next.js",
  topic: "app-router", // 特定トピックに絞る
  tokens: 10000
})
```

**活用場面**:

- 公式ドキュメントの参照
- API仕様の確認
- フレームワーク固有の実装パターン学習
- バージョン別の差異確認

### 3. 調査ワークフローの実行手順

1. **調査目的の明確化**
   - 何を実装/解決しようとしているか
   - どんな情報が必要か

2. **情報源の選択**

   ```
   フレームワーク/言語の公式仕様 → Context7 MCP
   サードパーティライブラリ → gitingest.com
   プロジェクト内の既存実装 → Grep/Glob/Task
   ```

3. **並行調査の実施**
   - 複数の情報源を同時に調査
   - TodoWriteで調査項目を管理

4. **調査結果の記録**
   - @.claude/project-knowledge.mdに追記
   - 実装パターンは@.claude/common-patterns.mdに追加

## 💻 実装フェーズ

### 1. 実装前の確認事項

- [ ] 既存コードの命名規則・スタイルを確認
- [ ] 利用可能なライブラリを package.json で確認
- [ ] 類似機能の実装パターンを調査

### 2. 実装の手順

1. **設計の確認**
   - API設計原則に従う（READ: API Routes、CUD: Server Actions）
   - 型定義を先に作成
   - ファイル構造の確認（1ファイル1関数）

2. **コーディング**
   - 既存のパターンに従う
   - `any`型は使用禁止
   - エラーハンドリングを適切に実装

3. **動作確認**
   - 開発サーバーで動作確認
   - Playwright MCPでE2Eテスト

## ✅ 品質保証フェーズ

### コミット前チェックリスト

1. [ ] `npm run lint` - エラーなし
2. [ ] `npm run typecheck` - エラーなし  
3. [ ] `npm run build` - ビルド成功
4. [ ] Playwright mcpでの動作確認

### エラー対応

- リント/型エラーは必ず修正
- ビルドエラーは原因を特定して修正
- テスト失敗は該当箇所を修正

## 🚀 開発サーバー管理

### 起動前の必須確認

```bash
# 1. ポートが使用中でないか確認
lsof -i :3000
lsof -i :3001

# 2. 既存のnext devプロセスを確認
ps aux | grep -E "node.*dev|npm run dev|next dev" | grep -v grep

# 3. 既存プロセスがある場合は停止
lsof -ti :3000 | xargs -r kill -9
lsof -ti :3001 | xargs -r kill -9
```

### 管理ルール

- **最重要**: 開発サーバーを起動する前に、必ず既存のプロセスを確認・停止
- バックグラウンドで起動した場合は、作業終了後に必ず停止
- テスト用サーバーは必ず終了確認

## 📝 ドキュメント更新

### 更新が必要な場面

- 新しい実装パターンを確立した時
- トラブルシューティング情報を得た時
- プロジェクト構造に変更があった時

### 更新対象

- `.claude/project-knowledge.md` - 技術的な知見
- `.claude/common-patterns.md` - コードパターン
- `.claude/project-improvements.md` - 改善履歴
- `CLAUDE.md` - 基本的なルールや設定

## 🔄 典型的なワークフロー例

### 新機能実装

```
1. TodoWriteで実装タスクを作成
2. 関連ドキュメントを調査（Context7/gitingest）
3. 既存実装パターンを確認（Grep/Read）
4. 型定義・スキーマを作成
5. Server Action/API Routeを実装
6. UIコンポーネントを実装
7. 動作確認（Playwright）
8. リント・型チェック・ビルド確認
9. ドキュメント更新
```

### バグ修正

```
1. TodoWriteでバグ修正タスクを作成
2. エラーログ・現象を確認
3. 関連コードを調査（Grep/Read）
4. 原因を特定
5. 修正を実装
6. テストで動作確認
7. リグレッションテスト
8. project-knowledge.mdに知見を追加
```

## ⚠️ 注意事項

### gitingestの使用方法

**重要**: gitingestは直接アクセスするのではなく、WebFetchツールを使用して取得します。

```typescript
// 正しい使用方法
WebFetch({
  url: "https://gitingest.com/owner/repository",
  prompt: "Extract [specific information you need]"
})

// URLの変換方法
// GitHub: https://github.com/vercel/swr
// gitingest: https://gitingest.com/vercel/swr
```

**制限事項**:
- 50KB以下のリポジトリのみサポート
- プライベートリポジトリにはGitHubトークンが必要
- 大規模リポジトリでは応答が遅い場合がある

### 調査例

#### 例1: 新しい状態管理ライブラリの導入検討
```typescript
// 1. Zustandの実装を調査
WebFetch({ 
  url: "https://gitingest.com/pmndrs/zustand",
  prompt: "Extract the core implementation patterns, state management approach, and API design"
})

// 2. React公式の状態管理ガイドを確認
mcp__context7__resolve-library-id({ libraryName: "react" })
mcp__context7__get-library-docs({ 
  context7CompatibleLibraryID: "/facebook/react",
  topic: "state-management"
})

// 3. 既存プロジェクトでの状態管理パターンを確認
Grep({ pattern: "useState|useReducer|Context", path: "src" })
```

#### 例2: Next.js App Routerの新機能調査
```typescript
// 1. Next.js公式ドキュメント
mcp__context7__get-library-docs({
  context7CompatibleLibraryID: "/vercel/next.js",
  topic: "parallel-routes"
})

// 2. 実装例の調査
WebFetch({
  url: "https://gitingest.com/vercel/next.js",
  prompt: "Find examples of parallel routes implementation in the examples directory"
})
```

### 調査ツールの制限

- gitingest: 50KB以下のリポジトリ制限、WebFetch経由でのみアクセス
- Context7 MCP: 公式ドキュメントベース（実装詳細は含まれない）
- 両ツールで得られない情報はWebSearch/WebFetchを併用

### Playwright MCPの制限

- Dockerコンテナ内で動作するため、localhost接続に制限
- `172.17.0.1:3000` または `host.docker.internal:3000` を使用
- ページクラッシュ時はブラウザを再起動

### パフォーマンス考慮

- 大量のファイル読み込みは避ける
- 並行処理可能なツールは同時実行
- キャッシュを適切に活用（SWR、API Route）

