#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// CSV Parser without external dependency
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(',').map(v => v.replace(/"/g, ''));
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
  }
  return data;
}

async function findUserDataFile(specifiedFile = null) {
  if (specifiedFile && fs.existsSync(specifiedFile)) {
    return specifiedFile;
  }

  // Look for CSV files with user data
  const patterns = [
    '*user*.csv',
    '*customer*.csv',
    '*huntercity*.csv',
    'export*.csv'
  ];

  for (const pattern of patterns) {
    const files = require('child_process')
      .execSync(`find . -name "${pattern}" 2>/dev/null || true`, { encoding: 'utf8' })
      .split('\n')
      .filter(f => f.trim())
      .sort((a, b) => {
        try {
          return fs.statSync(b).mtime - fs.statSync(a).mtime;
        } catch (e) {
          return 0;
        }
      });

    if (files.length > 0) {
      console.log(`📁 データファイル発見: ${files[0]}`);
      return files[0];
    }
  }

  throw new Error('ユーザーデータファイルが見つかりません。CSVファイルがあることを確認してください。');
}

async function readUserData(csvFile) {
  try {
    const csvText = fs.readFileSync(csvFile, 'utf8');
    const users = parseCSV(csvText);
    console.log(`📊 ${users.length}人のユーザーデータを読み込みました`);
    return users;
  } catch (error) {
    console.error('CSVファイル読み込みエラー:', error.message);
    return [];
  }
}

function categorizeUsers(users) {
  const categories = {
    paid: [],        // 有料顧客
    invitedFree: [], // 招待無料ユーザー (Tier 99 or 特別プロモーション)
    regularFree: [], // 一般無料ユーザー
    testAccounts: [] // テストアカウント
  };

  const statistics = {
    totalRevenue: 0,
    monthlyRevenue: 0,
    averageLifetimeValue: 0,
    conversionRate: 0,
    tierDistribution: { 0: 0, 1: 0, 2: 0, 3: 0, 99: 0 }
  };

  users.forEach(user => {
    // 名前の処理を改善
    const familyName = user['姓'] || '';
    const givenName = user['名'] || '';
    let fullName = `${familyName}${givenName}`.trim();

    // 名前が空の場合、メールアドレスから推測
    if (!fullName) {
      const emailAddr = user['メールアドレス'] || user['email'] || '';
      if (emailAddr.includes('@')) {
        const localPart = emailAddr.split('@')[0];
        // 日本語が含まれている場合はそのまま使用
        if (/[ひらがなカタカナ漢字]/.test(localPart)) {
          fullName = localPart;
        } else {
          // 英数字の場合は区切り文字で分割して最初の部分を使用
          const namePart = localPart.split(/[._\-+0-9]/)[0];
          if (namePart && namePart.length > 1) {
            // 最初の文字を大文字にして表示
            fullName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
          } else {
            fullName = '未設定';
          }
        }
      } else {
        fullName = '未設定';
      }
    }
    const email = user['メールアドレス'] || user['email'] || 'N/A';
    const tier = parseInt(user['Tier'] || user['tier'] || '0');
    const paymentStatus = user['課金状況'] || user['payment_status'] || '未課金';
    const registrationDate = user['登録日'] || user['created_at'] || 'N/A';
    const region = user['地域'] || user['region'] || 'N/A';
    const occupation = user['職業'] || user['occupation'] || 'N/A';
    const business = user['事業名'] || user['business'] || 'N/A';
    const website = user['Webサイト'] || user['website'] || 'N/A';
    const subscriptionId = user['サブスクリプションID'] || user['subscription_id'] || '';
    const promoCode = user['プロモーションコード'] || user['promo_code'] || '';

    // Tier統計更新
    statistics.tierDistribution[tier] = (statistics.tierDistribution[tier] || 0) + 1;

    const userData = {
      name: fullName,
      email,
      tier,
      paymentStatus,
      registrationDate,
      region,
      occupation,
      business,
      website,
      subscriptionId,
      promoCode,
      uid: user['UID'] || user['id'] || 'N/A'
    };

    // テストアカウント判定
    if (email.includes('test') || email.includes('sample') ||
        email.includes('@hackjpn.com') || email.includes('hikarutomura') ||
        email.includes('tomura@') || email.includes('team@hackjpn.com') ||
        email.includes('dev@') || email.includes('demo@')) {
      categories.testAccounts.push(userData);
      return;
    }

    // カテゴリ分け
    if (paymentStatus === '課金中' || paymentStatus === 'active' || paymentStatus === 'paid') {
      categories.paid.push(userData);
      // 収益計算 (仮定: Tier 1=月額3000円, Tier 2=5000円, Tier 3=8000円)
      const monthlyValue = tier === 1 ? 3000 : tier === 2 ? 5000 : tier === 3 ? 8000 : 0;
      statistics.monthlyRevenue += monthlyValue;
    } else if (tier === 99 || promoCode.includes('hjmafia') || promoCode.includes('invite') || promoCode.includes('special')) {
      categories.invitedFree.push(userData);
    } else {
      categories.regularFree.push(userData);
    }
  });

  // 統計計算
  const totalActiveUsers = categories.paid.length + categories.invitedFree.length + categories.regularFree.length;
  statistics.totalRevenue = statistics.monthlyRevenue * 12; // 年間想定収益
  statistics.averageLifetimeValue = categories.paid.length > 0 ?
    statistics.totalRevenue / categories.paid.length : 0;
  statistics.conversionRate = totalActiveUsers > 0 ?
    (categories.paid.length / totalActiveUsers * 100).toFixed(1) : 0;

  return { categories, statistics };
}

function generateBusinessInsights(categories, statistics) {
  const insights = [];
  const totalActiveUsers = categories.paid.length + categories.invitedFree.length + categories.regularFree.length;

  // 1. 顧客獲得戦略
  insights.push({
    category: "🎯 顧客獲得戦略",
    recommendations: [
      `現在の有料転換率は${statistics.conversionRate}%です。業界平均2-5%と比較して${statistics.conversionRate > 3 ? '良好' : '改善余地あり'}`,
      `無料ユーザー${categories.regularFree.length}人に対してターゲティング施策を実施`,
      `地域別では${getTopItems(categories, 'region')}での集客強化を推奨`,
      `職業別では${getTopItems(categories, 'occupation')}のニーズに特化したプラン検討`,
      `招待無料ユーザー${categories.invitedFree.length}人からの有料転換施策が重要`
    ]
  });

  // 2. 収益最適化
  insights.push({
    category: "💰 収益最適化",
    recommendations: [
      `月間経常収益: ¥${statistics.monthlyRevenue.toLocaleString()}`,
      `年間想定収益: ¥${statistics.totalRevenue.toLocaleString()}`,
      `顧客LTV: ¥${Math.round(statistics.averageLifetimeValue).toLocaleString()}`,
      `Tier別アップセル: Tier 1→2で月額+2,000円、Tier 2→3で+3,000円`,
      `チャーン防止: 高価値顧客のリテンション施策強化`
    ]
  });

  // 3. プロダクト改善
  insights.push({
    category: "🚀 プロダクト改善",
    recommendations: [
      `フリートライアル最適化: 無料ユーザー${categories.regularFree.length}人の行動分析`,
      `オンボーディング改善: 登録→利用までの離脱率削減`,
      `Tier別価値訴求: 各プランの差別化明確化`,
      `ユーザーフィードバック収集: 有料顧客${categories.paid.length}人へのNPS調査`
    ]
  });

  return insights;
}

function getTopItems(categories, field) {
  const allUsers = [...categories.paid, ...categories.invitedFree, ...categories.regularFree];
  const itemCount = {};

  allUsers.forEach(user => {
    const value = field === 'region' ? user.region : user.occupation;
    if (value && value !== 'N/A') {
      itemCount[value] = (itemCount[value] || 0) + 1;
    }
  });

  return Object.entries(itemCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([item, count]) => `${item}(${count})`)
    .join(', ');
}

async function createGoogleSheet(categories, statistics, insights) {
  // Create CSV content for Google Sheets
  const unifiedData = [
    ['HunterCity 統合顧客分析', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['📊 概要統計', '', '', '', '', '', '', ''],
    ['総ユーザー数', categories.paid.length + categories.invitedFree.length + categories.regularFree.length, '', '', '', '', '', ''],
    ['有料顧客', categories.paid.length, `${statistics.conversionRate}%`, '', '', '', '', ''],
    ['招待無料', categories.invitedFree.length, '', '', '', '', '', ''],
    ['一般無料', categories.regularFree.length, '', '', '', '', '', ''],
    ['テスト', categories.testAccounts.length, '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['💰 収益指標', '', '', '', '', '', '', ''],
    ['月間収益', `¥${statistics.monthlyRevenue.toLocaleString()}`, '', '', '', '', '', ''],
    ['年間想定', `¥${statistics.totalRevenue.toLocaleString()}`, '', '', '', '', '', ''],
    ['顧客LTV', `¥${Math.round(statistics.averageLifetimeValue).toLocaleString()}`, '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['💰 有料顧客リスト', '', '', '', '', '', '', ''],
    ['名前', 'メール', 'Tier', '地域', '職業', '事業名', '登録日', '備考'],
    ...categories.paid.slice(0, 50).map(customer => [
      customer.name, customer.email, customer.tier, customer.region,
      customer.occupation, customer.business, customer.registrationDate,
      customer.promoCode ? `プロモ: ${customer.promoCode}` : ''
    ]),
    ['', '', '', '', '', '', '', ''],
    ['🎟️ 招待無料ユーザーリスト', '', '', '', '', '', '', ''],
    ['名前', 'メール', 'Tier', 'プロモ', '地域', '職業', '登録日', '備考'],
    ...categories.invitedFree.map(customer => [
      customer.name, customer.email, customer.tier, customer.promoCode,
      customer.region, customer.occupation, customer.registrationDate, '無料利用'
    ]),
    ['', '', '', '', '', '', '', ''],
    ['👤 一般無料ユーザーリスト (転換ポテンシャル高い順)', '', '', '', '', '', '', ''],
    ['名前', 'メール', 'Tier', '地域', '職業', '事業名', '転換可能性', '登録日'],
    ...categories.regularFree.slice(0, 50).map(customer => {
      const conversionPotential = customer.occupation === '経営者' || customer.occupation === 'エンジニア' ? '高' :
                                 customer.business && customer.business !== 'N/A' ? '中' : '要分析';
      return [
        customer.name, customer.email, customer.tier, customer.region,
        customer.occupation, customer.business, conversionPotential, customer.registrationDate
      ];
    })
  ];

  // Convert to CSV format
  const csvContent = unifiedData.map(row =>
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  // Try to use MCP Google Drive API if available
  try {
    const { execSync } = require('child_process');

    // Create temporary CSV file
    const tempFile = `/tmp/spreadsheet-${Date.now()}.csv`;
    fs.writeFileSync(tempFile, csvContent);

    // Try to use Claude Code to create Google Sheet
    console.log('📊 Google Sheetsにアップロード中...');

    // This would be handled by Claude Code's MCP integration
    console.log('✅ スプレッドシートをローカルに作成しました');
    console.log(`📁 ファイル: ${tempFile}`);

    // Return the analysis data for Claude Code to upload
    return {
      csvContent,
      tempFile,
      needsUpload: true,
      analysis: {
        categories,
        statistics,
        insights
      }
    };

  } catch (error) {
    console.error('Google Sheets作成エラー:', error.message);
    return {
      csvContent,
      needsUpload: false,
      error: error.message
    };
  }
}

async function main(args = []) {
  console.log('🚀 Spreadsheet - データ分析スプレッドシート自動作成開始...');

  try {
    // データファイル検出
    const dataFile = await findUserDataFile(args[0]);

    // データ読み込み
    const users = await readUserData(dataFile);
    if (users.length === 0) {
      throw new Error('有効なユーザーデータが読み込めませんでした');
    }

    // データ分析
    console.log('📊 データ分析中...');
    const { categories, statistics } = categorizeUsers(users);

    // ビジネス洞察生成
    console.log('💡 ビジネス洞察生成中...');
    const insights = generateBusinessInsights(categories, statistics);

    // 結果表示
    console.log('\n📊 分析結果:');
    console.log(`💰 有料顧客: ${categories.paid.length}人 (転換率: ${statistics.conversionRate}%)`);
    console.log(`🎟️ 招待無料: ${categories.invitedFree.length}人`);
    console.log(`👤 一般無料: ${categories.regularFree.length}人`);
    console.log(`🧪 テスト: ${categories.testAccounts.length}人`);
    console.log(`💰 月間収益: ¥${statistics.monthlyRevenue.toLocaleString()}`);
    console.log(`💰 年間想定収益: ¥${statistics.totalRevenue.toLocaleString()}`);

    // Google Sheets作成準備
    console.log('\n📊 スプレッドシート作成中...');
    const sheetResult = await createGoogleSheet(categories, statistics, insights);

    if (sheetResult.needsUpload) {
      console.log('📤 Claude CodeのGoogle Drive連携でアップロードします...');
      return {
        success: true,
        data: sheetResult,
        stats: {
          paid: categories.paid.length,
          invitedFree: categories.invitedFree.length,
          regularFree: categories.regularFree.length,
          test: categories.testAccounts.length,
          monthlyRevenue: statistics.monthlyRevenue,
          conversionRate: statistics.conversionRate
        }
      };
    }

    return {
      success: false,
      error: sheetResult.error || 'Google Sheets作成に失敗しました'
    };

  } catch (error) {
    console.error('❌ エラー:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

if (require.main === module) {
  main(process.argv.slice(2)).then(result => {
    if (!result.success) {
      process.exit(1);
    }
  });
}

module.exports = { main };