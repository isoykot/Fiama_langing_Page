/**
 * Cloudflare Worker - Single Product Landing Page + Order System + Admin Panel
 * D1 binding name: DB
 * Secrets: DATA_KEY, FCM_SERVICE_ACCOUNT, ADMIN_DEFAULT_USER, ADMIN_DEFAULT_PASS
 * Variable: FCM_PROJECT_ID
 */

export function defaultAdmin(env) {
  return { user: env.ADMIN_DEFAULT_USER || "", pass: env.ADMIN_DEFAULT_PASS || "" };
}

export const STATUSES = ["Pending", "Confirmed", "Delivered", "Cancelled"];
export const RATIOS = ["auto", "1:1", "4:5", "3:4", "4:3", "16:9"];
export const BADGE_POS = ["tl", "tr", "bl", "br"];
export const TOPBAR_ALIGN = ["left", "center", "right"];
export const NOTICE_ALIGN = ["left", "center", "right"];
export const MAX_IMAGES = 8;
export const MAX_IMAGES_BYTES = 900 * 1024;
export const MAX_NOTICES = 3;
export const MAX_NOTICES_BYTES = 500 * 1024;
export const MAX_BODY_BYTES = 256 * 1024;
export const MAX_PRODUCT_BODY = 1536 * 1024;
export const MAX_TRUST = 3;
export const MAX_FAQ = 10;
export const MAX_QTY = 20;
export const PAGE_SIZE = 30;
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
export const PBKDF2_ITER = 100000;
export const LOGIN_FAIL_LIMIT = 20;
export const PHONE_ORDER_LIMIT = 5;
export const COUPON_REWARD_DAYS = 30;
export const LOW_STOCK = 5;
export const ID_ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";
export const PUBLIC_ID_RE = /^[A-Z0-9]{1,10}-[2-9A-HJKMNP-TV-Z]{5}-[2-9A-HJKMNP-TV-Z]{5}$/;
export const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export const NOTICE_FONT_CSS = {
  sans: "'Segoe UI', Roboto, 'Noto Sans Bengali', sans-serif",
  serif: "Georgia, 'Times New Roman', 'Noto Serif Bengali', serif",
  mono: "ui-monospace, Menlo, Consolas, monospace",
  display: "Impact, 'Arial Black', 'Noto Sans Bengali', sans-serif"
};

export const DEFAULT_TRUST = [
  { icon: "💵", bn: "ক্যাশ অন ডেলিভারি", en: "Cash on delivery" },
  { icon: "🔁", bn: "৭ দিন রিপ্লেসমেন্ট", en: "7-day replacement" },
  { icon: "✅", bn: "১০০% অরিজিনাল", en: "100% original" }
];

export const DEFAULT_FAQS = [
  { qbn: "ডেলিভারি কত দিনে হবে?", qen: "How long does delivery take?",
    abn: "ঢাকার ভেতরে সাধারণত ১-২ দিন, ঢাকার বাইরে ৩-৫ দিন।", aen: "Inside Dhaka usually 1–2 days, outside Dhaka 3–5 days." },
  { qbn: "পণ্য পছন্দ না হলে?", qen: "What if I'm not happy with the product?",
    abn: "হাতে পাওয়ার ৭ দিনের মধ্যে সমস্যা হলে রিপ্লেসমেন্ট পাবেন।", aen: "If there is a problem within 7 days of delivery, you get a replacement." },
  { qbn: "টাকা কীভাবে দেব?", qen: "How do I pay?",
    abn: "পণ্য হাতে পেয়ে ক্যাশে টাকা দিন। আগে কোনো পেমেন্ট লাগবে না।", aen: "Pay cash when you receive the product. No advance payment needed." }
];

export let schemaReady = false;

/* ============================================================
   Website strings  [বাংলা, English]  — ওয়েবসাইট ডিফল্টে বাংলা
   ============================================================ */

export const LANDING_STRINGS = {
  topbar: ["⚡ সীমিত সময়ের অফার! সারাদেশে ক্যাশ অন ডেলিভারি", "⚡ Limited-time offer! Cash on delivery nationwide"],
  in_stock: ["✅ স্টকে আছে", "✅ In stock"],
  out_stock: ["❌ স্টক আউট", "❌ Out of stock"],
  off: ["ছাড়", "OFF"],
  about_title: ["প্রোডাক্ট সম্পর্কে", "About this product"],
  faq_title: ["সাধারণ প্রশ্ন ও উত্তর", "Frequently asked questions"],
  call: ["📞 সরাসরি কল করুন", "📞 Call now"],
  wa: ["💬 WhatsApp চ্যাট", "💬 WhatsApp chat"],
  buy_now: ["অর্ডার করুন", "Order now"],
  delivery_note: ["ডেলিভারি চার্জ আলাদা", "Delivery charge extra"],
  form_title: ["অর্ডার করতে নিচের ফর্মটি পূরণ করুন", "Fill in the form to place your order"],
  l_name: ["আপনার নাম *", "Your name *"],
  ph_name: ["সম্পূর্ণ নাম লিখুন", "Enter your full name"],
  l_phone: ["মোবাইল নাম্বার *", "Mobile number *"],
  l_address: ["সম্পূর্ণ ঠিকানা *", "Full address *"],
  ph_address: ["বাসা নং, রোড, থানা, জেলা", "House, road, area, district"],
  l_color: ["কালার সিলেক্ট করুন *", "Select color *"],
  l_size: ["সাইজ সিলেক্ট করুন *", "Select size *"],
  l_area: ["ডেলিভারি এরিয়া *", "Delivery area *"],
  area_in: ["ঢাকার ভেতরে", "Inside Dhaka"],
  area_out: ["ঢাকার বাইরে", "Outside Dhaka"],
  l_qty: ["পরিমাণ:", "Quantity:"],
  l_subtotal: ["প্রোডাক্টের দাম:", "Product price:"],
  l_delivery: ["ডেলিভারি চার্জ:", "Delivery charge:"],
  select_first: ["সিলেক্ট করুন", "Select"],
  l_total: ["সর্বমোট বিল:", "Total:"],
  plus_delivery: ["+ ডেলিভারি", "+ delivery"],
  submit: ["অর্ডার কনফার্ম করুন ➔", "Confirm order ➔"],
  submitting: ["প্রসেসিং হচ্ছে...", "Processing..."],
  hint: ["সব তথ্য পূরণ করলে অর্ডার কনফার্ম বাটন চালু হবে।", "The confirm button activates once all fields are filled."],
  success: ["🎉 ধন্যবাদ! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।\nখুব শীঘ্রই আমাদের প্রতিনিধি আপনাকে কল করবেন।", "🎉 Thank you! Your order has been received.\nOur representative will call you shortly."],
  back_product: ["অর্ডার সম্পন্ন হয়েছে", "Order completed"],
  coupon_label: ["কুপন কোড (থাকলে)", "Coupon code (if you have one)"],
  coupon_ph: ["কুপন কোড লিখুন", "Enter coupon code"],
  coupon_row: ["কুপন ছাড় ({p}%)", "Coupon discount ({p}%)"],
  coupon_ok: ["কুপন প্রয়োগ হয়েছে, {p}% ছাড়", "Coupon applied, {p}% off"],
  coupon_pending: ["ফোন নাম্বার দিলে কুপনটি যাচাই হবে।", "Enter your phone number to verify this coupon."],
  bulk_row: ["বাল্ক ছাড় ({n}+ টি)", "Bulk discount ({n}+ pcs)"],
  bulk_hint: ["{n} টি বা তার বেশি নিলে {v} ছাড়!", "Buy {n} or more and get {v} off!"],
  copy_btn: ["📋 কপি করুন", "📋 Copy"],
  copied_btn: ["✅ কপি হয়েছে", "✅ Copied"],
  reward_title: ["🎁 আপনার পরবর্তী অর্ডারের কুপন", "🎁 Coupon for your next order"],
  reward_note: ["এই কোডে {p}% ছাড় পাবেন। মেয়াদ {d} দিন। কোডটি একবারই ব্যবহার করা যাবে।", "Get {p}% off with this code. Valid {d} days, one-time use."],
  oid_label: ["অর্ডার আইডি", "Order ID"],
  unit_title: ["কালার ও সাইজ নির্বাচন করুন", "Select color & size"],
  unit_same: ["বাকি সব পিস প্রথমটির মতো", "All other pieces same as the first"],
  unit_item: ["আইটেম {n}", "Item {n}"],
  unit_ok: ["ঠিক আছে", "Done"],
  units_label: ["আইটেম", "Items"],
  net_error: ["নেটওয়ার্ক সমস্যা হয়েছে, আবার চেষ্টা করুন।", "Network problem, please try again."],
  give_title: ["🎁 পরবর্তী অর্ডারে বিশেষ ছাড়", "🎁 Special discount on your next order"],
  give_note: ["এই কোডে {p}% ছাড় পাবেন।", "Get {p}% off with this code."],
  give_exp: ["মেয়াদ: {d} দিন", "Valid for {d} days"]
};

/* ============================================================
   Admin strings  [বাংলা, English]  — অ্যাডমিন ডিফল্টে English
   ============================================================ */

export const ADMIN_STRINGS = {
  login_title: ["অ্যাডমিন লগইন", "Admin login"],
  login_sub: ["অ্যাডমিন অ্যাকাউন্টে লগইন করুন", "Sign in to your admin account"],
  username: ["ইউজারনেম", "Username"],
  password: ["পাসওয়ার্ড", "Password"],
  login_btn: ["লগইন করুন", "Sign in"],
  login_fail: ["লগইন হয়নি", "Sign-in failed"],
  net_error: ["নেটওয়ার্ক সমস্যা!", "Network error!"],
  session_expired: ["সেশন শেষ হয়েছে, আবার লগইন করুন।", "Session expired, please sign in again."],
  nav_dash: ["ড্যাশবোর্ড", "Dashboard"],
  nav_orders: ["অর্ডার", "Orders"],
  nav_product: ["প্রোডাক্ট", "Product"],
  nav_offers: ["অফার ও কুপন", "Offers & coupons"],
  nav_inventory: ["ইনভেন্টরি", "Inventory"],
  nav_admins: ["অ্যাডমিন", "Admins"],
  nav_logs: ["লগ", "Logs"],
  nav_settings: ["সেটিংস", "Settings"],
  theme_tip: ["থিম বদলান", "Toggle theme"],
  logout: ["লগআউট", "Log out"],
  refresh: ["রিফ্রেশ", "Refresh"],
  dash_title: ["ড্যাশবোর্ড", "Dashboard"],
  pw_warn: ["আপনি এখনো ডিফল্ট পাসওয়ার্ড ব্যবহার করছেন। নিরাপত্তার জন্য এখনই বদলান।", "You are still using the default password. Change it now for safety."],
  change_pw: ["পাসওয়ার্ড বদলান", "Change password"],
  stat_total: ["মোট অর্ডার", "Total orders"],
  stat_today: ["আজকের অর্ডার", "Today's orders"],
  stat_pending: ["অপেক্ষমাণ", "Pending"],
  stat_revenue: ["ডেলিভারি সম্পন্ন আয়", "Delivered revenue"],
  status_bars: ["অর্ডারের অবস্থা", "Order status"],
  stock_box: ["প্রোডাক্ট ও স্টক", "Product & stock"],
  recent: ["সাম্প্রতিক অর্ডার", "Recent orders"],
  see_all: ["সব দেখুন →", "View all →"],
  daily_title: ["গত ৭ দিনের অর্ডার ও বিক্রি", "Orders & sales, last 7 days"],
  orders_title: ["অর্ডার", "Orders"],
  orders_sub: ["অর্ডার আইডি, নাম বা ফোন দিয়ে খুঁজুন", "Search by order ID, full name or full phone"],
  csv: ["CSV", "CSV"],
  search_ph: ["🔍 ABC-XXXXX-XXXXX, পুরো নাম বা পুরো ফোন নাম্বার", "🔍 ABC-XXXXX-XXXXX, full name or full phone"],
  all_status: ["সব স্ট্যাটাস", "All statuses"],
  all_time: ["সব সময়", "All time"],
  today: ["আজ", "Today"],
  last7: ["গত ৭ দিন", "Last 7 days"],
  orders_count: ["{n} টি অর্ডার", "{n} orders"],
  more_avail: ["(আরও আছে)", "(more available)"],
  load_more: ["আরও দেখুন", "Load more"],
  no_orders: ["কোনো অর্ডার পাওয়া যায়নি", "No orders found"],
  no_orders_yet: ["এখনো কোনো অর্ডার নেই", "No orders yet"],
  st_Pending: ["অপেক্ষমাণ", "Pending"],
  st_Confirmed: ["নিশ্চিত", "Confirmed"],
  st_Delivered: ["ডেলিভারি সম্পন্ন", "Delivered"],
  st_Cancelled: ["বাতিল", "Cancelled"],
  d_phone: ["ফোন", "Phone"],
  d_address: ["ঠিকানা", "Address"],
  d_area: ["এরিয়া", "Area"],
  d_variant: ["কালার / সাইজ", "Color / size"],
  d_qty: ["পরিমাণ", "Quantity"],
  d_delivery: ["ডেলিভারি", "Delivery"],
  d_total: ["মোট (COD)", "Total (COD)"],
  d_time: ["সময়", "Time"],
  d_status: ["স্ট্যাটাস", "Status"],
  pay_method: ["পেমেন্টের ধরন", "Payment method"],
  pay_select: ["পেমেন্ট নির্বাচন করুন", "Select payment"],
  pay_paid: ["পরিশোধিত", "Paid"],
  pay_delivery: ["ডেলিভারি চার্জ পরিশোধ", "Pay Delivery Charge"],
  pay_cod: ["ক্যাশ অন ডেলিভারি (COD)", "Cash on Delivery (COD)"],
  pay_partial: ["আংশিক পেমেন্ট", "Partial payment"],
  pay_received: ["গ্রাহকের কাছ থেকে পাওয়া টাকা (৳)", "Amount received (৳)"],
  pay_received_placeholder: ["কত টাকা দিয়েছেন লিখুন", "Customer paid amount"],
  d_bulk: ["বাল্ক ছাড়", "Bulk discount"],
  d_coupon: ["কুপন ছাড়", "Coupon discount"],
  qty_unit: ["টি", "pcs"],
  act_call: ["📞 কল", "📞 Call"],
  act_wa: ["💬 WhatsApp", "💬 WhatsApp"],
  act_inv: ["🧾 ইনভয়েস", "🧾 Invoice"],
  act_copy: ["📋 কপি", "📋 Copy"],
  delete_order: ["অর্ডার ডিলিট করুন", "Delete order"],
  delete_confirm: ["অর্ডার {id} ডিলিট করতে চান? এটি ফেরত নেওয়া যাবে না।", "Delete order {id}? This cannot be undone."],
  deleted: ["ডিলিট হয়েছে", "Deleted"],
  status_updated: ["স্ট্যাটাস আপডেট হয়েছে", "Status updated"],
  status_fail: ["স্ট্যাটাস আপডেট হয়নি", "Status update failed"],
  copied: ["কপি হয়েছে: {id}", "Copied: {id}"],
  copy_fail: ["কপি করা যায়নি", "Copy failed"],
  popup_block: ["Popup block হয়েছে। Popup allow করুন।", "Popup was blocked. Allow popups and try again."],
  note_label: ["অর্ডারের নোট (শুধু admin দেখবে)", "Order note (admin only)"],
  note_save: ["💾 নোট সেভ করুন", "💾 Save note"],
  note_saved: ["নোট সেভ হয়েছে", "Note saved"],
  csv_empty: ["ডাউনলোড করার মতো অর্ডার নেই", "No orders to export"],

  inv_title: ["ইনভয়েস প্রিভিউ", "Invoice preview"],
  inv_print: ["🖨️ প্রিন্ট / PDF", "🖨️ Print / PDF"],
  inv_download: ["⬇️ ফাইল সেভ (HTML)", "⬇️ Save file (HTML)"],
  inv_back: ["← অর্ডারে ফিরুন", "← Back to order"],
  inv_kind: ["ডেলিভারি ইনভয়েস", "Delivery invoice"],
  inv_date: ["তারিখ", "Date"],
  inv_status: ["স্ট্যাটাস", "Status"],
  inv_bill_to: ["গ্রাহকের তথ্য", "Bill to"],
  inv_delivery: ["ডেলিভারি তথ্য", "Delivery details"],
  inv_payment: ["পেমেন্ট", "Payment"],
  inv_contact: ["যোগাযোগ", "Contact"],
  inv_col_no: ["#", "#"],
  inv_col_color: ["কালার", "Color"],
  inv_col_size: ["সাইজ", "Size"],
  inv_col_qty: ["পরিমাণ", "Qty"],
  inv_unit: ["একক দাম", "Unit price"],
  inv_amount: ["মোট দাম", "Amount"],
  inv_subtotal: ["পণ্যের দাম", "Subtotal"],
  inv_delivery_charge: ["ডেলিভারি চার্জ", "Delivery charge"],
  inv_grand: ["সর্বমোট", "Grand total"],
  inv_cod: ["ক্যাশ অন ডেলিভারি (COD)", "Cash on delivery (COD)"],
  inv_thanks: ["ধন্যবাদ আমাদের সাথে থাকার জন্য! ❤️", "Thank you for shopping with us! ❤️"],
  inv_product: ["প্রোডাক্ট", "Product"],
  save_pdf_hint: ["ফোনে প্রিন্ট না হলে ফাইল সেভ করে ব্রাউজারে খুলে শেয়ার/সেভ করুন।", "If printing is unavailable on your phone, save the file and open it in the browser to share or print."],

  prod_title: ["প্রোডাক্ট", "Product"],
  prod_sub: ["প্রোডাক্টের তথ্য, দাম, স্টক ও ছবি", "Product details, pricing, stock and images"],
  basic: ["মৌলিক তথ্য", "Basic info"],
  name_label: ["প্রোডাক্টের নাম", "Product name"],
  desc_label: ["বিবরণ", "Description"],
  trust_title: ["বিশ্বাসযোগ্যতার চিহ্ন (৩টি)", "Trust badges (3 items)"],
  trust_hint: ["ইমোজি, বাংলা ও ইংরেজি লেখা। লেখা খালি রাখলে সেই আইটেম দেখাবে না।", "Emoji, Bengali and English text. Leave the text empty to hide an item."],
  icon_label: ["ইমোজি", "Emoji"],
  prices: ["দাম ও স্টক", "Pricing & stock"],
  offer_price: ["অফার মূল্য (৳)", "Offer price (৳)"],
  old_price: ["আগের মূল্য (৳)", "Old price (৳)"],
  stock_label: ["স্টক সংখ্যা", "Stock quantity"],
  stock_moved: ["স্টক এখন ইনভেন্টরি ট্যাব থেকে সেট করুন", "Set stock from the Inventory tab"],
  variants: ["বৈচিত্র্য ও ডেলিভারি", "Variants & delivery"],
  colors_label: ["কালার (কমা দিয়ে)", "Colors (comma separated)"],
  sizes_label: ["সাইজ (কমা দিয়ে)", "Sizes (comma separated)"],
  in_fee: ["ঢাকার ভেতরে ডেলিভারি (৳)", "Inside Dhaka delivery (৳)"],
  out_fee: ["ঢাকার বাইরে ডেলিভারি (৳)", "Outside Dhaka delivery (৳)"],
  call_no: ["কল নাম্বার", "Call number"],
  wa_no: ["WhatsApp (88 সহ)", "WhatsApp (with 88)"],
  images: ["ছবি", "Images"],
  ratio_label: ["ছবির অনুপাত (ওয়েবসাইটে এই সাইজেই দেখাবে)", "Image ratio (shown on the website in this ratio)"],
  ratio_hint: ["নতুন ছবি আপলোডের সময় এই অনুপাতে কাটা হবে। আগের ছবি আবার আপলোড করলে নতুন অনুপাত কার্যকর হবে।", "New uploads are cropped to this ratio. Re-upload older images to apply a new ratio."],
  ratio_auto: ["আসল অনুপাত (কাটা হবে না)", "Original ratio (no crop)"],
  badge_label: ["ছাড় ব্যাজের অবস্থান", "Discount badge position"],
  pos_tl: ["উপর-বাম", "Top left"],
  pos_tr: ["উপর-ডান", "Top right"],
  pos_bl: ["নিচ-বাম", "Bottom left"],
  pos_br: ["নিচ-ডান", "Bottom right"],
  upload_images: ["ছবি আপলোড (সর্বোচ্চ ৮টি)", "Upload images (max 8)"],
  or_url: ["অথবা https:// ছবির লিংক", "Or an https:// image link"],
  add: ["যোগ করুন", "Add"],
  img_fail: ["ছবি লোড হয়নি: {name}", "Could not load image: {name}"],
  max_images: ["সর্বোচ্চ {n}টি ছবি", "Maximum {n} images"],
  need_image: ["অন্তত একটি ছবি যুক্ত করুন!", "Add at least one image!"],
  visible_label: ["ওয়েবসাইটে এই প্রোডাক্ট দেখাও", "Show this product on the website"],
  visible_hint: ["বন্ধ রাখলে ওয়েবসাইটে 'পাওয়া যাচ্ছে না' দেখাবে, অর্ডার নেওয়া যাবে না।", "When off, the website shows 'currently unavailable' and orders are blocked."],
  faq_section: ["সাধারণ প্রশ্ন ও উত্তর (FAQ)", "FAQ"],
  faq_add: ["➕ প্রশ্ন যোগ করুন", "➕ Add question"],
  faq_del: ["মুছুন", "Remove"],
  faq_max: ["সর্বোচ্চ {n}টি প্রশ্ন", "Maximum {n} questions"],
  faq_q_bn: ["প্রশ্ন (বাংলা)", "Question (Bengali)"],
  faq_q_en: ["প্রশ্ন (English)", "Question (English)"],
  faq_a_bn: ["উত্তর (বাংলা)", "Answer (Bengali)"],
  faq_a_en: ["উত্তর (English)", "Answer (English)"],

  nt_title: ["📢 বিশেষ নোটিস / বিজ্ঞপ্তি (FAQ-এর উপরে দেখাবে)", "📢 Special notices (shown above the FAQ)"],
  nt_hint: ["অফার, ঘোষণা বা যেকোনো বিশেষ তথ্য লিখুন। প্রতিটি নোটিসের লেখা, ফন্ট, সাইজ, রঙ, ছবি ও ব্যাকগ্রাউন্ড আলাদাভাবে বদলানো যাবে।", "Write offers, announcements or any special info. Each notice has its own text, font, size, colors, image and background."],
  nt_add: ["➕ নোটিস যোগ করুন", "➕ Add notice"],
  nt_max: ["সর্বোচ্চ {n}টি নোটিস", "Maximum {n} notices"],
  nt_empty: ["কোনো নোটিস নেই", "No notices"],
  nt_block: ["নোটিস {n}", "Notice {n}"],
  nt_del: ["মুছুন", "Remove"],
  nt_on: ["ওয়েবসাইটে দেখাও", "Show on website"],
  nt_head_bn: ["শিরোনাম (বাংলা)", "Heading (Bengali)"],
  nt_head_en: ["শিরোনাম (English)", "Heading (English)"],
  nt_body_bn: ["লেখা (বাংলা)", "Text (Bengali)"],
  nt_body_en: ["লেখা (English)", "Text (English)"],
  nt_font: ["ফন্ট", "Font"],
  nt_f_sans: ["সাধারণ (Sans)", "Sans"],
  nt_f_serif: ["সেরিফ (Serif)", "Serif"],
  nt_f_mono: ["মনোস্পেস (Mono)", "Mono"],
  nt_f_display: ["জোরালো (Display)", "Display"],
  nt_align: ["লেখার অবস্থান", "Alignment"],
  nt_head_size: ["শিরোনামের সাইজ (px)", "Heading size (px)"],
  nt_body_size: ["লেখার সাইজ (px)", "Text size (px)"],
  nt_head_color: ["শিরোনামের রঙ", "Heading color"],
  nt_body_color: ["লেখার রঙ", "Text color"],
  nt_bg: ["ব্যাকগ্রাউন্ড রঙ", "Background color"],
  nt_bg_none: ["ব্যাকগ্রাউন্ড নেই", "No background"],
  nt_bold: ["শিরোনাম মোটা (Bold)", "Bold heading"],
  nt_img: ["ছবি (ঐচ্ছিক)", "Image (optional)"],
  nt_img_file: ["ছবি আপলোড", "Upload image"],
  nt_img_url: ["অথবা https:// ছবির লিংক", "Or an https:// image link"],
  nt_img_remove: ["ছবি সরান", "Remove image"],
  nt_preview: ["প্রিভিউ", "Preview"],
  nt_too_big: ["ছবি অনেক বড়, ছোট ছবি দিন।", "Image is too large, use a smaller one."],

  bulk_title: ["📦 বাল্ক অফার (একসাথে বেশি নিলে ছাড়)", "📦 Bulk offer (discount for multiple items)"],
  bulk_hint_admin: ["চালু থাকলে এই পরিমাণ বা বেশি অর্ডারে অর্ডারের বিলে ছাড় স্বয়ংক্রিয়ভাবে যোগ হবে।", "When on, the discount is applied automatically to orders at or above this quantity."],
  bulk_enabled: ["বাল্ক অফার চালু", "Bulk offer on"],
  bulk_min: ["ন্যূনতম পরিমাণ", "Minimum quantity"],
  bulk_type: ["ছাড়ের ধরন", "Discount type"],
  bulk_pct: ["শতাংশ (%)", "Percent (%)"],
  bulk_fixed: ["নির্দিষ্ট টাকা (৳)", "Fixed amount (৳)"],
  bulk_value: ["ছাড়ের মান", "Discount value"],
  bulk_save: ["💾 বাল্ক অফার সেভ করুন", "💾 Save bulk offer"],
  bulk_saved: ["বাল্ক অফার সেভ হয়েছে", "Bulk offer saved"],
  off_title: ["অফার ও কুপন", "Offers & coupons"],
  off_sub: ["বাল্ক ছাড় ও কুপন কোড এখান থেকে নিয়ন্ত্রণ করুন", "Manage bulk discounts and coupon codes here"],
  cp_title: ["🎟️ কুপন তৈরি", "🎟️ Create coupon"],
  cp_hint: ["কুপন কোড দিলে অর্ডারের বিলে শতাংশ হারে ছাড় পড়বে। 'পুরস্কার কুপন' বাছাই করলে অর্ডার সফলের পর ধন্যবাদ পাতায় গ্রাহককে একটি নিজস্ব কোড দেখানো হবে।", "A coupon gives a percent discount on the bill. Choose a reward rule to show the customer a personal code on the thank-you page after an order."],
  cp_code: ["কুপন কোড", "Coupon code"],
  cp_gen: ["🎲 তৈরি", "🎲 Generate"],
  cp_percent: ["ছাড় (%)", "Discount (%)"],
  cp_max: ["সর্বোচ্চ কতবার (0 = সীমাহীন)", "Max uses (0 = unlimited)"],
  cp_expiry: ["মেয়াদ (দিন, খালি = মেয়াদহীন)", "Expiry (days, empty = none)"],
  cp_reward: ["পুরস্কার হিসেবে দেবে", "Give as reward"],
  cp_r_none: ["না (শুধু কোড হিসেবে)", "No (code only)"],
  cp_r_every: ["প্রতি অর্ডারে", "Every order"],
  cp_r_first: ["শুধু প্রথম অর্ডারে", "First order only"],
  cp_active: ["সক্রিয়", "Active"],
  cp_create: ["➕ কুপন তৈরি করুন", "➕ Create coupon"],
  cp_created: ["কুপন তৈরি হয়েছে", "Coupon created"],
  cp_list: ["কুপন তালিকা", "Coupon list"],
  cp_personal: ["গ্রাহকদের পুরস্কার কুপন", "Customer reward coupons"],
  cp_personal_hint: ["প্রতিটি অর্ডারের পর তৈরি হওয়া নিজস্ব কোড। প্রতিটি একবার ব্যবহারযোগ্য।", "Personal codes created after orders. Each can be used once."],
  cp_unlimited: ["সীমাহীন", "Unlimited"],
  cp_never: ["মেয়াদহীন", "No expiry"],
  cp_none: ["কোনো কুপন নেই", "No coupons yet"],
  cp_on: ["চালু", "On"],
  cp_off: ["বন্ধ", "Off"],
  cp_used: ["ব্যবহৃত", "Used"],
  cp_unused: ["অব্যবহৃত", "Unused"],
  cp_words: ["শব্দ (কমা দিয়ে, ইংরেজি অক্ষরে)", "Words (comma separated, English letters)"],
  cp_words_ph: ["যেমন: EID, SALE", "e.g. EID, SALE"],
  cp_suffix: ["এলোমেলো অংশের দৈর্ঘ্য", "Random part length"],
  cp_engine: ["কোড তৈরির ধরন", "Code style"],
  cp_eng_alnum: ["A-Z ও ০-৯ (সব)", "A-Z and 0-9 (all)"],
  cp_eng_readable: ["সহজে পড়া যায় এমন (০, ১, I, O বাদ)", "Easy to read (no 0, 1, I, O)"],
  cp_eng_letters: ["শুধু ইংরেজি অক্ষর", "Letters only"],
  cp_eng_digits: ["শুধু সংখ্যা", "Digits only"],
  cp_gen_custom: ["🎲 শব্দ ও ধরন অনুযায়ী তৈরি", "🎲 Generate from words & style"],
  cp_left_days: ["{d} দিন {h} ঘণ্টা বাকি", "{d}d {h}h left"],
  cp_left_hours: ["{h} ঘণ্টা {m} মিনিট বাকি", "{h}h {m}m left"],
  cp_left_min: ["{m} মিনিট বাকি", "{m} min left"],
  cp_expired: ["মেয়াদ শেষ", "Expired"],
  cp_history: ["📥 ইতিহাস (CSV)", "📥 History (CSV)"],
  cp_delete_step1: ["এই কুপনটি মুছতে চান? এটি ফেরত নেওয়া যাবে না:", "Delete this coupon? This cannot be undone:"],
  cp_delete_type: ["নিশ্চিত করতে কুপন কোডটি টাইপ করুন: {code}", "Type the coupon code to confirm: {code}"],
  cp_delete_mismatch: ["কোড মেলেনি, কুপন মোছা হয়নি", "Code does not match, coupon not deleted"],
  cp_templates: ["এখন সক্রিয় পুরস্কার নিয়ম: {n}টি। অর্ডার সফল হলে গ্রাহক নিজস্ব কোড পাবেন।", "Active reward rules: {n}. Customers get a personal code after a successful order."],
  cp_no_templates: ["এখন কোনো পুরস্কার নিয়ম সক্রিয় নেই। উপরে 'পুরস্কার হিসেবে দেবে' থেকে 'প্রতি অর্ডারে' বা 'শুধু প্রথম অর্ডারে' বেছে কুপন তৈরি করুন।", "No reward rule is active. Create a coupon above and choose 'Every order' or 'First order only' under 'Give as reward'."],
  notes_title: ["📝 ওয়েবসাইটের নোট", "📝 Website notes"],
  notes_bulk: ["বাল্ক অফার নোট (Quantity-র নিচে দেখাবে)", "Bulk offer note (shown below Quantity)"],
  notes_coupon: ["কুপন নোট (কুপন কোড-এর নিচে দেখাবে)", "Coupon note (shown below the coupon code)"],
  notes_bn: ["বাংলা", "Bengali"],
  notes_en: ["English", "English"],
  notes_save: ["💾 নোট সেভ করুন", "💾 Save notes"],
  notes_saved: ["নোট সেভ হয়েছে", "Notes saved"],
  notes_show: ["ওয়েবসাইটে দেখাও", "Show on website"],

  tb_title: ["🔔 ওয়েবসাইটের উপরের বারের লেখা", "🔔 Website top bar text"],
  tb_hint: ["লেখা, ফন্ট সাইজ, ডানে-বামে সরানো ও বারের উচ্চতা এখান থেকে বদলান। নতুন লাইনের জন্য Enter চাপুন।", "Change the text, font size, left/right position and bar height here. Press Enter for a new line."],
  tb_bn: ["লেখা (বাংলা)", "Text (Bengali)"],
  tb_en: ["লেখা (English)", "Text (English)"],
  tb_size: ["ফন্ট সাইজ (px)", "Font size (px)"],
  tb_align: ["লেখার অবস্থান", "Text alignment"],
  tb_left: ["বামে", "Left"],
  tb_center: ["মাঝে", "Center"],
  tb_right: ["ডানে", "Right"],
  tb_offset: ["ডানে/বামে সরান (px, − = বামে)", "Shift left/right (px, − = left)"],
  tb_pad: ["বারের উচ্চতা (উপর-নিচ ফাঁকা, px)", "Bar height (top/bottom padding, px)"],
  tb_reset: ["↺ ডিফল্টে ফিরুন", "↺ Reset to default"],
  tb_lang_show: ["ভাষা (EN/বাং) বাটন দেখাও", "Show language (EN/বাং) button"],
  site_lang_mode: ["ওয়েবসাইটের ভাষা", "Website language"],
  site_lang_auto: ["ভিজিটর নিজে ভাষা পরিবর্তন করতে পারবে", "Visitor can switch language"],
  site_lang_bn: ["সবসময় বাংলা দেখাও", "Always show Bengali"],
  site_lang_en: ["সবসময় English দেখাও", "Always show English"],
  tb_lang_size: ["ভাষা বাটনের ফন্ট সাইজ (px)", "Language button font size (px)"],
  tb_preview: ["প্রিভিউ", "Preview"],

  inv_title_h: ["ইনভেন্টরি (স্টক)", "Inventory (stock)"],
  inv_sub: ["কোন কালার ও সাইজের কতটি স্টক আছে", "Stock count for each color and size"],
  inv_color: ["কালার / সাইজ", "Color / size"],
  inv_total: ["মোট", "Total"],
  inv_single: ["মোট স্টক", "Total stock"],
  inv_save: ["💾 স্টক সেভ করুন", "💾 Save stock"],
  inv_saved: ["স্টক সেভ হয়েছে", "Stock saved"],
  inv_note: ["কম স্টক হলে হলুদ, শেষ হলে লাল। স্টক শেষ কালার/সাইজ ওয়েবসাইটে বন্ধ থাকবে।", "Low stock shows yellow, empty shows red. Out-of-stock colors/sizes are disabled on the website."],
  inv_add_title: ["➕ নতুন প্রোডাক্ট (কালার / সাইজ) যোগ করুন", "➕ Add new product (color / size)"],
  inv_add_hint: ["নতুন কালার বা সাইজ লিখলে সেটি প্রোডাক্টের তালিকায় যোগ হবে এবং ওয়েবসাইটে দেখাবে। আগে থেকে থাকা কালার/সাইজ লিখলে শুধু স্টক সেট হবে।", "A new color or size is added to the product and shown on the website. If it already exists, only its stock is set."],
  inv_add_color: ["কালার", "Color"],
  inv_add_size: ["সাইজ", "Size"],
  inv_add_qty: ["স্টক সংখ্যা", "Stock quantity"],
  inv_add_btn: ["➕ যোগ করুন", "➕ Add"],
  inv_added: ["প্রোডাক্ট যোগ হয়েছে", "Product added"],
  inv_add_need: ["কালার বা সাইজ অন্তত একটি লিখুন!", "Enter at least a color or a size!"],

  clock_saved: ["ঘড়ির সেটিং সেভ হয়েছে।", "Clock settings saved successfully."],
  clock_bad_date: ["সঠিক তারিখ ও সময় লিখুন।", "Please enter a valid date and time."],
  clock_manual_ok: ["ম্যানুয়াল তারিখ ও সময় চালু হয়েছে।", "Manual date and time applied."],
  clock_live_ok: ["সার্ভার-সিঙ্ক লাইভ সময় ফিরেছে।", "Live server-synced time restored."],
  clock_synced: ["সার্ভারের সময়ের সাথে মিল হয়েছে। বাংলাদেশ সময় UTC+6।", "Clock synced with server time. Bangladesh time is UTC+6."],
  clock_sync_fail: ["সার্ভারের সময় পাওয়া যায়নি, ডিভাইসের সময় দেখানো হচ্ছে।", "Server time sync unavailable. Showing device time with selected time zone."],
  id_saved: ["অর্ডার আইডি প্রিফিক্স সেভ হয়েছে", "Order ID prefix saved"],
  admins_title: ["অ্যাডমিন ব্যবস্থাপনা", "Admin management"],
  admins_sub: ["সব অ্যাডমিনের সমান অধিকার থাকবে", "All admins have equal access"],
  add_admin: ["নতুন অ্যাডমিন যোগ করুন", "Add a new admin"],
  pw_min8: ["পাসওয়ার্ড (৮+ অক্ষর)", "Password (8+ characters)"],
  add_admin_btn: ["➕ অ্যাডমিন যোগ করুন", "➕ Add admin"],
  admin_list: ["অ্যাডমিন তালিকা", "Admin list"],
  you: ["আপনি", "You"],
  joined: ["যোগ হয়েছে: ", "Joined: "],
  reset_pw: ["পাসওয়ার্ড রিসেট", "Reset password"],
  delete: ["ডিলিট", "Delete"],
  new_pw_prompt: ["নতুন পাসওয়ার্ড দিন (কমপক্ষে ৮ অক্ষর):", "Enter a new password (at least 8 characters):"],
  admin_added: ["নতুন অ্যাডমিন যোগ হয়েছে!", "New admin added!"],
  admin_add_fail: ["অ্যাডমিন যোগ হয়নি!", "Could not add admin!"],
  admin_deleted: ["অ্যাডমিন ডিলিট হয়েছে", "Admin deleted"],
  delete_admin_confirm: ["এই অ্যাডমিনকে ডিলিট করতে চান?", "Delete this admin?"],
  pw_reset_ok: ["পাসওয়ার্ড রিসেট হয়েছে", "Password reset"],
  failed: ["ব্যর্থ হয়েছে", "Failed"],
  no_admins: ["কোনো অ্যাডমিন নেই", "No admins"],

  logs_title: ["অ্যাক্টিভিটি লগ", "Activity log"],
  logs_sub: ["সাম্প্রতিক ২০০টি কার্যক্রম", "Latest 200 actions"],
  col_time: ["সময়", "Time"],
  col_user: ["ব্যবহারকারী", "User"],
  col_action: ["কার্যক্রম", "Action"],
  col_detail: ["বিবরণ", "Details"],
  col_ip: ["IP ঠিকানা", "IP address"],
  no_logs: ["এখনো কোনো লগ নেই", "No logs yet"],

  settings_title: ["সেটিংস", "Settings"],
  settings_sub: ["নিরাপত্তা ও অ্যাকাউন্ট", "Security & account"],
  pw_section: ["🔑 পাসওয়ার্ড পরিবর্তন", "🔑 Change password"],
  cur_pw: ["বর্তমান পাসওয়ার্ড", "Current password"],
  new_pw: ["নতুন পাসওয়ার্ড (৮+ অক্ষর)", "New password (8+ characters)"],
  repeat_pw: ["আবার লিখুন", "Repeat new password"],
  pw_mismatch: ["নতুন পাসওয়ার্ড দুটি মিলছে না!", "New passwords do not match!"],
  pw_changed: ["পাসওয়ার্ড বদলানো হয়েছে, আবার লগইন করুন।", "Password changed, please sign in again."],
  pw_fail: ["পাসওয়ার্ড বদলানো যায়নি!", "Could not change password!"],
  security: ["🛡️ নিরাপত্তা", "🛡️ Security"],
  logout_this: ["এই device থেকে logout", "Log out this device"],
  logout_this_d: ["শুধু এই ব্রাউজার/অ্যাপ থেকে বের হবে", "Signs out only this browser/app"],
  logout_all: ["সব device থেকে logout", "Log out all devices"],
  logout_all_d: ["আপনার অ্যাকাউন্টের সব সক্রিয় সেশন বন্ধ হবে", "Ends every active session on your account"],
  logout_all_btn: ["সব device থেকে logout", "Log out all"],
  logout_all_confirm: ["সব device থেকে logout হবে। নিশ্চিত?", "Log out of all devices? Are you sure?"],
  logged_out_all: ["সব device থেকে logout হয়েছে।", "Logged out of all devices."],
  refreshing: ["রিফ্রেশ হচ্ছে...", "Refreshing..."],
  refreshed: ["রিফ্রেশ হয়েছে", "Refreshed"],
  stock_low: ["কম স্টক", "Low stock"],
  stock_ok: ["পর্যাপ্ত", "In stock"],
  cancel: ["বাতিল", "Cancel"],
  ok: ["ঠিক আছে", "OK"],
  saving: ["সেভ হচ্ছে...", "Saving..."],
  saved_ok: ["✅ প্রোডাক্ট সফলভাবে আপডেট হয়েছে!", "✅ Product updated successfully!"],
  saved_toast: ["প্রোডাক্ট আপডেট হয়েছে", "Product updated"],
  save_all: ["💾 সব সেভ করুন", "💾 Save all"],
  refresh_btn: ["রিফ্রেশ", "Refresh"],
  un_title: ["ইউজারনেম বদলান", "Change username"],
  un_new: ["নতুন ইউজারনেম", "New username"],
  un_save: ["💾 ইউজারনেম বদলান", "💾 Change username"],
  un_done: ["ইউজারনেম বদলানো হয়েছে", "Username changed"],
  cred_title: ["নতুন অ্যাডমিনের তথ্য", "New admin credentials"],
  cred_note: ["এই পাসওয়ার্ড পরে আর দেখানো যাবে না। এখনই কপি করে নিরাপদ জায়গায় রাখুন।", "This password cannot be shown again later. Copy it now and store it safely."],
  pr_title: ["🖨️ প্রিন্টার সেটিংস", "🖨️ Printer settings"],
  pr_sub: ["ইনভয়েস ও POS রসিদের ডিজাইন, থিম ও প্রিন্ট সেটিং", "Invoice and POS receipt design, themes and print setup"],
  pr_invoice: ["ইনভয়েস", "Invoice"],
  pr_pos: ["POS রসিদ", "POS receipt"],
  pr_brand: ["ব্র্যান্ড নাম", "Brand name"],
  pr_tag: ["ট্যাগলাইন", "Tagline"],
  pr_contact: ["যোগাযোগ নাম্বার", "Contact number"],
  pr_logo: ["লোগো (ছবি)", "Logo image"],
  pr_logo_w: ["লোগোর প্রস্থ (px)", "Logo width (px)"],
  pr_logo_rm: ["লোগো সরান", "Remove logo"],
  pr_logo_big: ["লোগো ছবি অনেক বড়, ছোট ছবি দিন।", "Logo image is too large, use a smaller one."],
  pr_primary: ["প্রধান রঙ", "Primary color"],
  pr_text: ["লেখার রঙ", "Text color"],
  pr_bg: ["পটভূমির রঙ", "Background color"],
  pr_line: ["লাইনের রঙ", "Line color"],
  pr_header: ["উপরের রঙিন ব্যান্ড", "Colored header band"],
  pr_lines: ["ডিভাইডার লাইন দেখাও", "Show divider lines"],
  pr_base: ["মূল ফন্ট সাইজ (px)", "Base font size (px)"],
  pr_margin: ["মার্জিন (mm)", "Margin (mm)"],
  pr_page: ["পেজ সাইজ", "Page size"],
  pr_show: ["কী কী দেখাবে", "What to show"],
  pr_footer_bn: ["ফুটার (বাংলা)", "Footer (Bengali)"],
  pr_footer_en: ["ফুটার (English)", "Footer (English)"],
  pr_save: ["ডিজাইন সেভ করুন", "Save design"],
  pr_reset: ["সেভ করা ডিজাইনে ফিরুন", "Revert to saved"],
  pr_preview: ["লাইভ প্রিভিউ", "Live preview"],
  pr_saved: ["প্রিন্ট ডিজাইন সেভ হয়েছে", "Print design saved"],
  pr_print: ["🖨️ প্রিন্ট", "🖨️ Print"],
  pr_design: ["🎨 ডিজাইন", "🎨 Design"],
  act_pos: ["🧾 POS", "🧾 POS"],
  off_stat_active: ["সক্রিয় কুপন", "Active coupons"],
  off_stat_uses: ["কুপন ব্যবহার", "Coupon uses"],
  off_stat_cdisc: ["কুপনে মোট ছাড়", "Coupon discount given"],
  off_stat_bdisc: ["বাল্কে মোট ছাড়", "Bulk discount given"],
  cp_search: ["কুপন কোড খুঁজুন", "Search coupon code"],
  rw_search: ["রিওয়ার্ড কোড খুঁজুন", "Search reward code"],
  cp_f_all: ["সব", "All"],
  cp_f_active: ["সক্রিয়", "Active"],
  cp_f_inactive: ["বন্ধ", "Inactive"],
  cp_f_expired: ["মেয়াদ শেষ", "Expired"],
  cp_f_used: ["শেষ", "Used up"],
  cp_share: ["📣 শেয়ার", "📣 Share"],
  cp_share_txt: ["🎉 কুপন কোড: {code} — {p}% ছাড়!", "🎉 Coupon code: {code} — {p}% off!"],
  cp_share_done: ["শেয়ার টেক্সট কপি হয়েছে", "Share text copied"],
  cp_preset: ["দ্রুত শতাংশ", "Quick %"],
  rh_title: ["🎁 রিওয়ার্ড কুপনের ইতিহাস", "🎁 Reward coupon history"],
  rh_sub: ["কোন অর্ডার থেকে কোড এসেছে, কোন অর্ডারে ব্যবহার হয়েছে — সব এখানে", "Which order issued each code and which order used it"],
  rh_from: ["কোন অর্ডার থেকে", "Issued from"],
  rh_used_in: ["কোন অর্ডারে ব্যবহৃত", "Used in order"],
  rh_used_at: ["ব্যবহারের সময়", "Used at"],
  rh_status: ["অবস্থা", "Status"],
  rh_none: ["এখনো কোনো রিওয়ার্ড কুপন নেই", "No reward coupons yet"],
  rh_export: ["📥 CSV", "📥 CSV"],
  sec_head: ["🛡️ নিরাপত্তা ও অ্যাকাউন্ট", "🛡️ Security & account"],
  sec_sessions: ["আমার সক্রিয় সেশন", "My active sessions"],
  sec_fails: ["ব্যর্থ লগইন (২৪ ঘণ্টা)", "Failed logins (24h)"],
  sec_admins: ["মোট অ্যাডমিন", "Total admins"],
  sec_last: ["আগের লগইন", "Previous sign-in"],
  sec_user: ["লগইন আছেন: {u}", "Signed in as: {u}"],
  log_all: ["সব", "All"],
  log_sec: ["🛡️ Security", "🛡️ Security"],
  log_ord: ["অর্ডার", "Orders"],
  log_cat: ["প্রোডাক্ট ও অফার", "Products & offers"],
  log_fails: ["মোট ব্যর্থ লগইন চেষ্টা: {n}", "Failed sign-in attempts: {n}"],
  pr_adv: ["⚙️ অ্যাডভান্স সেটিং", "⚙️ Advanced settings"],
  pr_line_h: ["লাইনের উচ্চতা (%)", "Line height (%)"],
  pr_table: ["টেবিল স্টাইল", "Table style"],
  pr_tb_grid: ["গ্রিড (সব লাইন)", "Grid (all lines)"],
  pr_tb_plain: ["সাধারণ (শুধু নিচের লাইন)", "Plain (bottom lines only)"],
  pr_tb_zebra: ["জেব্রা (একান্তর রঙ)", "Zebra stripes"],
  pr_fw: ["লেখার মোটা ভাব", "Text weight"],
  pr_fw_n: ["সাধারণ", "Normal"],
  pr_fw_b: ["মাঝারি", "Medium"],
  pr_fw_x: ["গাঢ়", "Bold"],
  pr_halign: ["লেখার সারিবদ্ধতা", "Text alignment"],
  pr_radius: ["বক্সের কোণ (px)", "Box corner radius (px)"],
  pr_wm: ["ওয়াটারমার্ক লেখা", "Watermark text"],
  pr_upper: ["টেবিল হেডার বড় হাতের অক্ষরে", "Uppercase table headers"],
  pr_compact: ["ঘন (কম ফাঁকা) লেআউট", "Compact layout"],
  pr_items: ["আইটেম দেখানোর ধরন", "Item layout"],
  pr_it_table: ["টেবিল (কলামে)", "Table (columns)"],
  pr_it_stack: ["নাম আলাদা লাইনে (লম্বা নামের জন্য)", "Stacked (name on its own line)"],
  gv_title: ["🎁 Give way — পরবর্তী অর্ডারের কুপন", "🎁 Give way — next-order coupon"],
  gv_sub: ["সেটিং অনুযায়ী অর্ডারের পর কাস্টমারকে পরবর্তী অর্ডারের কুপন দেখানো হবে", "The next-order coupon is shown after an order according to the reward setting"],
  gv_code: ["কুপন কোড", "Coupon code"],
  gv_gen: ["🎲 কোড তৈরি ও সেভ", "🎲 Generate & save"],
  gv_pct: ["ছাড় (%)", "Discount (%)"],
  gv_save: ["💾 Give way সেভ করুন", "💾 Save give way"],
  gv_saved: ["Give way সেভ হয়েছে", "Give way saved"],
  gv_state_on: ["🟢 চালু (বন্ধ করতে ক্লিক)", "🟢 On (click to turn off)"],
  gv_state_off: ["⚪ বন্ধ (চালু করতে ক্লিক)", "⚪ Off (click to turn on)"],
  gv_toggled: ["Give way চালু/বন্ধ হয়েছে", "Give way turned on/off"],
  sa_title: ["🛡️ Security & account", "🛡️ Security & account"],
  gv_generated: ["কোড তৈরি হয়েছে", "Code generated"]
};

/** Dictionary JSON বানানো (script-এ নিরাপদে বসানোর জন্য '<' escape) */
export function buildDictJson(map) {
  const bn = {};
  const en = {};
  for (const k of Object.keys(map)) { bn[k] = map[k][0]; en[k] = map[k][1]; }
  return JSON.stringify({ bn, en }).replace(/</g, "\\u003c");
}

/* ============================================================
   Errors & responses
   ============================================================ */

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function json(data, status = 200) {
  return Response.json(data, { status });
}

export function fail(status, error) {
  return json({ error }, status);
}

export function secure(res, nonce) {
  const headers = new Headers(res.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Cross-Origin-Resource-Policy", "same-origin");
  headers.set("Cache-Control", "no-store");

  const type = headers.get("Content-Type") || "";
  if (type.includes("text/html")) {
    headers.set(
      "Content-Security-Policy",
      "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; " +
      `script-src 'nonce-${nonce}'; connect-src 'self'; frame-ancestors 'none'; ` +
      "base-uri 'none'; form-action 'self'; object-src 'none'"
    );
  } else {
    headers.set("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
  }
  return new Response(res.body, { status: res.status, headers });
}

/* ============================================================
   Generic helpers
   ============================================================ */

export function escHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

// দুই ভাষার লেখা: bn খালি থাকলে en, en খালি থাকলে bn দেখাবে
export function biHtml(bn, en) {
  return '<span class="l-bn">' + escHtml(bn || en) + '</span><span class="l-en">' + escHtml(en || bn) + '</span>';
}

export function toInt(value, fallback) {
  if (value === null || value === undefined || String(value).trim() === "") return fallback;
  const n = Math.trunc(Number(value));
  return Number.isFinite(n) ? n : fallback;
}

export function clampInt(value, min, max, fallback) {
  const n = toInt(value, fallback);
  return Math.max(min, Math.min(max, n));
}

export function splitList(str) {
  return String(str || "").split(",").map((s) => s.trim()).filter(Boolean);
}

export function bytesToHex(bytes) {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}

export function randomHex(bytes) {
  return bytesToHex(crypto.getRandomValues(new Uint8Array(bytes)));
}

export async function sha256Hex(text) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return bytesToHex(new Uint8Array(digest));
}

export async function hashPassword(password, saltHex) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: hexToBytes(saltHex), iterations: PBKDF2_ITER, hash: "SHA-256" },
    key, 256
  );
  return bytesToHex(new Uint8Array(bits));
}

export function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function readJson(request, limit = MAX_BODY_BYTES) {
  const type = request.headers.get("Content-Type") || "";
  if (!type.includes("application/json")) throw new HttpError(415, "Unsupported content type");
  const text = await request.text().catch(() => "");
  if (text.length > limit) throw new HttpError(413, "অনুরোধ অনেক বড়। ছবির সাইজ কমান।");
  try {
    return JSON.parse(text || "{}");
  } catch (e) {
    throw new HttpError(400, "Invalid request");
  }
}

export function getIp(request) {
  return request.headers.get("CF-Connecting-IP") || "unknown";
}

export function cleanImages(list) {
  if (!Array.isArray(list)) return [];
  return list
    .filter((s) => typeof s === "string")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isAllowedImage(s) {
  return /^https:\/\/[^\s"'<>]+$/i.test(s) ||
    /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(s);
}

export function parseArrayOr(raw, fallback) {
  if (raw === null || raw === undefined) return fallback;
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch (e) {
    return fallback;
  }
}

export function cleanTrust(list) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, MAX_TRUST).map((x) => ({
    icon: String(x?.icon ?? "").trim().slice(0, 8),
    bn: String(x?.bn ?? "").trim().slice(0, 120),
    en: String(x?.en ?? "").trim().slice(0, 120)
  })).filter((x) => x.bn || x.en);
}

export function cleanFaqs(list) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, MAX_FAQ).map((x) => ({
    qbn: String(x?.qbn ?? "").trim().slice(0, 300),
    qen: String(x?.qen ?? "").trim().slice(0, 300),
    abn: String(x?.abn ?? "").trim().slice(0, 1000),
    aen: String(x?.aen ?? "").trim().slice(0, 1000)
  })).filter((x) => (x.qbn || x.qen) && (x.abn || x.aen));
}

// নোটিস: শিরোনাম, লেখা, ফন্ট, সাইজ, রঙ, ব্যাকগ্রাউন্ড, ছবি — সব যাচাই করে
export function cleanNotices(list) {
  if (!Array.isArray(list)) return [];
  const str = (v, max) => String(v ?? "").trim().slice(0, max);
  return list.slice(0, MAX_NOTICES).map((x) => {
    const image = str(x?.image, 400 * 1024);
    return {
      on: x?.on !== false,
      head_bn: str(x?.head_bn, 160),
      head_en: str(x?.head_en, 160),
      body_bn: str(x?.body_bn, 1000),
      body_en: str(x?.body_en, 1000),
      image: isAllowedImage(image) ? image : "",
      font: Object.prototype.hasOwnProperty.call(NOTICE_FONT_CSS, x?.font) ? x.font : "sans",
      align: NOTICE_ALIGN.includes(x?.align) ? x.align : "left",
      head_size: clampInt(x?.head_size, 12, 40, 20),
      body_size: clampInt(x?.body_size, 10, 24, 15),
      head_color: HEX_RE.test(String(x?.head_color ?? "")) ? x.head_color : "#0f172a",
      body_color: HEX_RE.test(String(x?.body_color ?? "")) ? x.body_color : "#475569",
      bg: HEX_RE.test(String(x?.bg ?? "")) ? x.bg : "",
      bold: x?.bold !== false
    };
  }).filter((n) => n.head_bn || n.head_en || n.body_bn || n.body_en || n.image);
}

/* ============================================================
   Order public ID & search helpers
   ============================================================ */

export function defaultOrderIdPrefix() {
  return new Date().toLocaleString("en-US", { month: "short", timeZone: "Asia/Dhaka" })
    .replace(/[^A-Za-z]/g, "").toUpperCase();
}

export function newPublicId(prefix = "") {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  let s = "";
  for (const b of bytes) s += ID_ALPHABET[b % ID_ALPHABET.length];
  const safePrefix = String(prefix || defaultOrderIdPrefix()).trim().toUpperCase()
    .replace(/[^A-Z0-9]/g, "").slice(0, 10) || defaultOrderIdPrefix();
  return `${safePrefix}-${s.slice(0, 5)}-${s.slice(5)}`;
}

export function normalizeSearch(v) {
  return String(v || "").trim().replace(/^#/, "").toUpperCase().slice(0, 100);
}

export function digitsOnly(p) {
  return String(p || "").replace(/\D/g, "");
}

export function variantOf(v) {
  return !v || v === "N/A" ? "" : String(v);
}

export function parseLines(raw) {
  try {
    const arr = JSON.parse(raw || "[]");
    if (!Array.isArray(arr)) return [];
    return arr.map((x) => ({ color: String(x.color || ""), size: String(x.size || ""), qty: Number(x.qty) || 0 }));
  } catch (e) {
    return [];
  }
}

/* ============================================================
   Data encryption (AES-GCM) + blind index (HMAC)
   নাম, ফোন, ঠিকানা, নোট, IP — encrypted; খোঁজার জন্য HMAC index।
   ============================================================ */

export function b64Encode(bytes) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

export function b64Decode(str) {
  return Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
}

export async function derivedKeyBytes(env, purpose) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(purpose + "|" + env.DATA_KEY));
  return new Uint8Array(d);
}

export async function aesKey(env) {
  return crypto.subtle.importKey("raw", await derivedKeyBytes(env, "enc-v1"), "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function macKey(env) {
  return crypto.subtle.importKey("raw", await derivedKeyBytes(env, "idx-v1"),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}

export async function encryptField(env, text) {
  const v = String(text ?? "");
  if (!v) return "";
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await aesKey(env), new TextEncoder().encode(v)));
  return "v1:" + b64Encode(iv) + ":" + b64Encode(ct);
}

export async function decryptField(env, value) {
  const v = String(value ?? "");
  if (!v.startsWith("v1:")) return v;
  try {
    const [, ivB, ctB] = v.split(":");
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64Decode(ivB) }, await aesKey(env), b64Decode(ctB));
    return new TextDecoder().decode(pt);
  } catch (e) {
    return "[পড়া যাচ্ছে না]";
  }
}

export async function blindIndex(env, domain, text) {
  const data = new TextEncoder().encode(domain + ":" + String(text ?? "").trim().toLowerCase());
  const sig = await crypto.subtle.sign("HMAC", await macKey(env), data);
  return bytesToHex(new Uint8Array(sig));
}

// IP-এর index (rate-limit-এর জন্য); আসল IP encrypted অবস্থায় log-এ থাকে
export async function hashIp(env, ip) {
  return (await blindIndex(env, "ip", ip || "unknown")).slice(0, 32);
}

export async function encryptLegacyOrders(env) {
  const { results } = await env.DB.prepare(
    "SELECT id, customer_name, phone, address, note FROM orders WHERE enc_v IS NULL"
  ).all();
  for (const r of results || []) {
    const phone = digitsOnly(r.phone);
    await env.DB.prepare(
      "UPDATE orders SET customer_name = ?, phone = ?, address = ?, note = ?, phone_hash = ?, name_hash = ?, enc_v = '1' WHERE id = ?"
    ).bind(
      await encryptField(env, r.customer_name),
      await encryptField(env, r.phone),
      await encryptField(env, r.address),
      await encryptField(env, r.note),
      await blindIndex(env, "phone", phone),
      await blindIndex(env, "name", r.customer_name || ""),
      r.id
    ).run();
  }
}

/* ============================================================
   Schema & migrations
   ============================================================ */

export async function ensureSchema(env) {
  if (schemaReady) return;
  const db = env.DB;

  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS product (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      title TEXT,
      description TEXT,
      price INTEGER,
      old_price INTEGER,
      stock INTEGER,
      image TEXT,
      images TEXT DEFAULT '[]',
      colors TEXT DEFAULT '',
      sizes TEXT DEFAULT '',
      delivery_inside INTEGER DEFAULT 60,
      delivery_outside INTEGER DEFAULT 120,
      contact_phone TEXT DEFAULT '01700000000',
      whatsapp_number TEXT DEFAULT '8801700000000',
      admin_pass TEXT DEFAULT ''
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      public_id TEXT,
      customer_name TEXT,
      phone TEXT,
      address TEXT,
      selected_color TEXT DEFAULT '',
      selected_size TEXT DEFAULT '',
      delivery_area TEXT,
      delivery_charge INTEGER,
      quantity INTEGER,
      total INTEGER,
      status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS settings (
      k TEXT PRIMARY KEY,
      v TEXT
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS devices (
      token TEXT PRIMARY KEY,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor TEXT,
      action TEXT NOT NULL,
      target TEXT,
      ip TEXT,
      ip_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS inventory (
      color TEXT NOT NULL DEFAULT '',
      size TEXT NOT NULL DEFAULT '',
      qty INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (color, size)
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      percent INTEGER NOT NULL,
      max_uses INTEGER NOT NULL DEFAULT 0,
      uses INTEGER NOT NULL DEFAULT 0,
      expires_at TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      reward_rule TEXT NOT NULL DEFAULT 'none',
      valid_days INTEGER NOT NULL DEFAULT 30,
      is_personal INTEGER NOT NULL DEFAULT 0,
      owner_hash TEXT,
      template_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`)
  ]);

  // পুরোনো database-এ missing column যোগ (থাকলে error ignore)
  const alterQueries = [
    "ALTER TABLE product ADD COLUMN image TEXT",
    "ALTER TABLE product ADD COLUMN images TEXT DEFAULT '[]'",
    "ALTER TABLE product ADD COLUMN colors TEXT DEFAULT ''",
    "ALTER TABLE product ADD COLUMN sizes TEXT DEFAULT ''",
    "ALTER TABLE product ADD COLUMN delivery_inside INTEGER DEFAULT 60",
    "ALTER TABLE product ADD COLUMN delivery_outside INTEGER DEFAULT 120",
    "ALTER TABLE product ADD COLUMN contact_phone TEXT DEFAULT '01700000000'",
    "ALTER TABLE product ADD COLUMN whatsapp_number TEXT DEFAULT '8801700000000'",
    "ALTER TABLE product ADD COLUMN admin_pass TEXT DEFAULT ''",
    "ALTER TABLE product ADD COLUMN image_ratio TEXT DEFAULT 'auto'",
    "ALTER TABLE product ADD COLUMN badge_pos TEXT DEFAULT 'tl'",
    "ALTER TABLE product ADD COLUMN trust_items TEXT",
    "ALTER TABLE product ADD COLUMN faqs TEXT",
    "ALTER TABLE product ADD COLUMN notices TEXT DEFAULT '[]'",
    "ALTER TABLE product ADD COLUMN topbar_bn TEXT",
    "ALTER TABLE product ADD COLUMN topbar_en TEXT",
    "ALTER TABLE product ADD COLUMN topbar_size INTEGER",
    "ALTER TABLE product ADD COLUMN topbar_align TEXT",
    "ALTER TABLE product ADD COLUMN topbar_offset INTEGER",
    "ALTER TABLE product ADD COLUMN topbar_pad INTEGER",
    "ALTER TABLE product ADD COLUMN topbar_lang_show INTEGER DEFAULT 1",
    "ALTER TABLE product ADD COLUMN topbar_lang_size INTEGER DEFAULT 12",
    "ALTER TABLE product ADD COLUMN site_language TEXT DEFAULT 'auto'",
    "ALTER TABLE product ADD COLUMN is_active INTEGER DEFAULT 1",
    "ALTER TABLE product ADD COLUMN bulk_enabled INTEGER DEFAULT 0",
    "ALTER TABLE product ADD COLUMN bulk_min_qty INTEGER DEFAULT 2",
    "ALTER TABLE product ADD COLUMN bulk_type TEXT DEFAULT 'percent'",
    "ALTER TABLE product ADD COLUMN bulk_value INTEGER DEFAULT 5",
    "ALTER TABLE orders ADD COLUMN note TEXT DEFAULT ''",
    "ALTER TABLE orders ADD COLUMN public_id TEXT",
    "ALTER TABLE orders ADD COLUMN delivery_area TEXT DEFAULT 'ঢাকার ভেতরে'",
    "ALTER TABLE orders ADD COLUMN delivery_charge INTEGER DEFAULT 60",
    "ALTER TABLE orders ADD COLUMN selected_color TEXT DEFAULT ''",
    "ALTER TABLE orders ADD COLUMN selected_size TEXT DEFAULT ''",
    "ALTER TABLE orders ADD COLUMN status TEXT DEFAULT 'Pending'",
    "ALTER TABLE orders ADD COLUMN phone_hash TEXT",
    "ALTER TABLE orders ADD COLUMN name_hash TEXT",
    "ALTER TABLE orders ADD COLUMN enc_v TEXT",
    "ALTER TABLE orders ADD COLUMN subtotal INTEGER DEFAULT 0",
    "ALTER TABLE orders ADD COLUMN bulk_discount INTEGER DEFAULT 0",
    "ALTER TABLE orders ADD COLUMN coupon_discount INTEGER DEFAULT 0",
    "ALTER TABLE orders ADD COLUMN coupon_code TEXT DEFAULT ''",
    "ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT ''",
    "ALTER TABLE orders ADD COLUMN payment_received INTEGER DEFAULT 0",
    "ALTER TABLE orders ADD COLUMN lines_json TEXT DEFAULT ''",
    "ALTER TABLE audit_log ADD COLUMN ip_hash TEXT",
    "ALTER TABLE coupons ADD COLUMN issued_order TEXT"
  ];
  // কোন কলাম নেই তা একবার দেখে নেওয়া হয়, তারপর শুধু ঘাটতিগুলো যোগ হয় (প্রতি cold start-এ ৪০+ ALTER চালানো এড়াতে)
  let existingCols = null;
  try {
    existingCols = {};
    for (const table of ["product", "orders", "audit_log", "coupons"]) {
      const { results } = await db.prepare("SELECT name FROM pragma_table_info(?)").bind(table).all();
      existingCols[table] = new Set((results || []).map((r) => r.name));
    }
  } catch (e) {
    existingCols = null; // pragma পাওয়া না গেলে আগের মতো সব ALTER চালানো হবে
  }
  for (const q of alterQueries) {
    const m = q.match(/^ALTER TABLE (\w+) ADD COLUMN (\w+)/);
    if (existingCols && m && existingCols[m[1]] && existingCols[m[1]].has(m[2])) continue;
    try { await db.prepare(q).run(); } catch (e) { /* column আগে থেকেই আছে */ }
  }

  await db.batch([
    db.prepare("CREATE INDEX IF NOT EXISTS idx_audit_iphash ON audit_log (action, ip_hash, created_at)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_orders_phone_hash ON orders (phone_hash, created_at)")
  ]);

  await db.prepare(`INSERT OR IGNORE INTO product
    (id, title, description, price, old_price, stock, image, images, colors, sizes,
     delivery_inside, delivery_outside, contact_phone, whatsapp_number, admin_pass)
    VALUES (1, ?, ?, 1490, 2200, 15, ?, ?, ?, ?, 60, 120, '01700000000', '8801700000000', '')`
  ).bind(
    "প্রিমিয়াম স্মার্ট ওয়াচ ও ফ্যাশন কম্বো",
    "১০০% অরিজিনাল প্রোডাক্ট। সাথে পাচ্ছেন ৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি এবং সারাদেশে ক্যাশ অন ডেলিভারি সুবিধা।",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    '["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"]',
    "কালো, সিলভার, গোল্ডেন",
    "M, L, XL"
  ).run();

  const missing = await db.prepare("SELECT id FROM orders WHERE public_id IS NULL OR public_id = ''").all();
  for (const row of missing.results || []) {
    await db.prepare("UPDATE orders SET public_id = ? WHERE id = ?").bind(newPublicId(), row.id).run();
  }
  await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_public_id ON orders (public_id)").run();
  await encryptLegacyOrders(env);

  // Inventory migration: টেবিল খালি থাকলে বর্তমান স্টক থেকে শুরু
  const invCount = await db.prepare("SELECT COUNT(*) AS c FROM inventory").first();
  if (!invCount || invCount.c === 0) {
    const prod = await db.prepare("SELECT colors, sizes, stock FROM product WHERE id = 1").first();
    const cl = prod ? splitList(prod.colors) : [];
    const sl = prod ? splitList(prod.sizes) : [];
    if (cl.length === 0 && sl.length === 0) {
      await db.prepare("INSERT OR IGNORE INTO inventory (color, size, qty) VALUES ('', '', ?)")
        .bind(Math.max(0, Number(prod && prod.stock) || 0)).run();
    } else {
      await syncInventory(db, cl, sl);
    }
    await syncTotal(db);
  }

  // Admin reset (একবারই)। আগের migration-এর চিহ্ন থাকলে admin মুছবে না।
  const done = await db.prepare(
    "SELECT k FROM settings WHERE k IN ('admin_reset_v2', 'schema_version')"
  ).all();
  const da = defaultAdmin(env);
  if ((!done.results || done.results.length === 0) && da.user && da.pass) {
    const salt = randomHex(16);
    const hash = await hashPassword(da.pass, salt);
    await db.batch([
      db.prepare("DELETE FROM sessions"),
      db.prepare("DELETE FROM admin_users"),
      db.prepare("INSERT INTO admin_users (username, password_hash, salt, role) VALUES (?, ?, ?, 'admin')")
        .bind(da.user.toLowerCase(), hash, salt),
      db.prepare("INSERT OR REPLACE INTO settings (k, v) VALUES ('admin_reset_v2', '1')")
    ]);
  }

  schemaReady = true;
}

/* ============================================================
   Audit log  (IP: encrypted, খোঁজার জন্য ip_hash)
   ============================================================ */

export async function audit(env, actor, action, target, rawIp) {
  try {
    const ipHash = await hashIp(env, rawIp);
    const ipEnc = await encryptField(env, rawIp || "unknown");
    await env.DB.prepare(
      "INSERT INTO audit_log (actor, action, target, ip, ip_hash) VALUES (?, ?, ?, ?, ?)"
    ).bind(
      String(actor || "").slice(0, 40),
      action,
      String(target || "").slice(0, 200),
      ipEnc,
      ipHash
    ).run();
  } catch (e) {
    console.error("audit failed", e);
  }
}

/* ============================================================
   Session / Authorization
   ============================================================ */

export async function getSession(request, env) {
  const auth = request.headers.get("Authorization") || "";
  const m = auth.match(/^Bearer\s+([a-f0-9]{64})$/i);
  if (!m) return null;

  const tokenHash = await sha256Hex(m[1].toLowerCase());
  const row = await env.DB.prepare(
    `SELECT u.id, u.username, s.expires_at
     FROM sessions s JOIN admin_users u ON u.id = s.user_id
     WHERE s.token_hash = ?`
  ).bind(tokenHash).first();

  if (!row) return null;
  if (row.expires_at < Date.now()) {
    await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
    return null;
  }
  return { id: row.id, username: row.username, tokenHash };
}

export async function authorize(request, env) {
  const session = await getSession(request, env);
  if (!session) throw new HttpError(401, "লগইন করুন!");
  return session;
}

export async function createSession(env, userId) {
  const token = randomHex(32);
  const tokenHash = await sha256Hex(token);
  await env.DB.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(Date.now()).run();
  await env.DB.prepare(
    "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)"
  ).bind(tokenHash, userId, Date.now() + SESSION_TTL_MS).run();
  return token;
}

// ডিফল্ট পাসওয়ার্ড এখনো ব্যবহার হচ্ছে কিনা (reload-এর পরেও সঠিক দেখাবে)
export async function isDefaultPassword(env, user) {
  const da = defaultAdmin(env);
  if (!da.pass || !user) return false;
  return safeEqual(await hashPassword(da.pass, user.salt), user.password_hash);
}

/* ============================================================
   Product
   ============================================================ */

export async function getProductRow(db) {
  return db.prepare(
    `SELECT id, title, description, price, old_price, stock, image, images,
      colors, sizes, delivery_inside, delivery_outside, contact_phone, whatsapp_number,
      image_ratio, badge_pos, trust_items, faqs, notices,
      topbar_bn, topbar_en, topbar_size, topbar_align, topbar_offset, topbar_pad,
      topbar_lang_show, topbar_lang_size, site_language, is_active,
      bulk_enabled, bulk_min_qty, bulk_type, bulk_value
     FROM product WHERE id = 1`
  ).first();
}

/** Website ও admin-এর জন্য সাফ করা product object */
export function productView(p) {
  if (!p) return null;
  let images = [];
  try { images = JSON.parse(p.images || "[]"); } catch (e) { images = []; }
  if (!Array.isArray(images)) images = [];
  images = images.filter((s) => typeof s === "string" && isAllowedImage(s));
  if (!images.length && p.image && isAllowedImage(p.image)) images = [p.image];

  return {
    id: p.id,
    title: p.title || "",
    description: p.description || "",
    price: p.price,
    old_price: p.old_price,
    stock: p.stock,
    images,
    image: images[0] || "",
    colors: p.colors || "",
    sizes: p.sizes || "",
    delivery_inside: p.delivery_inside,
    delivery_outside: p.delivery_outside,
    contact_phone: p.contact_phone || "",
    whatsapp_number: p.whatsapp_number || "",
    image_ratio: RATIOS.includes(p.image_ratio) ? p.image_ratio : "auto",
    badge_pos: BADGE_POS.includes(p.badge_pos) ? p.badge_pos : "tl",
    trust: cleanTrust(parseArrayOr(p.trust_items, DEFAULT_TRUST)),
    faqs: cleanFaqs(parseArrayOr(p.faqs, DEFAULT_FAQS)),
    notices: cleanNotices(parseArrayOr(p.notices, [])),
    topbar: {
      bn: p.topbar_bn || LANDING_STRINGS.topbar[0],
      en: p.topbar_en || LANDING_STRINGS.topbar[1],
      size: clampInt(p.topbar_size, 9, 32, 13),
      align: TOPBAR_ALIGN.includes(p.topbar_align) ? p.topbar_align : "center",
      offset: clampInt(p.topbar_offset, -120, 120, 0),
      pad: clampInt(p.topbar_pad, 0, 40, 10),
      langShow: p.topbar_lang_show == null ? true : Number(p.topbar_lang_show) !== 0,
      langSize: clampInt(p.topbar_lang_size, 8, 28, 12)
    },
    siteLanguage: ["bn", "en"].includes(p.site_language) ? p.site_language : "auto",
    active: Number(p.is_active) !== 0
  };
}

/* ============================================================
   Inventory (রঙ × সাইজ ভিত্তিক স্টক)
   ============================================================ */

export function syncTotalStmt(db) {
  return db.prepare("UPDATE product SET stock = (SELECT COALESCE(SUM(qty), 0) FROM inventory) WHERE id = 1");
}

export async function syncTotal(db) {
  await syncTotalStmt(db).run();
}

export async function syncInventory(db, colors, sizes) {
  const cs = colors.length ? colors : [""];
  const ss = sizes.length ? sizes : [""];
  const keep = new Set();
  const stmts = [];
  for (const c of cs) {
    for (const s of ss) {
      keep.add(c + "|" + s);
      stmts.push(db.prepare("INSERT OR IGNORE INTO inventory (color, size, qty) VALUES (?, ?, 0)").bind(c, s));
    }
  }
  const { results } = await db.prepare("SELECT color, size FROM inventory").all();
  for (const r of results || []) {
    if (!keep.has(r.color + "|" + r.size)) {
      stmts.push(db.prepare("DELETE FROM inventory WHERE color = ? AND size = ?").bind(r.color, r.size));
    }
  }
  stmts.push(syncTotalStmt(db));
  await db.batch(stmts);
}

export async function takeStock(db, color, size, qty) {
  const r = await db.prepare(
    "UPDATE inventory SET qty = qty - ? WHERE color = ? AND size = ? AND qty >= ?"
  ).bind(qty, color, size, qty).run();
  return !!(r.meta && r.meta.changes > 0);
}

export function addStockStmt(db, color, size, qty) {
  return db.prepare("UPDATE inventory SET qty = qty + ? WHERE color = ? AND size = ?").bind(qty, color, size);
}

export async function getInventory(db) {
  const { results } = await db.prepare("SELECT color, size, qty FROM inventory").all();
  return results || [];
}

// অর্ডারের প্রতিটি কালার/সাইজ লাইন (বাতিল বা ডিলিটে স্টক ঠিকভাবে ফেরাতে)
export async function getOrderLines(env, id, qtyFallback) {
  const r = await env.DB.prepare(
    "SELECT selected_color AS c, selected_size AS s, lines_json AS lj FROM orders WHERE id = ?"
  ).bind(id).first();
  const lines = parseLines(r && r.lj);
  if (lines.length) return lines;
  return [{ color: variantOf(r && r.c), size: variantOf(r && r.s), qty: Number(qtyFallback) || 0 }];
}

/* ============================================================
   Orders: search, pagination, stats
   ============================================================ */

export const ORDER_COLS = `public_id, customer_name, phone, address, selected_color, selected_size,
  delivery_area, delivery_charge, quantity, total, status, created_at, note, subtotal,
  bulk_discount, coupon_discount, coupon_code, lines_json, payment_method, payment_received`;

export async function searchOrders(env, opts) {
  const db = env.DB;
  const raw = String(opts.q || "").trim().replace(/^#/, "").slice(0, 100);
  const where = [];
  const binds = [];

  if (raw) {
    const upper = raw.toUpperCase();
    if (/^[A-Z][A-Z0-9]{0,9}-/.test(upper) || (/^[0-9]{1,10}-/.test(upper) && (upper.match(/-/g) || []).length >= 2)) {
      // অর্ডার আইডি (PREFIX-...) — ফোন নাম্বারের dash এখানে পড়বে না
      where.push("instr(public_id, ?) > 0");
      binds.push(upper);
    } else if (/^[\d+\s-]+$/.test(raw) && digitsOnly(raw).length >= 5) {
      where.push("phone_hash = ?");
      binds.push(await blindIndex(env, "phone", digitsOnly(raw)));
    } else {
      where.push("name_hash = ?");
      binds.push(await blindIndex(env, "name", raw));
    }
  }
  if (STATUSES.includes(opts.status)) {
    where.push("status = ?");
    binds.push(opts.status);
  }
  if (opts.range === "today") {
    where.push("date(created_at, '+6 hours') = date('now', '+6 hours')");
  } else if (opts.range === "7d") {
    where.push("created_at >= datetime('now', '-7 days')");
  }

  const offset = Math.max(0, Math.min(100000, toInt(opts.offset, 0)));
  const sql = `SELECT ${ORDER_COLS} FROM orders` +
    (where.length ? " WHERE " + where.join(" AND ") : "") +
    " ORDER BY id DESC LIMIT ? OFFSET ?";
  binds.push(PAGE_SIZE + 1, offset);

  const { results } = await db.prepare(sql).bind(...binds).all();
  const list = results || [];
  const page = list.slice(0, PAGE_SIZE);
  for (const o of page) {
    o.customer_name = await decryptField(env, o.customer_name);
    o.phone = await decryptField(env, o.phone);
    o.address = await decryptField(env, o.address);
    o.note = await decryptField(env, o.note);
    o.lines = parseLines(o.lines_json);
    delete o.lines_json;
  }
  return { orders: page, hasMore: list.length > PAGE_SIZE };
}

export async function getStats(db) {
  return db.prepare(`SELECT
      COUNT(*) AS total,
      COALESCE(SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END), 0) AS pending,
      COALESCE(SUM(CASE WHEN status = 'Confirmed' THEN 1 ELSE 0 END), 0) AS confirmed,
      COALESCE(SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END), 0) AS delivered,
      COALESCE(SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END), 0) AS cancelled,
      COALESCE(SUM(CASE WHEN status = 'Delivered' THEN total ELSE 0 END), 0) AS delivered_revenue,
      COALESCE(SUM(CASE WHEN date(created_at, '+6 hours') = date('now', '+6 hours') THEN 1 ELSE 0 END), 0) AS today
    FROM orders`).first();
}

/* ============================================================
   FCM push
   ============================================================ */

export function b64urlBytes(bytes) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function b64url(text) {
  return b64urlBytes(new TextEncoder().encode(text));
}

let fcmTokenCache = { token: "", exp: 0 };

export async function getGoogleAccessToken(env) {
  if (fcmTokenCache.token && Date.now() < fcmTokenCache.exp - 5 * 60 * 1000) return fcmTokenCache.token;
  const sa = JSON.parse(env.FCM_SERVICE_ACCOUNT);
  const now = Math.floor(Date.now() / 1000);
  const unsigned = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" })) + "." +
    b64url(JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600
    }));
  const pem = sa.private_key.replace(/-----[^-]+-----/g, "").replace(/\s/g, "");
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned));
  const assertion = unsigned + "." + b64urlBytes(new Uint8Array(sig));

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion })
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("FCM token error");
  fcmTokenCache = { token: data.access_token, exp: Date.now() + (Number(data.expires_in) || 3600) * 1000 };
  return data.access_token;
}

export async function notifyNewOrder(env, order) {
  const { results } = await env.DB.prepare("SELECT token FROM devices").all();
  if (!results || results.length === 0) return;
  const access = await getGoogleAccessToken(env);
  const url = `https://fcm.googleapis.com/v1/projects/${env.FCM_PROJECT_ID}/messages:send`;
  await Promise.all(results.map(async (d) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${access}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: {
          token: d.token,
          notification: { title: "🛒 নতুন অর্ডার!", body: `${order.publicId} - ${order.name} - ৳${order.total}` },
          data: { orderId: order.publicId },
          android: { priority: "HIGH", notification: { channel_id: "orders", sound: "default" } }
        }
      })
    });
    if (res.status === 404 || res.status === 400) {
      await env.DB.prepare("DELETE FROM devices WHERE token = ?").bind(d.token).run();
    }
  }));
}

/* ============================================================
   Pricing, bulk offer, coupons, rewards
   ============================================================ */

export function randomCode(n) {
  const bytes = crypto.getRandomValues(new Uint8Array(n));
  let s = "";
  for (const b of bytes) s += ID_ALPHABET[b % ID_ALPHABET.length];
  return s;
}

export function bulkDiscount(p, qty, subtotal) {
  if (!Number(p.bulk_enabled)) return 0;
  const min = Math.max(2, Number(p.bulk_min_qty) || 2);
  if (qty < min) return 0;
  const v = Math.max(0, Number(p.bulk_value) || 0);
  const d = p.bulk_type === "fixed" ? Math.round(v) : Math.round(subtotal * Math.min(100, v) / 100);
  return Math.max(0, Math.min(subtotal, d));
}

// কুপন যাচাই: { row, error }
export async function checkCoupon(env, codeRaw, phoneDigits) {
  const code = String(codeRaw || "").trim().toUpperCase().replace(/\s+/g, "").slice(0, 40);
  if (!code) return { row: null, error: "" };
  const c = await env.DB.prepare("SELECT * FROM coupons WHERE code = ?").bind(code).first();
  if (!c) return { row: null, error: "কুপন কোডটি সঠিক নয়।" };
  if (!Number(c.active)) return { row: null, error: "এই কুপনটি এখন সক্রিয় নেই।" };
  if (c.expires_at && new Date(c.expires_at).getTime() < Date.now()) {
    return { row: null, error: "কুপনের মেয়াদ শেষ হয়ে গেছে।" };
  }
  if (Number(c.max_uses) > 0 && Number(c.uses) >= Number(c.max_uses)) {
    return { row: null, error: "এই কুপনটি ইতিমধ্যে ব্যবহার হয়ে গেছে।" };
  }
  if (Number(c.is_personal) && phoneDigits && c.owner_hash !== (await blindIndex(env, "phone", phoneDigits))) {
    return { row: null, error: "এই কুপনটি অন্য নাম্বারের জন্য।" };
  }
  return { row: c, error: "" };
}

export async function computeQuote(env, p, qty, area, codeRaw, phoneDigits) {
  const price = Number(p.price) || 0;
  const subtotal = price * qty;
  const bulk = bulkDiscount(p, qty, subtotal);
  const afterBulk = subtotal - bulk;
  const delivery = area === "outside" ? Number(p.delivery_outside ?? 120)
    : area === "inside" ? Number(p.delivery_inside ?? 60) : 0;

  const chk = await checkCoupon(env, codeRaw, phoneDigits);
  let coupon = null;
  let couponPending = false;
  const couponError = chk.error || "";
  if (!couponError && chk.row) {
    if (Number(chk.row.is_personal) && !phoneDigits) {
      couponPending = true;
    } else {
      const amount = Math.round(afterBulk * Number(chk.row.percent) / 100);
      coupon = { code: chk.row.code, percent: Number(chk.row.percent), amount };
    }
  }
  const total = afterBulk - (coupon ? coupon.amount : 0) + delivery;
  return {
    quantity: qty,
    subtotal,
    bulk,
    coupon,
    couponError,
    couponPending,
    delivery,
    deliveryKnown: !!area,
    total,
    bulkInfo: {
      enabled: !!Number(p.bulk_enabled),
      min: Math.max(2, Number(p.bulk_min_qty) || 2),
      type: p.bulk_type === "fixed" ? "fixed" : "percent",
      value: Number(p.bulk_value) || 0
    }
  };
}

// অর্ডার সফল হলে পুরস্কার কুপন নিয়ম থাকলে গ্রাহকের জন্য একটি নিজস্ব কোড
export async function issueReward(env, phoneIdx, isFirst, orderId) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM coupons WHERE is_personal = 0 AND active = 1 AND reward_rule != 'none' ORDER BY id"
  ).all();
  const tpl = (results || []).find((c) => c.reward_rule === "every" || (c.reward_rule === "first" && isFirst));
  if (!tpl) return null;
  const code = "TY" + randomCode(6);
  const expires = new Date(Date.now() + COUPON_REWARD_DAYS * 86400000).toISOString();
  await env.DB.prepare(
    "INSERT INTO coupons (code, percent, max_uses, uses, expires_at, active, reward_rule, valid_days, is_personal, owner_hash, template_id, issued_order) VALUES (?, ?, 1, 0, ?, 1, 'none', ?, 1, ?, ?, ?)"
  ).bind(code, Number(tpl.percent), expires, COUPON_REWARD_DAYS, phoneIdx, tpl.id, orderId || null).run();
  return { code, percent: Number(tpl.percent), days: COUPON_REWARD_DAYS };
}

export async function getNotes(db) {
  const { results } = await db.prepare("SELECT k, v FROM settings WHERE k LIKE 'note\\_%' ESCAPE '\\'").all();
  const out = {};
  for (const r of results || []) out[r.k] = r.v || "";
  return out;
}
