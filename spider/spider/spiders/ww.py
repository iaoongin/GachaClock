import scrapy
import requests

from spider.items import SpiderItem


class WwSpider(scrapy.Spider):
    name = "ww"
    allowed_domains = ["api.kurobbs.com"]
    custom_settings = {
        "ITEM_PIPELINES": {
            "spider.pipelines.SpiderPipeline": 300,
        },
    }
    headers = {
        'wiki_type': '9',
        'source': 'h5',
        'referer': 'https://wiki.kurobbs.com/'
    }

    def start_requests(self):
        url = 'https://api.kurobbs.com/wiki/core/homepage/getPage'
        yield scrapy.Request(url, headers=self.headers, method='POST', callback=self.parse)

    def parse(self, response):
        data = response.json()
        sideModules = self.safe_get(data, 'data', 'contentJson', 'sideModules', default=[])
        for sideModule in sideModules:
            content = sideModule['content']
            title = sideModule['title']
            
            if '唤取' not in title:
                continue
            
            tabs = content['tabs']
            for tab in tabs:
                
                g = []
                for img in tab['imgs']:
                    # title 
                    entryId = self.safe_get(img, 'linkConfig', 'entryId', default='')
                    title = self.get_title(entryId)
                    g.append({
                        'title': title,
                        'img': img['img']
                    })
                

                raw_timer = self.safe_get(tab, 'countDown', 'dateRange', default=[])
                timer= [raw_timer[0] + ':00', raw_timer[1]+":59"]
                item = SpiderItem()
                item["title"] = tab['name']
                item["type"] =  '角色' if '角色' in title else '武器'
                item["timer"] = timer
                item["gachas"] = g
                yield item
            
        pass

    def safe_get(self, data, *keys, default=None):
        current = data
        for key in keys:
            if isinstance(current, dict) and key in current:
                current = current[key]
            else:
                return default
        return current
    
    def get_title(self, data):
        url = f'https://api.kurobbs.com/wiki/core/catalogue/item/getEntryDetail'
        headers = {
            **self.headers,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        try:
            response = requests.post(url, headers=headers, data=f'id={data}')
            response.raise_for_status()  # 检查响应状态码，如果不是 200 会抛出异常
            json_data = response.json()
            name = self.safe_get(json_data, 'data', 'name', default='')
            return name
        except requests.RequestException as e:
            print(f"请求发生错误: {e}")
        except ValueError:
            print(f"无法解析响应的 JSON 数据，响应内容: {response.text}")
        except KeyError:
            print(f"响应中缺少所需的键，响应内容: {response.text}")
        return data