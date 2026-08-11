# syntax=docker/dockerfile:1

ARG NODE_VERSION=24.12.0

FROM node:${NODE_VERSION}-alpine AS development

ENV NODE_ENV=development \
    NEXT_TELEMETRY_DISABLED=1

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci

COPY . .

RUN mkdir -p .next \
    && npx prisma generate \
    && chown -R node:node /usr/src/app

USER node

EXPOSE 3000

CMD ["npm", "run", "dev"]
