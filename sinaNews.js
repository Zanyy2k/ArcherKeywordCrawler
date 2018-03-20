var configs = {
  domains: ["news.sina.com.cn"],// 网站域名，设置域名后只会处理这些域名下的网页
  scanUrls: ["http://news.sina.com.cn/"],// 入口页url，分别从这些网页开始爬取。爬虫默认会自动发现并爬取新网页
  contentUrlRegexes: [
    /http:\/\/news\.sina\.com\.cn\/([a-z]+\/){1,2}[0-9]{4}-[0-9]{2}-[0-9]{2}\/doc-[a-z0-9]+\.shtml/
  ],// 内容页url的正则，符合这些正则的页面会被当作内容页处理
  helperUrlRegexes: [
    /http:\/\/news\.sina\.com\.cn/
  ],// 列表页url的正则，符合这些正则的页面会被当作列表页处理
  enableJS: true,  // 开启JS渲染
  fields: [
    {
      name: "newsID",
      selector: "//meta[contains(@name, 'publishid')]/attribute::content",
      required: true,
      primaryKey: true
    },
    {
      name: "title",
      selector: "//h1[contains(@class,'main-title')]",
      required: true
    },
    {
      name: "publish_time",
      selector: "//span[contains(@class,'date')]",
      required: true,
      type: 'timestamp'
    },
    {
      name: "source",
      selector: "//a[contains(@class,'source')]"
    },
    {
      name: "comment_count",
      selector: "//span[contains(@node-type,'comment-num')]",
      type: 'int'
    },
    {
      name: "keywords",
      selector: "//div[contains(@class,'keywords')]/a",
      repeated: true
    },
    {
      name: "content",
      selector: "//div[contains(@id,'article')]/p/text()",
      repeated: true
    }
  ]
};

/*
  回调函数afterExtractField：对抽取出来的数据进行处理
*/
configs.afterExtractField = function (fieldName, data, page, site) {
  if (fieldName === "content") {
    // 合并<p>标签中的文本内容
    return [data.join('')];
  }
  return data;
};

var crawler = new Crawler(configs);
crawler.start();
