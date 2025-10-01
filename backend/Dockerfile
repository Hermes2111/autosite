# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* .npmrc* ./
RUN npm ci --ignore-scripts
COPY . .

FROM base AS dev
ENV NODE_ENV=development
CMD ["npm","run","start:dev"]

FROM base AS prod
RUN npm run build
ENV NODE_ENV=production
CMD ["npm","run","start:prod"]

