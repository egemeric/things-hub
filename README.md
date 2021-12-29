# things-hub

It is a
CMPE IOT course, Term Project

End devices uses MQTT protocol for comminicating with 'homeserver'.  
'homeserver' subscribes the releted data&event points as a webConsole.

# Mqtt app
 

- It is a mqtt application server is written with nodejs. 
- Mosquito Mqtt broker is included.


To run app enter:
```
docker pull egemeric/mqttapp
docker run -it  -p '9000:9000' egemeric/mqttapp

# Or build by Own
docker build . -t <yourtag>
docker run -it  -p '9000:9000' <yourtag>


```

Without Docker:  

```
# install mqtt broker
sudo apt update -y && sudo apt install mosquitto mosquitto-clients -y
sudo systemctl start mosquitto

# start node
cd homeserver
npm install
npm start 
```
To open dashboard: [http://localhost:9000/home](http://localhost:9000/home)
