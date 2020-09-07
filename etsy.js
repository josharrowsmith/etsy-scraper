const puppeteer = require("puppeteer");
const fs = require("fs");
require('dotenv').config();

// Opens browser do scraping
async function initBrowser() {

  fs.writeFile('output.csv', 'URL, Title, H2\r\n', 'utf8', function (err) {
    console.log(`Header written`)
  })

  this.browser = await puppeteer.launch({
    headless: false,
    args: ["--window-size=1920,1440"]
  });
  this.page = await browser.newPage();
  await this.page.setViewport({ height: 1440, width: 1920 });
  await page.goto(process.env.URL);

  let urls = await page.evaluate(() => {
    let divs = [...document.querySelectorAll('ul.listing-cards li a')];
    return divs.map((div) => div.href);
  });


  for (let i = 0, total_urls = urls.length; i < total_urls; i++) {
    await page.goto(urls[i]);

    const title = await page
      .evaluate(() => document.querySelector("div#listing-page-cart h1").textContent)
      .catch(err => console.log(err));

    const images = await this.page.evaluate(() => {
      const elements = Array.from(
        document.querySelectorAll(".image-carousel-container ul > li > img")
      );
      const links = elements.map(element => element.src);
      return links;
    });

    const price = await page
      .evaluate(() => document.querySelector("p.wt-text-title-03.wt-mr-xs-2").textContent)
      .catch(err => console.log(err));

    const description = await page
      .evaluate(() => document.querySelector("p.wt-text-body-01.wt-break-word").textContent.trim())
      .catch(err => console.log(err));

    fs.appendFile('output.csv', `${urls[i]}, ${title}, ${price}\r\n`, 'utf8', function (err) {
      console.log(
        `url: ${urls[i]}, title: ${title}, h2: ${price}`)
    })

    await page.goBack();
  }
}

async function runAllTheThings() {
  await initBrowser();
}

runAllTheThings();

