import type { Room, CollectionItem } from "../types";

export const mockRooms: Room[] = [
  {
    id: "room-1",
    name: "Living Room",
    icon: "🛋️",
    order: 0,
    backgroundImage: undefined,
  },
  {
    id: "room-2",
    name: "Kitchen",
    icon: "🍳",
    order: 1,
    backgroundImage: undefined,
  },
  {
    id: "room-3",
    name: "Bedroom",
    icon: "🛏️",
    order: 2,
    backgroundImage: undefined,
  },
];

export const mockItems: CollectionItem[] = [
  {
    id: "item-1",
    name: "Vintage Clock",
    description: "Beautiful antique wall clock from the 1920s",
    imageUrl:
      "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=400",
    roomId: "room-1",
    createdAt: new Date("2024-01-15"),
    position: { x: 100, y: 150 },
  },
  {
    id: "item-2",
    name: "Leather Sofa",
    description: "Comfortable brown leather sofa",
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
    roomId: "room-1",
    createdAt: new Date("2024-01-16"),
    position: { x: 300, y: 200 },
  },
  {
    id: "item-3",
    name: "Coffee Maker",
    description: "Espresso machine with milk frother",
    imageUrl:
      "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400",
    roomId: "room-2",
    createdAt: new Date("2024-01-17"),
    position: { x: 150, y: 100 },
  },
  {
    id: "item-4",
    name: "Reading Lamp",
    description: "Modern adjustable desk lamp",
    imageUrl:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
    roomId: "room-3",
    createdAt: new Date("2024-01-18"),
    position: { x: 250, y: 180 },
  },
];

export const mockUser = {
  id: "mock-user-id",
  email: "demo@example.com",
  aud: "authenticated",
  role: "authenticated",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {},
};
