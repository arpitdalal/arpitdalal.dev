import { useMeasure, useWindowSize } from "@reactuses/core";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  transform,
} from "motion/react";
import { useRef, useState } from "react";
import { Link, NavLink } from "react-router";
import ExternalLink from "#app/components/external-link";
import { Logo, LogoCircle, LogoImage, LogoSpinner } from "#app/components/logo";
import { headerAndFooterCommonLinks } from "#app/root";
import { useHints } from "#app/utils/client-hints";
import { capitalize, cn } from "#app/utils/misc";
import { useIsScrollable } from "#app/utils/use-is-scrollable";

const SCROLL_THRESHOLD_PX = 300;
const HEADER_STYLES = {
  PADDING_INLINE_START: "0",
  PADDING_INLINE_END: "2rem",
  TOP_START: "0",
  TOP_END: "1.25rem",
};
const DIV_STYLES = {
  MAX_WIDTH_START: 4000,
  MAX_WIDTH_END: 1400,
  BORDER_RADIUS_START: "0%",
  BORDER_RADIUS_END: "3rem",
  BORDER_WIDTH_START: "0px",
  BORDER_WIDTH_END: "1px",
  BG_OPACITY_START: 0,
  BG_OPACITY_END: 0.6,
  BACKDROP_BLUR_START: "0px",
  BACKDROP_BLUR_END: "12px",
  SHADOW_OPACITY_START: 0,
  SHADOW_OPACITY_END: 0.1,
};
const NAV_STYLES = {
  PADDING_START: "0 2rem",
  PADDING_END: "0 1rem",
};
const TEXT_STYLES = {
  OPACITY_START: 1,
  OPACITY_END: 0,
  X_START: 0,
  X_END: 192,
};

const mobileButtonVariants = {
  topLine: {
    open: { rotate: 45, y: 7, originX: "16px", originY: "10px" },
    closed: { rotate: 0, y: 0, originX: 0, originY: 0 },
  },
  centerLine: {
    open: { opacity: 0 },
    closed: { opacity: 1 },
  },
  bottomLine: {
    open: { rotate: -45, y: -5, originX: "16px", originY: "22px" },
    closed: { rotate: 0, y: 0, originX: 0, originY: 0 },
  },
};

export function Header({ jsEnabled }: { jsEnabled: boolean }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { width: windowWidth } = useWindowSize();
  const { reducedMotion } = useHints();
  const { scrollY } = useScroll();
  const isReducedMotion = reducedMotion === "reduce";
  const transition = isReducedMotion ? { duration: 0 } : {};
  const spanRef = useRef<HTMLSpanElement>(null);
  const [rect] = useMeasure(spanRef);
  const spanWidth = rect.width;

  // need this as useScroll returns 1 if the page is not scrollable - https://github.com/motiondivision/motion/issues/1848
  const isScrollable = useIsScrollable();

  const headerPaddingInline = useTransform(() => {
    if (!jsEnabled || isReducedMotion || !isScrollable)
      return HEADER_STYLES.PADDING_INLINE_START;

    return transform(
      scrollY.get(),
      [0, SCROLL_THRESHOLD_PX],
      [HEADER_STYLES.PADDING_INLINE_START, HEADER_STYLES.PADDING_INLINE_END],
    );
  });
  const headerTop = useTransform(() => {
    if (!jsEnabled || isReducedMotion || !isScrollable)
      return HEADER_STYLES.TOP_START;

    return transform(
      scrollY.get(),
      [0, SCROLL_THRESHOLD_PX],
      [HEADER_STYLES.TOP_START, HEADER_STYLES.TOP_END],
    );
  });
  const divMaxWidth = useTransform(() => {
    if (!jsEnabled || !isScrollable) return DIV_STYLES.MAX_WIDTH_START;
    if (isReducedMotion) return windowWidth;

    return transform(
      scrollY.get(),
      [0, SCROLL_THRESHOLD_PX],
      [windowWidth, DIV_STYLES.MAX_WIDTH_END],
    );
  });
  const divBorderRadius = useTransform(() => {
    if (!jsEnabled || isReducedMotion || !isScrollable)
      return DIV_STYLES.BORDER_RADIUS_START;

    return transform(
      scrollY.get(),
      [0, SCROLL_THRESHOLD_PX],
      [DIV_STYLES.BORDER_RADIUS_START, DIV_STYLES.BORDER_RADIUS_END],
    );
  });
  const divBorderWidth = useTransform(() => {
    if (!jsEnabled || isReducedMotion || !isScrollable)
      return DIV_STYLES.BORDER_WIDTH_START;

    return transform(
      scrollY.get(),
      [0, SCROLL_THRESHOLD_PX],
      [DIV_STYLES.BORDER_WIDTH_START, DIV_STYLES.BORDER_WIDTH_END],
    );
  });
  const divBackdropBlur = useTransform(() => {
    if (!isScrollable) {
      if (isMobileNavOpen) {
        return `blur(${DIV_STYLES.BACKDROP_BLUR_END})`;
      }
      return `blur(${DIV_STYLES.BACKDROP_BLUR_START})`;
    }
    if (!jsEnabled) return `blur(${DIV_STYLES.BACKDROP_BLUR_END})`;

    if (isMobileNavOpen && scrollY.get() === 0) {
      return `blur(${DIV_STYLES.BACKDROP_BLUR_END})`;
    }

    const transformedValue = transform(
      scrollY.get(),
      [0, SCROLL_THRESHOLD_PX],
      [DIV_STYLES.BACKDROP_BLUR_START, DIV_STYLES.BACKDROP_BLUR_END],
    );
    return `blur(${transformedValue})`;
  });
  const divBgColor = useTransform(() => {
    if (!isScrollable) {
      if (isMobileNavOpen) {
        return `hsl(var(--accent) / ${DIV_STYLES.BG_OPACITY_END})`;
      }
      return `hsl(var(--accent) / ${DIV_STYLES.BG_OPACITY_START})`;
    }
    if (!jsEnabled)
      return `hsl(var(--accent) / ${DIV_STYLES.BG_OPACITY_START})`;

    if (isMobileNavOpen && scrollY.get() === 0) {
      return `hsl(var(--accent) / ${DIV_STYLES.BG_OPACITY_END})`;
    }

    const transformedValue = transform(
      scrollY.get(),
      [0, SCROLL_THRESHOLD_PX],
      [DIV_STYLES.BG_OPACITY_START, DIV_STYLES.BG_OPACITY_END],
    );
    return `hsl(var(--accent) / ${transformedValue})`;
  });
  const divShadowOpacity = useTransform(() => {
    if (!jsEnabled || !isScrollable)
      return `0 10px 15px -3px rgb(0 0 0 / ${DIV_STYLES.SHADOW_OPACITY_START}), 0 4px 6px -4px rgb(0 0 0 / ${DIV_STYLES.SHADOW_OPACITY_START})`;

    const transformedValue = transform(
      scrollY.get(),
      [0, SCROLL_THRESHOLD_PX],
      [DIV_STYLES.SHADOW_OPACITY_START, DIV_STYLES.SHADOW_OPACITY_END],
    );
    return `0 10px 15px -3px rgb(0 0 0 / ${transformedValue}), 0 4px 6px -4px rgb(0 0 0 / ${transformedValue})`;
  });
  const navPadding = useTransform(() => {
    if (!jsEnabled || isReducedMotion || !isScrollable)
      return NAV_STYLES.PADDING_START;

    return transform(
      scrollY.get(),
      [0, SCROLL_THRESHOLD_PX],
      [NAV_STYLES.PADDING_START, NAV_STYLES.PADDING_END],
    );
  });
  const textOpacity = useTransform(() => {
    if (!jsEnabled || isReducedMotion || !isScrollable)
      return TEXT_STYLES.OPACITY_START;

    return transform(
      scrollY.get(),
      [0, SCROLL_THRESHOLD_PX],
      [TEXT_STYLES.OPACITY_START, TEXT_STYLES.OPACITY_END],
    );
  });
  const textX = useTransform(() => {
    if (!jsEnabled || isReducedMotion || !isScrollable)
      return TEXT_STYLES.X_START;

    return transform(
      scrollY.get(),
      [0, SCROLL_THRESHOLD_PX],
      [TEXT_STYLES.X_START, -(spanWidth ?? TEXT_STYLES.X_END)],
    );
  });

  const toggleMobileNav = () => {
    setIsMobileNavOpen((prevIsMobileNavOpen) => !prevIsMobileNavOpen);
  };

  return (
    <motion.header
      className="fixed left-0 right-0 z-30 mx-auto w-full"
      style={{
        paddingInline: headerPaddingInline,
        top: headerTop,
      }}
    >
      <motion.div
        className="mx-auto border-solid border-foreground/40 py-4"
        style={{
          borderRadius: divBorderRadius,
          maxWidth: divMaxWidth,
          borderWidth: divBorderWidth,
          backgroundColor: divBgColor,
          backdropFilter: divBackdropBlur,
          boxShadow: divShadowOpacity,
        }}
      >
        <motion.nav
          className="container"
          style={{
            padding: navPadding,
          }}
        >
          <div className="flex items-center justify-between gap-4 md:gap-8">
            <Link
              className="absolute -top-96 left-0 z-50 m-3 bg-primary p-3 opacity-0 outline-none ring-ring ring-offset-2 ring-offset-background transition-all duration-200 ease-in-out focus-within:ring-2 focus:top-0 focus:opacity-100 focus-visible:ring-2"
              to="#main"
            >
              Skip Navigation
            </Link>
            <Link
              to="/"
              className="group z-10 flex items-center gap-4 overflow-clip outline-none ring-ring ring-offset-2 ring-offset-background transition-colors focus-within:ring-2 focus-visible:ring-2"
            >
              <Logo className="z-10">
                <LogoCircle />
                <LogoSpinner />
                <LogoImage />
              </Logo>
              <motion.span
                style={{
                  opacity: textOpacity,
                  x: textX,
                }}
                className="underlined text-h5 xs:text-h2"
                ref={spanRef}
                data-content="Arpit Dalal"
              >
                Arpit Dalal
              </motion.span>
            </Link>
            <ul className="hidden items-center gap-4 md:flex md:gap-8">
              <li>
                <ExternalLink
                  href="https://blog.arpitdalal.dev"
                  applyBaseClassName={false}
                >
                  Blog
                </ExternalLink>
              </li>
              {Object.entries(headerAndFooterCommonLinks).map(
                ([key, value]) => (
                  <li key={key}>
                    <NavLink
                      to={value}
                      className="underlined text-foreground/70"
                      data-content={capitalize(key)}
                    >
                      {capitalize(key)}
                    </NavLink>
                  </li>
                ),
              )}
            </ul>
            <div className="md:hidden">
              <motion.button
                initial="closed"
                animate={isMobileNavOpen ? "open" : "closed"}
                onClick={toggleMobileNav}
                className="relative z-40 flex flex-col space-y-1"
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <motion.rect
                    variants={mobileButtonVariants.topLine}
                    transition={transition}
                    x="6"
                    y="9"
                    width="20"
                    height="2"
                    rx="1"
                    fill="currentColor"
                  />
                  <motion.rect
                    variants={mobileButtonVariants.centerLine}
                    transition={transition}
                    x="6"
                    y="15"
                    width="20"
                    height="2"
                    rx="1"
                    fill="currentColor"
                  />
                  <motion.rect
                    variants={mobileButtonVariants.bottomLine}
                    transition={transition}
                    x="6"
                    y="21"
                    width="20"
                    height="2"
                    rx="1"
                    fill="currentColor"
                  />
                </svg>
                <span className="sr-only">
                  {isMobileNavOpen ? "Close" : "Open"} navbar
                </span>
              </motion.button>
            </div>
          </div>
          <AnimatePresence>
            {isMobileNavOpen && (
              <motion.ul
                className="flex flex-col divide-y divide-foreground/20 overflow-hidden md:hidden"
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={transition}
              >
                <li className="pt-4 last:pb-3">
                  <ExternalLink
                    href="https://blog.arpitdalal.dev"
                    className="block w-full py-4 text-foreground/70 hover:text-foreground"
                  >
                    Blog
                  </ExternalLink>
                </li>
                {Object.entries(headerAndFooterCommonLinks).map(
                  ([key, value]) => (
                    <li key={key} className="last:pb-3">
                      <NavLink
                        to={value}
                        className={({ isActive }) =>
                          cn(
                            `block w-full py-4 text-foreground/70 hover:text-foreground`,
                            isActive && "text-foreground",
                          )
                        }
                      >
                        {capitalize(key)}
                      </NavLink>
                    </li>
                  ),
                )}
              </motion.ul>
            )}
          </AnimatePresence>
        </motion.nav>
      </motion.div>
    </motion.header>
  );
}
