import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
  FlatList,
  Modal,
  TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useChannel } from '../context/ChannelContext';
import { usePrivacy } from '../context/PrivacyContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateUser, isAdmin, changePassword } = useAuth();
  const { getUserChannels } = useChannel();
  const { showPrivacyPolicy } = usePrivacy();
  const [userChannels, setUserChannels] = useState([]);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [tempNickname, setTempNickname] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      loadUserChannels();
    }
  }, [user]);

  const loadUserChannels = () => {
    if (!user || !user.id) {
      setUserChannels([]);
      return;
    }
    const channels = getUserChannels(user.id);
    setUserChannels(channels);
  };

  const handleAvatarChange = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限不足', '需要访问相册权限来更换头像');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const updateResult = await updateUser({ avatar: result.assets[0].uri });
        if (updateResult.success) {
          Alert.alert('成功', '头像更新成功');
        } else {
          Alert.alert('错误', updateResult.error);
        }
      }
    } catch (error) {
      Alert.alert('错误', '更换头像失败');
    }
  };

  const handleNicknameEdit = () => {
    console.log('handleNicknameEdit 被调用, Platform.OS:', Platform.OS);
    console.log('当前用户:', user);
    
    if (Platform.OS === 'web') {
      const newNickname = prompt('请输入新昵称', user.nickname);
      console.log('Web prompt 结果:', newNickname);
      if (newNickname && newNickname.trim() !== '') {
        updateNickname(newNickname.trim());
      }
    } else {
      // 使用自定义模态对话框替换 Alert.prompt
      console.log('显示自定义编辑对话框');
      setTempNickname(user.nickname);
      setIsEditingNickname(true);
    }
  };

  const handleNicknameConfirm = () => {
    if (tempNickname && tempNickname.trim() !== '') {
      updateNickname(tempNickname.trim());
    }
    setIsEditingNickname(false);
  };

  const handleNicknameCancel = () => {
    setIsEditingNickname(false);
    setTempNickname('');
  };

  const updateNickname = async (newNickname) => {
    if (newNickname === user.nickname) {
      return;
    }

    const result = await updateUser({ nickname: newNickname });
    if (result.success) {
      const message = '昵称修改成功';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('成功', message);
      }
    } else {
      const message = result.error || '昵称修改失败';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('错误', message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      // 根据平台使用不同的确认方式
      if (Platform.OS === 'web') {
        const confirmed = confirm('确定要退出登录吗？');
        if (confirmed) {
          await logout();
          console.log('退出登录成功');
        }
      } else {
        Alert.alert(
          '确认退出',
          '确定要退出登录吗？',
          [
            { text: '取消', style: 'cancel' },
            {
              text: '确定',
              style: 'destructive',
              onPress: async () => {
                try {
                  await logout();
                  // 退出成功，Auth会自动处理导航
                  setTimeout(() => {
                    Alert.alert('提示', '已退出登录');
                  }, 100);
                } catch (error) {
                  console.error('退出登录失败:', error);
                  Alert.alert('错误', '退出失败，请重试');
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('退出登录失败:', error);
      const message = '退出失败，请重试';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('错误', message);
      }
    }
  };

  const handleChangePassword = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsChangingPassword(true);
  };

  const handlePasswordConfirm = async () => {
    // 验证输入
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('错误', '请填写所有密码字段');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('错误', '两次输入的新密码不一致');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('错误', '新密码至少需要6个字符');
      return;
    }

    // 调用修改密码方法
    const result = await changePassword(oldPassword, newPassword);

    if (result.success) {
      setIsChangingPassword(false);
      Alert.alert('成功', '密码修改成功');
    } else {
      Alert.alert('修改失败', result.error);
    }
  };

  const handlePasswordCancel = () => {
    setIsChangingPassword(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleChannelPress = (channel) => {
    navigation.navigate('ChannelDetail', { channelId: channel.id });
  };

  const renderChannelItem = ({ item: channel }) => {
    // 安全检查：确保 user 存在且有 id 属性
    if (!user || !user.id) {
      console.warn('User is null in renderChannelItem');
      return null;
    }
    
    return (
      <TouchableOpacity
        style={styles.channelItem}
        onPress={() => handleChannelPress(channel)}
      >
        <View style={styles.channelItemLeft}>
          {channel.avatar ? (
            <Image source={{ uri: channel.avatar }} style={styles.channelItemAvatar} />
          ) : (
            <View style={[styles.channelItemAvatar, styles.defaultChannelAvatar]}>
              <Ionicons name="tv-outline" size={20} color="#CCCCCC" />
            </View>
          )}
          
          <View style={styles.channelItemInfo}>
            <Text style={styles.channelItemName} numberOfLines={1}>
              {channel.name}
            </Text>
            <Text style={styles.channelItemDesc} numberOfLines={1}>
              {channel.description}
            </Text>
            <View style={styles.channelItemStats}>
              <Ionicons name="people-outline" size={14} color="#CCCCCC" />
              <Text style={styles.channelItemStatsText}>
                {channel.subscriberCount}
              </Text>
              <View style={styles.channelItemRole}>
                <Text style={styles.channelItemRoleText}>
                  {channel.creatorId === user.id ? '创建者' : '已订阅'}
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        <Ionicons name="chevron-forward-outline" size={20} color="#CCCCCC" />
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <>
      <LinearGradient
        colors={['#0C0C0C', '#1A1A1A', '#0C0C0C']}
        style={styles.gradientContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView style={styles.container}>
      {/* 用户信息区域 */}
      <View style={styles.userInfoContainer}>
        <TouchableOpacity style={styles.avatarContainer} onPress={handleAvatarChange}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.defaultAvatar]}>
              <Ionicons name="person-outline" size={40} color="#CCCCCC" />
            </View>
          )}
          <View style={styles.avatarOverlay}>
            <Ionicons name="camera-outline" size={20} color="white" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleNicknameEdit} style={styles.nicknameContainer}>
          <Text style={styles.nickname}>{user.nickname}</Text>
          <Ionicons name="create-outline" size={16} color="#CCCCCC" style={styles.editIcon} />
        </TouchableOpacity>
        <Text style={styles.phone}>{user.phone}</Text>
        
        {isAdmin && (
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={16} color="#FF9500" />
            <Text style={styles.adminBadgeText}>管理员</Text>
          </View>
        )}
      </View>

      {/* 功能菜单 */}
      <View style={styles.menuContainer}>
        {isAdmin && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('CreateChannel')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: '#007AFF' }]}>
                <Ionicons name="add-circle-outline" size={20} color="white" />
              </View>
              <Text style={styles.menuItemText}>创建频道</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#CCCCCC" />
          </TouchableOpacity>
        )}

        {isAdmin && <View style={styles.menuSeparator} />}
        
        <TouchableOpacity
          style={styles.menuItem}
          onPress={showPrivacyPolicy}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuItemIcon, { backgroundColor: '#34C759' }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color="white" />
            </View>
            <Text style={styles.menuItemText}>隐私政策</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#CCCCCC" />
        </TouchableOpacity>
      </View>

      {/* 我加入的频道 */}
      <View style={styles.channelsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>我的频道</Text>
          <Text style={styles.sectionSubtitle}>
            共 {userChannels.length} 个频道
          </Text>
        </View>

        {userChannels.length > 0 ? (
          <View style={styles.channelsList}>
            <FlatList
              data={userChannels}
              keyExtractor={(item) => item.id}
              renderItem={renderChannelItem}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        ) : user ? (
          <View style={styles.emptyChannels}>
            <Ionicons name="tv-outline" size={48} color="#666666" />
            <Text style={styles.emptyChannelsText}>暂无加入的频道</Text>
            <Text style={styles.emptyChannelsSubText}>
              去频道广场找找感兴趣的频道吧
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => navigation.navigate('ChannelSquare')}
            >
              <Text style={styles.exploreButtonText}>探索频道</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {/* 退出登录和修改密码 */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleChangePassword}>
          <Ionicons name="key-outline" size={20} color="#007AFF" />
          <Text style={styles.changePasswordButtonText}>修改密码</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          <Text style={styles.logoutButtonText}>退出登录</Text>
        </TouchableOpacity>
      </View>
        </ScrollView>
      </LinearGradient>
  
    {/* 昵称编辑模态对话框 */}
    <Modal
      visible={isEditingNickname}
      transparent={true}
      animationType="slide"
      onRequestClose={handleNicknameCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>修改昵称</Text>
              
          <TextInput
            style={styles.modalInput}
            value={tempNickname}
            onChangeText={setTempNickname}
            placeholder="请输入新昵称"
            placeholderTextColor="#999999"
            autoFocus={true}
            maxLength={20}
          />
              
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={handleNicknameCancel}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
                
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleNicknameConfirm}
            >
              <Text style={styles.confirmButtonText}>确定</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>

    {/* 修改密码模态对话框 */}
    <Modal
      visible={isChangingPassword}
      transparent={true}
      animationType="slide"
      onRequestClose={handlePasswordCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>修改密码</Text>
          
          <TextInput
            style={styles.modalInput}
            value={oldPassword}
            onChangeText={setOldPassword}
            placeholder="请输入原密码"
            placeholderTextColor="#999999"
            secureTextEntry
            autoFocus={true}
          />
          
          <TextInput
            style={styles.modalInput}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="请输入新密码（至少6位）"
            placeholderTextColor="#999999"
            secureTextEntry
          />
          
          <TextInput
            style={styles.modalInput}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="请再次输入新密码"
            placeholderTextColor="#999999"
            secureTextEntry
          />
          
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={handlePasswordCancel}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handlePasswordConfirm}
            >
              <Text style={styles.confirmButtonText}>确定</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  </>
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
  userInfoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  defaultAvatar: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nicknameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    gap: 8,
  },
  nickname: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  editIcon: {
    marginTop: 2,
    color: '#CCCCCC',
  },
  phone: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 10,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.4)',
  },
  adminBadgeText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '600',
  },
  menuContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 20,
    marginHorizontal: 15,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  menuSeparator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 15,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  channelsContainer: {
    marginTop: 20,
    marginHorizontal: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  channelsList: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  channelItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  channelItemAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  defaultChannelAvatar: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelItemInfo: {
    flex: 1,
  },
  channelItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  channelItemDesc: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 5,
  },
  channelItemStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  channelItemStatsText: {
    fontSize: 12,
    color: '#CCCCCC',
    marginLeft: 2,
    marginRight: 10,
  },
  channelItemRole: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.4)',
  },
  channelItemRoleText: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: 77,
  },
  emptyChannels: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  emptyChannelsText: {
    fontSize: 16,
    color: '#CCCCCC',
    marginTop: 15,
    marginBottom: 5,
  },
  emptyChannelsSubText: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 20,
  },
  exploreButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  actionContainer: {
    marginTop: 30,
    marginHorizontal: 15,
    marginBottom: 30,
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  changePasswordButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  logoutButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  },
  // 模态对话框样式
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
    marginBottom: 20,
    color: '#FFFFFF',
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
});