#include <ESP8266WiFi.h>
#include <SFE_BMP180.h>
#include <Wire.h>
#include <PubSubClient.h>
#define FEEDLOOP 2
#include <ArduinoJson.h>
#define LED LED_BUILTIN
#define RELAYPIN D5
#ifndef STASSID
#define STASSID "EGEMERIC2"
#define STAPSK  ""
#define MQTTBASE "/home/egemeric/"
#endif
#define DEVICEID "0x0005"
#define MSG_BUFFER_SIZE  (256)
#define ALTITUDE 1230.5

const char* ssid     = STASSID;
const char* password = STAPSK;
const String mqttBase = MQTTBASE;
const char* mqtt_server = "home.egemeric.gen.tr";
const String subTopics[] = {"/relay/D5", "/relay/D6"};
bool CurrentRelayStatus[32];
SFE_BMP180 pressure;

uint8_t ledState = 1;

const char* pubTopics[] = {"/bmp180"};
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
  pinMode(LED, OUTPUT);
  delay(2000);
  delay(2000);
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
  if (pressure.begin())
    Serial.println("BMP180 init success");
  else
  {
    Serial.println("BMP180 init fail\n\n");
  }

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
      alias["/relay/D5"] = "Relay D5";
      alias["/relay/D6"] = "Relay D6";
      JsonArray publishPoints = doc.createNestedArray("publishPoints");
      publishPoints.add("/data/bmp180");
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


void msgRouter(char *topic, byte * payload, unsigned int length) {
  String _D5 =  mqttBase + clientId + "/relay/D5";
  String _D6 =  mqttBase + clientId + "/relay/D6";
  if (strcmp(topic, _D5.c_str()) == 0) {
    BoolPinController(payload, D5);
  } else if ((strcmp(topic, _D6.c_str()) == 0)) {
    BoolPinController(payload, D6);
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
void publishData(char* data, String datatype) {
  client.publish((mqttBase + clientId + "/data/" + datatype).c_str(), data );
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

StaticJsonDocument<256> BMPData;
char serializeBMPdata[256];
char status;
double T, P, p0, a;
void loop() {
  now = millis();
  digitalWrite(LED, HIGH);
  if (!client.connected()) {
    digitalWrite(LED, LOW);
    reconnect();
  }
  client.loop();
  sendHeartbeat();
  if (now - lastMsg > 1000 * 30) {
    status = pressure.startTemperature();
    if (status != 0)
    {
      // Wait for the measurement to complete:
      delay(status);

      // Retrieve the completed temperature measurement:
      // Note that the measurement is stored in the variable T.
      // Function returns 1 if successful, 0 if failure.

      status = pressure.getTemperature(T);
      if (status != 0)
      {
        // Print out the measurement:
        Serial.print("temperature: ");
        Serial.print(T, 2);
        Serial.print(" deg C, ");
        Serial.print((9.0 / 5.0)*T + 32.0, 2);
        Serial.println(" deg F");
        status = pressure.startPressure(3);
        if (status != 0)
        {
          delay(status);
          status = pressure.getPressure(P, T);
          if (status != 0)
          {
            // Print out the measurement:
            Serial.print("absolute pressure: ");
            Serial.print(P, 2);
            Serial.print(" mb, ");
            Serial.print(P * 0.0295333727, 2);
            Serial.println(" inHg");
            p0 = pressure.sealevel(P, ALTITUDE); // Deniz seviyesi basinc
            Serial.print("relative (sea-level) pressure: ");
            Serial.print(p0, 2);
            Serial.print(" mb, ");
            Serial.print(p0 * 0.0295333727, 2);
            Serial.println(" inHg");
            a = pressure.altitude(P, p0);
            Serial.print("computed altitude: ");
            Serial.print(a, 0);
            Serial.print(" meters, ");
            Serial.print(a * 3.28084, 0);
            Serial.println(" feet");
          }
          else Serial.println("error  pressure\n");
        }
        else Serial.println("error starting pressure\n ");
      }
      else Serial.println("error temperature \n");
    }
    BMPData["temperature"] = T;
    BMPData["mb_abs"] = P;
    BMPData["inHg_abs"] = P * 0.0295333727;
    BMPData["mb_sea"] = p0;
    BMPData["inHg_sea"] = p0 * 0.0295333727;
    serializeJson(BMPData, serializeBMPdata);
    publishData(serializeBMPdata,"bmp180");

    digitalWrite(LED, LOW);
    lastMsg = now;
  }
}
