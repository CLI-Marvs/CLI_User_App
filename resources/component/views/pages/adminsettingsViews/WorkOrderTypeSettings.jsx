import React, { useState, useEffect } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import apiService from "@/servicesApi/apiService";
import { toast } from "react-toastify";
import { Card, CardBody, Typography } from "@material-tailwind/react";

function SortableItem({ id, item }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        padding: "12px 20px",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        marginBottom: "8px",
        backgroundColor: "white",
        cursor: "grab",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Typography variant="h6" color="blue-gray" className="font-normal">
                {item.type_name}
            </Typography>
        </div>
    );
}

const WorkOrderTypeSettings = () => {
    const [workOrderTypes, setWorkOrderTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        const fetchTypes = async () => {
            try {
                setLoading(true);
                const response = await apiService.get(
                    "/admin/settings/work-order-types"
                );
                const sortedTypes = response.data.sort(
                    (a, b) => a.order - b.order
                );
                setWorkOrderTypes(sortedTypes);
            } catch (error) {
                console.error("Failed to fetch work order types:", error);
                toast.error("Failed to load work order types.");
            } finally {
                setLoading(false);
            }
        };
        fetchTypes();
    }, []);

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = workOrderTypes.findIndex(
                (item) => item.id === active.id
            );
            const newIndex = workOrderTypes.findIndex(
                (item) => item.id === over.id
            );
            const newOrder = arrayMove(workOrderTypes, oldIndex, newIndex);

            setWorkOrderTypes(newOrder);

            const reorderedIds = newOrder.map((item) => item.id);

            try {
                await apiService.post(
                    "/admin/settings/work-order-types/reorder",
                    { ordered_ids: reorderedIds }
                );
                toast.success("Work order types reordered successfully.");
            } catch (error) {
                console.error("Failed to save new order:", error);
                toast.error("Failed to save the new order. Please try again.");
                setWorkOrderTypes(workOrderTypes); // Revert on failure
            }
        }
    };

    if (loading) {
        return <div>Loading work order types...</div>;
    }

    return (
        <Card className="m-4 p-4">
            <CardBody>
                <Typography variant="h5" color="blue-gray" className="mb-4">
                    Reorder Work Order Types
                </Typography>
                <Typography className="mb-4">
                    Drag and drop the items to change their display order.
                </Typography>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={workOrderTypes.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                        {workOrderTypes.map((item) => (
                            <SortableItem key={item.id} id={item.id} item={item} />
                        ))}
                    </SortableContext>
                </DndContext>
            </CardBody>
        </Card>
    );
};

export default WorkOrderTypeSettings;

