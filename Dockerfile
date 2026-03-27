FROM node:22.17.1-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.29-alpine

EXPOSE 80

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/jobfinder/browser /usr/share/nginx/html
