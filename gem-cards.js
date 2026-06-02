/**
 * Vykreslení karty gemu — „Do mé sady“ pouze v patičce (slug jako ID).
 */
(function (global) {
  var DEFAULT_LABELS = {
    planning: "Plánování",
    materials: "Materiály",
    engagement: "Zapojení",
    support: "Podpora",
    assessment: "Hodnocení",
    literacy: "Čtenářství",
    stem: "STEM",
    student: "Pro žáky",
    professional: "Pro učitele",
    newest: "Nový"
  };

  function esc(s) {
    if (!s) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setToggleLabel(fav) {
    return fav ? "★ V mé sadě" : "☆ Do mé sady";
  }

  function isFavorite(slug) {
    return global.GemFavorites && global.GemFavorites.isFavorite(slug);
  }

  function setToggleHtml(slug) {
    var fav = isFavorite(slug);
    var activeClass = fav ? " is-active" : "";
    var label = fav ? "Odebrat z mé sady" : "Přidat do mé sady";
    return (
      '<button type="button" class="card-set-toggle' + activeClass + '"' +
      ' data-favorite-slug="' + esc(slug) + '"' +
      ' aria-label="' + label + '" aria-pressed="' + (fav ? "true" : "false") + '">' +
      setToggleLabel(fav) +
      "</button>"
    );
  }

  function slugFromHref(href) {
    if (!href) return "";
    try {
      var u = new URL(href, global.location && global.location.href ? global.location.href : "http://local/");
      return u.searchParams.get("slug") || "";
    } catch (e) {
      var m = String(href).match(/[?&]slug=([^&]+)/);
      return m ? decodeURIComponent(m[1]) : "";
    }
  }

  function render(gem, options) {
    if (!gem || !gem.slug) return "";
    options = options || {};
    var labels = options.categoryLabels || DEFAULT_LABELS;
    var extraTag = options.extraTag ? '<span class="tag tag-accent">' + esc(options.extraTag) + "</span>" : "";
    var role = gem.category === "student" ? "Žák" : "Učitel";
    var categoryLabel = esc(labels[gem.category] || gem.category);
    var slug = gem.slug;
    var href = "gem.html?slug=" + esc(slug);

    return (
      '<div class="card-shell">' +
      '<a href="' + href + '" class="card card-body-link">' +
      '<div class="card-header"><div class="card-icon">' + (gem.emoji || "") + '</div><div class="card-title">' + esc(gem.titleCs) + "</div></div>" +
      '<p class="card-content">' + esc(gem.shortDescCs) + "</p>" +
      '<div class="card-tags">' + extraTag + '<span class="tag">' + categoryLabel + "</span></div>" +
      "</a>" +
      '<div class="card-footer">' +
      "<span>" + role + "</span>" +
      setToggleHtml(slug) +
      '<a href="' + href + '" class="card-link">Detail & otevřít <span>↗</span></a>' +
      "</div></div>"
    );
  }

  function upgradeLegacyCards(root, gems) {
    if (!global.document || !root) return;
    gems = gems || global.GEMS_DATA || {};
    var links = Array.prototype.slice.call(
      root.querySelectorAll('a.card[href*="gem.html"]:not(.card-body-link)')
    );
    links.forEach(function (link) {
      if (link.closest(".card-shell")) return;
      var slug = slugFromHref(link.getAttribute("href") || "");
      if (!slug) return;
      var gem = gems[slug];
      if (!gem) {
        var roleSpan = link.querySelector(".card-footer span");
        var role = roleSpan ? roleSpan.textContent : "Učitel";
        var titleEl = link.querySelector(".card-title");
        gem = {
          slug: slug,
          emoji: (link.querySelector(".card-icon") || {}).textContent || "💎",
          titleCs: titleEl ? titleEl.textContent : slug,
          shortDescCs: (link.querySelector(".card-content") || {}).textContent || "",
          category: role === "Žák" ? "student" : "planning",
          categories: []
        };
      }
      var wrap = global.document.createElement("div");
      wrap.innerHTML = render(gem);
      var shell = wrap.firstElementChild;
      if (shell && link.parentNode) link.parentNode.replaceChild(shell, link);
    });
  }

  function tryUpgradeLegacy() {
    if (!global.document) return;
    upgradeLegacyCards(global.document, global.GEMS_DATA || {});
    var iconBtns = global.document.querySelectorAll(".card-set-toggle--icon");
    for (var i = 0; i < iconBtns.length; i++) {
      iconBtns[i].remove();
    }
    if (global.GemFavorites && global.GemFavorites.syncAll) global.GemFavorites.syncAll();
  }

  global.GemCards = {
    render: render,
    setToggleLabel: setToggleLabel,
    upgradeLegacyCards: upgradeLegacyCards,
    DEFAULT_LABELS: DEFAULT_LABELS
  };

  if (global.document) {
    if (global.document.readyState === "loading") {
      global.document.addEventListener("DOMContentLoaded", tryUpgradeLegacy);
    } else {
      tryUpgradeLegacy();
    }
  }
})(typeof window !== "undefined" ? window : this);
