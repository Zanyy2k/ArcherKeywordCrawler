/*
	通过神箭手平台爬取微博关键词
*/

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

var params = {
  typeall: 1,
  suball: 1,
  timescope: 'custom:2018-01-01:2018-03-20',
  Refer: 'g'
};

var urlWithoutQuery = 'http://s.weibo.com/weibo/';

var queryUrl = urlWithoutQuery + encodeURIComponent(keywords[0]);
var urlWithQuery = appendQueries(queryUrl, params);

function appendQueries(url, params) {
  Object.keys(params).forEach(function(key) {
    // url += `&${key}=${params[key]}`;
    url += '&' + key + '=' + params[key];
  });
  return url;
}

// 微博的搜索查询地址参数中，使用了两次encodeURI方法
// var queryParam = encodeURI(encodeURI(keywords[0]));

var query = 'http://s.weibo.com/weibo/%25E9%2580%259A%25E5%258B%25A4%25E5%25A6%2586&typeall=1&suball=1&timescope=custom:2018-03-01:2018-03-08&Refer=g';


var configs = {
  userAgent: UserAgent.Computer, // 默认使用电脑浏览器
  enableJS: true,
  timeout: 10 * 1000,
  domains: ["s.weibo.com"],
  scanUrls: ["http://s.weibo.com/weibo/%25E9%2580%259A%25E5%258B%25A4%25E5%25A6%2586"],
  contentUrlRegexes: [/http:\/\/s\.weibo\.com\/weibo\/%25E9%2580%259A%25E5%258B%25A4%25E5%25A6%2586/], //内容页url正则
  helperUrlRegexes: [/http:\/\/s\.weibo\.com\//], //列表页url正则 可留空
  jsEngine: 'JSEngine.HtmlUnit',
  fields: [
    {
      name: "cardList",
      selector: "//div[contains(@class, 'feed_lists W_texta')]",
      children: [
        {
          name: "mid",
          selector: "//div[contains(@action-type,'feed_list_item')]/attribute::mid",
          required: true,
          primaryKey: true
        },
        {
          name: "mblog_text",
          // selector: "//p[contains(@class,'comment_txt')]",
          selector: "//p[contains(@node-type,'feed_list_content')]",
          required: true
        }
      ]
    }
  ],
  
  beforeCrawl: function(site) {
    var url = "http://weibo.com/login.php";
    var username = "66566789@qq.com";
    var password = "b9R5zzP2";
    login(url, username, password, false);
    // 登录后请求个人主页,
    // 根据页面中是否包含特定内容来判断是否登录成功
    var content = site.requestUrl("https://weibo.com/2790421247/profile");
    console.log(content);
  },
  
  afterExtractField: function(fieldName, data, page, site) {
    console.log(fieldName);
    return data;
  }
};

var crawler = new Crawler(configs);
crawler.start();
