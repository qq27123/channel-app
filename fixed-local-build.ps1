# 修复后的本地构建APK脚本
Write-Host "开始修复后的本地构建APK..." -ForegroundColor Green

# 设置路径
Set-Location -Path "D:\wenjianjia2\channel-app"

Write-Host "1. 清理项目..." -ForegroundColor Yellow
# 删除问题目录
if (Test-Path "android") {
    Remove-Item -Path "android" -Recurse -Force -ErrorAction SilentlyContinue
}

# 清理npm缓存
npm cache clean --force

Write-Host "2. 重新安装依赖..." -ForegroundColor Yellow
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
npm install

Write-Host "3. 生成Android原生项目..." -ForegroundColor Yellow
$env:EXPO_NO_GIT_STATUS = "1"
npx expo prebuild --platform android --clean

Write-Host "4. 配置环境变量..." -ForegroundColor Yellow
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-11.0.25.9-hotspot"
$env:ANDROID_HOME = "E:\development\Android\sdk"

Write-Host "5. 修复Gradle配置..." -ForegroundColor Yellow
# 修复可能存在的Gradle配置问题
$gradleFiles = Get-ChildItem -Path "node_modules\@react-native\gradle-plugin" -Recurse -Filter "*.kts" -ErrorAction SilentlyContinue
foreach ($file in $gradleFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match 'alias\(libs\.plugins\.kotlin\.jvm\)') {
        Write-Host "  - 修复文件: $($file.Name)" -ForegroundColor Gray
        $content = $content -replace 'alias\(libs\.plugins\.kotlin\.jvm\)', 'id("org.jetbrains.kotlin.jvm") version "1.8.0"'
        $content | Out-File -FilePath $file.FullName -Encoding UTF8
    }
}

Write-Host "6. 构建APK..." -ForegroundColor Yellow
Write-Host "这可能需要几分钟时间，请耐心等待..." -ForegroundColor Cyan

# 进入Android目录并构建
Set-Location -Path "android"
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-11.0.25.9-hotspot"

# 使用gradlew构建APK
try {
    .\gradlew.bat assembleRelease --warning-mode all
    Write-Host "✓ APK构建完成" -ForegroundColor Green
} catch {
    Write-Host "✗ APK构建失败，尝试使用不同的方法..." -ForegroundColor Yellow
    # 尝试另一种构建方法
    .\gradlew.bat assembleRelease --stacktrace
}

Set-Location -Path ".."

Write-Host "7. 查找APK..." -ForegroundColor Yellow
$apkPath = "android\app\build\outputs\apk\release\app-release-unsigned.apk"
if (Test-Path $apkPath) {
    Write-Host "✓ APK构建成功!" -ForegroundColor Green
    Write-Host "位置: $((Resolve-Path $apkPath).Path)" -ForegroundColor Cyan
} else {
    Write-Host "✗ 未找到APK文件，检查debug版本..." -ForegroundColor Yellow
    $debugApkPath = "android\app\build\outputs\apk\debug\app-debug.apk"
    if (Test-Path $debugApkPath) {
        Write-Host "✓ 找到Debug APK!" -ForegroundColor Green
        Write-Host "位置: $((Resolve-Path $debugApkPath).Path)" -ForegroundColor Cyan
    } else {
        Write-Host "✗ 也未找到Debug APK文件" -ForegroundColor Red
    }
}

Write-Host "本地构建过程完成!" -ForegroundColor Green