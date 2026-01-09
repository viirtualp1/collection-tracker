import { useState, useEffect, useCallback } from "react";
import type { Room, CollectionItem } from "./types";
import RoomSlide from "./components/RoomSlide";
import ItemModal from "./components/ItemModal";
import RoomModal from "./components/RoomModal";
import RoomVisualization from "./components/RoomVisualization";
import Auth from "./components/Auth";
import FeedbackButton from "./components/FeedbackButton";
import { authService } from "./lib/auth";
import { roomsService } from "./lib/rooms";
import { itemsService } from "./lib/items";
import { mockRooms, mockItems, mockUser } from "./lib/mockData";
import type { User } from "@supabase/supabase-js";
import "./App.scss";

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === "true";

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
  const [isVisualizationMode, setIsVisualizationMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (userId: string) => {
    try {
      setError(null);

      if (USE_MOCK_DATA) {
        setRooms(mockRooms);
        setItems(mockItems);
        setCurrentRoomIndex((prev) => {
          if (mockRooms.length === 0) return 0;
          return prev >= mockRooms.length ? 0 : prev;
        });
        return;
      }

      const [roomsData, itemsData] = await Promise.all([
        roomsService.getAll(userId),
        itemsService.getAll(userId),
      ]);

      setRooms(roomsData);
      setItems(itemsData);

      setCurrentRoomIndex((prev) => {
        if (roomsData.length === 0) return 0;
        return prev >= roomsData.length ? 0 : prev;
      });
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    }
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      try {
        if (USE_MOCK_DATA) {
          setUser(mockUser as unknown as User);
          setLoading(false);
          return;
        }

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

    if (USE_MOCK_DATA) {
      return;
    }

    const unsubscribe = authService.onAuthStateChange(
      async (event, session) => {
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
      }
    );

    return () => unsubscribe();
  }, [loadData]);

  useEffect(() => {
    if (user) {
      loadData(user.id);
    }
  }, [user, loadData]);

  const handleAuthSuccess = async () => {
    const currentUser = await authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      await loadData(currentUser.id);
    }
  };

  const handleSignOut = async () => {
    if (USE_MOCK_DATA) {
      window.location.reload();
      return;
    }
    await authService.signOut();
  };

  const sortedRooms = [...rooms].sort((a, b) => a.order - b.order);
  const currentRoom = sortedRooms[currentRoomIndex];
  const currentRoomItems = items.filter(
    (item) => item.roomId === currentRoom?.id
  );

  useEffect(() => {
    const updateDocumentTitle = () => {
      if (loading) {
        document.title = "Loading... | Collection Tracker";
        return;
      }

      if (!user) {
        document.title =
          "Collection Tracker - Organize Your Collections by Rooms";
        return;
      }

      if (isVisualizationMode && currentRoom) {
        document.title = `${currentRoom.name} - Visual Mode | Collection Tracker`;
        return;
      }

      if (currentRoom) {
        const itemCount = currentRoomItems.length;
        document.title = `${currentRoom.name} (${itemCount} items) | Collection Tracker`;
        return;
      }

      document.title =
        "Collection Tracker - Organize Your Collections by Rooms";
    };

    updateDocumentTitle();
  }, [
    loading,
    user,
    currentRoom,
    currentRoomItems.length,
    isVisualizationMode,
  ]);

  const roomsItems: Record<string, CollectionItem[]> = {};
  items.forEach((item) => {
    if (!roomsItems[item.roomId]) {
      roomsItems[item.roomId] = [];
    }
    roomsItems[item.roomId].push(item);
  });

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
      if (USE_MOCK_DATA) {
        if (editingItem) {
          setItems((prev) =>
            prev.map((i) =>
              i.id === editingItem.id ? { ...editingItem, ...item } : i
            )
          );
        } else {
          const newItem: CollectionItem = {
            ...item,
            id: `item-${Date.now()}`,
            roomId: currentRoom.id,
            createdAt: new Date(),
          };
          setItems((prev) => [...prev, newItem]);
        }
        setIsModalOpen(false);
        setEditingItem(null);
        return;
      }

      if (editingItem) {
        const updated = await itemsService.update(
          editingItem.id,
          item,
          user.id
        );
        setItems((prev) =>
          prev.map((i) => (i.id === editingItem.id ? updated : i))
        );
      } else {
        const newItem = await itemsService.create(
          item,
          user.id,
          currentRoom.id
        );
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
      if (USE_MOCK_DATA) {
        setItems((prev) => prev.filter((i) => i.id !== itemId));
        setIsModalOpen(false);
        setEditingItem(null);
        return;
      }

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
      if (USE_MOCK_DATA) {
        if (editingRoom) {
          setRooms((prev) =>
            prev.map((r) =>
              r.id === editingRoom.id ? { ...editingRoom, ...roomData } : r
            )
          );
        } else {
          const newRoom: Room = {
            ...roomData,
            id: `room-${Date.now()}`,
            order: rooms.length,
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
        return;
      }

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
      if (USE_MOCK_DATA) {
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
        return;
      }

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
      if (USE_MOCK_DATA) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, position: { x, y } } : item
          )
        );
        return;
      }

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
      if (USE_MOCK_DATA) {
        setRooms((prev) =>
          prev.map((room) =>
            room.id === currentRoom.id ? { ...room, backgroundImage } : room
          )
        );
        return;
      }

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
      <main className="app visualization-mode">
        <RoomVisualization
          room={currentRoom}
          items={currentRoomItems}
          onBack={handleBackFromVisualization}
          onUpdateItemPosition={handleUpdateItemPosition}
          onUpdateRoomBackground={handleUpdateRoomBackground}
        />
      </main>
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
        <aside className="app-sidebar">
          <div className="sidebar-header">
            <h1 className="sidebar-logo">Collection Tracker</h1>
          </div>
          <div className="sidebar-profile">
            <div className="profile-avatar">
              {user.email?.[0].toUpperCase()}
            </div>
            <div className="profile-info">
              <div className="profile-email">{user.email}</div>
              <button className="sign-out-link" onClick={handleSignOut}>
                Sign Out
              </button>
            </div>
          </div>
          <div className="sidebar-actions">
            <FeedbackButton />
          </div>
        </aside>
        <div className="app-content">
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
        </div>
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

      <aside className="app-sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-logo">Collection Tracker</h1>
        </div>
        <div className="sidebar-profile">
          <div className="profile-avatar">{user.email?.[0].toUpperCase()}</div>
          <div className="profile-info">
            <div className="profile-email">{user.email}</div>
            <button className="sign-out-link" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        </div>
        <div className="sidebar-rooms">
          <div className="sidebar-rooms-header">
            <h2 className="sidebar-rooms-title">Rooms</h2>
            <button
              className="sidebar-add-room-button"
              onClick={handleAddRoom}
              aria-label="Add room"
              title="Add room"
            >
              +
            </button>
          </div>
          <div className="rooms-list">
            {sortedRooms.map((room, index) => (
              <button
                key={room.id}
                className={`room-list-item ${
                  index === currentRoomIndex ? "active" : ""
                }`}
                onClick={() => setCurrentRoomIndex(index)}
                aria-label={`Go to ${room.name}`}
              >
                <span className="room-list-icon">{room.icon}</span>
                <span className="room-list-name">{room.name}</span>
                <span className="room-list-count">
                  {roomsItems[room.id]?.length || 0}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="sidebar-actions">
          <FeedbackButton />
        </div>
      </aside>

      <div className="app-content">
        <div className="slider-container">
          <RoomSlide
            room={currentRoom}
            items={currentRoomItems}
            onAddItem={handleAddItem}
            onEditItem={handleEditItem}
            onEditRoom={handleEditRoom}
            onVisualize={handleVisualize}
          />
        </div>

        {isModalOpen && (
          <ItemModal
            key={editingItem?.id ?? "new"}
            item={editingItem}
            onSave={handleSaveItem}
            onDelete={editingItem ? handleDeleteItem : undefined}
            onClose={handleCloseModal}
          />
        )}

        {isRoomModalOpen && (
          <RoomModal
            key={editingRoom?.id ?? "new"}
            room={editingRoom}
            onSave={handleSaveRoom}
            onDelete={editingRoom ? handleDeleteRoom : undefined}
            onClose={handleCloseRoomModal}
          />
        )}
      </div>
    </main>
  );
}

export default App;
