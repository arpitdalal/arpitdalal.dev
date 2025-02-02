import { generateRobotsTxt } from "@nasa-gcn/remix-seo";
import { type LoaderFunctionArgs } from "react-router";
import { getDomainUrl } from "#app/utils/misc";

export function loader({ request }: LoaderFunctionArgs) {
  return generateRobotsTxt([
    { type: "sitemap", value: `${getDomainUrl(request)}/sitemap.xml` },
  ]);
}
