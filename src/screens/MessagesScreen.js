import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
  Alert,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useChannel } from '../context/ChannelContext';
import { useSubscriptionNotification } from '../context/SubscriptionNotificationContext';
import { formatConversationTime } from '../utils/timeUtils';
import { useFocusEffect } from '@react-navigation/native';

export default function MessagesScreen({ navigation }) {
  const { user, getUserById } = useAuth();
  const { getUserConversations, getTotalUnreadCount } = useChat();
  const { getUserChannels, approveSubscription, rejectSubscription } = useChannel();
  const { getNotificationsByUserId, markNotificationAsRead, deleteNotification } = useSubscriptionNotification();
  const [conversations, setConversations] = useState([]);
  const [subscriptionNotifications, setSubscriptionNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadConversations();
    }, [user])
  );

  const loadConversations = () => {
    if (user && user.id) {
      const userConversations = getUserConversations(user.id);
      setConversations(userConversations);
      setUnreadCount(getTotalUnreadCount(user.id));
      
      // 加载订阅申请通知（仅频道主能看到）
      const userChannels = getUserChannels(user.id);
      const ownedChannels = userChannels.filter(channel => channel.creatorId === user.id);
      
      if (ownedChannels.length > 0) {
        const notifications = getNotificationsByUserId(user.id);
        setSubscriptionNotifications(notifications.filter(n => n.type === 'subscription_request'));
      } else {
        setSubscriptionNotifications([]);
      }
    } else {
      setConversations([]);
      setSubscriptionNotifications([]);
      setUnreadCount(0);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟刷新
    loadConversations();
    setRefreshing(false);
  };

  const handleConversationPress = (conversation) => {
    if (!user || !user.id) {
      Alert.alert('错误', '用户信息不完整，请重新登录');
      return;
    }
    
    const otherUser = conversation.participants.find(p => p.id !== user.id);
    navigation.navigate('ChatDetail', {
      conversationId: conversation.id,
      otherUser
    });
  };

  const handleNotificationPress = (notification) => {
    setSelectedNotification(notification);
    setShowApprovalModal(true);
    // 标记通知为已读
    markNotificationAsRead(notification.id);
    loadConversations(); // 刷新数据
  };

  const handleApprove = () => {
    setShowApprovalModal(false);
    setShowDurationModal(true);
  };

  const handleReject = async () => {
    if (selectedNotification) {
      const result = await rejectSubscription(
        selectedNotification.channelId, 
        selectedNotification.userId
      );
      
      if (result.success) {
        deleteNotification(selectedNotification.id);
        Alert.alert('已拒绝', '已拒绝用户的订阅申请');
        loadConversations();
      } else {
        Alert.alert('操作失败', result.error || '拒绝申请失败');
      }
    }
    setShowApprovalModal(false);
    setSelectedNotification(null);
  };

  const handleDurationSelect = async (duration) => {
    if (selectedNotification) {
      const result = await approveSubscription(
        selectedNotification.channelId,
        selectedNotification.userId,
        duration
      );
      
      if (result.success) {
        deleteNotification(selectedNotification.id);
        const durationText = {
          '1minute': '1分钟（测试）',
          '1month': '1个月',
          '3months': '3个月', 
          '6months': '半年',
          '1year': '1年'
        }[duration];
        Alert.alert('已通过', `已通过用户的订阅申请，会员期限：${durationText}`);
        loadConversations();
      } else {
        Alert.alert('操作失败', result.error || '通过申请失败');
      }
    }
    setShowDurationModal(false);
    setSelectedNotification(null);
  };

  const renderConversationItem = ({ item: conversation }) => {
    if (!user || !user.id) {
      return null;
    }
    
    const otherUser = conversation.participants.find(p => p.id !== user.id);
    const unreadCount = conversation.unreadCount[user.id] || 0;
    
    // 实时获取对方用户的最新头像
    const currentUser = getUserById(otherUser.id);
    const currentAvatar = currentUser?.avatar || otherUser.avatar;
    const currentNickname = currentUser?.nickname || otherUser.nickname;
    
    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleConversationPress(conversation)}
      >
        <View style={styles.avatarContainer}>
          {currentAvatar ? (
            <Image source={{ uri: currentAvatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.defaultAvatar]}>
              <Ionicons name="person-outline" size={24} color="#CCCCCC" />
            </View>
          )}
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={styles.userName} numberOfLines={1}>
              {currentNickname}
            </Text>
            <Text style={styles.messageTime}>
              {formatConversationTime(conversation.lastMessageTime)}
            </Text>
          </View>
          
          <Text 
            style={[
              styles.lastMessage,
              unreadCount > 0 && styles.unreadMessage
            ]} 
            numberOfLines={2}
          >
            {conversation.lastMessage || '暂无消息'}
          </Text>
        </View>

        <Ionicons name="chevron-forward-outline" size={20} color="#CCCCCC" />
      </TouchableOpacity>
    );
  };

  const renderSubscriptionNotification = ({ item: notification }) => {
    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          styles.notificationItem,
          !notification.read && styles.unreadNotification
        ]}
        onPress={() => handleNotificationPress(notification)}
      >
        <View style={styles.avatarContainer}>
          {notification.userAvatar ? (
            <Image source={{ uri: notification.userAvatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.defaultAvatar]}>
              <Ionicons name="person-outline" size={24} color="#CCCCCC" />
            </View>
          )}
          <View style={styles.notificationBadge}>
            <Ionicons name="person-add" size={16} color="#007AFF" />
          </View>
        </View>

        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={styles.userName} numberOfLines={1}>
              {notification.userNickname}
            </Text>
            <Text style={styles.messageTime}>
              {formatConversationTime(notification.createdAt)}
            </Text>
          </View>
          
          <Text style={styles.notificationText} numberOfLines={2}>
            申请加入频道：{notification.channelName}
          </Text>
        </View>

        <Ionicons name="chevron-forward-outline" size={20} color="#007AFF" />
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={['#0C0C0C', '#1A1A1A', '#0C0C0C']}
      style={styles.gradientContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.container}>
        {/* 订阅通知列表 */}
        {subscriptionNotifications.length > 0 && (
          <View style={styles.notificationSection}>
            <Text style={styles.sectionTitle}>订阅申请</Text>
            <FlatList
              data={subscriptionNotifications}
              keyExtractor={(item) => item.id}
              renderItem={renderSubscriptionNotification}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
            <View style={styles.sectionSeparator} />
          </View>
        )}
        
        {/* 聊天列表 */}
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversationItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={conversations.length === 0 ? styles.emptyContainer : null}
          ListEmptyComponent={
            subscriptionNotifications.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Ionicons name="chatbubbles-outline" size={64} color="#666666" />
                <Text style={styles.emptyStateText}>暂无消息</Text>
                <Text style={styles.emptyStateSubText}>
                  在频道广场点击创建者头像开始聊天
                </Text>
                <TouchableOpacity
                  style={styles.exploreButton}
                  onPress={() => navigation.navigate('ChannelSquare')}
                >
                  <Text style={styles.exploreButtonText}>去发现</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>

      {/* 审核对话框 */}
      <Modal
        visible={showApprovalModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowApprovalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>订阅申请审核</Text>
            
            {selectedNotification && (
              <View style={styles.modalContent}>
                <View style={styles.userInfoRow}>
                  {selectedNotification.userAvatar ? (
                    <Image source={{ uri: selectedNotification.userAvatar }} style={styles.modalAvatar} />
                  ) : (
                    <View style={[styles.modalAvatar, styles.defaultAvatar]}>
                      <Ionicons name="person-outline" size={20} color="#CCCCCC" />
                    </View>
                  )}
                  <View style={styles.userInfoText}>
                    <Text style={styles.modalUserName}>{selectedNotification.userNickname}</Text>
                    <Text style={styles.modalUserPhone}>{selectedNotification.userPhone}</Text>
                  </View>
                </View>
                
                <Text style={styles.modalChannelText}>
                  申请加入频道：{selectedNotification.channelName}
                </Text>
              </View>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
                <Text style={styles.rejectButtonText}>拒绝</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.approveButton} onPress={handleApprove}>
                <Text style={styles.approveButtonText}>通过</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 会员期限选择对话框 */}
      <Modal
        visible={showDurationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDurationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>选择会员期限</Text>
            
            <View style={styles.durationOptions}>
              <TouchableOpacity 
                style={[styles.durationButton, styles.testDurationButton]} 
                onPress={() => handleDurationSelect('1minute')}
              >
                <Ionicons name="flash" size={16} color="#FF9500" />
                <Text style={[styles.durationButtonText, styles.testDurationText]}>1分钟（测试）</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.durationButton} 
                onPress={() => handleDurationSelect('1month')}
              >
                <Text style={styles.durationButtonText}>1个月</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.durationButton} 
                onPress={() => handleDurationSelect('3months')}
              >
                <Text style={styles.durationButtonText}>3个月</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.durationButton} 
                onPress={() => handleDurationSelect('6months')}
              >
                <Text style={styles.durationButtonText}>半年</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.durationButton} 
                onPress={() => handleDurationSelect('1year')}
              >
                <Text style={styles.durationButtonText}>1年</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setShowDurationModal(false)}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 15,
    marginBottom: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  defaultAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  messageTime: {
    fontSize: 12,
    color: '#999999',
  },
  lastMessage: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 18,
  },
  unreadMessage: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  separator: {
    height: 8,
    backgroundColor: 'transparent',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#CCCCCC',
    marginTop: 15,
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  exploreButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // 订阅通知相关样式
  notificationSection: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginHorizontal: 15,
    marginBottom: 10,
  },
  sectionSeparator: {
    height: 20,
    backgroundColor: 'transparent',
  },
  notificationItem: {
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  unreadNotification: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  notificationBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderRadius: 10, 
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  notificationText: {
    fontSize: 14,
    color: '#007AFF',
    lineHeight: 18,
    fontWeight: '500',
  },
  // 模态框样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 30,
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalContent: {
    marginBottom: 15,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfoText: {
    flex: 1,
  },
  modalUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalUserPhone: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 2,
  },
  modalChannelText: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  durationOptions: {
    gap: 8,
    marginBottom: 12,
  },
  durationButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testDurationButton: {
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
    borderColor: '#FF9500',
    flexDirection: 'row',
    gap: 8,
  },
  durationButtonText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '600',
  },
  testDurationText: {
    color: '#FF9500',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#CCCCCC',
    fontSize: 15,
  },
});