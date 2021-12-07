#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <DHT_U.h>
#define RELAYPIN D5
#ifndef STASSID
#define STASSID "SSID"
#define STAPSK  "pwd"
#define MQTTBASE "/home/egemeric/"
#endif
#define DEVICEID "0x0002"
#define MSG_BUFFER_SIZE  (256)
#define DHTTYPE    DHT11
#define DHTPIN D3
DHT_Unified dht(DHTPIN, DHTTYPE);
const char* ssid     = STASSID;
const char* password = STAPSK;
const String mqttBase = MQTTBASE;
const char* mqtt_server = "10.1.1.144";
const String subTopics[] = {"/relay/D5", "/relay/D6"};

const char* pubTopics[] = {"/waterlevel", "/temperature"};
WiFiClient espClient;
PubSubClient client(espClient);
unsigned long lastMsg = 0;
char msg[MSG_BUFFER_SIZE];
char tmpTopic[MSG_BUFFER_SIZE];
char subsTopic[MSG_BUFFER_SIZE];
int value = 0;
String clientId = "ESP8266Client-";

void setup() {
  dht.begin();
  clientId += WiFi.macAddress();
  pinMode(RELAYPIN, OUTPUT);
  digitalWrite(RELAYPIN, HIGH);
  // put your setup code here, to run once:
  Serial.begin(115200);

  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);

}

void subscribeTopics() {
  char *tmpF = (char*)malloc(MSG_BUFFER_SIZE * sizeof(char));
  String tmp;
  for (int i = 0; i < sizeof(subTopics) / sizeof(subTopics[0]); i++) {
    tmp = mqttBase + clientId + subTopics[i];
    snprintf (tmpF, MSG_BUFFER_SIZE, "%s", tmp.c_str() );
    Serial.printf("Subcribed:%s\n", tmpF);
    client.subscribe(tmpF);
    client.publish((mqttBase + clientId + "/subsribed").c_str() , subTopics[i].c_str());
    delay(100);
  }
  delete tmpF;
}
void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    Serial.println(clientId);
    if (client.connect(clientId.c_str())) {
      char registerJson[400];
      Serial.println("connected");
      StaticJsonDocument<400> doc;
      doc["deviceName"] = clientId;
      JsonArray data = doc.createNestedArray("deviceEndpoints");
      JsonObject alias = data.createNestedObject();
      alias["/relay/D5"] = "Servo";
      alias["/relay/D6"] = "Relay";
      JsonArray publishPoints = doc.createNestedArray("publishPoints");
      publishPoints.add("/data/waterlevel");
      publishPoints.add("/data/temperature");
      serializeJson(doc, registerJson);
      client.publish("/home/egemeric/register/device", registerJson);
      delay(100);
      subscribeTopics();
      delay(100);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}


void handleRelay(byte *cmd) {
  char *tmp = (char*)malloc(MSG_BUFFER_SIZE * sizeof(char));
  snprintf (tmp, MSG_BUFFER_SIZE, "/home/egemeric/%s/light/status", clientId.c_str());
  if ((char)cmd[0] == '1') {
    Serial.println("open the light");
    digitalWrite(RELAYPIN, LOW);
    client.publish(tmp, "1");
  } else if ((char)cmd[0] == '0') {
    Serial.println("close the light");
    digitalWrite(RELAYPIN, HIGH);
    client.publish(tmp, "0");
  } else {
    yield();
  }

  free(tmp);
}
int BoolPinController(byte *payload, int pin) {
  pinMode(pin, OUTPUT);
  if ((char)payload[0] == '1') {
    digitalWrite(pin, HIGH);
    return (1);
  }
  else if ((char)payload[0] == '0') {
    digitalWrite(pin, LOW);
    return (0);
  } else {
    Serial.printf("BoolPinController could not understand only give '0' and '1':%c\n", (char)payload[0]);
    return -1;
  }
}

void msgRouter(char *topic, byte *payload ) {
  String _D5 =  mqttBase + clientId + "/relay/D5";
  String _D6 =  mqttBase + clientId + "/relay/D6";
  if (strcmp(topic, _D5.c_str()) == 0) {
    BoolPinController(payload, D5);
  } else if ((strcmp(topic, _D6.c_str()) == 0)) {
    BoolPinController(payload, D5);
  } else {
    Serial.printf("msg from topic cannot be routed:%s\n", topic);
  }

}
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
  if (length > 0) {
    Serial.println("msgRouter()");
    msgRouter(topic, payload);
  }
}

void publishData(float data, String datatype) {
  char databuffer[20];
  sprintf(databuffer, "%f", data);
  client.publish((mqttBase + clientId + "/data/" + datatype).c_str() , databuffer );
}

unsigned long lastHBMsg = 0;
void sendHeartbeat() {
  unsigned long now = millis();
  if (now - lastHBMsg > 1000 * 30) {
    Serial.println("heartbeat is");
    client.publish("/home/egemeric/heartbeat", clientId.c_str() );
    lastHBMsg = now;
  }
}

float analogData() {
  int returnVal;
  int val = analogRead(A0);
  if (val < 300)
    val = 300;
  returnVal = map(val, 300, 600, 0, 100);
  Serial.printf("Analog Data Raw:%d Mapped:%d\n", val, returnVal);
  return (float)returnVal;
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  sendHeartbeat();
  unsigned long now = millis();
  if (now - lastMsg > 1000 * 2) {
    lastMsg = now;
    sensors_event_t event;
    dht.temperature().getEvent(&event);
    if (isnan(event.temperature)) {
      Serial.println(F("Error reading temperature!"));
    }
    publishData(event.temperature, "temp");
    dht.humidity().getEvent(&event);

    if (isnan(event.relative_humidity)) {
      Serial.println(F("Error reading humidity!"));
    }
    publishData(event.relative_humidity, "humidity");
    publishData(analogData(), "water");

  }
}
