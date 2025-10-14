import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';

const ChatContext = createContext({});

// 模拟聊天数据
let conversations = [];
let messageIdCounter = 1;

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({}); // 新增：跟踪每个用户的未读数量

  // 更新特定用户的未读数量
  const updateUnreadCount = (userId) => {
    const totalUnread = conversations.reduce((total, conv) => {
      return total + (conv.unreadCount[userId] || 0);
    }, 0);
    
    console.log(`[ChatContext] 更新用户 ${userId} 的未读数量: ${totalUnread}`);
    
    setUnreadCounts(prev => {
      const newCounts = {
        ...prev,
        [userId]: totalUnread
      };
      console.log('[ChatContext] 新的unreadCounts状态:', newCounts);
      return newCounts;
    });
    
    return totalUnread;
  };

  // 获取或创建对话
  const getOrCreateConversation = (userId1, userId2, user1Info, user2Info) => {
    // 确保对话ID的一致性（较小的ID在前）
    const conversationId = userId1 < userId2 ? `${userId1}-${userId2}` : `${userId2}-${userId1}`;
    
    let conversation = conversations.find(c => c.id === conversationId);
    
    if (!conversation) {
      conversation = {
        id: conversationId,
        participants: [
          { id: userId1, ...user1Info },
          { id: userId2, ...user2Info }
        ],
        messages: [],
        lastMessage: null,
        lastMessageTime: null,
        unreadCount: { [userId1]: 0, [userId2]: 0 }
      };
      conversations.push(conversation);
    }
    
    return conversation;
  };

  // 发送消息
  const sendMessage = async (conversationId, senderId, content, type = 'text') => {
    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) {
        throw new Error('对话不存在');
      }

      const newMessage = {
        id: messageIdCounter.toString(),
        senderId,
        content,
        type, // text, image, video
        timestamp: Date.now(),
        read: false
      };

      conversation.messages.push(newMessage);
      // 如果是图片消息，显示'[图片]'作为最后消息摘要
      conversation.lastMessage = type === 'image' ? '[图片]' : content;
      conversation.lastMessageTime = Date.now();
      
      // 更新未读数
      conversation.participants.forEach(participant => {
        if (participant.id !== senderId) {
          conversation.unreadCount[participant.id] += 1;
        }
      });

      messageIdCounter++;
      setChats([...conversations]);
      
      console.log(`[ChatContext] 消息已发送, conversationId: ${conversationId}, senderId: ${senderId}`);
      console.log('[ChatContext] 当前对话未读数:', conversation.unreadCount);
      
      // 更新所有相关用户的未读数量
      conversation.participants.forEach(participant => {
        if (participant.id !== senderId) {
          console.log(`[ChatContext] 准备更新接收方 ${participant.id} 的未读数量`);
          updateUnreadCount(participant.id);
        }
      });

      return { success: true, message: newMessage };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // 获取用户的所有对话
  const getUserConversations = (userId) => {
    return conversations
      .filter(conv => conv.participants.some(p => p.id === userId))
      .sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
  };

  // 获取对话消息
  const getConversationMessages = (conversationId) => {
    const conversation = conversations.find(c => c.id === conversationId);
    return conversation ? conversation.messages : [];
  };

  // 标记消息为已读
  const markMessagesAsRead = (conversationId, userId) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      conversation.unreadCount[userId] = 0;
      conversation.messages.forEach(message => {
        if (message.senderId !== userId) {
          message.read = true;
        }
      });
      setChats([...conversations]);
      
      // 更新未读数量
      updateUnreadCount(userId);
    }
  };

  // 获取未读消息总数（优化版）
  const getTotalUnreadCount = (userId) => {
    // 优先从 state 中获取，如果没有则重新计算
    if (unreadCounts[userId] !== undefined) {
      return unreadCounts[userId];
    }
    
    const count = conversations.reduce((total, conv) => {
      return total + (conv.unreadCount[userId] || 0);
    }, 0);
    
    // 缓存结果
    setUnreadCounts(prev => ({
      ...prev,
      [userId]: count
    }));
    
    return count;
  };

  // 删除对话
  const deleteConversation = (conversationId) => {
    conversations = conversations.filter(c => c.id !== conversationId);
    setChats([...conversations]);
  };

  const value = {
    chats,
    loading,
    unreadCounts, // 暴露未读数量状态
    getOrCreateConversation,
    sendMessage,
    getUserConversations,
    getConversationMessages,
    markMessagesAsRead,
    getTotalUnreadCount,
    updateUnreadCount, // 暴露更新函数
    deleteConversation
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};