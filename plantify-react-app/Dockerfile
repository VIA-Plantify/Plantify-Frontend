FROM node:20-alpine AS build

WORKDIR /app

RUN apk add --no-cache git
RUN git clone -b azure-fix https://github.com/VIA-Plantify/Plantify-Frontend.git .

WORKDIR /app/plantify-react-app

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm ci
RUN npm run build

FROM nginx:1.27-alpine AS production

RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/plantify-react-app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]