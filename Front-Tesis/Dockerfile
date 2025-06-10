# Dockerfile para aplicación Angular 19 - Sin budgets
FROM node:18-alpine as build

WORKDIR /app

# Copiar package files
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Crear build sin restricciones de budget
RUN ./node_modules/.bin/ng build --configuration=development

# Nginx stage
FROM nginx:alpine

RUN apk add --no-cache wget

# Copiar archivos construidos desde la subcarpeta browser (Angular 19)
COPY --from=build /app/dist/front-tesis/browser /usr/share/nginx/html

RUN echo 'server {\
    listen 80;\
    server_name localhost;\
    root /usr/share/nginx/html;\
    index index.html;\
    location / {\
        try_files $uri $uri/ /index.html;\
    }\
    location /health {\
        access_log off;\
        return 200 "healthy\\n";\
        add_header Content-Type text/plain;\
    }\
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]