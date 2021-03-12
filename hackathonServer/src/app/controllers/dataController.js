const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const dataDao = require('../dao/dataDao');



//axious 사용한 크롤링(동적인 js 데이터는 긁어올 수가 없음...)
exports.getVaccineData = async function (req, res) {
    const axios = require("axios");
    const cheerio = require("cheerio");
    const log = console.log;

    try{

    const getHtml = async () => {
        try {
          return await axios.get("https://github.com/owid/covid-19-data/blob/master/public/data/vaccinations/country_data/South%20Korea.csv");
        } catch (error) {
          console.error(error);
        }
      };
      
    getHtml() .then(html => { 
        let ulList = []; 
        const $ = cheerio.load(html.data); 
        const $bodyList = $("#repo-content-pjax-container > div > div.Box.mt-3.position-relative > div.Box-body.p-0.blob-wrapper.data.type-csv.gist-border-0 > div.markdown-body > table > tbody");
        for(let x=0; x<15; x++){
            
        $bodyList.each(function(i, elem) {
            ulList[x] = { 
                day: $(this).find("#LC"+(x+2)+" > td:nth-child(3)").text(),
                number: $(this).find("#LC"+(x+2)+" > td:nth-child(7)").text(),
            }; 
        }); 

        }

        const data = ulList.filter(n => n.day);
        //const data = ulList;
        log(ulList);
        return res.json(
            {
                "result" : data,
                isSuccess: true,
                code: 1000,
                message: "날짜별 백신 누적 기록 조회 성공"
            }); 
    }) //.then(res => log(res));
}catch(err){
    return res.json(
        {
            isSuccess: false,
            code: 2000,
            message: "날짜별 백신 누적 기록 조회 실패"
        }); 
}

};



exports.getVaccine = async function (req, res) {
    // puppeteer을 가져온다.
    const puppeteer = require('puppeteer');
    // cheerio를 가져온다.
    const cheerio = require('cheerio');
    let name = [];
    let number = [];
    let main = [];
    
    try{
    (async() => {
      // 브라우저를 실행한다.
      // 옵션으로 headless모드를 끌 수 있다.
      const browser = await puppeteer.launch({
        headless: false
      });
    
      // 새로운 페이지를 연다.
      const page = await browser.newPage();
      // 페이지의 크기를 설정한다.
      await page.setViewport({
        width: 1366,
        height: 768
      });
      // URL에 접속한다
      await page.goto('http://ncv.kdca.go.kr/');
      // 페이지의 HTML을 가져온다.
      const content = await page.content();
      // $에 cheerio를 로드한다.
      const $ = cheerio.load(content);
      // 복사한 리스트의 Selector로 리스트를 모두 가져온다.
      const lists = $("#content > div.status > div > div > div:nth-child(2) > div > div.tab_box.on > div.tab_content.round1 > div.map");
      // 모든 리스트를 순환한다.
      lists.each((index, list) => {
        // 각 리스트의 하위 노드중 선택한 이름에 해당하는 요소를 Selector로 가져와 텍스트값을 가져온다.
        for(let i=1;i<18;i++){
            name[i-1] = $(list).find("div > p.city_"+i+".no_4 > span.name").text();
            number[i-1] = $(list).find("div > p.city_"+i+".no_4 > span.result").text();
            if(i == 7){
                name[i-1] = $(list).find("div > p.city_"+i+".no_3 > span.name").text();
                number[i-1] = $(list).find("div > p.city_"+i+".no_3 > span.result").text();
            }
            if(i == 8){
                name[i-1] = $(list).find("div > p.city_"+i+".no_2 > span.name").text();
                number[i-1] = $(list).find("div > p.city_"+i+".no_2 > span.result").text();
            }
        }
        
      });

      for(let i=0; i<17; i++){
        
        main[i] = await dataDao.setCity(name[i],number[i]);
      }
      // 브라우저를 종료한다.
      browser.close();
      return res.json({
          "result" : main,
          isSuccess: true,
          code: 1000,
          message: "도시별 접종 현황 조회 성공"
        });
    })();
}catch(err){
    return res.json({
        isSuccess: false,
        code: 2000,
        message: "도시별 접종 현황 조회 실패"
      });
}
    };

exports.getChrome = async function (req, res) {

const puppeteer = require('puppeteer');

const cheerio = require('cheerio');
let turn,people,percent,total,contracts,astra,pfizer,novavax,moderna,janssen;

try{
(async() => {
  const browser = await puppeteer.launch({
    headless: false
  });

  
  const page = await browser.newPage();
  
  await page.setViewport({
    width: 1366,
    height: 768
  });
  
  await page.goto('https://news.kbs.co.kr/special/covid19/vaccine.html');
  
  const content = await page.content();
  const $ = cheerio.load(content);
  const lists = $("div.domestic-info");
  
  lists.each((index, list) => {
    
    turn = $(list).find("#turn").text();
    people = $(list).find("#people").text();
    percent = $(list).find("#percent").text();
    total = $(list).find("#total").text();
    contracts = $(list).find("#contract").text();
    astra = $(list).find("#astra").text();
    pfizer = $(list).find("#pfizer").text();
    novavax = $(list).find("#novavax").text();
    moderna = $(list).find("#moderna").text();
    janssen = $(list).find("#janssen").text();
    
    
  });
  
  browser.close();
  return res.json({
      "turn" : turn,
      "people" : people,
      "percent" : percent,
      "total" : total,
      "contracts" : contracts,
      "astra" : astra,
      "pfizer" : pfizer,
      "novavax" : novavax,
      "moderna" : moderna,
      "janssen" : janssen,
      isSuccess: true,
      code: 1000,
      message: "접종,도입현황 조회 성공"
    });
})();
}catch(err){
    return res.json({
        isSuccess: false,
        code: 2000,
        message: "접종,도입현황 조회 실패"
      });
}
};

exports.getNews = async function (req, res) {
    
    const puppeteer = require('puppeteer');
    const cheerio = require('cheerio');
    let newsUrl = [];
    let newsTitle = [];
    let press = [];
    let time = [];
    let sub = new Object();
    let main = [];
    try{
    (async() => {
      const browser = await puppeteer.launch({
        headless: false
      });
    
      const page = await browser.newPage();
      await page.setViewport({
        width: 1366,
        height: 768
      });
      await page.goto('https://news.kbs.co.kr/special/covid19/vaccine.html');
      const content = await page.content();
      const $ = cheerio.load(content);
      const lists = $("#thumbnailNewsList");

      lists.each((index, list) => {
        
        for(let i=1; i<9; i++){
            newsUrl[i-1] = "https://news.kbs.co.kr"+$(list).find("#thumbnailNewsList > li:nth-child("+i+") > a").attr("href");
        newsTitle[i-1] = $(list).find("#thumbnailNewsList > li:nth-child("+i+") > a > span.desc > em").text();
        press[i-1] = $(list).find("#thumbnailNewsList > li:nth-child("+i+") > a > span.desc > span.cate").text();
        time[i-1] = $(list).find("#thumbnailNewsList > li:nth-child("+i+") > a > span.desc > span.time.bar").text();
        }
        
       
        
      });
      for(let i=0; i<8; i++){
        
        main[i] = await dataDao.setData(newsUrl[i],newsTitle[i],press[i],time[i]);
      }

      
      browser.close();

      return res.json({
          "result" : main,
          isSuccess: true,
          code: 1000,
          message: "뉴스 조회 성공"
        });
    })();
}catch(err){
    return res.json({
        isSuccess: false,
        code: 2000,
        message: "뉴스 조회 실패"
      });
}
    };
    
exports.getInstructions = async function (req, res) {
        
        const puppeteer = require('puppeteer');
        const cheerio = require('cheerio');
        let newsUrl = [];
        let newsTitle = [];
        let img = [];
        let explanation = [];
        let main = [];
        try{
        (async() => {
          const browser = await puppeteer.launch({
            headless: false
          });
        
          const page = await browser.newPage();
          await page.setViewport({
            width: 1366,
            height: 768
          });
          
          await page.goto('https://news.kbs.co.kr/special/covid19/vaccine.html');
          
          const content = await page.content();
          
          const $ = cheerio.load(content);
          const lists = $("#headlineList");
          lists.each((index, list) => {
            
            for(let i=2; i<7; i++){
                newsUrl[i-2] = "https://news.kbs.co.kr"+$(list).find("#headlineList > li:nth-child("+i+") > a").attr("href");
            newsTitle[i-2] = $(list).find("#headlineList > li:nth-child("+i+") > a > span.desc > em").text();
            explanation[i-2] = $(list).find("#headlineList > li:nth-child("+i+") > a > span.desc > span").text();
            img[i-2] = "https://news.kbs.co.kr"+$(list).find("#headlineList > li:nth-child("+i+") > a > span.img-box > span > span > img").attr("src");
            }

            
          });
          for(let i=0; i<5; i++){
        
            main[i] = await dataDao.setHeadLine(newsUrl[i],img[i],explanation[i],newsTitle[i]);
          }

          browser.close();
    
          return res.json({
              "result" : main,
              isSuccess: true,
              code: 1000,
              message: "중요 정보 조회 성공"
            });
        })();
    }catch(err){
        return res.json({
            isSuccess: false,
            code: 1000,
            message: "중요 정보 조회 실패"
          });
    }
        };