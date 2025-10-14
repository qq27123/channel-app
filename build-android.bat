@echo off
echo ========================================
echo  Android应用自动构建脚本
echo ========================================
echo.

cd /d D:\wenjianjia2\channel-app

echo [1/5] 清理旧的构建文件...
if exist android rmdir /s /q android
if exist .expo rmdir /s /q .expo
echo 清理完成!
echo.

echo [2/5] 生成Android原生项目...
echo Y | npx expo prebuild --platform android --clean
if errorlevel 1 (
    echo 错误: prebuild失败
    pause
    exit /b 1
)
echo prebuild完成!
echo.

echo [3/5] 构建Android APK...
cd android
call gradlew.bat assembleDebug
if errorlevel 1 (
    echo 错误: 构建失败
    cd ..
    pause
    exit /b 1
)
cd ..
echo 构建完成!
echo.

echo [4/5] 检查模拟器连接...
adb devices
echo.

echo [5/5] 安装APK到模拟器...
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
if errorlevel 1 (
    echo 错误: 安装失败
    pause
    exit /b 1
)

echo.
echo ========================================
echo  构建和安装完成！
echo ========================================
echo.
echo 应用已安装到Android模拟器
echo 可以在模拟器中启动应用了
echo.
pause