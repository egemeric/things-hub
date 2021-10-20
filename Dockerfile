FROM alpine:3.14
RUN apk add --update mosquitto nodejs npm

EXPOSE 1883/tcp
EXPOSE 1883/udp
EXPOSE 9000/tcp
RUN mkdir -p /usr/src/server
WORKDIR /usr/src/server

COPY ./homeserver /usr/src/server

RUN npm install --save
COPY mosquitto.conf /mosquitto.conf
ENV PATH /usr/sbin:$PATH
ENTRYPOINT ["/bin/sh"]