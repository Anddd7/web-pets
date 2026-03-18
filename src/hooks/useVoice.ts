import { useState, useEffect, useCallback } from 'react';
import { initSpeechRecognition, speak, findMatchingCommand, checkVoiceSupport, playSound } from '../utils/voice';

interface UseVoiceReturn {
  isListening: boolean;
  isSupported: boolean;
  lastCommand: string | null;
  lastResponse: string | null;
  startListening: () => void;
  stopListening: () => void;
  speakText: (text: string) => Promise<void>;
  processCommand: (command: string) => Promise<string>;
}

export const useVoice = (): UseVoiceReturn => {
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<string | null>(null);

  // 初始化语音识别
  useEffect(() => {
    const support = checkVoiceSupport();
    setIsSupported(support.speechRecognition && support.speechSynthesis);

    if (support.speechRecognition) {
      const recognitionInstance = initSpeechRecognition();
      setRecognition(recognitionInstance);
    }

    return () => {
      // 清理
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  // 处理语音识别结果
  const handleRecognitionResult = useCallback((event: SpeechRecognitionEvent) => {
    const transcript = event.results[0][0].transcript;
    setLastCommand(transcript);
    
    // 查找匹配的命令并生成回复
    processCommand(transcript);
  }, []);

  // 处理语音识别错误
  const handleRecognitionError = useCallback((event: SpeechRecognitionErrorEvent) => {
    console.error('Speech recognition error:', event.error);
    setIsListening(false);
    
    // 根据错误类型给出不同的反馈
    if (event.error === 'no-speech') {
      speakText('我没有听到任何声音，能再说一遍吗？');
    } else if (event.error === 'audio-capture') {
      speakText('请确保您的麦克风已开启。');
    } else {
      speakText('抱歉，我没有听清楚。');
    }
  }, []);

  // 开始监听
  const startListening = useCallback(() => {
    if (!recognition || isListening) return;

    try {
      recognition.onresult = handleRecognitionResult;
      recognition.onerror = handleRecognitionError;
      recognition.onend = () => setIsListening(false);
      
      recognition.start();
      setIsListening(true);
      
      // 播放开始监听的音效
      playSound('/sounds/listening_start.mp3');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
    }
  }, [recognition, isListening, handleRecognitionResult, handleRecognitionError]);

  // 停止监听
  const stopListening = useCallback(() => {
    if (!recognition || !isListening) return;

    try {
      recognition.stop();
      setIsListening(false);
      
      // 播放停止监听的音效
      playSound('/sounds/listening_stop.mp3');
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }, [recognition, isListening]);

  // 语音合成
  const speakText = useCallback(async (text: string): Promise<void> => {
    try {
      setLastResponse(text);
      await speak(text);
    } catch (error) {
      console.error('Error speaking text:', error);
    }
  }, []);

  // 处理命令
  const processCommand = useCallback(async (command: string): Promise<string> => {
    const response = findMatchingCommand(command);
    
    if (response) {
      await speakText(response);
      return response;
    }
    
    return '';
  }, [speakText]);

  return {
    isListening,
    isSupported,
    lastCommand,
    lastResponse,
    startListening,
    stopListening,
    speakText,
    processCommand,
  };
};