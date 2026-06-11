FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy root workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy all packages
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile=false

# Generate Prisma client
WORKDIR /app/apps/api
RUN npx prisma generate

# Build TypeScript
RUN pnpm run build

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "dist/index.js"]
