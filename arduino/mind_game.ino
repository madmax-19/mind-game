/*
  YADUNAND MIND GAME
  Arduino UNO memory sequence game

  Buttons: D2-D5
  Start:   D6
  LEDs:    A0-A3
  Buzzer:  D12
  OLED:    SH1106 SPI (CS D10, DC D9, RESET D8)

  This browser version mirrors the core sequence-game idea.
*/

#include <Arduino.h>

const byte buttonPins[4] = {2, 3, 4, 5};
const byte ledPins[4]    = {A0, A1, A2, A3};
const byte startPin      = 6;
const byte buzzerPin     = 12;

const byte MAX_SEQUENCE = 32;
byte sequence[MAX_SEQUENCE];
byte level = 1;
byte inputIndex = 0;

void allOff() {
  for (byte i=0;i<4;i++) digitalWrite(ledPins[i], LOW);
}

void signal(byte n, int ms=260) {
  digitalWrite(ledPins[n], HIGH);
  tone(buzzerPin, 262 + n*90, ms);
  delay(ms);
  digitalWrite(ledPins[n], LOW);
  delay(100);
}

void makeSequence() {
  sequence[0] = random(0,4);
  level = 1;
}

bool readPlayer() {
  inputIndex = 0;
  while (inputIndex < level) {
    for (byte i=0;i<4;i++) {
      if (digitalRead(buttonPins[i]) == LOW) {
        signal(i,100);
        while (digitalRead(buttonPins[i]) == LOW) {}
        if (i != sequence[inputIndex]) return false;
        inputIndex++;
      }
    }
  }
  return true;
}

void addStep() {
  if (level < MAX_SEQUENCE) sequence[level] = random(0,4);
}

void setup() {
  for (byte i=0;i<4;i++) {
    pinMode(buttonPins[i], INPUT_PULLUP);
    pinMode(ledPins[i], OUTPUT);
  }
  pinMode(startPin, INPUT_PULLUP);
  pinMode(buzzerPin, OUTPUT);
  randomSeed(analogRead(A5));
  allOff();
}

void loop() {
  if (digitalRead(startPin) == LOW) {
    while (digitalRead(startPin) == LOW) {}
    makeSequence();

    while (level <= MAX_SEQUENCE) {
      for (byte i=0;i<level;i++) signal(sequence[i]);

      if (!readPlayer()) break;

      level++;
      addStep();
      delay(450);
    }

    allOff();
  }
}
