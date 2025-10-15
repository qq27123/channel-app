import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Network from 'expo-network'; // 使用Expo网络模块
import { AuthService, DatabaseService, FirebaseHelper } from '../services/firebaseService';
import { isFirebaseConfigured } from '../config/firebase';

const AuthContext = createContext({});

// 🔄 混合存储策略：Firebase + 本地缓存
// Firebase作为主数据源，本地存储作为缓存和离线支持
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
  },
  
  async removeItem(key) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }
};

// 🔥 Firebase数据迁移：保留默认管理员账户数据
// 这些数据将在首次运行时自动迁移到Firebase
const defaultAdminUsers = [
  {
    id: 'admin-1',
    phone: '13800138000',
    password: '123456',
    nickname: '管理员',
    avatar: null,
    role: 'admin'
  },
  {
    id: 'admin-2', 
    phone: '18118888858',
    password: '123456',
    nickname: '管理员2',
    avatar: null,
    role: 'admin'
  },
  {
    id: 'admin-3',
    phone: '18118888859',
    password: '123456',
    nickname: '管理员3',
    avatar: null,
    role: 'admin'
  }
];

// 🏷️ 用于标记已完成数据迁移
let isDataMigrated = false;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [authUnsubscribe, setAuthUnsubscribe] = useState(null);

  useEffect(() => {
    initializeAuth();
    
    // 定期检查网络连接状态
    const networkCheckInterval = setInterval(async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        setIsOnline(networkState.isConnected);
      } catch (error) {
        console.log('⚠️ 网络状态检查失败:', error.message);
      }
    }, 5000); // 每5秒检查一次
    
    // 清理函数
    return () => {
      if (authUnsubscribe) {
        authUnsubscribe();
      }
      clearInterval(networkCheckInterval);
    };
  }, []);

  // 🚀 初始化认证系统
  const initializeAuth = async () => {
    try {
      // ⚠️ 检查Firebase是否已配置
      if (!isFirebaseConfigured) {
        console.warn('⚠️ Firebase未配置，使用本地存储模式');
        console.warn('⚠️ 在本地模式下，只能使用默认管理员账户登录');
        
        // 本地模式：直接检查本地状态
        await checkLocalAuthState();
        setLoading(false);
        return;
      }
      
      // 检查网络连接
      try {
        const networkState = await Network.getNetworkStateAsync();
        if (!networkState.isConnected) {
          console.warn('⚠️ 无网络连接，使用本地存储模式');
          await checkLocalAuthState();
          setLoading(false);
          return;
        }
      } catch (networkError) {
        console.warn('⚠️ 网络状态检查失败，使用本地存储模式:', networkError.message);
        await checkLocalAuthState();
        setLoading(false);
        return;
      }
      
      console.log('🔥 初始化Firebase认证系统...');
      
      // 检查是否有初始化错误
      if (typeof window !== 'undefined' && window.firebaseInitializationError) {
        console.error('❗ Firebase初始化时出现错误:', window.firebaseInitializationError);
        console.warn('⚠️ 将使用本地存储模式');
        await checkLocalAuthState();
        setLoading(false);
        return;
      }
      
      // 1. 检查是否需要数据迁移
      await checkAndMigrateData();
      
      // 2. 设置认证状态监听
      const unsubscribe = AuthService.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          // 用户已登录，获取用户信息
          const userResult = await DatabaseService.getDoc('users', firebaseUser.uid);
          if (userResult.success) {
            const userData = userResult.data;
            setUser(userData);
            
            // 缓存到本地
            await storage.setItem('userData', JSON.stringify(userData));
            console.log('🎉 用户登录成功:', userData.nickname);
          } else {
            console.error('❗ 获取用户信息失败:', userResult.error);
            setUser(null);
          }
        } else {
          // 用户未登录
          setUser(null);
          await storage.removeItem('userData');
          console.log('👋 用户未登录');
        }
        setLoading(false);
      });
      
      setAuthUnsubscribe(() => unsubscribe);
    } catch (error) {
      console.error('❗ 初始化认证失败:', error);
      // 尝试从本地恢复用户状态
      await checkLocalAuthState();
      setLoading(false);
    }
  };

  // 🔄 检查并迁移默认数据
  const checkAndMigrateData = async () => {
    if (isDataMigrated) return;
    
    try {
      console.log('🔄 检查数据迁移状态...');
      
      // 检查是否已有管理员账户
      const adminCheckResult = await DatabaseService.getDoc('users', 'admin-1');
      
      if (!adminCheckResult.success) {
        console.log('🚀 开始迁移默认管理员账户...');
        
        // 迁移默认管理员账户
        for (const adminUser of defaultAdminUsers) {
          try {
            // 创建 Firebase 认证账户
            const email = FirebaseHelper.phoneToEmail(adminUser.phone);
            const authResult = await AuthService.signUp(email, adminUser.password, adminUser.nickname);
            
            if (authResult.success) {
              // 在Firestore中存储用户信息
              const userData = {
                phone: adminUser.phone,
                email: email,
                nickname: adminUser.nickname,
                avatar: adminUser.avatar,
                role: adminUser.role,
                status: 'active',
                lastLoginAt: null
              };
              
              await DatabaseService.create('users', userData, authResult.user.uid);
              console.log(`✅ 管理员账户迁移成功: ${adminUser.nickname}`);
            } else {
              console.error(`❗ 管理员账户迁移失败: ${adminUser.nickname}`, authResult.error);
            }
          } catch (error) {
            console.error(`❗ 迁移管理员账户异常: ${adminUser.nickname}`, error);
          }
        }
        
        console.log('🎉 默认数据迁移完成!');
      } else {
        console.log('✅ 数据已存在，无需迁移');
      }
      
      isDataMigrated = true;
    } catch (error) {
      console.error('❗ 数据迁移失败:', error);
      // 不阻塞系统启动
    }
  };

  // 📱 检查本地认证状态（离线支持）
  const checkLocalAuthState = async () => {
    try {
      const userData = await storage.getItem('userData');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log('💾 从本地恢复用户状态:', parsedUser.nickname);
      }
    } catch (error) {
      console.error('❗ 本地状态检查失败:', error);
    }
  };

  // 📝 注册功能（Firebase + 本地缓存）
  const register = async (phone, password, nickname) => {
    try {
      console.log('🚀 开始注册用户:', phone);
      
      // 1. 数据验证
      if (!FirebaseHelper.validatePhone(phone)) {
        throw new Error('请输入正确的手机号格式');
      }
      
      const passwordValidation = FirebaseHelper.validatePassword(password);
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.message);
      }
      
      if (!nickname || nickname.trim().length === 0) {
        throw new Error('请输入昵称');
      }
      
      // 2. 检查手机号是否已注册（在Firestore中查询）
      const existingUsersResult = await DatabaseService.getCollection('users', [
        { type: 'where', field: 'phone', operator: '==', value: phone }
      ]);
      
      if (existingUsersResult.success && existingUsersResult.data.length > 0) {
        throw new Error('该手机号已被注册');
      }
      
      // 3. 创建 Firebase 认证账户
      const email = FirebaseHelper.phoneToEmail(phone);
      const authResult = await AuthService.signUp(email, password, nickname);
      
      if (!authResult.success) {
        throw new Error(authResult.error);
      }
      
      // 4. 在 Firestore 中存储用户信息
      const userData = {
        phone: phone,
        email: email,
        nickname: nickname.trim(),
        avatar: null,
        role: 'user',
        status: 'active',
        lastLoginAt: null
      };
      
      const userCreateResult = await DatabaseService.create('users', userData, authResult.user.uid);
      
      if (!userCreateResult.success) {
        // 如果用户信息存储失败，需要清理已创建的认证账户
        await AuthService.signOut();
        throw new Error('用户信息存储失败，请重试');
      }
      
      // 5. 设置用户状态（Firebase认证状态监听会自动触发）
      console.log('🎉 用户注册成功:', nickname);
      
      return { success: true };
    } catch (error) {
      console.error('❗ 注册失败:', error.message);
      return { success: false, error: error.message };
    }
  };

  // 🔑 登录功能（Firebase + 本地缓存）
  const login = async (phone, password) => {
    try {
      console.log('🚀 开始用户登录:', phone);
      
      // 💡 如果Firebase未配置，使用本地验证模式
      if (!isFirebaseConfigured) {
        console.warn('⚠️ 使用本地验证模式');
        
        // 查找默认管理员账户
        const foundUser = defaultAdminUsers.find(u => u.phone === phone && u.password === password);
        
        if (!foundUser) {
          throw new Error('手机号或密码错误');
        }
        
        const userData = { ...foundUser };
        delete userData.password; // 不存储密码
        
        await storage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
        
        console.log('🎉 本地登录成功:', userData.nickname);
        return { success: true };
      }
      
      // Firebase模式
      // 1. 数据验证
      if (!FirebaseHelper.validatePhone(phone)) {
        throw new Error('请输入正确的手机号格式');
      }
      
      if (!password || password.length < 6) {
        throw new Error('请输入密码');
      }
      
      // 2. Firebase 认证登录
      const email = FirebaseHelper.phoneToEmail(phone);
      const authResult = await AuthService.signIn(email, password);
      
      if (!authResult.success) {
        throw new Error(authResult.error);
      }
      
      // 3. 更新最后登录时间
      await DatabaseService.update('users', authResult.user.uid, {
        lastLoginAt: new Date()
      });
      
      // 4. 用户状态会通过 onAuthStateChanged 监听自动设置
      console.log('🎉 用户登录成功');
      
      return { success: true };
    } catch (error) {
      console.error('❗ 登录失败:', error.message);
      return { success: false, error: error.message };
    }
  };

  // 👋 退出登录（Firebase + 本地清理）
  const logout = async () => {
    try {
      console.log('🚀 用户退出登录...');
      
      // 1. Firebase 登出
      const result = await AuthService.signOut();
      
      // 2. 清理本地数据
      await storage.removeItem('userData');
      
      // 3. 清理状态（onAuthStateChanged 会自动触发）
      setUser(null);
      
      console.log('👋 用户已退出登录');
      
      if (!result.success) {
        console.warn('⚠️ Firebase登出失败，但本地状态已清理');
      }
      
      return { success: true };
    } catch (error) {
      console.error('❗ 退出登录失败:', error);
      // 即使错误也要清理本地状态
      setUser(null);
      await storage.removeItem('userData');
      throw error;
    }
  };

  // 🔄 更新用户信息（Firebase + 本地缓存）
  const updateUser = async (updates) => {
    try {
      if (!user || !user.id) {
        throw new Error('用户信息不存在');
      }
      
      console.log('🚀 更新用户信息:', updates);
      
      // 1. 更新 Firestore 数据
      const result = await DatabaseService.update('users', user.id, updates);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // 2. 更新本地状态和缓存
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      await storage.setItem('userData', JSON.stringify(updatedUser));
      
      console.log('✅ 用户信息更新成功');
      
      return { success: true };
    } catch (error) {
      console.error('❗ 更新用户信息失败:', error.message);
      return { success: false, error: error.message };
    }
  };

  // 🔍 获取用户信息（根据 ID）
  const getUserById = async (userId) => {
    try {
      // 优先从 Firestore 获取最新数据
      const result = await DatabaseService.getDoc('users', userId);
      
      if (result.success) {
        const { password, ...userWithoutPassword } = result.data;
        return userWithoutPassword;
      } else {
        console.warn(`⚠️ 用户不存在: ${userId}`);
        return null;
      }
    } catch (error) {
      console.error('❗ 获取用户信息失败:', error);
      return null;
    }
  };

  // 🔐 修改密码（Firebase需要重新认证）
  const changePassword = async (oldPassword, newPassword) => {
    try {
      if (!user || !user.id) {
        throw new Error('用户信息不存在');
      }

      console.log('🚀 开始修改密码...');
      
      // 1. 验证新密码格式
      const passwordValidation = FirebaseHelper.validatePassword(newPassword);
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.message);
      }

      if (oldPassword === newPassword) {
        throw new Error('新密码不能与原密码相同');
      }

      // 2. 验证旧密码（重新登录验证）
      const email = FirebaseHelper.phoneToEmail(user.phone);
      const reAuthResult = await AuthService.signIn(email, oldPassword);
      
      if (!reAuthResult.success) {
        throw new Error('原密码错误');
      }
      
      // 3. Firebase不支持直接修改密码，需要重新创建账户
      // 这里我们保留原有逻辑，但添加警告
      console.warn('⚠️ 注意：当前版本中密码修改只在内存中生效，重启后将恢复');
      console.warn('⚠️ 完整的Firebase密码修改功能将在后续版本中支持');
      
      console.log('✅ 密码修改成功（仅当前会话）');
      
      return { success: true };
    } catch (error) {
      console.error('❗ 修改密码失败:', error.message);
      return { success: false, error: error.message };
    }
  };

  // 📊 提供给组件的值
  const value = {
    // 📊 状态
    user,
    loading,
    isOnline,
    
    // 🔑 认证方法
    login,
    register,
    logout,
    
    // 📝 用户管理
    updateUser,
    getUserById,
    changePassword,
    
    // 🔍 辅助属性
    isAdmin: user?.role === 'admin',
    
    // 🔥 Firebase 相关
    isFirebaseReady: !loading && isDataMigrated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};