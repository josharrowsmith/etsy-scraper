const puppeteer = require("puppeteer");
const fs = require("fs");
const Shopify = require('shopify-api-node');
const image2base64 = require("image-to-base64");
require('dotenv').config();
const shopify = new Shopify({
  shopName: process.env.SHOP_NAME,
  apiKey: process.env.APIKEY,
  password: process.env.PASSWORD,
})

// Opens browser do scraping
async function initBrowser() {

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

    const newImages = await getImages(images);

    const price = await page
      .evaluate(() => document.querySelector("p.wt-text-title-03.wt-mr-xs-2").textContent)
      .catch(err => console.log(err));

    const description = await page
      .evaluate(() => document.querySelector("p.wt-text-body-01.wt-break-word").textContent.trim())
      .catch(err => console.log(err));

    uploadToShopify(newImages, title, price, description)

    await page.goBack();
  }
}

async function getImages(images) {
  const waitResolve = [];
  for (let x = 0; x < images.length; x++) {
    const base64 = await image2base64(images[x]);
    waitResolve.push({
      "attachment": base64,
    })
  }
  return Promise.all(waitResolve);
}

async function uploadToShopify(images, title, price, description) {
  await shopify.product.create({
    "title": title,
    "body_html": description,
    "images": images,
    "variants": [
      {
        "option1": "First",
        "price": "10.00",
        "sku": 123
      },
    ]
  })
}

async function runAllTheThings() {
  await initBrowser();
}

runAllTheThings();

