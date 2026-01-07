import { supabase } from "./supabase";
import type { Room } from "../types";
import type { Database } from "./database.types";

type RoomRow = Database["public"]["Tables"]["rooms"]["Row"];
type RoomInsert = Database["public"]["Tables"]["rooms"]["Insert"];
type RoomUpdate = Database["public"]["Tables"]["rooms"]["Update"];

const mapRoomFromDb = (row: RoomRow): Room => ({
  id: row.id,
  name: row.name,
  icon: row.icon || undefined,
  order: row.order,
  backgroundImage: row.background_image || undefined,
});

const mapRoomToDb = (
  room: Omit<Room, "id" | "order">,
  userId: string,
  order?: number
): RoomInsert => ({
  user_id: userId,
  name: room.name,
  icon: room.icon || null,
  order: order ?? 0,
  background_image: room.backgroundImage || null,
});

export const roomsService = {
  async getAll(userId: string): Promise<Room[]> {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("user_id", userId)
      .order("order", { ascending: true });

    if (error) throw error;
    return (data || []).map(mapRoomFromDb);
  },

  async getById(id: string, userId: string): Promise<Room | null> {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data ? mapRoomFromDb(data) : null;
  },

  async create(room: Omit<Room, "id" | "order">, userId: string): Promise<Room> {
    const { data: existingRooms } = await supabase
      .from("rooms")
      .select("order")
      .eq("user_id", userId)
      .order("order", { ascending: false })
      .limit(1);

    const maxOrder = existingRooms?.[0]?.order ?? -1;
    const newOrder = maxOrder + 1;

    const { data, error } = await supabase
      .from("rooms")
      .insert(mapRoomToDb(room, userId, newOrder))
      .select()
      .single();

    if (error) throw error;
    return mapRoomFromDb(data);
  },

  async update(
    id: string,
    room: Partial<Omit<Room, "id" | "order">>,
    userId: string
  ): Promise<Room> {
    const updateData: RoomUpdate = {
      name: room.name,
      icon: room.icon || null,
      background_image: room.backgroundImage || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("rooms")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return mapRoomFromDb(data);
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from("rooms")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
  },

  async updateOrder(rooms: Room[], userId: string): Promise<Room[]> {
    const updates = rooms.map((room, index) => ({
      id: room.id,
      order: index,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from("rooms")
      .upsert(updates, { onConflict: "id" })
      .eq("user_id", userId)
      .select()
      .order("order", { ascending: true });

    if (error) throw error;
    return (data || []).map(mapRoomFromDb);
  },
};

