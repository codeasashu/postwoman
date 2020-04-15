FROM node:12.10.0-alpine

LABEL maintainer="Liyas Thomas (liyascthomas@gmail.com)"

# Add git as the prebuild target requires it to parse version information
RUN apk add --update --no-cache \
  git

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ARG API_URL
ARG GOOGLE_CLIENT_ID
ARG NODE_ENV=dev

ENV API_URL $API_URL
ENV GOOGLE_CLIENT_ID $GOOGLE_CLIENT_ID
ENV NODE_ENV $NODE_ENV

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
