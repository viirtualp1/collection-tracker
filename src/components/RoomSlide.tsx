import type { Room, CollectionItem } from "../types";
import ItemCard from "./ItemCard";
import "./RoomSlide.scss";

interface RoomSlideProps {
  room: Room;
  items: CollectionItem[];
  onAddItem: () => void;
  onEditItem: (item: CollectionItem) => void;
  onEditRoom: (room: Room) => void;
  onVisualize: () => void;
}

function RoomSlide({
  room,
  items,
  onAddItem,
  onEditItem,
  onEditRoom,
  onVisualize,
}: RoomSlideProps) {
  return (
    <div className="room-slide">
      <div className="room-header">
        <div className="room-header-left">
          <span className="room-icon">{room.icon}</span>
          <h2 className="room-name">{room.name}</h2>
          <span className="item-count">{items.length} items</span>
        </div>
        <div className="room-header-actions">
          <button
            className="room-action-button edit"
            onClick={() => onEditRoom(room)}
            aria-label="Edit room"
            title="Edit room"
          >
            ✏️ Edit
          </button>
          <button
            className="room-action-button visualize"
            onClick={onVisualize}
            aria-label="Visual representation"
            title="Visual representation"
          >
            🎨 Visual
          </button>
        </div>
      </div>

      <div className="items-grid">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onClick={() => onEditItem(item)}
          />
        ))}

        <button className="add-item-card" onClick={onAddItem}>
          <span className="plus-icon">+</span>
          <span>Add Item</span>
        </button>
      </div>
    </div>
  );
}

export default RoomSlide;
