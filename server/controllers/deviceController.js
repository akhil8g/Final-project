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
