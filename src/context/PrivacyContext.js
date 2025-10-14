import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const PrivacyContext = createContext({});

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

export const PrivacyProvider = ({ children }) => {
  const [hasAcceptedPrivacy, setHasAcceptedPrivacy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    checkPrivacyAcceptance();
  }, []);

  const checkPrivacyAcceptance = async () => {
    try {
      const accepted = await storage.getItem('privacyAccepted');
      const acceptedTime = await storage.getItem('privacyAcceptedTime');
      
      if (accepted === 'true' && acceptedTime) {
        setHasAcceptedPrivacy(true);
        setShowPrivacyModal(false);
      } else {
        setHasAcceptedPrivacy(false);
        setShowPrivacyModal(true);
      }
    } catch (error) {
      console.error('检查隐私协议状态失败:', error);
      setShowPrivacyModal(true);
    } finally {
      setLoading(false);
    }
  };

  const acceptPrivacy = async () => {
    try {
      const currentTime = new Date().toISOString();
      await storage.setItem('privacyAccepted', 'true');
      await storage.setItem('privacyAcceptedTime', currentTime);
      
      setHasAcceptedPrivacy(true);
      setShowPrivacyModal(false);
      return { success: true };
    } catch (error) {
      console.error('保存隐私协议同意状态失败:', error);
      return { success: false, error: error.message };
    }
  };

  const showPrivacyPolicy = () => {
    setShowPrivacyModal(true);
  };

  const hidePrivacyModal = () => {
    // 只有已经同意过的用户才能关闭弹窗
    if (hasAcceptedPrivacy) {
      setShowPrivacyModal(false);
    }
  };

  const value = {
    hasAcceptedPrivacy,
    loading,
    showPrivacyModal,
    acceptPrivacy,
    showPrivacyPolicy,
    hidePrivacyModal
  };

  return (
    <PrivacyContext.Provider value={value}>
      {children}
    </PrivacyContext.Provider>
  );
};

export const usePrivacy = () => {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
};
