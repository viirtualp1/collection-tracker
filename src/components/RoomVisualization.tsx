import { useRef, useState, useMemo, createRef } from "react";
import Draggable, {
  type DraggableData,
  type DraggableEvent,
} from "react-draggable";
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
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [draggedItemFromSidebar, setDraggedItemFromSidebar] =
    useState<CollectionItem | null>(null);
  const itemsWithPosition = useMemo(
    () => items.filter((item) => item.position),
    [items]
  );

  const itemRefs = useMemo(() => {
    const refs: { [key: string]: React.RefObject<HTMLDivElement | null> } = {};
    itemsWithPosition.forEach((item) => {
      refs[item.id] = createRef<HTMLDivElement>();
    });
    return refs;
  }, [itemsWithPosition]);

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

  const handleDragStop = (item: CollectionItem) => {
    return (_e: DraggableEvent, data: DraggableData) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = data.x;
      const y = data.y;

      if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
        onUpdateItemPosition(item.id, x, y);
      }
    };
  };

  const handleSidebarItemDragStart = (item: CollectionItem) => {
    setDraggedItemFromSidebar(item);
  };

  const handleSidebarItemDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItemFromSidebar || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
      onUpdateItemPosition(draggedItemFromSidebar.id, x, y);
    }
    setDraggedItemFromSidebar(null);
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  return (
    <div className="room-visualization">
      <div className="visualization-header">
        <button className="back-button" onClick={onBack}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Back</span>
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
        <aside
          ref={sidebarRef}
          className={`items-sidebar ${isSidebarOpen ? "sidebar-open" : ""}`}
        >
          <h3
            className="sidebar-title"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            Items
          </h3>
          <div className="items-list">
            {items.map((item) => (
              <div
                key={item.id}
                className="sidebar-item"
                draggable
                onDragStart={() => handleSidebarItemDragStart(item)}
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
          onDragOver={handleCanvasDragOver}
          onDrop={handleSidebarItemDrop}
          style={{
            backgroundImage: room.backgroundImage
              ? `url(${room.backgroundImage})`
              : undefined,
          }}
        >
          {itemsWithPosition.map((item) => {
            const nodeRef = itemRefs[item.id];
            return (
              <Draggable
                key={item.id}
                nodeRef={nodeRef}
                position={item.position || { x: 0, y: 0 }}
                onStop={handleDragStop(item)}
                bounds="parent"
                handle=".canvas-item-handle"
              >
                <div
                  className="canvas-item"
                  ref={(node) => {
                    if (nodeRef) {
                      nodeRef.current = node as HTMLDivElement | null;
                    }
                  }}
                >
                  <div className="canvas-item-handle">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} />
                    ) : (
                      <div className="canvas-item-placeholder">
                        <span className="canvas-item-icon">📦</span>
                        <span className="canvas-item-name">{item.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Draggable>
            );
          })}
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
