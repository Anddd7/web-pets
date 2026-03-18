export interface Pet {
  id: string;
  name: string;
  type: string;
  age: number;
  hunger: number;      // 0-100
  happiness: number;   // 0-100
  energy: number;      // 0-100
  isSleeping: boolean;
  currentOutfit: {
    clothes?: string;
    hat?: string;
    shoes?: string;
    glasses?: string;
  };
  ownedOutfits: {
    clothes: string[];
    hats: string[];
    shoes: string[];
    glasses: string[];
  };
  lastInteraction: Date;
  imageUrl: string;
  sleepImageUrl: string;
  animations: {
    idle: string[];
    happy: string[];
    eating: string[];
    sleeping: string[];
  };
}

export interface PetType {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  sleepImageUrl: string;
  animations: {
    idle: string[];
    happy: string[];
    eating: string[];
    sleeping: string[];
  };
}

export type OutfitType = 'clothes' | 'hat' | 'shoes' | 'glasses';