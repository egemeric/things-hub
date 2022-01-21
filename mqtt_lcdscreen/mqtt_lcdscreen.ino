#include <SPI.h>
#include <Ethernet.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
LiquidCrystal_I2C lcd(0x27, 16, 2);
StaticJsonDocument<128> doc;
// Update these with values suitable for your network.
byte mac[]    = {  0xDE, 0xED, 0xBA, 0xFE, 0xFE, 0xED };
IPAddress ip(10, 1, 1, 199);
IPAddress server(10, 1, 1, 2);
unsigned long lastmsg;
void callback(char* topic, byte* payload, unsigned int length) {
  lcd.clear();
  lcd.setCursor(0, 0);
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  char *msg = malloc(sizeof(char) * length);
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

EthernetClient ethClient;
PubSubClient client(ethClient);

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("arduinoClient")) {
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
  lcd.begin();
  lcd.clear();
  lcd.display();
  lcd.setCursor(0, 0);
  Serial.begin(57600);
  client.setServer(server, 1883);
  client.setCallback(callback);

  Ethernet.begin(mac, ip);
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
