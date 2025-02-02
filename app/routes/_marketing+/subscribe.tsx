import { type MetaFunction } from "react-router";
import {
  HeroHighlight,
  HeroHighlightH1,
  HeroHighlightDescription,
} from "#app/components/highlight";
import { LineGlow } from "#app/components/line-glow";
import { Newsletter } from "#app/components/newsletter";

export const meta: MetaFunction = () => [
  {
    title: "Subscribe to my newsletter | Arpit Dalal",
  },
];

export default function Subscribe() {
  return (
    <>
      <HeroHighlight className="pt-24">
        <div className="flex flex-col items-center justify-between gap-6">
          <HeroHighlightH1>
            <span className="first-letter:text-primary">Subscribe</span>
            <span>to my newsletter</span>
          </HeroHighlightH1>
          <HeroHighlightDescription>
            Get the latest updates from me directly to your inbox, no spam.
          </HeroHighlightDescription>
        </div>
      </HeroHighlight>
      <section id="subscribe">
        <LineGlow />
        <div className="container flex items-center justify-center">
          <Newsletter autoFocusInput />
        </div>
      </section>
    </>
  );
}
