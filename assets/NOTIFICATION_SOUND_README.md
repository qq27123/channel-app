# 强制提醒音效文件说明

## 文件要求

需要在 `assets` 目录下添加一个名为 `notification.mp3` 的音频文件。

### 文件位置
```
channel-app/
  └── assets/
      └── notification.mp3  （需要添加此文件）
```

### 音频要求

1. **格式**: MP3
2. **时长**: 建议 1-2 秒
3. **音量**: 适中，不要过大
4. **音调**: 清脆、明显的提示音

### 推荐音效

可以使用以下方式获取音效：

1. **免费音效网站**:
   - Freesound.org
   - Zapsplat.com
   - Notification Sounds (搜索 "notification sound mp3")

2. **录制自己的音效**:
   - 可以录制简单的"叮咚"声
   - 或使用其他清脆的提示音

3. **临时方案**:
   - 如果暂时没有音效文件，可以注释掉 NotificationContext.js 中的音效相关代码
   - 系统会使用默认的通知声音

### 如何添加

1. 下载或准备好音效文件
2. 将文件重命名为 `notification.mp3`
3. 放置到 `assets` 目录下
4. 重启 Expo 应用

### 代码引用位置

在 `src/context/NotificationContext.js` 中：

```javascript
const { sound: newSound } = await Audio.Sound.createAsync(
  require('../../assets/notification.mp3'), // 这里引用音效文件
  { shouldPlay: false }
);
```

## 注意事项

- 如果没有添加音效文件，应用启动时可能会报错
- 可以临时注释掉 `loadNotificationSound()` 相关代码以避免错误
- 强制提醒会退回到使用系统默认声音
