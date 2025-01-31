import { type LinksFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import DinoGame from "react-chrome-dino-ts";
import reactChromeDinoCss from "react-chrome-dino-ts/index.css?url";
import { GeneralErrorBoundary } from "#app/components/error-boundary";
import { Icon } from "#app/components/ui/icon";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: reactChromeDinoCss }];
};

export async function loader() {
  throw new Response("Not found", { status: 404 });
}

export default function NotFound() {
  return <ErrorBoundary />;
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: () => (
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
        ),
      }}
    />
  );
}
