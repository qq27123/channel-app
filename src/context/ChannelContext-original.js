import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { DatabaseService, FirebaseHelper } from '../services/firebaseService';
import { useAuth } from './AuthContext';

const ChannelContext = createContext({});

// 🔄 混合存储策略：Firestore + 本地缓存
// Firestore作为主数据源，本地存储作为缓存和离线支持
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

// 🔥 Firebase数据迁移：保留默认分类数据
const defaultCategories = ['全部', '科技', '生活', '娱乐', '教育', '其他'];

// 🏷️ 用于标记已完成数据迁移
let isCategoriesMigrated = false;

export const ChannelProvider = ({ children }) => {
  const { user } = useAuth();
  const [allChannels, setAllChannels] = useState([]);
  const [userChannels, setUserChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [channelCategories, setChannelCategories] = useState(defaultCategories);
  const [isOnline, setIsOnline] = useState(true);
  const [channelsUnsubscribe, setChannelsUnsubscribe] = useState(null);
  const [subscriptionsUnsubscribe, setSubscriptionsUnsubscribe] = useState(null);

  useEffect(() => {
    initializeChannelSystem();
    
    // 清理函数
    return () => {
      if (channelsUnsubscribe) {
        channelsUnsubscribe();
      }
      if (subscriptionsUnsubscribe) {
        subscriptionsUnsubscribe();
      }
    };
  }, []);

  // 获取所有频道
  const getChannels = () => {
    return allChannels;
  };

  // 获取用户订阅的频道（包括用户自己创建的频道）
  // 注意：只有用户订阅或创建的频道才会显示在"我的频道"中
  const getUserChannels = (userId) => {
    return allChannels.filter(channel => {
      // 用户创建的频道
      const isCreator = channel.creatorId === userId;
      // 用户订阅的频道
      const isSubscriber = channel.subscribers.includes(userId);
      // 只返回用户创建或订阅的频道
      return isCreator || isSubscriber;
    });
  };

  // 创建频道（仅管理员）
  const createChannel = async (channelData, creatorId, creatorName) => {
    try {
      const newChannel = {
        id: channelIdCounter.toString(),
        ...channelData,
        creatorId,
        creatorName,
        creatorAvatar: null,
        subscriberCount: 0,
        subscribers: [],
        pendingRequests: [], // 新增：待审核申请列表
        memberExpiry: {}, // 新增：成员过期时间 {userId: expiryTimestamp}
        hideTodayContent: false, // 新增：是否隐藏当天内容（默认关闭）
        posts: [],
        createdAt: Date.now()
      };

      channels.push(newChannel);
      channelIdCounter++;
      setAllChannels([...channels]);

      return { success: true, channel: newChannel };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // 申请订阅频道
  const requestSubscription = async (channelId, userId, userInfo) => {
    try {
      const channelIndex = channels.findIndex(c => c.id === channelId);
      if (channelIndex === -1) {
        throw new Error('频道不存在');
      }

      const channel = channels[channelIndex];
      
      // 检查是否已经是成员
      if (channel.subscribers.includes(userId)) {
        throw new Error('已经是频道成员');
      }

      // 检查是否已经有待审核的申请
      const existingRequest = channel.pendingRequests.find(r => r.userId === userId);
      if (existingRequest) {
        throw new Error('已有待审核的申请');
      }

      // 创建订阅申请
      const request = {
        id: requestIdCounter.toString(),
        channelId,
        userId,
        userNickname: userInfo.nickname,
        userAvatar: userInfo.avatar,
        userPhone: userInfo.phone,
        status: 'pending', // pending, approved, rejected
        requestTime: Date.now()
      };

      channel.pendingRequests.push(request);
      subscriptionRequests.push(request);
      requestIdCounter++;

      channels[channelIndex] = channel;
      setAllChannels([...channels]);

      return { success: true, request };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // 取消订阅申请
  const cancelSubscriptionRequest = async (channelId, userId) => {
    try {
      const channelIndex = channels.findIndex(c => c.id === channelId);
      if (channelIndex === -1) {
        throw new Error('频道不存在');
      }

      const channel = channels[channelIndex];
      channel.pendingRequests = channel.pendingRequests.filter(r => r.userId !== userId);
      subscriptionRequests = subscriptionRequests.filter(r => !(r.channelId === channelId && r.userId === userId));

      channels[channelIndex] = channel;
      setAllChannels([...channels]);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // 检查用户是否有待审核的申请
  const hasPendingRequest = (channelId, userId) => {
    const channel = channels.find(c => c.id === channelId);
    if (!channel) return false;
    return channel.pendingRequests.some(r => r.userId === userId);
  };

  // 获取频道的所有待审核申请
  const getChannelPendingRequests = (channelId) => {
    const channel = channels.find(c => c.id === channelId);
    return channel ? channel.pendingRequests : [];
  };

  // 审核订阅申请
  const approveSubscription = async (channelId, userId, duration) => {
    try {
      const channelIndex = channels.findIndex(c => c.id === channelId);
      if (channelIndex === -1) {
        throw new Error('频道不存在');
      }

      const channel = channels[channelIndex];
      
      // 移除待审核申请
      channel.pendingRequests = channel.pendingRequests.filter(r => r.userId !== userId);
      subscriptionRequests = subscriptionRequests.filter(r => !(r.channelId === channelId && r.userId === userId));

      // 添加到订阅者列表
      if (!channel.subscribers.includes(userId)) {
        channel.subscribers.push(userId);
        channel.subscriberCount += 1;
      }

      // 设置成员过期时间
      const now = Date.now();
      let expiryTime;
      switch (duration) {
        case '1minute':
          expiryTime = now + 60 * 1000; // 1分钟（测试用）
          break;
        case '1month':
          expiryTime = now + 30 * 24 * 60 * 60 * 1000; // 30天
          break;
        case '3months':
          expiryTime = now + 90 * 24 * 60 * 60 * 1000; // 90天
          break;
        case '6months':
          expiryTime = now + 180 * 24 * 60 * 60 * 1000; // 180天
          break;
        case '1year':
          expiryTime = now + 365 * 24 * 60 * 60 * 1000; // 365天
          break;
        default:
          expiryTime = now + 30 * 24 * 60 * 60 * 1000; // 默认1个月
      }

      channel.memberExpiry[userId] = expiryTime;

      channels[channelIndex] = channel;
      setAllChannels([...channels]);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // 拒绝订阅申请
  const rejectSubscription = async (channelId, userId) => {
    try {
      const channelIndex = channels.findIndex(c => c.id === channelId);
      if (channelIndex === -1) {
        throw new Error('频道不存在');
      }

      const channel = channels[channelIndex];
      
      // 移除待审核申请
      channel.pendingRequests = channel.pendingRequests.filter(r => r.userId !== userId);
      subscriptionRequests = subscriptionRequests.filter(r => !(r.channelId === channelId && r.userId === userId));

      channels[channelIndex] = channel;
      setAllChannels([...channels]);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // 检查并移除过期成员
  const checkAndRemoveExpiredMembers = () => {
    const now = Date.now();
    let hasChanges = false;

    channels.forEach(channel => {
      if (channel.memberExpiry) {
        Object.keys(channel.memberExpiry).forEach(userId => {
          const expiryTime = channel.memberExpiry[userId];
          if (expiryTime && expiryTime < now) {
            // 成员已过期，移除
            channel.subscribers = channel.subscribers.filter(id => id !== userId);
            channel.subscriberCount = Math.max(0, channel.subscriberCount - 1);
            delete channel.memberExpiry[userId];
            hasChanges = true;
          }
        });
      }
    });

    if (hasChanges) {
      setAllChannels([...channels]);
    }
  };

  // 定期检查过期成员
  useEffect(() => {
    const interval = setInterval(() => {
      checkAndRemoveExpiredMembers();
    }, 10000); // 每10秒检查一次（方便测试）

    return () => clearInterval(interval);
  }, []);

  // 获取用户在频道的过期时间
  const getMemberExpiry = (channelId, userId) => {
    const channel = channels.find(c => c.id === channelId);
    return channel?.memberExpiry?.[userId] || null;
  };

  // 发布内容到频道
  const postToChannel = async (channelId, post, creatorId) => {
    try {
      const channelIndex = channels.findIndex(c => c.id === channelId);
      if (channelIndex === -1) {
        throw new Error('频道不存在');
      }

      const newPost = {
        id: postIdCounter.toString(),
        ...post,
        timestamp: Date.now(),
        creatorId
      };

      channels[channelIndex].posts.unshift(newPost); // 最新的在前面
      postIdCounter++;
      setAllChannels([...channels]);

      return { success: true, post: newPost };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // 修改帖子发布时间
  const updatePostTime = async (channelId, postId, newTimestamp) => {
    try {
      const channelIndex = channels.findIndex(c => c.id === channelId);
      if (channelIndex === -1) {
        throw new Error('频道不存在');
      }

      const channel = channels[channelIndex];
      const postIndex = channel.posts.findIndex(p => p.id === postId);
      if (postIndex === -1) {
        throw new Error('帖子不存在');
      }

      channel.posts[postIndex].timestamp = newTimestamp;
      channels[channelIndex] = channel;
      setAllChannels([...channels]);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // 修改帖子内容
  const updatePostContent = async (channelId, postId, newContent) => {
    try {
      const channelIndex = channels.findIndex(c => c.id === channelId);
      if (channelIndex === -1) {
        throw new Error('频道不存在');
      }

      const channel = channels[channelIndex];
      const postIndex = channel.posts.findIndex(p => p.id === postId);
      if (postIndex === -1) {
        throw new Error('帖子不存在');
      }

      channel.posts[postIndex].content = newContent;
      channels[channelIndex] = channel;
      setAllChannels([...channels]);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // 获取频道详情
  const getChannelById = (channelId) => {
    return channels.find(c => c.id === channelId);
  };

  // 删除频道（仅创建者）
  const deleteChannel = async (channelId, userId) => {
    try {
      const channelIndex = channels.findIndex(c => c.id === channelId);
      if (channelIndex === -1) {
        throw new Error('频道不存在');
      }

      const channel = channels[channelIndex];
      if (channel.creatorId !== userId) {
        throw new Error('只有创建者可以删除频道');
      }

      channels.splice(channelIndex, 1);
      setAllChannels([...channels]);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // 检查用户是否订阅了频道
  const isUserSubscribed = (channelId, userId) => {
    const channel = channels.find(c => c.id === channelId);
    return channel ? channel.subscribers.includes(userId) : false;
  };

  // 更新订阅人数（仅创建者）
  const updateSubscriberCount = async (channelId, newCount, userId) => {
    try {
      const channelIndex = channels.findIndex(c => c.id === channelId);
      if (channelIndex === -1) {
        throw new Error('频道不存在');
      }

      const channel = channels[channelIndex];
      if (channel.creatorId !== userId) {
        throw new Error('只有创建者可以修改订阅人数');
      }

      // 确保新数字不小于实际订阅人数
      const actualSubscribers = channel.subscribers.length;
      if (newCount < actualSubscribers) {
        throw new Error(`订阅人数不能小于实际订阅人数(${actualSubscribers})`);
      }

      channels[channelIndex].subscriberCount = newCount;
      setAllChannels([...channels]);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // 切换隐藏当天内容状态（仅频道主）
  const toggleHideTodayContent = async (channelId, userId) => {
    try {
      const channelIndex = channels.findIndex(c => c.id === channelId);
      if (channelIndex === -1) {
        throw new Error('频道不存在');
      }

      const channel = channels[channelIndex];
      if (channel.creatorId !== userId) {
        throw new Error('只有频道主可以修改此设置');
      }

      // 切换状态
      channels[channelIndex].hideTodayContent = !channel.hideTodayContent;
      setAllChannels([...channels]);

      return { 
        success: true, 
        hideTodayContent: channels[channelIndex].hideTodayContent 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // 获取分类列表
  const getCategories = () => {
    return channelCategories;
  };

  // 获取可用于创建频道的分类（不包括"全部"）
  const getCreateCategories = () => {
    return channelCategories.filter(category => category !== '全部');
  };

  // 更新分类名称（仅管理员，不能修改"全部"分类）
  const updateCategoryName = async (categoryIndex, newName, isAdmin) => {
    try {
      if (!isAdmin) {
        throw new Error('只有管理员可以修改分类名称');
      }

      if (categoryIndex === 0) {
        throw new Error('"全部"分类不可修改');
      }

      if (categoryIndex < 0 || categoryIndex >= categories.length) {
        throw new Error('分类索引无效');
      }

      if (!newName || !newName.trim()) {
        throw new Error('分类名称不能为空');
      }

      const trimmedName = newName.trim();
      if (trimmedName.length > 10) {
        throw new Error('分类名称不能超过10个字符');
      }

      // 检查是否与现有分类重名
      if (categories.some((cat, index) => index !== categoryIndex && cat === trimmedName)) {
        throw new Error('分类名称已存在');
      }

      const oldName = categories[categoryIndex];
      categories[categoryIndex] = trimmedName;
      setChannelCategories([...categories]);

      // 同时更新所有使用旧分类名的频道
      channels.forEach(channel => {
        if (channel.category === oldName) {
          channel.category = trimmedName;
        }
      });
      setAllChannels([...channels]);

      return { success: true, oldName, newName: trimmedName };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    channels: allChannels,
    loading,
    getChannels,
    getUserChannels,
    createChannel,
    // 订阅申请相关
    requestSubscription,
    cancelSubscriptionRequest,
    hasPendingRequest,
    getChannelPendingRequests,
    approveSubscription,
    rejectSubscription,
    getMemberExpiry,
    // 其他功能
    postToChannel,
    updatePostTime,
    updatePostContent,
    getChannelById,
    deleteChannel,
    isUserSubscribed,
    updateSubscriberCount,
    toggleHideTodayContent,
    // 分类管理功能
    categories: channelCategories,
    getCategories,
    getCreateCategories,
    updateCategoryName
  };

  return (
    <ChannelContext.Provider value={value}>
      {children}
    </ChannelContext.Provider>
  );
};

export const useChannel = () => {
  const context = useContext(ChannelContext);
  if (!context) {
    throw new Error('useChannel must be used within a ChannelProvider');
  }
  return context;
};