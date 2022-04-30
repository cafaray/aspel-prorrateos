FROM node:12-alpine

WORKDIR /node   
# node-canvas
RUN apk add --no-cache \
    build-base \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev

# Use latest version of npm
RUN npm install npm@latest -g
COPY package.json package-lock.json* ./
RUN npm install --no-optional && npm cache clean --force

COPY . .

# ENV FASTIFY_ADDRESS = 0.0.0.0
# ENV FASTIFY_PORT = 5002

CMD ["npm", "run", "start"]

EXPOSE 5002