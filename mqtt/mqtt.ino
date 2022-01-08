#include <ESP8266WiFi.h>
#include <Servo.h>
#include <PubSubClient.h>
#define FEEDLOOP 2
#include <ArduinoJson.h>
#include <DHT.h>
#include <DHT_U.h>
#define LED LED_BUILTIN
#define RELAYPIN D5
#ifndef STASSID
#define STASSID ""
#define STAPSK  ""
#define MQTTBASE "/home/egemeric/"
#endif
#define DEVICEID "0x0003"
#define MSG_BUFFER_SIZE  (256)
#define DHTTYPE    DHT11
#define DHTPIN D3
DHT_Unified dht(DHTPIN, DHTTYPE);
const char* ssid     = STASSID;
const char* password = STAPSK;
const String mqttBase = MQTTBASE;
const char* mqtt_server = "home.egemeric.gen.tr";
const String subTopics[] = {"/relay/D5", "/relay/D6", "/servo/D2", "/boolservo/D2"};
bool CurrentRelayStatus[32];
Servo *ServosLoc[32];

uint8_t ledState = 1;

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
  client.setBufferSize(512);
  for (int i = 0 ; i < 32; i++) {
    CurrentRelayStatus[i] = false;
  }
  ServosLoc[D2] = new Servo();
  ServosLoc[D2]->attach(D2); //D2
  pinMode(LED, OUTPUT);
  delay(2000);
  ServosLoc[D2]->write(100);
  delay(2000);
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
    client.publish((mqttBase + clientId + "/subsribed").c_str(), subTopics[i].c_str());
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
      char registerJson[500];
      Serial.println("connected");
      StaticJsonDocument<500> doc;
      doc["deviceName"] = clientId;
      JsonArray data = doc.createNestedArray("deviceEndpoints");
      JsonObject alias = data.createNestedObject();
      alias["/relay/D5"] = "RelayControl";
      alias["/relay/D6"] = "GiveWater";
      alias["/servo/D2"] = "FullServoControl";
      alias["/boolservo/D2"] = "ServoJob";
      JsonArray publishPoints = doc.createNestedArray("publishPoints");
      publishPoints.add("/data/water");
      publishPoints.add("/data/temp");
      publishPoints.add("/data/humidity");
      serializeJson(doc, registerJson);
      Serial.println(registerJson);
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
    CurrentRelayStatus[pin] = true;
    return (1);
  }
  else if ((char)payload[0] == '0') {
    digitalWrite(pin, LOW);
    CurrentRelayStatus[pin] = false;
    return (0);
  } else if ((char)payload[0] == '2') {
    CurrentRelayStatus[pin] = !CurrentRelayStatus[pin];
    digitalWrite(pin, CurrentRelayStatus[pin]);
    return 2;
  } else {
    Serial.printf("BoolPinController could not understand only give '0' and '1':%c\n", (char)payload[0]);
    return -1;
  }
}
int servoControl(int degree, int servoPin) {
  Serial.print(" Servo Control:");
  Serial.print(degree);
  ServosLoc[servoPin]->write(degree);
  return (degree);
}

int ServoJob(int pin) {
  for (int i = 0; i < FEEDLOOP ; i++) {
    servoControl(100, pin);
    delay(100);
    servoControl(180, pin);
    delay(200);
    servoControl(100, pin);
    delay(100);
  }
  servoControl(101, pin);
  servoControl(100, pin);


  return pin;
}

int pwmVal = 0;
void msgRouter(char *topic, byte * payload, unsigned int length) {
  String _D5 =  mqttBase + clientId + "/relay/D5";
  String _D6 =  mqttBase + clientId + "/relay/D6";
  String _D2 =  mqttBase + clientId + "/servo/D2";
  String _BD2 =  mqttBase + clientId + "/boolservo/D2";
  if (strcmp(topic, _D5.c_str()) == 0) {
    BoolPinController(payload, D5);
  } else if ((strcmp(topic, _D6.c_str()) == 0)) {
    BoolPinController(payload, D6);
  } else if ((strcmp(topic, _D2.c_str()) == 0)) {
    payload[length] = '\0';
    pwmVal = atoi((char *)payload);
    servoControl(pwmVal, D2);
  } else if ((strcmp(topic, _BD2.c_str()) == 0)) {
    ServoJob(D2);
  } else {
    Serial.printf("msg from topic cannot be routed:%s\n", topic);
  }

}
void callback(char* topic, byte * payload, unsigned int length) {
  digitalWrite(LED, LOW);
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
  if (length > 0) {
    Serial.println("msgRouter()");
    msgRouter(topic, payload, length);
  }
}

void publishData(float data, String datatype) {
  char databuffer[20];
  sprintf(databuffer, "%f", data);
  client.publish((mqttBase + clientId + "/data/" + datatype).c_str(), databuffer );
}

unsigned long lastHBMsg = 0;
unsigned long now;
void sendHeartbeat() {
  if (now - lastHBMsg > 1000 * 60) {
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
  now = millis();
  digitalWrite(LED, HIGH);
  if (!client.connected()) {
    digitalWrite(LED, LOW);
    reconnect();
  }
  client.loop();
  sendHeartbeat();
  if (now - lastMsg > 1000 * 120) {

    digitalWrite(LED, LOW);
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
