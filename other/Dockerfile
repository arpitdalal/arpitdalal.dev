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

ARG COMMIT_SHA
ENV COMMIT_SHA=$COMMIT_SHA

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules

ADD . .

# Mount the secrets and set them as environment variables and run the build.
# Each one needs its own --mount *and* its own export, and every line has to
# carry the continuation: without it the mounts and the exports collapse into a
# single RUN and the shell reads `export` as an argument to the last mount.
#
# The exports are chained with &&, so a secret that was not passed short-circuits
# and fails the build here. That is the point — @sentry/vite-plugin reacts to a
# missing SENTRY_ORG by logging a warning, skipping release creation and skipping
# the source map upload, and then deleting the maps anyway in the `finally` of
# its writeBundle hook. A red build is the cheap outcome. See #16.
RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN \
    --mount=type=secret,id=SENTRY_ORG \
    --mount=type=secret,id=SENTRY_PROJECT \
    export SENTRY_AUTH_TOKEN="$(cat /run/secrets/SENTRY_AUTH_TOKEN)" && \
    export SENTRY_ORG="$(cat /run/secrets/SENTRY_ORG)" && \
    export SENTRY_PROJECT="$(cat /run/secrets/SENTRY_PROJECT)" && \
    npm run build

# Finally, build the production image with minimal footprint
FROM base

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
