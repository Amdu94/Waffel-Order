/**
 * The main function.
*/
function loadEvent() {
  displayHome();
  fetchGofri();
  fetchBasket();
  displayForm();
}

// Reaction to user input

window.addEventListener('load', loadEvent);

function addOrderRequest() {
  elementById('customerForm').addEventListener('submit', (event) => processOrderRequest(event));
}

function addCheckboxFilter() {
  [...document.getElementsByClassName('checkbox')].forEach((checkbox) => {
    checkbox.addEventListener('click', filterWaffles);
  });
}

function addAddToBasketRequest() {
  [...document.getElementsByClassName('waffelOrderButton')].forEach((button) => {
    button.addEventListener('click', (event) => processAddToBasketRequest(event));
  });
}

function addChangeAmountRequests() {
  addPlusWaffelRequest();
  addMinusWaffelRequest();
}

function addPlusWaffelRequest() {
  [...document.getElementsByClassName('plusButton')].forEach((button) => {
    button.addEventListener('click', (event) => processChangeAmountRequest(event, '+'));
  });
}

function addMinusWaffelRequest() {
  [...document.getElementsByClassName('minusButton')].forEach((button) => {
    button.addEventListener('click', (event) => processChangeAmountRequest(event, '-'));
  });
}

// Fetch and process information

async function fetchGofri() {
  const responseWaffel = await fetch('api/waffel');
  const waffles = await responseWaffel.json();
  const responseAllergen = await fetch('api/allergen');
  const allergens = await responseAllergen.json();
  displayWaffles(waffles, allergens);
  displayFilters(allergens);
}

async function fetchBasket() {
  const responseBasket = await fetch('api/basket');
  const basket = await responseBasket.json();
  displayBasket(basket);
}

async function fetchBasketContent() {
  const response = await fetch('api/basket');
  const jsonData = await response.json();
  return jsonData;
}

async function processOrderRequest(event) {
  event.preventDefault();
  const formData = new FormData(elementById('customerForm'));
  const cName = formData.get('name');
  const email = formData.get('email');
  const city = formData.get('city');
  const street = formData.get('street');
  const postData = await createOrderRequest(cName, email, city, street);
  sendOrderRequest(postData);
  fetchBasket();
}

async function createOrderRequest(cName, cEmail, cCity, cStreet){
  const currentDate = new Date;
  const orderData = {id : 1,
    date : {year : currentDate.getFullYear(),
      month : currentDate.getMonth() + 1,
      day : currentDate.getDate(),
      hour: `${currentDate.getHours()}:${currentDate.getMinutes()}`},
    order : await fetchBasketContent(),
    customer : {
      name : cName,
      email: cEmail,
      city: cCity,
      street: cStreet,
    },
  };
  return orderData;
}

function processAddToBasketRequest(event) {
  const id = event.target.getAttribute('data-id');
  const postData = {id: Number(id)};
  sendAddToBasketRequest(postData);
  fetchBasket();
}

function processChangeAmountRequest(event, change) {
  const id = event.target.parentElement.getAttribute('data-id');
  let amount = Number(elementById(`amount-${id}`).innerText);
  switch (change) {
  case '+':
    amount++;
    break;
  case '-':
    amount--;
    break;
  }
  if (amount) {
    elementById(`amount-${id}`).innerText = amount;
    const postData = {
      id: Number(id),
      amount: amount,
    };
    sendModifyBasketRequest(postData);
  } else {
    elementById(`ordered-${id}`).style.display = 'none';
    const postData = {id: Number(id)};
    sendDeleteBasketRequest(postData);
  }
  fetchBasket();
}

function sendOrderRequest(postData) {
  fetch('api/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData),
  });
}

function sendAddToBasketRequest(postData) {
  fetch('api/basket', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData),
  });
}

function sendModifyBasketRequest(postData) {
  fetch('api/basket', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData),
  });
}

function sendDeleteBasketRequest(postData) {
  fetch('api/basket', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData),
  });
}

// DOM Manipulations

function displayHome() {
  insertHTML('main', 'id=main', '', 'root');
  insertHTML('div', 'class=title', 'Gofri King', 'main');
  insertHTML('div', 'id=container', '', 'main');
  insertHTML('div', 'id=sidepanelBack', '', 'main');
  insertHTML('div', 'id=sidepanel', '', 'main');
  insertHTML('div', 'id=filterpanel class=sidedetails', '', 'sidepanel');
  insertHTML('img', 'src=images/knife.png class=cutlery', '', 'sidepanel');
  insertHTML('div', 'id=orderpanel class=sidedetails', '', 'sidepanel');
  insertHTML('img', 'src=images/fork.png class=cutlery', '', 'sidepanel');
  insertHTML('div', 'id=customerpanel class=sidedetails', '', 'sidepanel');
  insertHTML('img', 'src=images/spoon.png class=cutlery', '', 'sidepanel');
}

function filterWaffles() {
  [...document.getElementsByClassName('card')].forEach((card) => {
    if (isFiltered(card)) card.style.display = 'none';
    else card.style.display = 'flex';
  });
}

function isFiltered(card) {
  for (const id of card.getAttribute('data-allergens').split(',')) {
    for (const checkbox of [...document.getElementsByClassName('checkbox')]) {
      if (!checkbox.checked && id === checkbox.getAttribute('data-id')) {
        return true;
      }
    }
  }
  return false;
}

function displayWaffles(waffles, allergens) {
  elementById('container').innerHTML = '';
  for (const waffel of waffles) {
    displayCard(waffel, allergens);
  }
  addAddToBasketRequest();
}

function displayCard(waffel, allergens) {
  insertHTML('div', `id=card-${waffel.id} class=card data-allergens=${waffel.allergens}`, '', 'container');
  insertHTML('div', `id=top-${waffel.id} class=topdetails`, '', `card-${waffel.id}`);
  insertHTML('div', 'class=waffelName', waffel.name, `top-${waffel.id}`);
  insertHTML('img', `class=waffelImg src=./images/waffle_${waffel.id}.png`, '', `top-${waffel.id}`);
  insertHTML('div', 'class=waffelIngredients', waffel.ingredients.join(', '), `top-${waffel.id}`);
  const allergen = `Allergenes:\n${waffel.allergens.map((id) => {
    return allergens.find((item) => item.id === id).name;
  }).join(', ')}`;
  insertHTML('div', 'class=waffelAllergens', allergen, `top-${waffel.id}`);
  insertHTML('div', `id=bottom-${waffel.id} class=bottomdetails`, '', `card-${waffel.id}`);
  insertHTML('div', 'class=waffelPrice', `${waffel.price.toLocaleString()} HUF`, `bottom-${waffel.id}`);
  insertHTML('button', `class=waffelOrderButton data-id=${waffel.id}`, 'Add to basket', `bottom-${waffel.id}`);
}

function displayFilters(allergens) {
  insertHTML('div', 'class=allergens', 'Allergens', 'filterpanel');
  for (const allergen of allergens) {
    displayAllergen(allergen);
  }
  addCheckboxFilter();
}

function displayAllergen(allergen) {
  insertHTML('div', `id=wrapfilter-${allergen.id} class=wrapfilter`, '', 'filterpanel');
  insertHTML('span', 'class=filterLabel', `${allergen.name}:`, `wrapfilter-${allergen.id}`);
  insertHTML('span', `id=filter-${allergen.id} class="checkbox-wrapper-34"`, '', `wrapfilter-${allergen.id}`);
  insertHTML('input', `id=checkbox-${allergen.id} type=checkbox name=checkbox-${allergen.id}
  class="checkbox tgl tgl-ios" data-id=${allergen.id} checked=true`, '', `filter-${allergen.id}`);
  insertHTML('label', `for=checkbox-${allergen.id} class="tgl-btn"`, '', `filter-${allergen.id}`);
}

function displayBasket(basket) {
  let price = 0;
  elementById('orderpanel').innerHTML = '';
  for (const waffel of basket) {
    price += displayOrderedWaffel(waffel);
  }
  addChangeAmountRequests();
  if (price !== 0) {
    insertHTML('div', 'id=price class=ordered', '', 'orderpanel');
    insertHTML('div', 'class=orderedName', `Total: ${price.toLocaleString()} HUF`, 'price');
    elementById('customerpanel').style.display = 'flex';
  } else {
    elementById('customerpanel').style.display = 'none';
  }
}

function displayOrderedWaffel(waffel) {
  insertHTML('div', `id=ordered-${waffel.id} class=ordered`, '', 'orderpanel');
  insertHTML('div', 'class=orderedName', waffel.name, `ordered-${waffel.id}`);
  insertHTML('div', `id=orderedExtra-${waffel.id} class=orderedExtra`, '', `ordered-${waffel.id}`);
  insertHTML('span', `id=orderedNumber-${waffel.id} class=orderedNumber data-id=${waffel.id}`, '', `orderedExtra-${waffel.id}`);
  insertHTML('button', 'class=minusButton', '-', `orderedNumber-${waffel.id}`);
  insertHTML('span', `id=amount-${waffel.id} class=orderedAmount`, waffel.amount, `orderedNumber-${waffel.id}`);
  insertHTML('button', 'class=plusButton', '+', `orderedNumber-${waffel.id}`);
  const price = waffel.price * waffel.amount;
  insertHTML('span', 'class=orderedPrice', `${price.toLocaleString()} HUF`, `orderedExtra-${waffel.id}`);
  return price;
}

function displayForm() {
  insertHTML('h1', '', 'Checkout', 'customerpanel');
  insertHTML('form', 'id=customerForm', '', 'customerpanel');
  insertHTML('label', 'for=name  class=formLabel', 'Name:', 'customerForm');
  insertHTML('input', 'type=text id=name name=name', '', 'customerForm');
  insertHTML('br', '', '', 'customerForm');
  insertHTML('label', 'for=email class=formLabel', 'Email:', 'customerForm');
  insertHTML('input', 'type=email id=email name=email', '', 'customerForm');
  insertHTML('br', '', '', 'customerForm');
  insertHTML('h3', '', 'Address', 'customerForm');
  insertHTML('label', 'for=city class=formLabel', 'City:', 'customerForm');
  insertHTML('input', 'type=text id=city name=city', '', 'customerForm');
  insertHTML('br', '', '', 'customerForm');
  insertHTML('label', 'for=street class=formLabel', 'Street:', 'customerForm');
  insertHTML('input', 'type=text id=street name=street', '', 'customerForm');
  insertHTML('br', '', '', 'customerForm');
  insertHTML('div', 'id=submitButtonContainer', '', 'customerForm');
  insertHTML('input', 'type=submit value=Submit class=submitButton', '', 'submitButtonContainer');
  addOrderRequest();
}

// Create HTML Elements

/**
   * Creates and displays an HTML element.
   * @param {string} parentElementId - The ID of the HTML element you want to be the parent of the new HTML element.
   * @param {string} content - The content of the HTML element.
   * @param {string} tag - The tagname of the HTML element.
   * @param {string} attributes - The attributes of the HTML element.
   */
function insertHTML(tag, attributes, content, parentElementId) {
  insertElement(elementById(parentElementId),
    createElement(content, tag, attributes));
}

/**
   * Get an HTML element by its ID.
   * @param {string} id - The id of the HTML element.
   */
function elementById(id) {
  return document.getElementById(id);
}

/**
   * Displays an HTML element.
   * @param {object} parentElement - The HTML element you want to be the parent of the new HTML element.
   * @param {object} childElement - The new HTML element.
   */
function insertElement(parentElement, childElement) {
  parentElement.insertAdjacentHTML('beforeend', childElement);
}

/**
   * Creates an HTML element.
   * @param {string} content - The content of the HTML element.
   * @param {string} tag - The tagname of the HTML element.
     * @param {string} attributes - The attributes of the HTML element.
   */
function createElement(content, tag, attributes){
  return `<${tag} ${attributes}>${content}</${tag}>`;
}

