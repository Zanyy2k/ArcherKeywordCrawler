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
// var keywordIndex = 0;

// 神箭手不建议在爬虫代码中使用全局变量。因为每个爬虫节点都会单独使用定义的全局变量，容易出现冲突
var pageIndex = 1; // 正式爬取时从1开始，测试阶段使用较大数字

var keywordUrlPrefix = "http://www.xiaohongshu.com/web_api/sns/v2/search/note?keyword=";
var itemUrlPrefix = "http://www.xiaohongshu.com/discovery/item/";
var goodsUrlPrefix = "https://pages.xiaohongshu.com/goods/";

var searchRegex = /http(s)?:\/\/www\.xiaohongshu\.com\/web_api\/sns\/v2\/search\/note\?keyword=(.*)+&page=(\d){1,2}/;
var itemRegex = /http(s)?:\/\/www\.xiaohongshu\.com\/discovery\/item\/.*/;
var goodsRegex = /http(s)?:\/\/pages\.xiaohongshu\.com\/goods\/.*/;


// var urlWithKeyword = getUrlWithKeywordIndex(keywordIndex, pageIndex);

var scanUrlsArray = [];
for (var i = numKeyWords - 1; i > 0; i--) {
  scanUrlsArray.push(getUrlWithKeywordIndex(i, pageIndex));
}

function getUrlWithKeywordIndex(keywordIndex, pageIndex) {
  return keywordUrlPrefix + encodeURIComponent(keywords[keywordIndex]) + "&page=" + pageIndex;
}

var configs = {
  userAgent: UserAgent.Mobile,
  domains: ["xiaohongshu.com"],
  timeout: 10 * 1000,
  scanUrls: scanUrlsArray,
  enableJS: true,
  contentUrlRegexes: [searchRegex, itemRegex, goodsRegex],
  helperUrlRegexes: [],
  autoFindUrls: false,
  fields: [
    {
      name: "data",
      selector: "$.data",
      selectorType: SelectorType.JsonPath,
      // repeated: true,
      transient: true
    },
    {
      name: "note",
      alias: '笔记state',
      sourceType: SourceType.AttachedUrl,
      // attachedUrl: itemUrlPrefix + '{id}',
      selectorType: SelectorType.XPath,
      selector: "//body//script[contains(., 'NoteView')]"
    },
    {
      name: "goods",
      alias: "商品state",
      sourceType: SourceType.AttachedUrl,
      // attachedUrl: goodsUrlPrefix + '{id}',
      selectorType: SelectorType.XPath,
      selector: "//body//script[contains(., 'Main')]"
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
    console.log('on process content page: ' + url);
    
    if (goodsRegex.test(url)) {
      // site.addUrl(url);
      // console.log(page.raw.replace(/.*("Main":{.*)<\/script>/, "$1"));
      // console.log('on process content page of goods: ' + url);
    }
    
    if (searchRegex.test(url)) {
      console.log('matched: ' + url);
      var data = JSON.parse(content);
      if (data.data.length < 1) {
        // 已完成该页面爬取
        var currentKeyword = url.replace(/.*keyword=(.*)&page=.*/, '$1');
        console.log('done with keyword: ' + decodeURIComponent(currentKeyword));
        /*if (++keywordIndex < numKeyWords) {
          // 爬取下一个关键词
          var newUrl = getUrlWithKeywordIndex(keywordIndex, pageIndex);
          site.addUrl(newUrl);
        } else {
          // 已完成所有关键词的爬取
          console.log('done with all keywords');
          return false;
        }*/
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
  
  afterDownloadAttachedPage: function (page, site) {
    console.log('after download attached page: ' + page.url);
    
  },
  
  afterExtractPage: function (page, data, site) {
    // console.log(data);
    return data;
  },
  afterExtractField: function (fieldName, data, page, site, index) {
    
    if (fieldName === 'data' && data) {
      console.log('type of "data" field is: ' + typeof data);
      console.log(data);
      data = JSON.parse(data);  // data here is string
      site.addUrl(itemUrlPrefix + data.id);
    }
    
    if (fieldName === 'note') {
      if (!data) return null;
      // console.log('type of "note" field is: ' + typeof data);
      var state = JSON.parse(data
        .replace(/window\.__INITIAL_SSR_STATE__=\{"NoteView":(.*)\}/, "$1")
        .replace(/\n/g, "\\\\n")
        .replace(/\r/g, "\\\\r")
      );
      var hashTags;
      try {
        hashTags = state.content.hashTags;
      } catch (err) {
        console.log(err);
      }
      if (hashTags && hashTags.length > 0) {
        var goodsTags = hashTags.filter(function (tag) {
          return tag.type === "goods";
        });
        if (goodsTags.length > 0) {
          goodsTags.forEach(function (tag) {
            var goodsLink = decodeURIComponent(tag.link);
            if (goodsRegex.test(goodsLink)) {
              console.log('add goods link to content page: ' + goodsLink);
              site.addUrl(goodsLink);
            }
          })
        }
      }
      return state;
    }
    
    if (fieldName === 'goods' && data) {
      console.log('goods field data: ' + data);
      data = JSON.parse(data
        .replace(/window\.__INITIAL_SSR_STATE__=\{"Main":(.*)\}/, "$1")
        .replace(/\n/g, "\\\\n")
        .replace(/\r/g, "\\\\r")
      );
    }
    
    return data;
  },
  
  isAntiSpider: function (url, content, page) {
    
    
    var isListPage = searchRegex.test(url);
    if (isListPage) {
      try {
        var json = JSON.parse(content);
      } catch (err) {
        console.log(content);
        console.log('JOSN.parse failed, use Anti-Spider');
        return true;
      }
    }
    
    // 如果笔记详情页、商品详情页没有"__INITIAL_SSR_STATE__"，则重新请求该页面
    var isDetailPage = itemRegex.test(url) || goodsRegex.test(url);
    if (isDetailPage && page.raw && page.raw.indexOf("__INITIAL_SSR_STATE__") < 0) {
      return true;
    }
  }
  
};

var crawler = new Crawler(configs);
crawler.start();
