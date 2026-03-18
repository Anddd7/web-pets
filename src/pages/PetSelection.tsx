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
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-4">
      {/* 标题 */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-primary">选择你的宠物</h1>
        <p className="text-gray-600 mt-2">点击宠物查看详情，然后给它起个名字吧！</p>
      </div>

      {!showNameInput ? (
        // 宠物选择列表
        <div className="grid grid-cols-2 gap-4 overflow-y-auto flex-grow">
          {state.availablePets.map(pet => (
            <motion.div
              key={pet.id}
              whileTap={{ scale: 0.95 }}
              className="bg-white rounded-xl p-4 shadow-md cursor-pointer border-2 border-transparent hover:border-primary"
              onClick={() => handlePetSelect(pet)}
            >
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 mb-3">
                  <img 
                    src={pet.imageUrl} 
                    alt={pet.name} 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="font-bold text-lg">{pet.name}</h3>
                <p className="text-sm text-gray-600 text-center mt-1">{pet.description}</p>
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
            className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md"
          >
            <div className="flex flex-col items-center mb-6">
              <div className="w-48 h-48 mb-4">
                <img 
                  src={selectedPet ? selectedPet.imageUrl : ''} 
                  alt={selectedPet?.name || ''} 
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="font-bold text-xl">{selectedPet?.name}</h3>
              <p className="text-sm text-gray-600 text-center mt-1">{selectedPet?.description}</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2" htmlFor="petName">
                给你的宠物起个名字：
              </label>
              <input
                type="text"
                id="petName"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="输入宠物名字"
                maxLength={10}
              />
            </div>
            
            <div className="flex space-x-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-gray-200 text-gray-700 rounded-lg py-2 font-bold"
                onClick={() => setShowNameInput(false)}
              >
                返回
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-primary text-white rounded-lg py-2 font-bold"
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
  );
};

export default PetSelection;