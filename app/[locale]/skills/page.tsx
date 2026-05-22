import Link from "next/link";
import { skills } from "../../data";
import { Header } from "../../ui";

export default function SkillsPage() {
  return (
    <div className="shell">
      <Header />
      <main className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">All skills</p>
            <h1>全スキル無料公開</h1>
          </div>
          <p>価格表示、購入ボタン、ログイン制限を外し、各スキルの実体ファイルを確認できるようにしました。</p>
        </div>
        <div className="grid">
          {skills.map((skill) => (
            <Link className="card" href={`/ja/skills/${skill.slug}`} key={skill.slug}>
              <span className="cmd">/{skill.slug}</span>
              <h3>{skill.name}</h3>
              <p>{skill.summary}</p>
              <span className="button primary">開く</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
