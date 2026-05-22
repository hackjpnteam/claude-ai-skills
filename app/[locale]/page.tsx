import Link from "next/link";
import { skills } from "../data";
import { Header } from "../ui";

export default function HomePage() {
  return (
    <div className="shell">
      <Header />
      <main>
        <section className="hero">
          <div className="section hero-grid">
            <div>
              <p className="eyebrow">hackjpn official / free access</p>
              <h1>Claude Codeスキル、全て無料開放。</h1>
              <p className="lead">
                開発・契約・広告・資料・PDF・QA・経理・メッセージ・記憶・テストまで、hackjpnの実務スキルをログイン不要で公開しました。
              </p>
              <div className="actions">
                <Link className="button primary" href="/ja/skills">
                  全スキルを見る
                </Link>
                <a className="button" href="https://github.com/hackjpnteam/claude-ai-skills" target="_blank" rel="noreferrer">
                  GitHubを開く
                </a>
              </div>
            </div>
            <div className="panel">
              <span className="price">¥790,000 → ¥0</span>
              <h2 style={{ marginTop: 18 }}>購入・カート・ログインは不要</h2>
              <p className="lead" style={{ fontSize: 15, marginTop: 12 }}>
                各スキルページで中身を確認し、GitHubからそのまま導入できます。Claude Code、GitHub、Vercelなど外部サービスのアカウントは必要に応じて別途用意してください。
              </p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Skills</p>
              <h2>公開中の10スキル</h2>
            </div>
            <p>これまで販売パッケージに含めていたスキルを、一覧と詳細ページで全公開しています。</p>
          </div>
          <div className="grid">
            {skills.map((skill) => (
              <Link className="card" href={`/ja/skills/${skill.slug}`} key={skill.slug}>
                <span className="cmd">/{skill.slug}</span>
                <h3>{skill.name}</h3>
                <p>{skill.summary}</p>
                <span className="button">中身を見る</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Install</p>
              <h2>導入方法</h2>
            </div>
          </div>
          <div className="steps">
            <div className="step">
              <strong>1. リポジトリ取得</strong>
              <p>GitHubからスキル一式を取得します。</p>
            </div>
            <div className="step">
              <strong>2. Claude設定へ配置</strong>
              <p>必要な `commands` と `skills` を自分の環境にコピーします。</p>
            </div>
            <div className="step">
              <strong>3. Claude Codeで利用</strong>
              <p>`/dev` や `/ad` などのコマンドとして呼び出します。</p>
            </div>
          </div>
          <pre className="code">{`git clone https://github.com/hackjpnteam/claude-ai-skills.git
cd claude-ai-skills
open .`}</pre>
        </section>
      </main>
      <footer className="footer">
        <div className="section" style={{ padding: 0 }}>
          © hackjpn. Claude Code skills are open for public access.
        </div>
      </footer>
    </div>
  );
}
