/**
 * Oblíbené gemy (Moje sada) — pouze localStorage v prohlížeči (bez backendu).
 */
(function (global) {
  var STORAGE_KEY = "gemforge-favorites";
  var CHANGE_EVENT = "gemforge-favorites-change";

  function storageAvailable() {
    try {
      var k = "__gemforge_test__";
      global.localStorage.setItem(k, "1");
      global.localStorage.removeItem(k);
      return true;
    } catch (e) {
      return false;
    }
  }

  function readList() {
    if (!storageAvailable()) return [];
    try {
      var raw = global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(function (s) {
        return typeof s === "string" && s.length > 0;
      });
    } catch (e) {
      return [];
    }
  }

  function writeList(list) {
    if (!storageAvailable()) return;
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) { /* ignore quota */ }
  }

  function notify() {
    try {
      global.document.dispatchEvent(new CustomEvent(CHANGE_EVENT));
    } catch (e) { /* ignore */ }
  }

  function getAll() {
    return readList();
  }

  function isFavorite(slug) {
    if (!slug) return false;
    return readList().indexOf(slug) !== -1;
  }

  function toggle(slug) {
    if (!slug) return false;
    var list = readList();
    var i = list.indexOf(slug);
    if (i === -1) {
      list.push(slug);
      writeList(list);
      notify();
      return true;
    }
    list.splice(i, 1);
    writeList(list);
    notify();
    return false;
  }

  function toggleLabel(active) {
    if (global.GemCards && global.GemCards.setToggleLabel) {
      return global.GemCards.setToggleLabel(active);
    }
    return active ? "★ V mé sadě" : "☆ Do mé sady";
  }

  function syncButton(btn, active) {
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
    btn.setAttribute("aria-label", active ? "Odebrat z mé sady" : "Přidat do mé sady");
    btn.textContent = toggleLabel(active);
    btn.removeAttribute("title");
  }

  function syncButtons(slug) {
    if (!global.document || !slug) return;
    var active = isFavorite(slug);
    var buttons = global.document.querySelectorAll('[data-favorite-slug="' + slug + '"]');
    for (var i = 0; i < buttons.length; i++) {
      syncButton(buttons[i], active);
    }
  }

  function syncAll() {
    if (!global.document) return;
    var seen = {};
    var buttons = global.document.querySelectorAll("[data-favorite-slug]");
    for (var i = 0; i < buttons.length; i++) {
      var slug = buttons[i].getAttribute("data-favorite-slug");
      if (slug && !seen[slug]) {
        seen[slug] = true;
        syncButtons(slug);
      }
    }
  }

  function bindToggleClick() {
    if (!global.document) return;
    global.document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-favorite-slug]");
      if (!btn || btn.tagName !== "BUTTON") return;
      e.preventDefault();
      e.stopPropagation();
      var slug = btn.getAttribute("data-favorite-slug");
      if (!slug) return;
      toggle(slug);
      syncButtons(slug);
    });
  }

  if (global.document && global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", bindToggleClick);
  } else {
    bindToggleClick();
  }

  function onFavoritesChange(handler) {
    if (!global.document) return;
    global.document.addEventListener(CHANGE_EVENT, handler);
  }

  global.GemFavorites = {
    STORAGE_KEY: STORAGE_KEY,
    CHANGE_EVENT: CHANGE_EVENT,
    getAll: getAll,
    isFavorite: isFavorite,
    toggle: toggle,
    syncButtons: syncButtons,
    syncAll: syncAll,
    onChange: onFavoritesChange
  };
})(typeof window !== "undefined" ? window : this);
