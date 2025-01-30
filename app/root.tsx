import {
  type LoaderFunctionArgs,
  type HeadersFunction,
  type LinksFunction,
  type MetaFunction,
} from "@remix-run/node";
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { withSentry } from "@sentry/remix";
import { ClientOnly } from "remix-utils/client-only";
import { HoneypotProvider } from "remix-utils/honeypot/react";
import { GeneralErrorBoundary } from "#app/components/error-boundary";
import ExternalLink from "#app/components/external-link";
import { Header } from "#app/components/header";
import { Logo, LogoCircle, LogoImage, LogoSpinner } from "#app/components/logo";
import { EpicProgress } from "#app/components/progress-bar";
import { href as iconsHref } from "#app/components/ui/icon";
import tailwindStyleSheetUrl from "#app/styles/tailwind.css?url";
import { ClientHintCheck, getHints, useHints } from "#app/utils/client-hints";
import { getEnv } from "#app/utils/env.server";
import { honeypot } from "#app/utils/honeypot.server";
import { capitalize, getDomainUrl, getUrl } from "#app/utils/misc";
import { useNonce } from "#app/utils/nonce-provider";
import { getSocialMetas } from "#app/utils/seo";
import { type Theme } from "#types/index";

export const links: LinksFunction = () => {
  return [
    { rel: "preload", href: iconsHref, as: "image" },
    // { rel: "preload", href: fontStyleStyleSheetUrl, as: "style" },
    { rel: "preload", href: tailwindStyleSheetUrl, as: "style" },
    { rel: "mask-icon", href: "/favicons/mask-icon.svg" },
    {
      rel: "alternate icon",
      type: "image/png",
      href: "/favicons/favicon-32x32.png",
    },
    { rel: "apple-touch-icon", href: "/favicons/apple-touch-icon.png" },
    {
      rel: "manifest",
      href: "/site.webmanifest",
      crossOrigin: "use-credentials",
    } as const, // necessary to make typescript happy
    { rel: "icon", type: "image/ico", href: "/favicon.ico" },
    // { rel: "stylesheet", href: fontStyleStyleSheetUrl },
    { rel: "stylesheet", href: tailwindStyleSheetUrl },
  ].filter(Boolean);
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
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

export async function loader({ request }: LoaderFunctionArgs) {
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

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  const headers = {
    "Server-Timing": loaderHeaders.get("Server-Timing") ?? "",
  };
  return headers;
};

function Document({
  children,
  nonce,
  theme,
  env = {},
  allowIndexing = true,
}: {
  children: React.ReactNode;
  nonce: string;
  theme?: Theme;
  env?: Record<string, string>;
  allowIndexing?: boolean;
}) {
  const { theme: hintTheme } = useHints();
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
        {allowIndexing ? null : (
          <meta name="robots" content="noindex, nofollow" />
        )}
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

function App() {
  const data = useLoaderData<typeof loader>();
  const nonce = useNonce();
  const theme = data.requestInfo.hints.theme;
  const allowIndexing = data.ENV.ALLOW_INDEXING !== "false";

  return (
    <Document
      nonce={nonce}
      theme={theme}
      allowIndexing={allowIndexing}
      env={data.ENV}
    >
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
    </Document>
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

export default withSentry(AppWithProviders);

export const headerAndFooterCommonLinks = {
  contact: "contact",
};

function Footer() {
  return (
    <footer className="border-t border-foreground/40">
      <div className="container flex flex-wrap justify-between gap-10 py-5">
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
        <nav>
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
