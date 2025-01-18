// import mqttClient from '../config/mqttConfig.js';
// import { ref, update } from 'firebase/database'; // Firebase RTDB utilities
// import { rtdb } from './firebaseConfig.js'; // RTDB configuration

// // Listen for incoming MQTT messages
// mqttClient.on('message', async (topic, message) => {

//     console.log(`Received message on topic: ${topic}`);
//     console.log(`Message content: ${message.toString()}`);
//   try {
//     // Parse the topic to get the deviceId (e.g., /devices/{deviceId}/data)
//     const parts = topic.split('/');
//     const deviceId = parts[2]; // Ensure topic is structured correctly

//     if (!deviceId) {
//       console.error(`Invalid topic structure: ${topic}`);
//       return;
//     }

//     // Parse the message payload (assuming JSON format)
//     const payload = JSON.parse(message.toString());

//     if (!payload || typeof payload.current !== 'number') {
//       console.error(`Invalid payload for device ${deviceId}:`, message.toString());
//       return;
//     }

//     // Reference to the device in RTDB
//     const deviceRef = ref(rtdb, `devices/${deviceId}`);

//     // Update the RTDB with the payload
//     await update(deviceRef, {
//       current: payload.current, // Only update the current value
//       lastUpdated: Date.now(), // Add timestamp for tracking
//     });

//     console.log(`Real-time data for device ${deviceId} updated successfully with payload:`, payload);
//   } catch (error) {
//     console.error('Error processing MQTT message:', error);
//   }
// });

// // Function to subscribe to topics
// export const subscribeToDeviceTopic = (deviceId) => {
//   try {
//     const deviceTopic = `/devices/${deviceId}/data`;

//     mqttClient.subscribe(deviceTopic, { qos: 1 }, (err) => {
//       if (err) {
//         console.error(`Failed to subscribe to topic ${deviceTopic}:`, err);
//       } else {
//         console.log(`Successfully subscribed to topic: ${deviceTopic}`);
//       }
//     });
//   } catch (error) {
//     console.error('Error subscribing to topic:', error);
//   }
// };
