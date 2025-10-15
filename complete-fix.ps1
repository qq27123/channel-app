# 完整修复Gradle插件问题的脚本
Write-Host "开始修复Gradle插件问题..." -ForegroundColor Green

# 修复主gradle-plugin文件
$mainPluginFile = "node_modules\@react-native\gradle-plugin\build.gradle.kts"
if (Test-Path $mainPluginFile) {
    $mainContent = @"
/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// 已移除导致问题的插件引用
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
    $mainContent | Out-File -FilePath $mainPluginFile -Encoding UTF8
    Write-Host "已修复主插件文件" -ForegroundColor Green
}

# 修复settings-plugin文件
$settingsPluginFile = "node_modules\@react-native\gradle-plugin\settings-plugin\build.gradle.kts"
if (Test-Path $settingsPluginFile) {
    $settingsContent = @"
/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import org.gradle.api.tasks.testing.logging.TestExceptionFormat
import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.kotlin.gradle.dsl.KotlinVersion
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
  // 已移除导致问题的插件引用
  // alias(libs.plugins.kotlin.jvm)
  id("java-gradle-plugin")
  id("org.jetbrains.kotlin.jvm") version "1.8.0"
}

repositories {
  google()
  mavenCentral()
}

gradlePlugin {
  plugins {
    create("react.settings") {
      id = "com.facebook.react.settings"
      implementationClass = "com.facebook.react.ReactSettingsPlugin"
    }
  }
}

group = "com.facebook.react"

dependencies {
  implementation(project(":shared"))

  implementation(gradleApi())
  // 已移除导致问题的依赖引用
  // implementation(libs.gson)
  // implementation(libs.guava)
  // implementation(libs.javapoet)

  // testImplementation(libs.junit)
  // testImplementation(libs.assertj)
  testImplementation(project(":shared-testutil"))
}

// We intentionally don't build for Java 17 as users will see a cryptic bytecode version
// error first. Instead we produce a Java 11-compatible Gradle Plugin, so that AGP can print their
// nice message showing that JDK 11 (or 17) is required first
java { targetCompatibility = JavaVersion.VERSION_11 }

kotlin { jvmToolchain(17) }

tasks.withType<KotlinCompile>().configureEach {
  compilerOptions {
    apiVersion.set(KotlinVersion.KOTLIN_1_8)
    // See comment above on JDK 11 support
    jvmTarget.set(JvmTarget.JVM_11)
    allWarningsAsErrors.set(
        project.properties["enableWarningsAsErrors"]?.toString()?.toBoolean() ?: false)
  }
}

tasks.withType<Test>().configureEach {
  testLogging {
    exceptionFormat = TestExceptionFormat.FULL
    showExceptions = true
    showCauses = true
    showStackTraces = true
  }
}
"@
    $settingsContent | Out-File -FilePath $settingsPluginFile -Encoding UTF8
    Write-Host "已修复settings插件文件" -ForegroundColor Green
}

Write-Host "所有修复完成!" -ForegroundColor Green