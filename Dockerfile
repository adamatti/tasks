FROM node:8.15.0-jessie

USER root
RUN mkdir /app
WORKDIR /app

RUN npm install -g bower
COPY bower.json .
RUN bower install --allow-root

COPY package.json .
RUN npm install --silent

COPY app ./app/
COPY views ./views/

ENV PORT 8080
ENV DB_FILE '/app/db.json'

EXPOSE 8080
CMD ["npm","start"]