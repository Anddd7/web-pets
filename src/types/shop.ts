export interface ShopItem {
  id: string;
  name: string;
  type: 'food' | 'clothes' | 'hat' | 'shoes' | 'glasses';
  price: number;
  effect?: {
    hunger?: number;
    happiness?: number;
    energy?: number;
  };
  imageUrl: string;
  isOwned: boolean;
  description: string;
}

export type ShopItemType = 'food' | 'clothes' | 'hat' | 'shoes' | 'glasses';

export interface ShopCategory {
  id: ShopItemType;
  name: string;
  icon: string;
}

export interface UserInventory {
  coins: number;
  items: {
    food: string[];
    clothes: string[];
    hats: string[];
    shoes: string[];
    glasses: string[];
  };
}