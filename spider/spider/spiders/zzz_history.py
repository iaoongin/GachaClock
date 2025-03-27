import scrapy

from spider.items import HistoryItem


class ZzzHistorySpider(scrapy.Spider):
    name = "zzz/history"
    custom_settings = {
        "ITEM_PIPELINES": {
            "spider.pipelines.HistoryPipeline": 300,
        },
    }
    allowed_domains = ["wiki.biligame.com"]
    start_urls = ["https://wiki.biligame.com/zzz/%E8%B0%83%E9%A2%91"]

    def parse(self, response):
        row_list = response.xpath('//*[@id="mw-content-text"]/div/h3[contains(., "第")]/following-sibling::table[following-sibling::h3]')
        # row_list = response.xpath('//*[@id="mw-content-text"]/div/table[@class="wikitable"]')

        # 每个版本
        for row in row_list:
            # 每个卡池
            tb_list = row.xpath('.//table')
            for tb in tb_list:
                tr_list = tb.xpath(".//tr")
                
                try:
                    img = tr_list[0].xpath(".//img/@srcset").extract_first().strip()
                except:
                    continue
                title = tr_list[0].xpath(".//img/@alt").extract_first().strip()
                timer = tr_list[1].xpath(".//td/text()").extract_first().strip()
                version = tr_list[2].xpath(".//td/text()").extract_first().strip()
                s = tr_list[3].xpath(".//td/a/@title").extract_first().strip()
                a = tr_list[4].xpath(".//td/a/@title").extract()

                item = HistoryItem()
                item["img"] = img.split(' ', 1)[0]
                item["title"] = title
                item["version"] = version
                item["timer"] = timer
                item["s"] = s
                item["a"] = sorted(set(a))
                yield item
