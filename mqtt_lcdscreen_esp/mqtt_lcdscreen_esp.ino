#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
LiquidCrystal_I2C lcd(0x27, 16, 2);
StaticJsonDocument<128> doc;
const char* ssid = "EGEMERIC2";
const char* password = "";
const char* mqtt_server = "home.egemeric.gen.tr";

unsigned long lastmsg;

void callback(char* topic, byte* payload, unsigned int length) {
  lcd.clear();
  lcd.setCursor(0, 0);
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  char *msg;
  msg = (char*)malloc(sizeof(char) * length);
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
    msg[i] = (char)payload[i];
  }
  Serial.println("BYTE to CHAR:");
  Serial.println(msg);


  DynamicJsonDocument doc(length);
  DeserializationError error = deserializeJson(doc, msg);
  if (error) {
    Serial.print(F("deserializeJson() failed: "));
    Serial.println(error.f_str());
  } else {

    const float mb_abs = doc["mb_abs"];
    const float temperature = doc["temperature"];
    Serial.println(mb_abs);
    lcd.backlight();
    lcd.setCursor(0, 0);
    lcd.print("Baro:");
    lcd.setCursor(5, 0);
    lcd.print(mb_abs);

    lcd.setCursor(0, 1);
    lcd.print("Temp:");
    lcd.setCursor(5, 1);
    lcd.print(temperature);
  }
  free(msg);
  Serial.println();
  lastmsg = millis();

}

WiFiClient espClient;
PubSubClient client(espClient);

void setup_wifi() {

  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  randomSeed(micros());

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}
void reconnect() {
  String clientId = "ESP8266Client-";
  clientId += String(random(0xffff), HEX);
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      // Once connected, publish an announcement...
      // ... and resubscribe
      client.subscribe("/home/egemeric/ESP8266Client-3C:61:05:E4:BF:D5/data/bmp180");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void setup()
{  
  Wire.begin(D2, D1); 
  lcd.begin();
  lcd.clear();
  lcd.display();
  lcd.setCursor(0, 0);
  Serial.begin(57600);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);

  lcd.print("OK");
  delay(1500);
  lcd.noBacklight();
}

void loop()
{
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  if ( (millis() - lastmsg ) > (1000 * 10)) {
    lcd.noBacklight();
  }

}
