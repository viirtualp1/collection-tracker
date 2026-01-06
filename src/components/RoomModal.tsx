import { useState, useEffect } from "react";
import type { Room } from "../types";
import "./ItemModal.scss";

interface RoomModalProps {
  room: Room | null;
  onSave: (room: Omit<Room, "id" | "order">) => void;
  onDelete?: (roomId: string) => void;
  onClose: () => void;
}

function RoomModal({ room, onSave, onDelete, onClose }: RoomModalProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");

  useEffect(() => {
    if (room) {
      setName(room.name);
      setIcon(room.icon || "");
    } else {
      setName("");
      setIcon("");
    }
  }, [room]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      icon: icon.trim() || undefined,
    });
  };

  const handleDelete = () => {
    if (
      room &&
      onDelete &&
      confirm(
        "Are you sure you want to delete this room? All items in this room will be deleted."
      )
    ) {
      onDelete(room.id);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{room ? "Edit Room" : "Add New Room"}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <form className="modal-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Room name"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="icon">Icon (emoji)</label>
              <input
                type="text"
                id="icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="🏠"
                maxLength={2}
              />
            </div>

            <div className="modal-actions">
              {room && onDelete && (
                <button
                  type="button"
                  className="delete-button"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              )}
              <div className="right-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  {room ? "Save" : "Add"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RoomModal;
