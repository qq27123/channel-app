import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Alert,
  Platform,
  FlatList,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../context/AuthContext';
import { useChannel } from '../context/ChannelContext';
import { useNotification } from '../context/NotificationContext';
import { useSubscriptionNotification } from '../context/SubscriptionNotificationContext';
import { formatBeijingTime, beijingToLocalDate, localDateToBeijing } from '../utils/timeUtils';

export default function ChannelDetailScreen({ route, navigation }) {
  const { channelId } = route.params;
  const { user } = useAuth();
  const { 
    getChannelById, 
    requestSubscription,
    cancelSubscriptionRequest,
    hasPendingRequest,
    isUserSubscribed, 
    postToChannel,
    updatePostTime,
    updatePostContent,
    deleteChannel,
    updateSubscriberCount,
    getMemberExpiry,
    toggleHideTodayContent
  } = useChannel();
  const { createSubscriptionNotification } = useSubscriptionNotification();
  const { 
    enableChannelNotification, 
    disableChannelNotification, 
    isChannelNotificationEnabled,
    sendChannelNotification
  } = useNotification();

  const [channel, setChannel] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPending, setIsPending] = useState(false); // 新增：是否有待审核申请
  const [memberExpiry, setMemberExpiry] = useState(null); // 新增：成员过期时间
  const [hasNotification, setHasNotification] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState('text'); // text, image, video
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditingSubscribers, setIsEditingSubscribers] = useState(false);
  const [tempSubscriberCount, setTempSubscriberCount] = useState('');
  
  // 时间修改相关状态
  const [editingPostId, setEditingPostId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // 内容修改相关状态
  const [editingContentPostId, setEditingContentPostId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [showContentEditor, setShowContentEditor] = useState(false);

  useEffect(() => {
    loadChannelData();
  }, [channelId]);

  useEffect(() => {
    if (channel && user && user.id) {
      setIsSubscribed(isUserSubscribed(channelId, user.id));
      setIsPending(hasPendingRequest(channelId, user.id));
      setHasNotification(isChannelNotificationEnabled(channelId));
      
      // 获取成员过期时间
      const expiry = getMemberExpiry(channelId, user.id);
      setMemberExpiry(expiry);
    }
  }, [channel, channelId, user]);

  const loadChannelData = () => {
    const channelData = getChannelById(channelId);
    if (channelData) {
      setChannel(channelData);
      navigation.setOptions({ title: channelData.name });
    } else {
      Alert.alert('错误', '频道不存在');
      navigation.goBack();
    }
  };

  const handleSubscribeToggle = async () => {
    if (!user || !user.id) {
      Alert.alert('错误', '用户信息不宅整，请重新登录');
      return;
    }
    
    // 如果已经订阅，不能取消订阅（只能等待过期）
    if (isSubscribed) {
      Alert.alert('提示', '您已是频道成员，请等待会员过期后再操作');
      return;
    }

    // 如果有待审核的申请，可以取消
    if (isPending) {
      Alert.alert(
        '确认取消',
        '确定要取消订阅申请吗？',
        [
          { text: '不取消', style: 'cancel' },
          {
            text: '取消申请',
            style: 'destructive',
            onPress: async () => {
              const result = await cancelSubscriptionRequest(channelId, user.id);
              if (result.success) {
                setIsPending(false);
                loadChannelData();
              } else {
                Alert.alert('错误', result.error);
              }
            }
          }
        ]
      );
      return;
    }

    // 申请订阅
    const result = await requestSubscription(channelId, user.id, {
      nickname: user.nickname,
      avatar: user.avatar,
      phone: user.phone
    });

    if (result.success) {
      setIsPending(true);
      
      // 创建通知给频道主
      createSubscriptionNotification(
        channelId,
        channel.name,
        user.id,
        {
          nickname: user.nickname,
          avatar: user.avatar,
          phone: user.phone
        }
      );

      Alert.alert('成功', '订阅申请已提交，请等待频道主审核');
      loadChannelData();
    } else {
      Alert.alert('错误', result.error);
    }
  };

  const handleNotificationToggle = async () => {
    if (!isSubscribed) {
      Alert.alert('提示', '请先订阅频道才能开启强制提醒');
      return;
    }

    if (hasNotification) {
      disableChannelNotification(channelId);
      setHasNotification(false);
    } else {
      const result = await enableChannelNotification(channelId, channel.name);
      if (result.success) {
        setHasNotification(true);
      } else {
        Alert.alert('开启失败', result.error);
      }
    }
  };

  const handleDeleteChannel = () => {
    Alert.alert(
      '确认删除',
      '确定要解散这个频道吗？此操作不可恢复。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            if (!user || !user.id) {
              Alert.alert('错误', '用户信息不完整，请重新登录');
              return;
            }
            
            const result = await deleteChannel(channelId, user.id);
            if (result.success) {
              Alert.alert('成功', '频道已解散', [
                { text: '确定', onPress: () => navigation.goBack() }
              ]);
            } else {
              Alert.alert('错误', result.error);
            }
          }
        }
      ]
    );
  };

  const handleEditSubscribers = () => {
    setTempSubscriberCount(channel.subscriberCount.toString());
    setIsEditingSubscribers(true);
  };

  const handleSaveSubscriberCount = async () => {
    const newCount = parseInt(tempSubscriberCount);
    
    if (isNaN(newCount) || newCount < 0) {
      Alert.alert('错误', '请输入有效的数字');
      return;
    }

    const actualSubscribers = channel.subscribers.length;
    if (newCount < actualSubscribers) {
      Alert.alert(
        '错误', 
        `订阅人数不能小于实际订阅人数(${actualSubscribers})`
      );
      return;
    }

    const result = await updateSubscriberCount(channelId, newCount, user.id);
    
    if (result.success) {
      setChannel(prev => ({
        ...prev,
        subscriberCount: newCount
      }));
      setIsEditingSubscribers(false);
      Alert.alert('成功', '订阅人数已更新');
    } else {
      Alert.alert('错误', result.error);
    }
  };

  const handleMediaPicker = async (type) => {
    try {
      let result;
      if (type === 'image') {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else if (type === 'video') {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Videos,
          allowsEditing: true,
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        setSelectedMedia(result.assets[0]);
        setPostType(type);
      }
    } catch (error) {
      Alert.alert('错误', '选择媒体文件失败');
    }
  };

  const handlePost = async () => {
    if (!postContent.trim() && !selectedMedia) {
      Alert.alert('提示', '请输入内容或选择媒体文件');
      return;
    }

    if (!user || !user.id) {
      Alert.alert('错误', '用户信息不完整，请重新登录');
      return;
    }

    setLoading(true);

    try {
      const post = {
        type: selectedMedia ? postType : 'text',
        content: postContent.trim(),
        media: selectedMedia ? selectedMedia.uri : null
      };

      const result = await postToChannel(channelId, post, user.id);
      
      if (result.success) {
        // 发送通知给开启了强制提醒的用户
        await sendChannelNotification(
          channelId, 
          channel.name, 
          postContent.trim() || '发布了新内容'
        );

        setPostContent('');
        setSelectedMedia(null);
        setPostType('text');
        loadChannelData(); // 重新加载数据
        
        Alert.alert('成功', '内容发布成功');
      } else {
        Alert.alert('错误', result.error);
      }
    } catch (error) {
      Alert.alert('错误', '发布失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理点击时间进行修改
  const handleTimeClick = (post) => {
    Alert.alert(
      '修改发布时间',
      '✅ 选择器显示的是北京时间（UTC+8）\n请按照北京时间选择您需要的时间',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '开始选择',
          onPress: () => {
            setEditingPostId(post.id);
            // 将北京时间转换为本地时间，供时间选择器显示
            const localDate = beijingToLocalDate(post.timestamp);
            setSelectedDate(localDate);
            setShowDatePicker(true);
          }
        }
      ]
    );
  };

  // 日期选择处理
  const onDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && date) {
        setSelectedDate(date);
        setTimeout(() => {
          setShowTimePicker(true);
        }, 100);
      } else {
        setEditingPostId(null);
      }
    } else {
      // iOS
      if (date) {
        setSelectedDate(date);
      }
    }
  };

  // 时间选择处理
  const onTimeChange = async (event, time) => {
    setShowTimePicker(false);
    
    if (event.type === 'set' && time) {
      const finalDate = new Date(selectedDate);
      finalDate.setHours(time.getHours());
      finalDate.setMinutes(time.getMinutes());
      
      // 将本地时间转换为北京时间戳
      const beijingTimestamp = localDateToBeijing(finalDate);
      const result = await updatePostTime(channelId, editingPostId, beijingTimestamp);
      
      if (result.success) {
        loadChannelData();
        Alert.alert('成功', '发布时间已更新为北京时间');
      } else {
        Alert.alert('错误', result.error);
      }
    }
    
    setEditingPostId(null);
  };

  // iOS 确认修改
  const handleIOSConfirm = async () => {
    setShowDatePicker(false);
    
    // 将本地时间转换为北京时间戳
    const beijingTimestamp = localDateToBeijing(selectedDate);
    const result = await updatePostTime(channelId, editingPostId, beijingTimestamp);
    
    if (result.success) {
      loadChannelData();
      Alert.alert('成功', '发布时间已更新为北京时间');
    } else {
      Alert.alert('错误', result.error);
    }
    
    setEditingPostId(null);
  };

  // 处理点击内容进行修改
  const handleContentClick = (post) => {
    setEditingContentPostId(post.id);
    setEditingContent(post.content);
    setShowContentEditor(true);
  };

  // 保存内容修改
  const handleSaveContent = async () => {
    if (!editingContent.trim()) {
      Alert.alert('错误', '内容不能为空');
      return;
    }

    const result = await updatePostContent(channelId, editingContentPostId, editingContent.trim());
    
    if (result.success) {
      loadChannelData();
      setShowContentEditor(false);
      setEditingContentPostId(null);
      setEditingContent('');
      Alert.alert('成功', '内容已更新');
    } else {
      Alert.alert('错误', result.error);
    }
  };

  // 取消内容编辑
  const handleCancelContentEdit = () => {
    setShowContentEditor(false);
    setEditingContentPostId(null);
    setEditingContent('');
  };

  // 切换隐藏当天内容功能
  const handleToggleHideToday = async () => {
    if (!user || !user.id) {
      Alert.alert('错误', '用户信息不完整，请重新登录');
      return;
    }

    const result = await toggleHideTodayContent(channelId, user.id);
    
    if (result.success) {
      loadChannelData();
      const status = result.hideTodayContent ? '开启' : '关闭';
      Alert.alert('成功', `已${status}隐藏当天内容功能`);
    } else {
      Alert.alert('错误', result.error);
    }
  };

  // 判断帖子是否是当天发布
  const isToday = (timestamp) => {
    const postDate = new Date(timestamp);
    const today = new Date();
    return postDate.getDate() === today.getDate() &&
           postDate.getMonth() === today.getMonth() &&
           postDate.getFullYear() === today.getFullYear();
  };

  const renderPost = ({ item: post }) => {
    // 判断是否需要隐藏：非成员 && 非频道主 && 开启了隐藏 && 是当天内容
    const shouldHide = !isCreator && !isSubscribed && channel.hideTodayContent && isToday(post.timestamp);

    return (
      <View style={styles.postItem}>
        <View style={styles.postHeader}>
          {isCreator ? (
            <TouchableOpacity 
              onPress={() => handleTimeClick(post)}
              activeOpacity={0.6}
            >
              <Text style={styles.postTime}>
                {formatBeijingTime(post.timestamp, 'datetime')}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.postTime}>
              {formatBeijingTime(post.timestamp, 'datetime')}
            </Text>
          )}
        </View>
        
        {shouldHide ? (
          // 隐藏状态：显示云雾遮罩和提示
          <View style={styles.hiddenContentContainer}>
            <View style={styles.cloudOverlay}>
              <Ionicons name="cloud" size={60} color="rgba(200, 200, 200, 0.6)" />
              <Text style={styles.hiddenText}>当天消息已隐藏</Text>
              <Text style={styles.hiddenHint}>请联系频道主开启！</Text>
            </View>
          </View>
        ) : (
          // 正常显示内容
          <>
            {post.type === 'text' && (
              isCreator ? (
                <TouchableOpacity 
                  onPress={() => handleContentClick(post)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.postContent}>{post.content}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.postContent}>{post.content}</Text>
              )
            )}
            
            {post.type === 'image' && post.media && (
              <View>
                {isCreator ? (
                  <TouchableOpacity 
                    onPress={() => handleContentClick(post)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.postContent}>{post.content}</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.postContent}>{post.content}</Text>
                )}
                <Image source={{ uri: post.media }} style={styles.postImage} />
              </View>
            )}
            
            {post.type === 'video' && post.media && (
              <View>
                {isCreator ? (
                  <TouchableOpacity 
                    onPress={() => handleContentClick(post)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.postContent}>{post.content}</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.postContent}>{post.content}</Text>
                )}
                <View style={styles.videoPlaceholder}>
                  <Ionicons name="play-circle-outline" size={48} color="#007AFF" />
                  <Text style={styles.videoText}>视频内容</Text>
                </View>
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  if (!channel) {
    return (
      <View style={styles.loadingContainer}>
        <Text>加载中...</Text>
      </View>
    );
  }

  // 安全检查 user 和 user.id
  if (!user || !user.id) {
    return (
      <View style={styles.loadingContainer}>
        <Text>用户信息加载中...</Text>
      </View>
    );
  }

  const isCreator = channel.creatorId === user.id;

  return (
    <LinearGradient
      colors={['#0C0C0C', '#1A1A1A', '#0C0C0C']}
      style={styles.gradientContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 频道头部信息 */}
        <View style={styles.headerContainer}>
          {/* 隐藏当天内容功能按钮（仅频道主可见） */}
          {isCreator && (
            <TouchableOpacity 
              style={styles.hideToggleButton}
              onPress={handleToggleHideToday}
            >
              <Ionicons 
                name={channel.hideTodayContent ? "eye" : "eye-off"} 
                size={24} 
                color={channel.hideTodayContent ? "#FF3B30" : "#00CC00"} 
              />
            </TouchableOpacity>
          )}
          
          {channel.avatar ? (
            <Image source={{ uri: channel.avatar }} style={styles.channelAvatar} />
          ) : (
            <View style={[styles.channelAvatar, styles.defaultAvatar]}>
              <Ionicons name="tv-outline" size={40} color="#CCCCCC" />
            </View>
          )}
          
          <Text style={styles.channelName}>{channel.name}</Text>
          <Text style={styles.channelDescription}>{channel.description}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={20} color="#CCCCCC" />
              <Text style={styles.statText}>{channel.subscriberCount} 位成员</Text>
              {isCreator && (
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={handleEditSubscribers}
                >
                  <Ionicons name="create-outline" size={16} color="#007AFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* 操作按钮 */}
          <View style={styles.actionContainer}>
            {!isCreator && (
              <>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    isPending ? styles.pendingButton : 
                    isSubscribed ? styles.subscribedButton : styles.subscribeButton
                  ]}
                  onPress={handleSubscribeToggle}
                  disabled={isPending && !isSubscribed}
                >
                  <Text style={[
                    styles.actionButtonText,
                    isPending ? styles.pendingButtonText :
                    isSubscribed ? styles.subscribedButtonText : styles.subscribeButtonText
                  ]}>
                    {isPending ? '等待频道主审核' : isSubscribed ? '已订阅' : '订阅'}
                  </Text>
                </TouchableOpacity>
                
                {/* 显示成员过期时间 */}
                {isSubscribed && memberExpiry && (
                  <View style={styles.expiryInfo}>
                    <Ionicons name="time-outline" size={14} color="#FF9500" />
                    <Text style={styles.expiryText}>
                      会员期至: {formatBeijingTime(memberExpiry, 'date')}
                    </Text>
                  </View>
                )}
              </>
            )}

            {isSubscribed && !isCreator && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  hasNotification ? styles.notificationOnButton : styles.notificationOffButton
                ]}
                onPress={handleNotificationToggle}
              >
                <Ionicons 
                  name={hasNotification ? "notifications" : "notifications-outline"} 
                  size={16} 
                  color={hasNotification ? "white" : "#007AFF"} 
                />
                <Text style={[
                  styles.actionButtonText,
                  hasNotification ? styles.notificationOnText : styles.notificationOffText
                ]}>
                  {hasNotification ? '强制提醒已开启' : '开启强制提醒'}
                </Text>
              </TouchableOpacity>
            )}

            {isCreator && (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDeleteChannel}
              >
                <Text style={styles.deleteButtonText}>解散频道</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 频道内容 */}
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>频道内容</Text>
          
          {channel.posts && channel.posts.length > 0 ? (
            <FlatList
              data={channel.posts}
              keyExtractor={(item) => item.id}
              renderItem={renderPost}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyContent}>
              <Ionicons name="document-text-outline" size={48} color="#666666" />
              <Text style={styles.emptyText}>暂无内容</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 发布内容区域（仅创建者可见） */}
      {isCreator && (
        <View style={styles.postContainer}>
          <View style={styles.mediaPreview}>
            {selectedMedia && (
              <View style={styles.selectedMediaContainer}>
                {postType === 'image' && (
                  <Image source={{ uri: selectedMedia.uri }} style={styles.previewImage} />
                )}
                {postType === 'video' && (
                  <View style={styles.previewVideo}>
                    <Ionicons name="videocam-outline" size={24} color="#007AFF" />
                    <Text style={styles.previewVideoText}>已选择视频</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.removeMediaButton}
                  onPress={() => {
                    setSelectedMedia(null);
                    setPostType('text');
                  }}
                >
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.postInput}
              placeholder="分享新内容..."
            placeholderTextColor="#999999"
              value={postContent}
              onChangeText={setPostContent}
              multiline
              maxLength={500}
            />
            
            <View style={styles.postActions}>
              <View style={styles.mediaButtons}>
                <TouchableOpacity
                  style={styles.mediaButton}
                  onPress={() => handleMediaPicker('image')}
                >
                  <Ionicons name="image-outline" size={24} color="#007AFF" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.mediaButton}
                  onPress={() => handleMediaPicker('video')}
                >
                  <Ionicons name="videocam-outline" size={24} color="#007AFF" />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={[styles.postButton, loading && styles.disabledButton]}
                onPress={handlePost}
                disabled={loading}
              >
                <Text style={styles.postButtonText}>
                  {loading ? '发布中...' : '发布'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>

    {/* 订阅人数编辑模态框 */}
    <Modal
      visible={isEditingSubscribers}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsEditingSubscribers(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>修改订阅人数</Text>
          
          <Text style={styles.modalHint}>
            实际订阅人数：{channel?.subscribers.length}
          </Text>
          
          <TextInput
            style={styles.modalInput}
            value={tempSubscriberCount}
            onChangeText={setTempSubscriberCount}
            placeholder="输入订阅人数"
            placeholderTextColor="#999999"
            keyboardType="numeric"
            autoFocus={true}
          />
          
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setIsEditingSubscribers(false)}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleSaveSubscriberCount}
            >
              <Text style={styles.confirmButtonText}>确定</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>

    {/* 内容编辑模态框 */}
    <Modal
      visible={showContentEditor}
      transparent={true}
      animationType="slide"
      onRequestClose={handleCancelContentEdit}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.contentEditorContainer}>
          <Text style={styles.modalTitle}>修改内容</Text>
          
          <TextInput
            style={styles.contentEditorInput}
            value={editingContent}
            onChangeText={setEditingContent}
            placeholder="输入内容"
            placeholderTextColor="#999999"
            multiline={true}
            maxLength={500}
            autoFocus={true}
            textAlignVertical="top"
          />
          
          <Text style={styles.characterCount}>
            {editingContent.length}/500
          </Text>
          
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={handleCancelContentEdit}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleSaveContent}
            >
              <Text style={styles.confirmButtonText}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>

    {/* Android 日期选择器 */}
    {Platform.OS === 'android' && showDatePicker && (
      <DateTimePicker
        value={selectedDate}
        mode="date"
        display="default"
        onChange={onDateChange}
      />
    )}
    
    {/* Android 时间选择器 */}
    {Platform.OS === 'android' && showTimePicker && (
      <DateTimePicker
        value={selectedDate}
        mode="time"
        display="default"
        onChange={onTimeChange}
      />
    )}

    {/* iOS 时间选择器 */}
    {Platform.OS === 'ios' && showDatePicker && (
      <Modal
        visible={true}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowDatePicker(false);
          setEditingPostId(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>修改发布时间</Text>
            <Text style={styles.timeZoneNote}>✅ 选择器显示的是北京时间（UTC+8）</Text>
            
            <DateTimePicker
              value={selectedDate}
              mode="datetime"
              display="spinner"
              onChange={onDateChange}
              locale="zh-CN"
            />
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowDatePicker(false);
                  setEditingPostId(null);
                }}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleIOSConfirm}
              >
                <Text style={styles.confirmButtonText}>确定</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0C0C0C',
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    position: 'relative',
  },
  hideToggleButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 10,
  },
  channelAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
  },
  defaultAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  channelDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#CCCCCC',
  },
  editButton: {
    marginLeft: 8,
    padding: 4,
  },
  actionContainer: {
    width: '100%',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 6,
  },
  subscribeButton: {
    backgroundColor: '#007AFF',
  },
  subscribedButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.5)',
  },
  pendingButton: {
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.5)',
  },
  notificationOffButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.5)',
  },
  notificationOnButton: {
    backgroundColor: '#FF9500',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  subscribeButtonText: {
    color: 'white',
  },
  subscribedButtonText: {
    color: '#007AFF',
  },
  pendingButtonText: {
    color: '#FF9500',
  },
  expiryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    gap: 4,
  },
  expiryText: {
    fontSize: 11,
    color: '#FF9500',
  },
  notificationOffText: {
    color: '#007AFF',
  },
  notificationOnText: {
    color: 'white',
  },
  deleteButtonText: {
    color: 'white',
  },
  contentContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    margin: 15,
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  postItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 15,
  },
  postHeader: {
    marginBottom: 8,
  },
  postTime: {
    fontSize: 12,
    color: '#999999',
  },
  postContent: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  videoPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    marginTop: 8,
    fontSize: 14,
    color: '#CCCCCC',
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    marginTop: 10,
  },
  hiddenContentContainer: {
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cloudOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(200, 200, 200, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(200, 200, 200, 0.3)',
  },
  hiddenText: {
    fontSize: 16,
    color: '#CCCCCC',
    marginTop: 10,
    fontWeight: '600',
  },
  hiddenHint: {
    fontSize: 13,
    color: '#999999',
    marginTop: 5,
    textAlign: 'center',
  },
  postContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  mediaPreview: {
    marginBottom: 10,
  },
  selectedMediaContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  previewVideo: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewVideoText: {
    fontSize: 10,
    color: '#007AFF',
    marginTop: 4,
  },
  removeMediaButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  postInput: {
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  mediaButton: {
    padding: 8,
  },
  postButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: '#666666',
  },
  postButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  // 模态框样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxWidth: 300,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#FFFFFF',
  },
  modalHint: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  confirmButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  timeZoneNote: {
    fontSize: 13,
    color: '#00CC00',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '500',
    lineHeight: 18,
  },
  contentEditorContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  contentEditorInput: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
    minHeight: 150,
    maxHeight: 300,
  },
  characterCount: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'right',
    marginBottom: 15,
  },
});