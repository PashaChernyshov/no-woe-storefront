import type { ReactNode } from "react";

type InfoPageProps = {
  overline: string;
  title: string;
  intro: string;
  children: ReactNode;
};

export default function InfoPage({ overline, title, intro, children }: InfoPageProps) {
  return (
    <div className="info-page">
      <section className="page-hero compact-page-hero">
        <p className="section-kicker">{overline}</p>
        <h1>{title}</h1>
        <p>{intro}</p>
      </section>
      {children}
    </div>
  );
}
