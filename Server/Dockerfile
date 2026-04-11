FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build


FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5021
ENV WEBAPI_URL=http://webapi:8081

COPY --from=deps /app/node_modules ./node_modules

COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist

EXPOSE 5021

CMD ["node", "dist/server.js"]