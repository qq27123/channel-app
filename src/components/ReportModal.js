import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useReport, REPORT_REASONS, REPORT_REASON_TEXTS, REPORT_TYPES } from '../context/ReportContext';
import { useAuth } from '../context/AuthContext';

const ReportModal = () => {
  const { 
    showReportModal, 
    reportTarget, 
    closeReportModal, 
    submitReport, 
    loading,
    hasUserReported 
  } = useReport();
  const { user } = useAuth();
  
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 重置表单
  const resetForm = () => {
    setSelectedReason('');
    setDescription('');
    setIsSubmitting(false);
  };

  // 处理弹窗关闭
  const handleClose = () => {
    resetForm();
    closeReportModal();
  };

  // 获取举报目标描述
  const getTargetDescription = () => {
    if (!reportTarget) return '';
    
    switch (reportTarget.type) {
      case REPORT_TYPES.MESSAGE:
        return `消息: "${reportTarget.data.content?.substring(0, 50) || ''}..."`;
      case REPORT_TYPES.CHANNEL:
        return `频道: "${reportTarget.data.name || '未知频道'}"`;
      case REPORT_TYPES.USER:
        return `用户: "${reportTarget.data.nickname || '未知用户'}"`;
      default:
        return '未知内容';
    }
  };

  // 提交举报
  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('提示', '请选择举报原因');
      return;
    }

    if (!user || !user.id) {
      Alert.alert('错误', '请先登录');
      return;
    }

    // 检查是否已举报过
    if (hasUserReported(user.id, reportTarget.type, reportTarget.id)) {
      Alert.alert('提示', '您已举报过此内容');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitReport(user.id, selectedReason, description);
      
      if (result.success) {
        resetForm();
        // submitReport 内部已经显示成功提示和关闭弹窗
      } else {
        Alert.alert('提交失败', result.error || '请重试');
      }
    } catch (error) {
      console.error('提交举报失败:', error);
      Alert.alert('提交失败', '网络错误，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!reportTarget) {
    return null;
  }

  return (
    <Modal
      visible={showReportModal}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 标题栏 */}
          <View style={styles.header}>
            <Ionicons name="flag" size={24} color="#FF3B30" />
            <Text style={styles.title}>举报内容</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleClose}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* 举报目标信息 */}
            <View style={styles.targetInfo}>
              <Text style={styles.targetLabel}>举报目标：</Text>
              <Text style={styles.targetText}>{getTargetDescription()}</Text>
            </View>

            {/* 举报原因选择 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>请选择举报原因：</Text>
              
              {Object.entries(REPORT_REASON_TEXTS).map(([key, text]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.reasonItem,
                    selectedReason === key && styles.reasonItemSelected
                  ]}
                  onPress={() => setSelectedReason(key)}
                >
                  <View style={styles.reasonItemLeft}>
                    <Ionicons 
                      name={selectedReason === key ? "radio-button-on" : "radio-button-off"}
                      size={20}
                      color={selectedReason === key ? "#FF3B30" : "#666"}
                    />
                    <Text style={[
                      styles.reasonText,
                      selectedReason === key && styles.reasonTextSelected
                    ]}>
                      {text}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* 详细描述 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>详细描述（可选）：</Text>
              <TextInput
                style={styles.descriptionInput}
                placeholder="请描述具体的违规行为..."
                placeholderTextColor="#999"
                value={description}
                onChangeText={setDescription}
                multiline={true}
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{description.length}/500</Text>
            </View>

            {/* 举报说明 */}
            <View style={styles.notice}>
              <Ionicons name="information-circle" size={16} color="#4A90E2" />
              <Text style={styles.noticeText}>
                我们会认真审核每一份举报，并根据社区规范进行处理。恶意举报可能导致账户受限。
              </Text>
            </View>
          </ScrollView>

          {/* 底部按钮 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.submitButton,
                (!selectedReason || isSubmitting) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!selectedReason || isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? '提交中...' : '提交举报'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1C1C1C',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    minHeight: '60%',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 12,
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  targetInfo: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  targetLabel: {
    fontSize: 12,
    color: '#FF3B30',
    marginBottom: 4,
  },
  targetText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  reasonItemSelected: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderColor: 'rgba(255, 59, 48, 0.5)',
  },
  reasonItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reasonText: {
    fontSize: 15,
    color: '#CCCCCC',
    marginLeft: 12,
  },
  reasonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  descriptionInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.3)',
  },
  noticeText: {
    fontSize: 13,
    color: '#CCCCCC',
    lineHeight: 18,
    marginLeft: 8,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666666',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999999',
  },
  submitButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#8B1A1A',
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default ReportModal;