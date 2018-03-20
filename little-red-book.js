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
var pageIndex = 65; // 正式爬取时从1开始，测试阶段使用较大数字

var urlPrefix = "http://www.xiaohongshu.com/web_api/sns/v2/search/note?keyword=";
var urlWithKeyword = getUrlWithKeywordIndex(keywordIndex, pageIndex);

function getUrlWithKeywordIndex(keywordIndex, pageIndex) {
  return urlPrefix + encodeURIComponent(keywords[keywordIndex]) + "&page=" + pageIndex;
}

function getEncodedKeyword() {
  return encodeURIComponent(keywords[keywordIndex]);
}

var configs = {
  userAgent: UserAgent.Mobile,
  domains: ["www.xiaohongshu.com"],
  // scanUrls: ["http://www.xiaohongshu.com/web_api/sns/v2/search/note?keyword=%E9%80%9A%E5%8B%A4%E5%A6%86&page=66"],
  scanUrls: [urlWithKeyword],
  contentUrlRegexes: [/http:\/\/www\.xiaohongshu\.com\/web_api\/sns\/v2\/search\/note\?keyword=(.*)+&page=(\d){1,2}/],
  helperUrlRegexes: [],
  // entriesFirst: true,
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
              selectorType: SelectorType.JsonPath,
            },
            {
              name: "avatar",
              alias: '用户头像',
              selector: "$.image",
              selectorType: SelectorType.JsonPath,
            },
            {
              name: "verified",
              alias: '官方认证用户',
              selector: "$.official_verified",
              selectorType: SelectorType.JsonPath,
            },
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
    if (data.data && data.data.length < 1) {
      // 已完成该页面爬取
      console.log('done with current keyword');
      if (++keywordIndex < numKeyWords) {
        // 爬取下一个关键词
        var newUrl = getUrlWithKeywordIndex(keywordIndex, pageIndex);
        site.addUrl(newUrl);
      } else {
        // 已完成所有关键词的爬取
        return false;
      }
    } else if (data.data) {
      // 继续爬取当前关键词的下一页结果
      console.log('continue to crawl next page');
      var url = page.url;
      var pageNumber = url.replace(/.*&page=(\d)/, '$1');
      site.addUrl("http://www.xiaohongshu.com/web_api/sns/v2/search/note?keyword=" + getEncodedKeyword() + "&page=" + ++pageNumber);
    }
    
    return false;
  },
  afterExtractPage: function (page, data, site) {
    // console.log(data);
    return data;
  },
  afterExtractField: function (fieldName, data, page, site) {
    return data;
  },
};

var crawler = new Crawler(configs);
crawler.start();
