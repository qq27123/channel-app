import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useReport, REPORT_TYPES } from '../context/ReportContext';
import { useContentFilter } from '../context/ContentFilterContext';
import { formatMessageTime } from '../utils/timeUtils';
import { useFocusEffect } from '@react-navigation/native';

export default function ChatDetailScreen({ route, navigation }) {
  const { conversationId, otherUser: initialOtherUser } = route.params;
  const { user, getUserById } = useAuth();
  const { getConversationMessages, sendMessage, markMessagesAsRead } = useChat();
  const { openReportModal } = useReport();
  const { filterContent, FILTER_ACTIONS } = useContentFilter();
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    // 实时获取对方用户的最新信息
    const currentUser = getUserById(initialOtherUser.id);
    const currentAvatar = currentUser?.avatar || initialOtherUser.avatar;
    const currentNickname = currentUser?.nickname || initialOtherUser.nickname;
    
    navigation.setOptions({ 
      title: currentNickname,
      headerBackTitleVisible: false
    });
    
    // 更新 otherUser 状态
    const updatedOtherUser = {
      ...initialOtherUser,
      avatar: currentAvatar,
      nickname: currentNickname
    };
    
    loadMessages();
  }, [conversationId]);

  useFocusEffect(
    React.useCallback(() => {
      // 确保 user 和 user.id 存在
      if (user && user.id) {
        // 标记消息为已读
        markMessagesAsRead(conversationId, user.id);
        return () => {
          // 离开页面时也标记为已读
          markMessagesAsRead(conversationId, user.id);
        };
      }
    }, [conversationId, user])
  );

  const loadMessages = () => {
    const conversationMessages = getConversationMessages(conversationId);
    setMessages(conversationMessages);
    
    // 滚动到底部
    setTimeout(() => {
      if (flatListRef.current && conversationMessages.length > 0) {
        flatListRef.current.scrollToEnd({ animated: false });
      }
    }, 100);
  };

  const handleSendMessage = async () => {
    const messageText = inputText.trim();
    if (!messageText) {
      return;
    }

    if (!user || !user.id) {
      Alert.alert('错误', '用户信息不完整，请重新登录');
      return;
    }

    // 内容过滤检查
    const filterResult = filterContent(messageText);
    
    if (filterResult.action === FILTER_ACTIONS.BLOCK) {
      Alert.alert(
        '内容违规',
        `检测到敏感词：${filterResult.detectedWords.join('、')}\n\n请修改后重新发送。`,
        [{ text: '我知道了' }]
      );
      return;
    }
    
    if (filterResult.action === FILTER_ACTIONS.WARN) {
      Alert.alert(
        '内容提醒', 
        `检测到可能不当的内容，建议修改后发送。\n\n检测词汇：${filterResult.detectedWords.join('、')}`,
        [
          { text: '修改', style: 'cancel' },
          { 
            text: '仍要发送', 
            onPress: () => doSendMessage(messageText)
          }
        ]
      );
      return;
    }
    
    // 使用过滤后的内容发送
    const contentToSend = filterResult.action === FILTER_ACTIONS.REPLACE ? 
      filterResult.filteredContent : messageText;
    
    doSendMessage(contentToSend);
  };
  
  const doSendMessage = async (messageText) => {
    setLoading(true);
    setInputText('');

    try {
      const result = await sendMessage(conversationId, user.id, messageText, 'text');
      
      if (result.success) {
        loadMessages();
        // 滚动到底部
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }, 100);
      } else {
        Alert.alert('发送失败', result.error);
        setInputText(messageText); // 恢复输入内容
      }
    } catch (error) {
      Alert.alert('发送失败', '请重试');
      setInputText(messageText); // 恢复输入内容
    } finally {
      setLoading(false);
    }
  };

  const handleSendImage = async () => {
    if (!user || !user.id) {
      Alert.alert('错误', '用户信息不完整，请重新登录');
      return;
    }
    
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限不足', '需要访问相册权限来发送图片');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setLoading(true);
        
        // 发送图片URI作为消息内容
        const imageUri = result.assets[0].uri;
        const sendResult = await sendMessage(
          conversationId, 
          user.id, 
          imageUri,  // 使用图片URI而不是'[图片]'
          'image'
        );
        
        if (sendResult.success) {
          loadMessages();
          setTimeout(() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToEnd({ animated: true });
            }
          }, 100);
        } else {
          Alert.alert('发送失败', sendResult.error);
        }
        
        setLoading(false);
      }
    } catch (error) {
      Alert.alert('发送失败', '请重试');
      setLoading(false);
    }
  };

  // 处理消息长按（举报功能）
  const handleMessageLongPress = (message) => {
    if (!user || !user.id || message.senderId === user.id) {
      return; // 不能举报自己的消息
    }
    
    Alert.alert(
      '举报消息',
      '确定要举报这条消息吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '举报',
          onPress: () => {
            openReportModal(REPORT_TYPES.MESSAGE, message.id, {
              content: message.content,
              senderId: message.senderId,
              senderName: initialOtherUser.nickname
            });
          }
        }
      ]
    );
  };

  const renderMessage = ({ item: message, index }) => {
    if (!user || !user.id) {
      return null;
    }
    
    const isMyMessage = message.senderId === user.id;
    const showTime = index === 0 || 
      (messages[index - 1] && 
       new Date(message.timestamp) - new Date(messages[index - 1].timestamp) > 5 * 60 * 1000);

    // 实时获取发送者的最新头像
    const currentUser = getUserById(user.id);
    const myAvatar = currentUser?.avatar || user.avatar;
    
    // 实时获取对方用户的最新头像
    const otherUserCurrent = getUserById(initialOtherUser.id);
    const otherUserAvatar = otherUserCurrent?.avatar || initialOtherUser.avatar;

    return (
      <View style={styles.messageContainer}>
        {showTime && (
          <Text style={styles.messageTime}>
            {formatMessageTime(message.timestamp)}
          </Text>
        )}
        
        <View style={[
          styles.messageRow,
          isMyMessage ? styles.myMessageRow : styles.otherMessageRow
        ]}>
          {!isMyMessage && (
            <View style={styles.otherAvatarContainer}>
              {otherUserAvatar ? (
                <Image source={{ uri: otherUserAvatar }} style={styles.messageAvatar} />
              ) : (
                <View style={[styles.messageAvatar, styles.defaultMessageAvatar]}>
                  <Ionicons name="person-outline" size={16} color="#CCCCCC" />
                </View>
              )}
            </View>
          )}
          
          <TouchableOpacity
            style={[
              styles.messageBubble,
              isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
            ]}
            onLongPress={() => handleMessageLongPress(message)}
            activeOpacity={0.7}
          >
            {message.type === 'text' && (
              <Text style={[
                styles.messageText,
                isMyMessage ? styles.myMessageText : styles.otherMessageText
              ]}>
                {message.content}
              </Text>
            )}
            
            {message.type === 'image' && (
              <TouchableOpacity 
                onPress={() => setPreviewImage(message.content)}
                activeOpacity={0.8}
              >
                <Image 
                  source={{ uri: message.content }} 
                  style={styles.messageImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
          
          {isMyMessage && (
            <View style={styles.myAvatarContainer}>
              {myAvatar ? (
                <Image source={{ uri: myAvatar }} style={styles.messageAvatar} />
              ) : (
                <View style={[styles.messageAvatar, styles.defaultMessageAvatar]}>
                  <Ionicons name="person-outline" size={16} color="#CCCCCC" />
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#0C0C0C', '#1A1A1A', '#0C0C0C']}
      style={styles.gradientContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyAvatarContainer}>
              {/* 实时获取对方用户的最新头像 */}
              {(() => {
                const currentUser = getUserById(initialOtherUser.id);
                const currentAvatar = currentUser?.avatar || initialOtherUser.avatar;
                        
                return currentAvatar ? (
                  <Image source={{ uri: currentAvatar }} style={styles.emptyAvatar} />
                ) : (
                  <View style={[styles.emptyAvatar, styles.defaultEmptyAvatar]}>
                    <Ionicons name="person-outline" size={32} color="#CCCCCC" />
                  </View>
                );
              })()}
            </View>
            <Text style={styles.emptyTitle}>开始聊天</Text>
            <Text style={styles.emptySubtitle}>
              与 {initialOtherUser.nickname} 开始你们的对话吧
            </Text>
          </View>
        }
      />

      {/* 输入区域 */}
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={handleSendImage}
            disabled={loading}
          >
            <Ionicons name="image-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="输入消息..."
            placeholderTextColor="#999999"
            multiline
            maxLength={500}
            editable={!loading}
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || loading) && styles.disabledSendButton
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || loading}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={(!inputText.trim() || loading) ? '#999999' : '#007AFF'} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 图片预览模态框 */}
      <Modal
        visible={previewImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <View style={styles.imagePreviewContainer}>
          <TouchableOpacity 
            style={styles.imagePreviewOverlay}
            activeOpacity={1}
            onPress={() => setPreviewImage(null)}
          >
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setPreviewImage(null)}
            >
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
            
            {previewImage && (
              <Image 
                source={{ uri: previewImage }} 
                style={styles.previewImage}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
  messagesContainer: {
    padding: 15,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 10,
  },
  messageTime: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999999',
    marginBottom: 10,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 5,
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  otherAvatarContainer: {
    marginRight: 8,
  },
  myAvatarContainer: {
    marginLeft: 8,
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  defaultMessageAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '70%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  myMessageBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 6,
  },
  otherMessageBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#FFFFFF',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  imagePlaceholder: {
    alignItems: 'center',
    padding: 20,
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 5,
  },
  // 图片预览样式
  imagePreviewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreviewOverlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyAvatarContainer: {
    marginBottom: 20,
  },
  emptyAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  defaultEmptyAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    padding: 15,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  imageButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    color: '#FFFFFF',
  },
  sendButton: {
    padding: 8,
  },
  disabledSendButton: {
    opacity: 0.5,
  },
});