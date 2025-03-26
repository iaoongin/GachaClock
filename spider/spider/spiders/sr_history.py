import scrapy

from spider.items import HistoryItem


class SrHistorySpider(scrapy.Spider):
    name = "sr/history"
    custom_settings = {
        "ITEM_PIPELINES": {
            "spider.pipelines.HistoryPipeline": 300,
        },
    }
    allowed_domains = ["wiki.biligame.com"]
    start_urls = ["https://wiki.biligame.com/sr/%E5%8E%86%E5%8F%B2%E8%B7%83%E8%BF%81"]

    def parse(self, response):
        row_list = response.xpath('//*[@id="mw-content-text"]/div/div')

        # 每个版本
        for row in row_list:
            # 每个卡池
            tb_list = row.xpath(".//tbody")
            for tb in tb_list:
                tr_list = tb.xpath(".//tr")
                # 每行数据
                img = tr_list[0].xpath(".//img/@srcset").extract_first().strip()
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
