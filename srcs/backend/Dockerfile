FROM node:16-alpine

WORKDIR /app
VOLUME [ "/app" ]
COPY ./srcs/backend /app/

RUN npm install npm@latest -g
# uncomment the following line if you have proxy problems
RUN npm config set registry http://registry.npmjs.org/
RUN npm install

ENTRYPOINT npm run start:dev