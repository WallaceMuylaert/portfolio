# Use a lightweight Node image for building the React app
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the static assets
RUN npm run build

# Stage 2 – serve the build with a tiny Nginx server
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Expose port 80 (Netlify uses its own server, but for Docker local preview)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
