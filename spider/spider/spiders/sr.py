import scrapy

from spider.items import SpiderItem


class SrSpider(scrapy.Spider):
    name = "sr"
    allowed_domains = ["wiki.biligame.com"]
    start_urls = ["https://wiki.biligame.com/sr/%E9%A6%96%E9%A1%B5"]
    custom_settings = {
        "ITEM_PIPELINES": {
            "spider.pipelines.SpiderPipeline": 300,
        },
    }

    def parse(self, response):
        raw_gacha_list = response.xpath(
            '//*[@id="mw-content-text"]/div/div[2]/div[3]/div[1]/div/div'
        )

        for gacha in raw_gacha_list:
            # banner_title
            banner_title = gacha.xpath("./a//b/text()").extract_first()
            if (
                banner_title == None
                or "跃迁" not in banner_title
                # 排除一些特殊的卡池
                or "圣剑辉烈之誓" in banner_title
                or "此身剑所天成" in banner_title
                or "王的诞生" in banner_title
                or "冬木赤影" in banner_title
            ):
                continue

            # gacha
            g = []
            g_title = gacha.xpath("./p//img/@alt").extract()
            g_img = gacha.xpath("./p//img/@src").extract()
            for i in range(len(g_title)):
                g.append({"title": g_title[i], "img": g_img[i].replace("56", "112")})

            # time
            eventTimer = [
                gacha.xpath("./div/span/@data-start").extract_first() + ":00",
                gacha.xpath("./div/span/@data-end").extract_first() + ":59",
            ]

            item = SpiderItem()
            item["title"] = banner_title
            item["type"] = "角色" if "角色" in banner_title else "武器"
            item["timer"] = eventTimer
            item["gachas"] = g
            yield item
        pass
