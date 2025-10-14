import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Linking,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePrivacy } from '../context/PrivacyContext';

const PrivacyModal = () => {
  const { showPrivacyModal, acceptPrivacy, hidePrivacyModal, hasAcceptedPrivacy } = usePrivacy();
  const [isAccepting, setIsAccepting] = useState(false);

  // 获取屏幕尺寸
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
  // 计算弹窗高度（根据屏幕高度动态调整）
  const getModalHeight = () => {
    if (screenHeight < 700) {
      // 小屏设备（如iPhone SE）：使用更多空间
      return screenHeight * 0.92;
    } else if (screenHeight < 900) {
      // 中等屏幕设备：90%高度
      return screenHeight * 0.90;
    } else {
      // 大屏设备：85%高度，但不超过800px
      return Math.min(screenHeight * 0.85, 800);
    }
  };

  // 计算弹窗宽度
  const getModalWidth = () => {
    if (screenWidth < 400) {
      return screenWidth * 0.95; // 小屏：95%宽度
    } else {
      return Math.min(screenWidth * 0.90, 500); // 其他：90%宽度，最大500px
    }
  };

  const handleAccept = async () => {
    setIsAccepting(true);
    const result = await acceptPrivacy();
    setIsAccepting(false);
    
    if (result.success) {
      console.log('隐私协议已同意');
    } else {
      Alert.alert('错误', '保存同意状态失败，请重试');
    }
  };

  const handleDecline = () => {
    Alert.alert(
      '提示',
      '您需要同意隐私政策和用户协议才能使用本应用',
      [{ text: '我知道了' }]
    );
  };

  const handleLinkPress = (url) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('错误', '无法打开链接');
    });
  };

  return (
    <Modal
      visible={showPrivacyModal}
      transparent={true}
      animationType="fade"
      onRequestClose={hidePrivacyModal}
    >
      <View style={styles.overlay}>
        <View style={[
          styles.container,
          {
            width: getModalWidth(),
            height: getModalHeight(),
          }
        ]}>
          {/* 标题栏 */}
          <View style={styles.header}>
            <Ionicons name="shield-checkmark" size={28} color="#4A90E2" />
            <Text style={styles.title}>隐私政策与用户协议</Text>
            {hasAcceptedPrivacy && (
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={hidePrivacyModal}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          {/* 内容区域 */}
          <ScrollView 
            style={styles.contentContainer}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.welcomeText}>
              欢迎使用频道应用！
            </Text>
            
            <Text style={styles.introText}>
              在使用本应用前，请您仔细阅读并同意以下条款：
            </Text>

            {/* 隐私政策内容 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. 信息收集与使用</Text>
              <Text style={styles.sectionText}>
                • 我们会收集您注册时提供的手机号、昵称等基本信息{'\n'}
                • 您发布的频道、消息等内容将存储在本地设备{'\n'}
                • 我们不会将您的个人信息分享给第三方{'\n'}
                • 头像和图片等媒体文件仅用于应用内展示
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. 数据安全</Text>
              <Text style={styles.sectionText}>
                • 您的密码将经过加密存储{'\n'}
                • 所有数据仅存储在本地设备，不会上传到云端{'\n'}
                • 我们采用行业标准的安全措施保护您的信息{'\n'}
                • 您可以随时在个人中心删除账户和相关数据
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. 权限说明</Text>
              <Text style={styles.sectionText}>
                • 相机权限：用于拍照上传头像和图片消息{'\n'}
                • 相册权限：用于选择照片作为头像和发送图片消息{'\n'}
                • 通知权限：用于接收新消息和订阅审核通知{'\n'}
                • 存储权限：用于保存应用数据和媒体文件
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. 用户行为规范</Text>
              <Text style={styles.sectionText}>
                • 请勿发布违法违规、暴力色情等不良内容{'\n'}
                • 请尊重他人，不进行人身攻击和骚扰{'\n'}
                • 请勿恶意刷屏或发送垃圾信息{'\n'}
                • 违反规范可能导致账户被限制或封禁
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. 服务变更</Text>
              <Text style={styles.sectionText}>
                • 我们保留随时修改或中断服务的权利{'\n'}
                • 重要变更将通过应用内通知告知您{'\n'}
                • 继续使用即表示接受变更后的条款
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6. 免责声明</Text>
              <Text style={styles.sectionText}>
                • 本应用按"现状"提供，不提供任何明示或暗示的担保{'\n'}
                • 对于用户发布的内容，我们不承担审核责任{'\n'}
                • 因不可抗力导致的服务中断，我们不承担责任
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>7. 联系我们</Text>
              <Text style={styles.sectionText}>
                如有任何问题或建议，请联系我们：{'\n'}
                邮箱：taowang2020@163.com
              </Text>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                最后更新时间：2025年10月13日
              </Text>
              <Text style={styles.footerText}>
                版本：v1.0.0
              </Text>
            </View>
          </ScrollView>

          {/* 底部按钮 */}
          {!hasAcceptedPrivacy && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.declineButton}
                onPress={handleDecline}
              >
                <Text style={styles.declineButtonText}>不同意</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.acceptButton, isAccepting && styles.acceptButtonDisabled]}
                onPress={handleAccept}
                disabled={isAccepting}
              >
                <Text style={styles.acceptButtonText}>
                  {isAccepting ? '处理中...' : '同意并继续'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#1C1C1C',
    borderRadius: 16,
    // width 和 height 现在由 inline style 控制
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 18,
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  scrollContent: {
    paddingBottom: 20, // 底部额外间距，保证内容不被按钮遮挡
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  introText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 20,
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 22,
  },
  footer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666666',
    alignItems: 'center',
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999999',
  },
  acceptButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
  },
  acceptButtonDisabled: {
    backgroundColor: '#2A5A8A',
    opacity: 0.6,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default PrivacyModal;
