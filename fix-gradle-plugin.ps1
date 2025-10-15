# 修复Gradle插件问题的脚本
Write-Host "修复Gradle插件问题..." -ForegroundColor Green

# 备份原始文件
$pluginFile = "node_modules\@react-native\gradle-plugin\build.gradle.kts"
$backupFile = "node_modules\@react-native\gradle-plugin\build.gradle.kts.backup"

if (Test-Path $pluginFile) {
    if (-not (Test-Path $backupFile)) {
        Copy-Item -Path $pluginFile -Destination $backupFile
        Write-Host "已备份原始文件到: $backupFile" -ForegroundColor Yellow
    }
    
    # 创建修复后的文件内容
    $fixedContent = @"
/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// 修复libs引用问题
// plugins { alias(libs.plugins.kotlin.jvm).apply(false) }

tasks.register("build") {
  dependsOn(
      ":react-native-gradle-plugin:build",
      ":settings-plugin:build",
      ":shared-testutil:build",
      ":shared:build",
  )
}

tasks.register("clean") {
  dependsOn(
      ":react-native-gradle-plugin:clean",
      ":settings-plugin:clean",
      ":shared-testutil:clean",
      ":shared:clean",
  )
}
"@
    
    # 写入修复后的内容
    $fixedContent | Out-File -FilePath $pluginFile -Encoding UTF8
    Write-Host "已修复Gradle插件文件" -ForegroundColor Green
} else {
    Write-Host "未找到Gradle插件文件: $pluginFile" -ForegroundColor Red
}

Write-Host "修复完成!" -ForegroundColor Green