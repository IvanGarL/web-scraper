# STAGE 1.
FROM node:14.17.0 as builder
WORKDIR /usr/app
# Copy package json for use cache efficiently
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# STAGE 2.
FROM node:14.17.0
WORKDIR /usr/app
COPY package*.json ./
RUN npm install

COPY --from=builder /usr/app/dist ./dist
COPY --from=builder /usr/app/dist/ormconfig.docker.js ./dist/ormconfig.js

# Expose port
EXPOSE 8080

# Command to run when instantiate an image
CMD node dist/src/server.js