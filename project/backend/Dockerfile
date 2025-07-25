FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create logs and uploads directories
RUN mkdir -p logs uploads

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S janbol -u 1001

# Change ownership of app directory
RUN chown -R janbol:nodejs /app

# Switch to non-root user
USER janbol

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]