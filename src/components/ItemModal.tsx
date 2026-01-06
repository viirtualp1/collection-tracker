import { useState, useEffect } from "react";
import type { CollectionItem } from "../types";
import "./ItemModal.scss";

interface ItemModalProps {
  item: CollectionItem | null;
  onSave: (item: Omit<CollectionItem, "id" | "createdAt" | "roomId">) => void;
  onDelete?: (itemId: string) => void;
  onClose: () => void;
}

function ItemModal({ item, onSave, onDelete, onClose }: ItemModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (item) {
      setName(item.name);
      setDescription(item.description);
      setImageUrl(item.imageUrl || "");
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim() || undefined,
    });
  };

  const handleDelete = () => {
    if (
      item &&
      onDelete &&
      confirm("Are you sure you want to delete this item?")
    ) {
      onDelete(item.id);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{item ? "Edit Item" : "Add New Item"}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Item name"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Item description"
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">Image URL</label>
            <input
              type="url"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="modal-actions">
            {item && onDelete && (
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
              <button type="submit" className="save-button">
                {item ? "Save" : "Add"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ItemModal;
