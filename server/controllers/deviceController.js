import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { ref, set } from "firebase/database";
import { db, rtdb } from "../config/firebase.js"; // Import Firestore and RTDB configurations
import mqttClient from "../config/mqttConfig.js"; // Import MQTT client configuration

export const addDeviceController = async (req, res) => {
  try {
    const { deviceId } = req.body;

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

    // Respond with success
    res.status(201).json({
      success: true,
      message: "Device added successfully and user updated.",
      device: {
        rtdbPath: rtdbDevicePath,
        userId,
        deviceId,
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
    // Get user details from `authMiddleware`
    const userId = req.user.uid;

    // Reference to the user's document
    const userRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      return res.status(404).send({
        success: false,
        message: 'User not found',
      });
    }

    // Retrieve the devices array from the user's document
    const userData = userSnapshot.data();
    const deviceRefs = userData.devices || []; // `devices` is an array of document references

    if (deviceRefs.length === 0) {
      return res.status(200).send({
        success: true,
        message: 'No devices found for this user',
        devices: [],
      });
    }

    // Fetch the device data for each reference
    const deviceDataPromises = deviceRefs.map(deviceRef => getDoc(deviceRef));
    const deviceSnapshots = await Promise.all(deviceDataPromises);

    // Extract the device names (or other desired fields) from each document
    const devices = deviceSnapshots.map(snapshot => {
      if (snapshot.exists()) {
        const deviceData = snapshot.data();
        return {
          id: snapshot.id,
          ...deviceData, // Include all device data
        };
      }
      return null; // In case the device document doesn't exist
    }).filter(device => device !== null); // Filter out any `null` values

    // Send the response
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
