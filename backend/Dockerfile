# Render.com deployment - backend only
FROM node:18-alpine

WORKDIR /app

# Copy only backend package files
COPY package*.json ./

# Install only backend dependencies
RUN npm ci --only=production

# Copy backend source code
COPY . .

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port (Render assigns this automatically)
EXPOSE 10000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:10000/health || exit 1

# Start the application
CMD ["npm", "run", "start:prod"]