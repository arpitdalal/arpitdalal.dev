# This file is moved to the root directory before building the image

# base node image
# Keep in sync with .nvmrc and the `node-version` in .github/workflows/deploy.yml.
# jsdom 30 and its @asamuzakjp/* deps require ^22.22.2 || ^24.15.0 || >=26.0.0.
FROM node:22.23.3-bookworm-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install all node_modules, including dev dependencies
FROM base as deps

WORKDIR /myapp

ADD package.json package-lock.json .npmrc ./
RUN npm install --include=dev

# Setup production node_modules
FROM base as production-deps

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules
ADD package.json package-lock.json .npmrc ./
RUN npm prune --omit=dev

# Build the app
FROM base as build

# The Sentry bundler plugin shells out to a native `sentry-cli` binary, and that
# binary — unlike Node — verifies TLS against the system trust store. The slim
# base image has no CA bundle at all:
#
#   $ docker run --rm node:22.23.3-bookworm-slim ls /etc/ssl/certs/ca-certificates.crt
#   ls: cannot access '/etc/ssl/certs/ca-certificates.crt': No such file or directory
#
# So `npm install` succeeds (Node bundles its own roots) and then every release
# and source-map upload fails with "SSL certificate problem: unable to get local
# issuer certificate". This only ever surfaces once #16 makes the plugin reach
# the API at all; before that the `org` guard returned before any network call.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ARG COMMIT_SHA
ENV COMMIT_SHA=$COMMIT_SHA

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules

ADD . .

# Mount the secrets and run the build.
#
# `required=true` is what makes a missing secret fail the build. It looks like the
# `&&` chain below would do it instead, but it would not: `export X="$(cat
# /run/secrets/X)"` exits 0 even when the `cat` fails, because a failed command
# substitution does not propagate through `export`. Without `required=true` an
# absent secret silently becomes an empty string, and an empty string is exactly
# what `getSentryPlugin()` in vite.config.ts treats as missing — so the build
# would still fail, several layers later and with a less obvious message.
#
# The `cat`s are needed because a secret mount sets no environment variable on
# its own; only the `env=` mount form does, and that needs a Dockerfile syntax
# pin this file does not currently carry.
RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN,required=true \
    --mount=type=secret,id=SENTRY_ORG,required=true \
    --mount=type=secret,id=SENTRY_PROJECT,required=true \
    export SENTRY_AUTH_TOKEN="$(cat /run/secrets/SENTRY_AUTH_TOKEN)" && \
    export SENTRY_ORG="$(cat /run/secrets/SENTRY_ORG)" && \
    export SENTRY_PROJECT="$(cat /run/secrets/SENTRY_PROJECT)" && \
    npm run build

# Finally, build the production image with minimal footprint
FROM base

# `ARG` does not cross a `FROM`, so the value the build stage declared has to be
# redeclared here or the running container has no idea which commit it is. It is
# the release name the server SDK tags its events with (server/utils/monitoring.ts),
# so without it every server-side event arrives with no release and cannot be
# correlated to a deploy. See #15.
ARG COMMIT_SHA
ENV COMMIT_SHA=$COMMIT_SHA

ENV FLY="true"
ENV INTERNAL_PORT="8080"
ENV PORT="8081"
ENV NODE_ENV="production"

WORKDIR /myapp

COPY --from=production-deps /myapp/node_modules /myapp/node_modules

COPY --from=build /myapp/build /myapp/build
COPY --from=build /myapp/package.json /myapp/package.json
COPY --from=build /myapp/app/components/ui/icons /myapp/app/components/ui/icons

ADD . .

CMD ["npm", "start"]
