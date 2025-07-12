FROM --platform=linux/arm64 node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM --platform=linux/arm64 node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3   CMD curl -f http://localhost:3001/health || exit 1
USER node
CMD ["npm", "run", "start:prod"]
