import { getFirestore } from "firebase-admin/firestore";
import type { BookingIn } from "../type";
import { app } from "../firebase/server";

export const getFamilyInfo = async (userEmail?: string) => {
    const db = getFirestore(app);
    const usersRef = db.collection("users");
    const familiesRef = db.collection("families");
    if (userEmail) {
      const userData = await usersRef.doc(userEmail).get();
      if (userData.data()?.familyId) {
          const familyData = await familiesRef.doc(userData.data()?.familyId).get();
          return familyData.data()
      }
    }
    return {name: 'Family is missing'}
}