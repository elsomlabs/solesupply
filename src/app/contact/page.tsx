import type { Metadata } from "next";
import layout from "@/components/info/InfoPage.module.css";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Sell with us | Sole Supply",
  description:
    "Sell sneakers and streetwear through Sole Supply. Send photos, we reply from London, check every item by hand, and pay you after it sells.",
};

type SellerGroup = "Get in touch" | "Send it in" | "We check and list";

type SellerStep = {
  number: number;
  group: SellerGroup;
  text: string;
};

const STEPS: SellerStep[] = [
  {
    number: 1,
    group: "Get in touch",
    text: "Photograph the item in daylight. Include the front, the back, the sole or the label, and any marks or wear.",
  },
  {
    number: 2,
    group: "Get in touch",
    text: "Tell us the size, the condition, and the price you want. Name the brand exactly as it appears on the item.",
  },
  {
    number: 3,
    group: "Get in touch",
    text: "Send that to hello@solesupply.co.uk with the subject “Sell with Sole Supply”.",
  },
  {
    number: 4,
    group: "Send it in",
    text: "We reply from London and say whether we can take it, and at what price.",
  },
  {
    number: 5,
    group: "Send it in",
    text: "If we agree, send the item to the London desk. We tell you the address and cover the UK postage once it is accepted.",
  },
  {
    number: 6,
    group: "We check and list",
    text: "We check it by hand. If it is not right, it does not go on the site and we send it back.",
  },
  {
    number: 7,
    group: "We check and list",
    text: "When it passes, it is listed. You are paid after it sells, at the price we agreed.",
  },
];

const GROUPS: SellerGroup[] = ["Get in touch", "Send it in", "We check and list"];

const PHOTO_CHECKLIST = ["Front", "Back", "Sole or label", "Any marks or wear", "In daylight"] as const;

const TAKE = [
  "Sneakers and streetwear we can authenticate. The item should be unworn, or the wear should be obvious in the photos.",
  "We only arrange collection and postage inside the United Kingdom.",
] as const;

const FACTS = [
  "The desk is in London",
  "Every item is checked by hand",
  "UK collection and postage only",
  "Paid after it sells, at the price we agreed",
] as const;

type SellerQuestion = {
  question: string;
  answer: string;
};

const QUESTIONS: SellerQuestion[] = [
  {
    question: "Where is the desk?",
    answer: "The desk is in London.",
  },
  {
    question: "What do you take?",
    answer:
      "Sneakers and streetwear we can authenticate. The item should be unworn, or the wear should be obvious in the photos.",
  },
  {
    question: "Can I sell from outside the UK?",
    answer: "No. We only arrange collection and postage inside the United Kingdom.",
  },
  {
    question: "What if my item does not pass the check?",
    answer: "If it is not right, it does not go on the site and we send it back.",
  },
  {
    question: "When do I get paid?",
    answer: "You are paid after it sells, at the price we agreed.",
  },
  {
    question: "Who pays for postage?",
    answer:
      "If we agree, you send the item to the London desk. We tell you the address and cover the UK postage once it is accepted.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: QUESTIONS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const SELL_EMAIL = "hello@solesupply.co.uk";
const SELL_SUBJECT = "Sell with Sole Supply";
const SELL_BODY =
  "Brand:\nItem:\nSize:\nCondition:\nPrice I want:\n\n(Attach your photos: front, back, sole or label, any marks or wear.)";
const SELL_MAILTO = `mailto:${SELL_EMAIL}?subject=${encodeURIComponent(SELL_SUBJECT)}&body=${encodeURIComponent(SELL_BODY)}`;

function EmailButton() {
  return (
    <a className={styles.button} href={SELL_MAILTO}>
      Email the London desk
    </a>
  );
}

export default function ContactPage() {
  return (
    <main className={`${layout.page} ${styles.seller}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <h1 className={styles.title}>Sell with us</h1>
      <p className={`${layout.lede} ${styles.lede}`}>
        Sole Supply works with people who want to sell sneakers and streetwear. The desk is in London, and every item is
        checked before it is listed.
      </p>
      <aside className={styles.card}>
        <p className={styles.glance}>At a glance</p>
        <ul className={styles.facts}>
          {FACTS.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
        <EmailButton />
        <p className={styles.address}>{SELL_EMAIL}</p>
      </aside>
      <div className={styles.rest}>
      <section>
        <h2 className={styles.heading}>How to become a seller</h2>
        {GROUPS.map((group) => {
          const steps = STEPS.filter((step) => step.group === group);
          return (
            <div key={group}>
              <h3 className={styles.group}>{group}</h3>
              <ol className={styles.steps} start={steps[0].number}>
                {steps.map((step) => (
                  <li key={step.number} className={styles.step}>
                    <span className={styles.num} aria-hidden="true">
                      {step.number}
                    </span>
                    <div>
                      <p>
                        {step.number === 3 ? (
                          <>
                            {step.text.slice(0, step.text.indexOf(SELL_EMAIL))}
                            <a className={styles.mail} href={SELL_MAILTO}>
                              {SELL_EMAIL}
                            </a>
                            {step.text.slice(step.text.indexOf(SELL_EMAIL) + SELL_EMAIL.length)}
                          </>
                        ) : (
                          step.text
                        )}
                      </p>
                      {step.number === 1 ? (
                        <ul className={styles.checks}>
                          {PHOTO_CHECKLIST.map((item) => (
                            <li key={item} className={styles.chip}>
                              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                <path d="M3.5 8.5l3 3 6-6.5" />
                              </svg>
                              {item}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </section>
      <section>
        <h2 className={styles.heading}>What we take</h2>
        {TAKE.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>
      <section className={styles.faq} aria-labelledby="common-questions">
        <h2 id="common-questions" className={styles.heading}>
          Common questions
        </h2>
        {QUESTIONS.map((item) => (
          <details key={item.question} className={styles.item}>
            <summary className={styles.summary}>
              <span>{item.question}</span>
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </section>
      <div className={styles.end}>
        <EmailButton />
      </div>
      </div>
    </main>
  );
}
