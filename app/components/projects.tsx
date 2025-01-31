import { type Project } from "#app/routes/_marketing+/__data";
import { Card } from "./card";
import { Section } from "./section";

export function Projects({
  projects,
  jsEnabled,
}: {
  projects: Project[];
  jsEnabled: boolean;
}) {
  return (
    <Section id="projects" jsEnabled={jsEnabled} sectionTitle="Projects">
      {projects.map((props) => (
        <Card key={props.title} {...props} />
      ))}
    </Section>
  );
}
