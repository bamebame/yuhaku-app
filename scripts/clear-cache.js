#!/usr/bin/env node

/**
 * キャッシュをクリアするスクリプト
 * 環境を切り替えた後に実行してください
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs').promises;

const execAsync = promisify(exec);

async function clearCache() {
  console.log('🧹 キャッシュのクリアを開始します...\n');

  try {
    // 1. Next.js ビルドキャッシュを削除
    console.log('1. Next.js ビルドキャッシュを削除中...');
    const nextCachePath = path.join(__dirname, '..', '.next');
    try {
      await fs.rm(nextCachePath, { recursive: true, force: true });
      console.log('   ✅ Next.js ビルドキャッシュを削除しました');
    } catch (error) {
      console.log('   ⚠️  Next.js ビルドキャッシュが見つかりません');
    }

    // 2. node_modules キャッシュを削除
    console.log('\n2. node_modules キャッシュを削除中...');
    const nodeModulesCachePath = path.join(__dirname, '..', 'node_modules', '.cache');
    try {
      await fs.rm(nodeModulesCachePath, { recursive: true, force: true });
      console.log('   ✅ node_modules キャッシュを削除しました');
    } catch (error) {
      console.log('   ⚠️  node_modules キャッシュが見つかりません');
    }

    // 3. パッケージマネージャーのキャッシュをクリア
    console.log('\n3. npm キャッシュをクリア中...');
    try {
      await execAsync('npm cache clean --force');
      console.log('   ✅ npm キャッシュをクリアしました');
    } catch (error) {
      console.log('   ⚠️  npm キャッシュのクリアに失敗しました:', error.message);
    }

    // 4. TypeScript ビルドインフォを削除
    console.log('\n4. TypeScript ビルドインフォを削除中...');
    const tsBuildInfoPath = path.join(__dirname, '..', 'tsconfig.tsbuildinfo');
    try {
      await fs.unlink(tsBuildInfoPath);
      console.log('   ✅ TypeScript ビルドインフォを削除しました');
    } catch (error) {
      console.log('   ⚠️  TypeScript ビルドインフォが見つかりません');
    }

    console.log('\n✨ キャッシュのクリアが完了しました！');
    console.log('\n📝 次の手順:');
    console.log('1. ブラウザの開発者ツールを開く (F12)');
    console.log('2. Application タブ → Storage → Clear site data をクリック');
    console.log('3. npm run dev で開発サーバーを再起動');
    console.log('\n⚠️  注意: IndexedDB のキャッシュはブラウザ側で手動でクリアする必要があります');

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプトを実行
clearCache();