import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import { ClientOnly } from "remix-utils/client-only";
import { HoneypotProvider } from "remix-utils/honeypot/react";
import appleTouchIconAssetUrl from "#app/assets/favicons/apple-touch-icon.png";
import faviconAssetUrl from "#app/assets/favicons/favicon.png";
import { GeneralErrorBoundary } from "#app/components/error-boundary";
import ExternalLink from "#app/components/external-link";
import { Header } from "#app/components/header";
import { Logo, LogoCircle, LogoImage, LogoSpinner } from "#app/components/logo";
import { Newsletter } from "#app/components/newsletter";
import { EpicProgress } from "#app/components/progress-bar";
import { href as iconsHref } from "#app/components/ui/icon";
import tailwindStyleSheetUrl from "#app/styles/tailwind.css?url";
import { usePosthogPageView } from "#app/utils/analytics";
import { ClientHintCheck, getHints, useHints } from "#app/utils/client-hints";
import { getEnv } from "#app/utils/env.server";
import { honeypot } from "#app/utils/honeypot.server";
import { capitalize, getDomainUrl, getUrl } from "#app/utils/misc";
import { useNonce } from "#app/utils/nonce-provider";
import { getSocialMetas } from "#app/utils/seo";
import { type Theme } from "#types/index";
import { type Route } from "./+types/root.ts";

export const links: Route.LinksFunction = () => {
  return [
    { rel: "preload", href: iconsHref, as: "image" },
    // { rel: "preload", href: fontStyleStyleSheetUrl, as: "style" },
    { rel: "preload", href: tailwindStyleSheetUrl, as: "style" },
    {
      rel: "icon",
      href: "/favicon.ico",
      sizes: "48x48",
    },
    { rel: "icon", type: "image/png", href: faviconAssetUrl },
    { rel: "apple-touch-icon", href: appleTouchIconAssetUrl },
    {
      rel: "manifest",
      href: "/site.webmanifest",
      crossOrigin: "use-credentials",
    } as const, // need this to make TS happy
    // { rel: "stylesheet", href: fontStyleStyleSheetUrl },
    { rel: "stylesheet", href: tailwindStyleSheetUrl },
  ].filter(Boolean);
};

export const meta: Route.MetaFunction = ({ data }) => {
  const requestInfo = data?.requestInfo;
  return [
    { viewport: "width=device-width,initial-scale=1,viewport-fit=cover" },
    {
      "theme-color": requestInfo?.hints.theme === "dark" ? "#1F2028" : "#FFF",
    },
    ...getSocialMetas({
      url: getUrl(requestInfo),
    }),
  ];
};

export async function loader({ request }: Route.LoaderArgs) {
  const honeyProps = await honeypot.getInputProps();

  return {
    requestInfo: {
      hints: getHints(request),
      origin: getDomainUrl(request),
      path: new URL(request.url).pathname,
    },
    ENV: getEnv(),
    honeyProps,
  };
}

function Document({
  children,
  nonce,
  theme,
  env = {},
}: {
  children: React.ReactNode;
  nonce: string;
  theme?: Theme;
  env?: Record<string, string | undefined>;
}) {
  const { theme: hintTheme } = useHints();
  usePosthogPageView();

  return (
    <html
      lang="en"
      className={`${theme || hintTheme || "light"} h-full overflow-x-hidden`}
    >
      <head>
        <ClientHintCheck nonce={nonce} />
        <Meta />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Links />
      </head>
      <body className="bg-background text-foreground">
        {children}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(env)}`,
          }}
        />
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  // if there was an error running the loader, data could be missing
  const data = useLoaderData<typeof loader | null>();
  const nonce = useNonce();

  return (
    <Document
      nonce={nonce}
      theme={data?.requestInfo?.hints.theme}
      env={data?.ENV}
    >
      {children}
    </Document>
  );
}

function App() {
  return (
    <>
      <div className="flex min-h-screen flex-col justify-between">
        <ClientOnly fallback={<Header jsEnabled={false} />}>
          {() => <Header jsEnabled />}
        </ClientOnly>
        <main id="main" className="flex-1 pb-20">
          <Outlet />
        </main>
        <Footer />
      </div>
      <EpicProgress />
    </>
  );
}

function AppWithProviders() {
  const data = useLoaderData<typeof loader>();

  return (
    <HoneypotProvider {...data.honeyProps}>
      <App />
    </HoneypotProvider>
  );
}

export default AppWithProviders;

export const headerAndFooterCommonLinks = {
  contact: "contact",
};

function Footer() {
  return (
    <footer className="border-t border-foreground/40">
      <div className="container flex flex-wrap items-start justify-between gap-10 py-5">
        <Link
          to="/"
          className="group z-10 flex items-center gap-4 outline-none ring-ring ring-offset-2 ring-offset-background transition-colors focus-within:ring-2 focus-visible:ring-2"
        >
          <Logo>
            <LogoCircle />
            <LogoSpinner />
            <LogoImage />
          </Logo>
          <span
            className="underlined text-h5 xs:text-h2"
            data-content="Arpit Dalal"
          >
            Arpit Dalal
          </span>
        </Link>
        <nav className="grow">
          <p className="text-lg">
            <strong>Pages</strong>
          </p>
          <ul className="mt-3 flex flex-col gap-1">
            <li>
              <Link
                className="underlined text-foreground/70"
                to="/"
                data-content="Home"
              >
                Home
              </Link>
            </li>
            <li>
              <ExternalLink
                href="https://blog.arpitdalal.dev"
                applyBaseClassName={false}
              >
                Blog
              </ExternalLink>
            </li>
            {Object.entries(headerAndFooterCommonLinks).map(([key, value]) => (
              <li key={key}>
                <Link
                  to={value}
                  className="underlined text-foreground/70"
                  data-content={capitalize(key)}
                >
                  {capitalize(key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="text-lg font-bold xs:text-2xl">
            Subscribe to my newsletter
          </h2>
          <p className="mt-2 text-sm text-foreground/70">
            Get the latest updates from me directly to your inbox, no spam.
          </p>
          <Newsletter />
        </div>
      </div>
    </footer>
  );
}

export function ErrorBoundary() {
  const nonce = useNonce();

  return (
    <Document nonce={nonce}>
      <GeneralErrorBoundary />
    </Document>
  );
}
