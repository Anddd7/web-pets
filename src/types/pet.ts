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
  status: PetStatus;
  avatar: PetAvatar;
  orientation: PetOrientation;
  layout: PetLayout;
}

export interface PetType {
  id: string;
  name: string;
  description: string;
  statusOptions: PetStatus[];
  avatar: PetAvatar;
  orientation: PetOrientation;
  layout: PetLayout;
}

export type PetStatus = 'normal' | 'sleeping';

export type PetPlacement = 'center' | 'left' | 'right';

export type PetOrientation = 'left' | 'right' | 'center';

export interface Position2D {
  x: number;
  y: number;
}

export interface OutfitAnchorConfig {
  hat: Position2D;
  glasses: Position2D;
  clothes: Position2D;
  shoes: Position2D;
}

export interface SideOffsetConfig {
  hat: Position2D;
  glasses: Position2D;
}

export interface PetLayout {
  placement: PetPlacement;
  outfitAnchors: OutfitAnchorConfig;
  sideOffsets: SideOffsetConfig;
}

export interface PetAvatar {
  normal: string;
  sleepingIcon: string;
}

export type OutfitType = 'clothes' | 'hat' | 'shoes' | 'glasses';