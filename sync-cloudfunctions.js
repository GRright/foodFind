/**
 * sync-cloudfunctions.js
 * 
 * 用途：将源码级云函数 (cloudfunctions/) 自动复制到编译输出目录 (dist/build/mp-weixin/cloudfunctions/)
 * 
 * 使用方式：
 *   1. 手动运行：node sync-cloudfunctions.js
 *   2. 编译后自动运行（package.json postbuild 钩子）
 */

const fs = require('fs')
const path = require('path')

const SOURCE_DIR = path.join(__dirname, 'cloudfunctions')
const TARGET_DIR = path.join(__dirname, 'dist', 'build', 'mp-weixin', 'cloudfunctions')

function fixProjectConfig() {
  const configPath = path.join(__dirname, 'dist', 'build', 'mp-weixin', 'project.config.json')
  const privateConfigPath = path.join(__dirname, 'dist', 'build', 'mp-weixin', 'project.private.config.json')

  if (fs.existsSync(configPath)) {
    try {
      const raw = fs.readFileSync(configPath, 'utf-8')
      const cfg = JSON.parse(raw)
      let changed = false
      if (cfg.cloudfunctionRoot) { delete cfg.cloudfunctionRoot; changed = true }
      if (!cfg.setting) { cfg.setting = {} }
      if (cfg.setting.bigPackageSizeSupport !== true) { cfg.setting.bigPackageSizeSupport = true; changed = true }
      if (changed) { fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2), 'utf-8'); console.log('  ✅ project.config.json 已更新') }
    } catch(e) { console.log('  ⚠️  project.config.json 修复失败:', e.message) }
  }

  if (fs.existsSync(privateConfigPath)) {
    try {
      const raw = fs.readFileSync(privateConfigPath, 'utf-8')
      const cfg = JSON.parse(raw)
      if (!cfg.setting) { cfg.setting = {} }
      if (cfg.setting.ignoreDevUnusedFiles !== false) { 
        cfg.setting.ignoreDevUnusedFiles = false
        cfg.setting.bigPackageSizeSupport = true
        fs.writeFileSync(privateConfigPath, JSON.stringify(cfg, null, 2), 'utf-8')
        console.log('  ✅ project.private.config.json 已更新 (ignoreDevUnusedFiles=false)')
      }
    } catch(e) { console.log('  ⚠️  project.private.config.json 修复失败:', e.message) }
  }
}

function sync() {
  console.log('')
  console.log('🔄 同步云函数到编译输出目录...')
  console.log(`   源码: ${SOURCE_DIR}`)
  console.log(`   目标: ${TARGET_DIR}`)
  console.log('')

  if (!fs.existsSync(SOURCE_DIR)) {
    console.log('❌ 源码目录不存在:', SOURCE_DIR)
    process.exit(1)
  }

  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true })
    console.log('✅ 创建目标目录')
  }

  const functions = fs.readdirSync(SOURCE_DIR).filter(f => 
    fs.statSync(path.join(SOURCE_DIR, f)).isDirectory()
  )

  let successCount = 0
  let failCount = 0

  for (const funcName of functions) {
    const srcPath = path.join(SOURCE_DIR, funcName)
    const tgtPath = path.join(TARGET_DIR, funcName)

    try {
      if (!fs.existsSync(tgtPath)) {
        fs.mkdirSync(tgtPath, { recursive: true })
      }

      const files = ['index.js', 'package.json']
      
      for (const file of files) {
        const srcFile = path.join(srcPath, file)
        const tgtFile = path.join(tgtPath, file)

        if (fs.existsSync(srcFile)) {
          fs.copyFileSync(srcFile, tgtFile)
        } else {
          console.log(`  ⚠️  ${funcName}/${file} 不存在，跳过`)
        }
      }

      successCount++
      console.log(`  ✅ ${funcName}`)
    } catch (err) {
      failCount++
      console.log(`  ❌ ${funcName}: ${err.message}`)
    }
  }

  console.log('')
  console.log(`📊 云函数同步完成: ${successCount} 成功, ${failCount} 失败`)

  fixProjectConfig()

  if (failCount > 0) {
    process.exit(1)
  }

  return { success: successCount, failed: failCount }
}

if (require.main === module) {
  sync()
}

module.exports = sync
