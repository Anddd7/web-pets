import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Pet, PetType } from '../types/pet';
import { saveToStorage, loadFromStorage } from '../utils/storage';
import { checkPetSleepStatus } from '../utils/time';
import petDefinitions from '../config/pets.json';

const PET_TYPES: PetType[] = petDefinitions as PetType[];

interface PetState {
  selectedPet: Pet | null;
  availablePets: PetType[];
  isLoading: boolean;
}

type PetAction =
  | { type: 'SELECT_PET'; payload: { petType: PetType; name: string } }
  | { type: 'UPDATE_PET_STATUS'; payload: Partial<Pet> }
  | { type: 'FEED_PET'; payload: { foodId: string; effect: { hunger?: number; happiness?: number; energy?: number } } }
  | { type: 'DRESS_PET'; payload: { outfitType: 'clothes' | 'hat' | 'shoes' | 'glasses'; itemId: string } }
  | { type: 'UNDRESS_PET'; payload: { outfitType: 'clothes' | 'hat' | 'shoes' | 'glasses' } }
  | { type: 'INTERACT_WITH_PET'; payload: { type: 'play' | 'pet' | 'clean' } }
  | { type: 'UPDATE_SLEEP_STATUS'; payload: { isSleeping: boolean } }
  | { type: 'LOAD_PET'; payload: Pet }
  | { type: 'RESET_PET' };

const initialState: PetState = {
  selectedPet: null,
  availablePets: PET_TYPES,
  isLoading: true,
};

const PetContext = createContext<{
  state: PetState;
  dispatch: React.Dispatch<PetAction>;
  selectPet: (petType: PetType, name: string) => void;
  feedPet: (foodId: string, effect: { hunger?: number; happiness?: number; energy?: number }) => void;
  dressPet: (outfitType: 'clothes' | 'hat' | 'shoes' | 'glasses', itemId: string) => void;
  undressPet: (outfitType: 'clothes' | 'hat' | 'shoes' | 'glasses') => void;
  interactWithPet: (type: 'play' | 'pet' | 'clean') => void;
  updatePetStatus: (updates: Partial<Pet>) => void;
} | undefined>(undefined);

const petReducer = (state: PetState, action: PetAction): PetState => {
  switch (action.type) {
    case 'SELECT_PET':
      const { petType, name } = action.payload;
      const newPet: Pet = {
        id: petType.id,
        name: name || petType.name,
        type: petType.id,
        age: 0,
        hunger: 80,
        happiness: 90,
        energy: 100,
        isSleeping: checkPetSleepStatus(),
        currentOutfit: {},
        ownedOutfits: {
          clothes: [],
          hats: [],
          shoes: [],
          glasses: [],
        },
        lastInteraction: new Date(),
        imageUrl: petType.imageUrl,
        sleepImageUrl: petType.sleepImageUrl,
        animations: petType.animations,
      };
      saveToStorage('selectedPet', newPet);
      return {
        ...state,
        selectedPet: newPet,
        isLoading: false,
      };

    case 'UPDATE_PET_STATUS':
      if (!state.selectedPet) return state;
      const updatedPet = { ...state.selectedPet, ...action.payload };
      saveToStorage('selectedPet', updatedPet);
      return {
        ...state,
        selectedPet: updatedPet,
      };

    case 'FEED_PET':
      if (!state.selectedPet) return state;
      const { foodId, effect } = action.payload;
      const fedPet = {
        ...state.selectedPet,
        hunger: Math.min(100, state.selectedPet.hunger + (effect.hunger || 0)),
        happiness: Math.min(100, state.selectedPet.happiness + (effect.happiness || 0)),
        energy: Math.min(100, state.selectedPet.energy + (effect.energy || 0)),
        lastInteraction: new Date(),
      };
      saveToStorage('selectedPet', fedPet);
      return {
        ...state,
        selectedPet: fedPet,
      };

    case 'DRESS_PET':
      if (!state.selectedPet) return state;
      const { outfitType, itemId } = action.payload;
      const dressedPet = {
        ...state.selectedPet,
        currentOutfit: {
          ...state.selectedPet.currentOutfit,
          [outfitType]: itemId,
        },
      };
      saveToStorage('selectedPet', dressedPet);
      return {
        ...state,
        selectedPet: dressedPet,
      };

    case 'UNDRESS_PET':
      if (!state.selectedPet) return state;
      const { outfitType: typeToRemove } = action.payload;
      const { [typeToRemove]: removed, ...remainingOutfit } = state.selectedPet.currentOutfit;
      const undressedPet = {
        ...state.selectedPet,
        currentOutfit: remainingOutfit,
      };
      saveToStorage('selectedPet', undressedPet);
      return {
        ...state,
        selectedPet: undressedPet,
      };

    case 'INTERACT_WITH_PET':
      if (!state.selectedPet) return state;
      const interactionType = action.payload.type;
      let updatedHappiness = state.selectedPet.happiness;
      let updatedEnergy = state.selectedPet.energy;
      
      switch (interactionType) {
        case 'play':
          updatedHappiness = Math.min(100, updatedHappiness + 10);
          updatedEnergy = Math.max(0, updatedEnergy - 10);
          break;
        case 'pet':
          updatedHappiness = Math.min(100, updatedHappiness + 5);
          break;
        case 'clean':
          updatedHappiness = Math.min(100, updatedHappiness + 3);
          updatedEnergy = Math.max(0, updatedEnergy - 5);
          break;
      }

      const interactedPet = {
        ...state.selectedPet,
        happiness: updatedHappiness,
        energy: updatedEnergy,
        lastInteraction: new Date(),
      };
      saveToStorage('selectedPet', interactedPet);
      return {
        ...state,
        selectedPet: interactedPet,
      };

    case 'UPDATE_SLEEP_STATUS':
      if (!state.selectedPet) return state;
      const sleepUpdatedPet = {
        ...state.selectedPet,
        isSleeping: action.payload.isSleeping,
      };
      saveToStorage('selectedPet', sleepUpdatedPet);
      return {
        ...state,
        selectedPet: sleepUpdatedPet,
      };

    case 'LOAD_PET':
      return {
        ...state,
        selectedPet: action.payload,
        isLoading: false,
      };

    case 'RESET_PET':
      saveToStorage('selectedPet', null);
      return {
        ...state,
        selectedPet: null,
        isLoading: false,
      };

    default:
      return state;
  }
};

export const PetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(petReducer, initialState);

  // 加载保存的宠物数据
  useEffect(() => {
    const savedPet = loadFromStorage<Pet>('selectedPet');
    if (savedPet) {
      // 更新睡眠状态
      const isSleeping = checkPetSleepStatus();
      dispatch({ 
        type: 'LOAD_PET', 
        payload: { ...savedPet, isSleeping } 
      });
    } else {
      dispatch({ type: 'RESET_PET' });
    }
  }, []);

  // 定期更新宠物状态
  useEffect(() => {
    if (!state.selectedPet) return;

    const interval = setInterval(() => {
      const now = new Date();
      const lastInteraction = new Date(state.selectedPet!.lastInteraction);
      const hoursPassed = (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60);

      // 每小时减少饥饿度和能量
      if (hoursPassed >= 1) {
        const hungerDecrease = Math.min(20, hoursPassed * 5);
        const energyDecrease = Math.min(15, hoursPassed * 3);
        
        dispatch({
          type: 'UPDATE_PET_STATUS',
          payload: {
            hunger: Math.max(0, state.selectedPet!.hunger - hungerDecrease),
            energy: Math.max(0, state.selectedPet!.energy - energyDecrease),
            lastInteraction: now,
          },
        });
      }

      // 检查睡眠状态
      const isSleeping = checkPetSleepStatus();
      if (state.selectedPet!.isSleeping !== isSleeping) {
        dispatch({
          type: 'UPDATE_SLEEP_STATUS',
          payload: { isSleeping },
        });

        // 睡眠时恢复能量
        if (isSleeping) {
          dispatch({
            type: 'UPDATE_PET_STATUS',
            payload: {
              energy: Math.min(100, state.selectedPet!.energy + 5),
            },
          });
        }
      }
    }, 60000); // 每分钟检查一次

    return () => clearInterval(interval);
  }, [state.selectedPet]);

  const selectPet = (petType: PetType, name: string) => {
    dispatch({ type: 'SELECT_PET', payload: { petType, name } });
  };

  const feedPet = (foodId: string, effect: { hunger?: number; happiness?: number; energy?: number }) => {
    dispatch({ type: 'FEED_PET', payload: { foodId, effect } });
  };

  const dressPet = (outfitType: 'clothes' | 'hat' | 'shoes' | 'glasses', itemId: string) => {
    dispatch({ type: 'DRESS_PET', payload: { outfitType, itemId } });
  };

  const undressPet = (outfitType: 'clothes' | 'hat' | 'shoes' | 'glasses') => {
    dispatch({ type: 'UNDRESS_PET', payload: { outfitType } });
  };

  const interactWithPet = (type: 'play' | 'pet' | 'clean') => {
    dispatch({ type: 'INTERACT_WITH_PET', payload: { type } });
  };

  const updatePetStatus = (updates: Partial<Pet>) => {
    dispatch({ type: 'UPDATE_PET_STATUS', payload: updates });
  };

  return (
    <PetContext.Provider
      value={{
        state,
        dispatch,
        selectPet,
        feedPet,
        dressPet,
        undressPet,
        interactWithPet,
        updatePetStatus,
      }}
    >
      {children}
    </PetContext.Provider>
  );
};

export const usePet = () => {
  const context = useContext(PetContext);
  if (context === undefined) {
    throw new Error('usePet must be used within a PetProvider');
  }
  return context;
};