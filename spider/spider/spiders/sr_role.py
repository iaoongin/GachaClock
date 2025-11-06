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
            
            # 角色元素
            # chara_element = card.xpath('.//img[@class="chara-element"]/@alt').extract()
            # chara_type = card.xpath('.//img[@class="chara-type"]/@alt').extract()
            # chara_rarity = card.xpath('.//img[@class="chara-rarity"]/@alt').extract()
            chara_rarity = card.xpath('./@data-param1').extract()[0]
            chara_type = card.xpath('./@data-param2').extract()[0]
            chara_element = card.xpath('./@data-param3').extract()[0]
            chara_load_version = card.xpath('./@data-param4').extract()[0]
            chara_size = card.xpath('./@data-param5').extract()[0]
            
            tqdm.write(f"当前角色：{title}")
            # print(href)
            
            # 递归进去
            yield scrapy.Request(url='https://wiki.biligame.com/'+ href, callback=self.parse_card_detail, meta={
                'title': title,'simple_img': simple_img,
                'chara_rarity': chara_rarity,
                'chara_type': chara_type,
                'chara_element': chara_element,
                'chara_load_version': chara_load_version,
                'chara_size': chara_size,
            })
        pass
    
    def parse_card_detail(self, response):
        meta = response.meta
        title = meta['title']
        simple_img = meta['simple_img']
        chara_rarity = meta['chara_rarity']
        chara_type = meta['chara_type']
        chara_element = meta['chara_element']
        chara_load_version = meta['chara_load_version']
        chara_size = meta['chara_size']
        
        # 立绘 list
        img_list = response.xpath('//*[@id="mw-content-text"]//div[@class="resp-tabs-container"]/div[@class="resp-tab-content"]/a/img[@src]/@src').extract()
        # print(img_list)
        item = RoleItem()
        item['title'] = title
        item['simple_img'] = simple_img
        item['promotion_img'] = img_list
        item['chara_rarity'] = chara_rarity
        item['chara_type'] = chara_type
        item['chara_element'] = chara_element
        item['chara_load_version'] = chara_load_version
        item['chara_size'] = chara_size
        yield item
