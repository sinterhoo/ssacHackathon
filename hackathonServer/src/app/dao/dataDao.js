const { pool } = require("../../../config/database");

// index
async function setData(newsUrl,newsTitle,press,time,img) {
  let sub = new Object();
  let main = [];
    sub['newsUrl'] = newsUrl;
      sub['newsTitle'] = newsTitle;
      sub['press'] = press;
      sub['time'] = time;
      sub['img'] = img;
      main[0] = sub;
  return main[0];
}

async function setHeadLine(url,img,expain,title) {
  let sub = new Object();
  let main = [];
    sub['newsUrl'] = url;
      sub['newsImg'] = img;
      sub['explanation'] = expain;
      sub['title'] = title;
      main[0] = sub;
  return main[0];
}

async function setCity(city,number) {
  let sub = new Object();
  let main = [];
    sub['city'] = city;
      sub['number'] = number;
      main[0] = sub;
  return main[0];
}


module.exports = {
  setData,
  setHeadLine,
  setCity
};
