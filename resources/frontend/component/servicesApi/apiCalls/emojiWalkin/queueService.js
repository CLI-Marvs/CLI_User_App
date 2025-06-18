import { db, doc, updateDoc } from "@/component/servicesApi/firebaseService";

export const queueService = {


    /**
     * Updates the queue status of a user in the Firestore database.
     * 
     * 
     * @param {Object} payload - The payload containing the queue update information.
     */
    updateQueueStatus: async (payload) => {
        try {
            await updateDoc(doc(db, "queue", payload?.priority_number), {
                status: payload?.status,
                counter: payload?.counter,
                status_updated_at: new Date().toISOString(),
            });
        } catch (error) {
            console.error("Error updating queue status:", error);
            throw error;
        }
    },
};
