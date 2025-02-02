import { useMotionValue, motion, useMotionTemplate } from "motion/react";
import React from "react";
import { cn } from "#app/utils/misc";

export function HeroHighlight({
  children,
  className,
  containerClassName,
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) {
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    if (!currentTarget) return;
    let { left, top } = currentTarget.getBoundingClientRect();

    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <section
      className={cn(
        "group relative flex w-full items-center justify-center py-20",
        containerClassName,
      )}
      onMouseMove={handleMouseMove}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-dot-thick-neutral-300 dark:bg-dot-thick-neutral-800"
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 bg-dot-thick-[#6d28d9] group-hover:opacity-100 dark:bg-dot-thick-[#6d28d9]"
        style={{
          WebkitMaskImage: useMotionTemplate`
            radial-gradient(
              200px circle at ${mouseX}px ${mouseY}px,
              black 0%,
              transparent 100%
            )
          `,
          maskImage: useMotionTemplate`
            radial-gradient(
              200px circle at ${mouseX}px ${mouseY}px,
              black 0%,
              transparent 100%
            )
          `,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:linear-gradient(to_bottom,transparent_20%,#030712_180%)]"
        aria-hidden
      ></div>
      <div className={cn("relative z-20", className)}>
        <>{children}</>
      </div>
    </section>
  );
}

export function HighlightBackground({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.span
      initial={{
        backgroundSize: "0% 100%",
      }}
      animate={{
        backgroundSize: "100% 100%",
      }}
      transition={{
        duration: 2,
        ease: "linear",
        delay: 0.5,
      }}
      style={{
        backgroundRepeat: "no-repeat",
        backgroundPosition: "left center",
        display: "block",
      }}
      className={cn(
        `relative inline-block rounded-lg bg-gradient-to-r from-indigo-300 to-purple-300 px-1 pb-1 dark:from-primary dark:to-purple-500`,
        className,
      )}
    >
      {children}
    </motion.span>
  );
}

export function HighlightUnderline({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="underline decoration-primary decoration-wavy">
      {children}
    </span>
  );
}

export function HeroHighlightH1({
  children,
  subtitle,
}: {
  children: React.ReactNode;
  subtitle?: React.ReactNode;
}) {
  return (
    <h1 className="max-w-[15ch] text-center text-6xl [--slidein-delay:100ms] motion-safe:animate-slidein motion-safe:opacity-0 sm:text-7xl lg:text-8xl">
      {subtitle ? (
        <span className="block text-sm uppercase text-foreground/70">
          {subtitle}
        </span>
      ) : null}
      <span className="flex flex-wrap items-center justify-center space-x-5 px-4 font-bold">
        {children}
      </span>
    </h1>
  );
}

export function HeroHighlightDescription({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="max-w-[60ch] px-8 text-center text-lg [--slidein-delay:300ms] motion-safe:animate-slidein motion-safe:opacity-0 sm:text-xl">
      {children}
    </p>
  );
}
