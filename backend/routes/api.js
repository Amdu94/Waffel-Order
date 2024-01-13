const fs = require('fs');
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const path = require('path');

router.use(express.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

function deleteBasketContent(){
  const filePath = path.join(__dirname, '..', 'basket.json');
  fs.writeFileSync(filePath, JSON.stringify({'basket': []}, null, 2));
}

function fileReader() {
  const filePath = path.join(__dirname, '..', 'order.json');
  const data = fs.readFileSync(filePath, 'utf-8');
  const ordersContent = JSON.parse(data).orders;
  return ordersContent;
}

router.get('/waffel', (req, res) => {
  const filePath = path.join(__dirname, '..', 'gofri.json');
  const waffles = JSON.parse(fs.readFileSync(filePath)).gofries;
  res.json(waffles);
});

router.get('/allergen', (req, res) => {
  const filePath = path.join(__dirname, '..', 'allergens.json');
  const allergens = JSON.parse(fs.readFileSync(filePath)).allergens;
  res.json(allergens);
});

router.get('/basket', (req, res) => {
  const filePath = path.join(__dirname, '..', 'basket.json');
  const basket = JSON.parse(fs.readFileSync(filePath)).basket;
  res.json(basket);
});

router.post('/order', (req, res) => {
  const filePath = path.join(__dirname, '..', 'order.json');
  const ordersReader = fileReader();
  const requestBody = req.body;
  requestBody.id = ordersReader.length + 1;
  ordersReader.push(requestBody);
  fs.writeFileSync(filePath, JSON.stringify({ orders: ordersReader }, null, 2));
  deleteBasketContent();
  res.send(req.body);
});

router.get('/order', (req, res) => {
  const filePath = path.join(__dirname, '..', 'order.json');
  const order = JSON.parse(fs.readFileSync(filePath));
  res.json(order);
});

router.put('/basket', (req, res) => {
  const filePath = path.join(__dirname, '..', 'basket.json');
  const basketContent = JSON.parse(fs.readFileSync(filePath)).basket;
  const requestBody = req.body;
  for (let i = 0; i < basketContent.length; i++){
    if (basketContent[i].id === requestBody.id){
      basketContent[i].amount = requestBody.amount;
    }
  }
  fs.writeFileSync(filePath, JSON.stringify({ basket: basketContent }, null, 2));
  res.send('ok');
});

router.delete('/basket', (req, res) => {
  const filePath = path.join(__dirname, '..', 'basket.json');
  const basketContent = JSON.parse(fs.readFileSync(filePath)).basket;
  const requestBody = req.body;
  const filteredBasket = basketContent.filter((item) => item.id !== requestBody.id);
  fs.writeFileSync(filePath, JSON.stringify({ basket: filteredBasket }, null, 2));
  res.send('ok');
});

router.post('/basket', (req, res) => {
  const gofriFilePath = path.join(__dirname, '..', 'gofri.json');
  const basketFilePath = path.join(__dirname, '..', 'basket.json');
  const basketContent = JSON.parse(fs.readFileSync(basketFilePath)).basket;
  const gofries = JSON.parse(fs.readFileSync(gofriFilePath)).gofries;
  const gofriArray = gofries.filter((pkg) => pkg.id === parseInt(req.body.id));
  const basketProperty = {
    id: gofriArray[0].id,
    name: gofriArray[0].name,
    price: gofriArray[0].price,
    amount: 1,
  };
  if (!basketContent.some((item) => item.id === req.body.id)) {
    basketContent.push(basketProperty);
  } else {
    basketContent.find((item) => item.id === req.body.id).amount++;
  }
  fs.writeFileSync(basketFilePath, JSON.stringify({ basket: basketContent }, null, 2));
  res.send(gofriArray);
});

module.exports = router;
