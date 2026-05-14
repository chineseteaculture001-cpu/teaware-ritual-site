(async () => {
  const result = {};

  // Scroll to bottom to load all content
  window.scrollTo(0, document.body.scrollHeight);
  await new Promise(r => setTimeout(r, 2000));
  window.scrollTo(0, document.body.scrollHeight / 2);
  await new Promise(r => setTimeout(r, 1000));

  // 1. Title
  const titleEl = document.querySelector('.od-static-hd h1') || document.querySelector('.title-text') || document.querySelector('h1');
  result.title_zh = titleEl ? titleEl.innerText.trim() : document.title;

  // 2. Main Image
  const mainImgEl = document.querySelector('.vertical-img-container img') || document.querySelector('.detail-gallery-main img');
  result.main_image = mainImgEl ? mainImgEl.src : '';

  // 3. Gallery Images
  const galleryImgs = Array.from(document.querySelectorAll('.tab-content img, .detail-gallery-img')).map(img => img.src.replace(/\.\d+x\d+.*$/, ''));
  result.gallery_images = Array.from(new Set(galleryImgs)).filter(src => src.includes('alicdn.com'));

  // 4. Specifications
  const specs = {};
  const specItems = document.querySelectorAll('.offer-attr-item, .prop-item');
  specItems.forEach(item => {
    const nameEl = item.querySelector('.offer-attr-item-name, .prop-name');
    const valueEl = item.querySelector('.offer-attr-item-value, .prop-value');
    if (nameEl && valueEl) {
      specs[nameEl.innerText.trim()] = valueEl.innerText.trim();
    }
  });
  result.specifications = specs;

  // 5. Description (Rich Text)
  // 1688 descriptions are often in an iframe or a div that loads images
  const descContainer = document.querySelector('#desc-lazyload-container') || document.querySelector('.offer-detail-description');
  if (descContainer) {
    result.description_html = descContainer.innerHTML;
  } else {
    // Try to find iframes
    const iframes = Array.from(document.querySelectorAll('iframe'));
    for (let f of iframes) {
      if (f.src.includes('desc.1688.com')) {
        result.description_url = f.src;
        break;
      }
    }
  }

  return result;
})()