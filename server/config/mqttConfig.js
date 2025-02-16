import mqtt from 'mqtt';
import dotenv from 'dotenv';
import { ref, update, get } from 'firebase/database'; // Firebase RTDB utilities
import { rtdb, db } from './firebase.js'; // RTDB configuration
import { getFirestore, collection, addDoc, query, where, orderBy, limit, getDocs, updateDoc } from "firebase/firestore";

// Load environment variables
dotenv.config();

// Connect to HiveMQ broker
const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL, {
  username: process.env.MQTT_USERNAME,  // Username from environment variables
  password: process.env.MQTT_PASSWORD, // Password from environment variables
  clientId: `client-${Math.random().toString(16).substr(2, 8)}`  // Generate a random client ID for uniqueness
});

// Event listener for successful connection
mqttClient.on('connect', () => {
  console.log('Successfully connected to HiveMQ broker');
});

// Event listener for handling errors
mqttClient.on('error', (err) => {
  console.error('Error connecting to the MQTT broker:', err);
});

const sessionsRef = collection(db, "sessions");

mqttClient.on("message", async (topic, message) => {
  console.log(`Received message on topic: ${topic}`);
  console.log(`Message content: ${message.toString()}`);

  try {
    const parts = topic.split("/");
    const deviceId = parts[2]; // Extract deviceId from the topic

    if (!deviceId) {
      console.error(`Invalid topic structure: ${topic}`);
      return;
    }

    const payload = JSON.parse(message.toString());

    // Handling Current Sensor Data (/devices/{deviceId}/data)
    if (topic.includes("/data")) {
      if (!payload || typeof payload.current !== "number") {
        console.error(`Invalid payload for device ${deviceId}:`, message.toString());
        return;
      }

      console.log(`Real-time data for device ${deviceId} updated:`, payload);
    }

    // Handling ON/OFF Status Updates (/devices/{deviceId}/status)
    if (topic.includes("/status")) {
      if (!payload || !["ON", "OFF"].includes(payload.status)) {
        console.error(`Invalid status payload for device ${deviceId}:`, message.toString());
        return;
      }

      const deviceStatus = payload.status;
      console.log(`Device ${deviceId} changed status to: ${deviceStatus}`);

      if (deviceStatus === "ON") {
        // ✅ Create a new session
        await addDoc(sessionsRef, {
          deviceId,
          startTime: new Date(),
          status: "active",
        });
        console.log(`Session started for device ${deviceId}`);
      } else if (deviceStatus === "OFF") {
        // ✅ Find and update the latest active session
        const q = query(
          sessionsRef,
          where("deviceId", "==", deviceId),
          where("status", "==", "active"),
          orderBy("startTime", "desc"),
          limit(1)
        );

        const sessionSnapshot = await getDocs(q);
        if (sessionSnapshot.empty) {
          console.warn(`No active session found for device ${deviceId}`);
          return;
        }

        const sessionDoc = sessionSnapshot.docs[0];
        const sessionData = sessionDoc.data();
        const endTime = new Date();
        const duration = (endTime - sessionData.startTime.toDate()) / 1000; // in seconds
        const consumption = duration * 0.5; // Example calculation

        await updateDoc(sessionDoc.ref, {
          endTime,
          duration,
          consumption,
          status: "completed",
        });

        console.log(`Session ended for device ${deviceId}. Duration: ${duration}s, Consumption: ${consumption}Wh`);
      }
    }
  } catch (error) {
    console.error("Error processing MQTT message:", error);
  }
});



// Export the MQTT client for use in other modules
export default mqttClient;
