import Link from "next/link";

export function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <Link className="brand" href="/ja">
          hackjpn <span>Skills</span>
        </Link>
        <nav className="nav">
          <Link href="/ja">ホーム</Link>
          <Link href="/ja/skills">スキル一覧</Link>
          <a href="https://github.com/hackjpnteam/claude-ai-skills" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
