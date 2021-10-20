#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#define RELAYPIN D5
#ifndef STASSID
#define STASSID "EGEMERIC2"
#define STAPSK  ""
#endif
#define DEVICEID "0x0001"
const char* ssid     = STASSID;
const char* password = STAPSK;
const char* mqtt_server = "10.1.1.144";

WiFiClient espClient;
PubSubClient client(espClient);
unsigned long lastMsg = 0;
#define MSG_BUFFER_SIZE  (128)
char msg[MSG_BUFFER_SIZE];
char tmpTopic[MSG_BUFFER_SIZE];
char subsTopic[MSG_BUFFER_SIZE];
int value = 0;
String clientId = "ESP8266Client-";

void setup() {
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


void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID

    Serial.println(clientId);
    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      // ... and resubscribe
      snprintf (subsTopic, MSG_BUFFER_SIZE, "/home/egemeric/%s/light", clientId.c_str() );
      client.subscribe(subsTopic);
      Serial.printf("\nsubscribed:%s\n", subsTopic);
      snprintf (msg, MSG_BUFFER_SIZE, "%s", clientId.c_str());
      client.publish("/home/egemeric/register/device", msg);
      snprintf (tmpTopic, MSG_BUFFER_SIZE, "/home/egemeric/heartbeat/%s", clientId.c_str() ); //set heartbeat topic
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


void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
  if (strcmp(topic, subsTopic) == 0) {
    handleRelay(payload);
  }
}


void loop() {
  if (!client.connected()) {
    reconnect();

  }
  client.loop();
  unsigned long now = millis();
  if (now - lastMsg > 1000 * 60) {
    lastMsg = now;
    Serial.println("heartbeat is send to:");
    Serial.print(tmpTopic);
    client.publish(tmpTopic, "ok");

  }
}
