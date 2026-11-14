import {
  STATUSES,
  RATIOS,
  BADGE_POS,
  TOPBAR_ALIGN,
  NOTICE_ALIGN,
  MAX_IMAGES,
  MAX_IMAGES_BYTES,
  MAX_NOTICES_BYTES,
  MAX_PRODUCT_BODY,
  MAX_QTY,
  LOGIN_FAIL_LIMIT,
  PHONE_ORDER_LIMIT,
  COUPON_REWARD_DAYS,
  PUBLIC_ID_RE,
  HEX_RE,
  NOTICE_FONT_CSS,
  HttpError,
  json,
  fail,
  toInt,
  clampInt,
  splitList,
  randomHex,
  hashPassword,
  safeEqual,
  readJson,
  getIp,
  cleanImages,
  isAllowedImage,
  cleanTrust,
  cleanFaqs,
  cleanNotices,
  newPublicId,
  defaultOrderIdPrefix,
  normalizeSearch,
  digitsOnly,
  encryptField,
  decryptField,
  blindIndex,
  hashIp,
  ensureSchema,
  audit,
  getSession,
  authorize,
  createSession,
  isDefaultPassword,
  getProductRow,
  productView,
  syncTotalStmt,
  syncTotal,
  syncInventory,
  takeStock,
  addStockStmt,
  getInventory,
  getOrderLines,
  searchOrders,
  getStats,
  notifyNewOrder,
  randomCode,
  checkCoupon,
  computeQuote,
  issueReward,
  getNotes,
} from "./core.js";
import { renderAdminHTML, renderInactiveHTML, renderLandingHTML } from "./templates.js";

function catalogSlug(value) {
  const slug = String(value || "").toLowerCase().normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "").slice(0, 56);
  return slug || "product";
}

async function catalogProduct(db, id) {
  if (!Number.isInteger(Number(id)) || Number(id) < 2) return null;
  const row = await db.prepare("SELECT id, slug, title, data FROM product_catalog WHERE id = ?").bind(id).first();
  if (!row) return null;
  try {
    const data = { ...JSON.parse(row.data), id: row.id, slug: row.slug, title: row.title };
    const colors = splitList(data.colors);
    const sizes = splitList(data.sizes);
    const allowedColors = colors.length ? colors : [""];
    const allowedSizes = sizes.length ? sizes : [""];
    const stockRows = await db.prepare("SELECT color, size, qty FROM product_inventory WHERE product_id = ?").bind(id).all();
    data.stock = (stockRows.results || []).reduce((total, item) =>
      total + (allowedColors.includes(item.color) && allowedSizes.includes(item.size) ? Number(item.qty) || 0 : 0), 0);
    return data;
  } catch (e) { return null; }
}

async function productInventory(db, productId) {
  const { results } = await db.prepare("SELECT color, size, qty FROM product_inventory WHERE product_id = ? ORDER BY color, size").bind(productId).all();
  return results || [];
}

async function route(request, env, nonce) {
  const path = new URL(request.url).pathname;

  // Always serve the admin shell first. Otherwise a missing secret or D1
  // migration can prevent the login page itself from rendering.
  if (path === "/admin" || path === "/admin/" || path === "/admin.html") {
    return new Response(renderAdminHTML(nonce), {
      headers: { "Content-Type": "text/html;charset=UTF-8" }
    });
  }

  if (!env.DATA_KEY || env.DATA_KEY.length < 16) {
    return new Response("Setup incomplete: DATA_KEY secret যোগ করুন।", { status: 500 });
  }

  try {
    await ensureSchema(env);
  } catch (err) {
    console.error("Schema error", err);
    return new Response("Database Error: 'DB' D1 binding check করুন।", { status: 500 });
  }

  if (path.startsWith("/api/")) {
    return handleApi(request, env, path);
  }

  const productPath = path.match(/^\/p\/([a-z0-9-]+)\/?$/i);
  if (productPath) {
    const found = await env.DB.prepare("SELECT id, slug, title, data FROM product_catalog WHERE slug = ?").bind(productPath[1]).first();
    if (!found) return new Response("প্রোডাক্টটি পাওয়া যায়নি", { status: 404 });
    const row = await catalogProduct(env.DB, found.id);
    if (!row || Number(row.is_active) === 0) {
      return new Response(renderInactiveHTML(), { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    }
    const [inv, notes] = await Promise.all([productInventory(env.DB, found.id), getNotes(env.DB)]);
    return new Response(renderLandingHTML(productView(row), inv, nonce, notes, found.id), {
      headers: { "Content-Type": "text/html;charset=UTF-8" }
    });
  }

  if (path !== "/" && path !== "/index.html") {
    return new Response("পেজটি পাওয়া যায়নি", { status: 404, headers: { "Content-Type": "text/plain;charset=UTF-8" } });
  }

  const [row, inv, notes] = await Promise.all([getProductRow(env.DB), getInventory(env.DB), getNotes(env.DB)]);
  if (!row) return new Response("Product configure করা নেই।", { status: 503 });
  if (Number(row.is_active) === 0) {
    return new Response(renderInactiveHTML(), { headers: { "Content-Type": "text/html;charset=UTF-8" } });
  }

  return new Response(renderLandingHTML(productView(row), inv, nonce, notes), {
    headers: { "Content-Type": "text/html;charset=UTF-8" }
  });
}

/* ============================================================
   API
   ============================================================ */

async function handleApi(request, env, path) {
  if (request.method !== "GET") {
    const origin = request.headers.get("Origin");
    const site = request.headers.get("Sec-Fetch-Site");
    let originHost = "";
    if (origin) {
      try { originHost = new URL(origin).host; } catch (e) { originHost = "invalid"; }
    }
    if ((origin && originHost !== new URL(request.url).host) || site === "cross-site") {
      return fail(403, "এই অনুরোধ অনুমোদিত নয়।");
    }
  }
  try {
    return await apiRoutes(request, env, path);
  } catch (err) {
    if (err instanceof HttpError) return fail(err.status, err.message);
    console.error("API error", err);
    return fail(500, "সার্ভারে সমস্যা হয়েছে, আবার চেষ্টা করুন।");
  }
}

async function apiRoutes(request, env, path) {
  const m = request.method;
  const rawIp = getIp(request);

  /* ---------- Server time (admin clock sync) ---------- */

  if (path === "/api/time" && m === "GET") {
    return json({ now: Date.now() });
  }

  /* ---------- Auth ---------- */

  if (path === "/api/admin/login" && m === "POST") {
    const ipHash = await hashIp(env, rawIp);
    const recent = await env.DB.prepare(
      "SELECT COUNT(*) AS c FROM audit_log WHERE action = 'login_fail' AND ip_hash = ? AND created_at > datetime('now', '-15 minutes')"
    ).bind(ipHash).first();
    if (recent && recent.c >= LOGIN_FAIL_LIMIT) {
      return fail(429, "অনেকবার ভুল চেষ্টা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।");
    }

    const body = await readJson(request);
    const username = String(body.username ?? "").trim().toLowerCase().slice(0, 40);
    const password = String(body.password ?? "");
    if (!username || !password) return fail(400, "ইউজারনেম ও পাসওয়ার্ড দিন!");

    const user = await env.DB.prepare(
      "SELECT id, username, password_hash, salt FROM admin_users WHERE username = ?"
    ).bind(username).first();

    const hash = await hashPassword(password, user ? user.salt : "00".repeat(16));
    const ok = !!user && safeEqual(hash, user.password_hash);
    if (!ok) {
      await audit(env, username, "login_fail", "", rawIp);
      return fail(401, "ইউজারনেম বা পাসওয়ার্ড ভুল!");
    }

    await audit(env, user.username, "login_ok", "", rawIp);
    await env.DB.prepare("DELETE FROM audit_log WHERE created_at < datetime('now', '-90 days')").run();
    const token = await createSession(env, user.id);
    return json({
      token,
      user: { id: user.id, username: user.username },
      mustChangePassword: await isDefaultPassword(env, user)
    });
  }

  if (path === "/api/admin/logout" && m === "POST") {
    const session = await getSession(request, env);
    if (session) {
      await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(session.tokenHash).run();
    }
    return json({ success: true });
  }

  if (path === "/api/admin/logout-all" && m === "POST") {
    const s = await authorize(request, env);
    await env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(s.id).run();
    await audit(env, s.username, "logout_all", "", rawIp);
    return json({ success: true });
  }

  if (path === "/api/admin/me" && m === "GET") {
    const s = await authorize(request, env);
    const u = await env.DB.prepare("SELECT password_hash, salt FROM admin_users WHERE id = ?").bind(s.id).first();
    return json({
      user: { id: s.id, username: s.username },
      mustChangePassword: await isDefaultPassword(env, u)
    });
  }

  if (path === "/api/admin/me/password" && m === "POST") {
    const s = await authorize(request, env);
    const body = await readJson(request);
    const current = String(body.current ?? "");
    const next = String(body.new ?? "");
    if (next.length < 8 || next.length > 200) throw new HttpError(400, "নতুন পাসওয়ার্ড ৮–২০০ অক্ষরের হতে হবে!");
    if (next === current) throw new HttpError(400, "নতুন পাসওয়ার্ড আগেরটির থেকে আলাদা হতে হবে!");

    const user = await env.DB.prepare("SELECT password_hash, salt FROM admin_users WHERE id = ?").bind(s.id).first();
    if (!user) throw new HttpError(404, "ইউজার পাওয়া যায়নি!");
    const check = await hashPassword(current, user.salt);
    if (!safeEqual(check, user.password_hash)) throw new HttpError(400, "বর্তমান পাসওয়ার্ড ভুল!");

    const salt = randomHex(16);
    const hash = await hashPassword(next, salt);
    await env.DB.batch([
      env.DB.prepare("UPDATE admin_users SET password_hash = ?, salt = ? WHERE id = ?").bind(hash, salt, s.id),
      env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(s.id)
    ]);
    await audit(env, s.username, "password_change", "", rawIp);
    return json({ success: true });
  }

  /* ---------- Admin users ---------- */

  if (path === "/api/admin/users" && m === "GET") {
    await authorize(request, env);
    const { results } = await env.DB.prepare(
      "SELECT id, username, created_at FROM admin_users ORDER BY id"
    ).all();
    return json({ users: results || [] });
  }

  if (path === "/api/admin/users" && m === "POST") {
    const s = await authorize(request, env);
    const body = await readJson(request);
    const username = String(body.username ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!/^[a-z0-9_.-]{3,32}$/.test(username)) {
      throw new HttpError(400, "ইউজারনেম ৩-৩২ অক্ষর, শুধু a-z, 0-9, _ . - ব্যবহার করুন।");
    }
    if (password.length < 8 || password.length > 200) throw new HttpError(400, "পাসওয়ার্ড ৮–২০০ অক্ষরের হতে হবে!");

    const exists = await env.DB.prepare("SELECT id FROM admin_users WHERE username = ?").bind(username).first();
    if (exists) throw new HttpError(409, "এই ইউজারনেম আগে থেকেই আছে!");

    const salt = randomHex(16);
    const hash = await hashPassword(password, salt);
    await env.DB.prepare(
      "INSERT INTO admin_users (username, password_hash, salt, role) VALUES (?, ?, ?, 'admin')"
    ).bind(username, hash, salt).run();
    await audit(env, s.username, "admin_add", username, rawIp);
    return json({ success: true });
  }

  if (path === "/api/admin/users/reset" && m === "POST") {
    const s = await authorize(request, env);
    const body = await readJson(request);
    const id = toInt(body.id, NaN);
    const password = String(body.password ?? "");
    if (!Number.isFinite(id)) throw new HttpError(400, "Invalid user");
    if (password.length < 8 || password.length > 200) throw new HttpError(400, "পাসওয়ার্ড ৮–২০০ অক্ষরের হতে হবে!");

    const target = await env.DB.prepare("SELECT username FROM admin_users WHERE id = ?").bind(id).first();
    if (!target) throw new HttpError(404, "ইউজার পাওয়া যায়নি!");

    const salt = randomHex(16);
    const hash = await hashPassword(password, salt);
    await env.DB.batch([
      env.DB.prepare("UPDATE admin_users SET password_hash = ?, salt = ? WHERE id = ?").bind(hash, salt, id),
      env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(id)
    ]);
    await audit(env, s.username, "admin_reset", target.username, rawIp);
    return json({ success: true });
  }

  if (path === "/api/admin/users/delete" && m === "POST") {
    const s = await authorize(request, env);
    const body = await readJson(request);
    const id = toInt(body.id, NaN);
    if (!Number.isFinite(id)) throw new HttpError(400, "Invalid user");
    if (id === s.id) throw new HttpError(400, "নিজেকে ডিলিট করা যাবে না!");

    const target = await env.DB.prepare("SELECT username FROM admin_users WHERE id = ?").bind(id).first();
    if (!target) return json({ success: true });

    await env.DB.batch([
      env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(id),
      env.DB.prepare("DELETE FROM admin_users WHERE id = ?").bind(id)
    ]);
    await audit(env, s.username, "admin_delete", target.username, rawIp);
    return json({ success: true });
  }

  /* ---------- Admin: stats, orders, logs ---------- */

  if (path === "/api/admin/stats" && m === "GET") {
    await authorize(request, env);
    const stats = await getStats(env.DB);
    const { results: daily } = await env.DB.prepare(
      "SELECT date(created_at, '+6 hours') AS d, COUNT(*) AS c, COALESCE(SUM(CASE WHEN status != 'Cancelled' THEN total ELSE 0 END), 0) AS t FROM orders WHERE created_at >= datetime('now', '-7 days') GROUP BY d ORDER BY d"
    ).all();
    stats.daily = daily || [];
    const product = productView(await getProductRow(env.DB));
    return json({ stats, product });
  }

  if (path === "/api/admin/orders" && m === "GET") {
    await authorize(request, env);
    const url = new URL(request.url);
    const result = await searchOrders(env, {
      q: url.searchParams.get("q") || "",
      status: url.searchParams.get("status") || "all",
      range: url.searchParams.get("range") || "all",
      offset: url.searchParams.get("offset") || 0
    });
    return json(result);
  }

  if (path === "/api/admin/logs" && m === "GET") {
    await authorize(request, env);
    const { results } = await env.DB.prepare(
      "SELECT actor, action, target, ip, created_at FROM audit_log ORDER BY id DESC LIMIT 200"
    ).all();
    const logs = [];
    for (const l of results || []) {
      logs.push({ ...l, ip: await decryptField(env, l.ip) });
    }
    return json({ logs });
  }

  /* ---------- Admin: multi-product catalog ---------- */

  if (path === "/api/admin/products" && m === "GET") {
    await authorize(request, env);
    const legacy = await getProductRow(env.DB);
    const { results } = await env.DB.prepare("SELECT id, slug, title, data FROM product_catalog WHERE id > 1 ORDER BY id DESC").all();
    const products = [];
    if (legacy) products.push({ id: 1, slug: "", title: legacy.title || "Main product", active: Number(legacy.is_active) !== 0, url: "/" });
    for (const r of results || []) {
      let data = {};
      try { data = JSON.parse(r.data); } catch (e) {}
      products.push({ id: r.id, slug: r.slug, title: r.title, active: Number(data.is_active) !== 0, url: "/p/" + r.slug });
    }
    return json({ products });
  }

  if (path === "/api/admin/products" && m === "POST") {
    const s = await authorize(request, env);
    const b = await readJson(request);
    const title = String(b.title || "").trim().slice(0, 200);
    if (title.length < 2) throw new HttpError(400, "প্রোডাক্টের নাম কমপক্ষে ২ অক্ষর হতে হবে!");
    const base = catalogSlug(b.slug || title);
    let slug = base, suffix = 2;
    while (await env.DB.prepare("SELECT id FROM product_catalog WHERE slug = ?").bind(slug).first()) {
      slug = base + "-" + suffix++;
    }
    const legacy = await env.DB.prepare("SELECT * FROM product WHERE id = 1").first();
    if (!legacy) throw new HttpError(500, "মূল প্রোডাক্টের তথ্য পাওয়া যায়নি!");
    const data = { ...legacy, id: null, title, stock: 0, is_active: 0,
      images: "[]", image: "", colors: "", sizes: "", description: "" };
    delete data.admin_pass;
    const result = await env.DB.prepare(
      "INSERT INTO product_catalog (slug, title, data) VALUES (?, ?, ?)"
    ).bind(slug, title, JSON.stringify(data)).run();
    const id = result.meta && result.meta.last_row_id;
    return json({ success: true, id, slug, url: "/p/" + slug });
  }

  const catalogDetail = path.match(/^\/api\/admin\/products\/(\d+)$/);
  if (catalogDetail && m === "GET") {
    await authorize(request, env);
    const id = Number(catalogDetail[1]);
    const row = await catalogProduct(env.DB, id);
    if (!row) throw new HttpError(404, "প্রোডাক্ট পাওয়া যায়নি!");
    const inv = await productInventory(env.DB, id);
    return json({ product: productView(row), slug: row.slug, inventory: inv });
  }

  if (path === "/api/admin/product-inventory" && m === "GET") {
    await authorize(request, env);
    const url = new URL(request.url);
    const id = toInt(url.searchParams.get("product_id"), NaN);
    if (!Number.isFinite(id) || id < 2) throw new HttpError(400, "Product ID সঠিক নয়!");
    return json({ rows: await productInventory(env.DB, id) });
  }

  if (path === "/api/admin/product-inventory" && m === "POST") {
    const s = await authorize(request, env);
    const b = await readJson(request);
    const id = toInt(b.product_id, NaN);
    const row = await catalogProduct(env.DB, id);
    if (!row) throw new HttpError(404, "প্রোডাক্ট পাওয়া যায়নি!");
    const colors = splitList(row.colors);
    const sizes = splitList(row.sizes);
    const cs = colors.length ? colors : [""];
    const ss = sizes.length ? sizes : [""];
    const items = Array.isArray(b.items) ? b.items : [];
    const supplied = new Map();
    for (const item of items) {
      const color = String(item.color ?? "");
      const size = String(item.size ?? "");
      const qty = toInt(item.qty, NaN);
      if (!cs.includes(color) || !ss.includes(size) || !Number.isInteger(qty) || qty < 0 || qty > 100000) {
        throw new HttpError(400, "স্টকের তথ্য সঠিক নয়!");
      }
      supplied.set(color + "|" + size, { color, size, qty });
    }
    const stmts = [];
    for (const color of cs) for (const size of ss) {
      const item = supplied.get(color + "|" + size);
      stmts.push(env.DB.prepare(
        "INSERT INTO product_inventory (product_id, color, size, qty) VALUES (?, ?, ?, ?) ON CONFLICT(product_id, color, size) DO UPDATE SET qty = excluded.qty"
      ).bind(id, color, size, item ? item.qty : 0));
    }
    await env.DB.batch(stmts);
    const total = [...supplied.values()].reduce((sum, item) => sum + item.qty, 0);
    row.stock = total;
    await env.DB.prepare("UPDATE product_catalog SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(JSON.stringify(row), id).run();
    await audit(env, s.username, "product_stock_update", row.title, rawIp);
    return json({ success: true, total });
  }

  /* ---------- Admin: product ---------- */

  if (path === "/api/admin/product" && m === "POST") {
    const s = await authorize(request, env);
    const b = await readJson(request, MAX_PRODUCT_BODY);

    const title = String(b.title ?? "").trim().slice(0, 200);
    if (!title) throw new HttpError(400, "প্রোডাক্টের নাম লিখুন!");

    const description = String(b.description ?? "").slice(0, 5000);
    const price = toInt(b.price, NaN);
    const oldPrice = toInt(b.old_price, 0);
    const deliveryInside = toInt(b.delivery_inside, 60);
    const deliveryOutside = toInt(b.delivery_outside, 120);

    if (!Number.isFinite(price) || price < 0) throw new HttpError(400, "সঠিক অফার মূল্য দিন!");
    if ([oldPrice, deliveryInside, deliveryOutside].some((n) => n < 0)) {
      throw new HttpError(400, "সংখ্যা ঋণাত্মক হতে পারবে না!");
    }

    const images = cleanImages(b.images);
    if (images.length === 0) throw new HttpError(400, "অন্তত একটি প্রোডাক্টের ছবি যুক্ত করুন!");
    if (images.length > MAX_IMAGES) throw new HttpError(400, "সর্বোচ্চ " + MAX_IMAGES + "টি ছবি যুক্ত করা যাবে!");
    if (!images.every(isAllowedImage)) throw new HttpError(400, "ছবির লিংক বা ফাইল সঠিক নয়!");

    const imagesJson = JSON.stringify(images);
    if (imagesJson.length > MAX_IMAGES_BYTES) {
      throw new HttpError(413, "ছবির সাইজ অনেক বড়। কম সংখ্যক ছবি দিন বা ছবি ছোট করুন।");
    }

    const notices = cleanNotices(b.notices);
    const noticesJson = JSON.stringify(notices);
    if (noticesJson.length > MAX_NOTICES_BYTES) throw new HttpError(413, "নোটিসের ছবি অনেক বড়। ছোট ছবি দিন।");

    const colors = String(b.colors ?? "").trim().slice(0, 300);
    const sizes = String(b.sizes ?? "").trim().slice(0, 300);
    const phone = String(b.contact_phone ?? "").trim();
    const wa = String(b.whatsapp_number ?? "").replace(/[^0-9]/g, "");
    const ratio = RATIOS.includes(b.image_ratio) ? b.image_ratio : "auto";
    const badgePos = BADGE_POS.includes(b.badge_pos) ? b.badge_pos : "tl";
    const trustJson = JSON.stringify(cleanTrust(b.trust));
    const faqJson = JSON.stringify(cleanFaqs(b.faqs));

    const tbBn = String(b.topbar_bn ?? "").trim().slice(0, 200);
    const tbEn = String(b.topbar_en ?? "").trim().slice(0, 200);
    const tbSize = clampInt(b.topbar_size, 9, 32, 13);
    const tbAlign = TOPBAR_ALIGN.includes(b.topbar_align) ? b.topbar_align : "center";
    const tbOffset = clampInt(b.topbar_offset, -120, 120, 0);
    const tbPad = clampInt(b.topbar_pad, 0, 40, 10);
    const tbLangShow = (b.topbar_lang_show === false || b.topbar_lang_show === 0 || b.topbar_lang_show === "0") ? 0 : 1;
    const tbLangSize = clampInt(b.topbar_lang_size, 8, 28, 12);
    const siteLanguage = ["bn", "en"].includes(b.site_language) ? b.site_language : "auto";
    const isActive = (b.is_active === false || b.is_active === 0 || b.is_active === "0") ? 0 : 1;

    if (phone && !/^\+?[0-9]{7,15}$/.test(phone)) throw new HttpError(400, "কল নাম্বার সঠিক নয়!");
    if (wa && !/^[0-9]{10,15}$/.test(wa)) throw new HttpError(400, "WhatsApp নাম্বার সঠিক নয়!");

    const productId = toInt(b.product_id, 1);
    if (productId > 1) {
      const current = await catalogProduct(env.DB, productId);
      if (!current) throw new HttpError(404, "প্রোডাক্ট পাওয়া যায়নি!");
      const next = {
        ...current, title, description, price, old_price: oldPrice,
        image: images[0], images: imagesJson, colors, sizes,
        delivery_inside: deliveryInside, delivery_outside: deliveryOutside,
        contact_phone: phone, whatsapp_number: wa, image_ratio: ratio, badge_pos: badgePos,
        trust_items: trustJson, faqs: faqJson, notices: noticesJson,
        topbar_bn: tbBn, topbar_en: tbEn, topbar_size: tbSize, topbar_align: tbAlign,
        topbar_offset: tbOffset, topbar_pad: tbPad, topbar_lang_show: tbLangShow,
        topbar_lang_size: tbLangSize, site_language: siteLanguage, is_active: isActive
      };
      const slugRow = await env.DB.prepare("SELECT slug FROM product_catalog WHERE id = ?").bind(productId).first();
      await env.DB.prepare("UPDATE product_catalog SET title = ?, data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(title, JSON.stringify(next), productId).run();
      const cs = splitList(colors).length ? splitList(colors) : [""];
      const ss = splitList(sizes).length ? splitList(sizes) : [""];
      const keep = new Set();
      const stmts = [];
      for (const color of cs) for (const size of ss) {
        keep.add(color + "|" + size);
        stmts.push(env.DB.prepare(
          "INSERT OR IGNORE INTO product_inventory (product_id, color, size, qty) VALUES (?, ?, ?, 0)"
        ).bind(productId, color, size));
      }
      // Keep retired variant rows: older orders may still need to restore stock to them.
      if (stmts.length) await env.DB.batch(stmts);
      await audit(env, s.username, "product_update", title + " (" + (slugRow ? slugRow.slug : productId) + ")", rawIp);
      return json({ success: true, product_id: productId });
    }

    await env.DB.prepare(
      `UPDATE product SET title = ?, description = ?, price = ?, old_price = ?,
        image = ?, images = ?, colors = ?, sizes = ?, delivery_inside = ?, delivery_outside = ?,
        contact_phone = ?, whatsapp_number = ?, image_ratio = ?, badge_pos = ?,
        trust_items = ?, faqs = ?, notices = ?,
        topbar_bn = ?, topbar_en = ?, topbar_size = ?, topbar_align = ?, topbar_offset = ?, topbar_pad = ?,
        topbar_lang_show = ?, topbar_lang_size = ?, site_language = ?, is_active = ?
       WHERE id = 1`
    ).bind(
      title, description, price, oldPrice,
      images[0], imagesJson, colors, sizes,
      deliveryInside, deliveryOutside, phone, wa, ratio, badgePos,
      trustJson, faqJson, noticesJson,
      tbBn, tbEn, tbSize, tbAlign, tbOffset, tbPad, tbLangShow, tbLangSize, siteLanguage, isActive
    ).run();

    await syncInventory(env.DB, splitList(colors), splitList(sizes));
    await audit(env, s.username, "product_update", title, rawIp);
    return json({ success: true, product_id: 1 });
  }

  /* ---------- Public: quote & order ---------- */

  if (path === "/api/quote" && m === "POST") {
    const b = await readJson(request);
    const productId = Math.max(1, toInt(b.product_id, 1));
    let p;
    if (productId === 1) {
      p = await env.DB.prepare("SELECT price, delivery_inside, delivery_outside, bulk_enabled, bulk_min_qty, bulk_type, bulk_value FROM product WHERE id = 1").first();
    } else {
      const row = await catalogProduct(env.DB, productId);
      p = row ? { price: row.price, delivery_inside: row.delivery_inside, delivery_outside: row.delivery_outside,
        bulk_enabled: row.bulk_enabled, bulk_min_qty: row.bulk_min_qty, bulk_type: row.bulk_type, bulk_value: row.bulk_value } : null;
    }
    if (!p) throw new HttpError(404, "প্রোডাক্ট পাওয়া যায়নি!");
    const qty = Math.min(MAX_QTY, Math.max(1, toInt(b.quantity, 1)));
    const area = b.area === "inside" || b.area === "outside" ? b.area : "";
    return json(await computeQuote(env, p, qty, area, b.coupon, digitsOnly(b.phone)));
  }

  if (path === "/api/order" && m === "POST") {
    const b = await readJson(request);

    const name = String(b.name ?? "").trim();
    const address = String(b.address ?? "").trim();
    const phone = String(b.phone ?? "").replace(/[\s-]/g, "");
    const area = b.area;
    const qty = Math.min(MAX_QTY, Math.max(1, toInt(b.quantity, 1)));

    if (name.length < 2 || name.length > 100) throw new HttpError(400, "সঠিক নাম লিখুন!");
    if (address.length < 5 || address.length > 500) throw new HttpError(400, "সম্পূর্ণ ঠিকানা লিখুন!");
    if (!/^01[3-9]\d{8}$/.test(phone)) throw new HttpError(400, "সঠিক মোবাইল নাম্বার দিন (01XXXXXXXXX)!");
    if (area !== "inside" && area !== "outside") {
      throw new HttpError(400, "দয়া করে ডেলিভারি এরিয়া সিলেক্ট করুন!");
    }

    const phoneIdx = await blindIndex(env, "phone", phone);
    const recentPhone = await env.DB.prepare(
      "SELECT COUNT(*) AS c FROM orders WHERE phone_hash = ? AND created_at > datetime('now', '-1 hour')"
    ).bind(phoneIdx).first();
    if (recentPhone && recentPhone.c >= PHONE_ORDER_LIMIT) {
      throw new HttpError(429, "এই নাম্বার থেকে অনেক অর্ডার হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।");
    }

    const productId = Math.max(1, toInt(b.product_id, 1));
    let product;
    let productTitle = "";
    if (productId === 1) {
      product = await env.DB.prepare("SELECT price, stock, colors, sizes, delivery_inside, delivery_outside, is_active, bulk_enabled, bulk_min_qty, bulk_type, bulk_value, title FROM product WHERE id = 1").first();
    } else {
      product = await catalogProduct(env.DB, productId);
    }
    productTitle = product ? String(product.title || "") : "";
    if (!product) throw new HttpError(404, "প্রোডাক্ট পাওয়া যায়নি!");
    if (Number(product.is_active) === 0) throw new HttpError(400, "এই মুহূর্তে প্রোডাক্টটি অর্ডারের জন্য বন্ধ আছে।");

    const colorList = splitList(product.colors);
    const sizeList = splitList(product.sizes);
    const rawItems = Array.isArray(b.items) ? b.items : [];
    const fallback = { color: String(b.color ?? "").trim(), size: String(b.size ?? "").trim() };

    // প্রতিটি পিসের কালার/সাইজ আলাদা করে একই কালার/সাইজকে এক লাইনে গোছানো
    const lineMap = new Map();
    for (let i = 0; i < qty; i++) {
      const it = rawItems[i] || fallback;
      const c = colorList.length ? String(it.color ?? "").trim() : "";
      const s = sizeList.length ? String(it.size ?? "").trim() : "";
      if (colorList.length > 0 && !colorList.includes(c)) throw new HttpError(400, "সঠিক কালার সিলেক্ট করুন!");
      if (sizeList.length > 0 && !sizeList.includes(s)) throw new HttpError(400, "সঠিক সাইজ সিলেক্ট করুন!");
      const key = c + "|" + s;
      if (!lineMap.has(key)) lineMap.set(key, { color: c, size: s, qty: 0 });
      lineMap.get(key).qty += 1;
    }
    const lines = [...lineMap.values()];

    const quote = await computeQuote(env, product, qty, area, b.coupon, phone);
    if (quote.couponError) throw new HttpError(400, quote.couponError);
    if (quote.couponPending) throw new HttpError(400, "কুপন ব্যবহারের জন্য সঠিক ফোন নাম্বার দিন।");

    // প্রতিটি লাইনের স্টক আলাদাভাবে ধরা; কোথাও ব্যর্থ হলে আগেরগুলো ফেরত
    const taken = [];
    const restoreTaken = async () => {
      for (const l of taken) {
        if (productId === 1) await addStockStmt(env.DB, l.color, l.size, l.qty).run();
        else await env.DB.prepare("UPDATE product_inventory SET qty = qty + ? WHERE product_id = ? AND color = ? AND size = ?")
          .bind(l.qty, productId, l.color, l.size).run();
      }
    };
    for (const l of lines) {
      const row = productId === 1
        ? await env.DB.prepare("SELECT qty FROM inventory WHERE color = ? AND size = ?").bind(l.color, l.size).first()
        : await env.DB.prepare("SELECT qty FROM product_inventory WHERE product_id = ? AND color = ? AND size = ?").bind(productId, l.color, l.size).first();
      if (!row) {
        await restoreTaken();
        throw new HttpError(400, "🙏 দুঃখিত, এই অপশনটি এখন পাওয়া যাচ্ছে না। অন্য অপশন বেছে নিন।");
      }
      const stockTaken = productId === 1
        ? await takeStock(env.DB, l.color, l.size, l.qty)
        : (await env.DB.prepare("UPDATE product_inventory SET qty = qty - ? WHERE product_id = ? AND color = ? AND size = ? AND qty >= ?")
          .bind(l.qty, productId, l.color, l.size, l.qty).run()).meta?.changes > 0;
      if (!stockTaken) {
        await restoreTaken();
        throw new HttpError(400, stockOutMessage(colorList.length > 0, sizeList.length > 0, l.qty, Number(row.qty) || 0, l.color, l.size));
      }
      taken.push(l);
    }

    let couponRow = null;
    if (quote.coupon) {
      couponRow = (await checkCoupon(env, b.coupon, phone)).row;
      const used = await env.DB.prepare(
        "UPDATE coupons SET uses = uses + 1 WHERE id = ? AND active = 1 AND (max_uses = 0 OR uses < max_uses)"
      ).bind(couponRow.id).run();
      if (!used.meta || used.meta.changes === 0) {
        await restoreTaken();
        throw new HttpError(400, "এই কুপনটি এইমাত্র ব্যবহার হয়ে গেছে।");
      }
    }

    const prev = await env.DB.prepare("SELECT COUNT(*) AS c FROM orders WHERE phone_hash = ?").bind(phoneIdx).first();
    const isFirst = !prev || Number(prev.c) === 0;
    const deliveryAreaText = area === "outside" ? "ঢাকার বাইরে" : "ঢাকার ভেতরে";
    const couponAmount = quote.coupon ? quote.coupon.amount : 0;
    const couponCode = quote.coupon ? quote.coupon.code : "";
    const selColor = [...new Set(lines.map((l) => l.color).filter(Boolean))].join(", ") || "N/A";
    const selSize = [...new Set(lines.map((l) => l.size).filter(Boolean))].join(", ") || "N/A";
    const linesJson = JSON.stringify(lines);

    const encName = await encryptField(env, name);
    const encPhone = await encryptField(env, phone);
    const encAddr = await encryptField(env, address);
    const nameIdx = await blindIndex(env, "name", name);

    const idPrefixRow = await env.DB.prepare("SELECT v FROM settings WHERE k = 'order_id_prefix'").first();
    const idPrefix = String((idPrefixRow && idPrefixRow.v) || "");
    let publicId = null;
    try {
      for (let attempt = 0; attempt < 3 && !publicId; attempt++) {
        const candidate = newPublicId(idPrefix);
        try {
          await env.DB.prepare(
            `INSERT INTO orders (public_id, customer_name, phone, address, selected_color, selected_size,
              delivery_area, delivery_charge, quantity, total, status, phone_hash, name_hash, enc_v,
              subtotal, bulk_discount, coupon_discount, coupon_code, lines_json, product_id, product_title)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, '1', ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            candidate, encName, encPhone, encAddr, selColor, selSize,
            deliveryAreaText, quote.delivery, qty, quote.total, phoneIdx, nameIdx,
            quote.subtotal, quote.bulk, couponAmount, couponCode, linesJson, productId, productTitle
          ).run();
          publicId = candidate;
        } catch (err) {
          if (!/UNIQUE/i.test(String(err && err.message))) throw err;
        }
      }
      if (!publicId) throw new Error("public id generation failed");
    } catch (err) {
      await restoreTaken();
      if (couponRow) await env.DB.prepare("UPDATE coupons SET uses = uses - 1 WHERE id = ?").bind(couponRow.id).run();
      console.error("Order insert failed", err);
      throw new HttpError(500, "অর্ডার সেভ করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।");
    }

    if (productId === 1) await syncTotal(env.DB);
    await audit(env, "customer", "order_create", publicId + " / " + productTitle, rawIp);

    let reward = null;
    try {
      reward = await issueReward(env, phoneIdx, isFirst, publicId);
    } catch (e) {
      console.error("Reward failed", e);
    }
    try {
      await notifyNewOrder(env, { publicId, name, total: quote.total });
    } catch (e) {
      console.error("Push failed", e);
    }

    let giveaway = null;
    try { giveaway = await publicGiveaway(env, phoneIdx, isFirst, publicId); } catch (e) { console.error("Giveaway failed", e); }
    return json({ success: true, orderId: publicId, reward, giveaway });
  }

  /* ---------- Admin: order status, note & delete ---------- */

  if (path === "/api/admin/order/status" && m === "POST") {
    const s = await authorize(request, env);
    const b = await readJson(request);
    const pid = normalizeSearch(b.publicId);
    const status = String(b.status ?? "");

    if (!PUBLIC_ID_RE.test(pid)) throw new HttpError(400, "অর্ডার আইডি সঠিক নয়!");
    if (!STATUSES.includes(status)) throw new HttpError(400, "Invalid status");

    const order = await env.DB.prepare(
      "SELECT id, status, quantity, product_id FROM orders WHERE public_id = ?"
    ).bind(pid).first();
    if (!order) throw new HttpError(404, "অর্ডার পাওয়া যায়নি!");

    const wasCancelled = order.status === "Cancelled";
    const nowCancelled = status === "Cancelled";
    const setStatus = env.DB.prepare("UPDATE orders SET status = ? WHERE id = ?").bind(status, order.id);
    const lines = await getOrderLines(env, order.id, order.quantity);

    if (Number(order.product_id || 1) > 1) {
      const productId = Number(order.product_id);
      if (!wasCancelled && nowCancelled) {
        const stmts = lines.map((l) => env.DB.prepare("UPDATE product_inventory SET qty = qty + ? WHERE product_id = ? AND color = ? AND size = ?").bind(l.qty, productId, l.color, l.size));
        stmts.push(setStatus);
        await env.DB.batch(stmts);
      } else if (wasCancelled && !nowCancelled) {
        const restored = [];
        for (const l of lines) {
          const taken = await env.DB.prepare("UPDATE product_inventory SET qty = qty - ? WHERE product_id = ? AND color = ? AND size = ? AND qty >= ?")
            .bind(l.qty, productId, l.color, l.size, l.qty).run();
          if (!taken.meta || taken.meta.changes === 0) {
            for (const back of restored) {
              await env.DB.prepare("UPDATE product_inventory SET qty = qty + ? WHERE product_id = ? AND color = ? AND size = ?")
                .bind(back.qty, productId, back.color, back.size).run();
            }
            throw new HttpError(400, "স্টক না থাকায় অর্ডার আবার চালু করা যাবে না!");
          }
          restored.push(l);
        }
        await setStatus.run();
      } else await setStatus.run();
    } else if (!wasCancelled && nowCancelled) {
      const stmts = lines.map((l) => addStockStmt(env.DB, l.color, l.size, l.qty));
      stmts.push(setStatus, syncTotalStmt(env.DB));
      await env.DB.batch(stmts);
    } else if (wasCancelled && !nowCancelled) {
      const taken = [];
      for (const l of lines) {
        if (await takeStock(env.DB, l.color, l.size, l.qty)) { taken.push(l); continue; }
        for (const back of taken) await addStockStmt(env.DB, back.color, back.size, back.qty).run();
        throw new HttpError(400, "স্টক না থাকায় অর্ডার আবার চালু করা যাবে না!");
      }
      await env.DB.batch([setStatus, syncTotalStmt(env.DB)]);
    } else await setStatus.run();

    await audit(env, s.username, "order_status", pid + " → " + status, rawIp);
    return json({ success: true });
  }

  if (path === "/api/admin/order/delete" && m === "POST") {
    const s = await authorize(request, env);
    const b = await readJson(request);
    const pid = normalizeSearch(b.publicId);
    if (!PUBLIC_ID_RE.test(pid)) throw new HttpError(400, "অর্ডার আইডি সঠিক নয়!");

    const order = await env.DB.prepare(
      "SELECT id, status, quantity, product_id FROM orders WHERE public_id = ?"
    ).bind(pid).first();
    if (!order) return json({ success: true });

    const lines = await getOrderLines(env, order.id, order.quantity);
    const stmts = [];
    if (order.status !== "Cancelled") {
      for (const l of lines) {
        if (Number(order.product_id || 1) > 1) {
          stmts.push(env.DB.prepare("UPDATE product_inventory SET qty = qty + ? WHERE product_id = ? AND color = ? AND size = ?")
            .bind(l.qty, Number(order.product_id), l.color, l.size));
        } else stmts.push(addStockStmt(env.DB, l.color, l.size, l.qty));
      }
    }
    stmts.push(env.DB.prepare("DELETE FROM orders WHERE id = ?").bind(order.id));
    if (Number(order.product_id || 1) === 1) stmts.push(syncTotalStmt(env.DB));
    await env.DB.batch(stmts);

    await audit(env, s.username, "order_delete", pid, rawIp);
    return json({ success: true });
  }

  if (path === "/api/admin/order/payment" && m === "POST") {
    const s = await authorize(request, env);
    const b = await readJson(request);
    const pid = normalizeSearch(b.publicId);
    const method = String(b.paymentMethod ?? "");
    const allowed = ["", "Paid", "Delivery", "COD", "Partial"];
    if (!PUBLIC_ID_RE.test(pid)) throw new HttpError(400, "অর্ডার আইডি সঠিক নয়!");
    if (!allowed.includes(method)) throw new HttpError(400, "Payment method সঠিক নয়!");
    const order = await env.DB.prepare("SELECT total, delivery_charge FROM orders WHERE public_id = ?").bind(pid).first();
    if (!order) throw new HttpError(404, "অর্ডার পাওয়া যায়নি!");
    const total = Math.max(0, Number(order.total) || 0);
    let received = method === "Paid" ? total : method === "Delivery" ? Math.max(0, Number(order.delivery_charge) || 0) : method === "COD" || !method ? 0 : Number(b.paymentReceived);
    if (!Number.isSafeInteger(received) || received < 0 || received > total) {
      throw new HttpError(400, "প্রাপ্ত টাকার পরিমাণ ০ থেকে অর্ডারের মোট টাকার মধ্যে দিন!");
    }
    await env.DB.prepare("UPDATE orders SET payment_method = ?, payment_received = ? WHERE public_id = ?")
      .bind(method, received, pid).run();
    await audit(env, s.username, "order_payment", pid + " → " + (method || "Not selected") + " / " + received, rawIp);
    return json({ success: true, paymentMethod: method, paymentReceived: received, deliveryCharge: Number(order.delivery_charge) || 0 });
  }

  if (path === "/api/admin/order/note" && m === "POST") {
    const s = await authorize(request, env);
    const b = await readJson(request);
    const pid = normalizeSearch(b.publicId);
    if (!PUBLIC_ID_RE.test(pid)) throw new HttpError(400, "অর্ডার আইডি সঠিক নয়!");
    const note = String(b.note ?? "").slice(0, 500);
    await env.DB.prepare("UPDATE orders SET note = ? WHERE public_id = ?").bind(await encryptField(env, note), pid).run();
    await audit(env, s.username, "order_note", pid, rawIp);
    return json({ success: true });
  }

  /* ---------- Inventory ---------- */

  if (path === "/api/admin/inventory" && m === "GET") {
    await authorize(request, env);
    return json({ rows: await getInventory(env.DB) });
  }

  if (path === "/api/admin/inventory" && m === "POST") {
    const s = await authorize(request, env);
    const b = await readJson(request);
    const prod = await env.DB.prepare("SELECT colors, sizes FROM product WHERE id = 1").first();
    const allowedC = prod && splitList(prod.colors).length ? splitList(prod.colors) : [""];
    const allowedS = prod && splitList(prod.sizes).length ? splitList(prod.sizes) : [""];
    const items = Array.isArray(b.items) ? b.items.slice(0, 500) : [];
    const stmts = [];
    for (const it of items) {
      const c = String(it && it.color != null ? it.color : "");
      const sz = String(it && it.size != null ? it.size : "");
      const q = toInt(it && it.qty, NaN);
      if (!allowedC.includes(c) || !allowedS.includes(sz)) continue;
      if (!Number.isFinite(q) || q < 0 || q > 100000) {
        throw new HttpError(400, "স্টকের সংখ্যা ০ থেকে ১,০০,০০০ এর মধ্যে হতে হবে!");
      }
      stmts.push(env.DB.prepare("INSERT OR REPLACE INTO inventory (color, size, qty) VALUES (?, ?, ?)").bind(c, sz, q));
    }
    if (stmts.length) {
      stmts.push(syncTotalStmt(env.DB));
      await env.DB.batch(stmts);
    }
    await audit(env, s.username, "inventory_update", items.length + " items", rawIp);
    return json({ success: true });
  }

  if (path === "/api/admin/inventory/add" && m === "POST") {
    const s = await authorize(request, env);
    const b = await readJson(request);

    const color = String(b.color ?? "").replace(/,/g, " ").trim().slice(0, 40);
    const size = String(b.size ?? "").replace(/,/g, " ").trim().slice(0, 40);
    const qty = toInt(b.qty, 0);

    if (!color && !size) throw new HttpError(400, "কালার বা সাইজ অন্তত একটি লিখুন!");
    if (qty < 0 || qty > 100000) throw new HttpError(400, "স্টকের সংখ্যা ০ থেকে ১,০০,০০০ এর মধ্যে হতে হবে!");

    const prod = await env.DB.prepare("SELECT colors, sizes FROM product WHERE id = 1").first();
    const colorList = splitList(prod && prod.colors);
    const sizeList = splitList(prod && prod.sizes);

    if (colorList.length > 0 && !color) throw new HttpError(400, "কালার লিখুন!");
    if (sizeList.length > 0 && !size) throw new HttpError(400, "সাইজ লিখুন!");

    if (color && !colorList.includes(color)) colorList.push(color);
    if (size && !sizeList.includes(size)) sizeList.push(size);

    await env.DB.prepare("UPDATE product SET colors = ?, sizes = ? WHERE id = 1")
      .bind(colorList.join(", "), sizeList.join(", ")).run();
    await syncInventory(env.DB, colorList, sizeList);

    await env.DB.batch([
      env.DB.prepare("INSERT OR REPLACE INTO inventory (color, size, qty) VALUES (?, ?, ?)").bind(color, size, qty),
      syncTotalStmt(env.DB)
    ]);

    await audit(env, s.username, "inventory_add", (color || "-") + " / " + (size || "-") + " x" + qty, rawIp);
    return json({ success: true });
  }

  /* ---------- Offers: bulk discount, coupons, website notes ---------- */

  if (path === "/api/admin/offers" && m === "GET") {
    await authorize(request, env);
    const p = await env.DB.prepare("SELECT bulk_enabled, bulk_min_qty, bulk_type, bulk_value FROM product WHERE id = 1").first();
    const { results } = await env.DB.prepare(
      "SELECT id, code, percent, max_uses, uses, expires_at, active, reward_rule, valid_days, is_personal, created_at FROM coupons ORDER BY id DESC LIMIT 400"
    ).all();
    return json({
      bulk: {
        enabled: !!Number(p && p.bulk_enabled),
        min: Math.max(2, Number(p && p.bulk_min_qty) || 2),
        type: p && p.bulk_type === "fixed" ? "fixed" : "percent",
        value: Number(p && p.bulk_value) || 0
      },
      coupons: results || [],
      notes: await getNotes(env.DB),
      totals: await offerTotals(env.DB),
      giveaway: await getGiveaway(env.DB),
      rewardRules: (results || []).filter((c) => !Number(c.is_personal) && Number(c.active) && c.reward_rule !== "none").length
    });
  }

  if (path === "/api/admin/offers/bulk" && m === "POST") {
    const s = await authorize(request, env);
    const b = await readJson(request);
    const type = b.type === "fixed" ? "fixed" : "percent";
    const enabled = b.enabled ? 1 : 0;
    const min = clampInt(b.min_qty, 2, 100, 2);
    const value = type === "percent" ? clampInt(b.value, 0, 100, 0) : clampInt(b.value, 0, 100000, 0);
    await env.DB.prepare("UPDATE product SET bulk_enabled = ?, bulk_min_qty = ?, bulk_type = ?, bulk_value = ? WHERE id = 1")
      .bind(enabled, min, type, value).run();
    await audit(env, s.username, "bulk_offer", (enabled ? "on" : "off") + " " + min + "+ " + value + (type === "percent" ? "%" : "৳"), rawIp);
    return json({ success: true });
  }

  if (path === "/api/admin/coupons" && m === "POST") {
    const s = await authorize(request, env);
    const b = await readJson(request);
    let code = String(b.code ?? "").toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 20);
    if (!code) code = randomCode(8);
    if (code.length < 4) throw new HttpError(400, "কুপন কোড কমপক্ষে ৪ অক্ষরের হতে হবে (A-Z, 0-9)।");
    const percent = clampInt(b.percent, 1, 100, 0);
    if (percent < 1) throw new HttpError(400, "ছাড়ের শতাংশ ১ থেকে ১০০ এর মধ্যে দিন।");
    const maxUses = clampInt(b.max_uses, 0, 100000, 0);
    const expDays = clampInt(b.expiry_days, 0, 3650, 0);
    const expiresAt = expDays > 0 ? new Date(Date.now() + expDays * 86400000).toISOString() : null;
    const rule = ["none", "every", "first"].includes(b.reward_rule) ? b.reward_rule : "none";
    const active = b.active === false ? 0 : 1;
    try {
      await env.DB.prepare(
        "INSERT INTO coupons (code, percent, max_uses, expires_at, active, reward_rule, valid_days) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(code, percent, maxUses, expiresAt, active, rule, COUPON_REWARD_DAYS).run();
    } catch (err) {
      if (/UNIQUE/i.test(String(err && err.message))) throw new HttpError(409, "এই কুপন কোডটি আগে থেকেই আছে।");
      throw err;
    }
    await audit(env, s.username, "coupon_create", code + " " + percent + "%", rawIp);
    return json({ success: true, code });
  }

  if (path === "/api/admin/coupons/update" && m === "POST") {
    const s = await authorize(request, env);
    const b = await readJson(request);
    const id = toInt(b.id, NaN);
    if (!Number.isFinite(id)) throw new HttpError(400, "Invalid coupon");
    await env.DB.prepare("UPDATE coupons SET active = ? WHERE id = ?").bind(b.active ? 1 : 0, id).run();
    await audit(env, s.username, "coupon_update", String(id) + (b.active ? " on" : " off"), rawIp);
    return json({ success: true });
  }

  if (path === "/api/admin/coupons/delete" && m === "POST") {
    const s = await authorize(request, env);
    const b = await readJson(request);
    const id = toInt(b.id, NaN);
    if (!Number.isFinite(id)) throw new HttpError(400, "Invalid coupon");
    const cc = await env.DB.prepare("SELECT code FROM coupons WHERE id = ?").bind(id).first();
    await env.DB.prepare("DELETE FROM coupons WHERE id = ?").bind(id).run();
    await audit(env, s.username, "coupon_delete", cc ? cc.code : String(id), rawIp);
    return json({ success: true });
  }

  if (path === "/api/admin/notes" && m === "POST") {
    const s = await authorize(request, env);
    const b = await readJson(request);
    const keys = ["note_bulk_bn", "note_bulk_en", "note_coupon_bn", "note_coupon_en"];
    const stmts = keys.map((k) =>
      env.DB.prepare("INSERT OR REPLACE INTO settings (k, v) VALUES (?, ?)").bind(k, String(b[k] ?? "").trim().slice(0, 300))
    );
    stmts.push(env.DB.prepare("INSERT OR REPLACE INTO settings (k, v) VALUES ('note_bulk_on', ?)").bind(b.note_bulk_on ? "1" : "0"));
    stmts.push(env.DB.prepare("INSERT OR REPLACE INTO settings (k, v) VALUES ('note_coupon_on', ?)").bind(b.note_coupon_on ? "1" : "0"));
    await env.DB.batch(stmts);
    await audit(env, s.username, "notes_update", "website notes", rawIp);
    return json({ success: true });
  }

  /* ---------- Admin: own username ---------- */

  if (path === "/api/admin/me/username" && m === "POST") {
    const s = await authorize(request, env);
    const b = await readJson(request);
    const current = String(b.current ?? "");
    const next = String(b.username ?? "").trim().toLowerCase();
    if (!/^[a-z0-9_.-]{3,32}$/.test(next)) {
      throw new HttpError(400, "ইউজারনেম ৩-৩২ অক্ষর, শুধু a-z, 0-9, _ . - ব্যবহার করুন।");
    }
    const user = await env.DB.prepare("SELECT password_hash, salt FROM admin_users WHERE id = ?").bind(s.id).first();
    if (!user) throw new HttpError(404, "ইউজার পাওয়া যায়নি!");
    if (!safeEqual(await hashPassword(current, user.salt), user.password_hash)) {
      throw new HttpError(400, "বর্তমান পাসওয়ার্ড ভুল!");
    }
    if (next === s.username) throw new HttpError(400, "নতুন ইউজারনেম আগেরটির থেকে আলাদা হতে হবে!");
    const taken = await env.DB.prepare("SELECT id FROM admin_users WHERE username = ?").bind(next).first();
    if (taken) throw new HttpError(409, "এই ইউজারনেম আগে থেকেই আছে!");
    await env.DB.prepare("UPDATE admin_users SET username = ? WHERE id = ?").bind(next, s.id).run();
    await audit(env, s.username, "username_change", next, rawIp);
    return json({ success: true, username: next });
  }

  /* ---------- Admin: printer settings (Invoice & POS) ---------- */

  if (path === "/api/admin/id-generator" && m === "GET") {
    await authorize(request, env);
    const row = await env.DB.prepare("SELECT v FROM settings WHERE k = 'order_id_prefix'").first();
    return json({ prefix: String((row && row.v) || ""), defaultPrefix: defaultOrderIdPrefix() });
  }

  if (path === "/api/admin/id-generator" && m === "POST") {
    const s = await authorize(request, env);
    const b = await readJson(request);
    const prefix = String(b.prefix ?? "").trim().toUpperCase();
    if (prefix && !/^[A-Z0-9]{1,10}$/.test(prefix)) {
      throw new HttpError(400, "Prefix ১-১০ অক্ষর হতে হবে; শুধু English letters ও numbers ব্যবহার করুন।");
    }
    await env.DB.prepare("INSERT OR REPLACE INTO settings (k, v) VALUES ('order_id_prefix', ?)").bind(prefix).run();
    await audit(env, s.username, "id_generator_save", prefix || "auto-month", rawIp);
    return json({ success: true, prefix, defaultPrefix: defaultOrderIdPrefix() });
  }

  if (path === "/api/admin/print" && m === "GET") {
    await authorize(request, env);
    const { results } = await env.DB.prepare(
      "SELECT k, v FROM settings WHERE k IN ('print_invoice', 'print_pos')"
    ).all();
    const print = { invoice: cleanPrintCfg("invoice", null), pos: cleanPrintCfg("pos", null) };
    for (const r of results || []) {
      const kind = r.k === "print_pos" ? "pos" : "invoice";
      let raw = null;
      try { raw = JSON.parse(r.v || "null"); } catch (e) { raw = null; }
      print[kind] = cleanPrintCfg(kind, raw);
    }
    return json({ print });
  }

  if (path === "/api/admin/print" && m === "POST") {
    const s = await authorize(request, env);
    const b = await readJson(request, 400 * 1024);
    const kind = b.kind === "pos" ? "pos" : "invoice";
    const saved = JSON.stringify(cleanPrintCfg(kind, b.cfg));
    if (saved.length > 280 * 1024) throw new HttpError(413, "প্রিন্ট সেটিং অনেক বড়।");
    await env.DB.prepare("INSERT OR REPLACE INTO settings (k, v) VALUES (?, ?)").bind("print_" + kind, saved).run();
    await audit(env, s.username, "print_save", kind, rawIp);
    return json({ success: true });
  }

  /* ---------- Admin: reward coupon history & security overview ---------- */

  if (path === "/api/admin/rewards" && m === "GET") {
    await authorize(request, env);
    const { results } = await env.DB.prepare(
      `SELECT c.id, c.code, c.percent, c.max_uses, c.uses, c.expires_at, c.active, c.created_at, c.issued_order,
        (SELECT o.public_id FROM orders o WHERE o.coupon_code = c.code ORDER BY o.id DESC LIMIT 1) AS used_order,
        (SELECT o.created_at FROM orders o WHERE o.coupon_code = c.code ORDER BY o.id DESC LIMIT 1) AS used_at,
        (SELECT o.customer_name FROM orders o WHERE o.public_id = c.issued_order LIMIT 1) AS issued_name,
        (SELECT o.customer_name FROM orders o WHERE o.coupon_code = c.code ORDER BY o.id DESC LIMIT 1) AS used_name
       FROM coupons c WHERE c.is_personal = 1 ORDER BY c.id DESC LIMIT 500`
    ).all();
    const rewards = [];
    for (const r of results || []) {
      rewards.push({
        ...r,
        issued_name: await decryptField(env, r.issued_name),
        used_name: await decryptField(env, r.used_name)
      });
    }
    return json({ rewards });
  }

  if (path === "/api/admin/security" && m === "GET") {
    const s = await authorize(request, env);
    const sess = await env.DB.prepare(
      "SELECT COUNT(*) AS c FROM sessions WHERE user_id = ? AND expires_at > ?"
    ).bind(s.id, Date.now()).first();
    const fails = await env.DB.prepare(
      "SELECT COUNT(*) AS c FROM audit_log WHERE action = 'login_fail' AND created_at > datetime('now', '-24 hours')"
    ).first();
    const admins = await env.DB.prepare("SELECT COUNT(*) AS c FROM admin_users").first();
    // আগের লগইন (বর্তমান লগইনের ঠিক আগের সফল লগইন)
    const prev = await env.DB.prepare(
      "SELECT created_at FROM audit_log WHERE action = 'login_ok' AND actor = ? ORDER BY id DESC LIMIT 1 OFFSET 1"
    ).bind(s.username).first();
    return json({
      sessions: sess ? sess.c : 0,
      failed24h: fails ? fails.c : 0,
      admins: admins ? admins.c : 0,
      lastLogin: prev ? prev.created_at : null
    });
  }

  /* ---------- Admin: give way (next-order coupon) ---------- */

  if (path === "/api/admin/giveaway" && m === "POST") {
    const s = await authorize(request, env);
    const b = await readJson(request);
    const cur = await getGiveaway(env.DB);
    const code = String(b.code ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20);
    if (code.length < 4) throw new HttpError(400, "কুপন কোড কমপক্ষে ৪ অক্ষরের হতে হবে (A-Z, 0-9)।");
    const percent = clampInt(b.percent, 1, 100, 0);
    if (percent < 1) throw new HttpError(400, "ছাড়ের শতাংশ ১ থেকে ১০০ এর মধ্যে দিন।");
    const days = clampInt(b.expiry_days, 0, 3650, 0);
    const exp = days > 0 ? new Date(Date.now() + days * 86400000).toISOString() : null;
    const words = cleanGiveawayWords(b.words ?? cur.words ?? "GIFT");
    const rawMode = String(b.reward_mode || cur.rewardMode || "every");
    const rewardMode = ["none", "every", "first"].includes(rawMode) ? rawMode : "every";
    const clash = await env.DB.prepare("SELECT is_personal FROM coupons WHERE code = ?").bind(code).first();
    if (clash && Number(clash.is_personal)) throw new HttpError(409, "এই কুপন কোডটি আগে থেকেই আছে।");
    if (clash) {
      await env.DB.prepare("UPDATE coupons SET percent = ?, expires_at = ?, active = 1 WHERE code = ? AND is_personal = 0")
        .bind(percent, exp, code).run();
    } else {
      await env.DB.prepare(
        "INSERT INTO coupons (code, percent, max_uses, expires_at, active, reward_rule, valid_days) VALUES (?, ?, 0, ?, 1, 'none', 30)"
      ).bind(code, percent, exp).run();
    }
    // on/off আলাদা বাটন দিয়ে হয়, তাই সেভ করলে আগের on/off অবস্থা বজায় থাকে
    const cfg = { enabled: cur.enabled, code, words, rewardMode };
    await env.DB.prepare("INSERT OR REPLACE INTO settings (k, v) VALUES ('giveaway', ?)").bind(JSON.stringify(cfg)).run();
    await audit(env, s.username, "giveaway_save", code + " " + percent + "%", rawIp);
    return json({ success: true });
  }

  if (path === "/api/admin/giveaway/generate" && m === "POST") {
    const s = await authorize(request, env);
    const b = await readJson(request);
    const percent = clampInt(b.percent, 1, 100, 0);
    if (percent < 1) throw new HttpError(400, "ছাড়ের শতাংশ ১ থেকে ১০০ এর মধ্যে দিন।");
    const days = clampInt(b.expiry_days, 0, 3650, 0);
    const exp = days > 0 ? new Date(Date.now() + days * 86400000).toISOString() : null;
    const words = cleanGiveawayWords(b.words ?? "GIFT");
    const rewardMode = ["none", "every", "first"].includes(String(b.reward_mode || "every"))
      ? String(b.reward_mode || "every") : "every";
    let code = "";
    for (let i = 0; i < 50 && !code; i++) {
      const prefix = words[Math.floor(Math.random() * words.length)];
      const cand = prefix + randomCode(5);
      const clash = await env.DB.prepare("SELECT id FROM coupons WHERE code = ?").bind(cand).first();
      if (!clash) code = cand;
    }
    if (!code) throw new HttpError(500, "কোড তৈরি করা যায়নি, আবার চেষ্টা করুন।");
    await env.DB.prepare(
      "INSERT INTO coupons (code, percent, max_uses, expires_at, active, reward_rule, valid_days) VALUES (?, ?, 0, ?, 1, 'none', 30)"
    ).bind(code, percent, exp).run();
    const cur = await getGiveaway(env.DB);
    await env.DB.prepare("INSERT OR REPLACE INTO settings (k, v) VALUES ('giveaway', ?)")
      .bind(JSON.stringify({ enabled: cur.enabled, code, words, rewardMode })).run();
    await audit(env, s.username, "giveaway_generate", code + " " + percent + "%", rawIp);
    return json({ success: true, code });
  }

  if (path === "/api/admin/giveaway/toggle" && m === "POST") {
    const s = await authorize(request, env);
    const b = await readJson(request);
    const cur = await getGiveaway(env.DB);
    const enabled = !!b.enabled;
    if (enabled && (!cur.exists || !cur.active || (cur.expires_at && new Date(cur.expires_at).getTime() <= Date.now()) || (cur.max_uses > 0 && cur.uses >= cur.max_uses))) throw new HttpError(400, "Give way চালু করতে আগে একটি সক্রিয় ও মেয়াদ থাকা কুপন সেভ করুন।");
    await env.DB.prepare("INSERT OR REPLACE INTO settings (k, v) VALUES ('giveaway', ?)")
      .bind(JSON.stringify({ enabled, code: cur.code, words: cur.words, rewardMode: cur.rewardMode })).run();
    await audit(env, s.username, "giveaway_toggle", enabled ? "on" : "off", rawIp);
    return json({ success: true, enabled });
  }

  /* ---------- Devices (Android push) ---------- */

  if (path === "/api/admin/devices" && m === "POST") {
    const s = await authorize(request, env);
    const b = await readJson(request);
    const token = String(b.token ?? "").trim();
    if (token.length < 20 || token.length > 4096) throw new HttpError(400, "Invalid token");
    await env.DB.prepare("INSERT OR REPLACE INTO devices (token, user_id) VALUES (?, ?)").bind(token, s.id).run();
    return json({ success: true });
  }

  if (path === "/api/admin/devices/remove" && m === "POST") {
    await authorize(request, env);
    const b = await readJson(request);
    await env.DB.prepare("DELETE FROM devices WHERE token = ?").bind(String(b.token ?? "")).run();
    return json({ success: true });
  }

  return fail(404, "Not found");
}

/* ============================================================
   Give way: অর্ডার কনফার্মের পর ধন্যবাদ পাতায় দেখানো next-order কুপন
   ============================================================ */

function cleanGiveawayWords(value) {
  const raw = String(value ?? "").split(",").map((w) => w.trim()).filter(Boolean);
  if (!raw.length || raw.some((w) => !/^[A-Za-z]{2,14}$/.test(w))) {
    throw new HttpError(400, "Words-এ ২-১৪ অক্ষরের শুধু English letters লিখুন, কমা দিয়ে আলাদা করুন (যেমন: GIFT, BONUS)।");
  }
  return [...new Set(raw.map((w) => w.toUpperCase()))];
}

async function getGiveaway(db) {
  const row = await db.prepare("SELECT v FROM settings WHERE k = 'giveaway'").first();
  let g = {};
  try { g = JSON.parse((row && row.v) || "{}"); } catch (e) { g = {}; }
  const code = String(g.code || "");
  const c = code
    ? await db.prepare(
        "SELECT percent, expires_at, active, max_uses, uses FROM coupons WHERE code = ? AND is_personal = 0"
      ).bind(code).first()
    : null;
  return {
    enabled: !!g.enabled,
    code,
    words: cleanGiveawayWords(g.words || "GIFT").join(", "),
    rewardMode: ["none", "every", "first"].includes(g.rewardMode) ? g.rewardMode : "every",
    exists: !!c,
    percent: c ? Number(c.percent) : 0,
    expires_at: c ? c.expires_at : null,
    active: !!c && !!Number(c.active),
    max_uses: c ? Number(c.max_uses) : 0,
    uses: c ? Number(c.uses) : 0
  };
}

// গ্রাহককে শুধু তখনই দেখানো হবে যখন Give way চালু আছে এবং কুপন বৈধ
async function publicGiveaway(env, phoneIdx, isFirst, orderId) {
  const g = await getGiveaway(env.DB);
  if (!g.enabled || !g.code || !g.exists || !g.active) return null;
  if (g.rewardMode === "none") return null;
  if (g.rewardMode === "first" && !isFirst) return null;
  if (g.expires_at && new Date(g.expires_at).getTime() <= Date.now()) return null;
  if (g.max_uses > 0 && g.uses >= g.max_uses) return null;

  // Give each eligible customer/order a unique, phone-bound, one-time code.
  // The configured giveaway coupon is the template for percentage and expiry.
  const words = cleanGiveawayWords(g.words || "GIFT");
  const expires = g.expires_at || null;
  const validDays = expires
    ? Math.max(1, Math.ceil((new Date(expires).getTime() - Date.now()) / 86400000))
    : 0;

  for (let attempt = 0; attempt < 20; attempt++) {
    const prefix = words[Math.floor(Math.random() * words.length)];
    const code = prefix + randomCode(5);
    try {
      await env.DB.prepare(
        "INSERT INTO coupons (code, percent, max_uses, uses, expires_at, active, reward_rule, valid_days, is_personal, owner_hash, template_id, issued_order) VALUES (?, ?, 1, 0, ?, 1, 'none', ?, 1, ?, (SELECT id FROM coupons WHERE code = ? AND is_personal = 0), ?)"
      ).bind(code, g.percent, expires, validDays, phoneIdx, g.code, orderId || null).run();
      return { code, percent: g.percent, days: validDays };
    } catch (err) {
      if (/UNIQUE/i.test(String(err && err.message))) continue;
      throw err;
    }
  }
  throw new Error("Giveaway personal coupon generation failed");
}

async function offerTotals(db) {
  const r = await db.prepare(
    `SELECT COALESCE(SUM(coupon_discount), 0) AS coupon_total,
      COALESCE(SUM(bulk_discount), 0) AS bulk_total,
      COALESCE(SUM(CASE WHEN coupon_code IS NOT NULL AND coupon_code != '' THEN 1 ELSE 0 END), 0) AS coupon_orders
     FROM orders WHERE status != 'Cancelled'`
  ).first();
  return r || { coupon_total: 0, bulk_total: 0, coupon_orders: 0 };
}

const PRINT_KEYS = ["num", "customer", "phone", "address", "area", "product", "color", "size", "qty", "unit",
  "subtotal", "bulk", "coupon", "delivery", "status", "payment", "date", "contact"];
const PRINT_PAGES = ["A4", "A5", "Letter", "80mm", "58mm"];
const PRINT_LOGO_RE = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;

function printDefaults(kind) {
  const pos = kind === "pos";
  const show = {};
  for (const k of PRINT_KEYS) show[k] = true;
  if (pos) { show.unit = false; }
  return {
    theme: pos ? "p_classic" : "emerald", brand: "Brand Name", tagline: "", contact: "",
    logo: "", logo_w: pos ? 48 : 64,
    primary: pos ? "#000000" : "#065f46", text: pos ? "#000000" : "#0f172a", bg: "#ffffff", line: pos ? "#000000" : "#cbd5e1",
    header_bg: !pos, line_on: true, font: pos ? "mono" : "sans", base: pos ? 12 : 14,
    page: pos ? "80mm" : "A4", margin: pos ? 3 : 25,
    footer_bn: "ধন্যবাদ আমাদের সাথে থাকার জন্য! ❤️", footer_en: "Thank you for shopping with us! ❤️",
    brand_size: 22, tagline_size: 16, footer_title: "Thank You!", footer_message: "for shopping with us! ❤️",
    show_thank_you: true, show_brand_address: true,
    footer_size: 15, footer_title_size: 48, footer_x: 0, footer_y: 0, address_x: 0, address_y: 0,
    footer_brand: "ABC Fashion", footer_address: "123 Anywhere St., Dhaka, Bangladesh", footer_phone: "+880 1XXXXXXXXX",
    line_h: 150, align: "left", box_radius: 6, table_style: "grid", font_weight: 400,
    head_upper: false, compact: false, watermark: "", item_layout: pos ? "stacked" : "table",
    show
  };
}

// প্রিন্ট সেটিং সার্ভারে যাচাই করে সাফ করে (অবৈধ মান থাকলে ডিফল্ট বসে)
function cleanPrintCfg(kind, raw) {
  const d = printDefaults(kind);
  const r = raw && typeof raw === "object" ? raw : {};
  const str = (v, max, fb) => (typeof v === "string" ? v.trim().slice(0, max) : fb);
  const hex = (v, fb) => (typeof v === "string" && HEX_RE.test(v) ? v : fb);
  const bool = (v, fb) => (typeof v === "boolean" ? v : fb);
  const show = {};
  for (const k of PRINT_KEYS) {
    show[k] = r.show && typeof r.show === "object" ? !!r.show[k] : d.show[k];
  }
  const logo = typeof r.logo === "string" && r.logo.length <= 250 * 1024 && PRINT_LOGO_RE.test(r.logo) ? r.logo : "";
  return {
    theme: str(r.theme, 20, d.theme),
    brand: str(r.brand, 60, d.brand),
    tagline: str(r.tagline, 120, ""),
    contact: str(r.contact, 120, ""),
    logo,
    logo_w: clampInt(r.logo_w, 20, 220, d.logo_w),
    logo_x: clampInt(r.logo_x, -300, 300, 0),
    logo_y: clampInt(r.logo_y, -150, 250, 0),
    primary: hex(r.primary, d.primary),
    text: hex(r.text, d.text),
    bg: hex(r.bg, d.bg),
    line: hex(r.line, d.line),
    header_bg: bool(r.header_bg, d.header_bg),
    line_on: bool(r.line_on, d.line_on),
    font: Object.prototype.hasOwnProperty.call(NOTICE_FONT_CSS, r.font) ? r.font : d.font,
    base: clampInt(r.base, 8, 22, d.base),
    page: PRINT_PAGES.includes(r.page) ? r.page : d.page,
    margin: clampInt(r.margin, 0, 25, d.margin),
    footer_bn: str(r.footer_bn, 300, d.footer_bn),
    footer_en: str(r.footer_en, 300, d.footer_en),
    brand_size: clampInt(r.brand_size, 10, 48, d.brand_size),
    tagline_size: clampInt(r.tagline_size, 8, 32, d.tagline_size),
    footer_title: str(r.footer_title, 100, d.footer_title),
    footer_message: str(r.footer_message, 200, d.footer_message),
    show_thank_you: bool(r.show_thank_you, d.show_thank_you),
    show_brand_address: bool(r.show_brand_address, d.show_brand_address),
    footer_size: clampInt(r.footer_size, 8, 32, d.footer_size),
    footer_title_size: clampInt(r.footer_title_size, 16, 80, d.footer_title_size),
    footer_x: clampInt(r.footer_x, -300, 300, d.footer_x),
    footer_y: clampInt(r.footer_y, -300, 300, d.footer_y),
    address_x: clampInt(r.address_x, -300, 300, d.address_x),
    address_y: clampInt(r.address_y, -300, 300, d.address_y),
    footer_brand: str(r.footer_brand, 80, d.footer_brand),
    footer_address: str(r.footer_address, 180, d.footer_address),
    footer_phone: str(r.footer_phone, 80, d.footer_phone),
    line_h: clampInt(r.line_h, 110, 220, d.line_h),
    align: NOTICE_ALIGN.includes(r.align) ? r.align : d.align,
    box_radius: clampInt(r.box_radius, 0, 16, d.box_radius),
    table_style: ["grid", "plain", "zebra"].includes(r.table_style) ? r.table_style : d.table_style,
    font_weight: [400, 600, 800].includes(Number(r.font_weight)) ? Number(r.font_weight) : d.font_weight,
    head_upper: bool(r.head_upper, d.head_upper),
    compact: bool(r.compact, d.compact),
    watermark: str(r.watermark, 30, d.watermark),
    item_layout: ["table", "stacked"].includes(r.item_layout) ? r.item_layout : d.item_layout,
    show
  };
}

function stockOutMessage(hasColor, hasSize, want, have, color, size) {
  const tag = [hasColor ? color : "", hasSize ? size : ""].filter(Boolean).join(" / ");
  const what = tag ? "“" + tag + "” এর" : "প্রোডাক্টের";
  if (have > 0) {
    return "🙏 দুঃখিত! " + what + " স্টক এখন মাত্র " + have + " টি আছে, আর আপনি " + want +
      " টি চাচ্ছেন। পরিমাণ বা বাছাই বদলে আবার চেষ্টা করুন।";
  }
  return "😔 দুঃখিত! " + what + " স্টক শেষ হয়ে গেছে। অন্য কালার বা সাইজ বেছে নিন, অথবা কিছুক্ষণ পর আবার দেখুন।";
}

export { route };
