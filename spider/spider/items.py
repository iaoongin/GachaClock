# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy
from typing import TypedDict

# banner--> gacha
class SpiderItem(scrapy.Item):
    # define the fields for your item here like:
    # name = scrapy.Field()
    title = scrapy.Field()
    gachas = scrapy.Field()
    timer = scrapy.Field()
    type = scrapy.Field()
    pass

class GachaItem(TypedDict):
    title: str
    img: str
    img_path: str
    
class HistoryItem(scrapy.Item):
    title = scrapy.Field()
    type = scrapy.Field()
    img = scrapy.Field()
    img_path = scrapy.Field()
    version = scrapy.Field()
    timer = scrapy.Field()
    s = scrapy.Field()
    a = scrapy.Field()
    pass

class RoleItem(scrapy.Item):
    title = scrapy.Field()
    simple_img = scrapy.Field()
    promotion_img = scrapy.Field()
    chara_rarity = scrapy.Field()
    chara_type = scrapy.Field()
    chara_element = scrapy.Field()
    chara_load_version = scrapy.Field()
    chara_size = scrapy.Field()
    
    pass