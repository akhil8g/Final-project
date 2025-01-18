import mqtt from 'mqtt';
import dotenv from 'dotenv';
import { ref, update } from 'firebase/database'; // Firebase RTDB utilities
import { rtdb } from '../config/firebase.js'; // RTDB configuration

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
mqttClient.on('message', async (topic, message) => {

  console.log(`Received message on topic: ${topic}`);
  console.log(`Message content: ${message.toString()}`);
try {
  // Parse the topic to get the deviceId (e.g., /devices/{deviceId}/data)
  const parts = topic.split('/');
  const deviceId = parts[2]; // Ensure topic is structured correctly

  if (!deviceId) {
    console.error(`Invalid topic structure: ${topic}`);
    return;
  }

  // Parse the message payload (assuming JSON format)
  const payload = JSON.parse(message.toString());

  if (!payload || typeof payload.current !== 'number') {
    console.error(`Invalid payload for device ${deviceId}:`, message.toString());
    return;
  }

  // Reference to the device in RTDB
  const deviceRef = ref(rtdb, `devices/${deviceId}`);

  // Update the RTDB with the payload
  await update(deviceRef, {
    current: payload.current, // Only update the current value
    lastUpdated: Date.now(), // Add timestamp for tracking
  });

  console.log(`Real-time data for device ${deviceId} updated successfully with payload:`, payload);
} catch (error) {
  console.error('Error processing MQTT message:', error);
}
});

// Export the MQTT client for use in other modules
export default mqttClient;
