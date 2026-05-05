const express = require("express");
const http = require("http");
const mqtt = require("mqtt");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const mqttClient = mqtt.connect("mqtt://broker.hivemq.com");

// MQTT подписки
mqttClient.on("connect", () => {
    console.log("MQTT connected");
    mqttClient.subscribe("home/#");
});

// MQTT → Web
mqttClient.on("message", (topic, message) => {
    const msg = message.toString();
    console.log("MQTT:", topic, msg); // ← добавь это
    io.emit("mqtt", { topic, msg });
});

// Web → MQTT
io.on("connection", (socket) => {
    socket.on("command", ({ topic, value }) => {
        mqttClient.publish(topic, value);
    });
});

app.use(express.static("public"));

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});