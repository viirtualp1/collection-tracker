import { useState, useEffect } from "react";
import type { Room, CollectionItem } from "./types";
import RoomSlide from "./components/RoomSlide";
import ItemModal from "./components/ItemModal";
import RoomModal from "./components/RoomModal";
import RoomOrderModal from "./components/RoomOrderModal";
import RoomVisualization from "./components/RoomVisualization";
import Auth from "./components/Auth";
import FeedbackButton from "./components/FeedbackButton";
import { authService } from "./lib/auth";
import { roomsService } from "./lib/rooms";
import { itemsService } from "./lib/items";
import type { User } from "@supabase/supabase-js";
import "./App.scss";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CollectionItem | null>(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isRoomOrderModalOpen, setIsRoomOrderModalOpen] = useState(false);
  const [isVisualizationMode, setIsVisualizationMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const session = await authService.getSession();
        if (session?.user) {
          setUser(session.user);
        }
      } catch (err) {
        console.error("Auth error:", err);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const unsubscribe = authService.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        await loadData(session.user.id);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setRooms([]);
        setItems([]);
        setCurrentRoomIndex(0);
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        setUser(session.user);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadData(user.id);
    }
  }, [user]);

  const loadData = async (userId: string) => {
    try {
      setError(null);
      const [roomsData, itemsData] = await Promise.all([
        roomsService.getAll(userId),
        itemsService.getAll(userId),
      ]);

      setRooms(roomsData);
      setItems(itemsData);

      if (roomsData.length > 0 && currentRoomIndex >= roomsData.length) {
        setCurrentRoomIndex(0);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const session = await authService.getSession();
        if (session?.user) {
          setUser(session.user);
        }
      } catch (err) {
        console.error("Auth error:", err);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const unsubscribe = authService.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        await loadData(session.user.id);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setRooms([]);
        setItems([]);
        setCurrentRoomIndex(0);
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        setUser(session.user);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadData(user.id);
    }
  }, [user]);

  const handleAuthSuccess = async () => {
    const currentUser = await authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      await loadData(currentUser.id);
    }
  };

  const handleSignOut = async () => {
    await authService.signOut();
  };

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

  const handleSaveItem = async (
    item: Omit<CollectionItem, "id" | "createdAt" | "roomId">
  ) => {
    if (!user || !currentRoom) return;

    try {
      if (editingItem) {
        const updated = await itemsService.update(editingItem.id, item, user.id);
        setItems((prev) =>
          prev.map((i) => (i.id === editingItem.id ? updated : i))
        );
      } else {
        const newItem = await itemsService.create(item, user.id, currentRoom.id);
        setItems((prev) => [...prev, newItem]);
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error("Error saving item:", err);
      setError(err instanceof Error ? err.message : "Failed to save item");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!user) return;

    try {
      await itemsService.delete(itemId, user.id);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error("Error deleting item:", err);
      setError(err instanceof Error ? err.message : "Failed to delete item");
    }
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

  const handleSaveRoom = async (roomData: Omit<Room, "id" | "order">) => {
    if (!user) return;

    try {
      if (editingRoom) {
        const updated = await roomsService.update(
          editingRoom.id,
          roomData,
          user.id
        );
        setRooms((prev) =>
          prev.map((r) => (r.id === editingRoom.id ? updated : r))
        );
      } else {
        const newRoom = await roomsService.create(roomData, user.id);
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
    } catch (err) {
      console.error("Error saving room:", err);
      setError(err instanceof Error ? err.message : "Failed to save room");
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!user) return;

    try {
      await roomsService.delete(roomId, user.id);
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
    } catch (err) {
      console.error("Error deleting room:", err);
      setError(err instanceof Error ? err.message : "Failed to delete room");
    }
  };

  const handleEditOrder = () => {
    setIsRoomOrderModalOpen(true);
  };

  const handleSaveRoomOrder = async (reorderedRooms: Room[]) => {
    if (!user) return;

    try {
      const updated = await roomsService.updateOrder(reorderedRooms, user.id);
      setRooms(updated);
      const currentRoomId = currentRoom?.id;
      if (currentRoomId) {
        const newIndex = updated.findIndex((r) => r.id === currentRoomId);
        if (newIndex !== -1) {
          setCurrentRoomIndex(newIndex);
        }
      }
    } catch (err) {
      console.error("Error updating room order:", err);
      setError(err instanceof Error ? err.message : "Failed to update order");
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

  const handleUpdateItemPosition = async (
    itemId: string,
    x: number,
    y: number
  ) => {
    if (!user) return;

    try {
      const updated = await itemsService.updatePosition(
        itemId,
        { x, y },
        user.id
      );
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? updated : item))
      );
    } catch (err) {
      console.error("Error updating item position:", err);
    }
  };

  const handleUpdateRoomBackground = async (backgroundImage: string) => {
    if (!currentRoom || !user) return;

    try {
      const updated = await roomsService.update(
        currentRoom.id,
        { backgroundImage },
        user.id
      );
      setRooms((prev) =>
        prev.map((room) => (room.id === currentRoom.id ? updated : room))
      );
    } catch (err) {
      console.error("Error updating room background:", err);
    }
  };

  if (loading) {
    return (
      <main className="app">
        <div className="empty-state">
          <h2>Loading...</h2>
        </div>
      </main>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  if (isVisualizationMode && currentRoom) {
    return (
      <>
        <RoomVisualization
          room={currentRoom}
          items={currentRoomItems}
          onBack={handleBackFromVisualization}
          onUpdateItemPosition={handleUpdateItemPosition}
          onUpdateRoomBackground={handleUpdateRoomBackground}
        />
        <FeedbackButton />
      </>
    );
  }

  if (!currentRoom) {
    return (
      <main className="app">
        {error && (
          <div className="error-banner" role="alert">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}
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
        <FeedbackButton />
      </main>
    );
  }

  return (
    <main className="app">
      {error && (
        <div className="error-banner" role="alert">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="app-header">
        <div className="user-info">
          <span className="user-email">{user.email}</span>
          <button className="sign-out-button" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>

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
          <svg
            width="24"
            height="24"
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
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
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

      <FeedbackButton />
    </main>
  );
}

export default App;
