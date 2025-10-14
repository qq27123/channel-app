import React, { createContext, useContext, useState } from 'react';

const SubscriptionNotificationContext = createContext({});

// 订阅申请通知管理
let notifications = [];
let notificationIdCounter = 1;

export const SubscriptionNotificationProvider = ({ children }) => {
  const [allNotifications, setAllNotifications] = useState(notifications);

  // 创建订阅申请通知
  const createSubscriptionNotification = (channelId, channelName, userId, userInfo) => {
    const notification = {
      id: notificationIdCounter.toString(),
      type: 'subscription_request',
      channelId,
      channelName,
      userId,
      userNickname: userInfo.nickname,
      userAvatar: userInfo.avatar,
      userPhone: userInfo.phone,
      createdAt: Date.now(),
      read: false
    };

    notifications.push(notification);
    notificationIdCounter++;
    setAllNotifications([...notifications]);

    return notification;
  };

  // 获取频道主的所有通知
  const getCreatorNotifications = (creatorChannelIds) => {
    return notifications.filter(n => creatorChannelIds.includes(n.channelId));
  };

  // 获取未读通知数量
  const getUnreadCount = (creatorChannelIds) => {
    return notifications.filter(n => 
      creatorChannelIds.includes(n.channelId) && !n.read
    ).length;
  };

  // 标记通知为已读
  const markAsRead = (notificationId) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      setAllNotifications([...notifications]);
    }
  };

  // 别名方法，用于兼容
  const markNotificationAsRead = markAsRead;

  // 根据用户ID获取通知（频道主）
  const getNotificationsByUserId = (userId) => {
    // 这里userId是频道主ID，返回所有相关频道的通知
    return notifications;
  };

  // 删除通知
  const deleteNotification = (notificationId) => {
    notifications = notifications.filter(n => n.id !== notificationId);
    setAllNotifications([...notifications]);
  };

  // 处理申请后删除通知
  const handleRequestProcessed = (channelId, userId) => {
    notifications = notifications.filter(n => 
      !(n.channelId === channelId && n.userId === userId)
    );
    setAllNotifications([...notifications]);
  };

  const value = {
    notifications: allNotifications,
    createSubscriptionNotification,
    getCreatorNotifications,
    getNotificationsByUserId,
    getUnreadCount,
    markAsRead,
    markNotificationAsRead,
    deleteNotification,
    handleRequestProcessed
  };

  return (
    <SubscriptionNotificationContext.Provider value={value}>
      {children}
    </SubscriptionNotificationContext.Provider>
  );
};

export const useSubscriptionNotification = () => {
  const context = useContext(SubscriptionNotificationContext);
  if (!context) {
    throw new Error('useSubscriptionNotification must be used within a SubscriptionNotificationProvider');
  }
  return context;
};
