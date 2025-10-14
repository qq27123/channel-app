import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const ContentFilterContext = createContext({});

// 跨平台存储工具
const storage = {
  async setItem(key, value) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  
  async getItem(key) {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  }
};

// 默认敏感词库
const DEFAULT_SENSITIVE_WORDS = [
  // 暴力相关
  '暴力', '打架', '斗殴', '杀人', '伤害',
  
  // 色情相关  
  '色情', '黄色', '裸体', '性交', '淫荡',
  
  // 赌博相关
  '赌博', '赌场', '老虎机', '彩票', '博彩',
  
  // 毒品相关
  '毒品', '吸毒', '海洛因', '冰毒', '大麻',
  
  // 诈骗相关
  '诈骗', '骗钱', '传销', '非法集资', '洗钱',
  
  // 政治敏感（根据实际需要调整）
  '推翻', '颠覆', '反动', '暴乱',
  
  // 其他违规
  '自杀', '爆炸', '恐怖主义', '人口贩卖'
];

// 过滤严级别
export const FILTER_LEVELS = {
  STRICT: 'strict',     // 严格模式
  MODERATE: 'moderate', // 中等模式  
  LOOSE: 'loose'        // 宽松模式
};

// 过滤结果类型
export const FILTER_ACTIONS = {
  ALLOW: 'allow',       // 允许
  WARN: 'warn',         // 警告
  BLOCK: 'block',       // 阻止
  REPLACE: 'replace'    // 替换
};

export const ContentFilterProvider = ({ children }) => {
  const [sensitiveWords, setSensitiveWords] = useState(DEFAULT_SENSITIVE_WORDS);
  const [filterLevel, setFilterLevel] = useState(FILTER_LEVELS.MODERATE);
  const [customWords, setCustomWords] = useState([]);
  const [whitelistWords, setWhitelistWords] = useState([]);
  const [filterEnabled, setFilterEnabled] = useState(true);

  useEffect(() => {
    loadFilterSettings();
  }, []);

  // 加载过滤设置
  const loadFilterSettings = async () => {
    try {
      const settings = await storage.getItem('contentFilterSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setFilterLevel(parsed.filterLevel || FILTER_LEVELS.MODERATE);
        setCustomWords(parsed.customWords || []);
        setWhitelistWords(parsed.whitelistWords || []);
        setFilterEnabled(parsed.filterEnabled !== false);
        
        // 合并默认词库和自定义词库
        const allWords = [...DEFAULT_SENSITIVE_WORDS, ...parsed.customWords];
        setSensitiveWords(allWords);
      }
    } catch (error) {
      console.error('加载过滤设置失败:', error);
    }
  };

  // 保存过滤设置
  const saveFilterSettings = async (settings) => {
    try {
      await storage.setItem('contentFilterSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('保存过滤设置失败:', error);
    }
  };

  // 内容过滤核心函数
  const filterContent = (content) => {
    if (!filterEnabled || !content || typeof content !== 'string') {
      return {
        action: FILTER_ACTIONS.ALLOW,
        filteredContent: content,
        detectedWords: [],
        suggestions: []
      };
    }

    const lowerContent = content.toLowerCase();
    const detectedWords = [];
    let filteredContent = content;
    
    // 检测敏感词
    for (const word of sensitiveWords) {
      const lowerWord = word.toLowerCase();
      
      // 检查是否在白名单中
      if (whitelistWords.includes(word)) {
        continue;
      }
      
      if (lowerContent.includes(lowerWord)) {
        detectedWords.push(word);
        
        // 根据过滤级别进行替换
        const replacement = '*'.repeat(word.length);
        const regex = new RegExp(word, 'gi');
        filteredContent = filteredContent.replace(regex, replacement);
      }
    }

    // 根据检测结果和过滤级别决定动作
    if (detectedWords.length === 0) {
      return {
        action: FILTER_ACTIONS.ALLOW,
        filteredContent: content,
        detectedWords: [],
        suggestions: []
      };
    }

    // 根据过滤级别决定处理方式
    let action;
    switch (filterLevel) {
      case FILTER_LEVELS.STRICT:
        action = FILTER_ACTIONS.BLOCK;
        break;
      case FILTER_LEVELS.MODERATE:
        action = detectedWords.length >= 3 ? FILTER_ACTIONS.BLOCK : FILTER_ACTIONS.REPLACE;
        break;
      case FILTER_LEVELS.LOOSE:
        action = detectedWords.length >= 5 ? FILTER_ACTIONS.BLOCK : FILTER_ACTIONS.REPLACE;
        break;
      default:
        action = FILTER_ACTIONS.WARN;
    }

    return {
      action,
      filteredContent: action === FILTER_ACTIONS.REPLACE ? filteredContent : content,
      detectedWords,
      suggestions: generateSuggestions(detectedWords)
    };
  };

  // 生成修改建议
  const generateSuggestions = (detectedWords) => {
    const suggestions = [];
    
    detectedWords.forEach(word => {
      switch (word) {
        case '暴力':
          suggestions.push('可以改为"冲突"或"争执"');
          break;
        case '赌博':
          suggestions.push('可以改为"投机"或"风险投资"');
          break;
        default:
          suggestions.push(`请避免使用"${word}"相关内容`);
      }
    });
    
    return suggestions;
  };

  // 批量过滤内容（用于消息列表等）
  const filterContentBatch = (contentList) => {
    return contentList.map(item => {
      if (typeof item === 'string') {
        return filterContent(item);
      } else if (item && typeof item.content === 'string') {
        const result = filterContent(item.content);
        return {
          ...item,
          content: result.filteredContent,
          filterResult: result
        };
      }
      return item;
    });
  };

  // 更新过滤级别
  const updateFilterLevel = async (level) => {
    setFilterLevel(level);
    const settings = {
      filterLevel: level,
      customWords,
      whitelistWords,
      filterEnabled
    };
    await saveFilterSettings(settings);
  };

  // 添加自定义敏感词
  const addCustomWord = async (word) => {
    if (!word || customWords.includes(word)) {
      return { success: false, error: '词汇已存在或为空' };
    }
    
    const newCustomWords = [...customWords, word];
    setCustomWords(newCustomWords);
    setSensitiveWords([...DEFAULT_SENSITIVE_WORDS, ...newCustomWords]);
    
    const settings = {
      filterLevel,
      customWords: newCustomWords,
      whitelistWords,
      filterEnabled
    };
    await saveFilterSettings(settings);
    
    return { success: true };
  };

  // 移除自定义敏感词
  const removeCustomWord = async (word) => {
    const newCustomWords = customWords.filter(w => w !== word);
    setCustomWords(newCustomWords);
    setSensitiveWords([...DEFAULT_SENSITIVE_WORDS, ...newCustomWords]);
    
    const settings = {
      filterLevel,
      customWords: newCustomWords,
      whitelistWords,
      filterEnabled
    };
    await saveFilterSettings(settings);
    
    return { success: true };
  };

  // 添加白名单词汇
  const addWhitelistWord = async (word) => {
    if (!word || whitelistWords.includes(word)) {
      return { success: false, error: '词汇已存在或为空' };
    }
    
    const newWhitelistWords = [...whitelistWords, word];
    setWhitelistWords(newWhitelistWords);
    
    const settings = {
      filterLevel,
      customWords,
      whitelistWords: newWhitelistWords,
      filterEnabled
    };
    await saveFilterSettings(settings);
    
    return { success: true };
  };

  // 移除白名单词汇
  const removeWhitelistWord = async (word) => {
    const newWhitelistWords = whitelistWords.filter(w => w !== word);
    setWhitelistWords(newWhitelistWords);
    
    const settings = {
      filterLevel,
      customWords,
      whitelistWords: newWhitelistWords,
      filterEnabled
    };
    await saveFilterSettings(settings);
    
    return { success: true };
  };

  // 切换过滤开关
  const toggleFilter = async (enabled) => {
    setFilterEnabled(enabled);
    const settings = {
      filterLevel,
      customWords,
      whitelistWords,
      filterEnabled: enabled
    };
    await saveFilterSettings(settings);
  };

  // 检查内容是否安全（快速检查）
  const isContentSafe = (content) => {
    const result = filterContent(content);
    return result.action === FILTER_ACTIONS.ALLOW;
  };

  // 获取过滤统计信息
  const getFilterStats = () => {
    return {
      totalSensitiveWords: sensitiveWords.length,
      customWordsCount: customWords.length,
      whitelistWordsCount: whitelistWords.length,
      filterLevel,
      filterEnabled
    };
  };

  // 重置过滤设置
  const resetFilterSettings = async () => {
    setFilterLevel(FILTER_LEVELS.MODERATE);
    setCustomWords([]);
    setWhitelistWords([]);
    setSensitiveWords(DEFAULT_SENSITIVE_WORDS);
    setFilterEnabled(true);
    
    const settings = {
      filterLevel: FILTER_LEVELS.MODERATE,
      customWords: [],
      whitelistWords: [],
      filterEnabled: true
    };
    await saveFilterSettings(settings);
  };

  const value = {
    // 状态
    filterLevel,
    filterEnabled,
    customWords,
    whitelistWords,
    sensitiveWords,

    // 核心功能
    filterContent,
    filterContentBatch,
    isContentSafe,

    // 设置管理
    updateFilterLevel,
    toggleFilter,
    addCustomWord,
    removeCustomWord,
    addWhitelistWord,
    removeWhitelistWord,
    resetFilterSettings,

    // 工具函数
    getFilterStats,

    // 常量
    FILTER_LEVELS,
    FILTER_ACTIONS
  };

  return (
    <ContentFilterContext.Provider value={value}>
      {children}
    </ContentFilterContext.Provider>
  );
};

export const useContentFilter = () => {
  const context = useContext(ContentFilterContext);
  if (!context) {
    throw new Error('useContentFilter must be used within a ContentFilterProvider');
  }
  return context;
};