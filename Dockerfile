FROM node:22-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Accept build arguments for frontend endpoints
ARG VITE_API_BASE_URL
ARG VITE_HUB_API
ARG VITE_AUTH_API_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_HUB_API=$VITE_HUB_API
ENV VITE_AUTH_API_URL=$VITE_AUTH_API_URL

# Build the React application
RUN npm run build

# Expose both the Vite preview port and Express proxy port
EXPOSE 3000
EXPOSE 3002

# Run both the Express proxy and Vite preview server concurrently
CMD ["sh", "-c", "npx tsx src/server.ts & npm run preview -- --host 0.0.0.0 --port 3000"]
