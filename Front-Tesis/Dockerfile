# Dockerfile para aplicación Angular
# Utiliza Node.js como imagen base
FROM node:18-alpine as build

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el código fuente
COPY . .

# Construir la aplicación para producción
RUN npm run build --prod

# Etapa de producción con Nginx
FROM nginx:alpine

# Copiar archivos construidos desde la etapa anterior
COPY --from=build /app/dist/front-tesis /usr/share/nginx/html

# Copiar configuración personalizada de Nginx (opcional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]