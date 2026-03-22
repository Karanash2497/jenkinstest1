# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy rest of app
COPY . .

# Expose port
EXPOSE 3000

# Start app
CMD ["node", "app.js"]


