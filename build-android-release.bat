@echo off
setlocal

echo ========================================
echo  Android应用发布版本构建脚本
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

echo [3/5] 构建Android发布版APK...
cd android
call gradlew.bat assembleRelease
if errorlevel 1 (
    echo 错误: 构建失败
    cd ..
    pause
    exit /b 1
)
cd ..
echo 构建完成!
echo.

echo ========================================
echo  发布版本构建完成！
echo ========================================
echo.
echo APK文件路径: android\app\build\outputs\apk\release\app-release-unsigned.apk
echo. 
echo 请使用jarsigner和zipalign工具对APK进行签名
echo. 
echo 签名步骤参考:
echo 1. 创建密钥库: keytool -genkeypair -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
echo 2. 签名APK: jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore android\app\build\outputs\apk\release\app-release-unsigned.apk my-key-alias
echo 3. 优化APK: zipalign -v 4 android\app\build\outputs\apk\release\app-release-unsigned.apk channel-app-release.apk
echo. 
pause
endlocal