import { Button } from "#app/components/ui/button";
import { Icon } from "#app/components/ui/icon";
import { type SocialLink } from "#app/routes/_marketing+/__data";
import { cn } from "#app/utils/misc";
import { ExternalLink } from "./external-link";

export function SocialLinks({
  socialLinks,
  className,
}: {
  socialLinks: SocialLink[];
  className?: string;
}) {
  return (
    <div className={cn("flex gap-5", className)}>
      {socialLinks.map(({ href, name, icon }) => (
        <Button
          key={href}
          variant="outline"
          size="icon"
          className="rounded-full"
          asChild
        >
          <ExternalLink
            href={href}
            aria-label={name}
            showIcon={false}
            data-umami-event="social-link"
            data-umami-event-url={href}
          >
            <Icon name={icon} className="size-4" />
          </ExternalLink>
        </Button>
      ))}
    </div>
  );
}
