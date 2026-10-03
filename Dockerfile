FROM node:22-alpine AS build
WORKDIR /app

COPY FrontEnd/package*.json FrontEnd/
COPY Backend-core-cases-auth-audit-/clients/angular Backend-core-cases-auth-audit-/clients/angular
WORKDIR /app/FrontEnd
RUN npm ci

COPY FrontEnd/ .
RUN npm run build

FROM nginx:alpine
COPY FrontEnd/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/FrontEnd/dist/frontend/browser /usr/share/nginx/html
EXPOSE 80
