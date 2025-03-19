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

data_dir = "data"
img_dir = "img"
meta_file_name = "meta"
ext = "json"

class SpiderPipeline:
    
    def open_spider(self, spider):
        # 爬虫启动时初始化数据列表和打开文件
        self.items = []
    
    def process_item(self, item, spider):
        print(f'==================> {item}')
        # 处理图片为base64
        for gacha in item['gachas']:
            file_name = f"{img_dir}/{spider.name}/{gacha['title']}.png"
            self.download_file(gacha['img'], file_name)
            gacha['img_path'] = file_name
        # 爬虫处理数据时将数据添加到列表
        self.items.append(item)
        return item

    def close_spider(self, spider):
        
        try:
            timer = self.items[0]['timer']
            format_timer = self.convert_to_filename_format(timer)
            # 生成文件名
            file_name = f"{data_dir}/{spider.name}/{format_timer}.{ext}"
            print(f"目标文件路径： {file_name}")
            
            # 获取文件所在的目录
            directory = os.path.dirname(file_name)
            # 检查目录是否存在，如果不存在则创建
            if not os.path.exists(directory):
                os.makedirs(directory)
            self.file = open(file_name, 'w', encoding='utf-8')
        except Exception as e:
            print(f"Failed to open file: {e}")

        # 爬虫结束时将数据写入文件并关闭文件
        if hasattr(self, 'file'):
            try:
                # 将 SpiderItem 转换为字典
                serialized_items = [dict(item) for item in self.items]
                self.file.write(json.dumps(serialized_items, ensure_ascii=False, indent=4))

                # 记录最新数据
                file_name = f"{data_dir}/{meta_file_name}.{ext}"
                self.update_or_create_meta_key(file_name, spider.name, self.file.name)
            except Exception as e:
                print(f"Failed to write to file: {e}")
            finally:
                self.file.close()
        
                
    def download_file(self, url, save_path):
        """
        从指定 URL 下载文件到指定路径，如果文件已存在则跳过
        :param url: 文件的下载链接
        :param save_path: 文件保存的路径，包含文件名
        :return: 如果下载成功返回 True，文件已存在返回 None，出现错误返回 False
        """
        if os.path.exists(save_path):
            print(f"文件 {save_path} 已存在，跳过下载。")
            return None
        try:
            response = requests.get(url, stream=True)
            response.raise_for_status()

            save_dir = os.path.dirname(save_path)
            if not os.path.exists(save_dir):
                os.makedirs(save_dir)

            with open(save_path, 'wb') as file:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        file.write(chunk)

            print(f"文件下载成功，保存路径: {save_path}")
            return True
        except requests.RequestException as e:
            print(f"下载过程中出现网络错误: {e}")
        except Exception as e:
            print(f"下载过程中出现其他错误: {e}")
        return False

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

    def convert_to_filename_format(self, datetime_list):
        result = []
        for datetime_str in datetime_list:
            # 替换 / 和 : 为 -
            filename_str = datetime_str.replace("/", "").replace(":", "").replace("-", "")
            # 去除空格
            filename_str = filename_str.replace(" ", "")
            result.append(filename_str)
        return '_'.join(result)

    def update_or_create_meta_key(self, file_path: str, target_key: str, new_value: any) -> None:
        try:
            with open(file_path, 'r+', encoding='utf-8') as f:
                data = json.load(f)
                data[target_key] = new_value
                f.seek(0)  # 移动指针到文件开头
                json.dump(data, f, indent=2, ensure_ascii=False)
                f.truncate()  # 清除旧内容可能残留的部分
            print(f"已设置 {target_key} = {new_value}")
        except FileNotFoundError:
            # 如果文件不存在，直接创建新文件
            with open(file_path, 'w') as f:
                json.dump({target_key: new_value}, f, indent=2)
            print(f"创建新文件并设置 {target_key} = {new_value}")
