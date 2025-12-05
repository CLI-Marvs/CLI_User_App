import {
    db,
    doc,
    updateDoc,
    getDoc,
} from "@/component/servicesApi/firebaseService";

export const queueService = {

    /**
     * Updates the queue status of a walkin transaction in the Firestore database.
     *
     *
     * @param {Object} payload - The payload containing the queue update information.
     */
    updateQueueStatus: async (payload) => {
        try {
            const queueDocRef = doc(db, "queue", payload?.priority_number);
            const queueDocSnap = await getDoc(queueDocRef);

            if (!queueDocSnap.exists()) {
                console.warn(
                    `Queue document with ID ${payload?.priority_number} does not exist.`
                );
                return;
            }

            // Build update object dynamically
            const updateData = {
                status: payload?.status,
                status_updated_at: new Date().toISOString(),
            };
            if (payload?.counter !== undefined) {
                updateData.counter = payload.counter;
            }

            await updateDoc(queueDocRef, updateData);
        } catch (error) {
            console.error("Error updating queue status:", error);
            throw error;
        }
    },
};
