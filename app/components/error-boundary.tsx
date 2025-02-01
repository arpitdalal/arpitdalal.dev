import { useEventListener } from "@reactuses/core";
import { type LinksFunction } from "@remix-run/node";
import {
  type ErrorResponse,
  isRouteErrorResponse,
  useParams,
  useRouteError,
  Link,
} from "@remix-run/react";
import { captureRemixErrorBoundaryError } from "@sentry/remix";
import { type ReactElement } from "react";
import DinoGame from "react-chrome-dino-ts";
import reactChromeDinoCss from "react-chrome-dino-ts/index.css?url";
import { getErrorMessage } from "#app/utils/misc";
import { Icon } from "./ui/icon";

type StatusHandler = (info: {
  error: ErrorResponse;
  params: Record<string, string | undefined>;
}) => ReactElement | null;

export function GeneralErrorBoundary({
  defaultStatusHandler = ({ error }) => (
    <p>
      {error.status} {error.data}
    </p>
  ),
  statusHandlers,
  unexpectedErrorHandler = (error) => <p>{getErrorMessage(error)}</p>,
}: {
  defaultStatusHandler?: StatusHandler;
  statusHandlers?: Record<number, StatusHandler>;
  unexpectedErrorHandler?: (error: unknown) => ReactElement | null;
}) {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);
  const params = useParams();

  if (typeof document !== "undefined") {
    console.error(error);
  }

  return (
    <div className="container flex items-center justify-center p-20 text-h2">
      {isRouteErrorResponse(error)
        ? (statusHandlers?.[error.status] ?? defaultStatusHandler)({
            error,
            params,
          })
        : unexpectedErrorHandler(error)}
    </div>
  );
}

export const dinoCssLinks: LinksFunction = () => {
  return [{ rel: "stylesheet", href: reactChromeDinoCss }];
};

export function NotFound() {
  useEventListener("keydown", (event) => {
    if (event.code === "Space" && window.innerWidth >= 1024) {
      // lg breakpoint
      event.preventDefault();
    }
  });

  return (
    <div className="container flex items-center justify-center p-20 text-h2">
      <div className="flex flex-col gap-6 pt-10">
        <div className="flex flex-col gap-3">
          <h1 className="text-h1">Lost, but not forgotten</h1>
        </div>
        <Link to="/" className="text-body-md underline">
          <Icon name="arrow-left-outline">Let's find your way back</Icon>
        </Link>
        <div className="hidden w-full text-body-md lg:block">
          <h2>Feel free to play a game while you're here</h2>
          <DinoGame hideInstructions />
          <p className="mt-6 text-center text-base text-foreground/70">
            Press space to start the game.
          </p>
        </div>
      </div>
    </div>
  );
}
