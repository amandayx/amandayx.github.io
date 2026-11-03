/* Visit notification: sends a free push notification to your phone via ntfy.sh.
   1) Install the ntfy app and subscribe to the topic below.  2) Upload this file. That's it. */
(function () {
  var CONFIG = {
    // Your private topic name. Treat it like a password: anyone who knows it can read or send to it.
    ntfyTopic: "amanda-site-vpwg7b2tq3ob2i",
    // Optional: paste a Cloudflare Worker URL here (see worker.js) to hide the topic from your page source.
    workerUrl: "",
    cooldownHours: 24   // one alert per browser per 24 hours (use 8760 for "first visit only")
  };

  if (!CONFIG.ntfyTopic && !CONFIG.workerUrl) return;                              // not configured
  if (["localhost", "127.0.0.1", ""].indexOf(location.hostname) !== -1) return;   // local testing

  try {
    // Visit any page once with ?owner=1 to stop alerting yourself from this browser (?owner=0 undoes it).
    var q = new URLSearchParams(location.search);
    if (q.get("owner") === "1") localStorage.setItem("ax-owner", "1");
    if (q.get("owner") === "0") localStorage.removeItem("ax-owner");
    if (localStorage.getItem("ax-owner")) return;

    // Skip obvious bots and link-preview crawlers.
    if (navigator.webdriver || /bot|crawl|spider|slurp|preview|headless|lighthouse/i.test(navigator.userAgent)) return;

    // One alert per cooldown window per browser, not one per page view.
    var last = Number(localStorage.getItem("ax-last-notify")) || 0;
    if (Date.now() - last < CONFIG.cooldownHours * 3600 * 1000) return;
    localStorage.setItem("ax-last-notify", String(Date.now()));
  } catch (e) {
    return; // storage blocked: skip rather than risk an alert on every page view
  }

  var info = {
    page: location.pathname,
    referrer: document.referrer || "direct",
    device: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
    time: new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
  };

  if (CONFIG.workerUrl) {
    fetch(CONFIG.workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify(info)
    }).catch(function () {});
  } else {
    var text = "Page: " + info.page + " | From: " + info.referrer + " | " + info.device + " | " + info.time;
    fetch("https://ntfy.sh/" + encodeURIComponent(CONFIG.ntfyTopic) +
          "?title=" + encodeURIComponent("New website visitor") + "&tags=eyes", {
      method: "POST",
      body: text,
      keepalive: true
    }).catch(function () {});
  }
})();