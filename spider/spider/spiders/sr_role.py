import scrapy
from tqdm import tqdm


from spider.items import RoleItem


class SrRoleSpider(scrapy.Spider):
    name = "sr/role"
    allowed_domains = ["wiki.biligame.com"]
    start_urls = ["https://wiki.biligame.com/sr/%E8%A7%92%E8%89%B2%E5%9B%BE%E9%89%B4"]
    custom_settings = {
        "ITEM_PIPELINES": {
            "spider.pipelines.RolePipeline": 300,
        },
    }
    def parse(self, response):
        raw_card_list = response.xpath('//*[@id="CardSelectTr"]/div')

        for card in tqdm(raw_card_list):
            # 简单图片
            simple_img = card.xpath('.//img/@src').extract()[1]
            href = card.xpath('.//a/@href').extract()[0]
            title = card.xpath('.//a/@title').extract()[0]
            
            tqdm.write(f"当前角色：{title}")
            # print(href)
            
            # 递归进去
            yield scrapy.Request(url='https://wiki.biligame.com/'+ href, callback=self.parse_card_detail, meta={'title': title,'simple_img': simple_img})
        pass
    
    def parse_card_detail(self, response):
        meta = response.meta
        title = meta['title']
        simple_img = meta['simple_img']

        # 立绘 list
        img_list = response.xpath('//*[@id="mw-content-text"]//div[@class="resp-tabs-container"]/div[@class="resp-tab-content"]/a/img[@src]/@src').extract()
        # print(img_list)
        item = RoleItem()
        item['title'] = title
        item['simple_img'] = simple_img
        item['promotion_img'] = img_list
        yield item
