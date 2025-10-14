# 临时解决方案 - 音效文件缺失

如果您暂时没有 `notification.mp3` 文件，可以使用以下方案：

## 方案1：注释音效加载（推荐用于快速测试）

在 `src/context/NotificationContext.js` 中，将 `loadNotificationSound()` 调用注释掉：

```javascript
useEffect(() => {
  registerForPushNotificationsAsync();
  // loadNotificationSound(); // 临时注释掉
  
  return () => {
    if (sound) {
      sound.unloadAsync();
    }
  };
}, []);
```

这样应用会使用系统默认通知声音，仍然能够实现强制提醒的其他功能（震动、横幅通知等）。

## 方案2：创建简单的占位文件

1. 从网上下载任意短促的MP3音效（1-2秒）
2. 重命名为 `notification.mp3`
3. 放到 `assets` 目录下

推荐下载地址：
- https://freesound.org （搜索 "notification"）
- https://www.zapsplat.com （免费音效库）

## 方案3：录制自己的音效

使用手机录音软件：
1. 录制一段简短的"叮"声或其他提示音
2. 转换为MP3格式
3. 命名为 `notification.mp3`
4. 放到 `assets` 目录

## 当前状态

即使没有音效文件，强制提醒的其他功能仍然正常工作：
- ✅ 震动提醒
- ✅ 横幅通知
- ✅ 锁屏显示
- ✅ 系统默认声音（回退方案）
