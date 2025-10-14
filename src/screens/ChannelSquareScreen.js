import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
  TextInput,
  Platform,
  Alert,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useChannel } from '../context/ChannelContext';
import { useChat } from '../context/ChatContext';

export default function ChannelSquareScreen({ navigation }) {
  const { user, getUserById, isAdmin } = useAuth();
  const { channels, getChannels, categories, updateCategoryName } = useChannel();
  const { getOrCreateConversation } = useChat();
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredChannels, setFilteredChannels] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editingCategoryIndex, setEditingCategoryIndex] = useState(-1);
  const [tempCategoryName, setTempCategoryName] = useState('');

  useEffect(() => {
    loadChannels();
  }, []);

  useEffect(() => {
    filterChannels();
  }, [channels, searchText, selectedCategory]);

  const loadChannels = () => {
    const allChannels = getChannels();
    setFilteredChannels(allChannels);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟刷新
    loadChannels();
    setRefreshing(false);
  };

  const filterChannels = () => {
    let filtered = channels;

    // 按分类筛选
    if (selectedCategory !== '全部') {
      filtered = filtered.filter(channel => channel.category === selectedCategory);
    }

    // 按搜索文本筛选
    if (searchText.trim()) {
      filtered = filtered.filter(channel =>
        channel.name.toLowerCase().includes(searchText.toLowerCase()) ||
        channel.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredChannels(filtered);
  };

  const handleEditCategory = (categoryIndex) => {
    if (!isAdmin) {
      Alert.alert('权限不足', '只有管理员可以修改分类名称');
      return;
    }
    
    // 不能编辑“全部”分类
    if (categoryIndex === 0) {
      Alert.alert('提示', '“全部”分类不可修改');
      return;
    }
    
    setEditingCategoryIndex(categoryIndex);
    setTempCategoryName(categories[categoryIndex]);
    setIsEditingCategory(true);
  };

  const handleSaveCategoryName = async () => {
    const newName = tempCategoryName.trim();
    
    if (!newName) {
      Alert.alert('错误', '分类名称不能为空');
      return;
    }
    
    const result = await updateCategoryName(editingCategoryIndex, newName, isAdmin);
    
    if (result.success) {
      // 如果当前选中的分类被修改了，更新选中状态
      if (selectedCategory === result.oldName) {
        setSelectedCategory(result.newName);
      }
      
      setIsEditingCategory(false);
      setEditingCategoryIndex(-1);
      setTempCategoryName('');
      
      Alert.alert('成功', `分类名称已修改为"${result.newName}"`);
    } else {
      Alert.alert('修改失败', result.error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingCategory(false);
    setEditingCategoryIndex(-1);
    setTempCategoryName('');
  };

  const handleChannelPress = (channel) => {
    navigation.navigate('ChannelDetail', { channelId: channel.id });
  };

  const handleCreatorPress = (channel) => {
    if (!user || !user.id) {
      Alert.alert('错误', '用户信息不完整，请重新登录');
      return;
    }
    
    if (channel.creatorId === user.id) {
      return; // 不能和自己聊天
    }

    // 实时获取创建者信息，确保使用最新的头像
    const creator = getUserById(channel.creatorId);
    const creatorAvatar = creator?.avatar || channel.creatorAvatar;
    const creatorName = creator?.nickname || channel.creatorName;

    // 创建或获取对话
    const conversation = getOrCreateConversation(
      user.id,
      channel.creatorId,
      { nickname: user.nickname, avatar: user.avatar },
      { nickname: creatorName, avatar: creatorAvatar }
    );

    navigation.navigate('ChatDetail', {
      conversationId: conversation.id,
      otherUser: {
        id: channel.creatorId,
        nickname: creatorName,
        avatar: creatorAvatar
      }
    });
  };

  const renderChannelCard = ({ item: channel }) => {
    // 实时获取创建者信息，确保头像是最新的
    const creator = getUserById(channel.creatorId);
    const creatorAvatar = creator?.avatar || channel.creatorAvatar;
    const creatorName = creator?.nickname || channel.creatorName;
    
    return (
      <TouchableOpacity
        style={styles.channelCard}
        onPress={() => handleChannelPress(channel)}
      >
        <View style={styles.channelImageContainer}>
          {channel.avatar ? (
            <Image source={{ uri: channel.avatar }} style={styles.channelImage} />
          ) : (
            <View style={[styles.channelImage, styles.defaultChannelImage]}>
              <Ionicons name="tv-outline" size={40} color="#CCCCCC" />
            </View>
          )}
        </View>

        <View style={styles.channelInfo}>
          <Text style={styles.channelName} numberOfLines={1}>
            {channel.name}
          </Text>
          
          <Text style={styles.channelDescription} numberOfLines={2}>
            {channel.description}
          </Text>
          
          <View style={styles.channelStats}>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={16} color="#CCCCCC" />
              <Text style={styles.statText}>{channel.subscriberCount} 位订阅者</Text>
            </View>
            
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>{channel.category}</Text>
            </View>
          </View>

          <View style={styles.creatorInfo}>
            <TouchableOpacity
              style={styles.creatorButton}
              onPress={() => handleCreatorPress(channel)}
            >
              {creatorAvatar ? (
                <Image source={{ uri: creatorAvatar }} style={styles.creatorAvatar} />
              ) : (
                <View style={[styles.creatorAvatar, styles.defaultAvatar]}>
                  <Ionicons name="person-outline" size={16} color="#CCCCCC" />
                </View>
              )}
              <Text style={styles.creatorName}>@{creatorName}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoryFilter = () => (
    <View style={styles.categoryContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item, index }) => (
          <View style={styles.categoryItemContainer}>
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item && styles.selectedCategoryButton
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === item && styles.selectedCategoryButtonText
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
            
            {/* 管理员编辑按钮（不包括“全部”分类） */}
            {isAdmin && index > 0 && (
              <TouchableOpacity
                style={styles.editCategoryButton}
                onPress={() => handleEditCategory(index)}
              >
                <Ionicons name="create-outline" size={14} color="#007AFF" />
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );

  return (
    <>
      <LinearGradient
        colors={['#0C0C0C', '#1A1A1A', '#0C0C0C']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
      {/* 搜索栏 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#CCCCCC" />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索频道..."
            placeholderTextColor="#999999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* 分类筛选 */}
      {renderCategoryFilter()}

      {/* 频道列表 */}
      <FlatList
        data={filteredChannels}
        keyExtractor={(item) => item.id}
        renderItem={renderChannelCard}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="tv-outline" size={64} color="#666666" />
            <Text style={styles.emptyText}>暂无频道</Text>
            <Text style={styles.emptySubText}>
              {searchText ? '试试其他关键词吧' : '等待管理员创建频道'}
            </Text>
          </View>
        }
      />
      </LinearGradient>

      {/* 分类编辑模态框 */}
      <Modal
        visible={isEditingCategory}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>修改分类名称</Text>
            
            <Text style={styles.modalHint}>
              当前分类：{editingCategoryIndex >= 0 ? categories[editingCategoryIndex] : ''}
            </Text>
            
            <TextInput
              style={styles.modalInput}
              value={tempCategoryName}
              onChangeText={setTempCategoryName}
              placeholder="输入新的分类名称"
              placeholderTextColor="#999999"
              autoFocus={true}
              maxLength={10}
            />
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelEdit}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSaveCategoryName}
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
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#FFFFFF',
  },
  categoryContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginHorizontal: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedCategoryButton: {
    backgroundColor: '#333333',
    borderColor: '#555555',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  selectedCategoryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  categoryItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 3,
  },
  editCategoryButton: {
    marginLeft: 4,
    padding: 2,
  },
  listContainer: {
    padding: 15,
  },
  channelCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  channelImageContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  channelImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  defaultChannelImage: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelInfo: {
    flex: 1,
  },
  channelName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  channelDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  channelStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#CCCCCC',
  },
  categoryTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  categoryText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  creatorInfo: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: 12,
  },
  creatorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  defaultAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  creatorName: {
    fontSize: 14,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#CCCCCC',
    marginTop: 15,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999999',
    marginTop: 5,
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
});