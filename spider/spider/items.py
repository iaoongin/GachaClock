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