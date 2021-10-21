#!/bin/bash

IP="127.0.0.1"
SUBJECT_CA="/C=TR/ST=Ankara/L=None/O=things/OU=development/CN=localhost"
SUBJECT_SERVER="/C=TR/ST=Ankara/L=None/O=things/OU=Server/CN=localhost"
SUBJECT_CLIENT="/C=TR/ST=Ankara/L=None/O=things/OU=Client/CN=localhost"

function generate_CA () {
   echo "$SUBJECT_CA";
   openssl req -x509 -nodes -sha256 -newkey rsa:2048 -subj "$SUBJECT_CA"  -days 365 -keyout /ssl/ca.key -out /ssl/ca.crt;
}

function generate_server () {
   echo "$SUBJECT_SERVER";
   openssl req -nodes -sha256 -new -subj "$SUBJECT_SERVER" -keyout /ssl/server.key -out /ssl/server.csr;
   openssl x509 -req -sha256 -in /ssl/server.csr -CA /ssl/ca.crt -CAkey /ssl/ca.key -CAcreateserial -out /ssl/server.crt -days 365;
}

function generate_client () {
   echo "$SUBJECT_CLIENT";
   openssl req -new -nodes -sha256 -subj "$SUBJECT_CLIENT" -out /ssl/client.csr -keyout /ssl/client.key ;
   openssl x509 -req -sha256 -in client.csr -CA /ssl/ca.crt -CAkey /ssl/ca.key -CAcreateserial -out /ssl/client.crt -days 365;

}

generate_CA;
generate_server;
generate_client;

