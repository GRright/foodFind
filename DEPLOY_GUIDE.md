# 云函数批量部署指南

## 首次使用 - 登录授权

### 方式一：扫码登录（推荐）
```bash
cloudbase login
```
运行后会弹出二维码，用微信扫码登录即可。

### 方式二：API Key 登录
1. 访问 https://console.cloud.tencent.com/cam/capi
2. 获取 SecretId 和 SecretKey
3. 运行：
```bash
cloudbase login --apiKeyId <你的SecretId> --apiKeyKey <你的SecretKey>
```

## 部署云函数

### 批量部署（推荐）
```bash
# PowerShell 版本
.\deploy-functions.ps1

# 或 CMD 版本
deploy-functions.bat
```

### 单个部署
```bash
cloudbase functions:deploy saveFoodDiary --force
```

### 查看所有云函数
```bash
cloudbase functions:list
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `cloudbase login` | 登录 |
| `cloudbase functions:list` | 列出所有云函数 |
| `cloudbase functions:deploy <函数名>` | 部署单个函数 |
| `cloudbase functions:delete <函数名>` | 删除函数 |
| `cloudbase --help` | 查看帮助 |

## 注意事项
- 首次部署需要登录授权
- 确保 cloudbaserc.json 中的 envId 正确
- 云函数目录必须包含 node_modules
