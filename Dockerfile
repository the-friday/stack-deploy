# create base image
FROM node:8-alpine as base
WORKDIR /app

# install dependencies
FROM base as dependencies
COPY package*.json ./
RUN npm i npm -g && npm ci

# ---- Build ----
FROM dependencies AS build
WORKDIR /app
COPY ./ /app
RUN npm run build

FROM node:8-alpine AS release
WORKDIR /app
ENV NODE_ENV production
COPY --from=build /app/build/* ./

ENTRYPOINT ["node", "app.js"]
