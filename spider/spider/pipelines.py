# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html


# useful for handling different item types with a single interface
import os
from itemadapter import ItemAdapter
import json
import requests
import base64
from datetime import datetime

base_dir = "data"
ext = "json"

class SpiderPipeline:
    
    def open_spider(self, spider):
        # 爬虫启动时初始化数据列表和打开文件
        self.items = []
        try:
            # 获取当前日期
            current_date = datetime.now().strftime("%Y%m%d")
            # 生成文件名
            file_name = f"{base_dir}/{current_date}/{spider.name}.{ext}"
            print(f"目标文件路径： {file_name}")
            
            # 获取文件所在的目录
            directory = os.path.dirname(file_name)
            # 检查目录是否存在，如果不存在则创建
            if not os.path.exists(directory):
                os.makedirs(directory)
            self.file = open(file_name, 'w', encoding='utf-8')
        except Exception as e:
            print(f"Failed to open file: {e}")
    
    def process_item(self, item, spider):
        print(f'==================> {item}')
        # 处理图片为base64
        for gacha in item['gachas']:
            gacha['img_base64'] = self.download_image_to_base64(gacha['img'])
        # 爬虫处理数据时将数据添加到列表
        self.items.append(item)
        return item
    def close_spider(self, spider):
        # 爬虫结束时将数据写入文件并关闭文件
        if hasattr(self, 'file'):
            try:
                # 将 SpiderItem 转换为字典
                serialized_items = [dict(item) for item in self.items]
                self.file.write(json.dumps(serialized_items, ensure_ascii=False, indent=4))
            except Exception as e:
                print(f"Failed to write to file: {e}")
            finally:
                self.file.close()
                
    def download_image_to_base64(self, url):
        try:
            # 发送 HTTP 请求下载图片
            response = requests.get(url)
            # 检查请求是否成功
            response.raise_for_status()
            # 获取图片的二进制内容
            image_content = response.content
            # 将图片内容转换为 Base64 编码
            base64_encoded = base64.b64encode(image_content).decode('utf-8')
            return base64_encoded
        except requests.RequestException as e:
            print(f"请求出错: {e}")
        except Exception as e:
            print(f"发生其他错误: {e}")
        return None