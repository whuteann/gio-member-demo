import type { ReactNode } from "react";
import {
  BIRTHDAY_NUMBER_TRAITS,
  LIFE_PATH_CAREERS,
  TALENT_NUMBER_TRAITS,
  birthdayNumber,
  lifePathNumber,
  talentNumber,
} from "@/lib/blueprints";
import Card from "@/components/ui/Card";

/** Splits a "🌍 You thrive on..." bullet into its emoji and the rest of the
 * sentence, so the emoji can be marked decorative for screen readers while
 * the actual text remains the readable content — matching how the rest of
 * the app pairs an icon with text (see FOCUS_COLOUR_REASON usages). */
export function TraitRow({ trait }: { trait: string }) {
  const spaceIndex = trait.indexOf(" ");
  const icon = spaceIndex === -1 ? trait : trait.slice(0, spaceIndex);
  const text = spaceIndex === -1 ? "" : trait.slice(spaceIndex + 1);
  return (
    <li className="flex items-start gap-2 text-sm leading-relaxed text-foreground-muted">
      <span aria-hidden className="shrink-0">{icon}</span>
      <span>{text}</span>
    </li>
  );
}

function NumberBadge({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-display text-xl font-bold text-primary"
      style={{ background: "color-mix(in srgb, var(--color-gold) 20%, white)" }}
    >
      {children}
    </div>
  );
}

/**
 * Three supplementary "numerology" cards derived from a member's birthdate —
 * Birthday Number, Life Path Number and Talent Number — appended below the
 * existing Core Personality reveal (onboarding and the Core Personality
 * page share this exact component so the two never drift apart). The
 * numbers themselves are a deterministic stand-in for a real derivation
 * (see lib/blueprints.ts), consistent with how the rest of the app
 * simulates AI-generated content.
 */
export default function NumerologySection({ birthdate }: { birthdate: string }) {
  const birthday = birthdayNumber(birthdate);
  const lifePath = lifePathNumber(birthdate);
  const talent = talentNumber(birthdate);
  const birthdayTraits = BIRTHDAY_NUMBER_TRAITS[birthday];
  const careers = LIFE_PATH_CAREERS[lifePath];
  const talentTraits = TALENT_NUMBER_TRAITS[talent.reduced];

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <p className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-accent">More about you</p>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Card id="numerology-birthday" className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <NumberBadge>{birthday}</NumberBadge>
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">Birthday Number</h3>
            <p className="text-xs text-foreground-muted">From the day you were born</p>
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">☀️ Light</p>
          <ul className="flex flex-col gap-2">
            {birthdayTraits.light.map((trait) => (
              <TraitRow key={trait} trait={trait} />
            ))}
          </ul>
        </div>
        <div className="rounded-2xl p-3" style={{ background: "color-mix(in srgb, var(--color-danger) 8%, white)" }}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-danger">🌑 Dark</p>
          <ul className="flex flex-col gap-2">
            {birthdayTraits.dark.map((trait) => (
              <TraitRow key={trait} trait={trait} />
            ))}
          </ul>
        </div>
      </Card>

      <Card id="numerology-lifepath" className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <NumberBadge>{lifePath}</NumberBadge>
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">Life Path Number</h3>
            <p className="text-xs text-foreground-muted">From your full birthdate</p>
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">🧭 Suitable Career Fields</p>
          <ul className="flex flex-col gap-2">
            {careers.map((trait) => (
              <TraitRow key={trait} trait={trait} />
            ))}
          </ul>
        </div>
      </Card>

      <Card id="numerology-talent" className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <NumberBadge>
            <span className="text-sm font-bold">{talent.raw} → {talent.reduced}</span>
          </NumberBadge>
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">Talent Number</h3>
            <p className="text-xs text-foreground-muted">Raw sum, reduced</p>
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">🛠️ Potential Abilities</p>
          <ul className="flex flex-col gap-2">
            {talentTraits.abilities.map((trait) => (
              <TraitRow key={trait} trait={trait} />
            ))}
          </ul>
        </div>
        <div className="rounded-2xl p-3" style={{ background: "color-mix(in srgb, var(--color-danger) 8%, white)" }}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-danger">⚠️ Potential Weaknesses</p>
          <ul className="flex flex-col gap-2">
            {talentTraits.weaknesses.map((trait) => (
              <TraitRow key={trait} trait={trait} />
            ))}
          </ul>
        </div>
      </Card>
    </>
  );
}
