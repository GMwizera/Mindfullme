# Simple, working Dockerfile for MindfulMe
FROM node:18-alpine


WORKDIR /app


RUN addgroup -g 1001 -S nodejs && \
    adduser -S mindfulme -u 1001 -G nodejs


COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application files
COPY server.js ./
COPY public/ ./public/
COPY .env.example ./

# Create necessary directories and set permissions
RUN mkdir -p /app/logs && \
    chown -R mindfulme:nodejs /app && \
    chmod -R 755 /app

# Switch to non-root user
USER mindfulme

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); \
    const req = http.request({hostname:'localhost',port:8080,path:'/health',timeout:3000}, \
    (res) => process.exit(res.statusCode === 200 ? 0 : 1)); \
    req.on('error', () => process.exit(1)); \
    req.end();"

# Environment variables
ENV NODE_ENV=production \
    PORT=8080

# Start the application
CMD ["node", "server.js"]

# Labels for metadata
LABEL maintainer="gmwizera@example.com"
LABEL description="MindfulMe - Mental Wellness Dashboard with External APIs"
LABEL version="1.0.0"