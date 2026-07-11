// ─────────────────────────────────────────────────────────
// Out & About — Frontend Backend Integration v2
// Full Supabase + API connectivity for the production app
// ─────────────────────────────────────────────────────────
(function () {
  'use strict';

  var SUPABASE_URL = "https://mdleurcenwmmenvkwjhl.supabase.co";
  var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kbGV1cmNlbndtbWVudmt3amhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMzg0ODcsImV4cCI6MjA5MzgxNDQ4N30.CDc-W22vm3xQX5dj7JbnbGJS7z4c8MeO3NfkUu5hEpY";
  var API_BASE = "/outandabout-api";
  var STORAGE_BUCKET = "deal-photos";

  // ── Supabase Client ──
  var _sb = null;
  if (typeof supabase !== "undefined") {
    _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  // ── Raw Supabase REST ──
  function sbFetch(path, opts) {
    opts = opts || {};
    var h = {
      apikey: SUPABASE_ANON_KEY,
      Authorization: "Bearer " + SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    };
    if (opts.headers) {
      for (var k in opts.headers) { h[k] = opts.headers[k]; }
    }
    var newOpts = {};
    for (var k2 in opts) { if (k2 !== "headers") newOpts[k2] = opts[k2]; }
    newOpts.headers = h;
    return fetch(SUPABASE_URL + path, newOpts).then(function (r) {
      if (!r.ok) throw r;
      return r.json();
    });
  }

  // ── API helpers ──
  function apiFetch(path) {
    return fetch(API_BASE + path).then(function (r) { return r.json(); });
  }
  function apiPost(path, body) {
    return fetch(API_BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(function (r) { return r.json(); });
  }

  // ── Emoji / color helpers ──
  var _catEm = {
    coffee: "☕", food: "🍕", barber: "✂️", beauty: "💆",
    retail: "👟", bar: "🍺", fitness: "💪", other: "🛍️",
    restaurant: "🍽️", cafe: "☕", bakery: "🥐", pizzeria: "🍕"
  };
  var _tl = {
    flash_sale: "Flash Sale", end_of_day: "End of Day",
    happy_hour: "Happy Hour", ongoing: "Ongoing", today_only: "Today Only"
  };
  var _colors = [
    "#1a0f00","#0a1a0a","#0d0d1a","#1a0a0a","#0a0d1a",
    "#0d1a0a","#1a1a0a","#1a0a0a","#0a0a1a","#1a0d00",
    "#0f0a1a","#1a0d0d","#0d1a0a"
  ];
  function _hashBg(id) {
    if (!id) return _colors[0];
    var n = 0, str = String(id);
    for (var i = 0; i < str.length; i++) n = (n * 31 + str.charCodeAt(i)) | 0;
    return _colors[Math.abs(n) % _colors.length];
  }
  function _ts(end) {
    if (!end) return 86400;
    var ms = new Date(end).getTime() - Date.now();
    return ms > 0 ? Math.floor(ms / 1000) : 0;
  }
  function _pl(d) {
    if (d.discount_price && Number(d.discount_price) > 0) return "\u00a3" + Number(d.discount_price).toFixed(2);
    if (d.discount_percent && Number(d.discount_percent) > 0) return Number(d.discount_percent) + "% OFF";
    if (d.original_price && Number(d.original_price) > 0 && (!d.discount_price || d.discount_price === 0) && !d.discount_percent) return "FREE";
    if (d.price && Number(d.price) > 0) return "\u00a3" + Number(d.price).toFixed(2);
    return "\u00a30.00";
  }
  function _urg(end) {
    var s = _ts(end);
    if (s < 3600) return "high";
    if (s < 14400) return "medium";
    return "low";
  }
  function _dist(lat, lng, name) {
    // Use browser geolocation for real distance
    if (window._userLat != null && window._userLng != null && lat != null && lng != null) {
      var R = 3959;
      var dLat = (lat - window._userLat) * Math.PI / 180;
      var dLng = (lng - window._userLng) * Math.PI / 180;
      var a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(window._userLat*Math.PI/180)*Math.cos(lat*Math.PI/180)*Math.sin(dLng/2)*Math.sin(dLng/2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      var mi = R * c;
      if (mi < 0.1) return "📍 " + Math.round(mi * 5280) + "ft";
      return "📍 " + mi.toFixed(1) + "mi";
    }
    return "📍 0.3mi";
  }

  // ── Get current user id from Supabase session ──
  function _userId() {
    if (!_sb) return null;
    var sess = _sb.auth.session();
    return sess ? sess.user.id : null;
  }

  // ── Current user email ──
  function _userEmail() {
    if (!_sb) return null;
    var sess = _sb.auth.session();
    return sess ? sess.user.email : null;
  }

  // ── Current store_id for shop owners ──
  function _myStoreId() {
    if (!_sb) return null;
    var sess = _sb.auth.session();
    if (!sess) return null;
    var meta = sess.user.user_metadata || {};
    return meta.store_id || null;
  }

  // ── Resolve store_id from session or stored value ──
  function _getStoreId() {
    return _myStoreId() || window._storeOwnerStoreId || null;
  }

  // ══════════════════════════════════════════════════════
  // 1. BROWSER GEOLOCATION
  // ══════════════════════════════════════════════════════
  function initGeolocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        window._userLat = pos.coords.latitude;
        window._userLng = pos.coords.longitude;
      },
      function () { /* silently fall back to default distance */ }
    );
  }

  // ══════════════════════════════════════════════════════
  // 2. FAVOURITES — PERSISTED TO SUPABASE
  // ══════════════════════════════════════════════════════
  var _favsLoaded = false;

  async function loadFavourites() {
    if (!_sb) return;
    var uid = _userId();
    if (!uid) return;
    try {
      var data = await sbFetch("/rest/v1/favourites?user_id=eq." + uid + "&select=deal_id");
      if (data && data.length) {
        window.savedDeals = new Set(data.map(function (f) { return f.deal_id; }));
      }
      _favsLoaded = true;
    } catch (e) {
      console.warn("[Backend] Favs load:", e);
    }
  }

  async function toggleFavBackend(dealId) {
    if (!_sb) return;
    var uid = _userId();
    if (!uid) {
      if (window.toast) window.toast("Sign in to save deals");
      return;
    }
    try {
      if (window.savedDeals.has(dealId)) {
        // Remove
        await sbFetch("/rest/v1/favourites?user_id=eq." + uid + "&deal_id=eq." + dealId, { method: "DELETE" });
        window.savedDeals.delete(dealId);
      } else {
        // Add
        await sbFetch("/rest/v1/favourites", {
          method: "POST",
          body: JSON.stringify({ user_id: uid, deal_id: dealId })
        });
        window.savedDeals.add(dealId);
      }
    } catch (e) {
      console.warn("[Backend] Fav toggle:", e);
      // Fallback to local
      window.savedDeals.has(dealId) ? window.savedDeals.delete(dealId) : window.savedDeals.add(dealId);
    }
  }

  // ══════════════════════════════════════════════════════
  // 3. DEAL VIEWS — RECORD REAL VIEWS
  // ══════════════════════════════════════════════════════
  function recordDealView(dealDbId) {
    if (!_sb) return;
    var uid = _userId();
    apiPost("/record-view", { deal_id: dealDbId, device_id: uid || "anon_" + Math.random().toString(36).substr(2,9) });
  }

  // ══════════════════════════════════════════════════════
  // 4. PHOTO UPLOAD TO SUPABASE STORAGE
  // ══════════════════════════════════════════════════════
  async function uploadPhotoToSupabase(base64Data, fileName) {
    if (!_sb) return null;
    try {
      // Convert base64 to blob
      var byteStr = atob(base64Data.split(",")[1] || base64Data);
      var mime = (base64Data.match(/^data:(.*?);/) || ["","image/jpeg"])[1];
      var ab = new ArrayBuffer(byteStr.length);
      var ia = new Uint8Array(ab);
      for (var i = 0; i < byteStr.length; i++) ia[i] = byteStr.charCodeAt(i);
      var blob = new Blob([ab], { type: mime });
      var uid = _userId() || "anon";
      var path = uid + "/" + fileName + "_" + Date.now();

      var res = await _sb.storage.from(STORAGE_BUCKET).upload(path, blob, { contentType: mime, upsert: true });
      if (res.error) throw res.error;
      var url = SUPABASE_URL + "/storage/v1/object/public/" + STORAGE_BUCKET + "/" + path;
      return url;
    } catch (e) {
      console.warn("[Backend] Upload:", e);
      return null;
    }
  }

  // ══════════════════════════════════════════════════════
  // 5. LOAD DEALS FROM SUPABASE
  // ══════════════════════════════════════════════════════
  async function loadDeals() {
    try {
      var data = await sbFetch(
        "/rest/v1/deals?select=*,stores!inner(id,name,slug,category,lat,lng,address,postcode,logo_url,phone)&is_published=eq.true&is_auto_removed=eq.false&end_time=gt." + new Date().toISOString() + "&order=created_at.desc"
      );
      if (!data || !data.length) return false;
      var now = Date.now();
      window.DEALS = data.map(function (d) {
        var s = d.stores || {};
        var end = d.end_time || new Date(now + 86400000).toISOString();
        return {
          id: d.id,
          emoji: _catEm[(s.category || "").toLowerCase()] || "🛍️",
          bg: _hashBg(d.store_id || d.id),
          title: d.title || "Deal",
          shop: s.name || "Shop",
          addr: s.address || "",
          cat: s.category || "",
          type: _tl[(d.deal_type || "").toLowerCase()] || d.deal_type || "Ongoing",
          desc: d.description || "",
          dist: _dist(s.lat, s.lng, s.name),
          price: Number(d.discount_price || d.original_price || 0),
          originalPrice: Number(d.original_price || 0),
          priceLabel: _pl(d),
          timerSecs: _ts(end),
          stock: Math.max(0, (d.daily_limit || 0) - (d.redeemed_count || 0)),
          totalStock: d.daily_limit || 0,
          urgency: _urg(end),
          lateNight: false,
          redemptions: d.redeemed_count || 0,
          views: d.deal_views_count || 0,
          store_id: d.store_id,
          db_id: d.id,
          end_time: end,
          images: d.image_urls,
          discount_percent: d.discount_percent,
          original_price: d.original_price
        };
      });
      window.timerSecs = window.DEALS.map(function (d) { return d.timerSecs; });
      return true;
    } catch (e) {
      console.warn("[Backend] Deals load:", e);
      return false;
    }
  }

  // ══════════════════════════════════════════════════════
  // 6. LOAD SHOP DEALS (current user's store)
  // ══════════════════════════════════════════════════════
  async function loadShopDeals() {
    var storeId = _getStoreId();
    if (!storeId || !_sb) return;
    try {
      var data = await sbFetch("/rest/v1/deals?store_id=eq." + storeId + "&order=created_at.desc");
      if (!data || !data.length) {
        window.SHOP_DEALS = [];
        return;
      }
      window.SHOP_DEALS = data.map(function (d) {
        var remaining = Math.max(0, (d.daily_limit || 0) - (d.redeemed_count || 0));
        var total = d.daily_limit || 0;
        var status = d.end_time && new Date(d.end_time) < new Date() ? "expired" : remaining === 0 ? "hot" : (remaining / Math.max(total, 1)) < 0.3 ? "half" : "live";
        return {
          id: d.id,
          emoji: "⚡",
          title: d.title || "Deal",
          type: _tl[(d.deal_type || "").toLowerCase()] || d.deal_type || "Flash Sale",
          status: status,
          views: d.deal_views_count || 0,
          walkins: d.redeemed_count || 0,
          remaining: remaining,
          total: total,
          end_time: d.end_time
        };
      });
    } catch (e) {
      console.warn("[Backend] Shop deals load:", e);
    }
  }

  // ══════════════════════════════════════════════════════
  // 7. LOAD CUSTOMERS FROM REDEMPTIONS
  // ══════════════════════════════════════════════════════
  async function loadCustomers() {
    var storeId = _getStoreId();
    if (!storeId || !_sb) return;
    try {
      var data = await sbFetch(
        "/rest/v1/deal_redemptions?select=*,deals!inner(title,store_id)&deals.store_id=eq." + storeId + "&order=redeemed_at.desc"
      );
      if (data && data.length) {
        // Aggregate by email/device
        var custMap = {};
        data.forEach(function (r) {
          var key = r.customer_email || r.device_id || "anon_" + Math.random();
          if (!custMap[key]) {
            custMap[key] = { id: key, name: r.customer_name || key.substr(0,8), visits: 0, totalSpent: 0, favorite: "", lastVisitDays: 0 };
          }
          custMap[key].visits++;
          custMap[key].totalSpent += Number(r.amount_paid || 0);
          custMap[key].favorite = (r.deals && r.deals.title) || custMap[key].favorite;
          custMap[key].lastVisitDays = r.redeemed_at ? Math.floor((Date.now() - new Date(r.redeemed_at).getTime()) / 86400000) : 0;
        });
        window.CUSTOMERS = Object.values(custMap).sort(function (a, b) { return b.visits - a.visits; });
      }
    } catch (e) {
      console.warn("[Backend] Customers load:", e);
    }
  }

  // ══════════════════════════════════════════════════════
  // 8. LOAD STAFF (store memberships)
  // ══════════════════════════════════════════════════════
  async function loadStaff() {
    var storeId = _getStoreId();
    if (!storeId || !_sb) return;
    try {
      var data = await sbFetch(
        "/rest/v1/store_memberships?store_id=eq." + storeId + "&role=eq.staff&select=*"
      );
      if (data && data.length) {
        window.STAFF = data.map(function (m) {
          return {
            id: m.id || ("st" + Math.random()),
            name: m.name || m.email || "Staff",
            contact: m.email || m.phone || "",
            dealsPosted: m.deals_posted || 0,
            joined: m.created_at ? new Date(m.created_at).toLocaleDateString() : "Recently"
          };
        });
      }
    } catch (e) {
      console.warn("[Backend] Staff load:", e);
    }
  }

  // ══════════════════════════════════════════════════════
  // 9. SESSION & AUTH OVERRIDES
  // ══════════════════════════════════════════════════════
  async function checkSession() {
    if (!_sb) return;
    try {
      var sess = await _sb.auth.getSession();
      if (sess.data && sess.data.session) {
        window.loggedIn = true;
        var meta = sess.data.session.user.user_metadata || {};
        window.userName = meta.name || meta.full_name || sess.data.session.user.email.split("@")[0];
        window.userMode = meta.role === "shop" ? "shop" : "consumer";
        if (meta.role === "shop" || meta.role === "staff") {
          window.hasShopAccount = true;
          window._storeOwnerStoreId = meta.store_id;
        }
        if (meta.role === "staff") {
          window.staffPermissions = meta.staff_permissions || window.staffPermissions;
        }
      }
    } catch (e) { console.warn("[Backend] Session:", e); }
  }

  // ── Override doLogin ──
  var origDoLogin = window.doLogin;
  window.doLogin = function () {
    if (!_sb) { if (origDoLogin) origDoLogin(); return; }
    var email = (document.getElementById("li-email") || {}).value;
    var pass = (document.getElementById("li-pass") || {}).value;
    if (!email || !pass) { if (window.toast) window.toast("Enter email and password"); return; }
    _sb.auth.signInWithPassword({ email: email, password: pass }).then(function (r) {
      if (r.error) { if (window.toast) window.toast(r.error.message); return; }
      window.loggedIn = true;
      var meta = r.data.user.user_metadata || {};
      window.userName = meta.name || email.split("@")[0];
      window.userMode = window.loginMode || "consumer";
      if (meta.role === "shop" || window.userMode === "shop") {
        window.hasShopAccount = true;
        window._storeOwnerStoreId = meta.store_id;
        var tb = document.getElementById("shop-name-tb");
        if (tb) tb.textContent = window.userName;
        // Load shop-specific data
        loadShopDeals().then(function () {
          loadCustomers();
          loadStaff();
          if (window.renderShopDash) window.renderShopDash();
          if (window.renderShopDeals) window.renderShopDeals();
          if (window.renderAnalytics) window.renderAnalytics();
        });
        if (window.goShop) window.goShop("s-shop-dash");
      } else if (meta.role === "staff") {
        window.staffPermissions = meta.staff_permissions || window.staffPermissions;
        if (window.switchToStaffView) window.switchToStaffView();
      } else {
        loadFavourites();
        if (window.goConsumer) window.goConsumer("s-home");
      }
    });
  };

  // ── Override doRegister ──
  var origDoRegister = window.doRegister;
  window.doRegister = function () {
    if (!_sb) { if (origDoRegister) origDoRegister(); return; }
    var mode = window.loginMode || "consumer";
    var email, pass, name, role, storeId;
    if (mode === "shop") {
      email = (document.getElementById("reg-shop-email") || {}).value || (document.getElementById("li-email") || {}).value;
      pass = (document.getElementById("reg-shop-pass") || {}).value || (document.getElementById("li-pass") || {}).value;
      name = (document.getElementById("reg-shop-name") || {}).value || "My Shop";
      role = "shop";
      // Try to create the store first
      var slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "shop-" + Date.now();
      apiPost("/onboard", { name: name, email: email, slug: slug, category: "other" }).then(function (result) {
        if (result && result.supabase_store && result.supabase_store.length) {
          storeId = result.supabase_store[0].id;
          window._storeOwnerStoreId = storeId;
        }
        // Now sign up
        signUpAndLogin();
      }).catch(function () { signUpAndLogin(); });
    } else {
      email = (document.getElementById("reg-email") || {}).value || (document.getElementById("li-email") || {}).value;
      pass = (document.getElementById("reg-pass") || {}).value || (document.getElementById("li-pass") || {}).value;
      name = (document.getElementById("reg-name") || {}).value || "User";
      role = "consumer";
      signUpAndLogin();
    }

    function signUpAndLogin() {
      if (!email || !pass) { if (window.toast) window.toast("Enter email and password"); return; }
      var meta = { name: name, role: role };
      if (storeId) meta.store_id = storeId;
      _sb.auth.signUp({ email: email, password: pass, options: { data: meta } }).then(function (r) {
        if (r.error) { if (window.toast) window.toast(r.error.message); return; }
        // Auto-login
        _sb.auth.signInWithPassword({ email: email, password: pass }).then(function (lr) {
          if (lr.error) { if (window.toast) window.toast(lr.error.message); return; }
          window.loggedIn = true;
          window.userName = name;
          window.userMode = mode;
          if (mode === "shop") {
            window.hasShopAccount = true;
            var tb = document.getElementById("shop-name-tb");
            if (tb) tb.textContent = name;
            loadShopDeals();
            if (window.goShop) window.goShop("s-shop-dash");
          } else {
            if (window.goConsumer) window.goConsumer("s-home");
          }
        });
      });
    }
  };

  // ── Override logout ──
  var origDoLogout = window.doLogout;
  window.doLogout = function () {
    if (!_sb) { if (origDoLogout) origDoLogout(); return; }
    _sb.auth.signOut().then(function () {
      window.loggedIn = false;
      window.userName = "";
      window.userMode = "consumer";
      window.hasShopAccount = false;
      window.savedDeals = new Set();
      window._storeOwnerStoreId = null;
      if (window.goScreen) window.goScreen("s-login");
    });
  };

  // ══════════════════════════════════════════════════════
  // 10. OVERRIDE TOGGLE FAV TO USE BACKEND
  // ══════════════════════════════════════════════════════
  // Patches toggleFav and toggleDetFav
  var origToggleFav = window.toggleFav;
  if (origToggleFav) {
    window.toggleFav = function (e, id) {
      e.stopPropagation();
      var btn = e.currentTarget;
      // Toggle on the Set
      window.savedDeals.has(id) ? window.savedDeals.delete(id) : window.savedDeals.add(id);
      btn.classList.toggle("is-fav", window.savedDeals.has(id));
      btn.classList.remove("pop"); void btn.offsetWidth; btn.classList.add("pop");
      // Persist to backend
      var deal = window.DEALS && window.DEALS[id];
      var dbId = (deal && deal.db_id) || id;
      toggleFavBackend(dbId);
    };
  }

  var origDetFav = window.toggleDetFav;
  if (origDetFav) {
    window.toggleDetFav = function () {
      var id = window.currentDealId;
      window.savedDeals.has(id) ? window.savedDeals.delete(id) : window.savedDeals.add(id);
      var btn = document.getElementById("det-fav-btn");
      if (btn) {
        btn.classList.toggle("is-fav", window.savedDeals.has(id));
        btn.classList.remove("pop"); void btn.offsetWidth; btn.classList.add("pop");
      }
      if (window.toast) window.toast(window.savedDeals.has(id) ? "❤️ Saved!" : "Removed from saved");
      var deal = window.DEALS && window.DEALS[id];
      var dbId = (deal && deal.db_id) || id;
      toggleFavBackend(dbId);
    };
  }

  // ══════════════════════════════════════════════════════
  // 11. OVERRIDE openDeal TO RECORD VIEW
  // ══════════════════════════════════════════════════════
  var origOpenDeal = window.openDeal;
  if (origOpenDeal) {
    window.openDeal = function (id) {
      origOpenDeal(id);
      // Record view
      var deal = window.DEALS && window.DEALS[id];
      if (deal && deal.db_id) {
        recordDealView(deal.db_id);
      }
      // Update real-time timer display
      var d = window.DEALS && window.DEALS[id];
      if (d && d.end_time) {
        var secs = _ts(d.end_time);
        var timerEl = document.getElementById("det-timer-val");
        if (timerEl) timerEl.textContent = window.fmtSecs ? window.fmtSecs(secs) : secs;
      }
    };
  }

  // ══════════════════════════════════════════════════════
  // 12. OVERRIDE publishDeal TO SAVE TO SUPABASE
  // ══════════════════════════════════════════════════════
  var origPublishDeal = window.publishDeal;
  window.publishDeal = function () {
    if (!_sb) { if (origPublishDeal) origPublishDeal(); return; }
    var cd = window.createData || {};
    var storeId = _getStoreId();
    if (!storeId) {
      if (window.toast) window.toast("Set up your shop first in Profile");
      return;
    }

    // Upload images first if any
    var uploadPromises = [];
    if (cd.images) {
      cd.images.forEach(function (img, idx) {
        if (img && img.length > 50) {
          var p = uploadPhotoToSupabase(img, "deal_" + idx);
          uploadPromises.push(p);
        }
      });
    }

    Promise.all(uploadPromises).then(function (urls) {
      var imageUrls = urls.filter(function (u) { return u; });
      var dealType = (cd.type || "flash_sale").toLowerCase().replace(/ /g, "_");
      var startTime = new Date();
      var endTime = new Date(startTime.getTime() + 86400000);

      // Check for custom times in create step
      if (cd.startTime) endTime = new Date(cd.startTime + 86400000);
      if (cd.endTime) endTime = new Date(cd.endTime);

      var dealBody = {
        store_id: storeId,
        title: cd.name || "New Deal",
        description: cd.desc || "",
        deal_type: dealType,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        is_published: true,
        original_price: Number(cd.price) > 0 ? Number(cd.price) : null,
        discount_price: Number(cd.price) > 0 ? Number(cd.price) : 0,
        discount_percent: null,
        currency: "GBP",
        daily_limit: parseInt(cd.stock) || 10,
        image_urls: imageUrls
      };

      apiPost("/deals", dealBody).then(function (result) {
        if (result && result.id) {
          if (window.toast) window.toast("✅ Deal published to Supabase!");
          // Reload deals
          loadDeals();
          loadShopDeals().then(function () {
            window.createData = {};
            if (window.renderFeed) window.renderFeed();
            if (window.renderShopDeals) window.renderShopDeals();
            if (window.renderShopDash) window.renderShopDash();
            if (window.goShop) window.goShop("s-shop-dash");
          });
        } else {
          // Fallback to local
          if (origPublishDeal) origPublishDeal();
        }
      }).catch(function () {
        if (origPublishDeal) origPublishDeal();
      });
    });
  };

  // ══════════════════════════════════════════════════════
  // 13. OVERRIDE STAFF INVITE (store_memberships)
  // ══════════════════════════════════════════════════════
  var origAddStaff = window.addStaff;
  if (origAddStaff) {
    window.addStaff = function () {
      var name = (document.getElementById("staff-name-input") || {}).value.trim();
      var contact = (document.getElementById("staff-contact-input") || {}).value.trim();
      if (!name || !contact) { if (window.toast) window.toast("Enter name and contact"); return; }

      var storeId = _getStoreId();
      if (storeId && _sb) {
        sbFetch("/rest/v1/store_memberships", {
          method: "POST",
          body: JSON.stringify({
            store_id: storeId,
            name: name,
            email: contact,
            role: "staff",
            deals_posted: 0,
            staff_permissions: JSON.stringify({ discountCap: 30, approvalRequired: true })
          })
        }).then(function () {
          if (window.toast) window.toast("✅ Invite sent!");
          loadStaff().then(function () {
            if (window.renderStaffList) window.renderStaffList();
          });
        }).catch(function () {
          // Fallback to local
          origAddStaff();
        });
      } else {
        origAddStaff();
      }
      if (window.closeModal) window.closeModal();
    };
  }

  // ══════════════════════════════════════════════════════
  // 14. OVERRIDE CRM ACTIONS (GHL)
  // ══════════════════════════════════════════════════════
  var origSendCrm = window.sendCrmAction;
  if (origSendCrm) {
    window.sendCrmAction = function (id, kind) {
      // Try to send via GHL endpoint
      var cust = (window.CUSTOMERS || []).find(function (c) { return c.id === id; });
      if (cust && _sb) {
        apiPost("/contact", {
          email: cust.email || id + "@guest.outandabout.app",
          name: cust.name,
          action: kind,
          store_id: _getStoreId()
        }).then(function (r) {
          if (window.toast) window.toast(kind === "winback"
            ? "✅ Win-back SMS queued via GHL"
            : "✅ Thank-you sent via GHL");
        }).catch(function () {
          origSendCrm(id, kind);
        });
      } else {
        origSendCrm(id, kind);
      }
      if (window.closeModal) window.closeModal();
    };
  }

  // ══════════════════════════════════════════════════════
  // 15. OVERRIDE REDEMPTION RECORDING
  // ══════════════════════════════════════════════════════
  var origSimulateScan = window.simulateScan;
  if (origSimulateScan) {
    window.simulateScan = function () {
      // Try to record real redemption
      var deal = window.SHOP_DEALS && window.SHOP_DEALS[0];
      if (deal && deal.id) {
        apiPost("/redeem", { deal_id: deal.id, customer_email: _userEmail() || "walkin@shop.local" }).then(function () {
          // Reload deals to update counts
          loadShopDeals();
          loadCustomers();
        });
      }
      origSimulateScan();
    };
  }

  // ══════════════════════════════════════════════════════
  // 16. WIRE API ENDPOINTS VIA DATA ATTRIBUTES
  // ══════════════════════════════════════════════════════
  document.addEventListener("click", function (e) {
    var target = e.target;
    // BTC price
    if (target && target.closest && target.closest("[data-api-btc]")) {
      e.preventDefault();
      apiFetch("/btc").then(function (d) {
        if (d && d.usd !== undefined && window.toast) {
          window.toast("\u20bf $" + Number(d.usd).toLocaleString() + " / \u00a3" + Number(d.gbp || 0).toLocaleString());
        }
      }).catch(function () { if (window.toast) window.toast("\u20bf Could not fetch price"); });
    }
    // Quote
    if