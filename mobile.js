
var configs = {
  userAgent: UserAgent.Mobile,
  domains: ["weibo.cn"],
  scanUrls: ["https://m.weibo.cn/api/container/getIndex?containerid=100103type%3D1%26q%3D妆容"],
  contentUrlRegexes: [/https:\/\/m\.weibo\.cn\/api\/container\/getIndex\?containerid=100103type%3D1%26q%3D妆容&page=([0-9])+/],
  // helperUrlRegexes: ['https:\/\/m\.weibo\.cn\/api\/container\/getIndex\?containerid=100103type%3D1%26q%3D妆容'],
  fields: [
    {
      name: "total",
      selector: "$.cardlistInfo.total",
      selectorType : SelectorType.JsonPath
    },
    {
      name: "cards",
      selector: "$.cards[0].card_group",
      selectorType : SelectorType.JsonPath,
      repeated : true,
      children : [
        {
          name: "mblog_id",
          alias: '微博id',
          selector: "$.mblog.id",
          selectorType : SelectorType.JsonPath,
          // primaryKey : true
        },
        {
          name: "mblog_text",
          alias: '微博内容',
          selector: "$.mblog.text",
          selectorType : SelectorType.JsonPath
        },
        {
          name: "isLongText",
          alias: '微博是否长文本',
          selector: "$.mblog.isLongText",
          selectorType : SelectorType.JsonPath
        },
        {
          name: "user_id",
          selector: "$.mblog.user.id",
          selectorType : SelectorType.JsonPath
        },
        {
          name: "screen_name",
          selector: "$.mblog.user.screen_name",
          selectorType : SelectorType.JsonPath
        },
        {
          name: "gender",
          selector: "$.mblog.user.gender",
          selectorType : SelectorType.JsonPath
        },
        {
          name: "statuses_count",
          selector: "$.mblog.user.statuses_count",
          selectorType : SelectorType.JsonPath
        },
        {
          name: "follow_count",
          alias: '关注数',
          selector: "$.mblog.user.follow_count",
          selectorType : SelectorType.JsonPath
        },
        {
          name: "followers_count",
          alias: '粉丝数',
          selector: "$.mblog.user.followers_count",
          selectorType : SelectorType.JsonPath
        }
      ]
    }
  ],
  onProcessScanPage: function(page, content, site) {
    return false;
  },
  onProcessHelperPage: function(page, content, site) {
    // 没有设置列表页，也不需要发现链接
    return false;
  },
  onProcessContentPage: function(page, content, site) {
    return false;
  },
  afterExtractPage: function (page, data, site) {
    console.log(page, data);
    return data;
  },
  afterExtractField: function(fieldName, data, page, site) {
    return data;
  },
  isAntiSpider : function (url, content, page) {
    switch (page.response.statusCode) {
      case 418:
        console.log(page.raw);
        return true;
      default:
        return false;
    }
  }
};

var crawler = new Crawler(configs);
crawler.start();
