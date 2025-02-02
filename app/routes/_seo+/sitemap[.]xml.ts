import { generateSitemap } from "@nasa-gcn/remix-seo";
import { type ServerBuild, type LoaderFunctionArgs } from "react-router";
import { getDomainUrl } from "#app/utils/misc";

const SITEMAP_CACHE_DURATION = 60 * 5; // 5 minutes in seconds

export async function loader({ request, context }: LoaderFunctionArgs) {
  const serverBuild = (await context.serverBuild) as { build: ServerBuild };
  return generateSitemap(request, serverBuild.build.routes, {
    siteUrl: getDomainUrl(request),
    headers: {
      "Cache-Control": `public, max-age=${SITEMAP_CACHE_DURATION}`,
    },
  });
}
