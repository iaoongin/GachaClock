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
        row_list = response.xpath('//*[@id="mw-content-text"]/div/h3[contains(., "第")]/following-sibling::table[following-sibling::h3 or not(following-sibling::*)]')
        
        # 每个版本
        for row in row_list:
            # 每个卡池
            for tb in row.xpath(".//table"):
                yield from self._parse_table(tb)

    def _parse_table(self, tb):
        try:
            tr_list = tb.xpath(".//tr")

            img = tr_list[0].xpath(".//img/@srcset").extract_first()
            title = tr_list[0].xpath(".//img/@alt").extract_first()
            if not img or not title:
                return

            timer = tr_list[1].xpath("normalize-space(.//td/text())").get()
            version = tr_list[2].xpath("normalize-space(.//td/text())").get()
            s_list = tr_list[3].xpath(".//td/a/@title").extract() if len(tr_list) > 3 else []
            a = tr_list[4].xpath(".//td/a/@title").extract() if len(tr_list) > 4 else []

            if not all([timer, version]) or not s_list:
                return

            a = sorted(set(a))

            for s in s_list:
                yield self._build_item(
                    img=img,
                    title=title,
                    version=version,
                    timer=timer,
                    s=s,
                    a=a,
                )
        except Exception:
            return

    def _build_item(self, img, title, version, timer, s, a):
        item = HistoryItem()
        item["img"] = img.strip().split(" ", 1)[0]
        item["title"] = title.strip()
        item["type"] = "角色" if "独家" in title else "武器"
        item["version"] = version
        item["timer"] = timer
        item["s"] = s
        item["a"] = sorted(set(a))
        return item
