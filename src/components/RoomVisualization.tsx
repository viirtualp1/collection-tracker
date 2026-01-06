import { useState, useRef } from "react";
import type { Room, CollectionItem } from "../types";
import "./RoomVisualization.scss";

interface RoomVisualizationProps {
  room: Room;
  items: CollectionItem[];
  onBack: () => void;
  onUpdateItemPosition: (itemId: string, x: number, y: number) => void;
  onUpdateRoomBackground: (backgroundImage: string) => void;
}

function RoomVisualization({
  room,
  items,
  onBack,
  onUpdateItemPosition,
  onUpdateRoomBackground,
}: RoomVisualizationProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const draggedItemRef = useRef<{ item: CollectionItem; fromSidebar: boolean } | null>(null);

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onUpdateRoomBackground(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCanvasPosition = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItemRef.current) return;

    const pos = getCanvasPosition(e.clientX, e.clientY);
    if (pos && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      if (
        pos.x >= 0 &&
        pos.y >= 0 &&
        pos.x <= rect.width &&
        pos.y <= rect.height
      ) {
        onUpdateItemPosition(draggedItemRef.current.item.id, pos.x, pos.y);
      }
    }
    draggedItemRef.current = null;
  };

  const handleSidebarItemDragStart = (
    e: React.DragEvent,
    item: CollectionItem
  ) => {
    draggedItemRef.current = { item, fromSidebar: true };
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleSidebarItemDragEnd = (e: React.DragEvent) => {
    if (!draggedItemRef.current || !draggedItemRef.current.fromSidebar) {
      draggedItemRef.current = null;
      return;
    }
    
    const pos = getCanvasPosition(e.clientX, e.clientY);
    if (pos && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      if (
        pos.x >= 0 &&
        pos.y >= 0 &&
        pos.x <= rect.width &&
        pos.y <= rect.height
      ) {
        onUpdateItemPosition(draggedItemRef.current.item.id, pos.x, pos.y);
      }
    }
    draggedItemRef.current = null;
  };

  const handleCanvasItemDragStart = (
    e: React.DragEvent,
    item: CollectionItem
  ) => {
    draggedItemRef.current = { item, fromSidebar: false };
    e.dataTransfer.effectAllowed = "move";
  };

  const handleCanvasItemDragEnd = () => {
    draggedItemRef.current = null;
  };

  const getItemStyle = (item: CollectionItem) => {
    if (!item.position) return {};
    return {
      left: `${item.position.x}px`,
      top: `${item.position.y}px`,
    };
  };

  return (
    <div className="room-visualization">
      <div className="visualization-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h2 className="visualization-title">
          {room.icon} {room.name}
        </h2>
        <div className="header-actions">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleBackgroundUpload}
            style={{ display: "none" }}
          />
          <button
            className="upload-button"
            onClick={() => fileInputRef.current?.click()}
          >
            📷 Upload Background
          </button>
        </div>
      </div>

      <div className="visualization-content">
        <aside className="items-sidebar">
          <h3 className="sidebar-title">Items</h3>
          <div className="items-list">
            {items.map((item) => (
              <div
                key={item.id}
                className="sidebar-item"
                draggable
                onDragStart={(e) => handleSidebarItemDragStart(e, item)}
                onDragEnd={(e) => handleSidebarItemDragEnd(e)}
              >
                <div className="sidebar-item-image">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} />
                  ) : (
                    <div className="sidebar-item-placeholder">📦</div>
                  )}
                </div>
                <div className="sidebar-item-info">
                  <div className="sidebar-item-name">{item.name}</div>
                  <div className="sidebar-item-drag-hint">Drag to canvas</div>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="empty-sidebar">No items in this room</div>
            )}
          </div>
        </aside>

        <div
          ref={canvasRef}
          className="visualization-canvas"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            backgroundImage: room.backgroundImage
              ? `url(${room.backgroundImage})`
              : undefined,
          }}
        >
          {items
            .filter((item) => item.position)
            .map((item) => (
              <div
                key={item.id}
                className="canvas-item"
                style={getItemStyle(item)}
                draggable
                onDragStart={(e) => handleCanvasItemDragStart(e, item)}
                onDragEnd={handleCanvasItemDragEnd}
              >
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} />
                ) : (
                  <div className="canvas-item-placeholder">
                    <span className="canvas-item-icon">📦</span>
                    <span className="canvas-item-name">{item.name}</span>
                  </div>
                )}
              </div>
            ))}
          {!room.backgroundImage && (
            <div className="canvas-placeholder">
              <p>Upload a background image to start</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoomVisualization;

