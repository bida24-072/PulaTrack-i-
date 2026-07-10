// src/lib/deleteUserData.js
// -----------------------------------------------------------------------
// Firestore does NOT automatically delete subcollections when you delete a
// parent document. Before removing a user's Auth account, we must manually
// delete every doc in users/{uid}/transactions, /budgets, /goals, and
// finally the users/{uid} profile doc itself.
// -----------------------------------------------------------------------
import { collection, getDocs, doc, writeBatch } from "firebase/firestore";
import { db } from "@/firebase";

const SUBCOLLECTIONS = ["transactions", "budgets", "goals"];

export async function deleteAllUserData(userId) {
  // Delete each subcollection in batches of up to 500 (Firestore batch limit)
  for (const sub of SUBCOLLECTIONS) {
    const snap = await getDocs(collection(db, "users", userId, sub));
    const docs = snap.docs;

    for (let i = 0; i < docs.length; i += 500) {
      const chunk = docs.slice(i, i + 500);
      const batch = writeBatch(db);
      chunk.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  }

  // Finally, delete the user's profile document itself
  const batch = writeBatch(db);
  batch.delete(doc(db, "users", userId));
  await batch.commit();
}
