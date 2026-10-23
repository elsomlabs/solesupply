import styles from "./InfoPage.module.css";

export type InfoSection = {
  heading: string;
  paragraphs?: string[];
  steps?: string[];
};

export function InfoPage({
  title,
  lede,
  sections,
}: {
  title: string;
  lede: string;
  sections: InfoSection[];
}) {
  return (
    <main className={styles.page}>
      <h1>{title}</h1>
      <p className={styles.lede}>{lede}</p>
      {sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {section.steps ? (
            <ol>
              {section.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          ) : null}
        </section>
      ))}
    </main>
  );
}
