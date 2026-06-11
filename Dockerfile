FROM node:22-alpine

RUN apk add --no-cache openssl openssl-dev libc6-compat python3 make g++

WORKDIR /app

RUN npm install -g pnpm@9.0.0

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

RUN pnpm install --no-frozen-lockfile

WORKDIR /app/apps/api

RUN npx prisma generate

RUN pnpm run build

EXPOSE 3001

CMD ["node", "dist/index.js"]