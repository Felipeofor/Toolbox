# syntax=docker/dockerfile:1
FROM node:16-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY .babelrc webpack.config.js ./
COPY public ./public
COPY src ./src
ARG API_BASE_URL=http://localhost:3000
ENV API_BASE_URL=$API_BASE_URL
RUN npm run build

FROM nginx:alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
