FROM node:latest

WORKDIR /data/app

ADD . /data/app

RUN apt-get update && apt-get -y install mongodb-server

RUN npm install
RUN mongod --dbpath /var/lib/mongodb & MONGOPS=$! && \
    cd /data/app/i18n-service && npm install && \
    npm test && \
    kill $MONGOPS

RUN cd /data/app/i18n-ui && npm install && npm run build:prod

EXPOSE 9000

RUN mkdir /locales

ENV LOCALES_FOLDER /locales

CMD ./start.sh