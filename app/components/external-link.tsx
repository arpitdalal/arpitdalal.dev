import { cn } from "#app/utils/misc";
import { Icon } from "./ui/icon";

interface ExternalLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
  applyBaseClassName?: boolean;
  showIcon?: boolean;
}

const baseClassName =
  "ring-offset-background transition-colors outline-none focus-visible:ring-2 focus-within:ring-2 ring-ring ring-offset-2 inline-block";
const showIconClassName = "group/link";
export default function ExternalLink({
  href,
  children,
  className = "underlined text-foreground/70",
  applyBaseClassName = true,
  showIcon = true,
  ...props
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        applyBaseClassName && baseClassName,
        showIcon && showIconClassName,
        className,
      )}
      target="_blank"
      rel="noreferrer"
      data-content={children}
      {...props}
    >
      {children}
      {showIcon && (
        <Icon
          name="arrow-up-right-outline"
          className="ml-1 ease-in-out motion-safe:translate-y-px motion-safe:transition-transform motion-safe:group-hover/link:-translate-y-1 motion-safe:group-hover/link:translate-x-1 motion-safe:group-focus-visible/link:-translate-y-1 motion-safe:group-focus-visible/link:translate-x-1"
          aria-hidden
        />
      )}
    </a>
  );
}
