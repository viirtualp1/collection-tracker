import { useState, useEffect, useRef } from "react";
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
  const [errors, setErrors] = useState<{ name?: string; imageUrl?: string }>(
    {}
  );
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setDescription(item.description);
      setImageUrl(item.imageUrl || "");
    } else {
      setName("");
      setDescription("");
      setImageUrl("");
    }
    setErrors({});
  }, [item]);

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
      const firstInput = modalRef.current.querySelector(
        "input, textarea"
      ) as HTMLElement;
      firstInput?.focus();
    }
  }, []);

  const validateForm = () => {
    const newErrors: { name?: string; imageUrl?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (imageUrl.trim() && !isValidUrl(imageUrl.trim())) {
      newErrors.imageUrl = "Please enter a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSave({
      name: name.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim() || undefined,
    });
  };

  const handleDelete = () => {
    if (!item || !onDelete) return;

    if (
      window.confirm(
        "Are you sure you want to delete this item? This action cannot be undone."
      )
    ) {
      onDelete(item.id);
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
          <h2 id="modal-title">{item ? "Edit Item" : "Add New Item"}</h2>
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
                placeholder="Item name"
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
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  if (errors.imageUrl)
                    setErrors({ ...errors, imageUrl: undefined });
                }}
                placeholder="https://example.com/image.jpg"
                aria-invalid={!!errors.imageUrl}
                aria-describedby={
                  errors.imageUrl ? "imageUrl-error" : undefined
                }
              />
              {errors.imageUrl && (
                <span
                  id="imageUrl-error"
                  className="error-message"
                  role="alert"
                >
                  {errors.imageUrl}
                </span>
              )}
            </div>
          </form>
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
              {item ? "Save" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemModal;
