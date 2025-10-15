# GitHub Actions APK构建设置指南

## 设置步骤

### 1. 创建Expo访问令牌
1. 登录到你的Expo账户
2. 访问 https://expo.dev/settings/access-tokens
3. 点击 "Create access token"
4. 选择适当的权限（至少需要构建权限）
5. 复制生成的令牌

### 2. 在GitHub仓库中添加密钥
1. 在你的GitHub仓库中，进入 Settings
2. 点击 "Secrets and variables" → "Actions"
3. 点击 "New repository secret"
4. 添加以下密钥：
   - Name: `EXPO_TOKEN`
   - Value: 你刚刚创建的Expo访问令牌

### 3. 推送代码到GitHub
将你的代码推送到GitHub仓库：
```bash
git add .
git commit -m "Add GitHub Actions workflow for APK build"
git push origin main
```

## 工作流说明

### 触发条件
- 推送到 `main` 或 `master` 分支
- 创建Pull Request到 `main` 或 `master` 分支
- 手动触发（通过GitHub界面）

### 构建步骤
1. 检出代码
2. 设置Node.js环境
3. 安装依赖
4. 设置Expo CLI
5. 登录到Expo账户
6. 预构建Android项目
7. 使用EAS构建APK
8. 下载构建产物
9. 上传APK作为GitHub Artifacts

## 下载APK

构建完成后，你可以在以下位置下载APK：

1. **GitHub Actions Artifacts**:
   - 进入Actions标签页
   - 选择对应的workflow运行
   - 在Artifacts部分下载APK

2. **Expo网站**:
   - 登录到Expo控制台
   - 进入你的项目
   - 查看构建历史并下载APK

## 故障排除

### 常见问题

1. **权限错误**:
   - 确保Expo令牌具有正确的权限
   - 检查仓库是否有正确的访问权限

2. **构建失败**:
   - 检查Firebase配置文件路径
   - 确保所有环境变量已正确设置

3. **下载失败**:
   - 确保EAS配置正确
   - 检查网络连接

### 环境变量

如果需要设置环境变量，请在GitHub Secrets中添加：
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- 等其他Firebase配置

然后在工作流中引用它们：
```yaml
env:
  FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
  FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
```