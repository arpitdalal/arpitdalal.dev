import { useWindowSize } from "@reactuses/core";
import { motion, transform, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import ExternalLink from "#app/components/external-link.js";
import { HighlightUnderline } from "#app/components/highlight.js";
import { Badge } from "#app/components/ui/badge.js";
import { Icon } from "#app/components/ui/icon.js";
import { type Project } from "#app/routes/_marketing+/__data.js";
import { useHints } from "#app/utils/client-hints.js";
import { cn } from "#app/utils/misc.js";
import { H2_STYLES, H2_STYLES_NO_JS_OR_MOTION_SAFE } from "./work-experience";

export default function Projects({
  projects,
  jsEnabled,
}: {
  projects: Project[];
  jsEnabled: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const { width } = useWindowSize();
  const isXSScreen = width < 420;
  const { scrollYProgress: scrollYProgressOfSection } = useScroll({
    target: sectionRef,
    offset: ["start start", "80px start"],
  });
  const { reducedMotion } = useHints();
  const isReducedMotion = reducedMotion === "reduce";

  const h2Left = useTransform(() => {
    if (isReducedMotion || !jsEnabled) return H2_STYLES.LEFT_START;

    return transform(
      scrollYProgressOfSection.get(),
      [0, 1],
      [
        H2_STYLES.LEFT_START,
        isXSScreen ? H2_STYLES.LEFT_END_SMALL_SCREEN : H2_STYLES.LEFT_END,
      ],
    );
  });

  return (
    <section ref={sectionRef} id="projects">
      <div className="relative h-32 overflow-hidden" aria-hidden>
        <div className="absolute -top-[100px] left-0 right-0 h-56 opacity-40 dark:opacity-20">
          <div className="bg-gradient-radial h-36 from-violet-600 blur-2xl"></div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent from-30% via-violet-400 to-transparent to-70% opacity-50 dark:via-violet-600"></div>
      </div>
      <div className="container pb-12">
        <motion.h2
          style={{
            paddingLeft: h2Left,
          }}
          className={cn(
            "sticky top-12 z-40 max-w-fit xs:top-14 sm:top-12",
            (!jsEnabled || isReducedMotion) && H2_STYLES_NO_JS_OR_MOTION_SAFE,
          )}
        >
          <HighlightUnderline>Projects</HighlightUnderline>
        </motion.h2>
        <ol className="group/ol relative mt-8">
          {projects.map((props) => (
            <ProjectCard key={props.title} {...props} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function ProjectCard({
  title,
  link,
  imageUrl,
  imageAlt,
  description,
  technologies,
  githubLink,
  openSource,
}: Project) {
  return (
    <li>
      <article className="group relative grid py-8 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 lg:hover:!opacity-100 lg:group-hover/ol:opacity-50">
        <div
          className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block motion-safe:lg:group-hover:bg-accent/60 motion-safe:lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] motion-safe:lg:group-hover:drop-shadow-lg"
          aria-hidden
        />
        <div className="z-10 mb-2 mt-1 font-semibold uppercase tracking-wide text-foreground/70 sm:col-span-2 sm:pr-3 sm:text-right">
          <img
            src={imageUrl}
            alt={imageAlt}
            className="w-full drop-shadow-2xl"
          />
        </div>
        <div className="z-10 max-sm:mt-4 sm:col-span-6">
          <h3 className="font-medium">
            <ExternalLink
              href={link}
              className="group/link inline-flex items-baseline font-medium leading-tight hover:text-primary focus-visible:text-primary"
              aria-label={`${title} (opens in a new tab)`}
            >
              {/* This is for making the link clickable on the whole card */}
              <span
                className="absolute -inset-x-4 -inset-y-2.5 hidden rounded md:-inset-x-6 md:-inset-y-4 lg:block"
                aria-hidden
              ></span>
              <span>
                {title}
                <span className="inline-block">
                  <Icon
                    name="arrow-up-right-outline"
                    className="ml-1 ease-in-out motion-safe:translate-y-px motion-safe:transition-transform motion-safe:group-hover/link:-translate-y-1 motion-safe:group-hover/link:translate-x-1 motion-safe:group-focus-visible/link:-translate-y-1 motion-safe:group-focus-visible/link:translate-x-1"
                    aria-hidden
                  />
                </span>
              </span>
            </ExternalLink>
          </h3>
          <p className="mt-2 leading-normal">{description}</p>
          {technologies && technologies.length > 0 ? (
            <ul
              className="mt-4 flex flex-wrap gap-2"
              aria-label="Technologies used"
            >
              {technologies.map((technology) => (
                <Badge key={technology}>{technology}</Badge>
              ))}
            </ul>
          ) : null}
        </div>
      </article>
    </li>
  );
}
