FROM node:20-alpine AS base

WORKDIR /app

FROM base AS deps

COPY package*.json ./
RUN npm ci --only=production

FROM base AS build

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src/

RUN npm run build

FROM base AS production

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/generated ./generated
COPY --from=build /app/package.json ./
COPY --from=build /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/index.js"]
