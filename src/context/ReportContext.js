import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const ReportContext = createContext({});

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
  },
  
  async removeItem(key) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }
};

// 举报原因类型
export const REPORT_REASONS = {
  SPAM: 'spam',
  HARASSMENT: 'harassment', 
  INAPPROPRIATE: 'inappropriate',
  VIOLENCE: 'violence',
  FALSE_INFO: 'false_info',
  COPYRIGHT: 'copyright',
  OTHER: 'other'
};

// 举报原因文本
export const REPORT_REASON_TEXTS = {
  [REPORT_REASONS.SPAM]: '垃圾信息',
  [REPORT_REASONS.HARASSMENT]: '骚扰辱骂', 
  [REPORT_REASONS.INAPPROPRIATE]: '不当内容',
  [REPORT_REASONS.VIOLENCE]: '暴力内容',
  [REPORT_REASONS.FALSE_INFO]: '虚假信息',
  [REPORT_REASONS.COPYRIGHT]: '版权侵权',
  [REPORT_REASONS.OTHER]: '其他违规'
};

// 举报类型
export const REPORT_TYPES = {
  MESSAGE: 'message',
  CHANNEL: 'channel',
  USER: 'user'
};

let reportIdCounter = 1;
let reports = []; // 举报记录

export const ReportProvider = ({ children }) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  // 加载举报记录
  const loadReports = async () => {
    try {
      const reportsData = await storage.getItem('reports');
      if (reportsData) {
        const parsedReports = JSON.parse(reportsData);
        setReports(parsedReports);
        reports = parsedReports;
        reportIdCounter = Math.max(...parsedReports.map(r => r.id), 0) + 1;
      }
    } catch (error) {
      console.error('加载举报记录失败:', error);
    }
  };

  // 保存举报记录
  const saveReports = async (newReports) => {
    try {
      await storage.setItem('reports', JSON.stringify(newReports));
      setReports(newReports);
      reports = newReports;
    } catch (error) {
      console.error('保存举报记录失败:', error);
      throw error;
    }
  };

  // 打开举报弹窗
  const openReportModal = (targetType, targetId, targetData = {}) => {
    setReportTarget({
      type: targetType,
      id: targetId,
      data: targetData
    });
    setShowReportModal(true);
  };

  // 关闭举报弹窗
  const closeReportModal = () => {
    setShowReportModal(false);
    setReportTarget(null);
  };

  // 提交举报
  const submitReport = async (reporterId, reason, description = '') => {
    if (!reportTarget || !reporterId || !reason) {
      throw new Error('举报信息不完整');
    }

    setLoading(true);
    
    try {
      const newReport = {
        id: reportIdCounter++,
        reporterId,
        targetType: reportTarget.type,
        targetId: reportTarget.id,
        targetData: reportTarget.data,
        reason,
        description: description.trim(),
        status: 'pending', // pending, reviewed, resolved, dismissed
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedReports = [...reports, newReport];
      await saveReports(updatedReports);

      // 关闭弹窗
      closeReportModal();

      // 显示成功提示
      if (Platform.OS === 'web') {
        alert('举报提交成功，我们会尽快处理');
      } else {
        Alert.alert('提交成功', '举报已提交，我们会尽快处理');
      }

      return { success: true, reportId: newReport.id };
    } catch (error) {
      console.error('提交举报失败:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // 获取用户的举报记录
  const getUserReports = (userId) => {
    return reports.filter(report => report.reporterId === userId);
  };

  // 获取针对某个目标的举报记录
  const getTargetReports = (targetType, targetId) => {
    return reports.filter(report => 
      report.targetType === targetType && report.targetId === targetId
    );
  };

  // 检查用户是否已举报过某个目标
  const hasUserReported = (userId, targetType, targetId) => {
    return reports.some(report => 
      report.reporterId === userId &&
      report.targetType === targetType && 
      report.targetId === targetId
    );
  };

  // 管理员：处理举报
  const handleReport = async (reportId, action, adminId) => {
    try {
      const reportIndex = reports.findIndex(r => r.id === reportId);
      if (reportIndex === -1) {
        throw new Error('举报记录不存在');
      }

      const updatedReports = [...reports];
      updatedReports[reportIndex] = {
        ...updatedReports[reportIndex],
        status: action, // 'reviewed', 'resolved', 'dismissed'
        adminId,
        updatedAt: new Date().toISOString()
      };

      await saveReports(updatedReports);
      return { success: true };
    } catch (error) {
      console.error('处理举报失败:', error);
      return { success: false, error: error.message };
    }
  };

  // 获取待处理的举报（管理员用）
  const getPendingReports = () => {
    return reports.filter(report => report.status === 'pending')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  // 清除所有举报记录（仅用于测试）
  const clearAllReports = async () => {
    try {
      await storage.removeItem('reports');
      setReports([]);
      reports = [];
      reportIdCounter = 1;
      console.log('所有举报记录已清除');
      return { success: true };
    } catch (error) {
      console.error('清除举报记录失败:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    // 状态
    showReportModal,
    reportTarget,
    reports,
    loading,

    // 举报操作
    openReportModal,
    closeReportModal,
    submitReport,
    hasUserReported,

    // 查询操作
    getUserReports,
    getTargetReports,
    getPendingReports,

    // 管理员操作
    handleReport,

    // 工具函数
    clearAllReports
  };

  return (
    <ReportContext.Provider value={value}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReport = () => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return context;
};