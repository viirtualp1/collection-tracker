import { supabase } from "./supabase";
import type { CollectionItem } from "../types";
import type { Database } from "./database.types";

type ItemRow = Database["public"]["Tables"]["items"]["Row"];
type ItemInsert = Database["public"]["Tables"]["items"]["Insert"];
type ItemUpdate = Database["public"]["Tables"]["items"]["Update"];

const mapItemFromDb = (row: ItemRow): CollectionItem => ({
  id: row.id,
  name: row.name,
  description: row.description,
  imageUrl: row.image_url || undefined,
  roomId: row.room_id,
  createdAt: new Date(row.created_at),
  position:
    row.position_x !== null && row.position_y !== null
      ? { x: row.position_x, y: row.position_y }
      : undefined,
});

const mapItemToDb = (
  item: Omit<CollectionItem, "id" | "createdAt" | "roomId">,
  userId: string,
  roomId: string
): ItemInsert => ({
  user_id: userId,
  room_id: roomId,
  name: item.name,
  description: item.description,
  image_url: item.imageUrl || null,
  position_x: item.position?.x || null,
  position_y: item.position?.y || null,
});

export const itemsService = {
  async getAll(userId: string, roomId?: string): Promise<CollectionItem[]> {
    let query = supabase
      .from("items")
      .select("*")
      .eq("user_id", userId);

    if (roomId) {
      query = query.eq("room_id", roomId);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(mapItemFromDb);
  },

  async getById(id: string, userId: string): Promise<CollectionItem | null> {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data ? mapItemFromDb(data) : null;
  },

  async create(
    item: Omit<CollectionItem, "id" | "createdAt" | "roomId">,
    userId: string,
    roomId: string
  ): Promise<CollectionItem> {
    const { data, error } = await supabase
      .from("items")
      .insert(mapItemToDb(item, userId, roomId))
      .select()
      .single();

    if (error) throw error;
    return mapItemFromDb(data);
  },

  async update(
    id: string,
    item: Partial<Omit<CollectionItem, "id" | "createdAt" | "roomId">>,
    userId: string
  ): Promise<CollectionItem> {
    const updateData: ItemUpdate = {
      name: item.name,
      description: item.description,
      image_url: item.imageUrl || null,
      position_x: item.position?.x || null,
      position_y: item.position?.y || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("items")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return mapItemFromDb(data);
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from("items")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
  },

  async updatePosition(
    id: string,
    position: { x: number; y: number },
    userId: string
  ): Promise<CollectionItem> {
    const { data, error } = await supabase
      .from("items")
      .update({
        position_x: position.x,
        position_y: position.y,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return mapItemFromDb(data);
  },
};

