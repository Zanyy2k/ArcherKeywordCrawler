var keywords = [
  '妆容',
  '通勤妆',
  '烟熏妆',
  '桃花妆',
  '眉形',
  '分手妆',
  '卧蚕妆',
  '眼妆',
  '唇妆',
  '南瓜色妆',
  '豆沙色妆'
];

var numKeyWords = keywords.length;
var keywordIndex = 0;
var pageIndex = 66; // 正式爬取时从1开始，测试阶段使用较大数字

var urlPrefix = "http://www.xiaohongshu.com/web_api/sns/v2/search/note?keyword=";
var urlWithKeyword = getUrlWithKeywordIndex(keywordIndex, pageIndex);

function getUrlWithKeywordIndex(keywordIndex, pageIndex) {
  return urlPrefix + encodeURIComponent(keywords[keywordIndex]) + "&page=" + pageIndex;
}

var configs = {
  userAgent: UserAgent.Mobile,
  domains: ["www.xiaohongshu.com"],
  scanUrls: [urlWithKeyword],
  contentUrlRegexes: [/http:\/\/www\.xiaohongshu\.com\/web_api\/sns\/v2\/search\/note\?keyword=(.*)+&page=(\d){1,2}/],
  helperUrlRegexes: [],
  fields: [
    {
      name: "data",
      selector: "$.data",
      selectorType: SelectorType.JsonPath,
      repeated: true,
      children: [
        {
          name: "id",
          alias: '内容id',
          selector: "$.id",
          selectorType: SelectorType.JsonPath,
          primaryKey: true
        },
        {
          name: "title",
          alias: '标题',
          selector: "$.title",
          selectorType: SelectorType.JsonPath
        },
        {
          name: "text",
          alias: '内容',
          selector: "$.desc",
          selectorType: SelectorType.JsonPath
        },
        {
          name: "type",
          alias: '内容类型',
          selector: "$.type",
          selectorType: SelectorType.JsonPath
        },
        {
          name: "likes",
          alias: '点赞数',
          selector: "$.likes",
          type: 'int',
          selectorType: SelectorType.JsonPath
        },
        {
          name: "collects",
          alias: '商品数',
          selector: "$.collects",
          type: 'int',
          selectorType: SelectorType.JsonPath
        },
        {
          name: "cover",
          alias: '封面图',
          selector: "$.cover.url",
          type: 'image',
          selectorType: SelectorType.JsonPath
        },
        {
          name: "user",
          alias: '用户',
          selector: "$.user",
          selectorType: SelectorType.JsonPath,
          children: [
            {
              name: "userid",
              alias: '用户id',
              selector: "$.id",
              selectorType: SelectorType.JsonPath,
              primaryKey: true
            },
            {
              name: "nickname",
              alias: '用户昵称',
              selector: "$.nickname",
              selectorType: SelectorType.JsonPath
            },
            {
              name: "avatar",
              alias: '用户头像',
              selector: "$.image",
              selectorType: SelectorType.JsonPath
            },
            {
              name: "verified",
              alias: '官方认证用户',
              selector: "$.official_verified",
              type: 'bool',
              selectorType: SelectorType.JsonPath
            }
          ]
        }
      ]
    }
  ],
  onProcessScanPage: function (page, content, site) {
    return false;
  },
  onProcessHelperPage: function (page, data, site) {
    return false;
  },
  onProcessContentPage: function (page, content, site) {
    var data = JSON.parse(content);
    if (data.data.length < 1) {
      // 已完成该页面爬取
      var currentKeyword = page.url.replace(/.*keyword=(.*)&page=.*/, '$1');
      console.log('done with keyword: ' + decodeURIComponent(currentKeyword));
      if (++keywordIndex < numKeyWords) {
        // 爬取下一个关键词
        var newUrl = getUrlWithKeywordIndex(keywordIndex, pageIndex);
        site.addUrl(newUrl);
      } else {
        // 已完成所有关键词的爬取
        console.log('done with all keywords');
        return false;
      }
    } else {
      // 继续爬取当前关键词的下一页结果
      console.log('continue to crawl next page');
      var url = page.url;
      var pageNumber = url.replace(/.*&page=(\d)/, '$1');
      pageNumber++;
      var nextUrl = url.replace(/(.*)&page=.*/, '$1&page=' + pageNumber);
      site.addUrl(nextUrl);
    }
    
    return false;
  },
  afterExtractPage: function (page, data, site) {
    // console.log(data);
    return data;
  },
  afterExtractField: function (fieldName, data, page, site) {
    return data;
  }
};

var crawler = new Crawler(configs);
crawler.start();
