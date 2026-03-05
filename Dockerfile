# Use a stable Node.js version
FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package.json (don't worry about the lockfile)
COPY package*.json ./

# Install dependencies directly (this is safer than npm ci)
RUN npm install

# Copy the rest of your code
COPY . .

# Set the port (Koyeb uses 8000 by default, but let's be safe)
ENV PORT=8000
EXPOSE 8000

# Start the server
CMD [ "node", "server.js" ]
