FROM node:22-alpine

RUN apk add --no-cache openssl openssl-dev libc6-compat python3

WORKDIR /app

RUN npm install -g pnpm@9.0.0

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

RUN pnpm install --no-frozen-lockfile

WORKDIR /app/apps/api

ENV PRISMA_QUERY_ENGINE_LIBRARY=/app/node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/.prisma/client/libquery_engine-linux-musl-openssl-3.0.x.so.node

RUN npx prisma generate
RUN pnpm run build

EXPOSE 3001
CMD ["node", "dist/index.js"]
