import {
  STATUSES,
  TOPBAR_ALIGN,
  MAX_IMAGES,
  MAX_NOTICES,
  LOW_STOCK,
  NOTICE_FONT_CSS,
  LANDING_STRINGS,
  ADMIN_STRINGS,
  buildDictJson,
  escHtml,
  biHtml,
  splitList,
} from "./core.js";

function noticeHtml(n) {
  const fam = NOTICE_FONT_CSS[n.font] || NOTICE_FONT_CSS.sans;
  const bg = n.bg ? "background:" + n.bg + ";" : "";
  let h = '<section class="notice" style="font-family:' + fam + ';text-align:' + n.align + ';' + bg + '">';
  if (n.image) h += '<img class="notice-img" src="' + escHtml(n.image) + '" alt="" loading="lazy">';
  if (n.head_bn || n.head_en) {
    h += '<h3 class="notice-h" style="font-size:' + n.head_size + 'px;color:' + n.head_color +
      ';font-weight:' + (n.bold ? 800 : 600) + '">' + biHtml(n.head_bn, n.head_en) + '</h3>';
  }
  if (n.body_bn || n.body_en) {
    h += '<div class="notice-b" style="font-size:' + n.body_size + 'px;color:' + n.body_color + '">' +
      biHtml(n.body_bn, n.body_en) + '</div>';
  }
  return h + '</section>';
}


function renderLandingHTML(p, inv, nonce, notes = {}) {
  const price = Number(p.price) || 0;
  const oldPrice = Number(p.old_price) || 0;
  const stock = Math.max(0, Number(p.stock) || 0);
  const isOut = stock <= 0;
  const delInside = Number(p.delivery_inside ?? 60);
  const delOutside = Number(p.delivery_outside ?? 120);
  const callPhone = escHtml(p.contact_phone || "01700000000");
  const waNumber = String(p.whatsapp_number || "8801700000000").replace(/[^0-9]/g, "");
  const waMsg = encodeURIComponent(
    `আসসালামু আলাইকুম, আমি "${p.title}" (মূল্য: ৳${price}) প্রোডাক্টটি সম্পর্কে জানতে চাচ্ছি।`
  );
  const title = escHtml(p.title);
  const L = (k) => escHtml(LANDING_STRINGS[k] ? LANDING_STRINGS[k][0] : k);
  const ratioCss = p.image_ratio.replace(":", " / ");
  const galleryAttr = p.image_ratio === "auto"
    ? 'class="gallery auto"'
    : 'class="gallery" style="aspect-ratio: ' + ratioCss + ';"';
  const mainImg = escHtml(p.images[0] || "");
  const colorList = splitList(p.colors);
  const sizeList = splitList(p.sizes);
  const dict = buildDictJson(LANDING_STRINGS);
  const colorsJson = JSON.stringify(colorList).replace(/</g, "\\u003c");
  const sizesJson = JSON.stringify(sizeList).replace(/</g, "\\u003c");

  const variantMap = {};
  (inv || []).forEach((r) => { variantMap[r.color + "|" + r.size] = Number(r.qty) || 0; });
  const variantsJson = JSON.stringify(variantMap).replace(/</g, "\\u003c");

  const tb = p.topbar;
  const tbSize = Number(tb.size) || 13;
  const tbPad = Number(tb.pad);
  const tbOffset = Number(tb.offset) || 0;
  const tbAlign = TOPBAR_ALIGN.includes(tb.align) ? tb.align : "center";
  const langSize = Number(tb.langSize) || 12;
  const siteLanguage = ["bn", "en"].includes(p.siteLanguage) ? p.siteLanguage : "auto";
  const langBtnHtml = siteLanguage === "auto" && tb.langShow
    ? '<button type="button" class="lang-btn" data-lang-toggle>EN</button>'
    : "";

  // Website notes: on/off toggle (ডিফল্ট চালু), লেখা থাকলেই দেখাবে
  const bulkNoteHtml = (notes.note_bulk_on !== "0" && (notes.note_bulk_bn || notes.note_bulk_en))
    ? biHtml(notes.note_bulk_bn, notes.note_bulk_en) : "";
  const couponNoteHtml = (notes.note_coupon_on !== "0" && (notes.note_coupon_bn || notes.note_coupon_en))
    ? biHtml(notes.note_coupon_bn, notes.note_coupon_en) : "";

  const trustHtml = p.trust.map((it) =>
    `<div><b>${escHtml(it.icon)}</b>${biHtml(it.bn, it.en)}</div>`
  ).join("");
  const faqHtml = p.faqs.map((f) =>
    `<details><summary>${biHtml(f.qbn, f.qen)}</summary><p>${biHtml(f.abn, f.aen)}</p></details>`
  ).join("");
  const noticesHtml = p.notices.filter((n) => n.on).map(noticeHtml).join("");

  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="description" content="${title}">
  <title>${title}</title>
  <style>
    :root { --brand: #047857; --brand-2: #059669; --brand-soft: #ecfdf5; --brand-line: #a7f3d0; --brand-ink: #065f46; --accent: #dc2626; --ink: #0f172a; --muted: #64748b; --line: #e2e8f0; --bg: #f1f5f9; }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, 'Noto Sans Bengali', sans-serif; }
    html { scroll-behavior: smooth; }
    body { background: var(--bg); color: var(--ink); -webkit-font-smoothing: antialiased; }
    button, input, textarea, select { font: inherit; color: inherit; }
    .hidden { display: none !important; }
    html[lang="en"] .l-bn { display: none; }
    html[lang="bn"] .l-en { display: none; }
    .page { max-width: 520px; margin: 0 auto; background: #fff; min-height: 100vh; padding-bottom: 110px; box-shadow: 0 0 30px rgba(15,23,42,.06); }

    .topbar { background: linear-gradient(90deg, #064e3b, #0f766e); color: #fff; display: flex; align-items: center; justify-content: center; padding: ${tbPad}px 56px; position: sticky; top: 0; z-index: 50; }
    .tb-text { flex: 1; min-width: 0; text-align: ${tbAlign}; font-size: ${tbSize}px; font-weight: 700; line-height: 1.4; white-space: pre-line; word-break: break-word; transform: translateX(${tbOffset}px); }
    .lang-btn { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); border: 1px solid rgba(255,255,255,.35); background: rgba(255,255,255,.12); color: #fff; padding: 6px 11px; border-radius: 999px; font-size: ${langSize}px; font-weight: 800; cursor: pointer; letter-spacing: .5px; }

    .gallery { position: relative; background: #f8fafc; overflow: hidden; }
    .gallery img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .gallery.auto img { height: auto; max-height: 600px; object-fit: contain; }
    .off-badge { position: absolute; background: var(--accent); color: #fff; padding: 6px 12px; border-radius: 999px; font-size: 13px; font-weight: 800; box-shadow: 0 6px 16px rgba(220,38,38,.35); z-index: 2; }
    .pos-tl { top: 14px; left: 14px; }
    .pos-tr { top: 14px; right: 14px; }
    .pos-bl { bottom: 14px; left: 14px; }
    .pos-br { bottom: 14px; right: 14px; }
    .thumbs { display: flex; gap: 8px; padding: 12px 14px; overflow-x: auto; scrollbar-width: none; border-bottom: 1px solid var(--line); }
    .thumbs::-webkit-scrollbar { display: none; }
    .thumbs img { width: 60px; height: 60px; object-fit: cover; border-radius: 10px; border: 2px solid transparent; cursor: pointer; flex-shrink: 0; background: #fff; }
    .thumbs img.active { border-color: var(--brand); }

    .content { padding: 18px 16px 8px; }
    .title { font-size: 22px; font-weight: 800; line-height: 1.35; letter-spacing: -.2px; margin-bottom: 12px; }
    .price-row { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 14px; }
    .price { font-size: 30px; font-weight: 900; color: var(--brand); letter-spacing: -.5px; }
    .old-price { font-size: 16px; color: #94a3b8; text-decoration: line-through; }
    .stock-tag { padding: 5px 10px; border-radius: 8px; font-size: 12.5px; font-weight: 800; background: ${isOut ? "#fee2e2" : "#dcfce7"}; color: ${isOut ? "#dc2626" : "#15803d"}; }

    .trust { display: grid; grid-template-columns: repeat(auto-fit, minmax(0, 1fr)); gap: 8px; margin: 6px 0 16px; }
    .trust div { background: var(--brand-soft); border: 1px solid var(--brand-line); border-radius: 12px; padding: 10px 6px; text-align: center; font-size: 12px; font-weight: 700; color: var(--brand-ink); }
    .trust b { display: block; font-size: 18px; margin-bottom: 2px; }
    .trust .l-bn, .trust .l-en { display: block; }

    .card { border: 1px solid var(--line); border-radius: 14px; padding: 14px; margin-bottom: 12px; background: #fff; }
    .card h3 { font-size: 15px; margin-bottom: 8px; color: #1e293b; }
    .desc { font-size: 15px; line-height: 1.7; color: #475569; white-space: pre-line; }

    .notice { border: 1px solid var(--line); border-radius: 14px; padding: 14px 16px; margin-bottom: 12px; background: #fff; }
    .notice-img { display: block; width: 100%; max-height: 260px; object-fit: contain; border-radius: 10px; margin-bottom: 10px; background: #f8fafc; }
    .notice-h { line-height: 1.35; margin-bottom: 6px; }
    .notice-b { line-height: 1.7; white-space: pre-line; }
    .notice .l-bn, .notice .l-en { display: inline; }

    details { border-bottom: 1px dashed var(--line); padding: 12px 0; }
    details:last-child { border-bottom: none; }
    summary { cursor: pointer; font-weight: 700; font-size: 15px; list-style: none; display: flex; justify-content: space-between; align-items: center; gap: 10px; }
    summary::-webkit-details-marker { display: none; }
    summary::after { content: "+"; font-size: 20px; color: var(--brand); font-weight: 800; }
    details[open] summary::after { content: "–"; }
    details p { margin-top: 8px; font-size: 14px; line-height: 1.6; color: #475569; }

    .contact-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 6px 0 12px; }
    .act-btn { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 13px 10px; border-radius: 12px; font-size: 14px; font-weight: 800; text-decoration: none; color: #fff; }
    .call-btn { background: #0284c7; }
    .wa-btn { background: #16a34a; }

    .sticky-bar { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 520px; background: rgba(255,255,255,.96); backdrop-filter: blur(8px); padding: 10px 14px calc(10px + env(safe-area-inset-bottom, 0px)); box-shadow: 0 -8px 24px rgba(15,23,42,.08); border-top: 1px solid var(--line); z-index: 900; display: flex; align-items: center; gap: 12px; }
    .sticky-price { flex: 1; min-width: 0; }
    .sticky-price strong { display: block; font-size: 20px; color: var(--brand); font-weight: 900; }
    .sticky-price small { color: var(--muted); font-size: 12px; }
    .open-btn { flex: 1.2; padding: 15px; background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; border: none; border-radius: 14px; font-size: 16px; font-weight: 800; cursor: pointer; box-shadow: 0 10px 24px rgba(220,38,38,.3); }
    .open-btn:disabled { background: #94a3b8; box-shadow: none; cursor: not-allowed; }

    .modal { position: fixed; inset: 0; background: rgba(15,23,42,.6); display: flex; align-items: flex-end; justify-content: center; z-index: 1000; }
    @media (min-width: 640px) { .modal { align-items: center; } .modal-box { border-radius: 20px !important; } }
    .modal-box { background: #fff; width: 100%; max-width: 520px; max-height: 92vh; overflow-y: auto; border-radius: 22px 22px 0 0; padding: 20px 18px calc(22px + env(safe-area-inset-bottom, 0px)); position: relative; }
    .modal-close { position: absolute; top: 12px; right: 12px; border: none; background: #e2e8f0; width: 34px; height: 34px; border-radius: 50%; font-size: 15px; cursor: pointer; }
    .order-title { font-size: 18px; font-weight: 800; text-align: center; color: var(--brand); margin: 4px 0 16px; padding-right: 30px; }
    .field { margin-bottom: 14px; }
    .field label.lbl { display: block; font-size: 13.5px; font-weight: 700; margin-bottom: 6px; color: #334155; }
    .field input[type="text"], .field input[type="tel"], .field textarea { width: 100%; padding: 12px 14px; border: 1.5px solid #cbd5e1; border-radius: 12px; font-size: 15px; outline: none; background: #fff; }
    .field input:focus, .field textarea:focus { border-color: var(--brand-2); box-shadow: 0 0 0 4px rgba(5,150,105,.12); }
    .variant-group { display: flex; flex-wrap: wrap; gap: 8px; }
    .var-chip { border: 1.5px solid #cbd5e1; background: #f8fafc; padding: 9px 14px; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; }
    .var-chip.active { border-color: var(--brand); background: var(--brand-soft); color: var(--brand-ink); }
    .var-chip input { accent-color: var(--brand); }
    .var-chip.oos { opacity: .45; text-decoration: line-through; cursor: not-allowed; }
    .delivery-options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .del-card { border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 11px 12px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; background: #f8fafc; }
    .del-card.active { border-color: var(--brand); background: var(--brand-soft); color: var(--brand-ink); }
    .del-card input { accent-color: var(--brand); width: 16px; height: 16px; }
    .qty-box { display: flex; align-items: center; justify-content: space-between; background: #f8fafc; padding: 10px 14px; border-radius: 12px; border: 1px solid var(--line); margin-bottom: 8px; }
    .qty-controls { display: flex; align-items: center; gap: 12px; }
    .qty-btn { width: 36px; height: 36px; border: none; background: var(--brand); color: #fff; font-size: 18px; font-weight: 800; border-radius: 10px; cursor: pointer; }
    .qty-val { font-size: 17px; font-weight: 800; min-width: 24px; text-align: center; }
    .summary { background: var(--brand-soft); padding: 12px 14px; border-radius: 12px; margin-bottom: 16px; border: 1px solid var(--brand-line); }
    .sum-row { display: flex; justify-content: space-between; font-size: 14px; color: #334155; margin-bottom: 6px; font-weight: 600; }
    .sum-total { display: flex; justify-content: space-between; font-size: 17px; font-weight: 900; color: var(--brand-ink); border-top: 1px dashed var(--brand-line); padding-top: 8px; margin-top: 4px; }
    .submit-btn { width: 100%; padding: 15px; background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; border: none; border-radius: 14px; font-size: 17px; font-weight: 800; cursor: pointer; box-shadow: 0 10px 24px rgba(220,38,38,.3); }
    .submit-btn:disabled { background: #94a3b8; box-shadow: none; cursor: not-allowed; }
    .hint { font-size: 13px; color: #b45309; background: #fef3c7; padding: 9px 12px; border-radius: 10px; margin-top: 10px; text-align: center; font-weight: 700; }
    .lnotice { position: fixed; left: 50%; top: 18px; transform: translate(-50%, -16px); background: #7f1d1d; color: #fff; padding: 12px 18px; border-radius: 14px; font-weight: 700; font-size: 14px; line-height: 1.5; box-shadow: 0 14px 34px rgba(0,0,0,.25); opacity: 0; transition: opacity .25s, transform .25s; z-index: 3000; max-width: 92vw; width: max-content; text-align: center; }
    .lnotice.show { opacity: 1; transform: translate(-50%, 0); }

    .coupon-box { margin-bottom: 12px; }
    .coupon-box input { width: 100%; padding: 12px 14px; border: 1.5px dashed var(--brand-line); border-radius: 12px; font-size: 15px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; outline: none; background: var(--brand-soft); margin-top: 6px; }
    .coupon-box input:focus { border-color: var(--brand-2); }
    .coupon-msg { font-size: 13px; font-weight: 700; margin-top: 6px; min-height: 16px; color: #64748b; }
    .coupon-msg.ok { color: #15803d; }
    .coupon-msg.err { color: #b91c1c; }
    .plain-note { font-size: 13px; font-weight: 700; line-height: 1.6; color: var(--brand-ink); text-align: center; white-space: pre-line; margin: 6px 2px 12px; }
    .plain-note.hidden { display: none !important; }
    .sum-row.good { color: #15803d; }
    .units-summary { font-size: 13px; font-weight: 800; color: var(--brand-ink); background: var(--brand-soft); border: 1px dashed var(--brand-line); border-radius: 10px; padding: 8px 12px; margin: 0 0 12px; }
    .same-row { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 14px; margin-bottom: 12px; }
    .unit-row { display: grid; grid-template-columns: 90px 1fr; gap: 10px; align-items: center; border: 1px solid var(--line); border-radius: 12px; padding: 10px; margin-bottom: 10px; }
    .unit-no { font-weight: 800; font-size: 14px; color: #334155; }
    .unit-pick { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .unit-sel { width: 100%; padding: 10px; border: 1.5px solid #cbd5e1; border-radius: 10px; font-size: 14px; background: #fff; }
    .unit-sel:disabled { background: #f1f5f9; color: #94a3b8; }

    /* Success — ফর্মের সাথে একই সবুজ রঙের থিম */
    .success-msg { text-align: center; padding: 24px 18px; background: var(--brand-soft); border: 1px solid var(--brand-line); border-radius: 18px; color: var(--brand-ink); }
    .ok-badge { width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 10px; background: linear-gradient(135deg, #34d399, var(--brand)); color: #fff; font-size: 30px; font-weight: 900; display: grid; place-items: center; box-shadow: 0 10px 24px rgba(4,120,87,.3); }
    .success-text { font-size: 15px; font-weight: 700; line-height: 1.8; white-space: pre-line; }
    .oid-row { display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; margin: 14px 0 4px; font-size: 13px; }
    .oid-chip { font-family: ui-monospace, Menlo, Consolas, monospace; font-weight: 800; background: #fff; border: 1.5px dashed var(--brand); padding: 5px 12px; border-radius: 8px; letter-spacing: .5px; color: var(--brand-ink); }
    .copy-btn { border: none; background: var(--brand); color: #fff; font-weight: 800; font-size: 12px; padding: 7px 12px; border-radius: 9px; cursor: pointer; white-space: nowrap; }
    .reward { margin-top: 16px; border: 1.5px dashed var(--brand-2); background: #fff; border-radius: 14px; padding: 14px; color: var(--brand-ink); }
    .reward-title { font-size: 15px; font-weight: 900; margin-bottom: 10px; }
    .reward-code { display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap; }
    .reward-code span { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 21px; font-weight: 900; letter-spacing: 2px; background: var(--brand-soft); padding: 8px 14px; border-radius: 10px; color: var(--brand-ink); }
    .reward-note { font-size: 12.5px; margin-top: 10px; line-height: 1.6; }
    .back-btn { margin-top: 16px; width: 100%; padding: 13px; border: none; border-radius: 14px; background: var(--brand); color: #fff; font-size: 15px; font-weight: 800; cursor: pointer; }

    /* Mobile/tablet usability: avoid iOS input zoom and provide comfortable touch targets. */
    @media (max-width: 640px) {
      .field input[type="text"], .field input[type="tel"], .field textarea,
      .coupon-box input, .unit-sel { min-height:44px; font-size:16px; }
      .field textarea { min-height:88px; }
      .qty-btn { width:44px; height:44px; }
      .act-btn, .open-btn, .submit-btn, .back-btn { min-height:46px; }
      .var-chip, .del-card { min-height:44px; }
      .modal-box { max-height:92dvh; }
      .page { padding-bottom:calc(112px + env(safe-area-inset-bottom, 0px)); }
    }
    @media (max-width: 360px) {
      .content { padding-left:12px; padding-right:12px; }
      .contact-row { grid-template-columns:1fr; }
      .unit-row { grid-template-columns:1fr; gap:7px; }
      .unit-pick { grid-template-columns:1fr 1fr; }
      .price { font-size:27px; }
      .modal-box { padding-left:12px; padding-right:12px; }
    }
  </style>
</head>
<body>
  <div class="page">
    <header class="topbar">
      <div class="tb-text">${biHtml(tb.bn, tb.en)}</div>
      ${langBtnHtml}
    </header>

    <div ${galleryAttr}>
      <img id="mainProductImg" src="${mainImg}" alt="${title}">
      ${oldPrice > price ? `<span class="off-badge pos-${p.badge_pos}"><span data-i18n="off">${L("off")}</span> ৳${oldPrice - price}</span>` : ""}
    </div>
    ${p.images.length > 1 ? `
    <div class="thumbs" id="thumbs">
      ${p.images.map((src, i) => `<img src="${escHtml(src)}" data-idx="${i}" class="${i === 0 ? "active" : ""}" alt="">`).join("")}
    </div>` : ""}

    <div class="content">
      <h1 class="title">${title}</h1>
      <div class="price-row">
        <span class="price">৳${price}</span>
        ${oldPrice > price ? `<span class="old-price">৳${oldPrice}</span>` : ""}
        <span class="stock-tag" data-i18n="${isOut ? "out_stock" : "in_stock"}">${L(isOut ? "out_stock" : "in_stock")}</span>
      </div>

      ${p.trust.length ? `<div class="trust">${trustHtml}</div>` : ""}

      <div class="contact-row">
        <a href="tel:${callPhone}" class="act-btn call-btn" data-i18n="call">${L("call")}</a>
        <a href="https://wa.me/${waNumber}?text=${waMsg}" target="_blank" rel="noopener noreferrer" class="act-btn wa-btn" data-i18n="wa">${L("wa")}</a>
      </div>

      <div class="card">
        <h3 data-i18n="about_title">${L("about_title")}</h3>
        <div class="desc">${escHtml(p.description)}</div>
      </div>

      ${noticesHtml}

      ${p.faqs.length ? `
      <div class="card">
        <h3 data-i18n="faq_title">${L("faq_title")}</h3>
        ${faqHtml}
      </div>` : ""}
    </div>
  </div>

  <div class="sticky-bar" id="stickyBar">
    <div class="sticky-price">
      <strong>৳${price}</strong>
      <small data-i18n="delivery_note">${L("delivery_note")}</small>
    </div>
    <button type="button" class="open-btn" id="openOrderBtn" data-i18n="buy_now" ${isOut ? "disabled" : ""}>${L("buy_now")}</button>
  </div>

  <div class="modal hidden" id="orderModal">
    <div class="modal-box">
      <button type="button" class="modal-close" id="closeModal" aria-label="close">✕</button>
      <div class="order-title" id="formTitle" data-i18n="form_title">${L("form_title")}</div>

      <form id="orderForm">
        <div class="field">
          <label class="lbl" for="name" data-i18n="l_name">${L("l_name")}</label>
          <input type="text" id="name" required maxlength="100" data-i18n-ph="ph_name" placeholder="${L("ph_name")}">
        </div>
        <div class="field">
          <label class="lbl" for="phone" data-i18n="l_phone">${L("l_phone")}</label>
          <input type="tel" id="phone" required placeholder="01XXXXXXXXX" pattern="01[3-9][0-9]{8}">
        </div>
        <div class="field">
          <label class="lbl" for="address" data-i18n="l_address">${L("l_address")}</label>
          <textarea id="address" rows="2" required maxlength="500" data-i18n-ph="ph_address" placeholder="${L("ph_address")}"></textarea>
        </div>

        ${colorList.length > 0 ? `
        <div class="field">
          <label class="lbl" data-i18n="l_color">${L("l_color")}</label>
          <div class="variant-group" id="colorGroup">
            ${colorList.map((c) => `<label class="var-chip"><input type="radio" name="color" value="${escHtml(c)}" required> ${escHtml(c)}</label>`).join("")}
          </div>
        </div>` : ""}

        ${sizeList.length > 0 ? `
        <div class="field">
          <label class="lbl" data-i18n="l_size">${L("l_size")}</label>
          <div class="variant-group" id="sizeGroup">
            ${sizeList.map((s) => `<label class="var-chip"><input type="radio" name="size" value="${escHtml(s)}" required> ${escHtml(s)}</label>`).join("")}
          </div>
        </div>` : ""}

        <div class="field">
          <label class="lbl" data-i18n="l_area">${L("l_area")}</label>
          <div class="delivery-options">
            <label class="del-card" id="cardInside">
              <input type="radio" name="area" id="radioInside" value="inside">
              <div><span data-i18n="area_in">${L("area_in")}</span><br><span style="color:var(--brand);">৳${delInside}</span></div>
            </label>
            <label class="del-card" id="cardOutside">
              <input type="radio" name="area" id="radioOutside" value="outside">
              <div><span data-i18n="area_out">${L("area_out")}</span><br><span style="color:var(--brand);">৳${delOutside}</span></div>
            </label>
          </div>
        </div>

        <div class="qty-box">
          <span style="font-weight:700; font-size:14px;" data-i18n="l_qty">${L("l_qty")}</span>
          <div class="qty-controls">
            <button type="button" class="qty-btn" id="qtyMinus">-</button>
            <span class="qty-val" id="qtyDisplay">1</span>
            <button type="button" class="qty-btn" id="qtyPlus">+</button>
          </div>
        </div>
        <div class="plain-note${bulkNoteHtml ? "" : " hidden"}" id="bulkNote" data-custom="${bulkNoteHtml ? "1" : "0"}">${bulkNoteHtml}</div>

        <div class="units-summary hidden" id="unitsSummary"></div>

        <div class="coupon-box">
          <label class="lbl" for="coupon" data-i18n="coupon_label">${L("coupon_label")}</label>
          <input type="text" id="coupon" maxlength="40" autocomplete="off" autocapitalize="characters" data-i18n-ph="coupon_ph" placeholder="${L("coupon_ph")}">
          <div class="coupon-msg" id="couponMsg"></div>
        </div>
        <div class="plain-note${couponNoteHtml ? "" : " hidden"}" id="couponNote">${couponNoteHtml}</div>

        <div class="summary">
          <div class="sum-row"><span data-i18n="l_subtotal">${L("l_subtotal")}</span><span id="subTotal">৳${price}</span></div>
          <div class="sum-row good hidden" id="bulkRow"><span id="bulkLabel"></span><span id="bulkAmt"></span></div>
          <div class="sum-row good hidden" id="couponRow"><span id="couponLabel"></span><span id="couponAmt"></span></div>
          <div class="sum-row"><span data-i18n="l_delivery">${L("l_delivery")}</span><span id="delChargeDisplay" data-i18n="select_first">${L("select_first")}</span></div>
          <div class="sum-total"><span data-i18n="l_total">${L("l_total")}</span><span id="totalPrice">৳${price} <span data-i18n="plus_delivery">${L("plus_delivery")}</span></span></div>
        </div>

        <button type="submit" class="submit-btn" id="submitBtn" disabled data-i18n="submit">${L("submit")}</button>
        <div class="hint" id="formHint" data-i18n="hint">${L("hint")}</div>
      </form>

      <div class="success-msg hidden" id="successMsg">
        <div class="ok-badge">✓</div>
        <div class="success-text" id="successText"></div>
        <div class="oid-row"><span class="lbl" data-i18n="oid_label">${L("oid_label")}</span><span class="oid-chip" id="oidChip"></span><button type="button" class="copy-btn" id="copyOid" data-i18n="copy_btn">${L("copy_btn")}</button></div>
        <div class="reward hidden" id="rewardBox">
          <div class="reward-title" data-i18n="reward_title">${L("reward_title")}</div>
          <div class="reward-code"><span id="rewardCode"></span><button type="button" class="copy-btn" id="copyReward" data-i18n="copy_btn">${L("copy_btn")}</button></div>
          <div class="reward-note" id="rewardNote"></div>
        </div>
        <div class="reward hidden" id="giveBox">
          <div class="reward-title" data-i18n="give_title">${L("give_title")}</div>
          <div class="reward-code"><span id="giveCode"></span><button type="button" class="copy-btn" id="copyGive" data-i18n="copy_btn">${L("copy_btn")}</button></div>
          <div class="reward-note" id="giveNote" style="white-space:pre-line;"></div>
        </div>
        <button type="button" class="back-btn" id="backToProduct" data-i18n="back_product">${L("back_product")}</button>
      </div>
    </div>
  </div>

  <div class="modal hidden" id="unitsModal" style="z-index:1100">
    <div class="modal-box units-box">
      <button type="button" class="modal-close" id="unitsClose" aria-label="close">✕</button>
      <div class="order-title" data-i18n="unit_title">${L("unit_title")}</div>
      <label class="same-row"><input type="checkbox" id="unitsSame"> <span data-i18n="unit_same">${L("unit_same")}</span></label>
      <div id="unitsRows"></div>
      <button type="button" class="submit-btn" id="unitsOk" data-i18n="unit_ok">${L("unit_ok")}</button>
    </div>
  </div>

  <script nonce="${nonce}">
    const DICT = ${dict};
    // auto mode lets visitors choose; forced mode follows the admin setting.
    const SITE_LANGUAGE = ${JSON.stringify(siteLanguage)};
    let LANG = SITE_LANGUAGE === 'auto' ? 'bn' : SITE_LANGUAGE;
    if (SITE_LANGUAGE === 'auto') {
      try { if (localStorage.getItem('site_lang') === 'en') LANG = 'en'; } catch (e) {}
    }

    const T = (key, vars) => {
      let s = (DICT[LANG] && DICT[LANG][key]) || DICT.bn[key] || key;
      if (vars) Object.keys(vars).forEach((k) => { s = s.split('{' + k + '}').join(vars[k]); });
      return s;
    };

    const unitPrice = ${price};
    const maxStock = ${stock};
    const chargeInside = ${delInside};
    const chargeOutside = ${delOutside};
    let qty = 1;
    let selectedArea = null;

    const $ = (id) => document.getElementById(id);

    function notify(msg) {
      const el = document.createElement('div');
      el.className = 'lnotice';
      el.textContent = msg;
      document.body.appendChild(el);
      requestAnimationFrame(() => el.classList.add('show'));
      setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 3400);
    }
    const form = $('orderForm');
    const submitBtn = $('submitBtn');

    function applyLang() {
      document.documentElement.lang = LANG;
      document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = T(el.getAttribute('data-i18n')); });
      document.querySelectorAll('[data-i18n-ph]').forEach((el) => { el.placeholder = T(el.getAttribute('data-i18n-ph')); });
      document.querySelectorAll('[data-lang-toggle]').forEach((el) => { el.textContent = LANG === 'bn' ? 'EN' : 'বাং'; });
      renderSuccess();
      updateSummary();
      refreshSubmit();
    }

    const thumbs = $('thumbs');
    if (thumbs) {
      thumbs.querySelectorAll('img').forEach((img) => {
        img.addEventListener('click', () => {
          $('mainProductImg').src = img.src;
          thumbs.querySelectorAll('img').forEach((i) => i.classList.remove('active'));
          img.classList.add('active');
        });
      });
    }

    const VARIANTS = ${variantsJson};
    const HAS_COLORS = ${colorList.length > 0};
    const HAS_SIZES = ${sizeList.length > 0};

    function vqty(c, s) {
      const k = c + '|' + s;
      return Object.prototype.hasOwnProperty.call(VARIANTS, k) ? VARIANTS[k] : null;
    }
    function pickedColor() { const e = document.querySelector('input[name="color"]:checked'); return e ? e.value : ''; }
    function pickedSize() { const e = document.querySelector('input[name="size"]:checked'); return e ? e.value : ''; }

    function capQty() {
      const c = HAS_COLORS ? pickedColor() : '';
      const s = HAS_SIZES ? pickedSize() : '';
      if ((HAS_COLORS && !c) || (HAS_SIZES && !s)) return maxStock;
      const q = vqty(c, s);
      return q === null ? maxStock : Math.max(0, Math.min(maxStock, q));
    }

    function applyVariantRules() {
      const c = pickedColor();
      const s = pickedSize();
      if (HAS_SIZES) {
        document.querySelectorAll('input[name="size"]').forEach((inp) => {
          const q = vqty(HAS_COLORS ? c : '', inp.value);
          const out = q !== null && q <= 0;
          inp.disabled = out;
          inp.closest('.var-chip').classList.toggle('oos', out);
          if (out && inp.checked) inp.checked = false;
        });
      }
      if (HAS_COLORS) {
        document.querySelectorAll('input[name="color"]').forEach((inp) => {
          const q = vqty(inp.value, HAS_SIZES ? s : '');
          const out = q !== null && q <= 0;
          inp.disabled = out;
          inp.closest('.var-chip').classList.toggle('oos', out);
          if (out && inp.checked) inp.checked = false;
        });
      }
      document.querySelectorAll('.variant-group .var-chip').forEach((chip) => {
        chip.classList.toggle('active', chip.querySelector('input').checked);
      });
      const cap = capQty();
      if (qty > Math.max(1, cap)) qty = Math.max(1, cap);
      syncUnits();
      updateSummary();
      refreshSubmit();
    }

    document.querySelectorAll('.variant-group').forEach((group) => {
      group.addEventListener('change', applyVariantRules);
    });

    let orderLastId = '';
    let lastReward = null;
    let lastGive = null;

    function isModalOpen() {
      return !$('orderModal').classList.contains('hidden');
    }

    // অর্ডার শেষ হলে বা popup বন্ধ হলে ফর্ম সম্পূর্ণ খালি হয়ে পণ্যের পাতায় ফিরবে
    function resetSuccessUI() {
      orderLastId = '';
      form.reset();
      form.classList.remove('hidden');
      $('formTitle').classList.remove('hidden');
      $('successMsg').classList.add('hidden');
      lastReward = null;
      lastGive = null;
      $('rewardBox').classList.add('hidden');
      $('giveBox').classList.add('hidden');
      selectedArea = null;
      qty = 1;
      sameMode = false;
      units = [];
      $('cardInside').classList.remove('active');
      $('cardOutside').classList.remove('active');
      document.querySelectorAll('.var-chip').forEach((c) => c.classList.remove('active'));
      document.querySelectorAll('.var-chip input').forEach((i) => { i.checked = false; i.disabled = false; });
      document.querySelectorAll('.var-chip.oos').forEach((c) => c.classList.remove('oos'));
      submitBtn.textContent = T('submit');
      updateSummary();
      applyVariantRules();
    }

    function pickLang(bn, en) { return LANG === 'bn' ? (bn || en) : (en || bn); }

    function renderSuccess() {
      if (!orderLastId) return;
      $('successText').textContent = T('success');
      $('oidChip').textContent = orderLastId;
      if (lastReward) {
        $('rewardCode').textContent = lastReward.code;
        $('rewardNote').textContent = T('reward_note', { p: lastReward.percent, d: lastReward.days });
        $('rewardBox').classList.remove('hidden');
      } else {
        $('rewardBox').classList.add('hidden');
      }
      if (lastGive) {
        var msg = T('give_note', { p: lastGive.percent });
        if (lastGive.days > 0) msg += '\\n' + T('give_exp', { d: lastGive.days });
        $('giveCode').textContent = lastGive.code;
        $('giveNote').textContent = msg;
        $('giveBox').classList.remove('hidden');
      } else {
        $('giveBox').classList.add('hidden');
      }
    }

    function openModal() {
      $('orderModal').classList.remove('hidden');
      $('stickyBar').classList.add('hidden');
      if (!(history.state && history.state.orderModal)) history.pushState({ orderModal: true }, '');
      setTimeout(() => { if ($('successMsg').classList.contains('hidden')) $('name').focus(); }, 200);
    }

    function hideModalUI() {
      $('orderModal').classList.add('hidden');
      $('stickyBar').classList.remove('hidden');
      if (!$('successMsg').classList.contains('hidden')) resetSuccessUI();
    }

    function closeModal() {
      if (!isModalOpen()) return;
      hideModalUI();
      if (history.state && history.state.orderModal) history.back();
    }

    window.addEventListener('popstate', () => {
      if (isModalOpen()) hideModalUI();
    });

    $('openOrderBtn').addEventListener('click', openModal);
    $('closeModal').addEventListener('click', closeModal);
    $('backToProduct').addEventListener('click', closeModal);
    $('orderModal').addEventListener('click', (e) => {
      if (e.target.id === 'orderModal') closeModal();
    });

    let lastQuote = null;
    let quoteTimer = null;
    let quoteSeq = 0;

    function scheduleQuote() {
      clearTimeout(quoteTimer);
      quoteTimer = setTimeout(refreshQuote, 220);
    }

    async function refreshQuote() {
      const seq = ++quoteSeq;
      try {
        const res = await fetch('/api/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quantity: qty,
            area: selectedArea || '',
            coupon: $('coupon').value.trim(),
            phone: $('phone').value.replace(/\\D/g, '')
          })
        });
        const data = await res.json().catch(() => null);
        if (seq !== quoteSeq || !res.ok || !data) return;
        lastQuote = data;
        renderQuote(data);
      } catch (e) { /* নেটওয়ার্ক সমস্যা হলে আগের হিসাব থাকবে */ }
    }

    function renderQuote(d) {
      $('qtyDisplay').textContent = qty;
      $('subTotal').textContent = '৳' + d.subtotal;

      $('bulkRow').classList.toggle('hidden', !d.bulk);
      if (d.bulk) {
        $('bulkLabel').textContent = T('bulk_row', { n: d.bulkInfo.min });
        $('bulkAmt').textContent = '-৳' + d.bulk;
      }
      $('couponRow').classList.toggle('hidden', !d.coupon);
      if (d.coupon) {
        $('couponLabel').textContent = T('coupon_row', { p: d.coupon.percent });
        $('couponAmt').textContent = '-৳' + d.coupon.amount;
      }

      const msg = $('couponMsg');
      if (d.couponError) { msg.textContent = '⚠️ ' + d.couponError; msg.className = 'coupon-msg err'; }
      else if (d.coupon) { msg.textContent = '✅ ' + T('coupon_ok', { p: d.coupon.percent }); msg.className = 'coupon-msg ok'; }
      else if (d.couponPending) { msg.textContent = 'ℹ️ ' + T('coupon_pending'); msg.className = 'coupon-msg'; }
      else { msg.textContent = ''; msg.className = 'coupon-msg'; }

      if (!selectedArea) {
        $('delChargeDisplay').textContent = T('select_first');
        $('totalPrice').textContent = '৳' + d.total + ' ' + T('plus_delivery');
      } else {
        $('delChargeDisplay').textContent = '৳' + d.delivery;
        $('totalPrice').textContent = '৳' + d.total;
      }

      const bn = $('bulkNote');
      if (bn.dataset.custom === '1') { bn.classList.remove('hidden'); } else
      if (d.bulkInfo && d.bulkInfo.enabled) {
        const v = d.bulkInfo.type === 'fixed' ? '৳' + d.bulkInfo.value : d.bulkInfo.value + '%';
        bn.textContent = T('bulk_hint', { n: d.bulkInfo.min, v: v });
        bn.classList.remove('hidden');
      } else {
        bn.classList.add('hidden');
      }
    }

    function updateSummary() {
      if (lastQuote) renderQuote(lastQuote);
      else {
        $('qtyDisplay').textContent = qty;
        $('subTotal').textContent = '৳' + (qty * unitPrice);
      }
      scheduleQuote();
    }

    async function copyCode(text, btn) {
      const done = () => {
        btn.textContent = T('copied_btn');
        setTimeout(() => { btn.textContent = T('copy_btn'); }, 1600);
      };
      try {
        await navigator.clipboard.writeText(text);
        done();
      } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (err) { notify(text); }
        ta.remove();
      }
    }

    $('copyReward').addEventListener('click', () => copyCode($('rewardCode').textContent, $('copyReward')));
    $('copyGive').addEventListener('click', () => copyCode($('giveCode').textContent, $('copyGive')));
    $('copyOid').addEventListener('click', () => copyCode(orderLastId, $('copyOid')));
    $('coupon').addEventListener('input', scheduleQuote);

    function selectArea(area) {
      selectedArea = area;
      $('radioInside').checked = area === 'inside';
      $('radioOutside').checked = area === 'outside';
      $('cardInside').classList.toggle('active', area === 'inside');
      $('cardOutside').classList.toggle('active', area === 'outside');
      updateSummary();
      refreshSubmit();
    }

    $('radioInside').addEventListener('change', () => selectArea('inside'));
    $('radioOutside').addEventListener('change', () => selectArea('outside'));
    $('qtyMinus').addEventListener('click', () => changeQty(-1));
    $('qtyPlus').addEventListener('click', () => changeQty(1));

    // প্রতিটি পিসের কালার/সাইজ — ডিফল্টে "বাকি সব পিস প্রথমটির মতো" আনচেক থাকবে
    let units = [];
    let sameMode = false;
    const COLOR_LIST = ${colorsJson};
    const SIZE_LIST = ${sizesJson};

    function pickedMain() { return { color: pickedColor(), size: pickedSize() }; }

    function unitLabel(u) {
      return [HAS_COLORS ? u.color : '', HAS_SIZES ? u.size : ''].filter(Boolean).join(' / ');
    }

    function renderUnitsSummary() {
      const el = $('unitsSummary');
      if (qty < 2 || (!HAS_COLORS && !HAS_SIZES)) { el.classList.add('hidden'); return; }
      const count = {};
      units.forEach((u) => { const k = unitLabel(u); count[k] = (count[k] || 0) + 1; });
      el.textContent = T('units_label') + ': ' + Object.keys(count).map((k) => k + ' × ' + count[k]).join(', ');
      el.classList.remove('hidden');
    }

    function syncUnits() {
      const base = pickedMain();
      if (!units.length) units = [base];
      units[0] = base;
      while (units.length < qty) units.push(Object.assign({}, base));
      if (units.length > qty) units = units.slice(0, qty);
      if (sameMode) units = units.map(() => Object.assign({}, base));
      renderUnitsSummary();
    }

    function escJs(s) {
      return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    function optionsFor(list, sel, keyOf) {
      return list.map((v) => {
        const k = keyOf(v);
        const q = vqty(k.c, k.s);
        const dis = q !== null && q <= 0 ? ' disabled' : '';
        return '<option value="' + escJs(v) + '"' + (v === sel ? ' selected' : '') + dis + '>' + escJs(v) + '</option>';
      }).join('');
    }

    function renderUnitsModal() {
      $('unitsSame').checked = sameMode;
      let html = '';
      for (let i = 1; i < qty; i++) {
        const u = units[i] || pickedMain();
        html += '<div class="unit-row"><div class="unit-no">' + escJs(T('unit_item', { n: i + 1 })) + '</div><div class="unit-pick">';
        if (HAS_COLORS) {
          html += '<select class="unit-sel" data-unit="' + i + '" data-field="color"' + (sameMode ? ' disabled' : '') + '>' +
            optionsFor(COLOR_LIST, u.color, (v) => ({ c: v, s: HAS_SIZES ? u.size : '' })) + '</select>';
        }
        if (HAS_SIZES) {
          html += '<select class="unit-sel" data-unit="' + i + '" data-field="size"' + (sameMode ? ' disabled' : '') + '>' +
            optionsFor(SIZE_LIST, u.size, (v) => ({ c: HAS_COLORS ? u.color : '', s: v })) + '</select>';
        }
        html += '</div></div>';
      }
      $('unitsRows').innerHTML = html;
    }

    function openUnitsModal() {
      syncUnits();
      renderUnitsModal();
      $('unitsModal').classList.remove('hidden');
    }

    function closeUnitsModal() {
      $('unitsModal').classList.add('hidden');
      renderUnitsSummary();
    }

    function changeQty(delta) {
      if (maxStock <= 0) return;
      const next = Math.max(1, Math.min(capQty(), qty + delta));
      const increased = next > qty;
      qty = next;
      syncUnits();
      updateSummary();
      refreshSubmit();
      if (increased && qty > 1 && (HAS_COLORS || HAS_SIZES)) openUnitsModal();
    }

    $('unitsSame').addEventListener('change', () => {
      sameMode = $('unitsSame').checked;
      syncUnits();
      renderUnitsModal();
      refreshSubmit();
    });
    $('unitsRows').addEventListener('change', (e) => {
      const sel = e.target;
      const i = Number(sel.getAttribute('data-unit'));
      if (!units[i]) return;
      units[i][sel.getAttribute('data-field')] = sel.value;
      renderUnitsSummary();
      refreshSubmit();
    });
    $('unitsOk').addEventListener('click', closeUnitsModal);
    $('unitsClose').addEventListener('click', closeUnitsModal);

    function isFormValid() {
      if (maxStock <= 0 || capQty() < 1) return false;
      const name = $('name').value.trim();
      const phone = $('phone').value.replace(/[\\s-]/g, '');
      const address = $('address').value.trim();
      if (name.length < 2) return false;
      if (!/^01[3-9][0-9]{8}$/.test(phone)) return false;
      if (address.length < 5) return false;
      if ($('colorGroup') && !document.querySelector('input[name="color"]:checked')) return false;
      if ($('sizeGroup') && !document.querySelector('input[name="size"]:checked')) return false;
      if (!selectedArea) return false;
      if (units.length !== qty) return false;
      for (const u of units) {
        if (HAS_COLORS && !u.color) return false;
        if (HAS_SIZES && !u.size) return false;
      }
      return true;
    }

    function refreshSubmit() {
      const ok = isFormValid();
      submitBtn.disabled = !ok;
      $('formHint').classList.toggle('hidden', ok);
    }

    form.addEventListener('input', refreshSubmit);
    form.addEventListener('input', scheduleQuote);
    form.addEventListener('change', refreshSubmit);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!isFormValid()) { refreshSubmit(); return; }

      const colorEl = document.querySelector('input[name="color"]:checked');
      const sizeEl = document.querySelector('input[name="size"]:checked');

      const payload = {
        name: $('name').value.trim(),
        phone: $('phone').value.trim(),
        address: $('address').value.trim(),
        color: colorEl ? colorEl.value : '',
        size: sizeEl ? sizeEl.value : '',
        area: selectedArea,
        quantity: qty,
        coupon: $('coupon').value.trim(),
        items: units.map((u) => ({ color: u.color || '', size: u.size || '' }))
      };

      submitBtn.disabled = true;
      submitBtn.textContent = T('submitting');

      try {
        const res = await fetch('/api/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok && data.success) {
          form.classList.add('hidden');
          $('formTitle').classList.add('hidden');
          orderLastId = data.orderId || '';
          lastReward = data.reward || null;
          lastGive = data.giveaway || null;
          renderSuccess();
          $('successMsg').classList.remove('hidden');
          return;
        }
        notify(data.error || T('net_error'));
      } catch (err) {
        notify(T('net_error'));
      }
      submitBtn.textContent = T('submit');
      refreshSubmit();
    });

    document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        LANG = LANG === 'bn' ? 'en' : 'bn';
        try { localStorage.setItem('site_lang', LANG); } catch (e) {}
        applyLang();
      });
    });

    applyLang();
    applyVariantRules();
    refreshQuote();
  </script>
</body>
</html>`;
}

/* ============================================================
   Inactive (প্রোডাক্ট বন্ধ) page
   ============================================================ */

function renderInactiveHTML() {
  return `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>FiamaFashion</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:'Segoe UI',Roboto,'Noto Sans Bengali',sans-serif;background:#f1f5f9;color:#0f172a;padding:20px;text-align:center}.box{background:#fff;padding:28px 22px;border-radius:18px;max-width:380px;box-shadow:0 10px 30px rgba(0,0,0,.06)}h1{font-size:20px;margin-bottom:10px}p{color:#475569;line-height:1.7;font-size:15px}</style></head><body><div class="box"><h1>এই মুহূর্তে প্রোডাক্টটি পাওয়া যাচ্ছে না</h1><p>শীঘ্রই আবার চালু হবে।<br>Currently unavailable. Please check back soon.</p></div></body></html>`;
}

/* ============================================================
   Admin Page
   এই HTML-এর script-এ backtick নেই (server interpolation ছাড়া)।
   inline onclick নেই, সব event delegation দিয়ে (CSP nonce-সহ নিরাপদ)।
   ============================================================ */

function renderAdminHTML(nonce) {
  const adminDict = buildDictJson(ADMIN_STRINGS);
  const tbDefaults = JSON.stringify({
    bn: LANDING_STRINGS.topbar[0],
    en: LANDING_STRINGS.topbar[1]
  }).replace(/</g, "\\u003c");
  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="robots" content="noindex,nofollow">
  <meta name="theme-color" content="#065f46">
  <title>Admin Panel</title>
  <style>
    :root {
      --bg: #f3f6fb; --card: #ffffff; --text: #0f172a; --muted: #64748b; --line: #e2e8f0;
      --brand: #047857; --brand-2: #059669; --danger: #dc2626;
      --shadow: 0 8px 24px rgba(15,23,42,.07); --r: 16px; --input: #ffffff; --chip: #f1f5f9;
    }
    :root[data-theme="dark"] {
      --bg: #0b1220; --card: #121b2e; --text: #e2e8f0; --muted: #94a3b8; --line: #1f2b45;
      --shadow: none; --input: #0e1729; --chip: #1a2540;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, 'Noto Sans Bengali', sans-serif; }
    html, body { overscroll-behavior-y: contain; scrollbar-width:none; }
    html::-webkit-scrollbar, body::-webkit-scrollbar { width:0 !important; height:0 !important; display:none !important; }
    body { background: var(--bg); color: var(--text); font-size: 15px; -webkit-font-smoothing: antialiased; min-height: 100vh; }
    button, select, input, textarea { font: inherit; color: inherit; }
    .hidden { display: none !important; }
    .muted { color: var(--muted); font-size: 13px; }
    .empty { text-align: center; padding: 34px 10px; color: var(--muted); }

    /* ---- Login ---- */
    .login-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; background: radial-gradient(1000px 600px at 8% -10%, var(--login-a, #f08a91) 0%, transparent 62%), radial-gradient(900px 520px at 110% 110%, var(--login-b, #f7b0a7) 0%, transparent 58%), linear-gradient(135deg, var(--login-c, #713f52), #30283f); position: relative; transition: background .35s ease; }
    .login-card { width: 100%; max-width: 380px; background: #ffffff; color: #0f172a; border-radius: 22px; padding: 28px 24px; box-shadow: 0 30px 80px rgba(0,0,0,.35); }
    .login-card .input { color: #0f172a; }
    .login-logo { width: 56px; height: 56px; border-radius: 16px; display: grid; place-items: center; font-size: 26px; background: linear-gradient(135deg, #059669, #0ea5e9); margin: 0 auto 14px; }
    .login-card h1 { text-align: center; font-size: 20px; margin-bottom: 4px; }
    .login-card .sub { text-align: center; color: #64748b; font-size: 13px; margin-bottom: 20px; }
    .login-error { color: #b91c1c; font-weight: 700; font-size: 13px; min-height: 18px; margin-top: 10px; text-align: center; }
    .login-lang { position: absolute; top: 16px; right: 16px; }

    /* ---- Shell ---- */
    .topbar { position: sticky; top: 0; z-index: 50; background: linear-gradient(120deg, #064e3b, #0f766e); color: #fff; padding: calc(env(safe-area-inset-top, 0px) + 10px) 12px 10px; display: flex; align-items: center; justify-content: space-between; gap: 8px; box-shadow: 0 6px 20px rgba(2,44,34,.25); }
    .brand { display: flex; align-items: center; gap: 10px; font-weight: 800; min-width: 0; }
    .brand .dot { flex-shrink: 0; width: 34px; height: 34px; border-radius: 11px; background: rgba(255,255,255,.18); display: grid; place-items: center; font-size: 17px; }
    .brand .name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .header-clock { display:flex; flex-direction:column; align-items:flex-end; justify-content:center; min-width:0; color:rgba(255,255,255,.96); line-height:1.25; font-variant-numeric:tabular-nums; white-space:nowrap; padding:7px 12px; border:1px solid rgba(255,255,255,.2); border-radius:13px; background:rgba(255,255,255,.12); box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 5px 16px rgba(0,0,0,.12); backdrop-filter:blur(12px); }
    .header-clock .clock-time { font-size:16px; font-weight:900; letter-spacing:.6px; }
    .header-clock .clock-date { font-size:10px; opacity:.88; }
    .header-clock.theme-neon { color:#a7f3d0; border-color:rgba(52,211,153,.42); background:rgba(6,78,59,.72); text-shadow:0 0 12px rgba(52,211,153,.7); }
    .header-clock.theme-classic { border-radius:7px; background:#fff7ed; color:#7c2d12; border-color:#fed7aa; box-shadow:none; }
    .header-clock.theme-minimal { background:transparent; border-color:transparent; box-shadow:none; backdrop-filter:none; }
    .header-clock.theme-midnight { background:linear-gradient(135deg,#111827,#312e81); border-color:rgba(165,180,252,.35); color:#e0e7ff; }
    details.card.settings-accordion { box-sizing:border-box; min-height:0 !important; padding:0 !important; margin:0 0 12px !important; overflow:hidden; border:1px solid var(--line); border-radius:14px; background:var(--card); }
    /* Settings top-level cards: match all four outer white boxes exactly */
    #v-settings > .settings-security-card,
    #v-settings > details.card.settings-accordion { box-sizing:border-box !important; height:84px !important; min-height:84px !important; padding:0 !important; margin:0 0 12px !important; border:1px solid var(--line) !important; border-radius:22px !important; background:var(--card) !important; overflow:hidden !important; }
    #v-settings > .settings-security-card { display:flex; align-items:center; }
    #v-settings > .settings-security-card > .acc-head { box-sizing:border-box; height:82px; min-height:82px; padding:0 30px; }
    #v-settings > details.card.settings-accordion:not([open]) { height:84px !important; }
    #v-settings > details.card.settings-accordion > summary { box-sizing:border-box !important; height:82px !important; min-height:82px !important; padding:0 30px !important; margin:0 !important; }
    details.card.settings-accordion:not([open]) { height:80px !important; }
    details.card.settings-accordion > summary { box-sizing:border-box; list-style:none; display:flex; align-items:center; justify-content:space-between; gap:12px; cursor:pointer; width:100%; height:78px !important; min-height:78px !important; margin:0 !important; padding:14px 30px !important; font-weight:800; color:var(--text); background:var(--card); }
    details.card.settings-accordion > summary::-webkit-details-marker { display:none; }
    details.card.settings-accordion > summary:after { content:'▸'; color:var(--muted); font-size:18px; font-weight:800; flex:0 0 auto; }
    details.card.settings-accordion[open] > summary:after { content:'▾'; }
    .settings-accordion .settings-body { padding:0 16px 16px; }
    /* Invoice and POS print-setting launch cards */
    .print-choice-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); align-items:start; gap:14px; margin:2px 0 14px; }
    .print-choice { min-width:0; overflow:hidden; border:1px solid var(--line); border-radius:18px; background:var(--card); box-shadow:0 3px 12px rgba(15,23,42,.05); transition:border-color .18s,box-shadow .18s,transform .18s; }
    .print-choice:hover { border-color:var(--brand); box-shadow:0 8px 22px rgba(15,23,42,.09); transform:translateY(-2px); }
    .print-choice > summary { display:flex; align-items:center; gap:10px; min-height:82px; padding:15px 16px; list-style:none; cursor:pointer; font-weight:850; color:var(--text); background:linear-gradient(135deg,var(--card),var(--soft)); }
    .print-choice > summary::-webkit-details-marker { display:none; }
    .print-choice-icon { display:grid; place-items:center; flex:0 0 44px; width:44px; height:44px; border-radius:14px; background:#e0f2fe; color:#075985; font-size:23px; }
    .print-choice-label { flex:1; font-size:16px; }
    .print-choice-arrow { color:var(--muted); font-size:21px; transition:transform .18s; }
    .print-choice[open] { border-color:var(--brand); box-shadow:0 8px 22px rgba(15,23,42,.09); }
    .print-choice-grid .pr-grid { display:block; }
    .print-choice-grid .pr-form { min-width:0; }
    .print-choice-grid .print-shared-preview .pr-side { width:100%; min-width:0; }
    .print-choice[open] .print-choice-arrow { transform:rotate(180deg); }
    .print-choice-body { padding:0 14px 14px; }
    .pos-choice .print-choice-icon { background:#ede9fe; color:#6d28d9; }
    @media(max-width:520px) { .print-choice-grid { grid-template-columns:repeat(2,minmax(0,1fr)); gap:9px; } .print-choice > summary { min-height:70px; padding:10px 8px; gap:7px; } .print-choice-icon { flex-basis:34px; width:34px; height:34px; font-size:19px; border-radius:11px; } .print-choice-label { font-size:13px; } }

    .settings-accordion > summary .muted { display:none; }
    /* Compact the OUTER Settings option cards only; expanded contents remain untouched. */
    #v-settings > .settings-security-card,
    #v-settings > details.card.settings-accordion:not([open]) {
      box-sizing:border-box !important;
      height:64px !important;
      min-height:64px !important;
      padding:0 !important;
      margin:0 0 12px !important;
    }
    #v-settings > .settings-security-card > .acc-head,
    #v-settings > details.card.settings-accordion:not([open]) > summary {
      box-sizing:border-box !important;
      height:62px !important;
      min-height:62px !important;
      padding:0 30px !important;
      margin:0 !important;
    }
    #v-settings > details.card.settings-accordion[open] {
      height:auto !important;
      min-height:0 !important;
    }
    /* Security & Account is a div-based accordion, so expand its parent explicitly. */
    #v-settings > .settings-security-card.is-open {
      display:block !important;
      box-sizing:border-box !important;
      height:auto !important;
      min-height:64px !important;
      overflow:visible !important;
      align-items:initial !important;
      padding:0 0 14px !important;
    }
    #v-settings > .settings-security-card.is-open > .acc-head {
      width:100%;
      display:flex;
      min-height:62px;
    }
    #v-settings > .settings-security-card #saWrap {
      box-sizing:border-box;
      width:100%;
      padding:0 16px;
    }
    #v-settings > .settings-security-card #saWrap > .grid-2 {
      align-items:start;
    }
    .clock-settings-card { border:1px solid var(--line); border-radius:16px; overflow:hidden; background:var(--card); }
    .clock-hero { padding:20px; border-radius:16px; color:#fff; background:linear-gradient(135deg,#064e3b,#0f766e 58%,#0ea5a4); text-align:center; margin-bottom:16px; box-shadow:0 12px 28px rgba(4,120,87,.18); }
    .clock-hero .clock-hero-time { font-size:clamp(28px,6vw,42px); line-height:1.15; font-weight:900; letter-spacing:1px; font-variant-numeric:tabular-nums; }
    .clock-hero .clock-hero-date { margin-top:7px; opacity:.9; font-size:13px; }
    .world-clock-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(145px,1fr)); gap:10px; margin:10px 0 16px; }
    .world-clock-card { padding:13px; border:1px solid var(--line); border-radius:14px; background:var(--chip); min-width:0; }
    .world-clock-card .wc-city { font-size:12px; font-weight:800; color:var(--muted); }
    .world-clock-card .wc-time { font-size:19px; font-weight:900; letter-spacing:.3px; font-variant-numeric:tabular-nums; margin:5px 0 2px; }
    .world-clock-card .wc-date { font-size:11px; color:var(--muted); }
    .clock-section-label { font-size:13px; font-weight:900; color:var(--text); margin:16px 0 9px; }
    .clock-theme-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(112px,1fr)); gap:8px; margin-bottom:12px; }
    .clock-theme-choice { padding:10px; border:1px solid var(--line); border-radius:12px; background:var(--chip); color:var(--text); cursor:pointer; text-align:left; font-size:12px; font-weight:800; }
    .clock-theme-choice.active { border-color:var(--brand); outline:2px solid rgba(5,150,105,.2); }
    .clock-theme-swatch { display:block; height:23px; border-radius:7px; margin-bottom:7px; }
    .clock-manual-box { border:1px dashed var(--line); border-radius:14px; padding:13px; margin:12px 0; background:var(--chip); }
    :root[data-theme="dark"] .world-clock-card, :root[data-theme="dark"] .clock-manual-box, :root[data-theme="dark"] .clock-theme-choice { background:var(--chip); color:var(--text); border-color:var(--line); }
    :root[data-theme="dark"] .clock-hero { box-shadow:none; }
    .top-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
    .avatar { width: 32px; height: 32px; border-radius: 50%; background: #fff; color: #065f46; font-weight: 800; display: grid; place-items: center; font-size: 14px; }
    .icon-btn { flex-shrink: 0; min-width: 34px; height: 34px; padding: 0 9px; border-radius: 10px; border: none; background: rgba(255,255,255,.16); color: #fff; cursor: pointer; font-size: 13px; font-weight: 800; display: grid; place-items: center; }
    .icon-btn:hover { background: rgba(255,255,255,.26); }
    .icon-btn svg { width: 17px; height: 17px; display: block; }
    @media (max-width: 420px) { .brand .name { display: none; } .header-clock .clock-date { display:none; } .header-clock .clock-time { font-size:11px; } }

    .nav { position: sticky; top: 0; z-index: 40; background: var(--card); border-bottom: 1px solid var(--line); overflow-x: auto; scrollbar-width: none; }
    .nav::-webkit-scrollbar { display: none; }
    #appView, #appView * { scrollbar-width:none; }
    #appView *::-webkit-scrollbar { width:0 !important; height:0 !important; display:none !important; }
    #appView .nav-inner { display: flex; gap: 6px; padding: 10px 12px; max-width: 1100px; margin: 0 auto; }
    .nav-btn { flex-shrink: 0; border: none; background: transparent; color: var(--muted); padding: 9px 14px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
    .nav-btn:hover { background: var(--chip); color: var(--text); }
    .nav-btn.active { background: var(--brand); color: #fff; box-shadow: 0 6px 16px rgba(4,120,87,.3); }
    main { max-width: 1100px; margin: 0 auto; padding: 16px; min-height: 70vh; }
    .view-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
    .view-head h2 { font-size: 22px; letter-spacing: -.2px; }
    .view-head p { color: var(--muted); font-size: 13px; margin-top: 2px; }
    .ptr { position: fixed; top: 64px; left: 50%; transform: translateX(-50%); background: var(--card); color: var(--text); border: 1px solid var(--line); padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 700; box-shadow: var(--shadow); z-index: 60; opacity: 0; transition: opacity .2s; pointer-events: none; }
    .ptr.show { opacity: 1; }

    /* ---- Cards & forms ---- */
    .card { background: var(--card); border: 1px solid var(--line); border-radius: var(--r); padding: 18px; box-shadow: var(--shadow); margin-bottom: 16px; }
    .card h3 { font-size: 16px; margin-bottom: 12px; }
    .card-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
    .card-head h3 { margin: 0; }
    .grid-2 { display: grid; grid-template-columns: 1fr; gap: 16px; }
    .grid-3 { display: grid; grid-template-columns: 1fr; gap: 12px; }
    .grid-4 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .grid-fields { display: grid; grid-template-columns: 1fr; gap: 12px; }
    @media (min-width: 760px) {
      .grid-2 { grid-template-columns: 1fr 1fr; }
      .grid-3 { grid-template-columns: repeat(3, 1fr); }
      .grid-4 { grid-template-columns: repeat(4, 1fr); }
      .grid-fields { grid-template-columns: 1fr 1fr; }
    }
    .field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
    .field label, .lbl { font-size: 13px; font-weight: 700; color: var(--muted); }
    .input { width: 100%; padding: 11px 13px; border: 1px solid var(--line); border-radius: 12px; background: var(--input); font-size: 14px; outline: none; transition: border-color .15s, box-shadow .15s; }
    .input:focus { border-color: var(--brand-2); box-shadow: 0 0 0 4px rgba(5,150,105,.15); }
    .input.emoji { width: 72px; text-align: center; flex-shrink: 0; }
    input[type="color"].input { padding: 4px; height: 42px; cursor: pointer; }
    .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .ed-row { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
    .ed-row .input { min-width: 0; }
    .ed-row .grow { flex: 1; min-width: 0; }
    .ed-faq { border: 1px dashed var(--line); border-radius: 14px; padding: 12px; margin-bottom: 10px; }
    .ed-faq .grid-2 { gap: 10px; }
    .ed-faq .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 13px; font-weight: 800; color: var(--muted); }
    .nt-prev { margin-top: 10px; border: 1px dashed var(--line); border-radius: 12px; padding: 4px; background: var(--chip); }
    .nt-prev .notice { border: none; background: transparent; padding: 10px; }
    .nt-prev .notice-img { display: block; width: 100%; max-height: 180px; object-fit: contain; border-radius: 10px; margin-bottom: 8px; }
    .nt-prev .notice-h { margin-bottom: 4px; }
    .nt-prev .notice-b { white-space: pre-line; }
    .nt-img-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .nt-img-row .input { flex: 1; min-width: 160px; }

    /* ---- Buttons ---- */
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 11px 16px; border-radius: 12px; border: 1px solid transparent; background: var(--brand); color: #fff; font-weight: 700; cursor: pointer; font-size: 14px; text-decoration: none; transition: transform .05s, opacity .15s; white-space: nowrap; }
    .btn:hover { opacity: .92; }
    .btn:active { transform: translateY(1px); }
    .btn:disabled { opacity: .5; cursor: not-allowed; }
    .btn.block { width: 100%; }
    .btn.sm { padding: 7px 12px; font-size: 13px; border-radius: 10px; }
    .btn.ghost { background: var(--chip); color: var(--text); border-color: var(--line); }
    .btn.danger { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }
    .btn.danger-solid { background: #dc2626; color: #fff; }
    .btn.wa { background: #16a34a; }
    .btn.call { background: #0284c7; }
    .btn.full-login { width: 100%; padding: 13px; font-size: 15px; }
    .actions4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; margin: 12px 0; }
    .actions4 .btn { padding: 9px 4px; font-size: 12px; border-radius: 10px; overflow: hidden; text-overflow: ellipsis; }

    /* ---- Password field with eye ---- */
    .pw { position: relative; }
    .pw .input { padding-right: 50px; }
    .eye { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); border: none; background: var(--chip); color: var(--muted); width: 36px; height: 32px; padding: 0; border-radius: 8px; cursor: pointer; display: grid; place-items: center; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
    .eye:hover { color: var(--text); }
    .eye svg { width: 18px; height: 18px; display: block; pointer-events: none; }
    .eye .ic-off { display: none; }
    .eye.on .ic-off { display: block; }
    .eye.on .ic-open { display: none; }
    .eye.on { color: var(--brand); }

    .inv-in { width: 84px; text-align: center; padding: 8px 6px; }
    .inv-in.low { background: #fef9c3; border-color: #facc15; color: #0f172a; }
    .inv-in.out { background: #fee2e2; border-color: #f87171; color: #0f172a; }
    #invBox th, #invBox td { white-space: nowrap; }
    #invBox tfoot th, #invBox tfoot td { border-top: 2px solid var(--line); font-weight: 800; }

    /* ---- Top bar preview ---- */
    .tb-prev { background: linear-gradient(90deg, #064e3b, #0f766e); color: #fff; border-radius: 12px; margin-top: 4px; overflow: hidden; padding: 10px 56px; }
    .tb-prev-text { font-weight: 700; line-height: 1.4; white-space: pre-line; word-break: break-word; }

    .dlg { max-width: 420px; margin: auto; border-radius: 20px; padding: 22px; }
    .dlg-ov { align-items: center; }
    .dlg-msg { font-size: 15px; line-height: 1.6; margin-bottom: 12px; white-space: pre-line; }
    .dlg-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 14px; }
    .dlg-in { margin-top: 6px; }
    .chart { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; align-items: end; min-height: 220px; }
    .col { display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; justify-content: flex-end; }
    .bar-v { width: 100%; flex: 1; min-height: 120px; background: var(--chip); border-radius: 10px; display: flex; align-items: flex-end; overflow: hidden; }
    .bar-v span { display: block; width: 100%; background: linear-gradient(180deg, #34d399, #047857); border-radius: 10px 10px 0 0; min-height: 4px; }
    .cnt { font-weight: 800; font-size: 13px; }
    .lbl { font-size: 12px; color: var(--muted); }
    .sales { font-size: 11px; color: var(--muted); text-align: center; }
    .chk { display: flex; align-items: center; gap: 8px; color: var(--text); font-size: 14px; font-weight: 700; }
    .chk-row { justify-content: flex-end; }

    /* ---- Badges, IDs, banners ---- */
    .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 800; white-space: nowrap; }
    .s-Pending { background: #fef3c7; color: #92400e; }
    .s-Confirmed { background: #dbeafe; color: #1e40af; }
    .s-Delivered { background: #dcfce7; color: #166534; }
    .s-Cancelled { background: #fee2e2; color: #991b1b; }
    .pid { font-family: ui-monospace, Menlo, Consolas, monospace; font-weight: 800; background: var(--chip); padding: 4px 9px; border-radius: 8px; cursor: pointer; letter-spacing: .4px; font-size: 13px; }
    .pid:hover { outline: 2px solid var(--brand-2); }
    .msg { font-size: 13px; font-weight: 700; margin-top: 10px; min-height: 18px; }
    .msg.ok { color: #15803d; }
    .msg.err { color: var(--danger); }
    .banner { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; padding: 12px 14px; border-radius: 14px; margin-bottom: 14px; font-size: 14px; font-weight: 600; }
    .banner.warn { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
    :root[data-theme="dark"] .banner.warn { background: #3b2a08; color: #fde68a; border-color: #5c4311; }
    :root[data-theme="dark"] .card, :root[data-theme="dark"] .sheet, :root[data-theme="dark"] .dlg,
    :root[data-theme="dark"] .table-wrap, :root[data-theme="dark"] .modal-box { background:var(--card); color:var(--text); border-color:var(--line); }
    :root[data-theme="dark"] .input, :root[data-theme="dark"] input:not([type="checkbox"]):not([type="radio"]):not([type="color"]),
    :root[data-theme="dark"] select, :root[data-theme="dark"] textarea { background:var(--input); color:var(--text); border-color:var(--line); color-scheme:dark; }
    :root[data-theme="dark"] .chip, :root[data-theme="dark"] .nav-btn:hover, :root[data-theme="dark"] .list-item,
    :root[data-theme="dark"] .kpi, :root[data-theme="dark"] .unit-row, :root[data-theme="dark"] .order-card,
    :root[data-theme="dark"] .filter-row, :root[data-theme="dark"] .acc-head { background:var(--chip); color:var(--text); border-color:var(--line); }
    :root[data-theme="dark"] table th { background:#18243a; color:#e2e8f0; }
    :root[data-theme="dark"] table td { color:var(--text); border-color:var(--line); }
    :root[data-theme="dark"] .hint-text, :root[data-theme="dark"] .muted, :root[data-theme="dark"] .field label { color:var(--muted); }
    :root[data-theme="dark"] .btn.ghost { color:var(--text); border-color:var(--line); }
    :root[data-theme="dark"] .preview-bar { background:rgba(2,6,23,.82); }
    :root[data-theme="dark"] .inv-in.low { background:#453b12; color:#fde68a; border-color:#927c24; }
    :root[data-theme="dark"] .inv-in.out { background:#451f2a; color:#fecdd3; border-color:#9f4358; }
    :root[data-theme="dark"] .s-Pending { background:#453b12; color:#fde68a; }
    :root[data-theme="dark"] .s-Cancelled, :root[data-theme="dark"] .btn.danger { background:#451f2a; color:#fecdd3; border-color:#9f4358; }
    :root[data-theme="dark"] .stat.blue .sicon { background:#1e3a5f; }
    :root[data-theme="dark"] .stat.green .sicon { background:#164536; }
    :root[data-theme="dark"] .stat.amber .sicon { background:#453b12; }
    :root[data-theme="dark"] .stat.purple .sicon { background:#382b5d; }
    :root[data-theme="dark"] .logo-thumb { background:#0e1729; }

    /* ---- Dashboard ---- */
    .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px; }
    @media (min-width: 900px) { .stats { grid-template-columns: repeat(4, 1fr); } }
    .stat { background: var(--card); border: 1px solid var(--line); border-radius: var(--r); padding: 16px; display: flex; gap: 12px; align-items: center; box-shadow: var(--shadow); }
    .sicon { width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center; font-size: 20px; flex-shrink: 0; }
    .stat.blue .sicon { background: #dbeafe; }
    .stat.green .sicon { background: #dcfce7; }
    .stat.amber .sicon { background: #fef3c7; }
    .stat.purple .sicon { background: #ede9fe; }
    .sval { font-size: 20px; font-weight: 800; letter-spacing: -.3px; }
    .slabel { font-size: 12px; color: var(--muted); font-weight: 700; margin-top: 2px; }
    .bar-row { margin-bottom: 12px; }
    .bar-top { display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; margin-bottom: 6px; }
    .bar { height: 9px; background: var(--chip); border-radius: 99px; overflow: hidden; }
    .bar > span { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg, #10b981, #0ea5e9); transition: width .4s; }
    .kpi { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px dashed var(--line); font-size: 14px; }
    .kpi:last-child { border-bottom: none; }

    /* ---- Order cards ---- */
    .toolbar { display: grid; grid-template-columns: 1fr; gap: 10px; margin-bottom: 12px; }
    @media (min-width: 760px) { .toolbar { grid-template-columns: 2fr 1fr 1fr; } }
    .order-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
    @media (min-width: 760px) { .order-grid { grid-template-columns: 1fr 1fr; } }
    @media (min-width: 1100px) { .order-grid { grid-template-columns: 1fr 1fr 1fr; } }
    .ocard { background: var(--card); border: 1px solid var(--line); border-radius: var(--r); padding: 14px; cursor: pointer; transition: transform .12s, box-shadow .12s; box-shadow: var(--shadow); }
    .ocard:hover { transform: translateY(-2px); box-shadow: 0 14px 30px rgba(15,23,42,.1); }
    .ohead { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
    .oname { font-weight: 800; font-size: 16px; margin-bottom: 4px; word-break: break-word; }
    .ometa { font-size: 13px; color: var(--muted); margin-bottom: 10px; word-break: break-word; }
    .ofoot { display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed var(--line); padding-top: 10px; }
    .ofoot strong { font-size: 17px; color: var(--brand); }
    .ofoot small { color: var(--muted); font-size: 12px; }
    .more { margin-top: 14px; text-align: center; }
    .savebar { display: flex; justify-content: flex-end; margin-top: 4px; }

    /* ---- Images ---- */
    .img-list { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
    .img-card { position: relative; width: 96px; height: 96px; border: 1px solid var(--line); border-radius: 14px; overflow: hidden; background: var(--chip); }
    .img-card img { width: 100%; height: 100%; object-fit: contain; background: #fff; }
    .img-card button { position: absolute; top: 4px; right: 4px; background: rgba(15,23,42,.8); color: #fff; border: none; width: 24px; height: 24px; border-radius: 50%; font-size: 12px; cursor: pointer; }

    /* ---- List rows & table ---- */
    .list-item { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 12px 0; border-bottom: 1px dashed var(--line); flex-wrap: wrap; }
    .list-item:last-child { border-bottom: none; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid var(--line); white-space: nowrap; }
    th { color: var(--muted); font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: .4px; }

    /* ---- Modal, toast ---- */
    .overlay { position: fixed; inset: 0; background: rgba(2,6,23,.55); backdrop-filter: blur(3px); display: none; align-items: flex-end; justify-content: center; z-index: 100; }
    .overlay.show { display: flex; }
    .overlay.doc-workspace { align-items:stretch; justify-content:stretch; padding:0; background:#e9eef5; backdrop-filter:none; }
    .overlay.doc-workspace .sheet { width:100%; max-width:none; height:100%; max-height:none; overflow:hidden; padding:0; border-radius:0; box-shadow:none; display:flex; flex-direction:column; background:#f4f6fa; }
    .overlay.doc-workspace .sheet-close { display:none; }
    .doc-workspace-head { flex:0 0 auto; display:flex; align-items:center; justify-content:space-between; gap:16px; padding:18px clamp(16px,4vw,48px); background:linear-gradient(115deg,#063f35,#087b61); color:#fff; box-shadow:0 4px 18px rgba(2,30,25,.18); }
    .doc-workspace-brand { display:flex; align-items:center; gap:12px; min-width:0; }
    .doc-workspace-mark { display:grid; place-items:center; width:44px; height:44px; border-radius:14px; background:rgba(255,255,255,.14); font-size:22px; }
    .doc-workspace-brand strong { display:block; font-size:17px; letter-spacing:.1px; }
    .doc-workspace-brand small { display:block; margin-top:3px; color:rgba(255,255,255,.72); font-size:11px; letter-spacing:1.1px; }
    .doc-workspace-id { max-width:38%; overflow-wrap:anywhere; color:#e4fff5; font-size:12px; font-weight:800; text-align:right; }
    .doc-workspace-main { flex:1 1 auto; min-height:0; overflow:auto; padding:clamp(14px,3vw,32px); }
    .doc-workspace-intro { width:min(100%,980px); margin:0 auto 16px; display:flex; justify-content:space-between; align-items:end; gap:12px; }
    .doc-workspace-intro h2 { margin:0; color:#132b28; font-size:clamp(20px,3vw,27px); }
    .doc-workspace-intro p { margin:5px 0 0; color:#64748b; font-size:13px; }
    .doc-workspace-paper { width:min(100%,980px); min-height:360px; margin:0 auto; padding:clamp(10px,2vw,22px); border:1px solid #dbe3ec; border-radius:18px; background:#fff; box-shadow:0 14px 40px rgba(15,35,55,.09); overflow:auto; }
    .doc-workspace-paper > * { margin-left:auto; margin-right:auto; }
    .doc-workspace-footer { flex:0 0 auto; display:flex; align-items:center; justify-content:center; gap:12px; flex-wrap:wrap; padding:14px clamp(12px,3vw,32px) calc(14px + env(safe-area-inset-bottom,0px)); background:#fff; border-top:1px solid #dce4ec; box-shadow:0 -8px 24px rgba(15,35,55,.06); }
    .doc-workspace-footer .btn { min-width:170px; min-height:48px; border-radius:13px; font-weight:850; }
    .doc-workspace-footer .doc-back-btn { background:#f1f5f9; color:#1e293b; }
    @media(max-width:600px) {
      .doc-workspace-head { padding:12px 14px; }
      .doc-workspace-mark { width:38px; height:38px; }
      .doc-workspace-brand strong { font-size:15px; }
      .doc-workspace-id { font-size:10px; }
      .doc-workspace-main { padding:12px 8px; }
      .doc-workspace-paper { padding:5px; border-radius:12px; }
      .doc-workspace-footer { display:grid; grid-template-columns:1fr; gap:8px; padding:10px 12px calc(10px + env(safe-area-inset-bottom,0px)); }
      .doc-workspace-footer .btn { width:100%; min-width:0; }
    }

    .sheet { width: 100%; max-width: 620px; max-height: 92vh; overflow-y: auto; background: var(--card); color: var(--text); border-radius: 22px 22px 0 0; padding: 18px 18px calc(18px + env(safe-area-inset-bottom, 0px)); box-shadow: 0 -20px 60px rgba(0,0,0,.3); position: relative; }
    @media (min-width: 760px) { .overlay { align-items: center; } .sheet { border-radius: 22px; } }
    .sheet-close { position: absolute; top: 12px; right: 12px; width: 34px; height: 34px; border-radius: 50%; border: none; background: var(--chip); cursor: pointer; font-size: 15px; }
    .mhead { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 8px; padding-right: 36px; flex-wrap: wrap; }
    .sheet h3 { font-size: 19px; margin: 6px 0 12px; }
    .order-status-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0 12px}.order-status-row .field{margin:0;min-width:0}.order-payment-amount[hidden]{display:none!important}.order-payment-amount{margin:0 0 12px}.order-payment-controls{display:flex;align-items:center;gap:8px}.order-payment-controls input{flex:1;min-width:0;width:100px}.order-payment-controls .btn{flex:0 0 auto;padding:9px 16px}@media(max-width:520px){.order-status-row{gap:7px}.order-status-row .lbl{font-size:12px}.order-payment-controls .btn{padding:9px 12px}}
    .doc-modal-top { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:2px 38px 12px 0; border-bottom:1px solid var(--line); margin-bottom:12px; }
    .doc-modal-title { display:flex; align-items:center; gap:10px; min-width:0; }
    .doc-modal-icon { display:grid; place-items:center; width:40px; height:40px; flex:0 0 40px; border-radius:12px; background:var(--chip); font-size:20px; }
    .doc-modal-title h3 { margin:0; font-size:18px; color:var(--text); }
    .doc-modal-title p { margin:3px 0 0; color:var(--muted); font-size:11px; }
    .doc-modal-id { max-width:34%; padding:6px 8px; border-radius:8px; background:var(--chip); color:var(--muted); font-size:10px; font-weight:800; overflow-wrap:anywhere; text-align:right; }
    .doc-modal-canvas { height:58vh; max-height:58vh; overflow:auto; padding:12px; border:1px solid var(--line); border-radius:14px; background:#e9eef4; }
    .doc-modal-canvas { position:relative; display:flex; align-items:safe center; justify-content:safe center; }
    .preview-zoom-bar { display:flex; justify-content:center; align-items:center; gap:7px; margin:9px 0; padding:6px; border-radius:9px; background:var(--chip); flex-wrap:wrap; }
    .preview-zoom-bar button { min-width:29px; padding:5px 9px; border:1px solid var(--line); border-radius:6px; background:var(--card); color:var(--text); font-weight:800; cursor:pointer; }
    .preview-zoom-value { min-width:38px; text-align:center; font-size:12px; font-weight:800; }
    .preview-pan-hint { font-size:10px; color:var(--muted); }
    .doc-modal-canvas.is-panning, #printPrev.is-panning { cursor:grabbing; }
    .doc-modal-canvas > * { margin-left:auto; margin-right:auto; }
    .doc-modal-actions { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:7px; margin-top:12px; }
    .doc-modal-actions .btn { min-width:0; min-height:43px; padding:9px 6px; border-radius:10px; font-size:12px; font-weight:800; white-space:normal; }
    .doc-modal-actions .doc-print-btn { background:var(--brand); }
    .doc-modal-actions .doc-save-btn, .doc-modal-actions .doc-back-btn { background:var(--chip); color:var(--text); }
    @media(max-width:520px) { .doc-modal-canvas { height:54vh; max-height:54vh; padding:6px; overflow:auto; } .doc-modal-actions { grid-template-columns:1fr; } .doc-modal-actions .btn { min-height:42px; font-size:13px; } }

    .kv { display: grid; grid-template-columns: 120px 1fr; gap: 8px 12px; font-size: 14px; margin-bottom: 14px; }
    .kv dt { color: var(--muted); font-weight: 700; }
    .kv dd { word-break: break-word; }
    .preview-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--line); }
    .hint-text { font-size: 12.5px; color: var(--muted); margin-top: 8px; }
    .toasts { position: fixed; left: 50%; bottom: calc(18px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); display: flex; flex-direction: column; gap: 8px; z-index: 200; width: min(92vw, 420px); pointer-events: none; }
    .toast { background: #0f172a; color: #fff; padding: 12px 16px; border-radius: 14px; font-weight: 700; font-size: 14px; box-shadow: 0 12px 30px rgba(0,0,0,.3); animation: up .2s ease; transition: opacity .3s; }
    .toast.ok { background: #065f46; }
    .toast.err { background: #991b1b; }
    .toast.out { opacity: 0; }
    .actions5 .doc-action { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; min-height:58px; padding:7px 4px; border-radius:12px; font-size:12px; font-weight:800; line-height:1.15; white-space:nowrap; }
    .actions5 .doc-action-icon { font-size:19px; line-height:1; }
    .actions5 .invoice-action { color:#075985; background:#e0f2fe; border:1px solid #bae6fd; }
    .actions5 .pos-action { color:#6d28d9; background:#ede9fe; border:1px solid #ddd6fe; }
    .doc-preview-heading { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:14px; }
    .doc-preview-heading h3 { margin:3px 0 2px; font-size:21px; }
    .doc-preview-heading p { margin:0; color:var(--muted); font-size:13px; }
    .doc-preview-kicker { color:var(--brand); font-size:10px; font-weight:900; letter-spacing:1.2px; }
    .doc-preview-badge { max-width:42%; overflow-wrap:anywhere; padding:7px 10px; border-radius:10px; background:var(--chip); color:var(--muted); font-size:11px; font-weight:800; }
    .doc-preview-paper { max-height:min(62vh,760px); overflow:auto; padding:14px; border:1px solid var(--line); border-radius:16px; background:#eef2f7; }
    .doc-preview-paper > * { margin-left:auto; margin-right:auto; }
    .doc-preview-actions { position:sticky; bottom:0; z-index:2; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); background:var(--card); padding:12px 0 2px; }
    .doc-preview-actions .btn { min-height:46px; border-radius:12px; font-weight:800; }
    .doc-print-btn { background:var(--brand); }
    .doc-save-btn { background:var(--chip); }
    .doc-back-btn { background:var(--chip); }
    @media(max-width:560px) {
      .actions5 .doc-action { font-size:10px; }
      .doc-preview-heading { align-items:flex-start; }
      .doc-preview-paper { padding:7px; max-height:58vh; }
      .doc-preview-actions { grid-template-columns:1fr; }
    }
    .actions5 { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 5px; margin: 12px 0; }
    .actions5 .btn { padding: 8px 2px; font-size: 11px; border-radius: 9px; overflow: hidden; text-overflow: ellipsis; }
    .chips { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
    .chip { border: 1px solid var(--line); background: var(--chip); color: var(--text); border-radius: 999px; padding: 6px 12px; font-size: 12px; font-weight: 700; cursor: pointer; }
    .chip.on { background: var(--brand); color: #fff; border-color: var(--brand); }
    .chip b { margin-left: 4px; }
    .th-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; margin:12px 0 18px; }
    @media (min-width:560px) { .th-grid { grid-template-columns:repeat(5,minmax(0,1fr)); } }
    .th-btn { display:flex; align-items:center; gap:9px; padding:11px; min-height:48px; border-radius:13px; border:1px solid var(--line); background:var(--card); color:var(--text); font-size:12px; font-weight:800; cursor:pointer; transition:border-color .15s,transform .15s,box-shadow .15s; }
    .th-btn:hover { transform:translateY(-1px); box-shadow:var(--shadow); }
    .th-btn.on { border-color:var(--brand); box-shadow:0 0 0 2px rgba(5,150,105,.2); background:var(--chip); }
    .th-sw { width:23px; height:23px; border-radius:8px; flex-shrink:0; box-shadow:inset 0 0 0 1px rgba(0,0,0,.08); }
    .pr-grid { display:grid; grid-template-columns:1fr; gap:18px; align-items:start; }
    /* Keep each expanded print panel inside its own column. */
    .print-choice-grid { grid-template-columns:repeat(2,minmax(0,1fr)); align-items:start; }
    .print-choice { align-self:start; min-width:0; }
    /* When one print type is open, place its editor and the shared live preview side by side. */
    .print-choice-grid.has-open-choice { grid-template-columns:minmax(0,1fr) minmax(0,1fr); }
    .print-choice-grid.has-open-choice .print-choice[open] { grid-column:1; grid-row:1; }
    .print-choice-grid.has-open-choice .print-choice:not([open]) { grid-column:2; grid-row:1; }
    .print-choice-grid.has-open-choice .print-shared-preview { grid-column:2; grid-row:2; align-self:start; }
    /* The selected editor stays fully inside its own half-width card. */
    .print-choice-body { min-width:0; overflow:hidden; }
    @media (max-width:760px) {
      .print-choice-grid.has-open-choice { grid-template-columns:minmax(0,1fr); }
      .print-choice-grid.has-open-choice .print-choice[open] { grid-column:1; grid-row:1; }
      .print-choice-grid.has-open-choice .print-choice:not([open]) { grid-column:1; grid-row:2; }
      .print-choice-grid.has-open-choice .print-shared-preview { grid-column:1; grid-row:3; }
    }
    .print-choice-body .pr-grid { grid-template-columns:minmax(0,1fr) !important; }
    .print-choice-body .pr-side { min-width:0; width:100%; }
    .print-choice-body #printPrev { min-width:0; width:100%; }

    /* Print settings: stacked selectors, side-by-side editor and live preview. */
    .print-choice-grid { grid-template-columns:minmax(0,1fr) !important; }
    .print-choice-grid.has-open-choice {
      grid-template-columns:minmax(0,1fr) minmax(0,1fr) !important;
      grid-template-rows:auto minmax(0,1fr);
      align-items:start;
    }
    .print-choice-grid.has-open-choice .print-choice:not([open]) {
      grid-column:1 / -1 !important;
      grid-row:1 !important;
      width:100%;
    }
    .print-choice-grid.has-open-choice .print-choice[open] {
      grid-column:1 !important;
      grid-row:2 !important;
      width:100%;
    }
    .print-choice-grid.has-open-choice .print-shared-preview {
      grid-column:2 !important;
      grid-row:2 !important;
      align-self:stretch;
      position:sticky !important;
      top:16px !important;
      max-height:none !important;
    }
    /* POS: keep the settings panel on the left and live preview on the right. */
    .print-choice-grid.has-open-choice.pos-active .print-choice[open] {
      grid-column:1 !important;
      grid-row:2 !important;
    }
    .print-choice-grid.has-open-choice.pos-active .print-shared-preview {
      grid-column:2 !important;
      grid-row:2 !important;
    }
    .print-choice-grid.has-open-choice .print-choice-body { overflow:visible; }
    .print-choice-grid.has-open-choice .print-choice-body .pr-grid { display:block; }
    .print-choice-grid.has-open-choice .print-shared-preview .pr-side { width:100%; }
    @media (max-width:760px) {
      .print-choice-grid.has-open-choice {
        grid-template-columns:minmax(0,1fr) !important;
        grid-template-rows:auto;
      }
      .print-choice-grid.has-open-choice .print-choice:not([open]),
      .print-choice-grid.has-open-choice .print-choice[open],
      .print-choice-grid.has-open-choice .print-shared-preview,
      .print-choice-grid.has-open-choice.pos-active .print-choice[open],
      .print-choice-grid.has-open-choice.pos-active .print-shared-preview {
        grid-column:1 !important;
        grid-row:auto !important;
      }
      .print-choice-grid.has-open-choice .print-shared-preview { position:relative !important; top:auto !important; }
    }

    @media (min-width:900px) { .pr-grid { grid-template-columns:minmax(0,1.08fr) minmax(300px,.92fr); align-items:start; } }
    .pr-form { min-width:0; display:flex; flex-direction:column; gap:12px; }
    .pr-side { position:relative !important; top:auto !important; align-self:start; max-height:none !important; overflow:visible !important; background:var(--chip); border:1px solid var(--line); border-radius:18px; padding:14px; box-shadow:var(--shadow); }
    .pr-side #printPrev { position:relative; height:min(58vh,520px); min-height:260px; background:#e8edf3; border-radius:12px; padding:12px; overflow:auto; display:flex; align-items:safe center; justify-content:safe center; }
    .pr-side .print-preview-stage { width:100%; min-width:0; }
    .pr-side #pvPrint { box-shadow:0 2px 12px rgba(15,23,42,.10); }
    .pr-form > .pr-section { background:var(--card); border:1px solid var(--line); border-radius:16px; padding:14px; box-shadow:var(--shadow); }
    .pr-accordion { overflow:hidden; }
    .pr-accordion > .pr-section-title { cursor:pointer; list-style:none; margin:0; padding:2px 0; }
    .pr-accordion > .pr-section-title::-webkit-details-marker { display:none; }
    .pr-accordion > .pr-section-title::after { content:'＋'; margin-left:auto; color:var(--brand); font-size:18px; font-weight:900; }
    .pr-accordion[open] > .pr-section-title { margin-bottom:12px; }
    .pr-accordion[open] > .pr-section-title::after { content:'−'; }
    .pr-section-title { display:flex; align-items:center; gap:8px; font-size:13px; font-weight:900; color:var(--text); margin:0 0 12px; }
    .pr-section-title .pr-section-icon { width:29px; height:29px; display:grid; place-items:center; border-radius:9px; background:var(--chip); font-size:15px; }
    .pr-section-note { color:var(--muted); font-size:12px; margin:-5px 0 12px; line-height:1.5; }
    .pr-form .field { min-width:0; }
    .pr-form .input { min-width:0; }
    .pr-form .grid-2,.pr-form .grid-4 { gap:10px; }
    .show-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px 12px; margin:8px 0 2px; }
    @media (min-width:700px) { .show-grid { grid-template-columns:repeat(3,minmax(0,1fr)); } }
    .show-grid .chk { font-size:13px; padding:7px 8px; border:1px solid var(--line); border-radius:10px; background:var(--chip); }
    .logo-thumb { height:46px; max-width:110px; object-fit:contain; border-radius:10px; background:#fff; padding:5px; border:1px solid var(--line); }
    .pr-tabs { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
    .pr-savebar { display:flex; gap:9px; flex-wrap:wrap; position:sticky; bottom:8px; z-index:3; padding:10px; border:1px solid var(--line); border-radius:14px; background:var(--card); box-shadow:0 8px 22px rgba(15,23,42,.12); }
    .acc-head { width:100%; display:flex; justify-content:space-between; align-items:center; gap:10px; background:none; border:0; color:var(--text); cursor:pointer; padding:0; text-align:left; }
    .acc-title { font-size:16px; font-weight:800; }
    .acc-arrow { font-size:18px; color:var(--muted); }
    details.adv { margin:8px 0 14px; border:1px solid var(--line); border-radius:14px; padding:12px 14px; background:var(--chip); }
    details.adv summary { cursor:pointer; font-weight:900; color:var(--text); padding:2px 0; }
    details.adv[open] summary { margin-bottom:12px; }
    @media (max-width:760px) {
      #appView main { padding:10px 8px; }
      #appView .settings-accordion .settings-body { padding:0 10px 12px; }
      .pr-grid { grid-template-columns:minmax(0,1fr); gap:12px; }
      .pr-form,.pr-side { width:100%; min-width:0; }
      .pr-side { position:relative !important; top:auto !important; max-height:none !important; overflow:visible !important; }
      .pr-side #printPrev { height:clamp(260px,48svh,440px); min-height:240px; padding:8px; }
      .pr-side #printPreviewZoomControls { display:flex; justify-content:center; flex-wrap:wrap; gap:6px; margin-top:8px; }
      .pr-side .preview-zoom-bar { flex-wrap:wrap; justify-content:center; }
      .pr-form .grid-2,.pr-form .grid-4 { grid-template-columns:minmax(0,1fr); gap:4px; }
      .pr-form .input { min-height:44px; font-size:16px; }
      .pr-form textarea.input { min-height:82px; }
      .pr-form > .pr-section { padding:11px; }
      .pr-savebar { position:static; display:grid; grid-template-columns:1fr; padding:8px; }
      .pr-savebar .btn { width:100%; min-height:44px; }
      .pr-tabs { align-items:flex-start; }
      .show-grid { grid-template-columns:1fr; }
    }
    @media (max-width:560px) {
      .pr-form > .pr-section { padding:10px; }
      .pr-side { padding:10px; }
      .pr-side #printPrev { height:clamp(250px,46svh,380px); }
      .pr-form .field label { font-size:12px; line-height:1.4; }
    }
    /* Shared small-screen rules for the complete admin workspace. */
    @media (max-width:760px) {
      #appView { width:100%; min-width:0; overflow-x:hidden; }
      #appView main { width:100%; max-width:100%; padding:10px 8px; }
      #appView .nav-inner { width:max-content; min-width:100%; padding:8px; gap:4px; }
      #appView .nav-btn { min-height:40px; padding:9px 11px; font-size:13px; }
      #appView .view-head { align-items:flex-start; gap:8px; }
      #appView .view-head h2 { font-size:19px; }
      #appView .card, #appView .settings-accordion { min-width:0; }
      #appView .card { padding:12px; }
      #appView .field .input, #appView input.input, #appView select.input, #appView textarea.input {
        width:100%; min-width:0; min-height:44px; font-size:16px;
      }
      #appView textarea.input { min-height:84px; }
      #appView .btn { min-height:42px; white-space:normal; text-align:center; }
      #appView .table-wrap { width:100%; max-width:100%; overflow-x:auto; -webkit-overflow-scrolling:touch; }
      #appView .table-wrap table { min-width:620px; }
      #appView .filter-row, #appView .toolbar, #appView .action-row { flex-wrap:wrap; gap:8px; }
      #appView .filter-row > *, #appView .toolbar > * { min-width:0; max-width:100%; }
    }
    @media (max-width:420px) {
      #appView main { padding:8px 6px; }
      #appView .card { padding:10px; border-radius:13px; }
      #appView .nav-btn { padding:8px 9px; font-size:12px; }
      #appView .view-head h2 { font-size:18px; }
    }
    /* POS layout: settings on the left, live preview on the right. */
    .print-choice-grid.has-open-choice.pos-active .print-choice[open] {
      grid-column:1 !important;
      grid-row:2 !important;
    }
    .print-choice-grid.has-open-choice.pos-active .print-shared-preview {
      grid-column:2 !important;
      grid-row:2 !important;
    }
    @media (max-width:760px) {
      .print-choice-grid.has-open-choice.pos-active .print-choice[open],
      .print-choice-grid.has-open-choice.pos-active .print-shared-preview {
        grid-column:1 !important;
        grid-row:auto !important;
      }
    }
    /* Give Invoice and POS live previews enough vertical room to show the full page/receipt. */
    .pr-side #printPrev {
      height:clamp(520px,78vh,900px) !important;
      min-height:520px !important;
    }
    @media (max-width:760px) {
      .pr-side #printPrev {
        height:clamp(380px,70svh,760px) !important;
        min-height:380px !important;
      }
    }
    /* Tablet breakpoint: keep print editors and their previews readable on 7–10 inch screens. */
    @media (max-width:899px) {
      .print-choice-grid.has-open-choice { grid-template-columns:minmax(0,1fr) !important; grid-template-rows:auto !important; }
      .print-choice-grid.has-open-choice .print-choice:not([open]),
      .print-choice-grid.has-open-choice .print-choice[open],
      .print-choice-grid.has-open-choice .print-shared-preview {
        grid-column:1 !important; grid-row:auto !important; width:100%; position:relative !important; top:auto !important;
      }
      .print-choice-grid.has-open-choice .print-shared-preview { margin-top:0; }
      .pr-grid { grid-template-columns:minmax(0,1fr) !important; }
      .pr-form, .pr-side { width:100%; min-width:0; }
      .pr-side { position:relative !important; top:auto !important; }
    }

    /* Touch-friendly controls and visible horizontal table affordance on phones. */
    @media (max-width:760px) {
      #appView .topbar .icon-btn { min-width:40px; min-height:40px; }
      #appView .nav-btn { min-height:44px; }
      #appView .actions4 { grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
      #appView .actions4 .btn { min-height:44px; padding:9px 8px; font-size:13px; white-space:normal; overflow:visible; text-overflow:clip; }
      #appView .actions5 { grid-template-columns:repeat(3,minmax(0,1fr)); gap:7px; }
      #appView .actions5 .btn { min-height:44px; padding:8px 5px; font-size:12px; white-space:normal; overflow:visible; text-overflow:clip; }
      #appView .dlg-actions { flex-wrap:wrap; }
      #appView .table-wrap { scrollbar-width:thin; }
      #appView .table-wrap::-webkit-scrollbar { display:block !important; height:6px !important; }
      #appView .table-wrap::-webkit-scrollbar-thumb { background:#94a3b8; border-radius:99px; }
      #appView .table-wrap::-webkit-scrollbar-track { background:var(--chip); border-radius:99px; }
    }
    @media (max-width:420px) {
      #appView .header-clock { padding:5px 7px; }
      #appView .top-actions { gap:4px; }
      #appView .actions5 { grid-template-columns:repeat(2,minmax(0,1fr)); }
      #appView .doc-modal-top { padding-right:32px; }
      #appView .doc-modal-id { max-width:40%; overflow-wrap:anywhere; }
    }

    @keyframes up { from { transform: translateY(10px); opacity: 0; } to { transform: none; opacity: 1; } }
  </style>
</head>
<body>

  <!-- ===== Login ===== -->
  <div id="loginView" class="login-screen hidden">
    <button class="icon-btn login-lang" data-action="lang" data-lang-toggle>বাং</button>
    <div class="login-card">
      <div class="login-logo">🛍️</div>
      <h1 data-i18n="login_title"></h1>
      <p class="sub" data-i18n="login_sub"></p>
      <div class="field">
        <label for="loginUser" data-i18n="username"></label>
        <input class="input" type="text" id="loginUser" autocomplete="username" autocapitalize="none" spellcheck="false">
      </div>
      <div class="field">
        <label for="loginPass" data-i18n="password"></label>
        <div class="pw"><input class="input" type="password" id="loginPass" autocomplete="current-password"><button type="button" class="eye" data-action="toggle-pw" data-target="loginPass" aria-label="show" tabindex="-1"></button></div>
      </div>
      <button class="btn full-login" data-action="login" data-i18n="login_btn"></button>
      <div class="login-error" id="loginErr"></div>
    </div>
  </div>

  <!-- ===== App ===== -->
  <div id="appView" class="hidden">
    <header class="topbar">
      <div class="brand"><span class="dot">🛍️</span><span class="name">Admin Panel</span></div>
      <div class="header-clock" id="headerClock" aria-label="Date and time"><span class="clock-time" id="headerClockTime">—</span><span class="clock-date" id="headerClockDate">—</span></div>
      <div class="top-actions">
        <button class="icon-btn" data-action="lang" data-lang-toggle title="Language">বাং</button>
        <button class="icon-btn" data-action="theme" data-tip="theme_tip" title="Theme">🌓</button>
        <span class="avatar" id="whoBadge">A</span>
        <button class="icon-btn" data-action="logout" data-tip="logout" title="Logout" aria-label="Logout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v10"/><path d="M5.6 6.6a8 8 0 1 0 12.8 0"/></svg>
        </button>
      </div>
    </header>

    <nav class="nav">
      <div class="nav-inner">
        <button class="nav-btn" data-action="go" data-view="dashboard" data-i18n="nav_dash"></button>
        <button class="nav-btn" data-action="go" data-view="orders" data-i18n="nav_orders"></button>
        <button class="nav-btn" data-action="go" data-view="product" data-i18n="nav_product"></button>
        <button class="nav-btn" data-action="go" data-view="offers" data-i18n="nav_offers"></button>
        <button class="nav-btn" data-action="go" data-view="inventory" data-i18n="nav_inventory"></button>
        <button class="nav-btn" data-action="go" data-view="admins" data-i18n="nav_admins"></button>
        <button class="nav-btn" data-action="go" data-view="logs" data-i18n="nav_logs"></button>
        <button class="nav-btn" data-action="go" data-view="settings" data-i18n="nav_settings"></button>
      </div>
    </nav>

    <div class="ptr" id="ptr"></div>

    <main>

      <!-- Dashboard -->
      <section id="v-dashboard" class="view">
        <div class="view-head">
          <div><h2 data-i18n="dash_title"></h2><p id="todayText"></p></div>
          <button class="btn ghost sm" data-action="refresh" data-i18n="refresh"></button>
        </div>
        <div class="banner warn hidden" id="pwBanner">
          <span data-i18n="pw_warn"></span>
          <button class="btn sm" data-action="go" data-view="settings" data-i18n="change_pw"></button>
        </div>
        <div class="stats" id="statsGrid"></div>
        <div class="card"><div class="card-head"><h3 data-i18n="daily_title"></h3></div><div id="dailyBox"></div></div>
        <div class="grid-2">
          <div class="card"><div class="card-head"><h3 data-i18n="status_bars"></h3></div><div id="statusBars"></div></div>
          <div class="card"><div class="card-head"><h3 data-i18n="stock_box"></h3></div><div id="stockBox"></div></div>
        </div>
        <div class="card">
          <div class="card-head"><h3 data-i18n="recent"></h3><button class="btn ghost sm" data-action="go" data-view="orders" data-i18n="see_all"></button></div>
          <div class="order-grid" id="recentList"></div>
        </div>
      </section>

      <!-- Orders -->
      <section id="v-orders" class="view hidden">
        <div class="view-head">
          <div><h2 data-i18n="orders_title"></h2><p data-i18n="orders_sub"></p></div>
          <div class="row">
            <button class="btn ghost sm" data-action="refresh" data-i18n="refresh"></button>
            <button class="btn sm" data-action="csv">📥 <span data-i18n="csv"></span></button>
          </div>
        </div>
        <div class="toolbar">
          <input class="input" id="oSearch" type="search" data-i18n-ph="search_ph" autocomplete="off">
          <select class="input" id="oStatus">
            <option value="all" data-i18n="all_status"></option>
            <option value="Pending" data-i18n="st_Pending"></option>
            <option value="Confirmed" data-i18n="st_Confirmed"></option>
            <option value="Delivered" data-i18n="st_Delivered"></option>
            <option value="Cancelled" data-i18n="st_Cancelled"></option>
          </select>
          <select class="input" id="oRange">
            <option value="all" data-i18n="all_time"></option>
            <option value="today" data-i18n="today"></option>
            <option value="7d" data-i18n="last7"></option>
          </select>
        </div>
        <div class="muted" id="oCount" style="margin-bottom:10px;"></div>
        <div class="order-grid" id="oList"></div>
        <div class="more"><button class="btn ghost hidden" id="oMore" data-action="more" data-i18n="load_more"></button></div>
      </section>

      <!-- Product -->
      <section id="v-product" class="view hidden">
        <div class="view-head"><div><h2 data-i18n="prod_title"></h2><p data-i18n="prod_sub"></p></div></div>

        <div class="card">
          <h3 data-i18n="tb_title"></h3>
          <p class="hint-text" style="margin:-4px 0 10px;" data-i18n="tb_hint"></p>
          <div class="grid-2">
            <div class="field"><label for="tbBn" data-i18n="tb_bn"></label><textarea class="input" id="tbBn" rows="2" maxlength="200"></textarea></div>
            <div class="field"><label for="tbEn" data-i18n="tb_en"></label><textarea class="input" id="tbEn" rows="2" maxlength="200"></textarea></div>
          </div>
          <div class="grid-4">
            <div class="field"><label for="tbSize" data-i18n="tb_size"></label><input class="input" type="number" id="tbSize" min="9" max="32" step="1"></div>
            <div class="field"><label for="tbAlign" data-i18n="tb_align"></label>
              <select class="input" id="tbAlign">
                <option value="left" data-i18n="tb_left"></option>
                <option value="center" data-i18n="tb_center"></option>
                <option value="right" data-i18n="tb_right"></option>
              </select>
            </div>
            <div class="field"><label for="tbOffset" data-i18n="tb_offset"></label><input class="input" type="number" id="tbOffset" min="-120" max="120" step="1"></div>
            <div class="field"><label for="tbPad" data-i18n="tb_pad"></label><input class="input" type="number" id="tbPad" min="0" max="40" step="1"></div>
            <div class="field chk-row"><label class="chk"><input type="checkbox" id="tbLangShow"> <span data-i18n="tb_lang_show"></span></label></div>
            <div class="field"><label for="siteLanguage" data-i18n="site_lang_mode"></label><select class="input" id="siteLanguage"><option value="auto" data-i18n="site_lang_auto"></option><option value="bn" data-i18n="site_lang_bn"></option><option value="en" data-i18n="site_lang_en"></option></select></div>
            <div class="field"><label for="tbLangSize" data-i18n="tb_lang_size"></label><input class="input" type="number" id="tbLangSize" min="8" max="28" step="1"></div>
          </div>
          <div class="row" style="justify-content:space-between;">
            <span class="lbl" data-i18n="tb_preview"></span>
            <button type="button" class="btn sm ghost" data-action="tb-reset" data-i18n="tb_reset"></button>
          </div>
          <div class="tb-prev" id="tbPreview"><div class="tb-prev-text" id="tbPreviewText"></div></div>
        </div>

        <div class="card">
          <h3 data-i18n="basic"></h3>
          <div class="field chk-row"><label class="chk"><input type="checkbox" id="pActive"> <span data-i18n="visible_label"></span></label><span class="hint-text" data-i18n="visible_hint"></span></div>
          <div class="field"><label for="pTitle" data-i18n="name_label"></label><input class="input" id="pTitle"></div>
          <div class="field"><label for="pDesc" data-i18n="desc_label"></label><textarea class="input" id="pDesc" rows="4"></textarea></div>
        </div>

        <div class="card">
          <h3 data-i18n="trust_title"></h3>
          <p class="hint-text" style="margin:-4px 0 10px;" data-i18n="trust_hint"></p>
          <div id="trustEditor"></div>
        </div>

        <div class="card">
          <h3 data-i18n="prices"></h3>
          <div class="grid-3">
            <div class="field"><label for="pPrice" data-i18n="offer_price"></label><input class="input" type="number" id="pPrice" min="0"></div>
            <div class="field"><label for="pOldPrice" data-i18n="old_price"></label><input class="input" type="number" id="pOldPrice" min="0"></div>
            <div class="field"><span class="muted" data-i18n="stock_moved"></span></div>
          </div>
        </div>

        <div class="card">
          <h3 data-i18n="variants"></h3>
          <div class="grid-fields">
            <div class="field"><label for="pColors" data-i18n="colors_label"></label><input class="input" id="pColors" placeholder="কালো, সাদা, নীল"></div>
            <div class="field"><label for="pSizes" data-i18n="sizes_label"></label><input class="input" id="pSizes" placeholder="M, L, XL"></div>
            <div class="field"><label for="pDelInside" data-i18n="in_fee"></label><input class="input" type="number" id="pDelInside" min="0"></div>
            <div class="field"><label for="pDelOutside" data-i18n="out_fee"></label><input class="input" type="number" id="pDelOutside" min="0"></div>
            <div class="field"><label for="pPhone" data-i18n="call_no"></label><input class="input" id="pPhone"></div>
            <div class="field"><label for="pWhatsapp" data-i18n="wa_no"></label><input class="input" id="pWhatsapp"></div>
          </div>
        </div>

        <div class="card">
          <h3 data-i18n="images"></h3>
          <div class="grid-2">
            <div class="field">
              <label for="pRatio" data-i18n="ratio_label"></label>
              <select class="input" id="pRatio">
                <option value="auto" data-i18n="ratio_auto"></option>
                <option value="1:1">1:1</option>
                <option value="4:5">4:5</option>
                <option value="3:4">3:4</option>
                <option value="4:3">4:3</option>
                <option value="16:9">16:9</option>
              </select>
            </div>
            <div class="field">
              <label for="pBadge" data-i18n="badge_label"></label>
              <select class="input" id="pBadge">
                <option value="tl" data-i18n="pos_tl"></option>
                <option value="tr" data-i18n="pos_tr"></option>
                <option value="bl" data-i18n="pos_bl"></option>
                <option value="br" data-i18n="pos_br"></option>
              </select>
            </div>
          </div>
          <p class="hint-text" style="margin:-4px 0 12px;" data-i18n="ratio_hint"></p>
          <div class="field">
            <label for="pFiles" data-i18n="upload_images"></label>
            <input class="input" type="file" id="pFiles" accept="image/*" multiple>
          </div>
          <div class="row"><input class="input" id="pImgUrl" data-i18n-ph="or_url"><button class="btn sm ghost" data-action="add-url" data-i18n="add"></button></div>
          <div class="img-list" id="imgPreviewList"></div>
        </div>

        <div class="card">
          <div class="card-head"><h3 data-i18n="nt_title"></h3><button class="btn sm ghost" data-action="notice-add" data-i18n="nt_add"></button></div>
          <p class="hint-text" style="margin:-4px 0 10px;" data-i18n="nt_hint"></p>
          <div id="noticeEditor"></div>
        </div>

        <div class="card">
          <div class="card-head"><h3 data-i18n="faq_section"></h3><button class="btn sm ghost" data-action="faq-add" data-i18n="faq_add"></button></div>
          <div id="faqEditor"></div>
        </div>

        <div class="savebar"><button class="btn" id="saveBtn" data-action="save-product" data-i18n="save_all"></button></div>
        <div class="msg" id="productMsg"></div>
      </section>

      <!-- Offers -->
      <section id="v-offers" class="view hidden">
        <div class="view-head"><div><h2 data-i18n="off_title"></h2><p data-i18n="off_sub"></p></div>
          <button class="btn ghost sm" data-action="refresh" data-i18n="refresh"></button></div>

        <div class="stats" id="offStats"></div>

        <div class="grid-2">
          <div class="card">
            <h3 data-i18n="notes_title"></h3>
            <div class="field">
              <div class="row" style="justify-content:space-between;"><span class="lbl" data-i18n="notes_bulk"></span><label class="chk"><input type="checkbox" id="ntBulkOn"> <span data-i18n="notes_show"></span></label></div>
              <label class="lbl" for="ntBulkBn" data-i18n="notes_bn"></label><textarea class="input" id="ntBulkBn" rows="2"></textarea>
              <label class="lbl" for="ntBulkEn" data-i18n="notes_en"></label><textarea class="input" id="ntBulkEn" rows="2"></textarea>
            </div>
            <div class="field">
              <div class="row" style="justify-content:space-between;"><span class="lbl" data-i18n="notes_coupon"></span><label class="chk"><input type="checkbox" id="ntCouponOn"> <span data-i18n="notes_show"></span></label></div>
              <label class="lbl" for="ntCouponBn" data-i18n="notes_bn"></label><textarea class="input" id="ntCouponBn" rows="2"></textarea>
              <label class="lbl" for="ntCouponEn" data-i18n="notes_en"></label><textarea class="input" id="ntCouponEn" rows="2"></textarea>
            </div>
            <button class="btn" data-action="save-notes" data-i18n="notes_save"></button>
            <div class="msg" id="ntMsg"></div>
          </div>

          <div>
          <div class="card">
            <h3 data-i18n="bulk_title"></h3>
            <p class="hint-text" style="margin:-4px 0 12px;" data-i18n="bulk_hint_admin"></p>
            <div class="grid-2">
              <div class="field chk-row"><label class="chk"><input type="checkbox" id="bkOn"> <span data-i18n="bulk_enabled"></span></label></div>
              <div class="field"><label for="bkMin" data-i18n="bulk_min"></label><input class="input" type="number" id="bkMin" min="2" max="100"></div>
              <div class="field"><label for="bkType" data-i18n="bulk_type"></label><select class="input" id="bkType"><option value="percent" data-i18n="bulk_pct"></option><option value="fixed" data-i18n="bulk_fixed"></option></select></div>
              <div class="field"><label for="bkVal" data-i18n="bulk_value"></label><input class="input" type="number" id="bkVal" min="0"></div>
            </div>
            <button class="btn" data-action="save-bulk" data-i18n="bulk_save"></button>
            <div class="msg" id="bkMsg"></div>
          </div>
          <div class="card">
            <div class="card-head"><div><h3 data-i18n="gv_title"></h3><p class="hint-text" style="margin:0;" data-i18n="gv_sub"></p></div>
              <button type="button" class="btn sm" id="gvToggle" data-action="gv-toggle"></button></div>
            <div class="grid-2">
              <div class="field"><label for="gvWords">1. Words (comma separated, English letters)</label><input class="input" id="gvWords" maxlength="120" placeholder="GIFT, BONUS, THANKS" autocapitalize="characters"><p class="hint-text">The first word previews in Coupon code. Generate picks a word and adds 5 random characters.</p></div>
              <div class="field"><label for="gvCode">2. Coupon code</label>
                <div class="row"><input class="input" id="gvCode" maxlength="20" autocapitalize="characters" style="text-transform:uppercase;"><button class="btn sm ghost" data-action="gv-gen" data-i18n="gv_gen"></button></div></div>
              <div class="field"><label for="gvPct">3. Discount (%)</label><input class="input" type="number" id="gvPct" min="1" max="100"></div>
              <div class="field"><label for="gvMode">4. Give as reward</label>
                <select class="input" id="gvMode">
                  <option value="none">No (Code Only)</option>
                  <option value="every">Every Order</option>
                  <option value="first">First Order Only</option>
                </select>
              </div>
              <div class="field"><label for="gvDays">5. Valid (days, empty = none)</label><input class="input" type="number" id="gvDays" min="0" max="3650"></div>
            </div>
            <button class="btn" data-action="gv-save" data-i18n="gv_save"></button>
            <div class="msg" id="gvMsg"></div>
          </div>
          </div>
        </div>

        <div class="card">
          <h3 data-i18n="cp_title"></h3>
          <p class="hint-text" style="margin:-4px 0 12px;" data-i18n="cp_hint"></p>
          <div class="grid-3">
            <div class="field"><label for="cpWords" data-i18n="cp_words"></label><input class="input" id="cpWords" data-i18n-ph="cp_words_ph" placeholder="EID, SALE" autocapitalize="characters"></div>
            <div class="field"><label for="cpSuffix" data-i18n="cp_suffix"></label><input class="input" type="number" id="cpSuffix" min="2" max="10" value="4"></div>
            <div class="field"><label for="cpEngine" data-i18n="cp_engine"></label>
              <select class="input" id="cpEngine">
                <option value="readable" data-i18n="cp_eng_readable"></option>
                <option value="alnum" data-i18n="cp_eng_alnum"></option>
                <option value="letters" data-i18n="cp_eng_letters"></option>
                <option value="digits" data-i18n="cp_eng_digits"></option>
              </select></div>
          </div>
          <div class="row" style="margin-bottom:12px;">
            <button class="btn sm ghost" data-action="coupon-gen" data-i18n="cp_gen_custom"></button>
            <span class="lbl" data-i18n="cp_preset"></span>
            <button type="button" class="chip" data-action="cp-pct" data-v="5">5%</button>
            <button type="button" class="chip" data-action="cp-pct" data-v="10">10%</button>
            <button type="button" class="chip" data-action="cp-pct" data-v="15">15%</button>
            <button type="button" class="chip" data-action="cp-pct" data-v="20">20%</button>
            <button type="button" class="chip" data-action="cp-pct" data-v="25">25%</button>
            <button type="button" class="chip" data-action="cp-pct" data-v="30">30%</button>
          </div>
          <div class="grid-3">
            <div class="field"><label for="cpCode" data-i18n="cp_code"></label><input class="input" id="cpCode" maxlength="20" autocapitalize="characters" style="text-transform:uppercase;"></div>
            <div class="field"><label for="cpPct" data-i18n="cp_percent"></label><input class="input" type="number" id="cpPct" min="1" max="100" value="10"></div>
            <div class="field"><label for="cpMax" data-i18n="cp_max"></label><input class="input" type="number" id="cpMax" min="0" value="0"></div>
            <div class="field"><label for="cpExpDays" data-i18n="cp_expiry"></label><input class="input" type="number" id="cpExpDays" min="0" max="3650" placeholder="0"></div>
            <div class="field"><label for="cpRule" data-i18n="cp_reward"></label>
              <select class="input" id="cpRule"><option value="none" data-i18n="cp_r_none"></option><option value="every" data-i18n="cp_r_every"></option><option value="first" data-i18n="cp_r_first"></option></select></div>
          </div>
          <div class="row" style="justify-content:space-between;">
            <label class="chk"><input type="checkbox" id="cpActive" checked> <span data-i18n="cp_active"></span></label>
            <button class="btn" data-action="coupon-create" data-i18n="cp_create"></button>
          </div>
          <div class="msg" id="cpMsg"></div>
        </div>

        <div class="card">
          <div class="card-head"><h3 data-i18n="cp_list"></h3>
            <div class="row"><input class="input" id="cpSearch" type="search" data-i18n-ph="cp_search" style="min-width:200px;width:auto;" autocomplete="off"><button class="btn sm ghost" data-action="coupon-hist-all" data-i18n="cp_history"></button></div></div>
          <div class="chips" id="cpChips"></div>
          <div class="table-wrap" id="cpList"></div>
        </div>

        <div class="card">
          <div class="card-head"><div><h3 data-i18n="rh_title"></h3><p class="hint-text" style="margin:0;" data-i18n="rh_sub"></p></div>
            <div class="row"><input class="input" id="rwSearch" type="search" data-i18n-ph="rw_search" style="min-width:200px;width:auto;" autocomplete="off"><button class="btn sm" data-action="rw-export" data-i18n="rh_export"></button></div></div>
          <div class="chips" id="rwChips"></div>
          <p class="hint-text" id="cpPersonalInfo" style="font-weight:700;"></p>
          <div class="table-wrap" id="cpPersonal"></div>
        </div>
      </section>

      <!-- Inventory -->
      <section id="v-inventory" class="view hidden">
        <div class="view-head"><div><h2 data-i18n="inv_title_h"></h2><p data-i18n="inv_sub"></p></div>
          <button class="btn ghost sm" data-action="refresh" data-i18n="refresh"></button></div>

        <div class="card">
          <h3 data-i18n="inv_add_title"></h3>
          <p class="hint-text" style="margin:-4px 0 10px;" data-i18n="inv_add_hint"></p>
          <div class="grid-3">
            <div class="field"><label for="ivColor" data-i18n="inv_add_color"></label><input class="input" id="ivColor" maxlength="40" autocomplete="off"></div>
            <div class="field"><label for="ivSize" data-i18n="inv_add_size"></label><input class="input" id="ivSize" maxlength="40" autocomplete="off"></div>
            <div class="field"><label for="ivQty" data-i18n="inv_add_qty"></label><input class="input" type="number" id="ivQty" min="0" value="0"></div>
          </div>
          <button class="btn" data-action="add-variant" data-i18n="inv_add_btn"></button>
          <div class="msg" id="ivMsg"></div>
        </div>

        <div class="card">
          <div class="table-wrap" id="invBox"></div>
          <div class="row" style="justify-content:space-between;margin-top:14px;">
            <p class="hint-text" data-i18n="inv_note"></p>
            <button class="btn" data-action="save-inv" data-i18n="inv_save"></button>
          </div>
        </div>
      </section>

      <!-- Admins -->
      <section id="v-admins" class="view hidden">
        <div class="view-head"><div><h2 data-i18n="admins_title"></h2><p data-i18n="admins_sub"></p></div></div>
        <div class="card">
          <div class="card-head"><h3 data-i18n="sec_head"></h3><button class="btn sm ghost" data-action="sec-refresh" data-i18n="refresh"></button></div>
          <div class="stats" id="secStats"></div>
          <div class="row" style="justify-content:space-between;"><span class="muted" id="secInfo"></span><button class="btn sm danger" data-action="logout-all" data-i18n="logout_all_btn"></button></div>
        </div>
        <div class="card">
          <h3 data-i18n="add_admin"></h3>
          <div class="grid-2">
            <div class="field"><label for="nuUser" data-i18n="username"></label><input class="input" id="nuUser" autocapitalize="none" placeholder="rahim"></div>
            <div class="field"><label for="nuPass" data-i18n="pw_min8"></label><div class="pw"><input class="input" type="password" id="nuPass" autocomplete="new-password"><button type="button" class="eye" data-action="toggle-pw" data-target="nuPass" aria-label="show" tabindex="-1"></button></div></div>
          </div>
          <button class="btn" data-action="add-user" data-i18n="add_admin_btn"></button>
          <div class="msg" id="userMsg"></div>
        </div>
        <div class="card">
          <h3 data-i18n="admin_list"></h3>
          <div id="userList"></div>
        </div>
      </section>

      <!-- Logs -->
      <section id="v-logs" class="view hidden">
        <div class="view-head"><div><h2 data-i18n="logs_title"></h2><p data-i18n="logs_sub"></p></div>
          <button class="btn ghost sm" data-action="refresh" data-i18n="refresh"></button></div>
        <div class="chips" id="logChips"></div>
        <div class="card"><div class="table-wrap" id="logBox"></div></div>
      </section>

      <!-- Settings -->
      <section id="v-settings" class="view hidden">
        <div class="view-head"><div><h2 data-i18n="settings_title"></h2><p data-i18n="settings_sub"></p></div></div>

        <div class="card settings-security-card">
          <button type="button" class="acc-head" data-action="sa-toggle" aria-expanded="false" aria-controls="saWrap">
            <span class="acc-title" data-i18n="sa_title"></span><span class="acc-arrow" id="saArrow">▸</span>
          </button>
          <div id="saWrap" class="hidden" style="margin-top:12px;">
        <div class="grid-2">
          <div class="card">
            <h3 data-i18n="un_title"></h3>
            <div class="field"><label for="unCur" data-i18n="cur_pw"></label><div class="pw"><input class="input" type="password" id="unCur" autocomplete="current-password"><button type="button" class="eye" data-action="toggle-pw" data-target="unCur" aria-label="show" tabindex="-1"></button></div></div>
            <div class="field"><label for="unNew" data-i18n="un_new"></label><input class="input" id="unNew" autocapitalize="none" autocomplete="off" spellcheck="false"></div>
            <button class="btn" data-action="un-save" data-i18n="un_save"></button>
            <div class="msg" id="unMsg"></div>
          </div>
          <div class="card">
            <h3 data-i18n="pw_section"></h3>
            <div class="field"><label for="cpCurrent" data-i18n="cur_pw"></label><div class="pw"><input class="input" type="password" id="cpCurrent" autocomplete="current-password"><button type="button" class="eye" data-action="toggle-pw" data-target="cpCurrent" aria-label="show" tabindex="-1"></button></div></div>
            <div class="grid-2">
              <div class="field"><label for="cpNew" data-i18n="new_pw"></label><div class="pw"><input class="input" type="password" id="cpNew" autocomplete="new-password"><button type="button" class="eye" data-action="toggle-pw" data-target="cpNew" aria-label="show" tabindex="-1"></button></div></div>
              <div class="field"><label for="cpConfirm" data-i18n="repeat_pw"></label><div class="pw"><input class="input" type="password" id="cpConfirm" autocomplete="new-password"><button type="button" class="eye" data-action="toggle-pw" data-target="cpConfirm" aria-label="show" tabindex="-1"></button></div></div>
            </div>
            <button class="btn" data-action="change-pass" data-i18n="change_pw"></button>
            <div class="msg" id="passMsg"></div>
          </div>
        </div>

          <div class="list-item">
            <div><strong data-i18n="logout_this"></strong><div class="muted" data-i18n="logout_this_d"></div></div>
            <button class="btn ghost sm" data-action="logout" data-i18n="logout"></button>
          </div>
          <div class="list-item">
            <div><strong data-i18n="logout_all"></strong><div class="muted" data-i18n="logout_all_d"></div></div>
            <button class="btn danger sm" data-action="logout-all" data-i18n="logout_all_btn"></button>
          </div>
          </div>
        </div>
        <details class="card settings-accordion" id="clockSettingsAccordion">
          <summary><span>🕒 Time and Date</span></summary>
          <div class="settings-body">
            <div class="clock-hero" id="clockHero">
              <div class="clock-hero-time" id="clockHeroTime">--:--:--</div>
              <div class="clock-hero-date" id="clockHeroDate">Bangladesh Standard Time · UTC+6</div>
            </div>
            <div class="clock-section-label">🌍 World Time</div>
            <div class="world-clock-grid" id="clockWorldGrid"></div>
            <div class="clock-section-label">⚙️ Main Clock Settings</div>
            <div class="grid-2">
              <div class="field"><label for="clockTimezone">Main clock time zone</label><select class="input" id="clockTimezone">
                <option value="Asia/Dhaka">Bangladesh — Dhaka (UTC+6)</option><option value="Asia/Kolkata">India — Kolkata (UTC+5:30)</option>
                <option value="Asia/Dubai">UAE — Dubai (UTC+4)</option><option value="Europe/London">UK — London</option>
                <option value="Europe/Rome">Italy — Rome</option><option value="Asia/Tokyo">Japan — Tokyo (UTC+9)</option>
                <option value="Asia/Singapore">Singapore (UTC+8)</option><option value="America/New_York">USA — New York</option>
                <option value="America/Los_Angeles">USA — Los Angeles</option><option value="UTC">UTC</option>
              </select></div>
              <div class="field"><label for="clockFormat">Time format</label><select class="input" id="clockFormat"><option value="12">12-hour (AM/PM)</option><option value="24">24-hour</option></select></div>
            </div>
            <div class="row" style="gap:18px;flex-wrap:wrap;margin:4px 0 12px;">
              <label class="chk"><input type="checkbox" id="clockShowTime" checked> <span>Show clock in header</span></label>
              <label class="chk"><input type="checkbox" id="clockShowDate" checked> <span>Show date in header</span></label>
            </div>
            <div class="clock-section-label">🎨 Clock Themes</div>
            <div class="clock-theme-grid" id="clockThemeGrid">
              <button type="button" class="clock-theme-choice" data-action="clock-theme" data-v="glass"><span class="clock-theme-swatch" style="background:linear-gradient(135deg,#064e3b,#0f766e)"></span>Glass</button>
              <button type="button" class="clock-theme-choice" data-action="clock-theme" data-v="neon"><span class="clock-theme-swatch" style="background:linear-gradient(135deg,#052e2b,#10b981)"></span>Neon</button>
              <button type="button" class="clock-theme-choice" data-action="clock-theme" data-v="classic"><span class="clock-theme-swatch" style="background:linear-gradient(135deg,#fff7ed,#fb923c)"></span>Classic</button>
              <button type="button" class="clock-theme-choice" data-action="clock-theme" data-v="minimal"><span class="clock-theme-swatch" style="background:linear-gradient(135deg,#94a3b8,#e2e8f0)"></span>Minimal</button>
              <button type="button" class="clock-theme-choice" data-action="clock-theme" data-v="midnight"><span class="clock-theme-swatch" style="background:linear-gradient(135deg,#111827,#312e81)"></span>Midnight</button>
            </div>
            <div class="clock-section-label">🛠️ Manual Time & Date</div>
            <div class="clock-manual-box">
              <label class="chk"><input type="checkbox" id="clockManualEnabled"> <span>Use manually set date & time</span></label>
              <p class="hint-text" style="margin:6px 0 10px;">Manual setting changes this panel's main clock only. World clocks continue showing live time.</p>
              <div class="grid-2">
                <div class="field"><label for="clockManualDate">Date</label><input class="input" type="date" id="clockManualDate"></div>
                <div class="field"><label for="clockManualTime">Time</label><input class="input" type="time" id="clockManualTime" step="1"></div>
              </div>
              <div class="row"><button type="button" class="btn sm" data-action="clock-manual-save">Apply Manual Date & Time</button><button type="button" class="btn sm ghost" data-action="clock-live">Use Live Time</button></div>
            </div>
            <div class="row" style="gap:10px;flex-wrap:wrap;">
              <button class="btn" data-action="clock-save">Save Clock Settings</button>
              <button class="btn ghost" data-action="clock-sync">Sync Accurate Server Time</button>
              <span class="muted" id="clockPreview"></span>
            </div>
            <div class="msg" id="clockMsg"></div>
          </div>
        </details>
        <details class="card settings-accordion" id="idGeneratorAccordion">
          <summary><span>🆔 ID Generator</span><span class="muted">Click to open settings</span></summary>
          <div class="settings-body">
            <p class="hint-text" style="margin:0 0 12px;">Set a custom order ID prefix. Leave empty to automatically use the first 3 letters of the current month.</p>
            <div class="grid-2">
              <div class="field"><label for="orderIdPrefix">Order ID Prefix</label><input class="input" id="orderIdPrefix" maxlength="10" placeholder="Empty = automatic"></div>
              <div class="field"><label>Automatic monthly prefix</label><div class="input" id="orderIdDefault" style="background:#f8fafc;">—</div></div>
            </div>
            <button class="btn" data-action="idgen-save">Save ID Generator</button>
            <div class="msg" id="idGenMsg"></div>
          </div>
        </details>
        <details class="card settings-accordion" id="printerSettingsAccordion">
          <summary><span>🖨️ Print settings</span><span class="muted">Click to open settings</span></summary>
          <div class="settings-body">
            <div class="print-choice-grid">
              <details class="print-choice" name="print-settings-choice" id="invoiceSettingsAccordion">
                <summary><span class="print-choice-icon">📄</span><span class="print-choice-label">Invoice</span><span class="print-choice-arrow">⌄</span></summary>
                <div class="print-choice-body" id="printBox"></div>
              </details>
              <details class="print-choice pos-choice" name="print-settings-choice" id="posSettingsAccordion">
                <summary><span class="print-choice-icon">🧾</span><span class="print-choice-label">POS</span><span class="print-choice-arrow">⌄</span></summary>
                <div class="print-choice-body" id="posPrintBox"></div>
              </details>
            </div>
          </div>
        </details>


      </section>

    </main>
  </div>

  <!-- Modal (order detail / invoice preview) -->
  <div class="overlay" id="modal">
    <div class="sheet">
      <button class="sheet-close" data-action="close-modal" aria-label="close">✕</button>
      <div id="modalBody"></div>
    </div>
  </div>

  <div class="toasts" id="toasts"></div>

  <script nonce="${nonce}">
    const DICT = ${adminDict};
    const TB_DEF = ${tbDefaults};
    const MAX_IMAGES = ${MAX_IMAGES};
    const MAX_NOTICES = ${MAX_NOTICES};
    const LOW_STOCK_VIEW = ${LOW_STOCK};
    const STATUSES = ${JSON.stringify(STATUSES)};
    const VIEWS = ['dashboard', 'orders', 'product', 'offers', 'inventory', 'admins', 'logs', 'settings'];
    const NF = ${JSON.stringify(NOTICE_FONT_CSS)};
    const ACTION_KEYS = {
      login_ok: ['লগইন', 'Login'], login_fail: ['ব্যর্থ লগইন', 'Failed login'], logout_all: ['সব device logout', 'Logout all'],
      order_create: ['নতুন অর্ডার', 'New order'], order_status: ['স্ট্যাটাস বদল', 'Status change'], order_delete: ['অর্ডার ডিলিট', 'Order deleted'],
      order_note: ['অর্ডার নোট', 'Order note'],
      product_update: ['প্রোডাক্ট আপডেট', 'Product updated'], admin_add: ['অ্যাডমিন যোগ', 'Admin added'], admin_delete: ['অ্যাডমিন ডিলিট', 'Admin deleted'],
      admin_reset: ['পাসওয়ার্ড রিসেট', 'Password reset'], password_change: ['পাসওয়ার্ড বদল', 'Password changed'],
      inventory_update: ['স্টক আপডেট', 'Stock updated'], inventory_add: ['প্রোডাক্ট যোগ (ইনভেন্টরি)', 'Product added (inventory)'],
      notes_update: ['নোট পরিবর্তন', 'Notes updated'], bulk_offer: ['বাল্ক অফার', 'Bulk offer'],
      coupon_create: ['কুপন তৈরি', 'Coupon created'], coupon_update: ['কুপন চালু/বন্ধ', 'Coupon toggled'], coupon_delete: ['কুপন ডিলিট', 'Coupon deleted']
    };
    ACTION_KEYS.username_change = ['ইউজারনেম বদল', 'Username changed'];
    ACTION_KEYS.print_save = ['প্রিন্ট ডিজাইন সেভ', 'Print design saved'];
    ACTION_KEYS.giveaway_save = ['Give way সেভ', 'Give way saved'];
    // সার্ভারের বাংলা error বার্তার English অনুবাদ (অ্যাডমিন English মোডে)
    const ERR_EN = {
      'লগইন করুন!': 'Please sign in!',
      'সেশন শেষ হয়েছে': 'Session expired',
      'ইউজারনেম ও পাসওয়ার্ড দিন!': 'Enter username and password!',
      'ইউজারনেম বা পাসওয়ার্ড ভুল!': 'Wrong username or password!',
      'অনেকবার ভুল চেষ্টা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।': 'Too many failed attempts. Try again later.',
      'নতুন পাসওয়ার্ড আগেরটির থেকে আলাদা হতে হবে!': 'New password must differ from the current one!',
      'নতুন পাসওয়ার্ড ৮–২০০ অক্ষরের হতে হবে!': 'New password must be 8–200 characters!',
      'বর্তমান পাসওয়ার্ড ভুল!': 'Current password is wrong!',
      'পাসওয়ার্ড ৮–২০০ অক্ষরের হতে হবে!': 'Password must be 8–200 characters!',
      'ইউজার পাওয়া যায়নি!': 'User not found!',
      'এই ইউজারনেম আগে থেকেই আছে!': 'This username already exists!',
      'ইউজারনেম ৩-৩২ অক্ষর, শুধু a-z, 0-9, _ . - ব্যবহার করুন।': 'Username: 3–32 characters, a-z, 0-9, _ . - only.',
      'নিজেকে ডিলিট করা যাবে না!': 'You cannot delete yourself!',
      'প্রোডাক্টের নাম লিখুন!': 'Enter the product name!',
      'সঠিক অফার মূল্য দিন!': 'Enter a valid offer price!',
      'সংখ্যা ঋণাত্মক হতে পারবে না!': 'Numbers cannot be negative!',
      'অন্তত একটি প্রোডাক্টের ছবি যুক্ত করুন!': 'Add at least one product image!',
      'ছবির লিংক বা ফাইল সঠিক নয়!': 'Invalid image link or file!',
      'ছবির সাইজ অনেক বড়। কম সংখ্যক ছবি দিন বা ছবি ছোট করুন।': 'Images are too large. Use fewer or smaller images.',
      'নোটিসের ছবি অনেক বড়। ছোট ছবি দিন।': 'Notice images are too large. Use smaller images.',
      'অনুরোধ অনেক বড়। ছবির সাইজ কমান।': 'Request too large. Reduce image size.',
      'কল নাম্বার সঠিক নয়!': 'Invalid call number!',
      'WhatsApp নাম্বার সঠিক নয়!': 'Invalid WhatsApp number!',
      'অর্ডার আইডি সঠিক নয়!': 'Invalid order ID!',
      'অর্ডার পাওয়া যায়নি!': 'Order not found!',
      'স্টক না থাকায় অর্ডার আবার চালু করা যাবে না!': 'Cannot reopen: not enough stock!',
      'স্টকের সংখ্যা ০ থেকে ১,০০,০০০ এর মধ্যে হতে হবে!': 'Stock must be between 0 and 100,000!',
      'কালার বা সাইজ অন্তত একটি লিখুন!': 'Enter at least a color or a size!',
      'কালার লিখুন!': 'Enter a color!',
      'সাইজ লিখুন!': 'Enter a size!',
      'কুপন কোড কমপক্ষে ৪ অক্ষরের হতে হবে (A-Z, 0-9)।': 'Coupon code must be at least 4 characters (A-Z, 0-9).',
      'ছাড়ের শতাংশ ১ থেকে ১০০ এর মধ্যে দিন।': 'Discount must be 1–100%.',
      'এই কুপন কোডটি আগে থেকেই আছে।': 'This coupon code already exists.',
      'মেয়াদের তারিখ সঠিক নয়।': 'Invalid expiry date.',
      'এই অনুরোধ অনুমোদিত নয়।': 'This request is not allowed.',
      'সার্ভারে সমস্যা হয়েছে, আবার চেষ্টা করুন।': 'Server error, please try again.',
      'Invalid request': 'Invalid request'
    };
    ERR_EN['নতুন ইউজারনেম আগেরটির থেকে আলাদা হতে হবে!'] = 'New username must differ from the current one!';
    ERR_EN['প্রিন্ট সেটিং অনেক বড়।'] = 'Print settings are too large.';
    ERR_EN['আগে কুপন কোড সেভ করুন।'] = 'Save a coupon code first.';
    ERR_EN['এই কুপন কোড নেই। আগে Create coupon থেকে কুপন তৈরি করুন।'] = 'This coupon code does not exist. Create it in Create coupon first.';
    const NOTICE_DEFAULT = { on: true, head_bn: '', head_en: '', body_bn: '', body_en: '', image: '', font: 'sans', align: 'left', head_size: 20, body_size: 15, head_color: '#0f172a', body_color: '#475569', bg: '', bold: true };
    const DEFAULT_FAQ_BLANK = { qbn: '', qen: '', abn: '', aen: '' };

    // পাসওয়ার্ড দেখানোর চোখ আইকন
    const EYE_SVG = '<svg class="ic-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>' +
      '<svg class="ic-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.9 10.9 0 0 1 12 19c-7 0-11-7-11-7a19.8 19.8 0 0 1 5.06-5.94"/><path d="M9.9 4.24A10.9 10.9 0 0 1 12 5c7 0 11 7 11 7a19.9 19.9 0 0 1-3.17 4.19"/><path d="M1 1l22 22"/></svg>';

    var prefsStore = {
      get: function (k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } },
      set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
    };
    var store = {
      get: function (k) { try { return sessionStorage.getItem(k) || ''; } catch (e) { return ''; } },
      set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
      del: function (k) { try { sessionStorage.removeItem(k); } catch (e) {} }
    };

    var LANG = 'en';
    var TOKEN = store.get('admin_token');
    var ME = null;
    var MUST_CHANGE = false;
    var PRODUCT = {};
    var STATS = {};
    var ORDERS = [];
    var CACHE = {};
    var HAS_MORE = false;
    var REQ_SEQ = 0;
    var VIEW = 'dashboard';
    var IMAGES = [];
    var TRUST = [];
    var FAQS = [];
    var NOTICES = [];
    var searchTimer = null;
    var INV_ROWS = [];

    function $(id) { return document.getElementById(id); }

    function t(key, vars) {
      var s = (DICT[LANG] && DICT[LANG][key]) || DICT.bn[key] || key;
      if (vars) Object.keys(vars).forEach(function (k) { s = s.split('{' + k + '}').join(String(vars[k])); });
      return s;
    }

    function esc(s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    function splitList(str) {
      return String(str || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    }

    function money(n) { return '৳' + Number(n || 0).toLocaleString('en-US'); }
    function statusLabel(st) { return t('st_' + st); }

    var CLOCK_SERVER_OFFSET = 0;
    var CLOCK_WORLD_CITIES = [
      { city:'Dhaka', country:'Bangladesh', zone:'Asia/Dhaka' },
      { city:'Kolkata', country:'India', zone:'Asia/Kolkata' },
      { city:'Dubai', country:'UAE', zone:'Asia/Dubai' },
      { city:'London', country:'UK', zone:'Europe/London' },
      { city:'Rome', country:'Italy', zone:'Europe/Rome' },
      { city:'Tokyo', country:'Japan', zone:'Asia/Tokyo' },
      { city:'Singapore', country:'Singapore', zone:'Asia/Singapore' },
      { city:'New York', country:'USA', zone:'America/New_York' }
    ];

    function clockNow(cfg) {
      var now = new Date(Date.now() + CLOCK_SERVER_OFFSET);
      if (cfg && cfg.manualEnabled && Number.isFinite(Number(cfg.manualEpoch)) && Number.isFinite(Number(cfg.manualAnchor))) {
        now = new Date(Number(cfg.manualEpoch) + (Date.now() - Number(cfg.manualAnchor)));
      }
      return now;
    }

    function getClockSettings() {
      var cfg = { timeZone:'Asia/Dhaka', hour12:true, showTime:true, showDate:true, theme:'glass', manualEnabled:false, manualEpoch:0, manualAnchor:0 };
      try {
        var saved = JSON.parse(prefsStore.get('admin_clock_settings') || '{}');
        if (saved && typeof saved === 'object') {
          if (['Asia/Dhaka','Asia/Kolkata','Asia/Dubai','UTC','Europe/Rome','Europe/London','America/New_York','Asia/Tokyo','Asia/Singapore','America/Los_Angeles'].indexOf(saved.timeZone) >= 0) cfg.timeZone = saved.timeZone;
          if (typeof saved.hour12 === 'boolean') cfg.hour12 = saved.hour12;
          if (typeof saved.showTime === 'boolean') cfg.showTime = saved.showTime;
          if (typeof saved.showDate === 'boolean') cfg.showDate = saved.showDate;
          if (['glass','neon','classic','minimal','midnight'].indexOf(saved.theme) >= 0) cfg.theme = saved.theme;
          if (typeof saved.manualEnabled === 'boolean') cfg.manualEnabled = saved.manualEnabled;
          if (Number.isFinite(Number(saved.manualEpoch))) cfg.manualEpoch = Number(saved.manualEpoch);
          if (Number.isFinite(Number(saved.manualAnchor))) cfg.manualAnchor = Number(saved.manualAnchor);
        }
      } catch (e) {}
      return cfg;
    }

    function fmtDate(s) {
      try {
        var d = new Date(String(s).replace(' ', 'T') + 'Z');
        var cfg = getClockSettings();
        return esc(new Intl.DateTimeFormat(LANG === 'bn' ? 'bn-BD' : 'en-GB', {
          timeZone:cfg.timeZone, year:'numeric', month:'short', day:'2-digit',
          hour:'2-digit', minute:'2-digit', hour12:cfg.hour12
        }).format(d));
      } catch (e) { return esc(s); }
    }

    function fmtInvoiceDate(s) {
      try {
        var d = new Date(String(s).replace(' ', 'T') + 'Z');
        var cfg = getClockSettings();
        return esc(new Intl.DateTimeFormat('en-GB', {
          timeZone: cfg.timeZone, year: 'numeric', month: 'short', day: '2-digit',
          hour: '2-digit', minute: '2-digit', hour12: cfg.hour12
        }).format(d));
      } catch (e) { return esc(s); }
    }

    function formatClockTime(date, zone, hour12) {
      return date.toLocaleTimeString(LANG === 'bn' ? 'bn-BD' : 'en-GB', { timeZone:zone, hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:hour12 });
    }

    function renderWorldClocks() {
      var grid = $('clockWorldGrid');
      if (!grid) return;
      var cfg = getClockSettings();
      var now = new Date(Date.now() + CLOCK_SERVER_OFFSET);
      grid.innerHTML = CLOCK_WORLD_CITIES.map(function (item) {
        var time = formatClockTime(now, item.zone, cfg.hour12);
        var date = now.toLocaleDateString(LANG === 'bn' ? 'bn-BD' : 'en-GB', { timeZone:item.zone, day:'2-digit', month:'short', year:'numeric' });
        return '<div class="world-clock-card"><div class="wc-city">' + esc(item.city + ' · ' + item.country) + '</div><div class="wc-time">' + esc(time) + '</div><div class="wc-date">' + esc(date) + '</div></div>';
      }).join('');
    }

    function renderClockTheme() {
      var cfg = getClockSettings();
      var wrap = $('headerClock');
      if (wrap) {
        wrap.classList.remove('theme-neon','theme-classic','theme-minimal','theme-midnight');
        if (cfg.theme !== 'glass') wrap.classList.add('theme-' + cfg.theme);
      }
      var hero = $('clockHero');
      if (hero) {
        var themes = {
          glass:'linear-gradient(135deg,#064e3b,#0f766e 58%,#0ea5a4)',
          neon:'linear-gradient(135deg,#052e2b,#065f46 55%,#10b981)',
          classic:'linear-gradient(135deg,#7c2d12,#ea580c 55%,#fbbf24)',
          minimal:'linear-gradient(135deg,#475569,#64748b 55%,#cbd5e1)',
          midnight:'linear-gradient(135deg,#111827,#312e81 55%,#4f46e5)'
        };
        hero.style.background = themes[cfg.theme] || themes.glass;
      }
      document.querySelectorAll('[data-action="clock-theme"]').forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-v') === cfg.theme);
      });
    }

    function renderHeaderClock() {
      var wrap = $('headerClock');
      if (!wrap) return;
      var cfg = getClockSettings(), now = clockNow(cfg);
      $('headerClockTime').textContent = cfg.showTime ? formatClockTime(now, cfg.timeZone, cfg.hour12) : '';
      $('headerClockDate').textContent = cfg.showDate ? now.toLocaleDateString(LANG === 'bn' ? 'bn-BD' : 'en-GB', {
        timeZone:cfg.timeZone, day:'2-digit', month:'short', year:'numeric'
      }) : '';
      wrap.classList.toggle('hidden', !cfg.showTime && !cfg.showDate);
      renderClockTheme();
      var heroTime = $('clockHeroTime'), heroDate = $('clockHeroDate');
      if (heroTime) heroTime.textContent = formatClockTime(now, cfg.timeZone, cfg.hour12);
      if (heroDate) heroDate.textContent = now.toLocaleDateString(LANG === 'bn' ? 'bn-BD' : 'en-GB', { timeZone:cfg.timeZone, weekday:'long', day:'2-digit', month:'long', year:'numeric' }) + ' · ' + cfg.timeZone.replace(/_/g,' ');
      renderWorldClocks();
    }

    function updateClockPreview() {
      var zone = $('clockTimezone') ? $('clockTimezone').value : 'Asia/Dhaka';
      var h12 = $('clockFormat') ? $('clockFormat').value === '12' : true;
      var now = clockNow(getClockSettings());
      var time = now.toLocaleTimeString(LANG === 'bn' ? 'bn-BD' : 'en-GB', { timeZone:zone, hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:h12 });
      var date = now.toLocaleDateString(LANG === 'bn' ? 'bn-BD' : 'en-GB', { timeZone:zone, day:'2-digit', month:'short', year:'numeric' });
      if ($('clockPreview')) $('clockPreview').textContent = date + ' · ' + time;
    }

    function loadClockSettings() {
      var cfg = getClockSettings();
      if ($('clockTimezone')) $('clockTimezone').value = cfg.timeZone;
      if ($('clockFormat')) $('clockFormat').value = cfg.hour12 ? '12' : '24';
      if ($('clockShowTime')) $('clockShowTime').checked = cfg.showTime;
      if ($('clockShowDate')) $('clockShowDate').checked = cfg.showDate;
      if ($('clockManualEnabled')) $('clockManualEnabled').checked = cfg.manualEnabled;
      if ($('clockManualDate') && cfg.manualEnabled) {
        var md = new Date(cfg.manualEpoch);
        $('clockManualDate').value = new Intl.DateTimeFormat('en-CA', { timeZone:cfg.timeZone, year:'numeric', month:'2-digit', day:'2-digit' }).format(md);
        $('clockManualTime').value = new Intl.DateTimeFormat('en-GB', { timeZone:cfg.timeZone, hour:'2-digit', minute:'2-digit', second:'2-digit', hourCycle:'h23' }).format(md);
      } else if ($('clockManualDate')) {
        var live = new Date(Date.now() + CLOCK_SERVER_OFFSET);
        $('clockManualDate').value = new Intl.DateTimeFormat('en-CA', { timeZone:cfg.timeZone, year:'numeric', month:'2-digit', day:'2-digit' }).format(live);
        $('clockManualTime').value = new Intl.DateTimeFormat('en-GB', { timeZone:cfg.timeZone, hour:'2-digit', minute:'2-digit', second:'2-digit', hourCycle:'h23' }).format(live);
      }
      renderHeaderClock();
      updateClockPreview();
    }

    function saveClockSettings() {
      var cfg = {
        timeZone:$('clockTimezone').value,
        hour12:$('clockFormat').value === '12',
        showTime:$('clockShowTime').checked,
        showDate:$('clockShowDate').checked,
        theme:getClockSettings().theme,
        manualEnabled:getClockSettings().manualEnabled,
        manualEpoch:getClockSettings().manualEpoch,
        manualAnchor:getClockSettings().manualAnchor
      };
      prefsStore.set('admin_clock_settings', JSON.stringify(cfg));
      loadClockSettings();
      setMsg('clockMsg', t('clock_saved'), true);
      toast(t('clock_saved'), 'ok');
    }

    function clockWallTimeToEpoch(dateValue, timeValue, zone) {
      var d = String(dateValue || '').split('-').map(Number);
      var t = String(timeValue || '').split(':').map(Number);
      if (d.length !== 3 || t.length < 2 || !d[0] || !d[1] || !d[2]) return NaN;
      var target = Date.UTC(d[0], d[1] - 1, d[2], t[0] || 0, t[1] || 0, t[2] || 0);
      var guess = target;
      for (var i = 0; i < 3; i++) {
        var parts = new Intl.DateTimeFormat('en-GB', { timeZone:zone, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit', hourCycle:'h23' }).formatToParts(new Date(guess));
        var vals = {};
        parts.forEach(function (p) { vals[p.type] = Number(p.value); });
        var shown = Date.UTC(vals.year, vals.month - 1, vals.day, vals.hour, vals.minute, vals.second);
        guess += target - shown;
      }
      return guess;
    }

    function saveManualClock() {
      var cfg = getClockSettings();
      var epoch = clockWallTimeToEpoch($('clockManualDate').value, $('clockManualTime').value, $('clockTimezone').value);
      if (!Number.isFinite(epoch)) { setMsg('clockMsg', t('clock_bad_date'), false); return; }
      cfg.timeZone = $('clockTimezone').value;
      cfg.manualEnabled = true;
      cfg.manualEpoch = epoch;
      cfg.manualAnchor = Date.now();
      prefsStore.set('admin_clock_settings', JSON.stringify(cfg));
      loadClockSettings();
      setMsg('clockMsg', t('clock_manual_ok'), true);
      toast(t('clock_manual_ok'), 'ok');
    }

    function useLiveClock() {
      var cfg = getClockSettings();
      cfg.manualEnabled = false;
      cfg.manualEpoch = 0;
      cfg.manualAnchor = 0;
      prefsStore.set('admin_clock_settings', JSON.stringify(cfg));
      loadClockSettings();
      setMsg('clockMsg', t('clock_live_ok'), true);
    }

    function setClockTheme(theme) {
      if (['glass','neon','classic','minimal','midnight'].indexOf(theme) < 0) return;
      var cfg = getClockSettings();
      cfg.theme = theme;
      prefsStore.set('admin_clock_settings', JSON.stringify(cfg));
      renderClockTheme();
      renderHeaderClock();
    }

    async function syncClockFromServer() {
      var started = Date.now();
      try {
        var response = await fetch('/api/time', { cache:'no-store', credentials:'same-origin' });
        if (!response.ok) throw new Error('Time request failed');
        var data = await response.json();
        var serverMs = Number(data && data.now);
        if (!Number.isFinite(serverMs)) throw new Error('Invalid server time');
        CLOCK_SERVER_OFFSET = serverMs + Math.round((Date.now() - started) / 2) - Date.now();
        var cfg = getClockSettings();
        if (!cfg.manualEnabled) renderHeaderClock();
        updateClockPreview();
        setMsg('clockMsg', t('clock_synced'), true);
      } catch (err) {
        setMsg('clockMsg', t('clock_sync_fail'), false);
      }
    }

    function toast(msg, type) {
      var el = document.createElement('div');
      el.className = 'toast ' + (type || '');
      el.textContent = msg;
      $('toasts').appendChild(el);
      setTimeout(function () { el.classList.add('out'); }, 2200);
      setTimeout(function () { el.remove(); }, 2600);
    }

    function setMsg(id, text, ok) {
      var el = $(id);
      el.textContent = text || '';
      el.className = 'msg ' + (ok ? 'ok' : 'err');
    }

    function openModal(html) { $('modalBody').innerHTML = html; $('modal').classList.remove('doc-workspace'); $('modal').classList.add('show'); }
    function closeModal() { $('modal').classList.remove('show', 'doc-workspace'); }

    /* ---------- Password eye ---------- */

    function initEyes() {
      document.querySelectorAll('.eye').forEach(function (b) { b.innerHTML = EYE_SVG; });
    }

    function togglePw(btn) {
      var inp = $(btn.getAttribute('data-target'));
      if (!inp) return;
      var show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      btn.classList.toggle('on', show);
      btn.setAttribute('aria-label', show ? 'hide' : 'show');
    }

    function resetPwFields() {
      document.querySelectorAll('.pw .input').forEach(function (inp) { inp.type = 'password'; });
      document.querySelectorAll('.eye').forEach(function (b) { b.classList.remove('on'); b.setAttribute('aria-label', 'show'); });
    }

    function notify(msg) {
      toast(msg, /সফল|হয়েছে|সেভ|✅|যোগ হয়েছে|কপি|saved|added|copied|updated|deleted/i.test(String(msg)) ? 'ok' : 'err');
    }

    function askDialog(opts) {
      return new Promise(function (resolve) {
        var ov = document.createElement('div');
        ov.className = 'overlay show dlg-ov';
        var inputHtml = opts.input
          ? '<input class="input dlg-in" type="' + (opts.password ? 'password' : 'text') + '" autocomplete="off">'
          : '';
        ov.innerHTML = '<div class="sheet dlg"><p class="dlg-msg"></p>' + inputHtml +
          '<div class="dlg-actions"><button class="btn ghost" data-r="cancel"></button>' +
          '<button class="btn ' + (opts.danger ? 'danger-solid' : '') + '" data-r="ok"></button></div></div>';
        ov.querySelector('.dlg-msg').textContent = opts.msg;
        ov.querySelector('[data-r="cancel"]').textContent = t('cancel');
        ov.querySelector('[data-r="ok"]').textContent = t('ok');
        function done(value) {
          document.removeEventListener('keydown', onKey);
          ov.remove();
          resolve(value);
        }
        function onKey(e) {
          if (e.key === 'Escape') done(opts.input ? null : false);
          if (e.key === 'Enter' && !opts.input) done(true);
          if (e.key === 'Enter' && opts.input) done(ov.querySelector('.dlg-in').value || null);
        }
        ov.addEventListener('click', function (e) {
          var r = e.target.getAttribute && e.target.getAttribute('data-r');
          if (r === 'ok') done(opts.input ? (ov.querySelector('.dlg-in').value || null) : true);
          else if (r === 'cancel') done(opts.input ? null : false);
        });
        document.addEventListener('keydown', onKey);
        document.body.appendChild(ov);
        var inp = ov.querySelector('.dlg-in');
        if (inp) setTimeout(function () { inp.focus(); }, 60);
      });
    }

    function askConfirm(msg, danger) { return askDialog({ msg: msg, danger: danger }); }
    function askText(msg, password) { return askDialog({ msg: msg, input: true, password: password }); }

    /* ---------- Theme & language (admin-এর আলাদা storage key) ---------- */

    function applyTheme(th) {
      document.documentElement.setAttribute('data-theme', th);
      prefsStore.set('admin_theme', th);
    }

    function initTheme() {
      var saved = prefsStore.get('admin_theme');
      if (saved === 'dark' || saved === 'light') { applyTheme(saved); return; }
      var dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(dark ? 'dark' : 'light');
    }

    function toggleTheme() {
      applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    }

    function applyLang() {
      document.documentElement.lang = LANG;
      document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
      document.querySelectorAll('[data-i18n-ph]').forEach(function (el) { el.placeholder = t(el.getAttribute('data-i18n-ph')); });
      document.querySelectorAll('[data-tip]').forEach(function (el) { el.title = t(el.getAttribute('data-tip')); });
      document.querySelectorAll('[data-lang-toggle]').forEach(function (el) { el.textContent = LANG === 'bn' ? 'EN' : 'বাং'; });
      document.querySelectorAll('.nav-btn').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-view') === VIEW); });
    }

    function toggleLang() {
      LANG = LANG === 'bn' ? 'en' : 'bn';
      prefsStore.set('admin_lang', LANG);
      applyLang();
      if (TOKEN && ME) {
        $('todayText').textContent = todayString();
        renderEditors();
        renderTbPreview();
        renderInventory();
        refreshCurrent();
      }
      if ($('modal').classList.contains('show')) closeModal();
    }

    function todayString() {
      return new Date().toLocaleDateString(LANG === 'bn' ? 'bn-BD' : 'en-GB', { timeZone: 'Asia/Dhaka', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }

    /* ---------- API ---------- */

    async function api(path, method, body) {
      var opts = { method: method || 'GET', headers: {} };
      if (TOKEN) opts.headers['Authorization'] = 'Bearer ' + TOKEN;
      if (body !== undefined) {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(body);
      }
      var res;
      try { res = await fetch(path, opts); }
      catch (e) { return { ok: false, status: 0, data: { error: t('net_error') } }; }
      var data = await res.json().catch(function () { return {}; });
      if (LANG === 'en' && data && data.error && ERR_EN[data.error]) data.error = ERR_EN[data.error];
      if (res.status === 401 && path !== '/api/admin/login') {
        forceLogout(t('session_expired'));
      }
      return { ok: res.ok, status: res.status, data: data };
    }

    function cacheOrders(list) {
      list.forEach(function (o) { CACHE[o.public_id] = o; });
    }

    /* ---------- Auth ---------- */

    var LOGIN_PALETTES = [
      ['#fb8989','#ffc0cb','#81445b'], ['#f29aa0','#f7c2ad','#6f4054'], ['#e98291','#f4a99f','#573b5b'],
      ['#7dd3fc','#bae6fd','#0c4a6e'], ['#86efac','#bbf7d0','#14532d'], ['#c4b5fd','#ddd6fe','#4c1d95'],
      ['#fcd34d','#fde68a','#78350f'], ['#5eead4','#99f6e4','#134e4a'], ['#fdba74','#fed7aa','#7c2d12'],
      ['#a5b4fc','#c7d2fe','#312e81'], ['#f9a8d4','#fbcfe8','#831843'], ['#bef264','#d9f99d','#365314']
    ];

    // প্রতিবার লগইন পাতা এলে আলাদা রঙ; আগের বারের রঙ (reload-এর পরেও) আবার আসবে না
    function pickLoginColor() {
      var last = parseInt(prefsStore.get('admin_login_palette'), 10);
      var idx;
      do { idx = Math.floor(Math.random() * LOGIN_PALETTES.length); }
      while (LOGIN_PALETTES.length > 1 && idx === last);
      prefsStore.set('admin_login_palette', String(idx));
      var c = LOGIN_PALETTES[idx];
      var lv = $('loginView');
      lv.style.setProperty('--login-a', c[0]);
      lv.style.setProperty('--login-b', c[1]);
      lv.style.setProperty('--login-c', c[2]);
    }

    function showLogin(msg) {
      $('appView').classList.add('hidden');
      $('loginView').classList.remove('hidden');
      $('loginErr').textContent = msg || '';
      pickLoginColor();
      resetPwFields();
    }

    function showApp() {
      $('loginView').classList.add('hidden');
      $('appView').classList.remove('hidden');
      loadClockSettings();
      $('whoBadge').textContent = (ME.username || 'A').charAt(0).toUpperCase();
      $('pwBanner').classList.toggle('hidden', !MUST_CHANGE);
      $('todayText').textContent = todayString();
      var saved = store.get('admin_view');
      go(VIEWS.indexOf(saved) >= 0 ? saved : 'dashboard');
    }

    function forceLogout(msg) {
      TOKEN = '';
      ME = null;
      MUST_CHANGE = false;
      store.del('admin_token');
      closeModal();
      showLogin(msg);
    }

    async function boot() {
      if (!TOKEN) { showLogin(''); return; }
      var r = await api('/api/admin/me');
      if (r.ok) {
        ME = r.data.user;
        MUST_CHANGE = !!r.data.mustChangePassword;
        showApp();
      } else {
        showLogin('');
      }
    }

    async function doLogin() {
      $('loginErr').textContent = '';
      pickLoginColor();
      var r = await api('/api/admin/login', 'POST', {
        username: $('loginUser').value.trim(),
        password: $('loginPass').value
      });
      if (!r.ok) { $('loginErr').textContent = r.data.error || t('login_fail'); return; }
      TOKEN = r.data.token;
      store.set('admin_token', TOKEN);
      ME = r.data.user;
      MUST_CHANGE = !!r.data.mustChangePassword;
      $('loginPass').value = '';
      resetPwFields();
      showApp();
    }

    async function logout() {
      await api('/api/admin/logout', 'POST');
      forceLogout('');
    }

    async function logoutAll() {
      if (!(await askConfirm(t('logout_all_confirm'), true))) return;
      await api('/api/admin/logout-all', 'POST');
      forceLogout(t('logged_out_all'));
    }

    /* ---------- Navigation ---------- */

    function go(view) {
      VIEW = view;
      store.set('admin_view', view);
      document.querySelectorAll('.view').forEach(function (v) {
        v.classList.toggle('hidden', v.id !== 'v-' + view);
      });
      document.querySelectorAll('.nav-btn').forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-view') === view);
      });
      if (view === 'dashboard') loadDashboard();
      if (view === 'orders') loadOrders(true);
      if (view === 'product') loadProduct();
      if (view === 'offers') loadOffers();
      if (view === 'inventory') loadInventory();
      if (view === 'admins') loadUsers();
      if (view === 'logs') loadLogs();
      if (view === 'settings') loadIdGenerator();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function refreshCurrent() {
      if (VIEW === 'dashboard') loadDashboard();
      else if (VIEW === 'orders') loadOrders(true);
      else if (VIEW === 'offers') loadOffers();
      else if (VIEW === 'inventory') loadInventory();
      else if (VIEW === 'admins') loadUsers();
      else if (VIEW === 'logs') loadLogs();
      else if (VIEW === 'settings') loadIdGenerator();
    }

    /* ---------- Pull-to-refresh & swipe ---------- */

    var TOUCH = null;

    function touchIgnored(target) {
      return !!(target.closest && target.closest('input, textarea, select, .table-wrap, .nav, .sheet, .topbar, .toasts, .thumbs'));
    }

    function showPtr(text) {
      var el = $('ptr');
      el.textContent = text;
      el.classList.add('show');
    }

    function hidePtr() { $('ptr').classList.remove('show'); }

    document.addEventListener('touchstart', function (e) {
      if (!TOKEN || $('modal').classList.contains('show')) { TOUCH = null; return; }
      var tp = e.touches[0];
      TOUCH = { x: tp.clientX, y: tp.clientY, atTop: window.scrollY <= 0, ignore: touchIgnored(e.target), pulled: 0 };
    }, { passive: true });

    document.addEventListener('touchmove', function (e) {
      if (!TOUCH || TOUCH.ignore) return;
      var tp = e.touches[0];
      var dy = tp.clientY - TOUCH.y;
      var dx = tp.clientX - TOUCH.x;
      if (TOUCH.atTop && dy > 60 && Math.abs(dx) < 50) {
        TOUCH.pulled = dy;
        showPtr(dy > 110 ? t('refreshing') : '↓');
      }
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
      if (!TOUCH || TOUCH.ignore) { TOUCH = null; return; }
      var tp = e.changedTouches[0];
      var dx = tp.clientX - TOUCH.x;
      var dy = tp.clientY - TOUCH.y;

      if (TOUCH.pulled > 110 && Math.abs(dx) < 50) {
        showPtr(t('refreshing'));
        if (VIEW !== 'product') refreshCurrent();
        setTimeout(function () { showPtr(t('refreshed')); setTimeout(hidePtr, 900); }, 500);
      } else {
        hidePtr();
        if (Math.abs(dx) > 70 && Math.abs(dy) < 50) {
          var idx = VIEWS.indexOf(VIEW);
          var next = dx < 0 ? Math.min(VIEWS.length - 1, idx + 1) : Math.max(0, idx - 1);
          if (next !== idx) go(VIEWS[next]);
        }
      }
      TOUCH = null;
    }, { passive: true });

    /* ---------- Dashboard ---------- */

    async function loadDashboard() {
      var rs = await Promise.all([api('/api/admin/stats'), api('/api/admin/orders')]);
      var s = rs[0];
      var r = rs[1];
      if (s.ok) {
        STATS = s.data.stats || {};
        PRODUCT = s.data.product || PRODUCT;
        renderStats();
        renderBars();
        renderStock();
        renderDaily();
      }
      if (r.ok) {
        var recent = (r.data.orders || []).slice(0, 6);
        cacheOrders(recent);
        $('recentList').innerHTML = recent.length
          ? recent.map(orderCardHtml).join('')
          : '<div class="empty">' + esc(t('no_orders_yet')) + '</div>';
      }
    }

    function statCard(label, val, icon, color) {
      return '<div class="stat ' + color + '"><div class="sicon">' + icon + '</div><div>' +
        '<div class="sval">' + esc(val) + '</div><div class="slabel">' + esc(label) + '</div></div></div>';
    }

    function renderStats() {
      var s = STATS;
      $('statsGrid').innerHTML = [
        statCard(t('stat_total'), s.total || 0, '📦', 'blue'),
        statCard(t('stat_today'), s.today || 0, '🌅', 'green'),
        statCard(t('stat_pending'), s.pending || 0, '⏳', 'amber'),
        statCard(t('stat_revenue'), money(s.delivered_revenue), '💰', 'purple')
      ].join('');
    }

    function renderBars() {
      var total = Number(STATS.total) || 0;
      $('statusBars').innerHTML = STATUSES.map(function (st) {
        var count = Number(STATS[st.toLowerCase()]) || 0;
        var pct = total ? Math.round(count / total * 100) : 0;
        return '<div class="bar-row"><div class="bar-top"><span>' + esc(statusLabel(st)) + '</span><span>' + count + '</span></div>' +
          '<div class="bar"><span style="width:' + pct + '%"></span></div></div>';
      }).join('');
    }

    function renderStock() {
      var stock = Number(PRODUCT.stock) || 0;
      var low = stock <= LOW_STOCK_VIEW;
      var badge = low
        ? '<span class="badge s-Cancelled">' + esc(t('stock_low')) + '</span>'
        : '<span class="badge s-Delivered">' + esc(t('stock_ok')) + '</span>';
      $('stockBox').innerHTML =
        '<div class="kpi"><span>' + esc(t('name_label')) + '</span><strong>' + esc(PRODUCT.title || '—') + '</strong></div>' +
        '<div class="kpi"><span>' + esc(t('offer_price')) + '</span><strong>' + money(PRODUCT.price) + '</strong></div>' +
        '<div class="kpi"><span>' + esc(t('stock_label')) + '</span><strong>' + stock + ' ' + esc(t('qty_unit')) + ' ' + badge + '</strong></div>' +
        '<div class="kpi"><span>' + esc(statusLabel('Cancelled')) + '</span><strong>' + (STATS.cancelled || 0) + '</strong></div>';
    }

    function renderDaily() {
      var map = {};
      (STATS.daily || []).forEach(function (d) { map[d.d] = d; });
      var days = [];
      for (var i = 6; i >= 0; i--) {
        var key = new Date(Date.now() + 6 * 3600 * 1000 - i * 86400000).toISOString().slice(0, 10);
        var row = map[key] || {};
        days.push({ key: key, c: Number(row.c) || 0, t: Number(row.t) || 0 });
      }
      var max = Math.max.apply(null, days.map(function (d) { return d.c; })) || 1;
      $('dailyBox').innerHTML = '<div class="chart">' + days.map(function (d) {
        var h = Math.round(d.c / max * 100);
        return '<div class="col"><div class="cnt">' + d.c + '</div><div class="bar-v"><span style="height:' + h + '%"></span></div>' +
          '<div class="lbl">' + esc(d.key.slice(5)) + '</div><div class="sales">' + money(d.t) + '</div></div>';
      }).join('') + '</div>';
    }

    /* ---------- Orders ---------- */

    function orderCardHtml(o) {
      return '<div class="ocard" data-action="open-order" data-pid="' + esc(o.public_id) + '">' +
        '<div class="ohead"><span class="pid" data-action="copy" data-copy="' + esc(o.public_id) + '">' + esc(o.public_id) + '</span>' +
        '<span class="badge s-' + esc(o.status) + '">' + esc(statusLabel(o.status)) + '</span></div>' +
        '<div class="oname">' + esc(o.customer_name) + '</div>' +
        '<div class="ometa">📞 ' + esc(o.phone) + ' · ' + esc(o.delivery_area || '') + '</div>' +
        '<div class="ofoot"><strong>' + money(o.total) + '</strong><small>' + fmtDate(o.created_at) + '</small></div>' +
        '</div>';
    }

    async function loadOrders(reset) {
      var seq = ++REQ_SEQ;
      var offset = reset ? 0 : ORDERS.length;
      var q = encodeURIComponent($('oSearch').value.trim());
      var st = encodeURIComponent($('oStatus').value);
      var rg = encodeURIComponent($('oRange').value);
      var r = await api('/api/admin/orders?q=' + q + '&status=' + st + '&range=' + rg + '&offset=' + offset);
      if (seq !== REQ_SEQ) return;
      if (!r.ok) return;
      var list = r.data.orders || [];
      cacheOrders(list);
      ORDERS = reset ? list : ORDERS.concat(list);
      HAS_MORE = !!r.data.hasMore;
      renderOrders();
    }

    function renderOrders() {
      var countText = t('orders_count', { n: ORDERS.length }) + (HAS_MORE ? ' ' + t('more_avail') : '');
      $('oCount').textContent = countText;
      $('oList').innerHTML = ORDERS.length
        ? ORDERS.map(orderCardHtml).join('')
        : '<div class="empty">' + esc(t('no_orders')) + '</div>';
      $('oMore').classList.toggle('hidden', !HAS_MORE);
    }

    function linesText(o) {
      var lines = o.lines && o.lines.length ? o.lines : [{ color: o.selected_color, size: o.selected_size, qty: o.quantity }];
      return lines.map(function (l) {
        return (l.color || '-') + ' / ' + (l.size || '-') + ' × ' + l.qty;
      }).join('; ');
    }

    function openOrder(pid) {
      var o = CACHE[pid];
      if (!o) return;
      var phoneDigits = String(o.phone).replace(/[^0-9]/g, '');
      var waText = (LANG === 'bn'
        ? 'আসসালামু আলাইকুম, আপনার অর্ডার ' + pid + ' সম্পর্কে যোগাযোগ করছি।'
        : 'Hello, I am contacting you regarding your order ' + pid + '.');
      var wa = 'https://wa.me/88' + phoneDigits + '?text=' + encodeURIComponent(waText);
      var opts = STATUSES.map(function (s) {
        return '<option value="' + s + '"' + (s === o.status ? ' selected' : '') + '>' + esc(statusLabel(s)) + '</option>';
      }).join('');
      openModal(
        '<div class="mhead"><span class="pid">' + esc(pid) + '</span>' +
          '<span class="badge s-' + esc(o.status) + '">' + esc(statusLabel(o.status)) + '</span></div>' +
        '<h3>' + esc(o.customer_name) + '</h3>' +
        '<dl class="kv">' +
          '<dt>' + esc(t('d_phone')) + '</dt><dd>' + esc(o.phone) + '</dd>' +
          '<dt>' + esc(t('d_address')) + '</dt><dd>' + esc(o.address) + '</dd>' +
          '<dt>' + esc(t('d_area')) + '</dt><dd>' + esc(o.delivery_area) + '</dd>' +
          '<dt>' + esc(t('d_variant')) + '</dt><dd>' + esc(linesText(o)) + '</dd>' +
          '<dt>' + esc(t('d_qty')) + '</dt><dd>' + Number(o.quantity) + ' ' + esc(t('qty_unit')) + '</dd>' +
          (Number(o.bulk_discount) > 0 ? '<dt>' + esc(t('d_bulk')) + '</dt><dd>-' + money(o.bulk_discount) + '</dd>' : '') +
          (Number(o.coupon_discount) > 0 ? '<dt>' + esc(t('d_coupon')) + '</dt><dd>-' + money(o.coupon_discount) + ' (' + esc(o.coupon_code) + ')</dd>' : '') +
          '<dt>' + esc(t('d_delivery')) + '</dt><dd>' + money(o.delivery_charge) + '</dd>' +
          '<dt>' + esc(t('d_total')) + '</dt><dd><strong>' + money(o.total) + '</strong></dd>' +
          '<dt>' + esc(t('d_time')) + '</dt><dd>' + fmtDate(o.created_at) + '</dd>' +
        '</dl>' +
        '<div class="order-status-row"><label class="field"><span class="lbl">' + esc(t('d_status')) + '</span><select class="input" data-action="status" data-pid="' + esc(pid) + '">' + opts + '</select></label><label class="field"><span class="lbl">' + esc(t('pay_method')) + '</span><select class="input" data-action="payment-method" data-pid="' + esc(pid) + '"><option value=""' + (!o.payment_method ? ' selected' : '') + '>' + esc(t('pay_select')) + '</option><option value="Paid"' + (o.payment_method === 'Paid' ? ' selected' : '') + '>' + esc(t('pay_paid')) + '</option><option value="Delivery"' + (o.payment_method === 'Delivery' ? ' selected' : '') + '>' + esc(t('pay_delivery')) + '</option><option value="COD"' + (o.payment_method === 'COD' ? ' selected' : '') + '>' + esc(t('pay_cod')) + '</option><option value="Partial"' + (o.payment_method === 'Partial' ? ' selected' : '') + '>' + esc(t('pay_partial')) + '</option></select></label></div>' +
        '<div class="field order-payment-amount" ' + (o.payment_method === 'Partial' ? '' : 'hidden') + '><span class="lbl">' + esc(t('pay_received')) + '</span><div class="order-payment-controls"><input class="input" type="number" min="0" max="' + Number(o.total || 0) + '" step="1" data-role="payment-amount-input" data-pid="' + esc(pid) + '" value="' + Number(o.payment_received || 0) + '" placeholder="' + esc(t('pay_received_placeholder')) + '"><button type="button" class="btn" data-action="save-payment-amount" data-pid="' + esc(pid) + '">Save</button></div></div>' +
        '<label class="field"><span class="lbl">' + esc(t('note_label')) + '</span><textarea class="input" id="orderNote" rows="2">' + esc(o.note || '') + '</textarea></label>' +
        '<button class="btn ghost block" data-action="save-note" data-pid="' + esc(pid) + '">' + esc(t('note_save')) + '</button>' +
        '<div class="actions5">' +
          '<a class="btn call" href="tel:' + esc(o.phone) + '">' + esc(t('act_call')) + '</a>' +
          '<a class="btn wa" target="_blank" rel="noopener noreferrer" href="' + esc(wa) + '">' + esc(t('act_wa')) + '</a>' +
          '<button class="btn doc-action invoice-action" data-action="preview" data-pid="' + esc(pid) + '"><span class="doc-action-icon">📄</span><span>Invoice</span></button>' +
          '<button class="btn doc-action pos-action" data-action="preview-pos" data-pid="' + esc(pid) + '"><span class="doc-action-icon">🧾</span><span>POS</span></button>' +
          '<button class="btn ghost" data-action="copy" data-copy="' + esc(pid) + '">' + esc(t('act_copy')) + '</button>' +
        '</div>' +
        '<button class="btn danger block" data-action="delete-order" data-pid="' + esc(pid) + '">' + esc(t('delete_order')) + '</button>'
      );
    }

    async function updatePayment(pid, method, received) {
      var total = Number((CACHE[pid] || {}).total || 0);
      var amount = Number(received);
      if (method === 'Partial' && (!Number.isFinite(amount) || amount < 0 || amount > total)) {
        toast('Received amount must be between ৳0 and the order total.', 'err');
        openOrder(pid);
        return;
      }
      var saved = method === 'Paid' ? total : method === 'Delivery' ? Math.max(0, Number((CACHE[pid] || {}).delivery_charge) || 0) : method === 'COD' || !method ? 0 : Math.round(amount);
      var r = await api('/api/admin/order/payment', 'POST', { publicId: pid, paymentMethod: method, paymentReceived: saved });
      if (!r.ok) { toast(r.data.error || 'Could not update payment details.', 'err'); openOrder(pid); return; }
      if (CACHE[pid]) { CACHE[pid].payment_method = method; CACHE[pid].payment_received = saved; }
      toast('Payment details saved.', 'ok');
      refreshCurrent();
      openOrder(pid);
    }

    async function updateStatus(pid, status) {
      var r = await api('/api/admin/order/status', 'POST', { publicId: pid, status: status });
      if (!r.ok) { toast(r.data.error || t('status_fail'), 'err'); openOrder(pid); return; }
      if (CACHE[pid]) CACHE[pid].status = status;
      toast(t('status_updated'), 'ok');
      refreshCurrent();
      openOrder(pid);
    }

    async function deleteOrder(pid) {
      if (!(await askConfirm(t('delete_confirm', { id: pid }), true))) return;
      var r = await api('/api/admin/order/delete', 'POST', { publicId: pid });
      if (!r.ok) { toast(r.data.error || t('status_fail'), 'err'); return; }
      delete CACHE[pid];
      closeModal();
      toast(t('deleted'), 'ok');
      refreshCurrent();
    }

    function copyText(text) {
      var done = function () { toast(t('copied', { id: text }), 'ok'); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { toast(t('copy_fail'), 'err'); });
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { toast(t('copy_fail'), 'err'); }
        ta.remove();
      }
    }

    async function saveNote(pid) {
      var r = await api('/api/admin/order/note', 'POST', { publicId: pid, note: $('orderNote').value });
      if (r.ok) {
        if (CACHE[pid]) CACHE[pid].note = $('orderNote').value;
        toast(t('note_saved'), 'ok');
      } else {
        toast(r.data.error || t('status_fail'), 'err');
      }
    }

    /* ---------- Printer: invoice & POS documents ---------- */

    var PRINT = { invoice: null, pos: null };
    var PRINT_SAVED = null;
    var PRINT_TAB = 'invoice';

    var PRINT_THEMES = [
      { id: 'emerald', name: 'Emerald', primary: '#065f46', text: '#0f172a', bg: '#ffffff', line: '#cbd5e1', header: true, font: 'sans' },
      { id: 'ocean', name: 'Ocean', primary: '#0c4a6e', text: '#0f172a', bg: '#ffffff', line: '#bae6fd', header: true, font: 'sans' },
      { id: 'sunset', name: 'Sunset', primary: '#9a3412', text: '#1c1917', bg: '#fffbf5', line: '#fed7aa', header: true, font: 'serif' },
      { id: 'royal', name: 'Royal', primary: '#4c1d95', text: '#1e1b4b', bg: '#ffffff', line: '#ddd6fe', header: true, font: 'serif' },
      { id: 'rose', name: 'Rose', primary: '#9f1239', text: '#1f1f1f', bg: '#ffffff', line: '#fecdd3', header: true, font: 'sans' },
      { id: 'gold', name: 'Gold', primary: '#92400e', text: '#292524', bg: '#fffdf7', line: '#fde68a', header: false, font: 'serif' },
      { id: 'slate', name: 'Slate', primary: '#334155', text: '#0f172a', bg: '#f8fafc', line: '#e2e8f0', header: true, font: 'mono' },
      { id: 'forest', name: 'Forest', primary: '#14532d', text: '#14291b', bg: '#ffffff', line: '#bbf7d0', header: true, font: 'sans' },
      { id: 'minimal', name: 'Minimal', primary: '#111827', text: '#111827', bg: '#ffffff', line: '#d1d5db', header: false, font: 'sans' },
      { id: 'mono', name: 'Mono Classic', primary: '#000000', text: '#000000', bg: '#ffffff', line: '#000000', header: false, font: 'mono' }
    ];

    // POS/থার্মাল প্রিন্টারের জন্য আলাদা থিম (বেশিরভাগ থার্মাল প্রিন্টার কালো-সাদা)
    var POS_THEMES = [
      { id: 'p_classic', name: 'Classic Thermal', primary: '#000000', text: '#000000', bg: '#ffffff', line: '#000000', header: false, font: 'mono' },
      { id: 'p_inverse', name: 'Inverse Band', primary: '#000000', text: '#000000', bg: '#ffffff', line: '#000000', header: true, font: 'sans' },
      { id: 'p_bold', name: 'Bold Retail', primary: '#000000', text: '#000000', bg: '#ffffff', line: '#000000', header: true, font: 'display' },
      { id: 'p_dotted', name: 'Dotted Slip', primary: '#222222', text: '#222222', bg: '#ffffff', line: '#888888', header: false, font: 'mono' },
      { id: 'p_boxed', name: 'Boxed', primary: '#000000', text: '#000000', bg: '#ffffff', line: '#000000', header: false, font: 'sans' },
      { id: 'p_soft', name: 'Soft Grey', primary: '#374151', text: '#1f2937', bg: '#fafafa', line: '#d1d5db', header: false, font: 'sans' },
      { id: 'p_kitchen', name: 'Kitchen Ticket', primary: '#000000', text: '#000000', bg: '#ffffff', line: '#000000', header: true, font: 'display' },
      { id: 'p_serif', name: 'Serif Receipt', primary: '#000000', text: '#111111', bg: '#ffffff', line: '#000000', header: false, font: 'serif' },
      { id: 'p_compact', name: 'Compact Mono', primary: '#000000', text: '#000000', bg: '#ffffff', line: '#000000', header: false, font: 'mono' },
      { id: 'p_color', name: 'Colour Printer', primary: '#065f46', text: '#111111', bg: '#ffffff', line: '#a7f3d0', header: true, font: 'sans' }
    ];

    function themeList() { return PRINT_TAB === 'pos' ? POS_THEMES : PRINT_THEMES; }

    var PRINT_KEYS = ['num', 'customer', 'phone', 'address', 'area', 'product', 'color', 'size', 'qty', 'unit',
      'subtotal', 'bulk', 'coupon', 'delivery', 'status', 'payment', 'date', 'contact'];

    var PRINT_LABEL = {
      num: ['ক্রমিক (#)', 'Row number (#)'],
      customer: ['গ্রাহকের নাম', 'Customer name'], phone: ['ফোন', 'Phone'], address: ['ঠিকানা', 'Address'],
      area: ['ডেলিভারি এরিয়া', 'Delivery area'], product: ['প্রোডাক্ট', 'Product'], color: ['কালার', 'Color'],
      size: ['সাইজ', 'Size'], qty: ['পরিমাণ', 'Quantity'], unit: ['একক দাম', 'Unit price'],
      subtotal: ['সাবটোটাল', 'Subtotal'], bulk: ['বাল্ক ছাড়', 'Bulk discount'], coupon: ['কুপন ছাড়', 'Coupon discount'],
      delivery: ['ডেলিভারি চার্জ', 'Delivery charge'], status: ['স্ট্যাটাস', 'Status'], payment: ['পেমেন্ট', 'Payment'],
      date: ['তারিখ', 'Date'], contact: ['যোগাযোগ', 'Contact']
    };

    var PD_PAGE = { A4: [210, 'A4'], A5: [148, 'A5'], Letter: [216, 'letter'], '80mm': [80, '80mm auto'], '58mm': [58, '58mm auto'] };

    // সব selector একটি scope id-র ভেতরে থাকে, তাই দুটি preview একে অপরের স্টাইল বদলায় না
    function pdCss(c, sc) {
      var R = '#' + sc;
      var P = R + ' ';
      var pw = (PD_PAGE[c.page] || PD_PAGE.A4)[0];
      var fam = NF[c.font] || NF.sans;
      var band = c.header_bg;
      var fs = c.base;
      var pad = c.compact ? 2 : 4;
      var rad = Number(c.box_radius) || 0;
      var thermal = c.page === '58mm' || c.page === '80mm';
      var narrow58 = c.page === '58mm';
      var thermalLogoPct = narrow58 ? 31 : 29;
      var thermalMargin = narrow58 ? Math.min(Math.max(Number(c.margin) || 0, 0), 1.2) : Math.min(Math.max(Number(c.margin) || 0, 0), 1.8);
      var thermalPad = narrow58 ? 1 : 2;
      return R + '{position:relative;overflow:hidden;font-family:' + fam + ';font-size:' + fs + 'px;font-weight:' + (Number(c.font_weight) || 400) +
        ';color:' + c.text + ';background:' + c.bg + ';padding:' + (thermal ? thermalMargin : c.margin) + 'mm;width:' + pw + 'mm;max-width:none;margin:0 auto;box-sizing:border-box;line-height:' +
        (thermal ? (narrow58 ? '1.22' : '1.28') : ((Number(c.line_h) || 150) / 100)) + ';text-align:' + (c.align || 'left') + '}' +
        P + 'p{margin:0 0 2px}' +
        P + '.pd-head{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(64px,auto) minmax(0,1fr);column-gap:10px;row-gap:8px;align-items:start;width:100%;min-width:0;' +
          (band ? 'background:' + c.primary + ';color:#fff;padding:' + (pad + 8) + 'px 14px;border-radius:' + rad + 'px;' : 'padding-bottom:' + pad + 'px;') + '}' +
        P + '.pd-brand-group{grid-column:1;display:block;min-width:0;width:100%;max-width:100%;padding-right:4px;}' +
        P + '.pd-brand-copy{display:block;min-width:0;width:100%;}' +
        P + '.pd-logo{position:absolute;left:calc(50% - ' + (Number(c.logo_w) / 2) + 'px + ' + (Number(c.logo_x) || 0) + 'px);top:' + (Number(c.logo_y) || 0) + 'px;right:auto;z-index:2;display:block;width:auto;max-width:' + c.logo_w + 'px;max-height:' + Math.round(c.logo_w * 0.65) + 'px;object-fit:contain;object-position:center;margin:0;}' +
        P + '.pd-brand{font-size:' + Math.round(fs * 1.6) + 'px;font-weight:900;letter-spacing:.3px;line-height:1.2;color:' + (band ? '#fff' : c.primary) + ';overflow-wrap:anywhere;word-break:break-word;}' +
        P + '.pd-tag{font-size:' + Math.round(fs * 0.9) + 'px;opacity:.85;overflow-wrap:anywhere;}' +
        P + '.pd-meta{grid-column:3;font-size:' + Math.round(fs * 0.9) + 'px;text-align:right;justify-self:end;min-width:0;max-width:100%;overflow-wrap:anywhere;}' +
        P + '.pd-meta b{display:block;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:' + Math.round(fs * 1.05) + 'px;overflow-wrap:anywhere;word-break:break-word}' +
        P + '.pd-meta-line{display:block;overflow-wrap:anywhere;word-break:break-word;}' +
        P + '.pd-line{border-top:1px dashed ' + c.line + ';margin:' + (pad + 4) + 'px 0}' +
        P + '.pd-box{border:1px solid ' + c.line + ';border-radius:' + rad + 'px;padding:' + (pad + 3) + 'px ' + (pad + 5) + 'px;margin:' + (pad + 4) + 'px 0}' +
        P + '.pd-box h4{font-size:' + Math.round(fs * 0.78) + 'px;text-transform:uppercase;letter-spacing:.6px;opacity:.65;margin:0 0 3px}' +
        P + 'table,' + P + 'th,' + P + 'td{font:inherit;color:inherit;text-transform:none;letter-spacing:normal;white-space:normal;text-align:left;background:none}' +
        P + '.pd-table{width:100%;table-layout:fixed;border-collapse:collapse;font-size:' + fs + 'px;margin:' + (pad + 4) + 'px 0}' +
        P + '.pd-table th{text-align:left;color:' + c.primary + ';font-weight:700;padding:' + pad + 'px 3px;border-bottom:1px solid ' + c.line + ';' +
          (c.head_upper ? 'text-transform:uppercase;letter-spacing:.4px;' : '') + '}' +
        P + '.pd-table td{padding:' + pad + 'px 3px;vertical-align:top;overflow-wrap:anywhere;word-break:break-word;border-bottom:1px dotted ' + c.line + '}' +
        (c.table_style === 'grid' ? P + '.pd-table th,' + P + '.pd-table td{border:1px solid ' + c.line + '}' : '') +
        (c.table_style === 'plain' ? P + '.pd-table td{border-bottom:none}' : '') +
        (c.table_style === 'zebra' ? P + '.pd-table tbody tr:nth-child(even) td{background:rgba(0,0,0,.04)}' : '') +
        P + '.pd-num{text-align:right}' +
        P + '.pd-tot div{display:flex;justify-content:space-between;gap:10px;padding:2px 0}' +
        P + '.pd-grand{border-top:2px solid ' + c.text + ';margin-top:4px;padding-top:4px;font-size:' + Math.round(fs * 1.25) + 'px;font-weight:900;color:' + c.primary + '}' +
        P + '.pd-pay{margin-top:8px;padding:' + (pad + 2) + 'px 8px;border:1px dashed ' + c.primary + ';border-radius:' + rad + 'px;color:' + c.primary + ';font-weight:700}' +
        P + '.pd-foot{text-align:center;margin-top:10px;font-size:' + Math.round(fs * 0.9) + 'px;opacity:.75}' +
        P + '.pd-items{margin:' + (pad + 4) + 'px 0}' +
        P + '.pd-item{border-bottom:' + (lines.length > 1 ? '1px dotted ' + c.line : 'none') + ';padding:' + pad + 'px 0}' +
        P + '.pd-name{font-weight:700;overflow-wrap:anywhere;word-break:break-word;white-space:normal;line-height:1.35}' +
        P + '.pd-sub{display:flex;justify-content:space-between;gap:6px;flex-wrap:wrap;opacity:.9;margin-top:2px}' +
        P + '.pd-wm{position:absolute;top:38%;left:0;right:0;text-align:center;font-size:' + Math.round(fs * 3) + 'px;font-weight:900;opacity:.07;transform:rotate(-25deg);pointer-events:none;color:' + c.primary + ';white-space:nowrap}' +
        (thermal ? P + '.pd-head{display:grid;grid-template-columns:minmax(0,1fr);gap:' + (narrow58 ? '3px' : '4px') + ';padding:' + (band ? (narrow58 ? '3px 4px' : '4px 5px') : '0') + ';width:100%;margin:0 0 2px;}' +
          P + '.pd-brand-group{display:block;width:100%;min-width:0;padding-right:' + (c.logo ? (Math.min(c.logo_w, narrow58 ? 30 : 42) + 8) : 0) + 'px;}' +
          P + '.pd-brand-copy{display:block;min-width:0;max-width:100%;}' +
          P + '.pd-logo{position:absolute;left:auto;right:calc(4px - ' + (Number(c.logo_x) || 0) + 'px);top:' + (Number(c.logo_y) || 0) + 'px;width:auto;max-width:min(' + thermalLogoPct + '%,' + c.logo_w + 'px);max-height:' + Math.max(narrow58 ? 20 : 24, Math.round(c.logo_w * (narrow58 ? 0.36 : 0.44))) + 'px;object-fit:contain;object-position:center;}' +
          P + '.pd-brand{font-size:' + Math.max(10, Math.min(Math.round(fs * (narrow58 ? 1.16 : 1.28)), narrow58 ? 14 : 17)) + 'px;line-height:1.12;letter-spacing:0;overflow-wrap:anywhere;word-break:break-word;}' +
          P + '.pd-tag{font-size:' + Math.max(8, Math.round(fs * .74)) + 'px;line-height:1.15;overflow-wrap:anywhere;word-break:break-word;}' +
          P + '.pd-meta{grid-column:1;display:block;width:100%;min-width:0;max-width:100%;justify-self:stretch;text-align:left;font-size:' + Math.max(8, Math.round(fs * (narrow58 ? 0.78 : 0.86))) + 'px;line-height:1.22;overflow-wrap:anywhere;word-break:break-word;}' +
          P + '.pd-meta b{font-size:' + Math.max(9, Math.round(fs * 0.9)) + 'px;overflow-wrap:anywhere;word-break:break-word;}' +
          P + '.pd-meta-line{display:block;margin-top:0;}' +
          P + '.pd-line{margin:3px 0;}' +
          P + '.pd-box{display:block;width:100%;max-width:100%;box-sizing:border-box;padding:' + (narrow58 ? '3px 4px' : '4px 5px') + ';margin:3px 0;border-radius:' + Math.min(rad, 5) + 'px;}' +
          P + '.pd-box h4{font-size:' + Math.max(8, Math.round(fs * .72)) + 'px;margin:0 0 1px;letter-spacing:.2px;}' +
          P + '.pd-box p{margin:0 0 1px;line-height:1.18;overflow-wrap:anywhere;word-break:break-word;}' +
          P + '.pd-items{margin:3px 0;}' +
          P + '.pd-item{padding:2px 0;}' +
          P + '.pd-name{line-height:1.18;}' +
          P + '.pd-sub{gap:2px;margin-top:1px;line-height:1.18;}' +
          P + '.pd-tot div{gap:3px;align-items:flex-start;padding:1px 0;line-height:1.18;}' +
          P + '.pd-tot div span:first-child{min-width:0;overflow-wrap:anywhere;}' +
          P + '.pd-tot div span:last-child{flex-shrink:0;text-align:right;}' +
          P + '.pd-grand{margin-top:2px;padding-top:2px;font-size:' + Math.max(10, Math.round(fs * 1.12)) + 'px;}' +
          P + '.pd-pay{margin-top:4px;padding:3px 5px;line-height:1.2;}' +
          P + '.pd-foot{margin-top:5px;line-height:1.2;overflow-wrap:anywhere;word-break:break-word;}' +
          P + '.pd-table{margin:3px 0;}' +
          P + '.pd-table th,' + P + '.pd-table td{padding:2px 1px;font-size:' + Math.max(8, fs - 1) + 'px;}' +
          P + '.pd-sub{gap:3px;}' : '');
    }

    function pdInvoiceBody(o, c) {
      var qty = Number(o.quantity) || 1;
      var unit = Math.round((Number(o.subtotal) || 0) / qty) || Number(PRODUCT.price) || 0;
      var lines = o.lines && o.lines.length ? o.lines : [{color:o.selected_color,size:o.selected_size,qty:o.quantity}];
      var logo = c.logo ? '<img class="inv-logo" src="' + esc(c.logo) + '" alt="Brand logo">' : '<div class="inv-brand-mark">' + esc(String(c.brand || 'F').slice(0,1)) + '</div>';
      var rows = lines.map(function(l) {
        var variant = [l.color,l.size].filter(function(x){return x&&x!=='N/A';}).map(esc).join(' / ');
        var n = Number(l.qty) || 0;
        return '<tr><td><strong>' + esc(PRODUCT.title || c.brand || 'Product') + '</strong>' + (variant ? '<small>' + variant + '</small>' : '') + '</td><td>' + n + '</td><td>' + money(unit) + '</td><td>' + money(unit*n) + '</td></tr>';
      }).join('');
      var method = o.payment_method || '';
      var received = method === 'Paid' ? Number(o.total||0) : method === 'COD' || !method ? 0 : Number(o.payment_received||0);
      var due = Math.max(0, Number(o.total||0)-received);
      var methodLabel = method === 'Paid' ? 'Paid' : method === 'Delivery' ? 'Delivery Charge Paid' : method === 'COD' ? 'Cash on Delivery (COD)' : method === 'Partial' ? 'Partial payment' : 'Not selected';
      var totals = '<div><span>Subtotal</span><b>' + money(o.subtotal||0) + '</b></div>' +
        (method === 'Partial' && received > 0 ? '<div><span>Partial Payment</span><b>−' + money(received) + '</b></div>' : '') +
        (Number(o.bulk_discount)>0 ? '<div><span>Bulk discount</span><b>−' + money(o.bulk_discount) + '</b></div>' : '') +
        (Number(o.coupon_discount)>0 ? '<div><span>Coupon discount' + (o.coupon_code ? ' ('+esc(o.coupon_code)+')' : '') + '</span><b>−' + money(o.coupon_discount) + '</b></div>' : '') +
        '<div><span>Delivery charge</span><b>' + money(o.delivery_charge||0) + '</b></div>' +
        (method === 'Delivery' ? '<div><span>Pay Delivery Charge</span><b>−' + money(received) + '</b></div>' : '') +
        '<div class="inv-total"><span>Total</span><b>' + money(due) + '</b></div>';
      return '<div class="invoice-sheet"><header class="inv-top"><div class="inv-brand">' + logo + '<div><strong>' + esc(c.brand||PRODUCT.title||'Fiama Fashion') + '</strong>' + (c.tagline ? '<small>' + esc(c.tagline) + '</small>' : '') + '</div></div><div class="inv-title">Invoice</div></header>' +
        '<section class="inv-parties"><div class="inv-bill"><h3>Billed to:</h3><strong>' + esc(o.customer_name||'') + '</strong><span>' + esc(o.phone||'') + '</span><span>' + esc(o.address||'') + '</span>' + (o.delivery_area ? '<span>' + esc(o.delivery_area) + '</span>' : '') + '</div><div class="inv-number"><strong>Order ID: ' + esc(o.public_id) + '</strong><span>Date: ' + fmtInvoiceDate(o.created_at) + '</span></div></section>' +
        '<table class="inv-table"><thead><tr><th>Item</th><th>Quantity</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>' + rows + '</tbody></table><section class="inv-totals">' + totals + '</section>' +
        '<section class="inv-payment"><h3>Payment Information</h3><div class="inv-pay-row"><span>Payment method</span><strong>' + esc(methodLabel) + '</strong></div>' +
        (method === 'Paid' || method === 'Partial' ? '<div class="inv-pay-row"><span>Amount received</span><strong>' + money(received) + '</strong></div>' : '') +
        '<div class="inv-pay-row inv-balance"><span>' + (due>0?'Balance due':'Payment status') + '</span><strong>' + (due>0?money(due):'Paid in full') + '</strong></div></section>' +
        '<div class="inv-bottom">' +
         (c.show_thank_you !== false ? '<div class="inv-thanks-block"><div class="inv-thanks">' + esc(c.footer_title || 'Thank You!') + '</div><div class="inv-thanks-sub">' + esc(c.footer_message || 'for shopping with us! ❤️') + '</div></div>' : '') +
         (c.show_brand_address !== false ? '<div class="inv-brand-address"><strong>- ' + esc(c.footer_brand || c.brand || 'ABC Fashion') + ' -</strong><span><i class="inv-address-icon">●</i> ' + esc(c.footer_address || '') + '</span><span><i class="inv-address-icon">☎</i> Phone: ' + esc(c.footer_phone || c.contact || '') + '</span></div>' : '') +
         '</div></div>';
    }

    function pdBody(o, c) {
      var S = c.show || {};
      var qty = Number(o.quantity) || 1;
      var unit = Math.round((Number(o.subtotal) || 0) / qty) || Number(PRODUCT.price) || 0;
      var lines = o.lines && o.lines.length ? o.lines : [{ color: o.selected_color, size: o.selected_size, qty: o.quantity }];
      var rule = c.line_on ? '<div class="pd-line"></div>' : '';
      var wm = c.watermark ? '<div class="pd-wm">' + esc(c.watermark) + '</div>' : '';

      var head = '<div class="pd-head"><div class="pd-brand-group"><div class="pd-brand-copy">' +
        '<div class="pd-brand">' + esc(c.brand) + '</div>' +
        (c.tagline ? '<div class="pd-tag">' + esc(c.tagline) + '</div>' : '') + '</div>' +
        (c.logo ? '<img class="pd-logo" src="' + esc(c.logo) + '" alt="">' : '') + '</div>' +
        '<div class="pd-meta"><b>' + esc(o.public_id) + '</b>' +
        (S.date ? '<span class="pd-meta-line">' + esc(t('inv_date')) + ': ' + esc(fmtDate(o.created_at)) + '</span>' : '') +
        (S.status ? '<span class="pd-meta-line">' + esc(t('inv_status')) + ': ' + esc(statusLabel(o.status)) + '</span>' : '') + '</div></div>';

      var cust = [];
      if (S.phone) cust.push('<p>' + esc(o.phone) + '</p>');
      if (S.area) cust.push('<p>' + esc(o.delivery_area) + '</p>');
      if (S.address) cust.push('<p>' + esc(o.address) + '</p>');
      var box = cust.length ? '<div class="pd-box"><h4>' + esc(t('inv_bill_to')) + '</h4>' + cust.join('') + '</div>' : '';

      // প্রতিটি আইটেম: 1. নাম (লম্বা হলে পরের লাইনে) / রঙ ও সাইজ — পরিমাণ × দাম = মোট
      var items = '<div class="pd-items">' + lines.map(function (l, i) {
        var lq = Number(l.qty) || 0;
        var variant = [S.color ? l.color : '', S.size ? l.size : ''].filter(function (x) { return x && x !== 'N/A'; }).map(esc).join(' / ');
        var qtyTxt = S.qty ? lq + ' ' + t('qty_unit') + (S.unit ? ' × ' + money(unit) : '') + ' =' : '';
        return '<div class="pd-item"><div class="pd-name">' + (S.num ? (i + 1) + '. ' : '') + esc(PRODUCT.title || '') + '</div>' +
          '<div class="pd-sub"><span>' + (variant || '&nbsp;') + '</span><span>' + qtyTxt + ' <b>' + money(unit * lq) + '</b></span></div></div>';
      }).join('') + '</div>';

      var tot = '';
      if (S.subtotal) tot += '<div><span>' + esc(t('inv_subtotal')) + '</span><span>' + money(o.subtotal) + '</span></div>';
      if (S.bulk && Number(o.bulk_discount) > 0) tot += '<div><span>' + esc(t('d_bulk')) + '</span><span>-' + money(o.bulk_discount) + '</span></div>';
      if (S.coupon && Number(o.coupon_discount) > 0) tot += '<div><span>' + esc(t('d_coupon')) + ' (' + esc(o.coupon_code) + ')</span><span>-' + money(o.coupon_discount) + '</span></div>';
      if (S.delivery) tot += '<div><span>' + esc(t('inv_delivery_charge')) + '</span><span>' + money(o.delivery_charge) + '</span></div>';
      tot += '<div class="pd-grand"><span>' + esc(t('inv_grand')) + '</span><span>' + money(o.total) + '</span></div>';
      var totals = '<div class="pd-tot">' + tot + '</div>';

      var method = String(o.payment_method || '');
      var received = method === 'Paid' ? Number(o.total || 0) : Math.max(0, Number(o.payment_received) || 0);
      var due = Math.max(0, Number(o.total || 0) - received);
      var payLabel = method === 'Paid' ? '<strong>Paid</strong>' : method === 'Partial' ? 'Partial Payment - ' + money(received) : 'Cash on Delivery (COD)';
      var pay = S.payment ? '<div class="pd-pay">💵 ' + payLabel + ' — ' + money(due) + '</div>' : '';
      var contact = c.contact || PRODUCT.contact_phone || '';
      var foot = '<div class="pd-foot">' + esc(LANG === 'bn' ? c.footer_bn : c.footer_en) +
        (S.contact && contact ? '<br>' + esc(t('inv_contact')) + ': ' + esc(contact) : '') + '</div>';

      return wm + head + rule + box + items + totals + pay + rule + foot;
    }

    function pdInvoiceCss(sc,c) {
      var R='#'+sc+' ';
      return R+'.invoice-sheet{width:100%;min-height:100%;display:flex;flex-direction:column;box-sizing:border-box;background:#fff;color:#111;font-family:Arial,sans-serif;font-size:14px;line-height:1.5;padding:24px 28px}'+
      R+'.inv-top{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:42px}'+
      R+'.inv-brand{display:flex;align-items:center;gap:14px;min-width:0}'+R+'.inv-logo{width:'+Math.max(20,Number(c.logo_w)||76)+'px;height:'+Math.max(20,Number(c.logo_w)||76)+'px;object-fit:contain;flex:0 0 auto;border:2px solid #222;border-radius:50%;padding:4px;position:relative;transform:translate('+(Number(c.logo_x)||0)+'px,'+(Number(c.logo_y)||0)+'px)}'+
      R+'.inv-brand-mark{width:68px;height:68px;border-radius:50%;border:2px solid #222;background:#fff;color:#111;display:grid;place-items:center;font-size:20px;font-weight:900;flex:0 0 auto}'+
      R+'.inv-brand>div{border-left:2px solid #222;padding-left:16px;min-width:0}'+
      R+'.inv-brand strong{display:block;font-size:'+(Number(c.brand_size)||22)+'px;line-height:1.2;color:#111}'+R+'.inv-brand small{display:block;color:#555;font-size:'+(Number(c.tagline_size)||16)+'px;margin-top:4px}'+
      R+'.inv-title{font-family:Georgia,serif;font-size:46px;line-height:1;color:#111;white-space:nowrap}'+
      R+'.inv-parties{display:flex;justify-content:space-between;align-items:flex-start;gap:22px;margin-bottom:40px;font-size:15px}'+
      R+'.inv-bill{display:flex;flex-direction:column;gap:2px;max-width:58%;overflow-wrap:anywhere}'+R+'.inv-bill h3{font-size:16px;margin:0 0 5px;font-weight:700}'+R+'.inv-bill strong{font-size:16px}'+
      R+'.inv-number{display:flex;flex-direction:column;text-align:right;gap:4px;overflow-wrap:anywhere;font-size:15px}'+R+'.inv-number strong{font-size:16px}'+
      R+'.inv-table{width:100%;border-collapse:collapse;table-layout:fixed;margin-bottom:14px}'+
      R+'.inv-table thead{background:#ededed}'+R+'.inv-table th{text-align:left;font-size:14px;font-weight:700;padding:9px 10px;border-bottom:2px solid #222;color:#111}'+
      R+'.inv-table td{padding:12px 10px;border-bottom:1px solid #777;vertical-align:top;overflow-wrap:anywhere;font-size:14px}'+
      R+'.inv-table th:nth-child(1),'+R+'.inv-table td:nth-child(1){width:40%}'+R+'.inv-table th:nth-child(2),'+R+'.inv-table td:nth-child(2){width:18%;text-align:center}'+
      R+'.inv-table th:nth-child(3),'+R+'.inv-table td:nth-child(3){width:20%}'+R+'.inv-table th:nth-child(4),'+R+'.inv-table td:nth-child(4){width:22%;text-align:right}'+
      R+'.inv-table td small{display:block;color:#555;font-size:11px}'+
      R+'@media print{.inv-totals .inv-total{background-color:#000!important;background:#000!important;color:#fff!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;box-shadow:inset 0 0 0 1000px #000!important;border:1px solid #000!important}}'+
      R+'.inv-totals{width:58%;margin-left:auto;margin-top:12px}'+R+'.inv-totals>div{display:flex;justify-content:space-between;gap:10px;padding:4px 10px;font-size:15px}'+
      R+'.inv-totals .inv-total{margin-top:10px;padding:10px 12px;background-color:#000!important;background:#000!important;color:#fff!important;font-size:19px;-webkit-print-color-adjust:exact;print-color-adjust:exact;box-shadow:inset 0 0 0 1000px #000;border:1px solid #000}'+
      R+'.inv-payment{margin-top:28px;border-top:1px solid #888;padding-top:12px}'+R+'.inv-payment h3{font-size:16px;margin:0 0 8px}'+
      R+'.inv-pay-row{display:flex;justify-content:space-between;gap:12px;padding:4px 0;font-size:15px}'+R+'.inv-balance{border-top:1px dashed #888;margin-top:5px;padding-top:7px}'+
      R+'.inv-bottom{display:flex;align-items:flex-end;justify-content:space-between;gap:22px;margin-top:auto;margin-bottom:0;padding-top:30px;min-height:112px;flex:0 0 auto;break-inside:avoid;page-break-inside:avoid}'+
      R+'.inv-thanks-block{min-width:0;flex:1;padding-bottom:4px}'+
      R+'.inv-thanks{font-family:"Segoe Script","Brush Script MT","URW Chancery L",cursive;font-size:'+(Number(c.footer_title_size)||48)+'px;font-style:italic;font-weight:600;line-height:1.05;margin:0;display:block;width:max-content;max-width:100%;transform:rotate(-7deg);transform-origin:left center;color:#050505;letter-spacing:-1.4px}'+
      R+'.inv-thanks-block{transform:translate('+(Number(c.footer_x)||0)+'px,'+(Number(c.footer_y)||0)+'px)}'+
      R+'.inv-thanks-sub{font-family:Arial,sans-serif;font-size:'+(Number(c.footer_size)||15)+'px;font-style:italic;line-height:1.3;margin:8px 0 0 2px;color:#111;transform:none;width:max-content;max-width:100%}'+
      R+'.inv-brand-address{display:flex;flex-direction:column;align-items:flex-end;gap:5px;text-align:right;max-width:48%;font-size:11px;line-height:1.4;color:#111;overflow-wrap:anywhere;transform:translate('+(Number(c.address_x)||0)+'px,'+(Number(c.address_y)||0)+'px)}'+R+'.inv-brand-address>strong{font-size:16px;font-weight:700;margin-bottom:2px}'+R+'.inv-brand-address>span{display:block;white-space:nowrap}'+R+'.inv-address-icon{display:inline-block;width:16px;text-align:center;font-style:normal;font-size:13px;font-weight:700;margin-right:3px}'+
      R+'.inv-brand-address strong{font-family:Arial,sans-serif;font-size:16px;font-weight:700;color:#111;margin-bottom:2px}';
    }

    function pdInvoicePageCss(sc, c) {
      var dims = { A4: [210, 297], A5: [148, 210], Letter: [216, 279] };
      var size = dims[c.page] || dims.A4;
      var margin = Number(c.margin);
      if (!Number.isFinite(margin)) margin = 25;
      margin = Math.max(0, Math.min(25, margin));
      return '#' + sc + '.doc-invoice .invoice-sheet{' +
        'width:' + size[0] + 'mm;min-width:' + size[0] + 'mm;max-width:none;' +
        'height:' + size[1] + 'mm;min-height:' + size[1] + 'mm;max-height:' + size[1] + 'mm;' +
        'box-sizing:border-box;padding:' + margin + 'mm;display:flex;flex-direction:column;background:#fff;' +
        '}' +
        '#' + sc + '.doc-invoice .inv-bottom{margin-top:auto;margin-bottom:0;padding-top:30px;align-items:flex-end;}' +
        '#' + sc + '.doc-invoice .inv-thanks{font-size:' + (Number(c.footer_title_size) || 48) + 'px;}';
    }

    function fitInvoicePreview(canvasId, pageId, zoomMode) {
      var canvas = $(canvasId), stage = canvas && canvas.querySelector('.invoice-preview-stage, .print-preview-stage');
      var root = $(pageId), sheet = root && root.querySelector('.invoice-sheet');
      if (!canvas || !stage || !root || !sheet) return;
      var width = sheet.offsetWidth, height = sheet.offsetHeight;
      if (!width || !height) return;
      var css = getComputedStyle(canvas);
      var w = Math.max(80, canvas.clientWidth - (parseFloat(css.paddingLeft)||0) - (parseFloat(css.paddingRight)||0) - 8);
      var h = Math.max(80, canvas.clientHeight - (parseFloat(css.paddingTop)||0) - (parseFloat(css.paddingBottom)||0) - 8);
      // Live Settings preview follows the document flow: fit to width only, never to a fixed-height viewport.
      var fit = Math.min(w/width, h/height);
      var zoom = Number(canvas.dataset.previewZoom) || 1;
      if (zoomMode === 'fit') zoom = 1;
      else if (typeof zoomMode === 'number') zoom = Math.max(.5, Math.min(4, zoom + zoomMode));
      canvas.dataset.previewZoom = zoom;
      var scale = fit * zoom;
      root.style.width = width + 'px';
      root.style.height = height + 'px';
      root.style.maxWidth = 'none';
      root.style.margin = '0';
      root.style.position = 'absolute';
      root.style.left = '0';
      root.style.top = '0';
      root.style.transformOrigin = 'top left';
      root.style.transform = 'scale(' + scale + ')';
      stage.style.position = 'relative';
      stage.style.width = width*scale + 'px';
      stage.style.height = height*scale + 'px';
      stage.style.minWidth = '0';
      stage.style.flex = '0 0 auto';
      stage.style.margin = 'auto';
      stage.style.padding = '0';
      stage.style.overflow = 'visible';
      if (zoomMode === 'fit') { canvas.scrollLeft = 0; canvas.scrollTop = 0; }
      var label = canvas.parentElement && canvas.parentElement.querySelector('.preview-zoom-value');
      if (label) label.textContent = Math.round(zoom*100) + '%';
    }

    function previewZoomControls(canvasId, pageId) {
      return '<div class="preview-zoom-bar"><button type="button" data-action="preview-zoom" data-target="' + canvasId + '" data-page="' + pageId + '" data-zoom="-0.25">−</button><span class="preview-zoom-value">100%</span><button type="button" data-action="preview-zoom" data-target="' + canvasId + '" data-page="' + pageId + '" data-zoom="0.25">+</button><button type="button" data-action="preview-zoom" data-target="' + canvasId + '" data-page="' + pageId + '" data-zoom="fit">Fit</button><span class="preview-pan-hint">Shift + drag to move</span></div>';
    }

    function pdPreviewHtml(o, c, sc, kind) {
      if (kind === 'pos') {
        var S = c.show || {};
        var qty = Number(o.quantity) || 1;
        var unit = Math.round((Number(o.subtotal) || 0) / qty) || Number(PRODUCT.price) || 0;
        var lines = o.lines && o.lines.length ? o.lines : [{ color: o.selected_color, size: o.selected_size, qty: o.quantity }];
        var contact = c.contact || PRODUCT.contact_phone || '';
        var logo = c.logo ? '<img class="receipt-logo" src="' + esc(c.logo) + '" alt="">' : '<div class="receipt-logo-fallback">✦</div>';
        var items = lines.map(function(l, i) {
          var variant = [S.color ? l.color : '', S.size ? l.size : ''].filter(function(x) { return x && x !== 'N/A'; }).map(esc).join(' / ');
          var n = Number(l.qty) || 0;
          return '<div class="receipt-item"><strong>' + (S.num ? (i + 1) + '. ' : '') + esc(PRODUCT.title || '') + '</strong>' +
            '<div class="receipt-item-sub"><span>' + (variant || '') + '</span><b>' + (S.qty ? n + ' × ' + money(unit) + ' = ' : '') + money(unit * n) + '</b></div></div>';
        }).join('');
        var method = String(o.payment_method || '');
        var received = method === 'Paid' ? Number(o.total || 0) : Math.max(0, Number(o.payment_received) || 0);
        var due = Math.max(0, Number(o.total || 0) - received);
        var totals = '<div class="receipt-row"><span>Subtotal</span><b>' + money(o.subtotal || 0) + '</b></div>' +
          (method === 'Partial' && received > 0 ? '<div class="receipt-row"><span>Partial Payment</span><b>−' + money(received) + '</b></div>' : '') +
          (S.bulk && Number(o.bulk_discount) > 0 ? '<div class="receipt-row"><span>Bulk discount</span><b>−' + money(o.bulk_discount) + '</b></div>' : '') +
          (S.coupon && Number(o.coupon_discount) > 0 ? '<div class="receipt-row"><span>Coupon discount</span><b>−' + money(o.coupon_discount) + '</b></div>' : '') +
          '<div class="receipt-row"><span>Delivery Charge</span><b>' + money(o.delivery_charge || 0) + '</b></div>' +
          (method === 'Delivery' ? '<div class="receipt-row"><span>Pay Delivery Charge</span><b>−' + money(received) + '</b></div>' : '');
        return '<style>' +
          '#' + sc + '{width:' + ((c.page === '58mm') ? '58mm' : (c.page === '80mm' ? '80mm' : '80mm')) + ';max-width:100%;margin:0 auto;padding:3mm 2.5mm;background:#fff;color:#000;font-family:Arial, sans-serif;font-size:11px;line-height:1.35;box-sizing:border-box;overflow-wrap:anywhere}' +
          '#' + sc + ' *{box-sizing:border-box}#' + sc + ' .receipt-head{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:8px}' +
          '#' + sc + ' .receipt-brand{min-width:0;flex:1}#' + sc + ' .receipt-brand strong{display:block;font-size:19px;line-height:1.1;font-weight:800;word-break:break-word}' +
          '#' + sc + ' .receipt-brand small{display:block;font-size:9px;margin:3px 0 6px;color:#333}' +
          '#' + sc + ' .receipt-meta{font-size:9px;line-height:1.5}#' + sc + ' .receipt-logo{width:52px;height:52px;object-fit:contain;flex:0 0 52px}' +
          '#' + sc + ' .receipt-logo-fallback{width:52px;height:52px;display:grid;place-items:center;background:#000;color:#fff;font-size:25px;flex:0 0 52px}' +
          '#' + sc + ' .receipt-rule{border:0;border-top:1px solid #000;margin:7px 0}#' + sc + ' .receipt-dash{border:0;border-top:1px dashed #777;margin:8px 0}' +
          '#' + sc + ' .receipt-label{font-size:9px;font-weight:700;letter-spacing:.5px;color:#555;margin-bottom:2px}' +
          '#' + sc + ' .receipt-customer{margin:8px 0 10px;font-size:10px;line-height:1.45}#' + sc + ' .receipt-customer strong{font-size:12px}' +
          '#' + sc + ' .receipt-item{padding:4px 0;border-bottom:' + (lines.length > 1 ? '1px dotted #aaa' : 'none') + '}#' + sc + ' .receipt-item>strong{font-size:11px;display:block}' +
          '#' + sc + ' .receipt-item-sub{display:flex;justify-content:space-between;gap:5px;font-size:9px;margin-top:2px;padding-left:12px}' +
          '#' + sc + ' .receipt-row{display:flex;justify-content:space-between;gap:8px;font-size:10px;margin:4px 0}' +
          '#' + sc + ' .receipt-grand{display:flex;justify-content:space-between;gap:8px;background:#000;color:#fff;padding:8px 9px;margin:9px 0 7px;font-size:13px;font-weight:800;border-radius:4px}' +
          '#' + sc + ' .receipt-cod{border:1px dashed #000;padding:7px 5px;text-align:center;font-size:10px;font-weight:700;margin:8px 0 10px}' +
          '#' + sc + ' .receipt-footer{text-align:center;font-size:9px;line-height:1.5;margin-top:8px}' +
          '@media print{#' + sc + '{width:' + ((c.page === '58mm') ? '58mm' : '80mm') + ';max-width:none;margin:0;padding:2mm 1.5mm}#' + sc + ' .receipt-grand{-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#000!important;color:#fff!important}}' +
          '</style><div id="' + sc + '" class="doc-pos"><div class="receipt-head"><div class="receipt-brand"><strong>' + esc(c.brand || PRODUCT.title || 'Fiama Fashion') + '</strong>' +
          (c.tagline ? '<small>' + esc(c.tagline) + '</small>' : '') +
          '<div class="receipt-meta">' + (S.num ? '<b>Order ID: ' + esc(o.public_id) + '</b><br>' : '') +
          (S.date ? 'Date: ' + esc(fmtDate(o.created_at)) + '<br>' : '') + (S.status ? 'Status: ' + esc(statusLabel(o.status)) : '') +
          '</div></div>' + logo + '</div><hr class="receipt-rule">' +
          '<div class="receipt-customer"><div class="receipt-label">BILL TO</div>' +
          '<strong>' + esc(o.customer_name || '') + '</strong><br>' +
          '<span>' + esc(o.phone || '') + '</span><br>' +
          '<span>' + esc(o.delivery_area || '') + '</span><br>' +
          '<span>' + esc(o.address || '') + '</span></div><hr class="receipt-rule">' +
          '<div class="receipt-items">' + items + '</div><hr class="receipt-dash"><div>' + totals + '</div>' +
          '<div class="receipt-grand"><span>Grand Total</span><span>' + money(due) + ' BDT</span></div>' +
          (S.payment ? (function () {
            var method = String(o.payment_method || '');
            var methodLabel = method === 'Paid' ? '<strong>Paid</strong>' : method === 'Delivery' ? 'Pay Delivery Charge - ' + money(received) + ' BDT' : method === 'Partial' ? 'Partial Payment - ' + money(received) + ' BDT' : '🚚 Cash on Delivery (COD)';
            return '<div class="receipt-cod"><div>' + methodLabel + (method === 'COD' || !method ? ' — ' + money(due) + ' BDT' : '') + '</div></div>';
          })() : '') +
          '<div class="receipt-footer">' + esc(LANG === 'bn' ? c.footer_bn : c.footer_en) +
          (S.contact && contact ? '<br>Contact Us: ' + esc(contact) : '') + '</div></div>';
      }
      var invoiceCss = pdInvoiceCss(sc, c) + pdInvoicePageCss(sc, c);
      return '<style>' + invoiceCss + '</style><div id="' + sc + '" class="doc-invoice">' + pdInvoiceBody(o, c) + '</div>';
    }

    function pdFullDoc(o, c, kind) {
      var pg=(PD_PAGE[c.page]||PD_PAGE.A4)[1];
      var content=pdPreviewHtml(o,c,'pvFull',kind);
      return '<!DOCTYPE html><html lang="'+LANG+'"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>'+esc(o.public_id)+'</title><style>@page{size:'+pg+';margin:0}html,body{margin:0;padding:0;background:#fff}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}#pvFull{width:auto!important;max-width:none!important;margin:0!important;box-sizing:border-box}@media screen{body{background:#e9eef4;padding:12px}#pvFull{margin:0 auto!important}}@media print{html,body{width:auto;margin:0!important;padding:0!important;background:#fff}#pvFull{margin:0!important}}</style></head><body>'+content+'</body></html>';
    }

    async function ensurePrint() {
      if (PRINT.invoice && PRINT.pos) return;
      var r = await api('/api/admin/print');
      if (r.ok) { PRINT = r.data.print; PRINT_SAVED = JSON.parse(JSON.stringify(PRINT)); }
    }

    function sampleOrder() {
      var k = Object.keys(CACHE)[0];
      if (k) return CACHE[k];
      return {
        public_id: 'ABC-SAMPL-EXMPL', created_at: '2026-01-01 10:00:00', status: 'Confirmed',
        customer_name: 'রহিম উদ্দিন', phone: '01700000000', address: 'বাসা ১২, রোড ৫, ধানমন্ডি, ঢাকা',
        delivery_area: 'ঢাকার ভেতরে', quantity: 2, subtotal: 2980, bulk_discount: 0,
        coupon_discount: 298, coupon_code: 'SAMPLE10', delivery_charge: 60, total: 2742,
        selected_color: 'কালো', selected_size: 'M', lines: [{ color: 'কালো', size: 'M', qty: 2 }]
      };
    }

    async function previewDoc(pid, kind) {
      await ensurePrint();
      var o = CACHE[pid];
      if (!o) return;
      var c = PRINT[kind];
      openModal(
        '<div class="doc-modal-top"><div class="doc-modal-title"><span class="doc-modal-icon">' + (kind === 'pos' ? '🧾' : '📄') + '</span><div><h3>' + (kind === 'pos' ? 'POS Receipt' : 'Invoice') + '</h3><p>Order document preview</p></div></div><span class="doc-modal-id">' + esc(pid) + '</span></div>' +
        '<div class="doc-modal-canvas" id="invoicePreviewCanvas">' + (kind === 'pos' ? pdPreviewHtml(o, c, 'pvModal', kind) : '<div class="invoice-preview-stage">' + pdPreviewHtml(o, c, 'pvModal', kind) + '</div>') + '</div>' +
        (kind === 'pos' ? '' : previewZoomControls('invoicePreviewCanvas', 'pvModal')) +
        '<div class="doc-modal-actions">' +
          '<button class="btn doc-print-btn" data-action="print" data-kind="' + kind + '" data-pid="' + esc(pid) + '">🖨️ Print</button>' +
          '<button class="btn ghost doc-save-btn" data-action="download" data-kind="' + kind + '" data-pid="' + esc(pid) + '">⬇️ Save file (HTML)</button>' +
          '<button class="btn ghost doc-back-btn" data-action="status-back" data-pid="' + esc(pid) + '">← Back to order</button>' +
        '</div>'
      );
      if (kind !== 'pos') requestAnimationFrame(function () { fitInvoicePreview('invoicePreviewCanvas', 'pvModal', 'fit'); });
    }

    async function printDoc(pid, kind) {
      await ensurePrint();
      var o = CACHE[pid];
      if (!o) return;
      var doc = pdFullDoc(o, PRINT[kind], kind);
      if (window.AndroidApp && window.AndroidApp.printHtml) { window.AndroidApp.printHtml(doc); return; }
      var w = window.open('', '_blank', 'width=480,height=680');
      if (!w) { toast(t('popup_block'), 'err'); downloadDoc(pid, kind); return; }
      w.document.open();
      w.document.write(doc);
      w.document.close();
      setTimeout(function () { w.focus(); w.print(); }, 450);
    }

    async function downloadDoc(pid, kind) {
      await ensurePrint();
      var o = CACHE[pid];
      if (!o) return;
      if (window.AndroidApp && window.AndroidApp.printHtml) { printDoc(pid, kind); return; }
      var blob = new Blob([pdFullDoc(o, PRINT[kind], kind)], { type: 'text/html;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = (kind === 'pos' ? 'pos-' : 'invoice-') + pid + '.html';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    }

    /* ---------- CSV (অর্ডার তালিকা, আইটেম সহ) ---------- */

    function exportCSV() {
      if (!ORDERS.length) { toast(t('csv_empty'), 'err'); return; }
      var headers = ['Order ID', 'Customer', 'Phone', 'Address', 'Items', 'Area', 'Qty', 'Subtotal', 'Bulk', 'Coupon', 'Delivery', 'Total COD', 'Status', 'Date'];
      var csvEsc = function (val) {
        var s = String(val == null ? '' : val).replace(/"/g, '""').replace(/[\\r\\n]+/g, ' ');
        if (/^[=+\\-@]/.test(s)) s = "'" + s;
        return '"' + s + '"';
      };
      var rows = ORDERS.map(function (o) {
        return [
          csvEsc(o.public_id), csvEsc(o.customer_name), csvEsc(o.phone), csvEsc(o.address), csvEsc(linesText(o)),
          csvEsc(o.delivery_area), csvEsc(o.quantity), csvEsc(o.subtotal), csvEsc(o.bulk_discount),
          csvEsc(o.coupon_discount), csvEsc(o.delivery_charge), csvEsc(o.total), csvEsc(o.status), csvEsc(o.created_at)
        ].join(',');
      });
      var content = '\\uFEFF' + [headers.join(',')].concat(rows).join('\\r\\n');
      var fileName = 'orders_' + new Date().toISOString().slice(0, 10) + '.csv';
      if (window.AndroidApp && window.AndroidApp.saveCsv) {
        window.AndroidApp.saveCsv(fileName, content);
        return;
      }
      var blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    }

    /* ---------- Product ---------- */

    async function loadProduct() {
      var s = await api('/api/admin/stats');
      if (s.ok) PRODUCT = s.data.product || PRODUCT;
      fillProduct();
    }

    function fillProduct() {
      var p = PRODUCT || {};
      $('pTitle').value = p.title || '';
      $('pPrice').value = p.price == null ? '' : p.price;
      $('pOldPrice').value = p.old_price == null ? '' : p.old_price;
      $('pColors').value = p.colors || '';
      $('pSizes').value = p.sizes || '';
      $('pDelInside').value = p.delivery_inside == null ? 60 : p.delivery_inside;
      $('pDelOutside').value = p.delivery_outside == null ? 120 : p.delivery_outside;
      $('pPhone').value = p.contact_phone || '';
      $('pWhatsapp').value = p.whatsapp_number || '';
      $('pDesc').value = p.description || '';
      $('pRatio').value = p.image_ratio || 'auto';
      $('pActive').checked = p.active !== false;
      $('pBadge').value = p.badge_pos || 'tl';
      var tb = p.topbar || {};
      $('tbBn').value = tb.bn || TB_DEF.bn;
      $('tbEn').value = tb.en || TB_DEF.en;
      $('tbSize').value = tb.size == null ? 13 : tb.size;
      $('tbAlign').value = tb.align || 'center';
      $('tbOffset').value = tb.offset == null ? 0 : tb.offset;
      $('tbPad').value = tb.pad == null ? 10 : tb.pad;
      $('tbLangShow').checked = tb.langShow == null ? true : !!tb.langShow;
      $('siteLanguage').value = ["bn", "en"].includes(p.siteLanguage) ? p.siteLanguage : "auto";
      $('tbLangSize').value = tb.langSize == null ? 12 : tb.langSize;
      renderTbPreview();
      IMAGES = (p.images || []).slice();
      TRUST = (p.trust || []).slice(0, 3);
      while (TRUST.length < 3) TRUST.push({ icon: '', bn: '', en: '' });
      FAQS = (p.faqs || []).slice(0, 10).map(function (f) { return Object.assign({}, DEFAULT_FAQ_BLANK, f); });
      NOTICES = (p.notices || []).slice(0, MAX_NOTICES).map(function (n) { return Object.assign({}, NOTICE_DEFAULT, n); });
      renderEditors();
    }

    function numIn(id, min, max, fallback) {
      var n = Math.trunc(Number($(id).value));
      if (!isFinite(n) || $(id).value === '') n = fallback;
      return Math.max(min, Math.min(max, n));
    }

    function tbValues() {
      return {
        bn: $('tbBn').value,
        en: $('tbEn').value,
        size: numIn('tbSize', 9, 32, 13),
        align: $('tbAlign').value,
        offset: numIn('tbOffset', -120, 120, 0),
        pad: numIn('tbPad', 0, 40, 10),
        langShow: $('tbLangShow').checked,
        langSize: numIn('tbLangSize', 8, 28, 12),
        siteLanguage: $('siteLanguage').value
      };
    }

    function renderTbPreview() {
      if (!$('tbPreview')) return;
      var v = tbValues();
      var txt = LANG === 'bn' ? (v.bn || v.en) : (v.en || v.bn);
      var box = $('tbPreview');
      var el = $('tbPreviewText');
      box.style.paddingTop = v.pad + 'px';
      box.style.paddingBottom = v.pad + 'px';
      el.textContent = txt;
      el.style.fontSize = v.size + 'px';
      el.style.textAlign = v.align;
      el.style.transform = 'translateX(' + v.offset + 'px)';
    }

    function resetTopbar() {
      $('tbBn').value = TB_DEF.bn;
      $('tbEn').value = TB_DEF.en;
      $('tbSize').value = 13;
      $('tbAlign').value = 'center';
      $('tbOffset').value = 0;
      $('tbPad').value = 10;
      $('tbLangShow').checked = true;
      $('siteLanguage').value = 'auto';
      $('tbLangSize').value = 12;
      renderTbPreview();
    }

    function renderEditors() {
      renderImagePreviews();
      renderTrustEditor();
      renderNotices();
      renderFaqEditor();
    }

    function renderTrustEditor() {
      $('trustEditor').innerHTML = TRUST.map(function (it, i) {
        return '<div class="ed-row">' +
          '<input class="input emoji" data-kind="trust" data-idx="' + i + '" data-field="icon" value="' + esc(it.icon) + '" maxlength="8" aria-label="' + esc(t('icon_label')) + '">' +
          '<input class="input grow" data-kind="trust" data-idx="' + i + '" data-field="bn" value="' + esc(it.bn) + '" placeholder="বাংলা">' +
          '<input class="input grow" data-kind="trust" data-idx="' + i + '" data-field="en" value="' + esc(it.en) + '" placeholder="English">' +
          '</div>';
      }).join('');
    }

    function renderFaqEditor() {
      $('faqEditor').innerHTML = FAQS.length ? FAQS.map(function (f, i) {
        return '<div class="ed-faq">' +
          '<div class="head"><span>#' + (i + 1) + '</span>' +
          '<button class="btn sm danger" data-action="faq-del" data-idx="' + i + '">' + esc(t('faq_del')) + '</button></div>' +
          '<div class="grid-2">' +
            '<div class="field"><label>' + esc(t('faq_q_bn')) + '</label><input class="input" data-kind="faq" data-idx="' + i + '" data-field="qbn" value="' + esc(f.qbn) + '"></div>' +
            '<div class="field"><label>' + esc(t('faq_q_en')) + '</label><input class="input" data-kind="faq" data-idx="' + i + '" data-field="qen" value="' + esc(f.qen) + '"></div>' +
            '<div class="field"><label>' + esc(t('faq_a_bn')) + '</label><textarea class="input" rows="2" data-kind="faq" data-idx="' + i + '" data-field="abn">' + esc(f.abn) + '</textarea></div>' +
            '<div class="field"><label>' + esc(t('faq_a_en')) + '</label><textarea class="input" rows="2" data-kind="faq" data-idx="' + i + '" data-field="aen">' + esc(f.aen) + '</textarea></div>' +
          '</div></div>';
      }).join('') : '<div class="empty">' + esc(t('faq_max', { n: 10 })) + '</div>';
    }

    /* ---------- Notices (FAQ-এর উপরে কাস্টম ব্লক) ---------- */

    function noticeEditorHtml(n, i) {
      var opts = function (list, cur) {
        return list.map(function (pair) {
          return '<option value="' + pair[0] + '"' + (pair[0] === cur ? ' selected' : '') + '>' + esc(t(pair[1])) + '</option>';
        }).join('');
      };
      var fontOpts = opts([['sans', 'nt_f_sans'], ['serif', 'nt_f_serif'], ['mono', 'nt_f_mono'], ['display', 'nt_f_display']], n.font);
      var alignOpts = opts([['left', 'tb_left'], ['center', 'tb_center'], ['right', 'tb_right']], n.align);
      var bgNone = !n.bg;
      return '<div class="ed-faq nt-block" data-nidx="' + i + '">' +
        '<div class="head"><span>' + esc(t('nt_block', { n: i + 1 })) + '</span>' +
          '<button class="btn sm danger" data-action="notice-del" data-idx="' + i + '">' + esc(t('nt_del')) + '</button></div>' +
        '<label class="chk"><input type="checkbox" data-nkind="f" data-field="on" data-idx="' + i + '"' + (n.on !== false ? ' checked' : '') + '> <span>' + esc(t('nt_on')) + '</span></label>' +
        '<div class="grid-2" style="margin-top:10px;">' +
          '<div class="field"><label>' + esc(t('nt_head_bn')) + '</label><input class="input" data-nkind="f" data-field="head_bn" data-idx="' + i + '" value="' + esc(n.head_bn) + '"></div>' +
          '<div class="field"><label>' + esc(t('nt_head_en')) + '</label><input class="input" data-nkind="f" data-field="head_en" data-idx="' + i + '" value="' + esc(n.head_en) + '"></div>' +
          '<div class="field"><label>' + esc(t('nt_body_bn')) + '</label><textarea class="input" rows="3" data-nkind="f" data-field="body_bn" data-idx="' + i + '">' + esc(n.body_bn) + '</textarea></div>' +
          '<div class="field"><label>' + esc(t('nt_body_en')) + '</label><textarea class="input" rows="3" data-nkind="f" data-field="body_en" data-idx="' + i + '">' + esc(n.body_en) + '</textarea></div>' +
        '</div>' +
        '<div class="grid-4">' +
          '<div class="field"><label>' + esc(t('nt_font')) + '</label><select class="input" data-nkind="f" data-field="font" data-idx="' + i + '">' + fontOpts + '</select></div>' +
          '<div class="field"><label>' + esc(t('nt_align')) + '</label><select class="input" data-nkind="f" data-field="align" data-idx="' + i + '">' + alignOpts + '</select></div>' +
          '<div class="field"><label>' + esc(t('nt_head_size')) + '</label><input class="input" type="number" min="12" max="40" data-nkind="f" data-field="head_size" data-idx="' + i + '" value="' + n.head_size + '"></div>' +
          '<div class="field"><label>' + esc(t('nt_body_size')) + '</label><input class="input" type="number" min="10" max="24" data-nkind="f" data-field="body_size" data-idx="' + i + '" value="' + n.body_size + '"></div>' +
        '</div>' +
        '<div class="grid-4">' +
          '<div class="field"><label>' + esc(t('nt_head_color')) + '</label><input class="input" type="color" data-nkind="f" data-field="head_color" data-idx="' + i + '" value="' + n.head_color + '"></div>' +
          '<div class="field"><label>' + esc(t('nt_body_color')) + '</label><input class="input" type="color" data-nkind="f" data-field="body_color" data-idx="' + i + '" value="' + n.body_color + '"></div>' +
          '<div class="field"><label>' + esc(t('nt_bg')) + '</label><input class="input" type="color" data-nkind="f" data-field="bg" data-idx="' + i + '" value="' + (n.bg || '#ffffff') + '"' + (bgNone ? ' disabled' : '') + '></div>' +
          '<div class="field"><label class="chk"><input type="checkbox" data-nkind="f" data-field="bgnone" data-idx="' + i + '"' + (bgNone ? ' checked' : '') + '> <span>' + esc(t('nt_bg_none')) + '</span></label>' +
            '<label class="chk"><input type="checkbox" data-nkind="f" data-field="bold" data-idx="' + i + '"' + (n.bold ? ' checked' : '') + '> <span>' + esc(t('nt_bold')) + '</span></label></div>' +
        '</div>' +
        '<div class="field"><label>' + esc(t('nt_img')) + '</label>' +
          '<div class="nt-img-row">' +
            '<input class="input" type="file" accept="image/*" data-nkind="file" data-idx="' + i + '">' +
            '<input class="input" data-nkind="url" data-idx="' + i + '" placeholder="' + esc(t('nt_img_url')) + '">' +
            (n.image ? '<button class="btn sm ghost" data-action="notice-img-del" data-idx="' + i + '">' + esc(t('nt_img_remove')) + '</button>' : '') +
          '</div></div>' +
        '<div class="nt-prev" id="ntPrev' + i + '"></div>' +
        '</div>';
    }

    function renderNotices() {
      $('noticeEditor').innerHTML = NOTICES.length
        ? NOTICES.map(noticeEditorHtml).join('')
        : '<div class="empty">' + esc(t('nt_empty')) + '</div>';
      NOTICES.forEach(function (_, i) { updateNoticePreview(i); });
    }

    function noticeClientHtml(n) {
      var pick = function (bn, en) { return LANG === 'bn' ? (bn || en) : (en || bn); };
      var head = pick(n.head_bn, n.head_en);
      var body = pick(n.body_bn, n.body_en);
      var style = 'font-family:' + (NF[n.font] || NF.sans) + ';text-align:' + (n.align || 'left') + ';' + (n.bg ? 'background:' + n.bg + ';' : '');
      return '<section class="notice" style="' + style + '">' +
        (n.image ? '<img class="notice-img" src="' + esc(n.image) + '" alt="">' : '') +
        (head ? '<h3 class="notice-h" style="font-size:' + n.head_size + 'px;color:' + n.head_color + ';font-weight:' + (n.bold ? 800 : 600) + '">' + esc(head) + '</h3>' : '') +
        (body ? '<div class="notice-b" style="font-size:' + n.body_size + 'px;color:' + n.body_color + '">' + esc(body) + '</div>' : '') +
        '</section>';
    }

    function updateNoticePreview(i) {
      var el = $('ntPrev' + i);
      if (!el || !NOTICES[i]) return;
      var n = NOTICES[i];
      el.innerHTML = (n.head_bn || n.head_en || n.body_bn || n.body_en || n.image)
        ? noticeClientHtml(n)
        : '<div class="muted" style="padding:10px">' + esc(t('nt_preview')) + '</div>';
    }

    function onNoticeInput(el) {
      var idx = Number(el.getAttribute('data-idx'));
      var n = NOTICES[idx];
      if (!n) return;
      var f = el.getAttribute('data-field');
      if (f === 'bgnone') {
        var blk = el.closest('.nt-block');
        var col = blk.querySelector('[data-field="bg"]');
        n.bg = el.checked ? '' : col.value;
        col.disabled = el.checked;
      } else if (f === 'bg') {
        n.bg = el.value;
      } else if (el.type === 'checkbox') {
        n[f] = el.checked;
      } else if (el.type === 'number') {
        n[f] = Number(el.value) || 0;
      } else {
        n[f] = el.value;
      }
      updateNoticePreview(idx);
    }

    // ছবি নির্বাচিত অনুপাতে কেটে বা আসল অনুপাতে ছোট করে JPEG বানানো
    function shrinkImage(file, maxSide, quality) {
      return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onerror = function () { reject(new Error('read')); };
        reader.onload = function (evt) {
          var img = new Image();
          img.onerror = function () { reject(new Error('decode')); };
          img.onload = function () {
            var scale = Math.min(1, maxSide / Math.max(img.width, img.height));
            var w = Math.round(img.width * scale);
            var h = Math.round(img.height * scale);
            var canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            var ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', quality));
          };
          img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    function cropImage(file, ratioStr) {
      var parts = String(ratioStr || '1:1').split(':');
      var rw = Number(parts[0]) || 1;
      var rh = Number(parts[1]) || 1;
      return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onerror = function () { reject(new Error('read')); };
        reader.onload = function (evt) {
          var img = new Image();
          img.onerror = function () { reject(new Error('decode')); };
          img.onload = function () {
            var target = rw / rh;
            var sw = img.width, sh = img.height, sx = 0, sy = 0;
            if (sw / sh > target) { sx = (sw - sh * target) / 2; sw = sh * target; }
            else { sy = (sh - sw / target) / 2; sh = sw / target; }
            var outW = 720;
            var outH = Math.round(outW * rh / rw);
            var canvas = document.createElement('canvas');
            canvas.width = outW;
            canvas.height = outH;
            var ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, outW, outH);
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
            resolve(canvas.toDataURL('image/jpeg', 0.78));
          };
          img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    function compressImage(file, ratioStr) {
      return ratioStr === 'auto' ? shrinkImage(file, 800, 0.8) : cropImage(file, ratioStr);
    }

    async function handleNoticeFile(idx, file) {
      try {
        var data = await shrinkImage(file, 640, 0.75);
        if (data.length > 300 * 1024) { toast(t('nt_too_big'), 'err'); return; }
        NOTICES[idx].image = data;
        renderNotices();
      } catch (err) {
        toast(t('img_fail', { name: file.name }), 'err');
      }
    }

    function addUrlImage() {
      var val = $('pImgUrl').value.trim();
      if (!val) return;
      if (IMAGES.length >= MAX_IMAGES) { toast(t('max_images', { n: MAX_IMAGES }), 'err'); return; }
      IMAGES.push(val);
      $('pImgUrl').value = '';
      renderImagePreviews();
    }

    function renderImagePreviews() {
      $('imgPreviewList').innerHTML = IMAGES.map(function (src, idx) {
        return '<div class="img-card"><img src="' + esc(src) + '" alt="">' +
          '<button type="button" data-action="remove-img" data-idx="' + idx + '">✕</button></div>';
      }).join('');
    }

    async function handleImages(e) {
      var files = Array.from(e.target.files || []);
      e.target.value = '';
      var ratio = $('pRatio').value;
      for (var i = 0; i < files.length; i++) {
        if (IMAGES.length >= MAX_IMAGES) { toast(t('max_images', { n: MAX_IMAGES }), 'err'); break; }
        try { IMAGES.push(await compressImage(files[i], ratio)); }
        catch (err) { toast(t('img_fail', { name: files[i].name }), 'err'); }
      }
      renderImagePreviews();
    }

    function collectTrust() {
      return TRUST.map(function (x) {
        return { icon: x.icon || '', bn: x.bn || '', en: x.en || '' };
      });
    }

    async function saveProduct() {
      if (IMAGES.length === 0) { setMsg('productMsg', t('need_image'), false); return; }
      var btn = $('saveBtn');
      btn.disabled = true;
      btn.textContent = t('saving');
      var tb = tbValues();
      var r = await api('/api/admin/product', 'POST', {
        title: $('pTitle').value,
        price: $('pPrice').value,
        old_price: $('pOldPrice').value,
        colors: $('pColors').value.trim(),
        sizes: $('pSizes').value.trim(),
        delivery_inside: $('pDelInside').value,
        delivery_outside: $('pDelOutside').value,
        contact_phone: $('pPhone').value.trim(),
        whatsapp_number: $('pWhatsapp').value.trim(),
        images: IMAGES,
        description: $('pDesc').value,
        image_ratio: $('pRatio').value,
        badge_pos: $('pBadge').value,
        trust: collectTrust(),
        faqs: FAQS,
        notices: NOTICES,
        topbar_bn: tb.bn,
        topbar_en: tb.en,
        topbar_size: tb.size,
        topbar_align: tb.align,
        topbar_offset: tb.offset,
        topbar_pad: tb.pad,
        topbar_lang_show: tb.langShow,
        topbar_lang_size: tb.langSize,
        site_language: tb.siteLanguage,
        is_active: $('pActive').checked
      });
      btn.disabled = false;
      btn.textContent = t('save_all');
      if (r.ok) { setMsg('productMsg', t('saved_ok'), true); toast(t('saved_toast'), 'ok'); }
      else setMsg('productMsg', r.data.error || t('status_fail'), false);
    }

    /* ---------- Offers & coupons (pro) ---------- */

    var OFFERS = { bulk: null, coupons: [], notes: {}, personal: [], rewardRules: 0, totals: {} };
    var CP_FILTER = { q: '', s: 'all' };
    var RW_Q = '';
    var RW_F = 'all';

    async function loadOffers() {
      var rs = await Promise.all([api('/api/admin/offers'), api('/api/admin/rewards')]);
      var r = rs[0];
      var p = rs[1];
      if (!r.ok) return;
      OFFERS = {
        bulk: r.data.bulk,
        coupons: r.data.coupons || [],
        notes: r.data.notes || {},
        rewardRules: r.data.rewardRules || 0,
        totals: r.data.totals || {},
        giveaway: r.data.giveaway || {},
        rewards: p.ok ? (p.data.rewards || []) : []
      };
      renderOffStats();
      renderBulkForm();
      renderNotesForm();
      renderGiveaway();
      renderCouponChips();
      renderCoupons();
      renderRewardChips();
      renderRewards();
    }

    function renderGiveaway() {
      var g = OFFERS.giveaway || {};
      var left = g.expires_at ? Math.max(1, Math.ceil((new Date(g.expires_at).getTime() - Date.now()) / 86400000)) : '';
      $('gvCode').value = g.code || '';
      $('gvPct').value = g.percent || 10;
      $('gvDays').value = left;
      $('gvWords').value = g.words || 'GIFT';
      $('gvCode').placeholder = 'Generated code preview';
      $('gvMode').value = g.rewardMode || 'every';
      var tg = $('gvToggle');
      tg.textContent = g.enabled ? t('gv_state_on') : t('gv_state_off');
      tg.className = 'btn sm' + (g.enabled ? '' : ' ghost');
    }

    // 🎲 কোড তৈরি: একবারে কোড + কুপন তৈরি ও সেভ হয়ে যায়
    async function generateGiveCode() {
      var r = await api('/api/admin/giveaway/generate', 'POST', {
        percent: Number($('gvPct').value),
        expiry_days: Number($('gvDays').value) || 0,
        words: $('gvWords').value,
        reward_mode: $('gvMode').value
      });
      if (r.ok) { toast(t('gv_generated') + ': ' + r.data.code, 'ok'); loadOffers(); }
      else toast(r.data.error || t('status_fail'), 'err');
    }

    async function saveGiveaway() {
      var r = await api('/api/admin/giveaway', 'POST', {
        code: $('gvCode').value.trim(),
        percent: Number($('gvPct').value),
        expiry_days: Number($('gvDays').value) || 0,
        words: $('gvWords').value,
        reward_mode: $('gvMode').value
      });
      if (r.ok) { setMsg('gvMsg', t('gv_saved'), true); toast(t('gv_saved'), 'ok'); loadOffers(); }
      else setMsg('gvMsg', r.data.error || t('status_fail'), false);
    }

    // on/off আলাদা বাটন: সেভ না করেই চালু/বন্ধ হয়
    async function toggleGiveaway() {
      var g = OFFERS.giveaway || {};
      var r = await api('/api/admin/giveaway/toggle', 'POST', { enabled: !g.enabled });
      if (r.ok) { toast(t('gv_toggled'), 'ok'); loadOffers(); }
      else toast(r.data.error || t('status_fail'), 'err');
    }

    function couponStatus(c) {
      if (!Number(c.active)) return 'inactive';
      if (c.expires_at && new Date(c.expires_at).getTime() <= Date.now()) return 'expired';
      if (Number(c.max_uses) > 0 && Number(c.uses) >= Number(c.max_uses)) return 'used';
      return 'active';
    }

    function renderOffStats() {
      var pub = OFFERS.coupons.filter(function (c) { return !Number(c.is_personal); });
      var active = pub.filter(function (c) { return couponStatus(c) === 'active'; }).length;
      var uses = pub.reduce(function (s, c) { return s + (Number(c.uses) || 0); }, 0);
      var tot = OFFERS.totals || {};
      $('offStats').innerHTML = [
        statCard(t('off_stat_active'), active, '🎟️', 'green'),
        statCard(t('off_stat_uses'), uses, '🔁', 'blue'),
        statCard(t('off_stat_cdisc'), money(tot.coupon_total), '💸', 'amber'),
        statCard(t('off_stat_bdisc'), money(tot.bulk_total), '📦', 'purple')
      ].join('');
    }

    function renderNotesForm() {
      var n = OFFERS.notes || {};
      $('ntBulkBn').value = n.note_bulk_bn || '';
      $('ntBulkEn').value = n.note_bulk_en || '';
      $('ntCouponBn').value = n.note_coupon_bn || '';
      $('ntCouponEn').value = n.note_coupon_en || '';
      $('ntBulkOn').checked = n.note_bulk_on !== '0';
      $('ntCouponOn').checked = n.note_coupon_on !== '0';
    }

    async function saveNotes() {
      var r = await api('/api/admin/notes', 'POST', {
        note_bulk_bn: $('ntBulkBn').value,
        note_bulk_en: $('ntBulkEn').value,
        note_coupon_bn: $('ntCouponBn').value,
        note_coupon_en: $('ntCouponEn').value,
        note_bulk_on: $('ntBulkOn').checked,
        note_coupon_on: $('ntCouponOn').checked
      });
      if (r.ok) { setMsg('ntMsg', t('notes_saved'), true); toast(t('notes_saved'), 'ok'); loadOffers(); }
      else setMsg('ntMsg', r.data.error || t('status_fail'), false);
    }

    function renderBulkForm() {
      var b = OFFERS.bulk || {};
      $('bkOn').checked = !!b.enabled;
      $('bkMin').value = b.min || 2;
      $('bkType').value = b.type || 'percent';
      $('bkVal').value = b.value || 0;
    }

    async function saveBulk() {
      var r = await api('/api/admin/offers/bulk', 'POST', {
        enabled: $('bkOn').checked,
        min_qty: Number($('bkMin').value) || 2,
        type: $('bkType').value,
        value: Number($('bkVal').value) || 0
      });
      if (r.ok) { setMsg('bkMsg', t('bulk_saved'), true); toast(t('bulk_saved'), 'ok'); loadOffers(); }
      else setMsg('bkMsg', r.data.error || t('status_fail'), false);
    }

    function randomFrom(chars, n) {
      var bytes = new Uint8Array(n);
      crypto.getRandomValues(bytes);
      var s = '';
      for (var i = 0; i < n; i++) s += chars[bytes[i] % chars.length];
      return s;
    }

    var ENGINES = {
      alnum: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      readable: 'ABCDEFGHJKMNPQRSTUVWXYZ23456789',
      letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      digits: '0123456789'
    };

    // আপনার দেওয়া শব্দ + বাছাই করা ধরনের এলোমেলো অংশ দিয়ে কোড
    function generateCouponCode() {
      var words = $('cpWords').value.split(',').map(function (w) {
        return w.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      }).filter(Boolean);
      var n = Math.max(2, Math.min(10, Number($('cpSuffix').value) || 4));
      var chars = ENGINES[$('cpEngine').value] || ENGINES.readable;
      var suffix = randomFrom(chars, n);
      var word = words.length ? words[Math.floor(Math.random() * words.length)] : '';
      $('cpCode').value = (word ? word + '-' : '') + suffix;
    }

    async function createCoupon() {
      var r = await api('/api/admin/coupons', 'POST', {
        code: $('cpCode').value.trim(),
        percent: Number($('cpPct').value),
        max_uses: Number($('cpMax').value) || 0,
        expiry_days: Number($('cpExpDays').value) || 0,
        reward_rule: $('cpRule').value,
        active: $('cpActive').checked
      });
      if (r.ok) {
        setMsg('cpMsg', t('cp_created') + ': ' + r.data.code, true);
        $('cpCode').value = '';
        loadOffers();
      } else {
        setMsg('cpMsg', r.data.error || t('status_fail'), false);
      }
    }

    function ruleLabel(r) {
      return r === 'every' ? t('cp_r_every') : (r === 'first' ? t('cp_r_first') : t('cp_r_none'));
    }

    function leftText(iso) {
      if (!iso) return t('cp_never');
      var diff = new Date(iso).getTime() - Date.now();
      if (diff <= 0) return t('cp_expired');
      var d = Math.floor(diff / 86400000);
      var h = Math.floor((diff % 86400000) / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      if (d >= 1) return t('cp_left_days', { d: d, h: h });
      if (h >= 1) return t('cp_left_hours', { h: h, m: m });
      return t('cp_left_min', { m: m });
    }

    function tickCountdowns() {
      document.querySelectorAll('.cd').forEach(function (el) {
        var iso = el.getAttribute('data-exp');
        el.textContent = leftText(iso);
        el.classList.toggle('expired', !!iso && new Date(iso).getTime() <= Date.now());
      });
    }

    function couponRowHtml(c) {
      var st = couponStatus(c);
      var on = Number(c.active);
      var usage = Number(c.uses) + ' / ' + (Number(c.max_uses) > 0 ? Number(c.max_uses) : t('cp_unlimited'));
      return '<tr><td><span class="pid" data-action="copy" data-copy="' + esc(c.code) + '">' + esc(c.code) + '</span></td>' +
        '<td>' + Number(c.percent) + '%</td>' +
        '<td>' + esc(usage) + '</td>' +
        '<td><span class="cd" data-exp="' + esc(c.expires_at || '') + '"></span></td>' +
        '<td><span class="badge ' + (st === 'active' ? 's-Delivered' : 's-Cancelled') + '">' + esc(t('cp_f_' + st)) + '</span></td>' +
        '<td>' + esc(ruleLabel(c.reward_rule)) + '</td>' +
        '<td><div class="row">' +
          '<button class="btn sm ghost" data-action="cp-share" data-code="' + esc(c.code) + '" data-p="' + Number(c.percent) + '">' + esc(t('cp_share')) + '</button>' +
          '<button class="btn sm ' + (on ? '' : 'ghost') + '" data-action="coupon-toggle" data-id="' + Number(c.id) + '" data-on="' + (on ? 0 : 1) + '">' + esc(on ? t('cp_on') : t('cp_off')) + '</button>' +
          '<button class="btn sm danger" data-action="coupon-del" data-id="' + Number(c.id) + '" data-code="' + esc(c.code) + '">' + esc(t('delete')) + '</button>' +
        '</div></td></tr>';
    }

    function renderCouponChips() {
      var pub = OFFERS.coupons.filter(function (c) { return !Number(c.is_personal); });
      var counts = { all: pub.length };
      pub.forEach(function (c) { var s = couponStatus(c); counts[s] = (counts[s] || 0) + 1; });
      var keys = ['all', 'active', 'inactive', 'expired', 'used'];
      $('cpChips').innerHTML = keys.map(function (k) {
        return '<button type="button" class="chip' + (CP_FILTER.s === k ? ' on' : '') + '" data-action="cp-filter" data-v="' + k + '">' +
          esc(t('cp_f_' + k)) + ' <b>' + (counts[k] || 0) + '</b></button>';
      }).join('');
    }

    function renderCoupons() {
      var q = CP_FILTER.q.toUpperCase();
      var list = OFFERS.coupons.filter(function (c) {
        if (Number(c.is_personal)) return false;
        if (CP_FILTER.s !== 'all' && couponStatus(c) !== CP_FILTER.s) return false;
        return !q || String(c.code).toUpperCase().indexOf(q) >= 0;
      });
      $('cpList').innerHTML = list.length
        ? '<table><thead><tr><th>' + esc(t('cp_code')) + '</th><th>%</th><th>' + esc(t('cp_max')) + '</th><th>' +
          esc(t('cp_expiry')) + '</th><th>' + esc(t('cp_f_all')) + '</th><th>' + esc(t('cp_reward')) + '</th><th></th></tr></thead><tbody>' +
          list.map(couponRowHtml).join('') + '</tbody></table>'
        : '<div class="empty">' + esc(t('cp_none')) + '</div>';
      tickCountdowns();
    }

    function rewardStatus(r) {
      if (!Number(r.active)) return 'inactive';
      if (r.expires_at && new Date(r.expires_at).getTime() <= Date.now()) return 'expired';
      if (Number(r.uses) >= Math.max(1, Number(r.max_uses) || 1)) return 'used';
      return 'unused';
    }

    function rewardLabel(s) {
      var keys = { unused: 'cp_unused', used: 'cp_used', expired: 'cp_f_expired', inactive: 'cp_f_inactive' };
      return t(keys[s] || 'cp_unused');
    }

    function setRwFilter(v) {
      RW_F = v;
      renderRewardChips();
      renderRewards();
    }

    function renderRewardChips() {
      var list = OFFERS.rewards || [];
      var counts = { all: list.length };
      list.forEach(function (r) { var s = rewardStatus(r); counts[s] = (counts[s] || 0) + 1; });
      var labels = { all: 'cp_f_all', unused: 'cp_unused', used: 'cp_used', expired: 'cp_f_expired', inactive: 'cp_f_inactive' };
      $('rwChips').innerHTML = ['all', 'unused', 'used', 'expired', 'inactive'].map(function (k) {
        return '<button type="button" class="chip' + (RW_F === k ? ' on' : '') + '" data-action="rw-filter" data-v="' + k + '">' +
          esc(t(labels[k])) + ' <b>' + (counts[k] || 0) + '</b></button>';
      }).join('');
    }

    function rewardRowHtml(r) {
      var st = rewardStatus(r);
      var from = r.issued_order
        ? '<span class="pid">' + esc(r.issued_order) + '</span><div class="muted">' + esc(r.issued_name || '') + '</div>'
        : '<span class="muted">—</span>';
      var used = r.used_order
        ? '<span class="pid">' + esc(r.used_order) + '</span><div class="muted">' + esc(r.used_name || '') + '</div>'
        : '<span class="muted">—</span>';
      return '<tr><td><span class="pid" data-action="copy" data-copy="' + esc(r.code) + '">' + esc(r.code) + '</span></td>' +
        '<td>' + Number(r.percent) + '%</td>' +
        '<td>' + from + '</td>' +
        '<td><span class="badge ' + (st === 'used' ? 's-Delivered' : (st === 'unused' ? 's-Pending' : 's-Cancelled')) + '">' + esc(rewardLabel(st)) + '</span></td>' +
        '<td>' + used + '</td>' +
        '<td>' + (r.used_at ? fmtDate(r.used_at) : '—') + '</td>' +
        '<td><span class="cd" data-exp="' + esc(r.expires_at || '') + '"></span></td>' +
        '<td><button class="btn sm danger" data-action="coupon-del" data-id="' + Number(r.id) + '" data-code="' + esc(r.code) + '">' + esc(t('delete')) + '</button></td></tr>';
    }

    function renderRewards() {
      var q = RW_Q.toUpperCase();
      var list = (OFFERS.rewards || []).filter(function (r) {
        if (RW_F !== 'all' && rewardStatus(r) !== RW_F) return false;
        var hay = [r.code, r.issued_order, r.used_order, r.issued_name, r.used_name].join(' ').toUpperCase();
        return !q || hay.indexOf(q) >= 0;
      });
      $('cpPersonalInfo').textContent = OFFERS.rewardRules ? t('cp_templates', { n: OFFERS.rewardRules }) : t('cp_no_templates');
      $('cpPersonal').innerHTML = list.length
        ? '<table><thead><tr><th>' + esc(t('cp_code')) + '</th><th>%</th><th>' + esc(t('rh_from')) + '</th><th>' +
          esc(t('rh_status')) + '</th><th>' + esc(t('rh_used_in')) + '</th><th>' + esc(t('rh_used_at')) + '</th><th>' +
          esc(t('cp_expiry')) + '</th><th></th></tr></thead><tbody>' + list.map(rewardRowHtml).join('') + '</tbody></table>'
        : '<div class="empty">' + esc(t('rh_none')) + '</div>';
      tickCountdowns();
    }

    function exportRewards() {
      var list = OFFERS.rewards || [];
      if (!list.length) { toast(t('rh_none'), 'err'); return; }
      var headers = ['Code', 'Percent', 'Status', 'IssuedFrom', 'IssuedName', 'CreatedAt', 'UsedIn', 'UsedName', 'UsedAt', 'Expires', 'Uses'];
      var rows = list.map(function (r) {
        return [r.code, r.percent, rewardStatus(r), r.issued_order, r.issued_name, r.created_at, r.used_order,
          r.used_name, r.used_at, r.expires_at, r.uses].map(csvQ).join(',');
      });
      saveFile('reward_history_' + stamp() + '.csv', '\\uFEFF' + [headers.join(',')].concat(rows).join('\\r\\n'));
    }

    async function toggleCoupon(id, on) {
      var r = await api('/api/admin/coupons/update', 'POST', { id: id, active: !!on });
      if (r.ok) loadOffers(); else toast(r.data.error || t('status_fail'), 'err');
    }

    // প্রথমে confirm, তারপর কোড টাইপ করে নিশ্চিত করলে তবেই মুছবে
    async function deleteCoupon(id, code) {
      if (!(await askConfirm(t('cp_delete_step1') + ' ' + code, true))) return;
      var typed = await askText(t('cp_delete_type', { code: code }), false);
      if (typed === null) return;
      if (typed.trim().toUpperCase() !== String(code).toUpperCase()) {
        toast(t('cp_delete_mismatch'), 'err');
        return;
      }
      var r = await api('/api/admin/coupons/delete', 'POST', { id: id });
      if (r.ok) { toast(t('deleted'), 'ok'); loadOffers(); }
      else toast(r.data.error || t('status_fail'), 'err');
    }

    // Android app-এ browser download কাজ করে না, তাই app-এর save bridge আগে ব্যবহার হয়
    function saveFile(name, content) {
      if (window.AndroidApp && window.AndroidApp.saveCsv) { window.AndroidApp.saveCsv(name, content); return; }
      var blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    }

    function csvQ(v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }
    function stamp() { return new Date().toISOString().slice(0, 10); }

    function downloadCouponCsv(list, name) {
      if (!list.length) { toast(t('cp_none'), 'err'); return; }
      var headers = ['Code', 'Type', 'Percent', 'Uses', 'MaxUses', 'Status', 'ExpiresAt', 'CreatedAt', 'RewardRule'];
      var rows = list.map(function (c) {
        return [c.code, Number(c.is_personal) ? 'personal' : 'manual', c.percent, c.uses, c.max_uses,
          couponStatus(c), c.expires_at || '', c.created_at || '', c.reward_rule || ''].map(csvQ).join(',');
      });
      saveFile(name + '_' + stamp() + '.csv', '\\uFEFF' + [headers.join(',')].concat(rows).join('\\r\\n'));
    }

    function copyRaw(text, msgKey) {
      var ok = function () { toast(t(msgKey || 'cp_share_done'), 'ok'); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(ok, function () { toast(t('copy_fail'), 'err'); });
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); ok(); } catch (e) { toast(t('copy_fail'), 'err'); }
        ta.remove();
      }
    }

    function shareCoupon(code, p) {
      copyRaw(t('cp_share_txt', { code: code, p: p }));
    }

    /* ---------- Inventory ---------- */

    async function loadInventory() {
      var s = await api('/api/admin/stats');
      if (s.ok) PRODUCT = s.data.product || PRODUCT;
      var r = await api('/api/admin/inventory');
      if (!r.ok) return;
      INV_ROWS = r.data.rows || [];
      renderInventory();
    }

    function renderInventory() {
      var colors = splitList(PRODUCT.colors || '');
      var sizes = splitList(PRODUCT.sizes || '');
      var cs = colors.length ? colors : [''];
      var ss = sizes.length ? sizes : [''];
      var map = {};
      INV_ROWS.forEach(function (r) { map[r.color + '|' + r.size] = Number(r.qty) || 0; });
      var head = '<tr><th>' + esc(t('inv_color')) + '</th>' + ss.map(function (s) {
        return '<th>' + esc(s || t('inv_single')) + '</th>';
      }).join('') + '<th>' + esc(t('inv_total')) + '</th></tr>';
      var body = cs.map(function (c) {
        var cells = ss.map(function (s) {
          var q = map[c + '|' + s] || 0;
          return '<td><input class="input inv-in" type="number" min="0" data-c="' + esc(c) + '" data-s="' + esc(s) + '" value="' + q + '"></td>';
        }).join('');
        return '<tr><th>' + esc(c || t('inv_single')) + '</th>' + cells + '<td class="rowtot"><strong>0</strong></td></tr>';
      }).join('');
      var foot = '<tr><th>' + esc(t('inv_total')) + '</th>' + ss.map(function (s) {
        return '<td class="colsum" data-s="' + esc(s) + '">0</td>';
      }).join('') + '<td><strong class="grand">0</strong></td></tr>';
      $('invBox').innerHTML = '<table id="invTable"><thead>' + head + '</thead><tbody>' + body + '</tbody><tfoot>' + foot + '</tfoot></table>';
      recalcInv();
    }

    function recalcInv() {
      var table = $('invTable');
      if (!table) return;
      var grand = 0;
      var colSums = {};
      table.querySelectorAll('tbody tr').forEach(function (tr) {
        var rs = 0;
        tr.querySelectorAll('.inv-in').forEach(function (inp) {
          var v = Number(inp.value) || 0;
          var key = inp.getAttribute('data-s');
          rs += v;
          colSums[key] = (colSums[key] || 0) + v;
          inp.className = 'input inv-in' + (v <= 0 ? ' out' : (v <= LOW_STOCK_VIEW ? ' low' : ''));
        });
        var rt = tr.querySelector('.rowtot strong');
        if (rt) rt.textContent = rs;
        grand += rs;
      });
      table.querySelectorAll('tfoot .colsum').forEach(function (td) {
        td.textContent = colSums[td.getAttribute('data-s')] || 0;
      });
      table.querySelector('tfoot .grand').textContent = grand;
    }

    async function saveInventory() {
      var items = [];
      document.querySelectorAll('#invTable .inv-in').forEach(function (inp) {
        items.push({ color: inp.getAttribute('data-c'), size: inp.getAttribute('data-s'), qty: Number(inp.value) || 0 });
      });
      var r = await api('/api/admin/inventory', 'POST', { items: items });
      if (r.ok) { toast(t('inv_saved'), 'ok'); loadInventory(); }
      else toast(r.data.error || t('status_fail'), 'err');
    }

    async function addVariant() {
      var color = $('ivColor').value.trim();
      var size = $('ivSize').value.trim();
      var qty = Number($('ivQty').value) || 0;
      if (!color && !size) { setMsg('ivMsg', t('inv_add_need'), false); return; }
      var r = await api('/api/admin/inventory/add', 'POST', { color: color, size: size, qty: qty });
      if (r.ok) {
        setMsg('ivMsg', t('inv_added'), true);
        toast(t('inv_added'), 'ok');
        $('ivColor').value = '';
        $('ivSize').value = '';
        $('ivQty').value = 0;
        loadInventory();
      } else {
        setMsg('ivMsg', r.data.error || t('failed'), false);
      }
    }

    /* ---------- Admins ---------- */

    async function loadUsers() {
      loadSecurity();
      var r = await api('/api/admin/users');
      if (!r.ok) return;
      var users = r.data.users || [];
      $('userList').innerHTML = users.length ? users.map(function (u) {
        var self = ME && u.id === ME.id;
        return '<div class="list-item"><div><strong>' + esc(u.username) + '</strong>' +
          (self ? ' <span class="badge s-Confirmed">' + esc(t('you')) + '</span>' : '') +
          '<div class="muted">' + esc(t('joined')) + fmtDate(u.created_at) + '</div></div>' +
          '<div class="row">' +
          '<button class="btn sm ghost" data-action="reset-user" data-id="' + Number(u.id) + '">' + esc(t('reset_pw')) + '</button>' +
          (self ? '' : '<button class="btn sm danger" data-action="delete-user" data-id="' + Number(u.id) + '">' + esc(t('delete')) + '</button>') +
          '</div></div>';
      }).join('') : '<div class="empty">' + esc(t('no_admins')) + '</div>';
    }

    async function addUser() {
      var u = $('nuUser').value.trim().toLowerCase();
      var pw = $('nuPass').value;
      var r = await api('/api/admin/users', 'POST', { username: u, password: pw });
      if (r.ok) {
        setMsg('userMsg', t('admin_added'), true);
        $('nuUser').value = '';
        $('nuPass').value = '';
        showCredentials(u, pw);
        loadUsers();
      } else {
        setMsg('userMsg', r.data.error || t('admin_add_fail'), false);
      }
    }

    // নতুন অ্যাডমিনের পাসওয়ার্ড শুধু একবার দেখানো হয় (সার্ভারে শুধু hash থাকে)
    function showCredentials(u, pw) {
      openModal(
        '<h3>' + esc(t('cred_title')) + '</h3>' +
        '<dl class="kv"><dt>' + esc(t('username')) + '</dt><dd>' + esc(u) + '</dd>' +
        '<dt>' + esc(t('password')) + '</dt><dd><span class="pid">' + esc(pw) + '</span></dd></dl>' +
        '<p class="hint-text">' + esc(t('cred_note')) + '</p>' +
        '<button class="btn block" data-action="copy" data-copy="' + esc(u + ' / ' + pw) + '">' + esc(t('act_copy')) + '</button>'
      );
    }

    async function resetUser(id) {
      var pw = await askText(t('new_pw_prompt'), true);
      if (!pw) return;
      var r = await api('/api/admin/users/reset', 'POST', { id: id, password: pw });
      toast(r.ok ? t('pw_reset_ok') : (r.data.error || t('failed')), r.ok ? 'ok' : 'err');
      loadUsers();
    }

    async function deleteUser(id) {
      if (!(await askConfirm(t('delete_admin_confirm'), true))) return;
      var r = await api('/api/admin/users/delete', 'POST', { id: id });
      toast(r.ok ? t('admin_deleted') : (r.data.error || t('failed')), r.ok ? 'ok' : 'err');
      loadUsers();
    }

    /* ---------- Logs (IP ঠিকানা সহ) ---------- */

    var LOGS = [];
    var LOG_F = 'all';
    var SEC_ACTIONS = ['login_ok', 'login_fail', 'logout_all', 'password_change', 'username_change', 'admin_add', 'admin_delete', 'admin_reset'];
    var ORD_ACTIONS = ['order_create', 'order_status', 'order_delete', 'order_note'];

    async function loadLogs() {
      var r = await api('/api/admin/logs');
      if (!r.ok) return;
      LOGS = r.data.logs || [];
      renderLogs();
    }

    function setLogFilter(v) {
      LOG_F = v;
      renderLogs();
    }

    function renderLogs() {
      var chips = [['all', 'log_all'], ['sec', 'log_sec'], ['ord', 'log_ord'], ['cat', 'log_cat']];
      $('logChips').innerHTML = chips.map(function (c) {
        return '<button type="button" class="chip' + (LOG_F === c[0] ? ' on' : '') + '" data-action="log-filter" data-v="' + c[0] + '">' + esc(t(c[1])) + '</button>';
      }).join('');
      var list = LOGS.filter(function (l) {
        if (LOG_F === 'sec') return SEC_ACTIONS.indexOf(l.action) >= 0;
        if (LOG_F === 'ord') return ORD_ACTIONS.indexOf(l.action) >= 0;
        if (LOG_F === 'cat') return ORD_ACTIONS.indexOf(l.action) < 0 && SEC_ACTIONS.indexOf(l.action) < 0;
        return true;
      });
      var fails = LOGS.filter(function (l) { return l.action === 'login_fail'; }).length;
      var head = LOG_F === 'sec' ? '<p class="hint-text" style="font-weight:700;margin:0 0 10px;">🛡️ ' + esc(t('log_fails', { n: fails })) + '</p>' : '';
      $('logBox').innerHTML = head + (list.length
        ? '<table><thead><tr><th>' + esc(t('col_time')) + '</th><th>' + esc(t('col_user')) + '</th><th>' + esc(t('col_action')) +
          '</th><th>' + esc(t('col_detail')) + '</th><th>' + esc(t('col_ip')) + '</th></tr></thead><tbody>' +
          list.map(function (l) {
            var label = ACTION_KEYS[l.action] ? ACTION_KEYS[l.action][LANG === 'bn' ? 0 : 1] : l.action;
            var sec = SEC_ACTIONS.indexOf(l.action) >= 0;
            return '<tr><td>' + fmtDate(l.created_at) + '</td><td>' + esc(l.actor) + '</td><td>' +
              (sec ? '🛡️ ' : '') + esc(label) + '</td><td>' + esc(l.target) + '</td><td>' + esc(l.ip) + '</td></tr>';
          }).join('') + '</tbody></table>'
        : '<div class="empty">' + esc(t('no_logs')) + '</div>');
    }

    // Settings > Security & account: expand the parent card with its content.
    function toggleSettingsSecurity() {
      var w = $('saWrap');
      var card = w && w.closest('.settings-security-card');
      var trigger = document.querySelector('[data-action="sa-toggle"]');
      var arrow = $('saArrow');
      if (!w || !card) return;
      var open = w.classList.contains('hidden');
      w.classList.toggle('hidden', !open);
      card.classList.toggle('is-open', open);
      if (trigger) trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (arrow) arrow.textContent = open ? '▾' : '▸';
    }

    async function loadSecurity() {
      var r = await api('/api/admin/security');
      if (!r.ok || !$('secStats')) return;
      var d = r.data;
      $('secStats').innerHTML = [
        statCard(t('sec_sessions'), d.sessions, '🔐', 'blue'),
        statCard(t('sec_fails'), d.failed24h, '🚫', 'amber'),
        statCard(t('sec_admins'), d.admins, '👥', 'green'),
        statCard(t('sec_last'), d.lastLogin ? fmtDate(d.lastLogin) : '—', '🕒', 'purple')
      ].join('');
      $('secInfo').textContent = t('sec_user', { u: ME ? ME.username : '' });
    }

    /* ---------- Settings: security & printer ---------- */

    async function changeOwnPass() {
      var cur = $('cpCurrent').value;
      var nw = $('cpNew').value;
      var cf = $('cpConfirm').value;
      if (nw !== cf) { setMsg('passMsg', t('pw_mismatch'), false); return; }
      var r = await api('/api/admin/me/password', 'POST', { current: cur, new: nw });
      if (r.ok) {
        $('cpCurrent').value = '';
        $('cpNew').value = '';
        $('cpConfirm').value = '';
        forceLogout(t('pw_changed'));
      }
      else setMsg('passMsg', r.data.error || t('pw_fail'), false);
    }

    async function changeOwnUser() {
      var r = await api('/api/admin/me/username', 'POST', {
        current: $('unCur').value,
        username: $('unNew').value.trim()
      });
      if (r.ok) {
        ME.username = r.data.username;
        $('whoBadge').textContent = ME.username.charAt(0).toUpperCase();
        $('unCur').value = '';
        $('unNew').value = '';
        setMsg('unMsg', t('un_done'), true);
      } else {
        setMsg('unMsg', r.data.error || t('failed'), false);
      }
    }

    async function loadIdGenerator() {
      var r = await api('/api/admin/id-generator');
      if (!r.ok) { setMsg('idGenMsg', r.data.error || t('status_fail'), false); return; }
      $('orderIdPrefix').value = r.data.prefix || '';
      $('orderIdDefault').textContent = r.data.defaultPrefix || '—';
      setMsg('idGenMsg', '', true);
    }

    async function saveIdGenerator() {
      var r = await api('/api/admin/id-generator', 'POST', { prefix: $('orderIdPrefix').value });
      if (r.ok) {
        $('orderIdPrefix').value = r.data.prefix || '';
        $('orderIdDefault').textContent = r.data.defaultPrefix || '—';
        setMsg('idGenMsg', t('id_saved'), true);
        toast(t('id_saved'), 'ok');
      } else {
        setMsg('idGenMsg', r.data.error || t('status_fail'), false);
      }
    }

    function setPrintTab(v) {
      PRINT_TAB = v === 'pos' ? 'pos' : 'invoice';
      renderPrinter();
    }

    async function applyPrintTheme(id) {
      var th = themeList().filter(function (x) { return x.id === id; })[0];
      var c = PRINT[PRINT_TAB];
      if (!th || !c) return;
      c.theme = th.id;
      c.primary = th.primary;
      c.text = th.text;
      c.bg = th.bg;
      c.line = th.line;
      c.header_bg = th.header;
      c.font = th.font;
      renderPrinter();
      await savePrint();
    }

    async function handleLogo(file) {
      try {
        var data = await shrinkImage(file, 400, 0.9);
        if (data.length > 250 * 1024) { toast(t('pr_logo_big'), 'err'); return; }
        PRINT[PRINT_TAB].logo = data;
        renderPrinter();
      } catch (err) {
        toast(t('img_fail', { name: file.name }), 'err');
      }
    }

    async function savePrint() {
      var r = await api('/api/admin/print', 'POST', { kind: PRINT_TAB, cfg: PRINT[PRINT_TAB] });
      if (r.ok) {
        PRINT_SAVED = JSON.parse(JSON.stringify(PRINT));
        var previewBox = $('printPrev');
        if (previewBox) {
          previewBox.dataset.previewZoom = '1';
          requestAnimationFrame(function () { fitInvoicePreview('printPrev', 'pvPrint', 'fit'); });
        }
        toast(t('pr_saved'), 'ok');
      } else {
        toast(r.data.error || t('status_fail'), 'err');
      }
    }

    function revertPrint() {
      PRINT = JSON.parse(JSON.stringify(PRINT_SAVED || PRINT));
      renderPrinter();
    }

    function updatePrintPreview() {
      var box = $('printPrev');
      var c = PRINT[PRINT_TAB];
      if (!box || !c) return;
      box.innerHTML = '<div class="print-preview-stage">' + pdPreviewHtml(sampleOrder(), c, 'pvPrint', PRINT_TAB) + '</div>';
      var controls = $('printPreviewZoomControls');
      if (controls) controls.innerHTML = PRINT_TAB === 'invoice' ? previewZoomControls('printPrev', 'pvPrint') : '';
      if (PRINT_TAB === 'invoice') requestAnimationFrame(function () { fitInvoicePreview('printPrev', 'pvPrint'); });
      else {
        var stage = box.querySelector('.print-preview-stage');
        var page = $('pvPrint');
        if (!stage || !page) return;
        var available = Math.max(120, box.clientWidth - 24);
        var naturalWidth = page.offsetWidth;
        var naturalHeight = page.offsetHeight;
        var scale = naturalWidth > available ? available / naturalWidth : 1;
        page.style.transformOrigin = 'top left';
        page.style.transform = 'scale(' + scale + ')';
        page.style.margin = '0';
        stage.style.position = 'relative';
        stage.style.width = Math.round(naturalWidth * scale) + 'px';
        stage.style.height = Math.round(naturalHeight * scale) + 'px';
        stage.style.margin = '0 auto';
        stage.style.overflow = 'hidden';
      }
    }

    function renderPrinter() {
      var currentGrid = $('invoiceSettingsAccordion') && $('invoiceSettingsAccordion').closest('.print-choice-grid');
      var previousSharedPreview = currentGrid && currentGrid.querySelector('.print-shared-preview');
      if (previousSharedPreview) previousSharedPreview.remove();
      var box = $(PRINT_TAB === 'pos' ? 'posPrintBox' : 'printBox');
      var otherBox = $(PRINT_TAB === 'pos' ? 'printBox' : 'posPrintBox');
      if (otherBox) otherBox.innerHTML = '';
      var c = PRINT[PRINT_TAB];
      if (!box || !c) return;
      if (PRINT_TAB === 'invoice' && !['A4', 'A5', 'Letter'].includes(c.page)) c.page = 'A4';
      var tabs = '<div class="pr-tabs"><strong>📄 Invoice designer</strong><span class="muted">Edit brand, logo and footer</span></div>';
      var themes = '<div class="th-grid">' + themeList().map(function (th) {
        return '<button type="button" class="th-btn' + (c.theme === th.id ? ' on' : '') + '" data-action="pt-theme" data-v="' + th.id + '">' +
          '<span class="th-sw" style="background:' + th.primary + '"></span><span>' + esc(th.name) + '</span></button>';
      }).join('') + '</div>';
      var pages = Object.keys(PD_PAGE).map(function (k) {
        return '<option value="' + k + '"' + (c.page === k ? ' selected' : '') + '>' + k + '</option>';
      }).join('');
      var num = function (label, field, min, max) {
        return '<div class="field"><label>' + esc(label) + '</label><input class="input" type="number" min="' + min + '" max="' + max + '" data-pf="' + field + '" value="' + c[field] + '"></div>';
      };
      var txt = function (label, field, max) {
        return '<div class="field"><label>' + esc(label) + '</label><input class="input" type="text" maxlength="' + max + '" data-pf="' + field + '" value="' + esc(c[field]) + '"></div>';
      };
      var col = function (label, field) {
        return '<div class="field"><label>' + esc(label) + '</label><input class="input" type="color" data-pf="' + field + '" value="' + c[field] + '"></div>';
      };
      var chk = function (label, field) {
        return '<label class="chk"><input type="checkbox" data-pf="' + field + '"' + (c[field] ? ' checked' : '') + '> <span>' + esc(label) + '</span></label>';
      };
      var sel = function (label, field, opts) {
        var numeric = typeof c[field] === 'number' ? ' data-pnum="1"' : '';
        return '<div class="field"><label>' + esc(label) + '</label><select class="input" data-pf="' + field + '"' + numeric + '>' +
          opts.map(function (o) {
            return '<option value="' + o[0] + '"' + (String(c[field]) === String(o[0]) ? ' selected' : '') + '>' + esc(o[1]) + '</option>';
          }).join('') + '</select></div>';
      };
      var shows = PRINT_KEYS.map(function (k) {
        return '<label class="chk"><input type="checkbox" data-pshow="' + k + '"' + (c.show[k] ? ' checked' : '') + '> <span>' +
          esc(PRINT_LABEL[k][LANG === 'bn' ? 0 : 1]) + '</span></label>';
      }).join('');
      var logo = '<div class="field"><label>' + esc(t('pr_logo')) + '</label><div class="nt-img-row">' +
        '<input class="input" type="file" accept="image/*" data-pfile="logo">' +
        (c.logo ? '<img class="logo-thumb" src="' + esc(c.logo) + '" alt=""><button type="button" class="btn sm ghost" data-action="pt-logo-del">' + esc(t('pr_logo_rm')) + '</button>' : '') +
        '</div></div>';
      var adv = '<details class="adv"><summary>' + esc(t('pr_adv')) + '</summary><div class="grid-2" style="margin-top:10px;">' +
        num(t('pr_line_h'), 'line_h', 110, 220) +
        num(t('pr_radius'), 'box_radius', 0, 16) +
        sel(t('pr_table'), 'table_style', [['grid', t('pr_tb_grid')], ['plain', t('pr_tb_plain')], ['zebra', t('pr_tb_zebra')]]) +
        sel(t('pr_fw'), 'font_weight', [[400, t('pr_fw_n')], [600, t('pr_fw_b')], [800, t('pr_fw_x')]]) +
        sel(t('pr_halign'), 'align', [['left', t('tb_left')], ['center', t('tb_center')], ['right', t('tb_right')]]) +
        txt(t('pr_wm'), 'watermark', 30) +
        '<div>' + chk(t('pr_upper'), 'head_upper') + '</div><div>' + chk(t('pr_compact'), 'compact') + '</div>' +
        '</div></details>';

      var brandSection = PRINT_TAB === 'pos'
        ? '<details class="pr-section pr-accordion" open><summary class="pr-section-title"><span class="pr-section-icon">🏷️</span>Brand and Logo</summary>' +
            '<p class="pr-section-note">Set the POS receipt brand, slogan, contact number and logo.</p>' +
            '<div class="grid-2">' + txt('Brand name', 'brand', 60) + txt('Slogan', 'tagline', 120) + '</div>' + logo +
          '</details>'
        : '<details class="pr-section pr-accordion" open><summary class="pr-section-title"><span class="pr-section-icon">🏷️</span>Brand and Logo</summary>' +
            '<p class="pr-section-note">Change invoice logo, brand name, slogan and their sizes and positions.</p>' +
            '<div class="grid-2">' + txt('Brand name', 'brand', 60) + num('Brand name text size (px)', 'brand_size', 10, 48) +
              txt('Slogan', 'tagline', 120) + num('Slogan text size (px)', 'tagline_size', 8, 32) +
              num('Logo size (px)', 'logo_w', 20, 220) +
              num('Logo left / right position (px)', 'logo_x', -300, 300) +
              num('Logo up / down position (px)', 'logo_y', -150, 250) + '</div>' + logo +
          '</details>';
      var footerSection = PRINT_TAB === 'pos'
        ? '<details class="pr-section pr-accordion"><summary class="pr-section-title"><span class="pr-section-icon">✍️</span>Footer</summary>' +
            '<p class="pr-section-note">Edit the message shown at the bottom of the POS receipt.</p>' +
            '<div class="grid-2">' +
              txt('Contact Us phone number', 'contact', 80) +
              '<div class="field"><label>Footer (Bangla)</label><textarea class="input" rows="2" maxlength="200" data-pf="footer_bn">' + esc(c.footer_bn || '') + '</textarea></div>' +
              '<div class="field"><label>Footer (English)</label><textarea class="input" rows="2" maxlength="200" data-pf="footer_en">' + esc(c.footer_en || '') + '</textarea></div>' +
            '</div>' +
          '</details>'
        : '<details class="pr-section pr-accordion"><summary class="pr-section-title"><span class="pr-section-icon">✍️</span>Footer</summary>' +
            '<p class="pr-section-note">Edit the Thank You message, brand address and phone. Adjust text size and position independently.</p>' +
            '<div class="grid-2">' +
              '<div class="field"><label class="chk"><input type="checkbox" data-pf="show_thank_you"' + (c.show_thank_you !== false ? ' checked' : '') + '> <span>Show Thank You message on invoice</span></label></div>' +
              txt('Thank You heading', 'footer_title', 100) + num('Thank You heading size (px)', 'footer_title_size', 16, 80) +
              '<div class="field"><label>Thank You message</label><textarea class="input" rows="2" maxlength="200" data-pf="footer_message">' + esc(c.footer_message || 'for shopping with us! ❤️') + '</textarea></div>' +
              num('Message text size (px)', 'footer_size', 8, 32) +
              num('Message left / right position (px)', 'footer_x', -300, 300) +
              num('Message up / down position (px)', 'footer_y', -300, 300) +
              '<div class="field"><label class="chk"><input type="checkbox" data-pf="show_brand_address"' + (c.show_brand_address !== false ? ' checked' : '') + '> <span>Show brand address on invoice</span></label></div>' +
              txt('Brand name in footer', 'footer_brand', 80) +
              txt('Address', 'footer_address', 180) +
              txt('Phone number', 'footer_phone', 80) +
              num('Address left / right position (px)', 'address_x', -300, 300) +
              num('Address up / down position (px)', 'address_y', -300, 300) +
            '</div>' +
          '</details>';
      var pageSection = '<details class="pr-section pr-accordion"><summary class="pr-section-title"><span class="pr-section-icon">📐</span>Page size</summary>' +
        '<div class="grid-2">' + sel('Page size', 'page', (PRINT_TAB === 'pos' ? [['58mm','58mm'],['80mm','80mm']] : ['A4', 'A5', 'Letter'].map(function (k) { return [k, k]; }))) +
          (PRINT_TAB === 'pos' ? '' : num('Page margin (mm)', 'margin', 0, 25)) + '</div>' +
        '</details>';

      box.innerHTML = '<div class="pr-grid"><div class="pr-form">' +
          brandSection + footerSection + pageSection +
          '<div class="pr-savebar"><button type="button" class="btn" data-action="pt-save">' + esc(t('pr_save')) + '</button>' +
            '<button type="button" class="btn ghost" data-action="pt-reset">' + esc(t('pr_reset')) + '</button></div>' +
        '</div><div class="pr-side"><div class="pr-section-title"><span class="pr-section-icon">🖨️</span>' + esc(t('pr_preview')) + '</div><div id="printPrev"></div><div id="printPreviewZoomControls"></div></div></div>';
      var grid = box.closest('.print-choice-grid');
      var sharedPreview = box.querySelector('.pr-side');
      if (grid && sharedPreview) {
        grid.classList.add('has-open-choice');
        grid.classList.toggle('pos-active', PRINT_TAB === 'pos');
        sharedPreview.classList.add('print-shared-preview');
        grid.appendChild(sharedPreview);
      }
      updatePrintPreview();
    }

    /* ---------- Android bridge ---------- */

    function registerDevice(tokenFromApp) {
      var tk = tokenFromApp || (window.AndroidApp && window.AndroidApp.getFcmToken ? window.AndroidApp.getFcmToken() : '');
      if (tk && TOKEN) api('/api/admin/devices', 'POST', { token: tk });
    }

    /* ---------- Printer & search listeners ---------- */

    function onPrintInput(e) {
      var el = e.target;
      if (!el || !el.closest || !el.closest('#printBox, #posPrintBox')) return;
      var c = PRINT[PRINT_TAB];
      if (!c) return;
      var pk = el.getAttribute('data-pshow');
      if (pk) { c.show[pk] = el.checked; updatePrintPreview(); return; }
      var f = el.getAttribute('data-pf');
      if (!f) return;
      if (el.type === 'checkbox') c[f] = el.checked;
      else if (el.getAttribute('data-pnum') || el.type === 'number') c[f] = Number(el.value) || 0;
      else c[f] = el.value;
      updatePrintPreview();
    }

    function onPrintFile(e) {
      var el = e.target;
      if (el && el.getAttribute && el.getAttribute('data-pfile') === 'logo' && el.files && el.files[0]) {
        handleLogo(el.files[0]);
      }
    }

    document.addEventListener('input', onPrintInput);
    document.addEventListener('change', onPrintInput);
    document.addEventListener('change', onPrintFile);
    ['invoiceSettingsAccordion', 'posSettingsAccordion'].forEach(function (id) {
      var panel = document.getElementById(id);
      if (!panel) return;
      panel.addEventListener('toggle', function () {
        var otherId = id === 'invoiceSettingsAccordion' ? 'posSettingsAccordion' : 'invoiceSettingsAccordion';
        var other = document.getElementById(otherId);
        var grid = this.closest('.print-choice-grid');

        if (!this.open) {
          // Hide the shared live preview only when both print options are closed.
          if (other && other.open) return;
          if (grid) {
            var preview = grid.querySelector('.print-shared-preview');
            if (preview) preview.remove();
            grid.classList.remove('pos-active');
            grid.classList.remove('has-open-choice');
          }
          var invoiceBox = document.getElementById('printBox');
          var posBox = document.getElementById('posPrintBox');
          if (invoiceBox) invoiceBox.innerHTML = '';
          if (posBox) posBox.innerHTML = '';
          return;
        }

        if (other && other.open) other.open = false;
        var kind = id === 'posSettingsAccordion' ? 'pos' : 'invoice';
        ensurePrint().then(function () { PRINT_TAB = kind; renderPrinter(); });
      });
    });
    window.addEventListener('resize', function () {
      updatePrintPreview();
      fitInvoicePreview('invoicePreviewCanvas', 'pvModal');
    });
    document.addEventListener('input', function (e) {
      if (e.target.id === 'cpSearch') { CP_FILTER.q = e.target.value.trim(); renderCoupons(); }
      else if (e.target.id === 'rwSearch') { RW_Q = e.target.value.trim(); renderRewards(); }
    });

    /* ---------- Events ---------- */

    // চোখ বাটনে চাপ দিলে input-এর ফোকাস যেন না হারায়
    document.addEventListener('mousedown', function (e) {
      if (e.target.closest && e.target.closest('.eye')) e.preventDefault();
    });

    var invoicePan = null;
    document.addEventListener('pointerdown', function (e) {
      var canvas = e.target.closest && e.target.closest('#printPrev, #invoicePreviewCanvas');
      if (!canvas || !e.shiftKey || e.button !== 0 || !canvas.querySelector('.invoice-sheet')) return;
      invoicePan = { canvas:canvas, x:e.clientX, y:e.clientY, left:canvas.scrollLeft, top:canvas.scrollTop };
      canvas.classList.add('is-panning');
      canvas.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    document.addEventListener('pointermove', function (e) {
      if (!invoicePan) return;
      invoicePan.canvas.scrollLeft = invoicePan.left - (e.clientX - invoicePan.x);
      invoicePan.canvas.scrollTop = invoicePan.top - (e.clientY - invoicePan.y);
    });
    function endInvoicePan() { if (invoicePan) invoicePan.canvas.classList.remove('is-panning'); invoicePan = null; }
    document.addEventListener('pointerup', endInvoicePan);
    document.addEventListener('pointercancel', endInvoicePan);

    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-action]');
      if (!el) return;
      var a = el.getAttribute('data-action');
      var pid = el.getAttribute('data-pid');
      var id = Number(el.getAttribute('data-id'));

      if (a === 'login') doLogin();
      else if (a === 'toggle-pw') togglePw(el);
      else if (a === 'save-inv') saveInventory();
      else if (a === 'save-bulk') saveBulk();
      else if (a === 'coupon-create') createCoupon();
      else if (a === 'coupon-gen') generateCouponCode();
      else if (a === 'save-notes') saveNotes();
      else if (a === 'coupon-hist-all') downloadCouponCsv(OFFERS.coupons, 'coupons_history');
      else if (a === 'coupon-toggle') toggleCoupon(id, el.getAttribute('data-on') === '1');
      else if (a === 'coupon-del') deleteCoupon(id, el.getAttribute('data-code'));
      else if (a === 'save-note') saveNote(pid);
      else if (a === 'save-payment-amount') {
        var amountInput = el.closest('.order-payment-amount') && el.closest('.order-payment-amount').querySelector('[data-role="payment-amount-input"]');
        if (amountInput) updatePayment(pid, 'Partial', amountInput.value);
      }
      else if (a === 'add-variant') addVariant();
      else if (a === 'tb-reset') resetTopbar();
      else if (a === 'logout') logout();
      else if (a === 'logout-all') logoutAll();
      else if (a === 'lang') toggleLang();
      else if (a === 'theme') toggleTheme();
      else if (a === 'go') go(el.getAttribute('data-view'));
      else if (a === 'refresh') refreshCurrent();
      else if (a === 'more') loadOrders(false);
      else if (a === 'csv') exportCSV();
      else if (a === 'open-order') openOrder(el.getAttribute('data-pid'));
      else if (a === 'copy') copyText(el.getAttribute('data-copy'));
      else if (a === 'preview') previewDoc(pid, 'invoice');
      else if (a === 'preview-pos') previewDoc(pid, 'pos');
      else if (a === 'status-back') openOrder(pid);
      else if (a === 'print') printDoc(pid, el.getAttribute('data-kind') || 'invoice');
      else if (a === 'download') downloadDoc(pid, el.getAttribute('data-kind') || 'invoice');
      else if (a === 'delete-order') deleteOrder(pid);
      else if (a === 'close-modal') closeModal();
      else if (a === 'add-url') addUrlImage();
      else if (a === 'remove-img') { IMAGES.splice(Number(el.getAttribute('data-idx')), 1); renderImagePreviews(); }
      else if (a === 'faq-add') { if (FAQS.length < 10) { FAQS.push(Object.assign({}, DEFAULT_FAQ_BLANK)); renderFaqEditor(); } }
      else if (a === 'faq-del') { FAQS.splice(Number(el.getAttribute('data-idx')), 1); renderFaqEditor(); }
      else if (a === 'notice-add') {
        if (NOTICES.length >= MAX_NOTICES) { toast(t('nt_max', { n: MAX_NOTICES }), 'err'); return; }
        NOTICES.push(Object.assign({}, NOTICE_DEFAULT));
        renderNotices();
      }
      else if (a === 'notice-del') { NOTICES.splice(Number(el.getAttribute('data-idx')), 1); renderNotices(); }
      else if (a === 'notice-img-del') { NOTICES[Number(el.getAttribute('data-idx'))].image = ''; renderNotices(); }
      else if (a === 'save-product') saveProduct();
      else if (a === 'add-user') addUser();
      else if (a === 'reset-user') resetUser(id);
      else if (a === 'delete-user') deleteUser(id);
      else if (a === 'change-pass') changeOwnPass();
      else if (a === 'un-save') changeOwnUser();
      else if (a === 'idgen-save') saveIdGenerator();
      else if (a === 'clock-save') saveClockSettings();
      else if (a === 'clock-theme') setClockTheme(el.getAttribute('data-v'));
      else if (a === 'clock-manual-save') saveManualClock();
      else if (a === 'clock-live') useLiveClock();
      else if (a === 'clock-sync') syncClockFromServer();
      else if (a === 'pr-tab') setPrintTab(el.getAttribute('data-v'));
      else if (a === 'preview-zoom') {
        var target = el.getAttribute('data-target');
        var page = el.getAttribute('data-page');
        var rawZoom = el.getAttribute('data-zoom');
        fitInvoicePreview(target, page, rawZoom === 'fit' ? 'fit' : Number(rawZoom));
      }
      else if (a === 'pt-theme') applyPrintTheme(el.getAttribute('data-v'));
      else if (a === 'pt-logo-del') { PRINT[PRINT_TAB].logo = ''; renderPrinter(); }
      else if (a === 'pt-save') savePrint();
      else if (a === 'pt-reset') revertPrint();
      else if (a === 'cp-filter') { CP_FILTER.s = el.getAttribute('data-v'); renderCouponChips(); renderCoupons(); }
      else if (a === 'cp-share') shareCoupon(el.getAttribute('data-code'), el.getAttribute('data-p'));
      else if (a === 'cp-pct') $('cpPct').value = el.getAttribute('data-v');
      else if (a === 'log-filter') setLogFilter(el.getAttribute('data-v'));
      else if (a === 'rw-filter') setRwFilter(el.getAttribute('data-v'));
      else if (a === 'rw-export') exportRewards();
      else if (a === 'sec-refresh') loadSecurity();
      else if (a === 'gv-save') saveGiveaway();
      else if (a === 'gv-gen') generateGiveCode();
      else if (a === 'gv-toggle') toggleGiveaway();
      else if (a === 'sa-toggle') toggleSettingsSecurity();
    });

    document.addEventListener('input', function (e) {
      var el = e.target;
      if (el.id === 'gvWords') {
        var firstWord = String(el.value || '').split(',')[0].trim().replace(/[^A-Za-z]/g, '').slice(0, 14).toUpperCase();
        $('gvCode').value = firstWord;
      }
      if (el.getAttribute && el.getAttribute('data-nkind') === 'f') { onNoticeInput(el); return; }
      if (el.getAttribute && el.getAttribute('data-kind')) {
        var idx = Number(el.getAttribute('data-idx'));
        var field = el.getAttribute('data-field');
        if (el.getAttribute('data-kind') === 'trust' && TRUST[idx]) TRUST[idx][field] = el.value;
        if (el.getAttribute('data-kind') === 'faq' && FAQS[idx]) FAQS[idx][field] = el.value;
        return;
      }
      if (el.id && el.id.indexOf('tb') === 0) { renderTbPreview(); return; }
      if (el.classList && el.classList.contains('inv-in')) { recalcInv(); return; }
      if (el.id === 'oSearch') {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(function () { loadOrders(true); }, 300);
      }
    });

    document.addEventListener('change', function (e) {
      var t2 = e.target;
      if (t2.getAttribute && t2.getAttribute('data-nkind') === 'f') {
        onNoticeInput(t2);
      } else if (t2.getAttribute && t2.getAttribute('data-nkind') === 'file') {
        if (t2.files && t2.files[0]) handleNoticeFile(Number(t2.getAttribute('data-idx')), t2.files[0]);
      } else if (t2.getAttribute && t2.getAttribute('data-nkind') === 'url') {
        var val = t2.value.trim();
        var nidx = Number(t2.getAttribute('data-idx'));
        if (/^https:\\/\\//i.test(val) && NOTICES[nidx]) { NOTICES[nidx].image = val; renderNotices(); }
      } else if (t2.getAttribute && t2.getAttribute('data-action') === 'status') {
        updateStatus(t2.getAttribute('data-pid'), t2.value);
      } else if (t2.getAttribute && t2.getAttribute('data-action') === 'payment-method') {
        var payPid = t2.getAttribute('data-pid');
        var payWrap = document.querySelector('.order-payment-amount');
        if (payWrap) payWrap.hidden = t2.value !== 'Partial';
        updatePayment(payPid, t2.value, t2.value === 'Paid' ? Number((CACHE[payPid] || {}).total || 0) : t2.value === 'Delivery' ? Number((CACHE[payPid] || {}).delivery_charge || 0) : 0);
      } else if (t2.id === 'pFiles') {
        handleImages(e);
      } else if (t2.id === 'tbAlign') {
        renderTbPreview();
      } else if (t2.id === 'oStatus' || t2.id === 'oRange') {
        loadOrders(true);
      } else if (t2.id === 'clockManualEnabled') {
        if (t2.checked) saveManualClock(); else useLiveClock();
      } else if (t2.id === 'clockTimezone' || t2.id === 'clockFormat' || t2.id === 'clockManualDate' || t2.id === 'clockManualTime') {
        updateClockPreview();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && (e.target.id === 'loginUser' || e.target.id === 'loginPass')) doLogin();
      if (e.key === 'Escape') closeModal();
    });

    $('modal').addEventListener('click', function (e) {
      if (e.target.id === 'modal') closeModal();
    });

    setInterval(function () {
      if (document.visibilityState === 'visible' && TOKEN && !$('modal').classList.contains('show')) {
        if (VIEW === 'orders' || VIEW === 'dashboard') refreshCurrent();
      }
    }, 60000);

    setInterval(tickCountdowns, 30000);
    setInterval(renderHeaderClock, 1000);
    syncClockFromServer();
    setInterval(syncClockFromServer, 300000);
    window.registerDevice = registerDevice;

    // অ্যাডমিন ডিফল্টে English; ভাষা আলাদাভাবে সংরক্ষিত
    LANG = prefsStore.get('admin_lang') === 'bn' ? 'bn' : 'en';
    initTheme();
    loadClockSettings();
    initEyes();
    applyLang();
    boot();
  </script>
</body>
</html>`;
}
export { renderLandingHTML, renderInactiveHTML, renderAdminHTML };
