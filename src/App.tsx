import { useState } from "react";
import type { Room, CollectionItem } from "./types";
import RoomSlide from "./components/RoomSlide";
import ItemModal from "./components/ItemModal";
import RoomModal from "./components/RoomModal";
import RoomOrderModal from "./components/RoomOrderModal";
import RoomVisualization from "./components/RoomVisualization";
import "./App.scss";

const initialRooms: Room[] = [
  { id: "1", name: "Living Room", icon: "🛋️", order: 0 },
  { id: "2", name: "Bedroom", icon: "🛏️", order: 1 },
  { id: "3", name: "Kitchen", icon: "🍳", order: 2 },
];

const initialItems: CollectionItem[] = [
  {
    id: "1",
    name: "Vintage Record Player",
    description: "Classic 1970s turntable",
    roomId: "1",
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Comic Book Collection",
    description: "Marvel series from the 90s",
    roomId: "2",
    createdAt: new Date(),
  },
];

function App() {
  const [rooms, setRooms] = useState<Room[]>(
    [...initialRooms].sort((a, b) => a.order - b.order)
  );
  const [items, setItems] = useState<CollectionItem[]>(initialItems);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CollectionItem | null>(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isRoomOrderModalOpen, setIsRoomOrderModalOpen] = useState(false);
  const [isVisualizationMode, setIsVisualizationMode] = useState(false);

  const sortedRooms = [...rooms].sort((a, b) => a.order - b.order);
  const currentRoom = sortedRooms[currentRoomIndex];
  const currentRoomItems = items.filter(
    (item) => item.roomId === currentRoom?.id
  );

  const handlePrevRoom = () => {
    setCurrentRoomIndex((prev) =>
      prev === 0 ? sortedRooms.length - 1 : prev - 1
    );
  };

  const handleNextRoom = () => {
    setCurrentRoomIndex((prev) =>
      prev === sortedRooms.length - 1 ? 0 : prev + 1
    );
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: CollectionItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSaveItem = (
    item: Omit<CollectionItem, "id" | "createdAt" | "roomId">
  ) => {
    if (editingItem) {
      // Edit existing item
      setItems((prev) =>
        prev.map((i) => (i.id === editingItem.id ? { ...i, ...item } : i))
      );
    } else {
      // Add new item
      const newItem: CollectionItem = {
        ...item,
        id: Date.now().toString(),
        roomId: currentRoom.id,
        createdAt: new Date(),
      };
      setItems((prev) => [...prev, newItem]);
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleAddRoom = () => {
    setEditingRoom(null);
    setIsRoomModalOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setIsRoomModalOpen(true);
  };

  const handleSaveRoom = (roomData: Omit<Room, "id" | "order">) => {
    if (editingRoom) {
      setRooms((prev) =>
        prev.map((r) => (r.id === editingRoom.id ? { ...r, ...roomData } : r))
      );
    } else {
      const maxOrder = Math.max(...rooms.map((r) => r.order), -1);
      const newRoom: Room = {
        ...roomData,
        id: Date.now().toString(),
        order: maxOrder + 1,
      };
      setRooms((prev) => {
        const updated = [...prev, newRoom];
        const sorted = [...updated].sort((a, b) => a.order - b.order);
        const newIndex = sorted.findIndex((r) => r.id === newRoom.id);
        if (newIndex !== -1) {
          setCurrentRoomIndex(newIndex);
        }
        return updated;
      });
    }
    setIsRoomModalOpen(false);
    setEditingRoom(null);
  };

  const handleDeleteRoom = (roomId: string) => {
    setRooms((prev) => {
      const filtered = prev.filter((r) => r.id !== roomId);
      const sorted = [...filtered].sort((a, b) => a.order - b.order);
      if (currentRoomIndex >= sorted.length && sorted.length > 0) {
        setCurrentRoomIndex(sorted.length - 1);
      } else if (sorted.length === 0) {
        setCurrentRoomIndex(0);
      }
      return filtered;
    });
    setItems((prev) => prev.filter((i) => i.roomId !== roomId));
    setIsRoomModalOpen(false);
    setEditingRoom(null);
  };

  const handleEditOrder = () => {
    setIsRoomOrderModalOpen(true);
  };

  const handleSaveRoomOrder = (reorderedRooms: Room[]) => {
    setRooms(reorderedRooms);
    const currentRoomId = currentRoom?.id;
    if (currentRoomId) {
      const newIndex = reorderedRooms.findIndex((r) => r.id === currentRoomId);
      if (newIndex !== -1) {
        setCurrentRoomIndex(newIndex);
      }
    }
  };

  const handleCloseRoomModal = () => {
    setIsRoomModalOpen(false);
    setEditingRoom(null);
  };

  const handleVisualize = () => {
    setIsVisualizationMode(true);
  };

  const handleBackFromVisualization = () => {
    setIsVisualizationMode(false);
  };

  const handleUpdateItemPosition = (itemId: string, x: number, y: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, position: { x, y } } : item
      )
    );
  };

  const handleUpdateRoomBackground = (backgroundImage: string) => {
    if (!currentRoom) return;
    setRooms((prev) =>
      prev.map((room) =>
        room.id === currentRoom.id ? { ...room, backgroundImage } : room
      )
    );
  };

  if (isVisualizationMode && currentRoom) {
    return (
      <RoomVisualization
        room={currentRoom}
        items={currentRoomItems}
        onBack={handleBackFromVisualization}
        onUpdateItemPosition={handleUpdateItemPosition}
        onUpdateRoomBackground={handleUpdateRoomBackground}
      />
    );
  }

  if (!currentRoom) {
    return (
      <main className="app">
        <div className="empty-state">
          <h2>No rooms yet</h2>
          <button className="add-room-button" onClick={handleAddRoom}>
            + Add First Room
          </button>
        </div>
        {isRoomModalOpen && (
          <RoomModal
            room={editingRoom}
            onSave={handleSaveRoom}
            onDelete={editingRoom ? handleDeleteRoom : undefined}
            onClose={handleCloseRoomModal}
          />
        )}
      </main>
    );
  }

  return (
    <main className="app">
      <div className="slider-container">
        <RoomSlide
          room={currentRoom}
          items={currentRoomItems}
          onAddItem={handleAddItem}
          onEditItem={handleEditItem}
          onEditRoom={handleEditRoom}
          onAddRoom={handleAddRoom}
          onEditOrder={handleEditOrder}
          onVisualize={handleVisualize}
        />
      </div>

      <div className="bottom-controls">
        <button
          className="nav-button prev"
          onClick={handlePrevRoom}
          aria-label="Previous room"
        >
          ←
        </button>

        <div className="room-indicators">
          {sortedRooms.map((room, index) => (
            <button
              key={room.id}
              className={`indicator ${
                index === currentRoomIndex ? "active" : ""
              }`}
              onClick={() => setCurrentRoomIndex(index)}
              aria-label={`Go to ${room.name}`}
            />
          ))}
        </div>

        <button
          className="nav-button next"
          onClick={handleNextRoom}
          aria-label="Next room"
        >
          →
        </button>
      </div>

      {isModalOpen && (
        <ItemModal
          item={editingItem}
          onSave={handleSaveItem}
          onDelete={editingItem ? handleDeleteItem : undefined}
          onClose={handleCloseModal}
        />
      )}

      {isRoomModalOpen && (
        <RoomModal
          room={editingRoom}
          onSave={handleSaveRoom}
          onDelete={editingRoom ? handleDeleteRoom : undefined}
          onClose={handleCloseRoomModal}
        />
      )}

      {isRoomOrderModalOpen && (
        <RoomOrderModal
          rooms={rooms}
          onSave={handleSaveRoomOrder}
          onClose={() => setIsRoomOrderModalOpen(false)}
        />
      )}
    </main>
  );
}

export default App;
