import { ShopItem } from '../types/shop';

export const getShopItemImageUrl = (item: ShopItem): string => {
  return item.imageUrl;
};
