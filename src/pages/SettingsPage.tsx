import React from 'react';
import { motion } from 'framer-motion';

const SettingsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto flex h-[calc(100vh-2rem)] w-full max-w-3xl flex-col md:h-[calc(100vh-3rem)]">
        <div className="mb-6 flex items-center justify-between md:mb-8">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm md:h-12 md:w-12"
            onClick={() => window.location.href = '/'}
          >
            <span className="text-lg md:text-xl">←</span>
          </motion.button>

          <h1 className="text-2xl font-bold text-primary md:text-3xl">设置</h1>

          <div className="h-10 w-10 md:h-12 md:w-12" />
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-bold text-gray-800 md:text-2xl">功能开发中</h2>
          <p className="mt-2 text-gray-600 md:text-lg">这里将放置应用设置项。</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
