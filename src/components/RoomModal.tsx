import { useState, useEffect, useRef } from "react";
import type { Room } from "../types";
import EmojiPicker from "./EmojiPicker";
import "./ItemModal.scss";

interface RoomModalProps {
  room: Room | null;
  onSave: (room: Omit<Room, "id" | "order">) => void;
  onDelete?: (roomId: string) => void;
  onClose: () => void;
}

function RoomModal({ room, onSave, onDelete, onClose }: RoomModalProps) {
  const [name, setName] = useState(() => room?.name ?? "");
  const [icon, setIcon] = useState(() => room?.icon ?? "");
  const [errors, setErrors] = useState<{ name?: string }>({});
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  useEffect(() => {
    if (modalRef.current) {
      const firstInput = modalRef.current.querySelector("input") as HTMLElement;
      firstInput?.focus();
    }
  }, []);

  const validateForm = () => {
    const newErrors: { name?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSave({
      name: name.trim(),
      icon: icon.trim() || undefined,
    });
  };

  const handleDelete = () => {
    if (!room || !onDelete) return;

    if (
      window.confirm(
        "Are you sure you want to delete this room? All items in this room will be deleted. This action cannot be undone."
      )
    ) {
      onDelete(room.id);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        <div className="modal-header">
          <h2 id="modal-title">{room ? "Edit Room" : "Add New Room"}</h2>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close modal"
          >
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
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                placeholder="Room name"
                required
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <span id="name-error" className="error-message" role="alert">
                  {errors.name}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="icon">Icon (emoji)</label>
              <EmojiPicker id="icon" value={icon} onChange={setIcon} />
            </div>
          </form>
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
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="save-button"
              onClick={(e) => {
                e.preventDefault();
                const form = e.currentTarget
                  .closest(".modal-content")
                  ?.querySelector("form") as HTMLFormElement;
                if (form) {
                  form.requestSubmit();
                }
              }}
            >
              {room ? "Save" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomModal;
