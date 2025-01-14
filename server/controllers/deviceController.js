import { collection, addDoc, getDoc, Timestamp, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../config/firebase.js'; // Adjust the path to your firebase.js file

export const addDeviceController = async (req, res) => {
  try {
    const { deviceId } = req.body;

    // Validation: Ensure `deviceId` is provided
    if (!deviceId) {
      return res.status(400).send({
        success: false,
        message: 'Device ID is required',
      });
    }

    // Get user details from `authMiddleware`
    const userId = req.user.uid;

    // Create a reference to the device collection
    const devicesCollectionRef = collection(db, 'devices');

    // Add a new device document with auto-generated ID
    const docRef = await addDoc(devicesCollectionRef, {
      userId,
      deviceId,
      createdAt: Timestamp.fromDate(new Date()),
    });

    // Access the newly created device document using its reference ID (auto-generated ID)
    const deviceSnapshot = await getDoc(docRef);

    if (deviceSnapshot.exists()) {
      console.log('Device added successfully:', deviceSnapshot.data());

      // Step 2: Create a reference to the newly created device
      const deviceReference = doc(db, 'devices', docRef.id);

      // Step 3: Update the user document and add the device reference to the `devices` array
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        devices: arrayUnion(deviceReference), // Use arrayUnion to avoid duplicate entries
      });

      // Sending success response
      res.status(201).send({
        success: true,
        message: 'Device added successfully and user updated',
        device: deviceSnapshot.data(), // Sending back the full device data
      });
    } else {
      res.status(500).send({
        success: false,
        message: 'Error adding device',
      });
    }

  } catch (error) {
    console.error('Error adding device:', error);

    res.status(500).send({
      success: false,
      message: 'Error adding device',
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
