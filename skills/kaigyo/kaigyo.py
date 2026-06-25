#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
/kaigyo - 日本語改行最適化スキル
不適切な日本語改行を自動検出・修正
"""

import os
import re
import sys
import shutil
import argparse
from pathlib import Path
from typing import List, Dict, Tuple

class KaigyoFixer:
    def __init__(self):
        # 修正が必要な単語パターン（正規表現）
        self.word_patterns = [
            # 技術・ビジネス用語
            r'(シリコンバレー)(研修|開発|企業|投資)',
            r'(Google|Apple|Microsoft|Amazon|Meta)(広告|開発|技術|サービス)',
            r'(AI|DX|IoT|VR|AR)(技術|開発|推進|導入)',

            # 数値・単位
            r'(\d+)(万円|億円|千円|円)',
            r'(\d+)(名|人|時間|日|年)',
            r'(\d+)(％|%)',

            # 専門用語
            r'(マーケティング)(戦略|担当|部門)',
            r'(エンジニア|デザイナー|コンサルタント)(チーム|採用|育成)',
            r'(プロジェクト|プログラム)(管理|運営|開発)',

            # その他よく分割される語句
            r'(ランディング)(ページ)',
            r'(ソーシャル)(メディア)',
            r'(ビジネス)(モデル|戦略|プラン)',
        ]

        self.css_classes = '''
/* 改行制御クラス */
.no-break {
  white-space: nowrap !important;
}

.keep-words {
  word-break: keep-all;
  overflow-wrap: anywhere;
}

.jp-text {
  word-break: keep-all;
  overflow-wrap: anywhere;
  line-break: strict;
}
'''

    def detect_line_break_issues(self, content: str, file_type: str) -> List[Dict]:
        """改行問題を検出"""
        issues = []

        for pattern in self.word_patterns:
            # 改行で分割されているパターンを検索
            split_pattern = pattern.replace(')(', r')[\s\n\r]+(')
            matches = re.finditer(split_pattern, content, re.MULTILINE)

            for match in matches:
                full_match = match.group(0)
                if '\n' in full_match or '\r' in full_match:
                    # 改行を含む場合は問題として記録
                    word = re.sub(r'[\s\n\r]+', '', full_match)
                    issues.append({
                        'original': full_match,
                        'word': word,
                        'position': match.span(),
                        'pattern': pattern
                    })

        return issues

    def fix_html_content(self, content: str, issues: List[Dict]) -> str:
        """HTMLコンテンツの修正"""
        fixed_content = content

        # 後ろから修正して位置ずれを防ぐ
        for issue in sorted(issues, key=lambda x: x['position'][0], reverse=True):
            original = issue['original']
            word = issue['word']

            # <span class="no-break">で囲む
            replacement = f'<span class="no-break">{word}</span>'

            start, end = issue['position']
            fixed_content = (
                fixed_content[:start] +
                replacement +
                fixed_content[end:]
            )

        return fixed_content

    def add_css_classes(self, content: str, file_type: str) -> str:
        """CSSクラスを追加"""
        if file_type == 'html':
            # <style>タグ内にCSSを追加
            style_pattern = r'(<style[^>]*>)(.*?)(</style>)'

            def add_css_to_style(match):
                opening = match.group(1)
                existing_css = match.group(2)
                closing = match.group(3)

                if 'no-break' not in existing_css:
                    return f"{opening}{existing_css}\n{self.css_classes}{closing}"
                return match.group(0)

            # 既存のstyleタグに追加
            if re.search(style_pattern, content, re.DOTALL):
                content = re.sub(style_pattern, add_css_to_style, content, flags=re.DOTALL)
            else:
                # styleタグがない場合は</head>前に追加
                if '</head>' in content:
                    content = content.replace('</head>', f'<style>{self.css_classes}</style>\n</head>')

        elif file_type == 'css':
            # CSSファイルに直接追加
            if 'no-break' not in content:
                content += f"\n{self.css_classes}"

        return content

    def process_file(self, file_path: Path, auto_fix: bool = False, css_only: bool = False, preview: bool = False) -> Dict:
        """ファイルを処理"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            return {'error': f'ファイル読み込みエラー: {e}', 'file': str(file_path)}

        # ファイルタイプを判定
        file_type = self.get_file_type(file_path)

        # 問題を検出
        issues = self.detect_line_break_issues(content, file_type)

        result = {
            'file': str(file_path),
            'file_type': file_type,
            'issues_count': len(issues),
            'issues': issues,
            'fixed': False
        }

        if preview:
            return result

        if issues or css_only:
            # バックアップ作成
            backup_path = file_path.with_suffix(file_path.suffix + '.bak')
            shutil.copy2(file_path, backup_path)

            fixed_content = content

            if not css_only and issues:
                # 改行問題を修正
                if file_type == 'html':
                    fixed_content = self.fix_html_content(fixed_content, issues)

            # CSSクラスを追加
            fixed_content = self.add_css_classes(fixed_content, file_type)

            if auto_fix or self.confirm_fix(file_path, issues):
                try:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(fixed_content)
                    result['fixed'] = True
                    result['backup'] = str(backup_path)
                except Exception as e:
                    result['error'] = f'ファイル書き込みエラー: {e}'
            else:
                # 修正をキャンセルした場合はバックアップを削除
                backup_path.unlink()

        return result

    def get_file_type(self, file_path: Path) -> str:
        """ファイルタイプを判定"""
        suffix = file_path.suffix.lower()

        if suffix in ['.html', '.htm']:
            return 'html'
        elif suffix in ['.css', '.scss', '.sass']:
            return 'css'
        elif suffix in ['.md', '.markdown']:
            return 'markdown'
        elif suffix in ['.vue']:
            return 'vue'
        elif suffix in ['.jsx', '.tsx']:
            return 'react'
        elif suffix in ['.txt']:
            return 'text'
        else:
            return 'unknown'

    def confirm_fix(self, file_path: Path, issues: List[Dict]) -> bool:
        """修正の確認"""
        print(f"\n📁 {file_path.name}")
        print(f"🔍 {len(issues)}個の改行問題を検出しました:")

        for i, issue in enumerate(issues[:5], 1):  # 最初の5個を表示
            print(f"  {i}. {issue['word']} (原文: {repr(issue['original'])})")

        if len(issues) > 5:
            print(f"  ... 他{len(issues) - 5}個")

        response = input("\n修正しますか? [y/N]: ").strip().lower()
        return response in ['y', 'yes', 'はい']

    def process_directory(self, dir_path: Path, recursive: bool = False, **kwargs) -> List[Dict]:
        """ディレクトリを処理"""
        results = []

        pattern = "**/*" if recursive else "*"
        for file_path in dir_path.glob(pattern):
            if file_path.is_file() and self.should_process_file(file_path):
                result = self.process_file(file_path, **kwargs)
                results.append(result)

        return results

    def should_process_file(self, file_path: Path) -> bool:
        """処理対象ファイルかどうか判定"""
        allowed_extensions = {'.html', '.htm', '.css', '.scss', '.sass', '.md', '.vue', '.jsx', '.tsx', '.txt'}
        return file_path.suffix.lower() in allowed_extensions

def main():
    parser = argparse.ArgumentParser(description='日本語改行最適化ツール')
    parser.add_argument('target', help='対象ファイルまたはディレクトリ')
    parser.add_argument('--auto', action='store_true', help='確認なしで自動修正')
    parser.add_argument('--css-only', action='store_true', help='CSSクラスのみ追加')
    parser.add_argument('--preview', action='store_true', help='修正内容をプレビューのみ')
    parser.add_argument('--recursive', action='store_true', help='ディレクトリ内を再帰検索')

    args = parser.parse_args()

    fixer = KaigyoFixer()
    target_path = Path(args.target)

    print("🔧 /kaigyo - 日本語改行最適化スキル")
    print("=" * 50)

    if target_path.is_file():
        result = fixer.process_file(
            target_path,
            auto_fix=args.auto,
            css_only=args.css_only,
            preview=args.preview
        )
        results = [result]
    elif target_path.is_dir():
        results = fixer.process_directory(
            target_path,
            recursive=args.recursive,
            auto_fix=args.auto,
            css_only=args.css_only,
            preview=args.preview
        )
    else:
        print(f"❌ エラー: {target_path} が見つかりません")
        return 1

    # 結果レポート
    total_files = len(results)
    fixed_files = len([r for r in results if r.get('fixed', False)])
    total_issues = sum(r.get('issues_count', 0) for r in results)

    print(f"\n📊 結果レポート")
    print(f"  処理ファイル数: {total_files}")
    print(f"  修正ファイル数: {fixed_files}")
    print(f"  検出問題数: {total_issues}")

    if args.preview:
        print("\n👀 プレビューモード - 実際の修正は行いませんでした")

    for result in results:
        if result.get('error'):
            print(f"❌ {result['file']}: {result['error']}")
        elif result.get('issues_count', 0) > 0:
            status = "✅ 修正完了" if result.get('fixed') else "⚠️ スキップ"
            print(f"{status} {result['file']}: {result['issues_count']}個の問題")

    print("\n🎉 処理完了!")
    return 0

if __name__ == "__main__":
    sys.exit(main())