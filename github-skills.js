/**
 * Fetches public repository language stats from the GitHub REST API and appends
 * skill cards for languages not already represented in the static skills list.
 *
 * Limitations: unauthenticated API rate limit (60 req/hr per IP), first 100 repos only,
 * no private repo data. Set data-github-user on <body> to change the login.
 */
(function () {
  const GH_ACCEPT = "application/vnd.github+json";

  const LANG_COLORS = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    Python: "#3572A5",
    Java: "#b07219",
    "C++": "#f34b7d",
    C: "#555555",
    "C#": "#178600",
    Go: "#00ADD8",
    Ruby: "#701516",
    PHP: "#4F5D95",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Swift: "#F05138",
    Kotlin: "#A97BFF",
    Dart: "#00B4AB",
    Shell: "#89e051",
    "Objective-C": "#438eff",
    Vue: "#41b883",
    Rust: "#dea584",
    Scala: "#c22d40",
    Dockerfile: "#384d54",
    Makefile: "#427819",
    Lua: "#000080",
    Perl: "#0298c3",
    Haskell: "#5e5086",
    Elixir: "#6e4a7e",
    PowerShell: "#012456",
    R: "#198CE7",
    Jupyter: "#DA5B0B",
    TeX: "#3D6117",
  };

  const LANG_ICON = {
    JavaScript: { icon: ["fab", "fa-js"], cls: "js-skill" },
    TypeScript: { icon: ["fab", "fa-js-square"], cls: "ts-skill" },
    Dart: { icon: ["fas", "fa-bullseye"], cls: "dart-skill" },
    Go: { icon: ["fas", "fa-bolt"], cls: "go-skill" },
    Swift: { icon: ["fab", "fa-swift"], cls: "swift-skill" },
    HTML: { icon: ["fab", "fa-html5"], cls: "web-fund-skill" },
    CSS: { icon: ["fab", "fa-css3-alt"], cls: "web-fund-skill" },
    PHP: { icon: ["fab", "fa-php"], cls: "github-lang-fallback" },
    Python: { icon: ["fab", "fa-python"], cls: "github-lang-fallback" },
    Java: { icon: ["fab", "fa-java"], cls: "github-lang-fallback" },
    "C++": { icon: ["fas", "fa-microchip"], cls: "java-cpp-skill" },
    C: { icon: ["fas", "fa-microchip"], cls: "github-lang-fallback" },
    "C#": { icon: ["fas", "fa-code"], cls: "dotnet-skill" },
    Ruby: { icon: ["fas", "fa-gem"], cls: "github-lang-fallback" },
    Rust: { icon: ["fas", "fa-cog"], cls: "github-lang-fallback" },
    Kotlin: { icon: ["fas", "fa-code"], cls: "github-lang-fallback" },
    Vue: { icon: ["fab", "fa-vuejs"], cls: "github-lang-fallback" },
    Shell: { icon: ["fas", "fa-terminal"], cls: "github-lang-fallback" },
    Dockerfile: { icon: ["fas", "fa-cube"], cls: "github-lang-fallback" },
    Makefile: { icon: ["fas", "fa-file-code"], cls: "github-lang-fallback" },
  };

  function metaForLang(name) {
    if (LANG_ICON[name]) return LANG_ICON[name];
    return { icon: ["fas", "fa-code"], cls: "github-lang-fallback" };
  }

  function staticSkillsBlockText() {
    const nodes = document.querySelectorAll(
      ".skill-list > li:not(.skill-github-status)"
    );
    return Array.from(nodes)
      .map((li) => li.textContent.toLowerCase())
      .join("\n");
  }

  function languageAlreadyListed(lang, block) {
    const L = lang.toLowerCase();

    if (L === "javascript")
      return /\bjavascript\b/.test(block) || /\bjs\b/.test(block);
    if (L === "typescript") return /\btypescript\b/.test(block);
    if (L === "dart") return /\bdart\b/.test(block);
    if (L === "go" || L === "golang")
      return /\bgo\b/.test(block) || /\bgolang\b/.test(block);
    if (L === "swift") return /\bswift\b/.test(block);
    if (L === "kotlin") return /\bkotlin\b/.test(block);
    if (L === "python") return /\bpython\b/.test(block);
    if (L === "ruby") return /\bruby\b/.test(block);
    if (L === "php") return /\bphp\b/.test(block);
    if (L === "rust") return /\brust\b/.test(block);
    if (L === "vue" || L === "vue.js") return /\bvue\b/.test(block);
    if (L === "html" || L === "css" || L === "scss" || L === "less") {
      return /\bhtml\b/.test(block) && /\bcss\b/.test(block);
    }
    if (L === "c++") return /c\+\+/i.test(block);
    if (L === "c#") return /\.net\b/i.test(block) || /\bc#\b/i.test(block);
    if (L === "java") return /\bjava\b/.test(block);
    if (L === "objective-c" || L === "objective c")
      return /objective-?c/i.test(block);

    try {
      const esc = L.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\+/g, "\\+");
      const re = new RegExp(`\\b${esc}\\b`, "i");
      return re.test(block);
    } catch {
      return block.includes(L);
    }
  }

  function languageCovered(lang) {
    const block = staticSkillsBlockText();
    return languageAlreadyListed(lang, block);
  }

  async function ghFetch(url) {
    const res = await fetch(url, {
      headers: { Accept: GH_ACCEPT },
    });
    if (res.status === 403 || res.status === 429) {
      const err = new Error("rate_limited");
      err.status = res.status;
      throw err;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async function aggregateLanguages(username) {
    const repos = await ghFetch(
      `https://api.github.com/users/${encodeURIComponent(
        username
      )}/repos?per_page=100&sort=updated&type=owner`
    );
    const own = repos.filter((r) => !r.fork);
    const totals = {};
    const concurrency = 6;
    for (let i = 0; i < own.length; i += concurrency) {
      const slice = own.slice(i, i + concurrency);
      await Promise.all(
        slice.map(async (repo) => {
          try {
            const langs = await ghFetch(
              `https://api.github.com/repos/${encodeURIComponent(
                username
              )}/${encodeURIComponent(repo.name)}/languages`
            );
            Object.entries(langs).forEach(([name, bytes]) => {
              totals[name] = (totals[name] || 0) + bytes;
            });
          } catch {
            /* private or missing */
          }
        })
      );
    }
    return Object.entries(totals)
      .map(([name, bytes]) => ({ name, bytes }))
      .sort((a, b) => b.bytes - a.bytes);
  }

  function createSkillLi(lang, bytes, totalBytes) {
    const share = totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0;
    const color = LANG_COLORS[lang] || "#8b8b9e";
    const meta = metaForLang(lang);
    const [i0, i1] = meta.icon;
    const li = document.createElement("li");
    li.className = "skill-div skill-div--github-extra";
    li.style.setProperty("--github-lang-color", color);
    li.innerHTML = `
      <div class="skill-header">
        <div class="skill-info">
          <span class="skill-icon ${meta.cls}" style="--github-lang-color: ${color}">
            <i class="${i0} ${i1}"></i>
          </span>
          <div>
            <h3 class="skill-title">${escapeHtml(lang)}</h3>
            <p class="skill-tagline">Detected from public GitHub repos</p>
          </div>
        </div>
      </div>
      <p class="skill-github-stat" aria-label="Share of code in public repositories">~${share}% of bytes across your public repos</p>
    `;
    return li;
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  async function run() {
    const skillList = document.querySelector(".skill-list");
    const statusEl = document.getElementById("github-skills-status");
    const statusMsg = document.getElementById("github-skills-status-msg");
    if (!skillList || !statusEl || !statusMsg) return;

    const username =
      document.body.getAttribute("data-github-user") || "lalitpatel11";
    const cacheKey = `github-skills-langs:${username}`;
    const TTL = 6 * 60 * 60 * 1000;

    let ranked;
    try {
      const raw = sessionStorage.getItem(cacheKey);
      if (raw) {
        const { t, data } = JSON.parse(raw);
        if (Date.now() - t < TTL) ranked = data;
      }
      if (!ranked) {
        ranked = await aggregateLanguages(username);
        sessionStorage.setItem(
          cacheKey,
          JSON.stringify({ t: Date.now(), data: ranked })
        );
      }
    } catch (e) {
      statusMsg.textContent =
        e.message === "rate_limited"
          ? "GitHub rate limit reached — try again in an hour. Curated skills above are unchanged."
          : "Couldn’t load GitHub language stats. Curated skills above are unchanged.";
      return;
    }

    const totalBytes = ranked.reduce((s, x) => s + x.bytes, 0);
    const minShare = 0.006;
    const maxExtra = 10;
    const extras = [];

    for (const { name, bytes } of ranked) {
      if (totalBytes && bytes / totalBytes < minShare) continue;
      if (languageCovered(name)) continue;
      extras.push({ name, bytes });
      if (extras.length >= maxExtra) break;
    }

    if (extras.length === 0) {
      statusMsg.textContent =
        "Top languages from your public repos are already covered above.";
      return;
    }

    statusEl.remove();

    for (const { name, bytes } of extras) {
      skillList.appendChild(createSkillLi(name, bytes, totalBytes));
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
