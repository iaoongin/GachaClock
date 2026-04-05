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
        row_list = response.xpath('//*[@id="mw-content-text"]/div/div[@class="row"]')

        # 每个版本
        for row in row_list:
            # 每个卡池
            tb_list = row.xpath(".//tbody")
            for tb in tb_list:
                try:
                    tr_list = tb.xpath(".//tr")
                    # 每行数据，兼容两种结构：tr[0] 可能包含 img（旧版banner图）或只有 th 纯文本（新版）
                    img_srcset = tr_list[0].xpath(".//img/@srcset").extract_first()
                    img_alt = tr_list[0].xpath(".//img/@alt").extract_first()
                    th_text = tr_list[0].xpath(".//th/text()").extract_first()

                    if img_srcset:
                        img = img_srcset.strip().split(' ', 1)[0]
                        title = img_alt.strip() if img_alt else ''
                    else:
                        img = ''
                        title = th_text.strip() if th_text else ''
                    timer = tr_list[1].xpath(".//td/text()").extract_first().strip()
                    version = tr_list[2].xpath(".//td/text()").extract_first().strip()
                    s = tr_list[3].xpath(".//td/a/@title").extract_first().strip()
                    a = tr_list[4].xpath(".//td/a/@title").extract()

                    item = HistoryItem()
                    
                    item["img"] = img
                    item["title"] = title
                    item["type"] =  '角色' if '角色' in title else '武器'
                    item["version"] = version
                    item["timer"] = timer
                    item["s"] = s
                    item["a"] = sorted(set(a))
                    yield item
                except Exception as e:
                    print('error: 解析异常: ' + str(e))
                    pass
