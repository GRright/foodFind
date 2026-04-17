from PIL import Image, ImageDraw, ImageFont
import os

# 创建images目录
os.makedirs('miniprogram/images', exist_ok=True)

# 图标颜色
ACTIVE_COLOR = (0, 122, 255, 255)  # #007AFF
INACTIVE_COLOR = (142, 142, 147, 255)  # #8E8E93

def create_icon(text, color, filename):
    # 创建81x81的图标（微信小程序推荐尺寸）
    img = Image.new('RGBA', (81, 81), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    # 尝试使用系统字体，如果没有则使用默认
    try:
        font = ImageFont.truetype("arial.ttf", 40)
    except:
        try:
            font = ImageFont.truetype("msyh.ttc", 40)
        except:
            font = ImageFont.load_default()
    
    # 计算文本位置使其居中
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (81 - text_width) // 2
    y = (81 - text_height) // 2 - bbox[1]
    
    draw.text((x, y), text, font=font, fill=color)
    
    # 保存图片
    img.save(f'miniprogram/images/{filename}')
    print(f'Created: miniprogram/images/{filename}')

# 创建首页图标
create_icon('首页', ACTIVE_COLOR, 'tab-home-active.png')
create_icon('首页', INACTIVE_COLOR, 'tab-home.png')

# 创建菜单图标
create_icon('菜单', ACTIVE_COLOR, 'tab-menu-active.png')
create_icon('菜单', INACTIVE_COLOR, 'tab-menu.png')

# 创建影视图标
create_icon('影视', ACTIVE_COLOR, 'tab-movies-active.png')
create_icon('影视', INACTIVE_COLOR, 'tab-movies.png')

# 创建我的图标
create_icon('我的', ACTIVE_COLOR, 'tab-profile-active.png')
create_icon('我的', INACTIVE_COLOR, 'tab-profile.png')

print('\nAll icons created successfully!')
