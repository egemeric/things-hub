FROM alpine:3.14
RUN apk add --update mosquitto nodejs npm openssl

EXPOSE 1883/tcp
EXPOSE 1883/udp
EXPOSE 9000/tcp
RUN mkdir -p /usr/src/server
WORKDIR /usr/src/server

COPY ./homeserver /usr/src/server

RUN npm install --save
COPY mosquitto.conf /mosquitto.conf

RUN mkdir -p /ssl
COPY ./openSSL /ssl
WORKDIR /ssl
RUN chmod +x makessl.sh
RUN sh ./makessl.sh
RUN chmod 777 *
WORKDIR /usr/src/server
ENV PATH /usr/sbin:$PATH
ENTRYPOINT ["/bin/sh"]