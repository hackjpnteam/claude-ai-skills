import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { skills } from "../../../data";
import { Header } from "../../../ui";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return skills.map((skill) => ({ locale: "ja", slug: skill.slug }));
}

function readSkillFile(skill: (typeof skills)[number]) {
  const filePath = skill.file.startsWith("commands/")
    ? path.join(process.cwd(), "commands", path.basename(skill.file))
    : path.join(process.cwd(), "skills", skill.slug, "SKILL.md");
  if (!fs.existsSync(filePath)) return "このスキルの本文ファイルは準備中です。";
  return fs.readFileSync(filePath, "utf8");
}

export default async function SkillDetailPage({ params }: Props) {
  const { slug } = await params;
  const skill = skills.find((item) => item.slug === slug);
  if (!skill) notFound();

  const body = readSkillFile(skill);

  return (
    <div className="shell">
      <Header />
      <main className="section">
        <Link className="button" href="/ja/skills">
          ← 一覧へ戻る
        </Link>
        <div style={{ marginTop: 28, marginBottom: 24 }}>
          <p className="eyebrow">Free skill</p>
          <h1>/{skill.slug}</h1>
          <p className="lead">{skill.summary}</p>
          <div className="actions">
            <a className="button primary" href={`https://github.com/hackjpnteam/claude-ai-skills/blob/main/${skill.file}`} target="_blank" rel="noreferrer">
              GitHubで開く
            </a>
            <a className="button" href="https://github.com/hackjpnteam/claude-ai-skills" target="_blank" rel="noreferrer">
              全ファイルを取得
            </a>
          </div>
        </div>
        <div className="markdown">
          <pre>{body}</pre>
        </div>
      </main>
    </div>
  );
}
