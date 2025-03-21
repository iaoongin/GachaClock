from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings
from spider.spiders.zzz import ZzzSpider
from spider.spiders.sr import SrSpider
from spider.spiders.ww import WwSpider

# 获取项目的配置
settings = get_project_settings()
# 创建 CrawlerProcess 实例并传入配置
process = CrawlerProcess(settings)
process.crawl(ZzzSpider)
process.crawl(SrSpider)
process.crawl(WwSpider)
process.start()