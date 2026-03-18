import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePet } from '../contexts/PetContext';
import { PetType } from '../types/pet';

const PetSelection: React.FC = () => {
  const { state, selectPet } = usePet();
  const [selectedPet, setSelectedPet] = useState<PetType | null>(null);
  const [petName, setPetName] = useState<string>('');
  const [showNameInput, setShowNameInput] = useState<boolean>(false);

  // 处理宠物选择
  const handlePetSelect = (pet: PetType) => {
    setSelectedPet(pet);
    setPetName(pet.name);
    setShowNameInput(true);
  };

  // 处理领养宠物
  const handleAdopt = () => {
    if (selectedPet && petName.trim()) {
      selectPet(selectedPet, petName.trim());
      window.location.href = '/';
    }
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-4xl animate-bounce">⏳</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto flex h-[calc(100vh-2rem)] w-full max-w-5xl flex-col md:h-[calc(100vh-3rem)]">
      {/* 标题 */}
      <div className="mb-6 text-center md:mb-8">
        <h1 className="text-3xl font-bold text-primary md:text-4xl">选择你的宠物</h1>
        <p className="mt-2 text-gray-600 md:text-lg">点击宠物查看详情，然后给它起个名字吧！</p>
      </div>

      {!showNameInput ? (
        // 宠物选择列表
        <div className="grid flex-grow grid-cols-2 gap-4 overflow-y-auto md:gap-5">
          {state.availablePets.map(pet => (
            <motion.div
              key={pet.id}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer rounded-xl border-2 border-transparent bg-white p-4 shadow-md hover:border-primary md:p-5"
              onClick={() => handlePetSelect(pet)}
            >
              <div className="flex flex-col items-center">
                <div className="mb-3 h-32 w-32 md:h-40 md:w-40">
                  <img 
                    src={pet.avatar.normal}
                    alt={pet.name} 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-lg font-bold md:text-xl">{pet.name}</h3>
                <p className="mt-1 text-center text-sm text-gray-600 md:text-base">{pet.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        // 宠物命名和确认
        <div className="flex flex-col items-center justify-center flex-grow">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg md:max-w-xl md:p-8"
          >
            <div className="mb-6 flex flex-col items-center md:mb-7">
              <div className="mb-4 h-48 w-48 md:h-56 md:w-56">
                <img 
                  src={selectedPet ? selectedPet.avatar.normal : ''}
                  alt={selectedPet?.name || ''} 
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-xl font-bold md:text-2xl">{selectedPet?.name}</h3>
              <p className="mt-1 text-center text-sm text-gray-600 md:text-base">{selectedPet?.description}</p>
            </div>
            
            <div className="mb-4 md:mb-5">
              <label className="mb-2 block font-bold text-gray-700 md:text-lg" htmlFor="petName">
                给你的宠物起个名字：
              </label>
              <input
                type="text"
                id="petName"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary md:py-3 md:text-lg"
                placeholder="输入宠物名字"
                maxLength={10}
              />
            </div>
            
            <div className="flex space-x-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="flex-1 rounded-lg bg-gray-200 py-2 font-bold text-gray-700 md:py-3 md:text-lg"
                onClick={() => setShowNameInput(false)}
              >
                返回
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="flex-1 rounded-lg bg-primary py-2 font-bold text-white md:py-3 md:text-lg"
                onClick={handleAdopt}
                disabled={!petName.trim()}
                style={{ opacity: petName.trim() ? 1 : 0.5 }}
              >
                领养
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
      </div>
    </div>
  );
};

export default PetSelection;