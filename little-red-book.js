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
var pageIndex = 1; // 正式爬取时从1开始，测试阶段使用较大数字

var keywordUrlPrefix = "http://www.xiaohongshu.com/web_api/sns/v2/search/note?keyword=";
var itemUrlPrefix = "http://www.xiaohongshu.com/discovery/item/";
var goodsUrlPrefix = "https://pages.xiaohongshu.com/goods/";

var searchRegex = /http:\/\/www\.xiaohongshu\.com\/web_api\/sns\/v2\/search\/note\?keyword=(.*)+&page=(\d){1,2}/;
var itemRegex = /http:\/\/www\.xiaohongshu\.com\/discovery\/item\/.*/;
var goodsRegex = /http:\/\/pages\.xiaohongshu\.com\/goods\/.*/;


var urlWithKeyword = getUrlWithKeywordIndex(keywordIndex, pageIndex);

function getUrlWithKeywordIndex(keywordIndex, pageIndex) {
  return keywordUrlPrefix + encodeURIComponent(keywords[keywordIndex]) + "&page=" + pageIndex;
}

var configs = {
  userAgent: UserAgent.Mobile,
  domains: ["www.xiaohongshu.com"],
  timeout: 10 * 1000,
  scanUrls: [urlWithKeyword],
  // enableJS: true,
  contentUrlRegexes: [searchRegex, itemRegex, goodsRegex],
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
          alias: '笔记id',
          selector: "$.id",
          selectorType: SelectorType.JsonPath,
          primaryKey: true,
        },
        {
          name: "state",
          alias: '笔记state',
          sourceType: SourceType.AttachedUrl,
          attachedUrl: itemUrlPrefix + '{id}',
          selectorType: SelectorType.XPath,
          type: 'json',
          selector: "//body//script[contains(., '__INITIAL_SSR_STATE__')]"
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
        /*{
          name: "type",
          alias: '内容类型',
          selector: "$.type",
          selectorType: SelectorType.JsonPath
        },*/
        {
          name: "likes",
          alias: '点赞数',
          selector: "$.likes",
          type: 'int',
          selectorType: SelectorType.JsonPath
        },
        /*{
          name: "cover",
          alias: '封面图',
          selector: "$.cover.url",
          type: 'image',
          selectorType: SelectorType.JsonPath
        },*/
        /*{
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
              alias: '认证用户',
              selector: "$.official_verified",
              type: 'bool',
              selectorType: SelectorType.JsonPath
            }
          ]
        },*/
      
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
    var url = page.url;
    if (searchRegex.test(url)) {
      console.log('matched: ' + url);
      var data = JSON.parse(content);
      if (data.data.length < 1) {
        // 已完成该页面爬取
        var currentKeyword = url.replace(/.*keyword=(.*)&page=.*/, '$1');
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
        // console.log('continue to crawl next page');
        var pageNumber = url.replace(/.*&page=(\d)/, '$1');
        pageNumber++;
        var nextUrl = url.replace(/(.*)&page=.*/, '$1&page=' + pageNumber);
        site.addUrl(nextUrl);
      }
    }
    return false;
  },
  afterExtractPage: function (page, data, site) {
    // console.log(data);
    return data;
  },
  afterExtractField: function (fieldName, data, page, site, index) {
    // console.log(fieldName);
    
    /*if (fieldName === 'data.id') {
      // 根据内容id把内容详情页添加到待爬队列
      console.log(data);
      site.addUrl(itemUrlPrefix + data);
    }*/
    
    if (fieldName === 'data.state') {
      if (!data) return null;
      // console.log(typeof data);
      // console.log(data);
      
      var state = JSON.parse(data
        .replace(/window\.__INITIAL_SSR_STATE__=\{"NoteView":(.*)\}/, "$1")
        .replace(/\n/g, "\\\\n")
        .replace(/\r/g, "\\\\r")
      );
      
      console.log(typeof state);
      
      console.log(Object.keys(state));
      
      return state;
      
    }
    
    return data;
  }
};

var crawler = new Crawler(configs);
crawler.start();
