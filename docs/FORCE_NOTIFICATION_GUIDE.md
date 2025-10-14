# 微信式强制提醒功能实现文档

## 功能概述

本应用的强制提醒功能完全对标微信强提醒，实现了以下核心特性：

## ✅ 已实现的功能

### 1. **持续震动提醒**
- 震动模式：`[0, 500, 200, 500, 200, 500]` (共1.5秒)
- 即使手机静音也会震动
- 模拟微信的震动节奏

### 2. **横幅通知**
- 使用最高优先级通知 (`AndroidNotificationPriority.MAX`)
- 在屏幕顶部显示醒目通知
- 标题带有 🔔【强制提醒】标识

### 3. **声音提醒**
- 支持自定义提醒音效
- 回退到系统默认声音（如无自定义音效）
- 确保声音播放

### 4. **锁屏显示**
- Android: 设置 `lockscreenVisibility` 为 `PUBLIC`
- 锁屏状态下完整显示通知内容

### 5. **专用通知通道**
- Android 创建专门的 `force-alert-channel`
- 与普通通知区分开来
- 最高优先级设置

### 6. **仅对开启用户生效**
- 通过 `channelNotifications` Set 管理
- 只有开启强提醒的用户才收到
- 状态持久化管理

### 7. **Web 端支持**
- 浏览器原生通知
- 10秒后自动关闭
- 震动API支持（部分浏览器）

## 🎯 核心实现

### NotificationContext.js 关键代码

```javascript
// 1. 专用通知通道（Android）
await Notifications.setNotificationChannelAsync('force-alert-channel', {
  name: '频道强制提醒',
  importance: Notifications.AndroidImportance.MAX,
  vibrationPattern: [0, 500, 200, 500, 200, 500],
  enableLights: true,
  lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
});

// 2. 发送强制提醒
const sendChannelNotification = async (channelId, channelName, content) => {
  // 震动
  Vibration.vibrate([0, 500, 200, 500, 200, 500]);
  
  // 播放音效
  await sound.replayAsync();
  
  // 发送系统通知
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `🔔 【强制提醒】${channelName}`,
      body: `📢 ${content}`,
      priority: Notifications.AndroidNotificationPriority.MAX,
      data: { isForceAlert: true },
    },
    trigger: null,
  });
};
```

## 📋 使用方法

### 1. 开启强制提醒

```javascript
const { enableChannelNotification } = useNotification();

// 用户点击"开启强制提醒"按钮
await enableChannelNotification(channelId, channelName);
```

### 2. 发送强制提醒

```javascript
const { sendChannelNotification } = useNotification();

// 频道主发布内容时
await sendChannelNotification(channelId, channelName, '发布了新内容');
```

### 3. 关闭强制提醒

```javascript
const { disableChannelNotification } = useNotification();

disableChannelNotification(channelId);
```

## 🔧 配置说明

### Android 特殊权限

强制提醒在 Android 上需要以下权限：

1. **通知权限** - 基础权限
2. **显示在其他应用上层** - 全屏提醒
3. **修改系统设置** - 音量控制
4. **自启动权限** - 后台接收

代码会引导用户到系统设置开启这些权限。

### iOS 配置

iOS 需要在 `app.json` 中配置：

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      }
    },
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#FF0000",
      "androidMode": "default",
      "androidCollapsedTitle": "强制提醒"
    }
  }
}
```

### Web 配置

Web 端需要用户授权通知权限：

```javascript
if ('Notification' in window) {
  await Notification.requestPermission();
}
```

## 🎨 UI 集成

### ChannelDetailScreen.js

强制提醒按钮已集成在频道详情页：

```javascript
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
  <Text>{hasNotification ? '强制提醒已开启' : '开启强制提醒'}</Text>
</TouchableOpacity>
```

## 🎵 音效文件

需要在 `assets` 目录下添加 `notification.mp3` 文件。

详见：`assets/NOTIFICATION_SOUND_README.md`

## 🧪 测试方法

### 1. 使用 Expo Go 测试

```bash
cd channel-app
npx expo start
```

在手机上扫描二维码，测试强制提醒功能。

### 2. 测试步骤

1. 用户A创建频道并发布内容
2. 用户B订阅频道
3. 用户B开启"强制提醒"
4. 用户A发布新内容
5. 用户B应该收到：
   - 持续震动（1.5秒）
   - 横幅通知
   - 声音提醒
   - 锁屏显示

### 3. 调试日志

查看控制台输出：
- `强提醒音效加载成功`
- `强制提醒已发送: [频道名] - [内容]`

## 🔍 与微信强提醒的对比

| 功能特性 | 微信强提醒 | 本应用 | 状态 |
|---------|----------|--------|------|
| 持续震动 | ✅ | ✅ | 完全一致 |
| 横幅通知 | ✅ | ✅ | 完全一致 |
| 声音提醒 | ✅ | ✅ | 完全一致 |
| 锁屏显示 | ✅ | ✅ | 完全一致 |
| 最高优先级 | ✅ | ✅ | 完全一致 |
| APP内弹窗 | ✅ | ⚠️ | 可选实现 |
| 仅对开启用户 | ✅ | ✅ | 完全一致 |
| 特殊标识 | ✅ | ✅ | 🔔【强制提醒】 |

## 📝 注意事项

1. **权限管理**：首次使用需要用户授权通知权限
2. **电池优化**：某些手机可能限制后台通知，需要用户手动设置
3. **音效文件**：如未添加，会使用系统默认声音
4. **测试环境**：建议使用真机测试，模拟器效果可能受限

## 🚀 下一步优化

可选的增强功能：

1. **APP内弹窗**：当APP在前台时显示自定义弹窗
2. **通知历史**：记录所有强制提醒历史
3. **免打扰时段**：允许用户设置免打扰时间
4. **通知群组**：支持多个频道的提醒管理

## 💡 常见问题

### Q: 为什么收不到震动？
A: 检查手机是否开启了静音/震动模式，某些手机需要在系统设置中允许应用震动。

### Q: 为什么没有声音？
A: 检查是否添加了 `notification.mp3` 文件，或查看系统音量设置。

### Q: 锁屏为什么看不到？
A: Android 需要在通知设置中允许"锁屏显示"。

### Q: Web端不震动？
A: 部分浏览器不支持震动API，建议使用Chrome或Firefox。
