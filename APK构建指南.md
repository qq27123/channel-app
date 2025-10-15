# APK构建指南

## 1. 登录Expo账户

由于交互式输入限制，你需要手动执行以下步骤：

1. 打开终端并导航到项目目录：
   ```
   cd d:\wenjianjia2\channel-app
   ```

2. 运行登录命令：
   ```
   eas login
   ```

3. 当提示输入"Email or username"时，输入你的新用户名：
   ```
   qq27123
   ```

4. 按照提示完成登录过程（可能需要输入密码或通过其他验证方式）

## 2. 验证登录状态

登录后，验证账户是否正确：
```
eas whoami
```

你应该看到输出显示"qq27123"或其他与新账户相关的信息。

## 3. 构建APK

登录成功后，运行以下命令构建APK：
```
eas build -p android --profile preview --non-interactive
```

## 4. 监控构建过程

构建过程可能需要15-30分钟。你可以使用以下命令查看构建状态：
```
eas build:list
```

## 5. 下载APK

构建完成后，你可以通过Expo网站下载APK，或者使用以下命令：
```
eas build:download
```

## 故障排除

如果遇到问题，请尝试以下解决方案：

1. 确保所有依赖包已安装：
   ```
   npm install
   ```

2. 如果构建失败，查看详细日志：
   ```
   eas build:logs
   ```

3. 清理缓存并重试：
   ```
   npx expo prebuild --clean
   ```

## 注意事项

- 构建过程需要稳定的网络连接
- 首次构建可能需要较长时间
- 确保你的Expo账户有足够的构建配额