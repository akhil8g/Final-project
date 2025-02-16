import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { ref, set } from "firebase/database";
import { db, rtdb } from "../config/firebase.js"; // Import Firestore and RTDB configurations
import mqttClient from "../config/mqttConfig.js"; // Import MQTT client configuration

export const addDeviceController = async (req, res) => {
  try {
    const { deviceId, deviceName } = req.body;

    // Validate that `deviceId` is provided
    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: "Device ID is required.",
      });
    }

    // Get the user's UID from the auth middleware
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID is missing.",
      });
    }

    // Step 1: Add the device to RTDB
    const rtdbDeviceRef = ref(rtdb, `devices/${deviceId}`);
    await set(rtdbDeviceRef, {
      userId,
      deviceId,
      deviceName,
      current: null, // Default value, updated later via MQTT
      createdAt: Date.now(), // Timestamp for creation
    });

    // Step 2: Create a reference for the RTDB path
    const rtdbDevicePath = `devices/${deviceId}`;

    // Step 3: Update the user's Firestore document to include the RTDB reference
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      devices: arrayUnion(rtdbDevicePath), // Store RTDB reference in Firestore
    });

    // Step 4: Subscribe to the device's MQTT topic
    const deviceTopic = `/devices/${deviceId}/data`;
    mqttClient.subscribe(deviceTopic, { qos: 1 }, (err) => {
      if (err) {
        console.error(`Failed to subscribe to MQTT topic ${deviceTopic}:`, err);
      } else {
        console.log(`Successfully subscribed to MQTT topic: ${deviceTopic}`);
      }
    });
    // subscribe to on-off status of the device for maintaining the record of 
    const deviceStatus = `/devices/${deviceId}/status`;
    mqttClient.subscribe(deviceStatus, { qos: 1 }, (err) => {
      if (err) {
        console.error(`Failed to subscribe to MQTT topic ${deviceStatus}:`, err);
      } else {
        console.log(`Successfully subscribed to MQTT topic: ${deviceStatus}`);
      }
    });

    // Respond with success
    res.status(201).json({
      success: true,
      message: "Device added successfully and user updated.",
      device: {
        rtdbPath: rtdbDevicePath,
        userId,
        deviceId,
        deviceName
      },
    });
  } catch (error) {
    console.error("Error adding device:", error);

    res.status(500).json({
      success: false,
      message: "An error occurred while adding the device.",
      error: error.message,
    });
  }
};



export const getUserDevicesController = async (req, res) => {
  try {
    const userId = req.user.uid;

    // Reference to the user's RTDB node
    const userRef = ref(db, 'users/' + userId);

    // Get the user's data from RTDB
    const userSnapshot = await get(userRef);

    if (!userSnapshot.exists()) {
      return res.status(404).send({
        success: false,
        message: 'User not found',
      });
    }

    const userData = userSnapshot.val();
    const deviceRefs = userData.devices || [];  // Devices stored as an array in the user node

    if (deviceRefs.length === 0) {
      return res.status(200).send({
        success: true,
        message: 'No devices found for this user',
        devices: [],
      });
    }

    // Create an array of promises to fetch each device's data from RTDB
    const deviceDataPromises = deviceRefs.map(deviceId => {
      const deviceRef = ref(db, 'devices/' + deviceId);
      return get(deviceRef);
    });

    // Fetch all device data in parallel
    const deviceSnapshots = await Promise.all(deviceDataPromises);

    // Extract device data from snapshots
    const devices = deviceSnapshots.map(snapshot => {
      if (snapshot.exists()) {
        return snapshot.val();  // Return device data from RTDB snapshot
      }
      return null;  // In case the device doesn't exist
    }).filter(device => device !== null);  // Filter out any null values

    res.status(200).send({
      success: true,
      message: 'Devices retrieved successfully',
      devices,
    });

  } catch (error) {
    console.error('Error retrieving devices:', error);

    res.status(500).send({
      success: false,
      message: 'Error retrieving devices',
      error: error.message,
    });
  }
};
export const changeDeviceStateController = async (req, res) => {
  try {
    // Extract query parameters
    const { deviceId, state } = req.query;

    // Validate query parameters
    if (!deviceId || typeof state === "undefined") {
      return res.status(400).json({
        success: false,
        message: "Device ID and state are required as query parameters.",
      });
    }

    // Parse and validate state (ensure it is 0 or 1)
    const parsedState = parseInt(state, 10);
    if (parsedState !== 0 && parsedState !== 1) {
      return res.status(400).json({
        success: false,
        message: "State must be either 0 or 1.",
      });
    }

    // Define the topic and payload
    const topic = `/devices/${deviceId}/state`;
    const payload = JSON.stringify({ state: parsedState }); // Serialize the state as JSON

    // Publish the state change to the MQTT topic
    mqttClient.publish(topic, payload, { qos: 1 }, (err) => {
      if (err) {
        console.error(`Error publishing to MQTT topic ${topic}:`, err);
        return res.status(500).json({
          success: false,
          message: "Failed to publish device state.",
        });
      }

      console.log(`State ${parsedState} published to MQTT topic ${topic}`);

      // Respond with success
      res.status(200).json({
        success: true,
        message: `Device state changed successfully to ${parsedState}.`,
      });
    });
  } catch (error) {
    console.error("Error changing device state:", error);

    res.status(500).json({
      success: false,
      message: "An error occurred while changing device state.",
      error: error.message,
    });
  }
};