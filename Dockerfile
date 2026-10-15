FROM node:18-alpine

# Install wget and required utilities
RUN apk add --no-cache wget

# Set working directory
WORKDIR /app

# Download your server.js script directly from your GitHub repository
RUN wget -O server.js https://raw.githubusercontent.com/hhj061540-lang/ssh-api-server/refs/heads/main/server.js

# Initialize a package.json and install the ssh2 module
RUN npm init -y && npm install ssh2

# Expose port (Railway dynamically maps process.env.PORT)
EXPOSE 10000

# Start the Node.js server
CMD ["node", "server.js"]
