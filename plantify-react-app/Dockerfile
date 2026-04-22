FROM node:20-alpine AS build

WORKDIR /app

RUN apk add --no-cache git

RUN git clone -b Removing-NodeServer https://github.com/VIA-Plantify/Plantify-Frontend.git ./plantify-react-app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM nginx:1.27-alpine AS production

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]