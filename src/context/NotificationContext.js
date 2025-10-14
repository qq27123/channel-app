import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform, Alert, Vibration } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Audio } from 'expo-av';

const NotificationContext = createContext({});

// 配置通知处理 - 微信强提醒样式
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // 检查是否是强制提醒
    const isForceAlert = notification.request.content.data?.isForceAlert;
    
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      // 强制提醒使用最高优先级
      priority: isForceAlert ? Notifications.AndroidNotificationPriority.MAX : Notifications.AndroidNotificationPriority.HIGH,
    };
  },
});

export const NotificationProvider = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [channelNotifications, setChannelNotifications] = useState(new Set());
  const [sound, setSound] = useState(null);
  const [vibrationInterval, setVibrationInterval] = useState(null);
  const [soundLoopInterval, setSoundLoopInterval] = useState(null);
  const [notificationListener, setNotificationListener] = useState(null);

  useEffect(() => {
    registerForPushNotificationsAsync();
    loadNotificationSound();
    setupNotificationListeners();
    
    return () => {
      // 清理资源
      if (sound) {
        sound.unloadAsync();
      }
      if (vibrationInterval) {
        clearInterval(vibrationInterval);
      }
      if (soundLoopInterval) {
        clearInterval(soundLoopInterval);
      }
      if (notificationListener) {
        notificationListener.remove();
      }
    };
  }, []);

  // 设置通知监听器 - 监听用户点击通知
  const setupNotificationListeners = () => {
    // 监听通知被点击
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const isForceAlert = response.notification.request.content.data?.isForceAlert;
      if (isForceAlert) {
        // 用户点击了强制提醒，停止震动和声音
        stopForceAlertEffects();
        console.log('用户查看了强制提醒，已停止震动和声音');
      }
    });
    setNotificationListener(subscription);
  };

  // 停止强制提醒的震动和声音
  const stopForceAlertEffects = () => {
    // 停止震动
    if (Platform.OS !== 'web') {
      Vibration.cancel();
    }
    if (vibrationInterval) {
      clearInterval(vibrationInterval);
      setVibrationInterval(null);
    }
    
    // 停止声音循环
    if (soundLoopInterval) {
      clearInterval(soundLoopInterval);
      setSoundLoopInterval(null);
    }
    
    // 停止当前正在播放的声音
    if (sound) {
      sound.stopAsync().catch(err => console.log('停止音效失败:', err));
    }
  };

  // 加载强提醒音效
  const loadNotificationSound = async () => {
    try {
      // 注意：需要在 assets 目录下添加 notification.mp3 文件
      // 如果文件不存在，会使用系统默认声音
      const { sound: newSound } = await Audio.Sound.createAsync(
        require('../../assets/notification.mp3'),
        { 
          shouldPlay: false,
          isLooping: false // 手动控制循环
        }
      );
      setSound(newSound);
      console.log('强提醒音效加载成功');
    } catch (error) {
      console.log('加载提醒音效失败（将使用系统默认声音）:', error.message);
      // 不设置 sound，后续会使用系统默认声音
    }
  };

  // 注册推送通知 - 微信强提醒风格
  const registerForPushNotificationsAsync = async () => {
    let token;

    if (Platform.OS === 'android') {
      // 为强制提醒创建专用通道
      await Notifications.setNotificationChannelAsync('force-alert-channel', {
        name: '频道强制提醒',
        importance: Notifications.AndroidImportance.MAX, // 最高优先级
        vibrationPattern: [0, 500, 200, 500, 200, 500], // 持续震动模式
        lightColor: '#FF0000',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
        enableLights: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC, // 锁屏可见
      });
      
      // 普通通知通道
      await Notifications.setNotificationChannelAsync('channel-updates', {
        name: '频道更新',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        if (Platform.OS === 'web') {
          alert('需要通知权限才能接收频道更新！');
        } else {
          Alert.alert('权限需求', '需要通知权限才能接收频道更新！');
        }
        setNotificationPermission(false);
        return;
      }
      
      setNotificationPermission(true);
      
      // 获取推送token (仅在真实设备上有效)
      try {
        token = (await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        })).data;
        setExpoPushToken(token);
      } catch (error) {
        console.log('获取推送token失败:', error);
      }
    } else {
      if (Platform.OS === 'web') {
        alert('推送通知在Web端受限，建议使用移动设备获得最佳体验');
      } else {
        Alert.alert('设备限制', '推送通知需要在真实设备上使用');
      }
    }
  };

  // 开启频道强制提醒
  const enableChannelNotification = async (channelId, channelName) => {
    if (!notificationPermission) {
      const message = '请先授予通知权限才能开启强制提醒功能';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('权限不足', message);
      }
      return { success: false, error: '权限不足' };
    }

    try {
      // 在Android上请求特殊权限
      if (Platform.OS === 'android') {
        const message = '强制提醒功能需要特殊权限，请在系统设置中允许此应用:\n1. 显示在其他应用的上层\n2. 修改系统设置\n3. 自启动权限';
        Alert.alert(
          '权限设置',
          message,
          [
            { text: '取消', style: 'cancel' },
            { 
              text: '去设置', 
              onPress: () => {
                // 这里可以引导用户到设置页面
                Alert.alert('提示', '请在系统设置中手动开启相关权限');
              }
            }
          ]
        );
      }

      const newChannelNotifications = new Set(channelNotifications);
      newChannelNotifications.add(channelId);
      setChannelNotifications(newChannelNotifications);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // 关闭频道强制提醒
  const disableChannelNotification = (channelId) => {
    const newChannelNotifications = new Set(channelNotifications);
    newChannelNotifications.delete(channelId);
    setChannelNotifications(newChannelNotifications);
    return { success: true };
  };

  // 发送频道更新通知 - 微信强提醒模式（持续震动和声音）
  const sendChannelNotification = async (channelId, channelName, content) => {
    if (!channelNotifications.has(channelId)) {
      return;
    }

    try {
      // 先停止之前的强制提醒效果
      stopForceAlertEffects();

      // 1. 开始持续震动（每2秒循环一次）
      if (Platform.OS !== 'web') {
        // 立即震动一次
        Vibration.vibrate([0, 500, 200, 500, 200, 500]);
        
        // 设置循环震动
        const vibInterval = setInterval(() => {
          Vibration.vibrate([0, 500, 200, 500, 200, 500]);
        }, 2000); // 每2秒震动一次
        
        setVibrationInterval(vibInterval);
      }

      // 2. 开始持续播放提醒音效（每3秒循环一次）
      if (sound && Platform.OS !== 'web') {
        try {
          // 立即播放一次
          await sound.replayAsync();
          
          // 设置循环播放
          const soundInterval = setInterval(async () => {
            try {
              await sound.replayAsync();
            } catch (error) {
              console.log('循环播放音效失败:', error);
            }
          }, 3000); // 每3秒播放一次
          
          setSoundLoopInterval(soundInterval);
        } catch (error) {
          console.log('播放音效失败:', error);
        }
      }

      // 3. 发送系统通知（横幅 + 锁屏显示）
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🔔 【强制提醒】${channelName}`,
          body: `📢 ${content}`,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: [0, 500, 200, 500, 200, 500],
          data: {
            isForceAlert: true,
            channelId,
            channelName,
          },
          // iOS 特殊设置
          badge: 1,
          categoryIdentifier: 'force-alert',
        },
        trigger: null, // 立即发送
        // Android 使用强制提醒通道
        ...(Platform.OS === 'android' && {
          channelId: 'force-alert-channel',
        }),
      });

      // 4. Web环境使用浏览器通知
      if (Platform.OS === 'web' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          const notification = new Notification(`🔔 【强制提醒】${channelName}`, {
            body: `📢 ${content}`,
            icon: '/assets/icon.png',
            requireInteraction: true, // 需要用户交互
            tag: 'force-alert',
            vibrate: [500, 200, 500, 200, 500],
          });
          
          // 用户点击后停止震动和声音
          notification.onclick = () => {
            stopForceAlertEffects();
            notification.close();
          };
        }
      }

      console.log(`强制提醒已发送（持续震动和声音，直到用户查看）: ${channelName} - ${content}`);
      
      // 设置最大持续时间（60秒后自动停止，防止无限循环）
      setTimeout(() => {
        stopForceAlertEffects();
        console.log('强制提醒已达到最大持续时间（60秒），已自动停止');
      }, 60000);
      
    } catch (error) {
      console.error('发送强制提醒失败:', error);
    }
  };

  // 检查频道是否开启了强制提醒
  const isChannelNotificationEnabled = (channelId) => {
    return channelNotifications.has(channelId);
  };

  // 发送本地通知（用于测试）
  const sendTestNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '测试通知',
          body: '这是一条测试通知',
          sound: 'default',
        },
        trigger: { seconds: 1 },
      });
    } catch (error) {
      console.error('发送测试通知失败:', error);
    }
  };

  const value = {
    expoPushToken,
    notificationPermission,
    channelNotifications,
    enableChannelNotification,
    disableChannelNotification,
    sendChannelNotification,
    isChannelNotificationEnabled,
    sendTestNotification,
    registerForPushNotificationsAsync,
    stopForceAlertEffects // 导出停止函数，以便手动调用
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};