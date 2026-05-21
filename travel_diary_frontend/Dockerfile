# Stage 1: Build the React application
FROM node:22 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . ./

# This ARGs allow us to pass the backend URL during the Docker build process on Render
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the built files from Stage 1 to Nginx's serving directory
COPY --from=build /app/dist /usr/share/nginx/html

# Overwrite default Nginx config to handle React Router (Single Page Application routing)
RUN echo "server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files \$uri \$uri/ /index.html; \
    } \
}" > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]