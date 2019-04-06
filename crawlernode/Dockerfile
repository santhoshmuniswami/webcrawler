FROM node:stretch

WORKDIR /home

COPY ../webcrawler/ ./

RUN npm install

EXPOSE 9000

CMD [ "npm", "start" ]