import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useChannel } from '../context/ChannelContext';

export default function CreateChannelScreen({ navigation }) {
  const { user, isAdmin } = useAuth();
  const { createChannel, getCreateCategories } = useChannel();
  
  const [channelName, setChannelName] = useState('');
  const [channelDescription, setChannelDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [channelAvatar, setChannelAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);

  // 检查管理员权限并初始化分类
  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('权限不足', '只有管理员可以创建频道', [
        { text: '确定', onPress: () => navigation.goBack() }
      ]);
    } else {
      // 获取可用的分类列表（不包括"全部"）
      const categories = getCreateCategories();
      setAvailableCategories(categories);
      
      // 设置默认选中的分类
      if (categories.length > 0) {
        setSelectedCategory(categories[0]);
      }
    }
  }, [isAdmin, getCreateCategories]);

  const handleAvatarPicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限不足', '需要访问相册权限来选择频道头像');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setChannelAvatar(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('错误', '选择头像失败');
    }
  };

  const handleSubmit = async () => {
    // 验证输入
    if (!channelName.trim()) {
      Alert.alert('提示', '请输入频道名称');
      return;
    }

    if (!channelDescription.trim()) {
      Alert.alert('提示', '请输入频道描述');
      return;
    }

    if (channelName.trim().length < 2) {
      Alert.alert('提示', '频道名称至少需要2个字符');
      return;
    }

    if (channelDescription.trim().length < 10) {
      Alert.alert('提示', '频道描述至少需要10个字符');
      return;
    }

    setLoading(true);

    if (!user || !user.id) {
      Alert.alert('错误', '用户信息不完整，请重新登录');
      return;
    }

    try {
      const channelData = {
        name: channelName.trim(),
        description: channelDescription.trim(),
        category: selectedCategory,
        avatar: channelAvatar
      };

      const result = await createChannel(channelData, user.id, user.nickname);
      
      if (result.success) {
        Alert.alert(
          '创建成功',
          `频道"${channelName}"已创建成功！`,
          [
            {
              text: '查看频道',
              onPress: () => {
                navigation.replace('ChannelDetail', { 
                  channelId: result.channel.id 
                });
              }
            }
          ]
        );
      } else {
        Alert.alert('创建失败', result.error);
      }
    } catch (error) {
      Alert.alert('错误', '创建频道失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryButton = (category) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryButton,
        selectedCategory === category && styles.selectedCategoryButton
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === category && styles.selectedCategoryButtonText
      ]}>
        {category}
      </Text>
    </TouchableOpacity>
  );

  if (!isAdmin) {
    return (
      <View style={styles.noPermissionContainer}>
        <Ionicons name="shield-outline" size={64} color="#666666" />
        <Text style={styles.noPermissionText}>权限不足</Text>
        <Text style={styles.noPermissionSubText}>只有管理员可以创建频道</Text>
      </View>
    );
  }

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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>创建频道</Text>
          <Text style={styles.subtitle}>创建一个新的频道与用户分享内容</Text>
        </View>

        {/* 频道头像 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>频道头像</Text>
          <TouchableOpacity style={styles.avatarContainer} onPress={handleAvatarPicker}>
            {channelAvatar ? (
              <Image source={{ uri: channelAvatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.defaultAvatar]}>
                <Ionicons name="camera-outline" size={40} color="#CCCCCC" />
              </View>
            )}
            <View style={styles.avatarOverlay}>
              <Ionicons name="add-outline" size={20} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>点击选择频道头像</Text>
        </View>

        {/* 频道名称 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>频道名称 *</Text>
          <TextInput
            style={styles.input}
            value={channelName}
            onChangeText={setChannelName}
            placeholder="输入频道名称"
            placeholderTextColor="#999999"
            maxLength={20}
          />
          <Text style={styles.inputHint}>{channelName.length}/20</Text>
        </View>

        {/* 频道描述 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>频道描述 *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={channelDescription}
            onChangeText={setChannelDescription}
            placeholder="介绍一下你的频道，让用户了解频道的主题和内容"
            placeholderTextColor="#999999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={200}
          />
          <Text style={styles.inputHint}>{channelDescription.length}/200</Text>
        </View>

        {/* 频道分类 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>频道分类 *</Text>
          <View style={styles.categoryContainer}>
            {availableCategories.map(renderCategoryButton)}
          </View>
          <Text style={styles.inputHint}>
            在频道广场可以修改分类名称，创建后会实时更新
          </Text>
        </View>

        {/* 创建按钮 */}
        <TouchableOpacity
          style={[styles.createButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.createButtonText}>
            {loading ? '创建中...' : '创建频道'}
          </Text>
        </TouchableOpacity>

        {/* 提示信息 */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="information-circle-outline" size={16} color="#007AFF" />
            <Text style={styles.infoText}>
              创建后，你将成为频道的管理员，可以发布内容和管理频道
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark-outline" size={16} color="#34C759" />
            <Text style={styles.infoText}>
              只有管理员可以创建频道，普通用户只能订阅和查看
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="trash-outline" size={16} color="#FF3B30" />
            <Text style={styles.infoText}>
              创建后可以随时解散频道，但此操作不可恢复
            </Text>
          </View>
        </View>
      </ScrollView>
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
  noPermissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0C0C0C',
  },
  noPermissionText: {
    fontSize: 20,
    color: '#CCCCCC',
    marginTop: 15,
  },
  noPermissionSubText: {
    fontSize: 14,
    color: '#999999',
    marginTop: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  avatarContainer: {
    alignSelf: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  defaultAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarHint: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    color: '#FFFFFF',
  },
  textArea: {
    height: 80,
  },
  inputHint: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'right',
    marginTop: 5,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedCategoryButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  selectedCategoryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#666666',
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 15,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
});