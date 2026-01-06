export interface CollectionItem {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  roomId: string;
  createdAt: Date;
  position?: {
    x: number;
    y: number;
  };
}

export interface Room {
  id: string;
  name: string;
  icon?: string;
  order: number;
  backgroundImage?: string;
}
