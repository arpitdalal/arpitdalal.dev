import { Link } from "@remix-run/react";
import { ClientOnly } from "remix-utils/client-only";
import ExternalLink from "#app/components/external-link";
import {
  HeroHighlight,
  HeroHighlightDescription,
  HighlightUnderline,
  HeroHighlightH1,
} from "#app/components/highlight";
import Projects from "#app/components/projects";
import { Button } from "#app/components/ui/button";
import { Icon } from "#app/components/ui/icon";
import { WorkExperience } from "#app/components/work-experience";
import {
  projects,
  socialLinks,
  workExperience,
} from "#app/routes/_marketing+/__data";

export default function Layout() {
  return (
    <>
      <HeroHighlight className="pt-24">
        <div className="flex flex-col items-center justify-between gap-6">
          <HeroHighlightH1 subtitle="Hello there, I'm">
            <span className="flex flex-wrap space-x-5 font-bold">
              <span className="first-letter:text-primary">Arpit</span>
              <span className="first-letter:text-primary">Dalal</span>
            </span>
          </HeroHighlightH1>
          <HeroHighlightDescription>
            I'm a <HighlightUnderline>software engineer</HighlightUnderline> and
            a <HighlightUnderline>full-stack developer</HighlightUnderline>{" "}
            living in the Greater Toronto Area. I have a passion for building
            web applications and have a strong background in{" "}
            <HighlightUnderline>front-end development</HighlightUnderline>.
          </HeroHighlightDescription>
          <div className="flex gap-5 [--slidein-delay:500ms] motion-safe:animate-slidein motion-safe:opacity-0">
            <Button variant="outline" asChild>
              <Link to="contact">Contact me</Link>
            </Button>
            <Button asChild>
              <Link
                to="/resume.pdf"
                className="group/resume flex gap-2"
                download="arpit-dalal-resume.pdf"
                reloadDocument
              >
                <span>Resume</span>
                <Icon
                  name="download-outline"
                  className="size-4 motion-safe:group-hover/resume:animate-bounce-down"
                />
              </Link>
            </Button>
          </div>
          <div className="mt-2 flex gap-5 [--slidein-delay:700ms] motion-safe:animate-slidein motion-safe:opacity-0">
            {socialLinks.map(({ href, name, icon }) => (
              <Button
                key={href}
                variant="outline"
                size="icon"
                className="rounded-full"
                asChild
              >
                <ExternalLink href={href} aria-label={name}>
                  <Icon name={icon} className="size-4" />
                </ExternalLink>
              </Button>
            ))}
          </div>
        </div>
      </HeroHighlight>
      <ClientOnly
        fallback={
          <WorkExperience workExperience={workExperience} jsEnabled={false} />
        }
      >
        {() => <WorkExperience workExperience={workExperience} jsEnabled />}
      </ClientOnly>
      <ClientOnly fallback={<Projects projects={projects} jsEnabled={false} />}>
        {() => <Projects projects={projects} jsEnabled />}
      </ClientOnly>
    </>
  );
}
