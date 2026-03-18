/**
 * 语音交互工具函数
 */

// 语音命令列表
export const VOICE_COMMANDS = [
  {
    command: '早上好',
    responses: ['早上好！今天真是美好的一天！', '早安！祝你有个愉快的一天！', '你好早啊！今天有什么计划吗？'],
  },
  {
    command: '晚上好',
    responses: ['晚上好！今天过得怎么样？', '晚安！希望你今天过得愉快！', '晚上好！准备睡觉了吗？'],
  },
  {
    command: '你好',
    responses: ['你好！很高兴见到你！', '嗨！今天过得怎么样？', '你好呀！有什么我能帮你的吗？'],
  },
  {
    command: '你今天开心吗',
    responses: ['当然开心啦！因为有你陪我！', '我超级开心！你呢？', '和你在一起我总是很开心！'],
  },
  {
    command: '我喜欢你',
    responses: ['我也喜欢你！', '谢谢你！我也爱你！', '你是我最好的朋友！'],
  },
  {
    command: '再见',
    responses: ['再见！期待下次见到你！', '拜拜！记得早点回来哦！', '再见！要想我哦！'],
  },
  {
    command: '你饿了吗',
    responses: ['有一点饿了...', '我可以吃点东西！', '是的，我想吃东西！'],
  },
  {
    command: '你累了吗',
    responses: ['有一点累...', '我需要休息一下...', '是的，我想睡一觉...'],
  },
  {
    command: '我爱你',
    responses: ['我也爱你！', '你是最棒的！', '我好幸福！'],
  },
  {
    command: '一起玩',
    responses: ['好呀！玩什么呢？', '太棒了！我最喜欢玩游戏了！', '玩游戏时间！'],
  },
];

// 初始化语音识别
export const initSpeechRecognition = (): SpeechRecognition | null => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.error('Speech recognition not supported in this browser');
    return null;
  }
  
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'zh-CN';
  
  return recognition;
};

// 语音合成
export const speak = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis not supported in this browser'));
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.9; // 稍微慢一点，适合儿童
    utterance.pitch = 1.2; // 稍微高一点，更可爱
    utterance.volume = 1;
    
    utterance.onend = () => {
      resolve();
    };
    
    utterance.onerror = (event) => {
      reject(event.error);
    };
    
    window.speechSynthesis.speak(utterance);
  });
};

// 查找匹配的语音命令
export const findMatchingCommand = (text: string): string | null => {
  const lowerText = text.toLowerCase();
  
  for (const command of VOICE_COMMANDS) {
    if (lowerText.includes(command.command.toLowerCase())) {
      // 从该命令的多个回复中随机选择一个
      const randomIndex = Math.floor(Math.random() * command.responses.length);
      return command.responses[randomIndex];
    }
  }
  
  // 如果没有匹配的命令，返回一个默认回复
  const defaultResponses = [
    '抱歉，我没听懂...',
    '能再说一遍吗？',
    '我不太明白你的意思...',
    '你能换个说法吗？',
  ];
  
  const randomIndex = Math.floor(Math.random() * defaultResponses.length);
  return defaultResponses[randomIndex];
};

// 播放音效
export const playSound = (soundUrl: string): void => {
  const audio = new Audio(soundUrl);
  audio.play().catch(error => {
    console.error('Error playing sound:', error);
  });
};

// 检查浏览器是否支持语音API
export const checkVoiceSupport = (): {
  speechRecognition: boolean;
  speechSynthesis: boolean;
} => {
  return {
    speechRecognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
    speechSynthesis: 'speechSynthesis' in window,
  };
};