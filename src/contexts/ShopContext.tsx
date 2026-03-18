import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { ShopItem, ShopItemType, UserInventory, ShopCategory } from '../types/shop';
import { saveToStorage, loadFromStorage } from '../utils/storage';
import { useTasks } from './TaskContext';
import shopConfig from '../config/shop.json';

type ShopConfig = {
  categories: ShopCategory[];
  items: ShopItem[];
};

const typedShopConfig = shopConfig as ShopConfig;

const buildDefaultShopItems = (): ShopItem[] => {
  return typedShopConfig.items.map(item => ({
    ...item,
    isOwned: false,
  }));
};

const SHOP_ITEMS: ShopItem[] = buildDefaultShopItems();
const SHOP_CATEGORIES: ShopCategory[] = typedShopConfig.categories;

interface ShopState {
  items: ShopItem[];
  categories: ShopCategory[];
  inventory: UserInventory;
  isLoading: boolean;
}

type ShopAction =
  | { type: 'LOAD_SHOP_DATA'; payload: { items: ShopItem[]; inventory: UserInventory } }
  | { type: 'BUY_ITEM'; payload: { itemId: string } }
  | { type: 'USE_ITEM'; payload: { itemId: string } }
  | { type: 'RESET_SHOP' };

const initialState: ShopState = {
  items: SHOP_ITEMS,
  categories: SHOP_CATEGORIES,
  inventory: {
    coins: 0,
    items: {
      food: [],
      clothes: [],
      hats: [],
      shoes: [],
      glasses: [],
    },
  },
  isLoading: true,
};

const getInventoryCategoryKey = (type: ShopItemType): keyof UserInventory['items'] => {
  return type === 'hat' ? 'hats' : type;
};

const ShopContext = createContext<{
  state: ShopState;
  dispatch: React.Dispatch<ShopAction>;
  buyItem: (itemId: string) => boolean;
  useItem: (itemId: string) => boolean;
  getItemsByCategory: (category: ShopItemType) => ShopItem[];
  getInventoryItemsByCategory: (category: ShopItemType) => ShopItem[];
  getItemById: (itemId: string) => ShopItem | undefined;
} | undefined>(undefined);

const shopReducer = (state: ShopState, action: ShopAction): ShopState => {
  switch (action.type) {
    case 'LOAD_SHOP_DATA':
      return {
        ...state,
        items: action.payload.items,
        inventory: action.payload.inventory,
        isLoading: false,
      };

    case 'BUY_ITEM':
      const { itemId } = action.payload;
      const itemToBuy = state.items.find(item => item.id === itemId);
      
      if (!itemToBuy || itemToBuy.isOwned) {
        return state;
      }

      const updatedItems = state.items.map(item => 
        item.id === itemId ? { ...item, isOwned: true } : item
      );

      const updatedInventory = {
        ...state.inventory,
        items: {
          ...state.inventory.items,
          [getInventoryCategoryKey(itemToBuy.type)]: [
            ...state.inventory.items[getInventoryCategoryKey(itemToBuy.type)],
            itemId,
          ],
        },
      };

      // 保存到本地存储
      saveToStorage('shopItems', updatedItems);
      saveToStorage('inventory', updatedInventory);

      return {
        ...state,
        items: updatedItems,
        inventory: updatedInventory,
      };

    case 'USE_ITEM':
      const itemToUse = state.items.find(item => item.id === action.payload.itemId);
      
      if (!itemToUse || !itemToUse.isOwned) {
        return state;
      }

      // 食物类物品使用后从库存中移除
      if (itemToUse.type === 'food') {
        const updatedFoodInventory = state.inventory.items.food.filter(id => id !== itemToUse.id);
        const updatedItemsAfterUse = state.items.map(item =>
          item.id === itemToUse.id ? { ...item, isOwned: false } : item
        );
        
        const updatedInventoryAfterUse = {
          ...state.inventory,
          items: {
            ...state.inventory.items,
            food: updatedFoodInventory,
          },
        };

        saveToStorage('shopItems', updatedItemsAfterUse);
        saveToStorage('inventory', updatedInventoryAfterUse);

        return {
          ...state,
          items: updatedItemsAfterUse,
          inventory: updatedInventoryAfterUse,
        };
      }

      // 装扮类物品不需要从库存中移除
      return state;

    case 'RESET_SHOP':
      const resetInventory: UserInventory = {
        coins: 0,
        items: {
          food: [],
          clothes: [],
          hats: [],
          shoes: [],
          glasses: [],
        },
      };

      saveToStorage('shopItems', SHOP_ITEMS);
      saveToStorage('inventory', resetInventory);

      return {
        ...state,
        items: SHOP_ITEMS,
        inventory: resetInventory,
      };

    default:
      return state;
  }
};

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(shopReducer, initialState);
  const { state: taskState, spendCoins } = useTasks();

  const normalizeSavedItems = (savedItems: ShopItem[]): ShopItem[] => {
    const savedItemsMap = new Map(savedItems.map(item => [item.id, item]));

    return SHOP_ITEMS.map(defaultItem => {
      const savedItem = savedItemsMap.get(defaultItem.id);
      if (!savedItem) {
        return defaultItem;
      }

      return {
        ...defaultItem,
        isOwned: savedItem.isOwned,
      };
    });
  };

  // 加载保存的商店数据
  useEffect(() => {
    const savedItems = loadFromStorage<ShopItem[]>('shopItems');
    const savedInventory = loadFromStorage<UserInventory>('inventory');

    if (savedItems && savedInventory) {
      const normalizedItems = normalizeSavedItems(savedItems);
      dispatch({
        type: 'LOAD_SHOP_DATA',
        payload: {
          items: normalizedItems,
          inventory: savedInventory,
        },
      });
    } else {
      // 初始化库存
      const initialInventory: UserInventory = {
        coins: taskState.totalCoins,
        items: {
          food: [],
          clothes: [],
          hats: [],
          shoes: [],
          glasses: [],
        },
      };

      dispatch({
        type: 'LOAD_SHOP_DATA',
        payload: {
          items: SHOP_ITEMS,
          inventory: initialInventory,
        },
      });
    }
  }, []);

  // 同步金币数量
  useEffect(() => {
    if (!state.isLoading) {
      const updatedInventory = {
        ...state.inventory,
        coins: taskState.totalCoins,
      };

      if (updatedInventory.coins !== state.inventory.coins) {
        saveToStorage('inventory', updatedInventory);
        dispatch({
          type: 'LOAD_SHOP_DATA',
          payload: {
            items: state.items,
            inventory: updatedInventory,
          },
        });
      }
    }
  }, [taskState.totalCoins, state.isLoading]);

  const buyItem = (itemId: string): boolean => {
    const itemToBuy = state.items.find(item => item.id === itemId);
    
    if (!itemToBuy || itemToBuy.isOwned) {
      return false;
    }

    const paid = spendCoins(itemToBuy.price);
    if (!paid) {
      return false;
    }

    dispatch({ type: 'BUY_ITEM', payload: { itemId } });
    return true;
  };

  const useItem = (itemId: string): boolean => {
    const itemToUse = state.items.find(item => item.id === itemId);
    
    if (!itemToUse || !itemToUse.isOwned) {
      return false;
    }

    dispatch({ type: 'USE_ITEM', payload: { itemId } });
    return true;
  };

  const getItemsByCategory = (category: ShopItemType): ShopItem[] => {
    return state.items.filter(item => item.type === category);
  };

  const getInventoryItemsByCategory = (category: ShopItemType): ShopItem[] => {
    const itemIds = state.inventory.items[getInventoryCategoryKey(category)];
    return state.items.filter(item => itemIds.includes(item.id));
  };

  const getItemById = (itemId: string): ShopItem | undefined => {
    return state.items.find(item => item.id === itemId);
  };

  return (
    <ShopContext.Provider
      value={{
        state,
        dispatch,
        buyItem,
        useItem,
        getItemsByCategory,
        getInventoryItemsByCategory,
        getItemById,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};