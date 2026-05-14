(() => {
  const ctx = window.context;
  if (!ctx || !ctx.result || !ctx.result.data) {
    return { error: "Context not found" };
  }
  const data = ctx.result.data;
  const result = {};

  // 1. Title
  result.title_zh = data.productTitle?.fields?.title || document.title;

  // 2. Main Image
  const images = data.gallery?.fields?.images || [];
  result.main_image = images[0]?.fullPath || "";

  // 3. Gallery Images
  result.gallery_images = images.map(img => img.fullPath).filter(src => !!src);

  // 4. Specifications
  const specs = {};
  const attributes = data.productAttributes?.fields?.attributes || [];
  attributes.forEach(attr => {
    specs[attr.name] = attr.value;
  });
  result.specifications = specs;

  // 5. Pack Info (Sizes, Weights)
  const packInfo = data.productPackInfo?.fields?.pieceWeightScale?.pieceWeightScaleInfo || [];
  result.variant_info = packInfo.map(info => ({
    name: info.sku2 || info.sku1,
    weight: info.weight,
    dimensions: `${info.length}x${info.width}x${info.height}`,
    volume: info.volume
  }));

  // 6. Description Detail URL
  result.description_url = data.description?.fields?.detailUrl || "";

  return result;
})()