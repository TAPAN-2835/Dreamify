FROM node:18-alpine
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci --only=production

# Copy app
COPY . .

EXPOSE 4000
ENV NODE_ENV=production

CMD ["node", "server.js"]
