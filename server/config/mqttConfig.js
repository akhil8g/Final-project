import mqtt from "mqtt";
import dotenv from "dotenv";
import { ref, update, get } from "firebase/database"; // Firebase RTDB utilities
import { rtdb, db } from "./firebase.js"; // RTDB configuration
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  updateDoc,
} from "firebase/firestore";

// Load environment variables
dotenv.config();

// Connect to HiveMQ broker
const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL, {
  username: process.env.MQTT_USERNAME, // Username from environment variables
  password: process.env.MQTT_PASSWORD, // Password from environment variables
  clientId: `client-${Math.random().toString(16).substr(2, 8)}`, // Generate a random client ID for uniqueness
});

// Event listener for successful connection
mqttClient.on("connect", () => {
  console.log("Successfully connected to HiveMQ broker");
});

// Event listener for handling errors
mqttClient.on("error", (err) => {
  console.error("Error connecting to the MQTT broker:", err);
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
        console.error(
          `Invalid payload for device ${deviceId}:`,
          message.toString()
        );
        return;
      }

      const deviceRef = ref(rtdb, `devices/${deviceId}`);

      // Update the RTDB with the payload
      await update(deviceRef, {
        current: payload.current, // Only update the current value
        lastUpdated: Date.now(), // Add timestamp for tracking
      });

      console.log(`Real-time data for device ${deviceId} updated:`, payload);
    }

    // Handling ON/OFF Status Updates (/devices/{deviceId}/status)
    if (topic.includes("/status")) {
      if (!payload || !["ON", "OFF"].includes(payload.status)) {
        console.error(
          `Invalid status payload for device ${deviceId}:`,
          message.toString()
        );
        return;
      }

      const deviceStatus = payload.status;
      console.log(`Device ${deviceId} changed status to: ${deviceStatus}`);

      if (deviceStatus === "ON") {
        // Fetch real-time current and device name from RTDB
        const deviceRef = ref(rtdb, `devices/${deviceId}`);
        const snapshot = await get(deviceRef);

        if (!snapshot.exists()) {
          console.warn(`Device ${deviceId} not found in RTDB.`);
          return;
        }

        const deviceData = snapshot.val();
        const current = deviceData.current || 0; // Default to 0 if missing
        const deviceName = deviceData.deviceName || `Device ${deviceId}`;

        // ✅ Create a new session
        await addDoc(sessionsRef, {
          deviceId,
          deviceName,
          current, // Store current at session start
          startTime: new Date(),
          status: "active",
        });

        console.log(
          `Session started for device ${deviceId} (${deviceName}), Initial Current: ${current}A`
        );
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

        // Convert stored current (mA) to A
        const currentA = (sessionData.current || 0) / 1000; // Convert mA to A
        const voltage = 230; // Example: standard household voltage (modify if needed)

        // Calculate power consumption in Wh
        const powerW = voltage * currentA; // Power in Watts
        const consumptionWh = (powerW * duration) / 3600; // Convert to Wh

        await updateDoc(sessionDoc.ref, {
          endTime,
          duration,
          consumption: consumptionWh,
          status: "completed",
        });

        console.log(
          `Session ended for device ${deviceId}. Duration: ${duration}s, Consumption: ${consumptionWh.toFixed(
            4
          )} Wh`
        );
      }
    }
  } catch (error) {
    console.error("Error processing MQTT message:", error);
  }
});

// Export the MQTT client for use in other modules
export default mqttClient;
