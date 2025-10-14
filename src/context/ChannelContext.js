import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { DatabaseService, FirebaseHelper } from '../services/firebaseService';
import { useAuth } from './AuthContext';

const ChannelContext = createContext({});

// 🔄 混合存储策略：Firestore + 本地缓存
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

  // 监听用户变化，重新设置订阅监听
  useEffect(() => {
    if (user && user.id) {
      setupUserSubscriptionsListener(user.id);
    } else {
      setUserChannels([]);
      if (subscriptionsUnsubscribe) {
        subscriptionsUnsubscribe();
      }
    }
  }, [user]);

  // 🚀 初始化频道系统
  const initializeChannelSystem = async () => {
    try {
      console.log('🔥 初始化频道系统...');
      
      // 1. 检查并迁移分类数据
      await checkAndMigrateCategories();
      
      // 2. 设置频道实时监听
      setupChannelsListener();
      
      console.log('✅ 频道系统初始化完成');
    } catch (error) {
      console.error('❗ 频道系统初始化失败:', error);
      // 尝试从本地恢复数据
      await loadLocalData();
    }
  };

  // 🔄 检查并迁移默认分类数据
  const checkAndMigrateCategories = async () => {
    if (isCategoriesMigrated) return;
    
    try {
      console.log('🔄 检查分类数据迁移状态...');
      
      // 检查Firestore中是否已有分类数据
      const categoriesResult = await DatabaseService.getCollection('categories', [
        { type: 'orderBy', field: 'order', direction: 'asc' }
      ]);
      
      if (!categoriesResult.success || categoriesResult.data.length === 0) {
        console.log('🚀 开始迁移默认分类数据...');
        
        // 迁移默认分类
        for (let i = 0; i < defaultCategories.length; i++) {
          const category = defaultCategories[i];
          try {
            const categoryData = {
              name: category,
              description: `${category}相关内容`,
              icon: null,
              color: null,
              order: i,
              channelCount: 0,
              isDefault: true,
              isActive: true,
              createdBy: 'system'
            };
            
            await DatabaseService.create('categories', categoryData, `category-${i}`);
            console.log(`✅ 分类迁移成功: ${category}`);
          } catch (error) {
            console.error(`❗ 分类迁移失败: ${category}`, error);
          }
        }
        
        console.log('🎉 分类数据迁移完成!');
      } else {
        console.log('✅ 分类数据已存在，无需迁移');
        // 更新本地分类列表
        const categoryNames = categoriesResult.data.map(cat => cat.name);
        setChannelCategories(categoryNames);
      }
      
      isCategoriesMigrated = true;
    } catch (error) {
      console.error('❗ 分类数据迁移失败:', error);
      // 不阻塞系统启动，使用默认分类
      setChannelCategories(defaultCategories);
    }
  };

  // 🔍 设置频道实时监听
  const setupChannelsListener = () => {
    try {
      console.log('🔍 设置频道实时监听...');
      
      const unsubscribe = DatabaseService.onCollectionSnapshot(
        'channels',
        (channelsData) => {
          console.log(`🔄 频道数据更新: ${channelsData.length}个频道`);
          setAllChannels(channelsData);
          
          // 缓存到本地
          storage.setItem('channels', JSON.stringify(channelsData));
        },
        [
          { type: 'where', field: 'status', operator: '==', value: 'active' },
          { type: 'orderBy', field: 'createdAt', direction: 'desc' }
        ]
      );
      
      setChannelsUnsubscribe(() => unsubscribe);
    } catch (error) {
      console.error('❗ 频道监听设置失败:', error);
    }
  };

  // 🔔 设置用户订阅监听
  const setupUserSubscriptionsListener = (userId) => {
    try {
      console.log(`🔔 设置用户订阅监听: ${userId}`);
      
      const unsubscribe = DatabaseService.onCollectionSnapshot(
        'subscriptions',
        (subscriptionsData) => {
          console.log(`🔄 用户订阅数据更新: ${subscriptionsData.length}个订阅`);
          
          // 获取用户订阅的频道ID列表
          const subscribedChannelIds = subscriptionsData
            .filter(sub => sub.status === 'approved')
            .map(sub => sub.channelId);
          
          // 获取用户订阅的频道列表（包括用户创建的频道）
          const userChannelsList = allChannels.filter(channel => 
            subscribedChannelIds.includes(channel.id) || channel.creatorId === userId
          );
          
          setUserChannels(userChannelsList);
          
          // 缓存到本地
          storage.setItem(`userChannels_${userId}`, JSON.stringify(userChannelsList));
        },
        [
          { type: 'where', field: 'userId', operator: '==', value: userId }
        ]
      );
      
      setSubscriptionsUnsubscribe(() => unsubscribe);
    } catch (error) {
      console.error('❗ 用户订阅监听设置失败:', error);
    }
  };

  // 💾 从本地加载数据（离线支持）
  const loadLocalData = async () => {
    try {
      console.log('💾 从本地加载数据...');
      
      const localChannels = await storage.getItem('channels');
      if (localChannels) {
        const channelsData = JSON.parse(localChannels);
        setAllChannels(channelsData);
        console.log(`💾 从本地加载了 ${channelsData.length} 个频道`);
      }
      
      if (user && user.id) {
        const localUserChannels = await storage.getItem(`userChannels_${user.id}`);
        if (localUserChannels) {
          const userChannelsData = JSON.parse(localUserChannels);
          setUserChannels(userChannelsData);
          console.log(`💾 从本地加载了 ${userChannelsData.length} 个用户频道`);
        }
      }
    } catch (error) {
      console.error('❗ 本地数据加载失败:', error);
    }
  };

  // 🔍 获取所有频道
  const getChannels = () => {
    return allChannels;
  };

  // 🔍 获取用户订阅的频道（包括用户自己创建的频道）
  const getUserChannels = (userId) => {
    if (!userId) return [];
    return userChannels;
  };

  // 🎯 创建频道（Firebase版本）
  const createChannel = async (channelData, creatorId, creatorName) => {
    try {
      console.log('🚀 创建新频道:', channelData.title);
      
      if (!user || user.role !== 'admin') {
        throw new Error('只有管理员可以创建频道');
      }

      // 准备频道数据
      const newChannelData = {
        title: channelData.title,
        description: channelData.description,
        category: channelData.category,
        creatorId: creatorId,
        creatorInfo: {
          nickname: creatorName,
          avatar: user.avatar || null
        },
        subscriberCount: 0,
        messageCount: 0,
        lastMessageAt: null,
        isPublic: channelData.isPublic !== false,
        status: 'active',
        settings: {
          allowComments: true,
          allowImages: true,
          moderationEnabled: false,
          ...(channelData.settings || {})
        }
      };

      // 在 Firestore 中创建频道
      const result = await DatabaseService.create('channels', newChannelData);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      console.log('✅ 频道创建成功:', result.id);
      
      return { 
        success: true, 
        channel: { 
          id: result.id, 
          ...newChannelData 
        } 
      };
    } catch (error) {
      console.error('❗ 频道创建失败:', error.message);
      return { success: false, error: error.message };
    }
  };

  // 🔔 申请订阅频道（Firebase版本）
  const requestSubscription = async (channelId, userId, userInfo) => {
    try {
      console.log('🚀 申请订阅频道:', channelId);
      
      // 检查频道是否存在
      const channelResult = await DatabaseService.getDoc('channels', channelId);
      if (!channelResult.success) {
        throw new Error('频道不存在');
      }

      // 检查是否已经订阅
      const existingSubscription = await DatabaseService.getCollection('subscriptions', [
        { type: 'where', field: 'userId', operator: '==', value: userId },
        { type: 'where', field: 'channelId', operator: '==', value: channelId }
      ]);

      if (existingSubscription.success && existingSubscription.data.length > 0) {
        const subscription = existingSubscription.data[0];
        if (subscription.status === 'approved') {
          throw new Error('已经是频道成员');
        } else if (subscription.status === 'pending') {
          throw new Error('已有待审核的申请');
        }
      }

      // 创建订阅申请
      const subscriptionData = {
        userId: userId,
        channelId: channelId,
        userInfo: {
          nickname: userInfo.nickname,
          avatar: userInfo.avatar || null,
          phone: userInfo.phone
        },
        channelInfo: {
          title: channelResult.data.title,
          category: channelResult.data.category
        },
        status: 'pending',
        notificationEnabled: true,
        lastReadAt: null,
        subscribeAt: new Date(),
        approvedAt: null,
        rejectedAt: null
      };

      const result = await DatabaseService.create('subscriptions', subscriptionData);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      console.log('✅ 订阅申请提交成功:', result.id);
      
      return { 
        success: true, 
        request: { 
          id: result.id, 
          ...subscriptionData 
        } 
      };
    } catch (error) {
      console.error('❗ 订阅申请失败:', error.message);
      return { success: false, error: error.message };
    }
  };

  // 🚫 取消订阅申请（Firebase版本）
  const cancelSubscriptionRequest = async (channelId, userId) => {
    try {
      console.log('🚀 取消订阅申请:', channelId);
      
      // 查找待审核的申请
      const subscriptionsResult = await DatabaseService.getCollection('subscriptions', [
        { type: 'where', field: 'userId', operator: '==', value: userId },
        { type: 'where', field: 'channelId', operator: '==', value: channelId },
        { type: 'where', field: 'status', operator: '==', value: 'pending' }
      ]);

      if (!subscriptionsResult.success || subscriptionsResult.data.length === 0) {
        throw new Error('未找到待审核的申请');
      }

      // 删除申请
      const subscription = subscriptionsResult.data[0];
      const result = await DatabaseService.delete('subscriptions', subscription.id);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      console.log('✅ 订阅申请取消成功');
      
      return { success: true };
    } catch (error) {
      console.error('❗ 取消订阅申请失败:', error.message);
      return { success: false, error: error.message };
    }
  };

  // ❓ 检查用户是否有待审核的申请
  const hasPendingRequest = async (channelId, userId) => {
    try {
      const subscriptionsResult = await DatabaseService.getCollection('subscriptions', [
        { type: 'where', field: 'userId', operator: '==', value: userId },
        { type: 'where', field: 'channelId', operator: '==', value: channelId },
        { type: 'where', field: 'status', operator: '==', value: 'pending' }
      ]);

      return subscriptionsResult.success && subscriptionsResult.data.length > 0;
    } catch (error) {
      console.error('❗ 检查申请状态失败:', error);
      return false;
    }
  };

  // 📋 获取频道的所有待审核申请
  const getChannelPendingRequests = async (channelId) => {
    try {
      const subscriptionsResult = await DatabaseService.getCollection('subscriptions', [
        { type: 'where', field: 'channelId', operator: '==', value: channelId },
        { type: 'where', field: 'status', operator: '==', value: 'pending' },
        { type: 'orderBy', field: 'subscribeAt', direction: 'desc' }
      ]);

      if (subscriptionsResult.success) {
        return subscriptionsResult.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error('❗ 获取待审核申请失败:', error);
      return [];
    }
  };

  // ✅ 审核订阅申请（Firebase版本）
  const approveSubscription = async (channelId, userId, duration = '1month') => {
    try {
      console.log('🚀 审核通过订阅申请:', channelId, userId);
      
      // 查找待审核的申请
      const subscriptionsResult = await DatabaseService.getCollection('subscriptions', [
        { type: 'where', field: 'userId', operator: '==', value: userId },
        { type: 'where', field: 'channelId', operator: '==', value: channelId },
        { type: 'where', field: 'status', operator: '==', value: 'pending' }
      ]);

      if (!subscriptionsResult.success || subscriptionsResult.data.length === 0) {
        throw new Error('未找到待审核的申请');
      }

      // 计算过期时间
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

      // 更新订阅状态
      const subscription = subscriptionsResult.data[0];
      const updateData = {
        status: 'approved',
        approvedAt: new Date(),
        expiresAt: new Date(expiryTime)
      };

      const result = await DatabaseService.update('subscriptions', subscription.id, updateData);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      console.log('✅ 订阅申请审核通过');
      
      return { success: true };
    } catch (error) {
      console.error('❗ 审核订阅申请失败:', error.message);
      return { success: false, error: error.message };
    }
  };

  // ❌ 拒绝订阅申请（Firebase版本）
  const rejectSubscription = async (channelId, userId) => {
    try {
      console.log('🚀 拒绝订阅申请:', channelId, userId);
      
      // 查找待审核的申请
      const subscriptionsResult = await DatabaseService.getCollection('subscriptions', [
        { type: 'where', field: 'userId', operator: '==', value: userId },
        { type: 'where', field: 'channelId', operator: '==', value: channelId },
        { type: 'where', field: 'status', operator: '==', value: 'pending' }
      ]);

      if (!subscriptionsResult.success || subscriptionsResult.data.length === 0) {
        throw new Error('未找到待审核的申请');
      }

      // 更新订阅状态
      const subscription = subscriptionsResult.data[0];
      const updateData = {
        status: 'rejected',
        rejectedAt: new Date()
      };

      const result = await DatabaseService.update('subscriptions', subscription.id, updateData);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      console.log('✅ 订阅申请已拒绝');
      
      return { success: true };
    } catch (error) {
      console.error('❗ 拒绝订阅申请失败:', error.message);
      return { success: false, error: error.message };
    }
  };

  // 📊 提供给组件的值
  const value = {
    // 📊 状态
    allChannels,
    userChannels,
    loading,
    channelCategories,
    isOnline,
    
    // 🔍 数据获取
    getChannels,
    getUserChannels,
    
    // 🎯 频道管理
    createChannel,
    
    // 🔔 订阅管理
    requestSubscription,
    cancelSubscriptionRequest,
    hasPendingRequest,
    getChannelPendingRequests,
    approveSubscription,
    rejectSubscription,
    
    // 🏷️ 分类管理
    categories: channelCategories,
    
    // 🔥 Firebase 相关
    isFirebaseReady: !loading && isCategoriesMigrated
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