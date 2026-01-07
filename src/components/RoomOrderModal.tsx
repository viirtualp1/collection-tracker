import { useState } from "react";
import type { Room } from "../types";
import "./ItemModal.scss";
import "./RoomOrderModal.scss";

interface RoomOrderModalProps {
  rooms: Room[];
  onSave: (rooms: Room[]) => void;
  onClose: () => void;
}

function RoomOrderModal({ rooms, onSave, onClose }: RoomOrderModalProps) {
  const [draggedRooms, setDraggedRooms] = useState<Room[]>(
    [...rooms].sort((a, b) => a.order - b.order)
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newRooms = [...draggedRooms];
    const [draggedRoom] = newRooms.splice(draggedIndex, 1);
    newRooms.splice(dropIndex, 0, draggedRoom);

    const updatedRooms = newRooms.map((room, index) => ({
      ...room,
      order: index,
    }));

    setDraggedRooms(updatedRooms);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSave = () => {
    onSave(draggedRooms);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Room Order</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="room-order-list">
            {draggedRooms.map((room, index) => (
              <div
                key={room.id}
                className={`room-order-item ${
                  draggedIndex === index ? "dragging" : ""
                } ${dragOverIndex === index ? "drag-over" : ""}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className="drag-handle">☰</div>
                <span className="room-order-icon">{room.icon || "🏠"}</span>
                <span className="room-order-name">{room.name}</span>
                <span className="room-order-number">{index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <div className="right-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="save-button" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomOrderModal;
