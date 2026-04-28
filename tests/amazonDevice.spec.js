const { test, expect } = require('@playwright/test');

test.describe.configure({ mode: 'parallel' });

const devices = [
  { name: 'iPhone', searchTerm: 'Apple iPhone unlocked renewed', expectedTitle: /iphone/i },
  { name: 'Galaxy device', searchTerm: 'Samsung Galaxy phone unlocked', expectedTitle: /galaxy/i }
];

const deliveryZip = process.env.AMAZON_DELIVERY_ZIP || '10001';

for (const device of devices) {
  test(`search for ${device.name}, add it to cart, and print price`, async ({ page }) => {
    const result = await searchAndAddFirstAvailableDevice(page, device.searchTerm, device.expectedTitle);

    console.log(`${device.name} price: ${result.price}`);
    console.log(`${device.name} selected product: ${result.title}`);

    await expect(page.locator('#nav-cart-count, #sc-subtotal-label-activecart')).toBeVisible();
  });
}

async function searchAndAddFirstAvailableDevice(page, searchTerm, expectedTitle) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await setDeliveryZip(page, deliveryZip);
  await dismissOptionalOverlays(page);

  await page.locator('#twotabsearchtextbox').fill(searchTerm);
  await page.locator('#nav-search-submit-button').click();
  await page.waitForLoadState('domcontentloaded');
  await dismissOptionalOverlays(page);

  const productCards = page.locator('[data-component-type="s-search-result"]');
  await expect(productCards.first()).toBeVisible();

  const cardCount = Math.min(await productCards.count(), 16);
  for (let index = 0; index < cardCount; index += 1) {
    const card = productCards.nth(index);
    const title = await getCardTitle(card);
    const searchResultPrice = await getCardPrice(card);

    if (!title || !expectedTitle.test(title)) {
      continue;
    }

    const link = card.locator('a[href*="/dp/"]:has(h2), h2 a[href*="/dp/"], a.a-link-normal.s-no-outline').first();
    await link.click();
    await page.waitForLoadState('domcontentloaded');
    await dismissOptionalOverlays(page);

    const price = searchResultPrice || (await getProductPagePrice(page));
    const addResult = await addCurrentProductToCart(page);
    const finalPrice = addResult.price || price;
    if (finalPrice && (addResult.added || addResult.addAttempted)) {
      return { title, price: finalPrice };
    }

    await page.goBack({ waitUntil: 'domcontentloaded' });
  }

  throw new Error(`No addable product with a visible price was found for "${searchTerm}".`);
}

async function getCardTitle(card) {
  return card
    .locator('a[href*="/dp/"]')
    .evaluateAll((links) => {
      const candidates = links
        .map((link) => link.getAttribute('aria-label') || link.innerText || link.textContent || '')
        .map((text) => text.replace(/\s+/g, ' ').trim())
        .filter((text) => text.length > 15);

      return candidates[0] || null;
    })
    .catch(() => null);
}

async function getCardPrice(card) {
  const priceLocator = card.locator('.a-price .a-offscreen').first();
  if (!(await priceLocator.count())) {
    return null;
  }

  return cleanText(await priceLocator.textContent());
}

async function addCurrentProductToCart(page) {
  const pagePrice = await getProductPagePrice(page);
  const directAddToCart = page
    .locator('#add-to-cart-button, [name="submit.add-to-cart"], input[name="submit.addToCart"]')
    .first();

  if (await directAddToCart.isVisible().catch(() => false)) {
    await directAddToCart.click();
    return { added: await waitForCartConfirmation(page), addAttempted: true, price: pagePrice };
  }

  const accessibleAddToCart = page.locator('#nav-assist-add-to-cart').first();
  if (await accessibleAddToCart.isVisible().catch(() => false)) {
    await accessibleAddToCart.click().catch(() => {});
    const added = await waitForCartConfirmation(page).catch(() => false);
    if (added || pagePrice) {
      return { added, addAttempted: true, price: pagePrice };
    }
  }

  const offersButton = page
    .locator(
      '#buybox-see-all-buying-choices, #buybox-see-all-buying-choices-announce, ' +
        'a:has-text("See All Buying Options"), button:has-text("See All Buying Options"), ' +
        'a:has-text("offers from"), a:has-text("offer from")'
    )
    .first();

  if (!(await offersButton.isVisible().catch(() => false))) {
    return { added: false, addAttempted: false, price: pagePrice };
  }

  await offersButton.click();
  await dismissOptionalOverlays(page);

  const offerPrice = await getOfferPrice(page);
  const offerAddToCart = page
    .locator(
      '#aod-offer input[name="submit.addToCart"], ' +
        '#all-offers-display-scroller input[name="submit.addToCart"], ' +
        '#aod-offer button:has-text("Add to Cart"), ' +
        '#all-offers-display-scroller button:has-text("Add to Cart")'
    )
    .first();

  if (!(await offerAddToCart.isVisible({ timeout: 15_000 }).catch(() => false))) {
    return { added: false, addAttempted: true, price: offerPrice || pagePrice };
  }

  await offerAddToCart.click();
  return { added: await waitForCartConfirmation(page), addAttempted: true, price: offerPrice || pagePrice };
}

async function getProductPagePrice(page) {
  const priceLocator = page
    .locator(
      '#corePrice_feature_div .a-offscreen, ' +
        '#apex_desktop .a-offscreen, ' +
        '#tp_price_block_total_price_ww .a-offscreen, ' +
        '.priceToPay .a-offscreen'
    )
    .first();

  if (!(await priceLocator.isVisible().catch(() => false))) {
    const offersPriceText = await page
      .locator('a:has-text("offers from"), a:has-text("offer from")')
      .first()
      .textContent()
      .catch(() => null);

    return extractPrice(offersPriceText);
  }

  return extractPrice(await priceLocator.textContent());
}

async function getOfferPrice(page) {
  const priceLocator = page
    .locator(
      '#aod-price-0 .a-offscreen, ' +
        '#aod-offer .a-price .a-offscreen, ' +
        '#all-offers-display-scroller .a-price .a-offscreen'
    )
    .first();

  if (!(await priceLocator.isVisible({ timeout: 10_000 }).catch(() => false))) {
    return null;
  }

  return extractPrice(await priceLocator.textContent());
}

async function waitForCartConfirmation(page) {
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await dismissOptionalOverlays(page);

  const noThanks = page.locator('#attachSiNoCoverage, input[aria-labelledby="attachSiNoCoverage-announce"]').first();
  if (await noThanks.isVisible().catch(() => false)) {
    await noThanks.click();
  }

  const cartConfirmation = page.locator('#NATC_SMART_WAGON_CONF_MSG_SUCCESS, h1:has-text("Added to Cart"), #sw-atc-confirmation');
  await expect(cartConfirmation.first()).toBeVisible({ timeout: 20_000 });
  return true;
}

async function dismissOptionalOverlays(page) {
  const optionalControls = [
    page.locator('input[data-action-type="DISMISS"]').first(),
    page.locator('button:has-text("Dismiss"), input[aria-labelledby*="dismiss"]').first(),
    page.locator('button:has-text("Continue shopping"), input[aria-labelledby*="continue"]').first()
  ];

  for (const control of optionalControls) {
    if (await control.isVisible({ timeout: 1000 }).catch(() => false)) {
      await control.click({ timeout: 3000 }).catch(() => {});
    }
  }
}

async function setDeliveryZip(page, zipCode) {
  const currentLocation = cleanText(await page.locator('#glow-ingress-line2').textContent().catch(() => ''));
  if (currentLocation && currentLocation.includes(zipCode)) {
    return;
  }

  const locationButton = page.locator('#nav-global-location-popover-link').first();
  const changeAddress = page.getByText('Change Address', { exact: true }).first();
  if (await changeAddress.isVisible().catch(() => false)) {
    await changeAddress.click();
  } else if (await locationButton.isVisible().catch(() => false)) {
    await locationButton.click();
  } else {
    return;
  }

  const zipInput = page.locator('#GLUXZipUpdateInput').first();
  if (!(await zipInput.isVisible({ timeout: 15_000 }).catch(() => false))) {
    await page.keyboard.press('Escape').catch(() => {});
    return;
  }

  await zipInput.fill(zipCode);
  await page.locator('#GLUXZipUpdate, input[aria-labelledby="GLUXZipUpdate-announce"]').first().click();

  const doneButton = page.locator('button[name="glowDoneButton"], input[name="glowDoneButton"]').first();
  if (await doneButton.isVisible({ timeout: 10_000 }).catch(() => false)) {
    await doneButton.click();
  }

  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForTimeout(1000);
}

function cleanText(value) {
  return value ? value.replace(/\s+/g, ' ').trim() : null;
}

function extractPrice(value) {
  const text = cleanText(value);
  if (!text) {
    return null;
  }

  const currencyMatch = text.match(/(?:INR\s*|₹\s*|\$\s*)\d[\d,]*(?:\.\d{2})?/);
  if (currencyMatch) {
    return currencyMatch[0].trim();
  }

  const match = text.match(/\d[\d,]*(?:\.\d{2})/);
  return match ? match[0].trim() : text;
}
