import scrapy

from spider.items import SpiderItem


class WwSpider(scrapy.Spider):
    name = "ww"
    allowed_domains = ["api.kurobbs.com"]

    def start_requests(self):
        url = 'https://api.kurobbs.com/wiki/core/homepage/getPage'
        headers = {
            'wiki_type': '9',
            'source': 'h5',
            'referer': 'https://wiki.kurobbs.com/'
        }
        
        yield scrapy.Request(url, headers=headers, method='POST', callback=self.parse)

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
                    g.append({
                        'title': self.safe_get(img, 'linkConfig', 'entryId', default=''),
                        'img': img['img']
                    })
                    
                item = SpiderItem()
                item["title"] = tab['name']
                item["type"] =  '角色' if '角色' in title else '武器'
                item["timer"] = self.safe_get(tab, 'countDown', 'dataRange', default=[])
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