# Stage 1: Build do TypeScript e Geração do Prisma Client
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY prisma ./prisma/

RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Imagem final leve para execução
FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY prisma ./prisma/

RUN npm install --only=production
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 5000

ENV PORT=5000 \
    NODE_ENV=production

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm start"]
