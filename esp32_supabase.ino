#include <WiFi.h>
#include <HTTPClient.h>
#include "ArduinoJson.h"  // install via Library Manager

// --- Wi‑Fi credentials ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// --- Supabase config (use your project's anon key) ---
const char* SUPABASE_URL  = "https://xgczpjvcmtyxauyqqcqi.supabase.co";
const char* SUPABASE_KEY  = YOUR_ANON_KEY_GOES_HERE"; // keep secret!eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6aG10anVya3ZteWxhcnF4Y2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MjEzODgsImV4cCI6MjA4ODE5NzM4OH0.4sSwnkfTeWBLaYhqdWlirR623ipeVXB-EpyI2o9JPUM
const char* SUPABASE_TABLE = "readings";

// --- pins & calibration ---
#define RELAY_PIN 4
#define BUTTON_PIN 0            // physical push‑button connected to ground
#define ACS_PIN 34
#define ZMPT_PIN 35
const float ACS_mV_per_Amp = 100.0;
const float ZMPT_Calibration_Factor = 190;

bool relayState = false;

// simple debounce state
bool lastButtonState = HIGH;
uint32_t lastDebounceTime = 0;
const uint32_t debounceDelay = 50; // milliseconds

WebServer server(80);

float getAnalogVPP(int pin) {
  int readValue;
  int maxValue = 0;
  int minValue = 4095;
  uint32_t start_time = millis();

  while((millis() - start_time) < 100) {
    readValue = analogRead(pin);
    if (readValue > maxValue) maxValue = readValue;
    if (readValue < minValue) minValue = readValue;
  }
  float vpp = ((maxValue - minValue) * 3.3) / 4095.0;
  return vpp;
}

void sendToSupabase(float volt, float curr, float pwr, bool state) {
  if (WiFi.status() != WL_CONNECTED) return;
  StaticJsonDocument<200> doc;
  doc["voltage"] = volt;
  doc["current"] = curr;
  doc["power"]   = pwr;
  doc["relay_on"]= state;
  String payload;
  serializeJson(doc, payload);

  HTTPClient http;
  http.begin(String(SUPABASE_URL) + "/rest/v1/" + SUPABASE_TABLE);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_KEY);
  http.addHeader("Authorization", String("Bearer ") + SUPABASE_KEY);

  int code = http.POST(payload);
  if (code != 201 && code != 200) {
    Serial.printf("Supabase insert failed: %d\n", code);
  }
  http.end();
}

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);
  pinMode(BUTTON_PIN, INPUT_PULLUP);   // internal pull‑up for button

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");

  // toggle via HTTP (GET or POST)
  server.on("/toggle", HTTP_ANY, [](){
    relayState = !relayState;
    digitalWrite(RELAY_PIN, relayState ? LOW : HIGH);
    sendToSupabase(0,0,0, relayState); // send immediate update (values ignored)
    server.send(200, "text/plain", "OK");
  });
  server.begin();
}

void loop() {
  server.handleClient();

  // physical button polling with debounce
  int reading = digitalRead(BUTTON_PIN);
  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }
  if ((millis() - lastDebounceTime) > debounceDelay) {
    if (reading == LOW && lastButtonState == HIGH) {
      // button pressed
      relayState = !relayState;
      digitalWrite(RELAY_PIN, relayState ? LOW : HIGH);
      sendToSupabase(0,0,0, relayState);
    }
  }
  lastButtonState = reading;

  static uint32_t lastSend = 0;
  if (millis() - lastSend > 5000) {
    lastSend = millis();
    float acs_vpp = getAnalogVPP(ACS_PIN);
    float acs_vrms = (acs_vpp / 2.0) * 0.707;
    float current_amps = (acs_vrms * 1000.0) / ACS_mV_per_Amp;
    if(!relayState) current_amps = 0.0;
    if(current_amps < 0.05) current_amps = 0.0;
    float zmpt_vpp = getAnalogVPP(ZMPT_PIN);
    float voltage_volts = zmpt_vpp * ZMPT_Calibration_Factor;
    if(voltage_volts < 10.0) voltage_volts = 0.0;
    float power_watts = voltage_volts * current_amps;

    sendToSupabase(voltage_volts, current_amps, power_watts, relayState);
  }

  if (WiFi.status() != WL_CONNECTED) {
    WiFi.disconnect();
    WiFi.reconnect();
  }
}
