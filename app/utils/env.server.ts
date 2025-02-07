import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["production", "development", "test"] as const),
  SESSION_SECRET: z.string(),
  INTERNAL_COMMAND_TOKEN: z.string(),
  HONEYPOT_SECRET: z.string(),
  SENTRY_DSN: z.string(),
  NODEMAILER_HOST: z.string(),
  NODEMAILER_USER: z.string(),
  NODEMAILER_PASSWORD: z.string(),
  HASHNODE_PUBLICATION_ID: z.string(),
  POSTHOG_API_KEY: z.string(),
  UMAMI_WEBSITE_ID: z.string(),
  UMAMI_DOMAIN: z.string(),
  UMAMI_DOMAINS: z.string(),
  UMAMI_SCRIPT_NAME: z.string(),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof schema> {}
  }
}

export function init() {
  const parsed = schema.safeParse(process.env);

  if (parsed.success === false) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors,
    );

    throw new Error("Invalid environment variables");
  }
}

/**
 * This is used in both `entry.server` and `root` to ensure that
 * the environment variables are set and globally available before the app is
 * started.
 *
 * NOTE: Do *not* add any environment variables in here that you do not wish to
 * be included in the client.
 * @returns all public ENV variables
 */
export function getEnv() {
  return {
    MODE: process.env.NODE_ENV,
    SENTRY_DSN: process.env.SENTRY_DSN,
    POSTHOG_API_KEY: process.env.POSTHOG_API_KEY,
    UMAMI_WEBSITE_ID: process.env.UMAMI_WEBSITE_ID,
    UMAMI_DOMAIN: process.env.UMAMI_DOMAIN,
    UMAMI_DOMAINS: process.env.UMAMI_DOMAINS,
    UMAMI_SCRIPT_NAME: process.env.UMAMI_SCRIPT_NAME,
  };
}

type ENV = ReturnType<typeof getEnv>;

declare global {
  var ENV: ENV;
  interface Window {
    ENV: ENV;
  }
}
