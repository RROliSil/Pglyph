# Stage 1: Build do TypeScript
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Imagem final leve para execução
FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 5000

ENV PORT=5000 \
    NODE_ENV=production

CMD ["npm", "start"]
