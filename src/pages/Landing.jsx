import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import HyperrLogo from "@/components/HyperrLogo";
import { useSEO } from "@/hooks/useSEO";

const MARKUP = `
  <!-- symbol defs -->
  <svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <symbol id="hyperr-swap" viewBox="0 0 100 100"><g fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"><path d="M24 34 H58" /><path d="M50 24 L71 34 L50 44" /><path d="M76 66 H42" /><path d="M50 56 L29 66 L50 76" /></g></symbol>
  </svg>

  <!-- SUBTLE BACKGROUND TINT -->
  <div aria-hidden="true" style="position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;">
    <div style="position:absolute;inset:0;background:radial-gradient(125% 90% at 50% -10%, rgba(37,99,235,0.05), transparent 55%);"></div>
    <div data-floatwrap style="position:absolute;inset:0;z-index:1;pointer-events:none;opacity:0;transition:opacity .9s ease .2s;">
      <div data-px data-sy="-0.20" data-fade="0.0016" data-base-op="0.95" data-mx="32" data-my="22" style="position:absolute;left:6%;top:23%;display:inline-flex;align-items:center;gap:8px;background:#FFFFFF;border:1px solid #E4E7EC;border-radius:999px;padding:8px 13px;box-shadow:0 6px 20px rgba(15,23,42,.06);">
        <span style="width:7px;height:7px;border-radius:50%;background:#1D4ED8;"></span>
        <span style="font-family:Inter,sans-serif;font-size:12px;font-weight:500;color:#111827;">$150 · free dinner</span>
      </div>
      <div data-px data-sy="-0.28" data-fade="0.0017" data-base-op="0.95" data-mx="20" data-my="15" style="position:absolute;right:30%;top:15%;display:inline-flex;align-items:center;gap:8px;background:#FFFFFF;border:1px solid #E4E7EC;border-radius:999px;padding:8px 13px;box-shadow:0 6px 20px rgba(15,23,42,.06);">
        <span style="font-family:Inter,sans-serif;font-size:12px;color:#6B7280;">reach</span>
        <span style="font-family:Inter,sans-serif;font-size:12px;font-weight:600;color:#111827;">957K</span>
      </div>
      <div data-px data-sy="-0.22" data-fade="0.0015" data-base-op="0.95" data-mx="-22" data-my="24" style="position:absolute;right:5%;top:74%;display:inline-flex;align-items:center;gap:8px;background:#ECFDF5;border:1px solid #A7F3D0;border-radius:999px;padding:8px 13px;box-shadow:0 6px 20px rgba(5,150,105,.08);">
        <span style="width:7px;height:7px;border-radius:50%;background:#059669;"></span>
        <span style="font-family:Inter,sans-serif;font-size:12px;font-weight:600;color:#059669;letter-spacing:.02em;">trade complete</span>
      </div>
      <div data-px data-sy="-0.16" data-fade="0.0019" data-base-op="0.9" data-mx="26" data-my="-14" style="position:absolute;left:40%;top:9%;display:inline-flex;align-items:center;gap:8px;background:#FFFFFF;border:1px solid #E4E7EC;border-radius:999px;padding:7px 12px;box-shadow:0 6px 20px rgba(15,23,42,.06);">
        <span style="font-family:Inter,sans-serif;font-size:12px;color:#6B7280;">$270 · 3-mo pass</span>
      </div>
    </div>
  </div>

  <!-- FOREGROUND -->
  <div style="position:relative;z-index:1;">

    <!-- NAV -->
    <nav data-nav style="position:fixed;top:0;left:0;right:0;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:15px clamp(20px,5vw,64px);border-bottom:1px solid transparent;transition:background .25s ease,border-color .25s ease,backdrop-filter .25s ease;">
      <a href="#top" style="display:inline-flex;align-items:center;gap:10px;text-decoration:none;">
         <svg viewBox="0 0 100 100" style="height:24px;width:auto;color:#1D4ED8;"><use href="#hyperr-swap"></use></svg>
         <span style="font-family:Inter,sans-serif;font-weight:700;font-size:23px;letter-spacing:-.04em;color:#111827;">hyperr</span>
       </a>
      <div data-navlinks style="display:flex;align-items:center;gap:30px;">
        <a href="#how" style="color:#6B7280;text-decoration:none;font-size:14.5px;font-weight:500;transition:color .15s ease;" data-h="color:#111827;">How it works</a>
        <a href="/marketplace" style="color:#6B7280;text-decoration:none;font-size:14.5px;font-weight:500;transition:color .15s ease;" data-h="color:#111827;">Browse marketplace</a>
        <a href="#creators" style="color:#6B7280;text-decoration:none;font-size:14.5px;font-weight:500;transition:color .15s ease;" data-h="color:#111827;">For creators</a>
        <a href="#business" style="color:#6B7280;text-decoration:none;font-size:14.5px;font-weight:500;transition:color .15s ease;" data-h="color:#111827;">For businesses</a>
        <a href="#tiers" style="color:#6B7280;text-decoration:none;font-size:14.5px;font-weight:500;transition:color .15s ease;" data-h="color:#111827;">Tiers</a>
      </div>
      <div style="display:flex;align-items:center;gap:12px;">
        <a href="/login" style="color:#111827;text-decoration:none;font-size:14.5px;font-weight:600;padding:9px 16px;border-radius:10px;border:1px solid #E4E7EC;background:#fff;transition:background .15s ease,border-color .15s ease;" data-h="background:#F7F8FA;border-color:#D1D5DB;">Log in</a>
        <a href="/register" style="color:#fff;background:#1D4ED8;text-decoration:none;font-size:14.5px;font-weight:600;padding:10px 18px;border-radius:10px;transition:background .15s ease,transform .15s ease,box-shadow .15s ease;" data-h="background:#1E40AF;transform:translateY(-2px);box-shadow:0 8px 22px rgba(29,78,216,.22);">Sign up</a>
      </div>
    </nav>

    <!-- HERO STAGE -->
    <header id="top" style="position:relative;min-height:clamp(660px,94vh,940px);max-width:1280px;margin:0 auto;padding:clamp(120px,16vh,176px) clamp(20px,5vw,64px) clamp(40px,6vh,72px);display:flex;align-items:center;overflow:visible;">
      <div data-px data-sy="0.14" data-mx="-46" data-my="-30" style="position:absolute;left:clamp(-40px,3vw,40px);top:46%;transform:translateY(-50%);pointer-events:none;z-index:0;">
        <svg viewBox="0 0 100 100" style="height:min(112vh,940px);width:auto;color:#1D4ED8;opacity:.04;"><use href="#hyperr-swap"></use></svg>
      </div>
      <div style="position:relative;z-index:2;display:flex;flex-wrap:wrap;align-items:center;gap:clamp(36px,5vw,72px);width:100%;">
        <div data-px data-sy="0.05" data-my="6" style="flex:1 1 440px;min-width:300px;">
          <div data-hero="rise" data-hero-delay="0" style="display:inline-flex;align-items:center;gap:9px;padding:7px 13px;border:1px solid #E4E7EC;border-radius:999px;background:#F7F8FA;">
            <span style="width:7px;height:7px;border-radius:50%;background:#1D4ED8;"></span>
            <span style="font-family:Inter,sans-serif;font-size:11.5px;font-weight:600;letter-spacing:.14em;color:#6B7280;text-transform:uppercase;">The barter marketplace</span>
          </div>
          <h1 data-hero="rise" data-hero-delay="90" style="font-family:Inter,sans-serif;font-weight:800;font-size:clamp(44px,6.4vw,76px);line-height:1.05;letter-spacing:-.03em;color:#0F172A;margin:22px 0 0;">Trade products for <span style="color:#1D4ED8;">promotion.</span></h1>
          <p data-hero="rise" data-hero-delay="180" style="color:#475569;font-size:clamp(16px,1.5vw,19px);line-height:1.6;max-width:480px;margin:22px 0 0;">hyperr connects businesses and creators to swap real value — products, services, experiences — for content and reach. Cash potential.</p>
          <div data-hero="rise" data-hero-delay="270" style="display:flex;flex-wrap:wrap;gap:13px;margin-top:34px;">
            <a href="/register" style="color:#fff;background:#1D4ED8;text-decoration:none;font-size:15.5px;font-weight:600;padding:14px 24px;border-radius:11px;display:inline-flex;align-items:center;gap:9px;transition:background .15s ease,transform .15s ease,box-shadow .15s ease;" data-h="background:#1E40AF;transform:translateY(-2px);box-shadow:0 10px 28px rgba(29,78,216,.22);">Join as a creator <span style="font-size:17px;">→</span></a>
            <a href="/register" style="color:#1D4ED8;background:#fff;border:1px solid #1D4ED8;text-decoration:none;font-size:15.5px;font-weight:600;padding:14px 24px;border-radius:11px;display:inline-flex;align-items:center;gap:9px;transition:background .15s ease,transform .15s ease;" data-h="background:#EFF6FF;transform:translateY(-2px);">List your business</a>
          </div>
          <div data-hero="rise" data-hero-delay="360" style="margin-top:16px;">
            <a href="/marketplace" style="color:#1D4ED8;text-decoration:none;font-size:14.5px;font-weight:500;display:inline-flex;align-items:center;gap:6px;transition:gap .15s ease;" data-h="gap:10px;">Browse the marketplace <span style="font-size:16px;">→</span></a>
          </div>
        </div>
        <div style="flex:1 1 430px;min-width:300px;display:flex;justify-content:center;perspective:1200px;">
          <div data-hero="right" data-hero-delay="120" style="position:relative;width:100%;max-width:540px;">
            <div data-px data-sy="-0.06" data-mx="20" data-my="14" data-rx="5.5" data-ry="7" style="position:relative;transform-style:preserve-3d;will-change:transform;">
              <div data-hero="pill" data-hero-delay="1000" style="position:absolute;top:-15px;left:50%;transform:translateX(-50%);z-index:4;">
                <div style="display:inline-flex;align-items:center;gap:8px;background:#ECFDF5;color:#059669;border:1px solid #A7F3D0;padding:7px 15px;border-radius:999px;font-family:Inter,sans-serif;font-size:11.5px;font-weight:600;letter-spacing:.06em;box-shadow:0 8px 24px rgba(5,150,105,.12);">
                  <span style="width:7px;height:7px;border-radius:50%;background:#059669;"></span>COMPLETED
                </div>
              </div>
              <div style="position:relative;z-index:2;display:flex;align-items:center;gap:0;">
                <div data-hero="left" data-hero-delay="180" style="flex:1 1 0;min-width:0;background:#fff;border:1px solid #E4E7EC;border-radius:16px;padding:18px;box-shadow:0 12px 32px rgba(15,23,42,.06);">
                  <div style="font-family:Inter,sans-serif;font-size:10.5px;font-weight:600;letter-spacing:.12em;color:#1D4ED8;text-transform:uppercase;">Business offer</div>
                  <div style="font-family:Inter,sans-serif;font-weight:700;font-size:19px;letter-spacing:-.02em;margin-top:11px;line-height:1.2;color:#0F172A;">Free dinner for 2</div>
                  <div style="color:#6B7280;font-size:12.5px;margin-top:5px;">Lumen Bistro · Austin</div>
                  <div style="margin-top:15px;padding-top:13px;border-top:1px solid #F1F3F6;display:flex;align-items:baseline;gap:7px;">
                    <span data-count data-prefix="$" data-target="150" style="font-family:Inter,sans-serif;font-size:22px;font-weight:700;color:#0F172A;">$150</span>
                    <span style="color:#9CA3AF;font-size:11.5px;">est. value</span>
                  </div>
                </div>
                <div data-hero="swap" data-hero-delay="520" style="flex:0 0 auto;margin:0 -16px;z-index:3;">
                  <div style="width:48px;height:48px;border-radius:50%;background:#fff;border:1px solid #E4E7EC;display:flex;align-items:center;justify-content:center;font-size:22px;color:#1D4ED8;box-shadow:0 8px 22px rgba(15,23,42,.08);">⇄</div>
                </div>
                <div data-hero="right" data-hero-delay="240" style="flex:1 1 0;min-width:0;background:#fff;border:1px solid #E4E7EC;border-radius:16px;padding:18px;box-shadow:0 12px 32px rgba(15,23,42,.06);">
                  <div style="display:flex;align-items:center;gap:11px;">
                    <div style="width:40px;height:40px;border-radius:50%;background:#EFF6FF;border:1px solid #DBEAFE;display:flex;align-items:center;justify-content:center;font-family:Inter,sans-serif;font-size:13px;font-weight:700;color:#1D4ED8;flex:0 0 auto;">KT</div>
                    <div style="min-width:0;">
                      <div style="font-family:Inter,sans-serif;font-weight:700;font-size:17px;letter-spacing:-.02em;color:#0F172A;">Kai Tanaka</div>
                      <div style="font-family:Inter,sans-serif;font-size:11px;color:#CA8A04;font-weight:600;letter-spacing:.04em;margin-top:1px;">◆ GOLD</div>
                    </div>
                  </div>
                  <div style="margin-top:15px;padding-top:13px;border-top:1px solid #F1F3F6;display:flex;flex-direction:column;gap:9px;">
                    <div style="display:flex;align-items:center;justify-content:space-between;">
                      <span style="color:#6B7280;font-size:12px;">Instagram</span>
                      <span data-count data-suffix="K" data-target="445" style="font-family:Inter,sans-serif;font-size:16px;font-weight:700;color:#0F172A;">445K</span>
                    </div>
                    <div style="display:flex;align-items:center;justify-content:space-between;">
                      <span style="color:#6B7280;font-size:12px;">YouTube</span>
                      <span data-count data-suffix="K" data-target="512" style="font-family:Inter,sans-serif;font-size:16px;font-weight:700;color:#0F172A;">512K</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div data-px data-fade="0.004" data-base-op="1" style="position:absolute;left:50%;bottom:22px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;z-index:2;pointer-events:none;">
        <span style="font-family:Inter,sans-serif;font-size:10.5px;font-weight:600;letter-spacing:.18em;color:#9CA3AF;text-transform:uppercase;">Scroll</span>
        <span data-bounce style="width:22px;height:34px;border:1.5px solid #D1D5DB;border-radius:12px;display:flex;justify-content:center;padding-top:6px;"><span style="width:3px;height:7px;border-radius:2px;background:#1D4ED8;"></span></span>
      </div>
    </header>

    <!-- THIN BAND -->
    <div style="position:relative;border-top:1px solid #E4E7EC;border-bottom:1px solid #E4E7EC;background:#F7F8FA;">
      <div style="max-width:1280px;margin:0 auto;padding:18px clamp(20px,5vw,64px);display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:6px 14px;text-align:center;font-size:14.5px;">
        <span data-band style="font-family:Inter,sans-serif;font-size:14px;font-weight:500;color:#6B7280;">Products</span>
        <span style="color:#D1D5DB;">·</span>
        <span data-band style="font-family:Inter,sans-serif;font-size:14px;font-weight:500;color:#6B7280;">Services</span>
        <span style="color:#D1D5DB;">·</span>
        <span data-band style="font-family:Inter,sans-serif;font-size:14px;font-weight:500;color:#6B7280;">Experiences</span>
        <span style="color:#D1D5DB;">·</span>
        <span data-band style="font-family:Inter,sans-serif;font-size:14px;font-weight:500;color:#6B7280;">Exposure</span>
        <span style="color:#9CA3AF;margin-left:6px;">— traded directly, no invoices.</span>
      </div>
    </div>

    <!-- HOW IT WORKS -->
    <section id="how" style="position:relative;max-width:1280px;margin:0 auto;padding:clamp(72px,11vh,120px) clamp(20px,5vw,64px);">
      <div data-reveal style="margin-bottom:48px;">
        <div style="font-family:Inter,sans-serif;font-size:12px;font-weight:600;letter-spacing:.14em;color:#1D4ED8;text-transform:uppercase;">How it works</div>
        <h2 style="font-family:Inter,sans-serif;font-weight:700;font-size:clamp(30px,4vw,44px);letter-spacing:-.03em;color:#0F172A;margin:14px 0 0;max-width:580px;line-height:1.1;">Three steps from sign-up to settled trade.</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;">
        <div data-reveal data-reveal-delay="0" style="background:#fff;border:1px solid #E4E7EC;border-radius:16px;padding:26px;box-shadow:0 1px 3px rgba(15,23,42,.04);transition:border-color .2s ease,transform .2s ease,box-shadow .2s ease;" data-h="border-color:#1D4ED8;transform:translateY(-4px);box-shadow:0 12px 28px rgba(15,23,42,.08);">
          <div style="font-family:Inter,sans-serif;font-size:28px;font-weight:700;color:#1D4ED8;">01</div>
          <h3 style="font-family:Inter,sans-serif;font-weight:700;font-size:20px;letter-spacing:-.02em;color:#0F172A;margin:16px 0 8px;">Build your profile</h3>
          <p style="color:#475569;font-size:14.5px;line-height:1.6;margin:0;">Connect your socials and show what you offer. We verify the numbers so trust is built in.</p>
        </div>
        <div data-reveal data-reveal-delay="90" style="background:#fff;border:1px solid #E4E7EC;border-radius:16px;padding:26px;box-shadow:0 1px 3px rgba(15,23,42,.04);transition:border-color .2s ease,transform .2s ease,box-shadow .2s ease;" data-h="border-color:#1D4ED8;transform:translateY(-4px);box-shadow:0 12px 28px rgba(15,23,42,.08);">
          <div style="font-family:Inter,sans-serif;font-size:28px;font-weight:700;color:#1D4ED8;">02</div>
          <h3 style="font-family:Inter,sans-serif;font-weight:700;font-size:20px;letter-spacing:-.02em;color:#0F172A;margin:16px 0 8px;">Find your match</h3>
          <p style="color:#475569;font-size:14.5px;line-height:1.6;margin:0;">Browse offers and creators. Filter by reach, niche, and the value on the table.</p>
        </div>
        <div data-reveal data-reveal-delay="180" style="background:#fff;border:1px solid #E4E7EC;border-radius:16px;padding:26px;box-shadow:0 1px 3px rgba(15,23,42,.04);transition:border-color .2s ease,transform .2s ease,box-shadow .2s ease;" data-h="border-color:#1D4ED8;transform:translateY(-4px);box-shadow:0 12px 28px rgba(15,23,42,.08);">
          <div style="font-family:Inter,sans-serif;font-size:28px;font-weight:700;color:#1D4ED8;">03</div>
          <h3 style="font-family:Inter,sans-serif;font-weight:700;font-size:20px;letter-spacing:-.02em;color:#0F172A;margin:16px 0 8px;">Trade and track</h3>
          <p style="color:#475569;font-size:14.5px;line-height:1.6;margin:0;">Agree the terms, deliver, and track every trade end to end in one place.</p>
        </div>
      </div>
    </section>

    <!-- DUAL VALUE PROPS -->
    <section style="position:relative;max-width:1280px;margin:0 auto;padding:0 clamp(20px,5vw,64px) clamp(40px,6vh,70px);">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:22px;">
        <div id="creators" data-reveal style="background:#fff;border:1px solid #E4E7EC;border-radius:20px;padding:clamp(26px,3.5vw,40px);box-shadow:0 1px 3px rgba(15,23,42,.04);">
          <div style="font-family:Inter,sans-serif;font-size:12px;font-weight:600;letter-spacing:.12em;color:#1D4ED8;text-transform:uppercase;">For creators</div>
          <h3 style="font-family:Inter,sans-serif;font-weight:700;font-size:clamp(24px,3vw,30px);letter-spacing:-.02em;color:#0F172A;margin:14px 0 22px;line-height:1.15;">Earn from the content you'd make anyway.</h3>
          <div style="display:flex;flex-direction:column;gap:15px;margin-bottom:30px;">
            <div style="display:flex;gap:12px;align-items:flex-start;"><span style="color:#1D4ED8;flex:0 0 auto;margin-top:1px;">◆</span><span style="font-size:15px;color:#334155;line-height:1.5;">Get paid in products you'd post about anyway.</span></div>
            <div style="display:flex;gap:12px;align-items:flex-start;"><span style="color:#1D4ED8;flex:0 0 auto;margin-top:1px;">◆</span><span style="font-size:15px;color:#334155;line-height:1.5;">Keep full creative control of every post.</span></div>
            <div style="display:flex;gap:12px;align-items:flex-start;"><span style="color:#1D4ED8;flex:0 0 auto;margin-top:1px;">◆</span><span style="font-size:15px;color:#334155;line-height:1.5;">Build a verified record that earns you tiers.</span></div>
            <div style="display:flex;gap:12px;align-items:flex-start;"><span style="color:#1D4ED8;flex:0 0 auto;margin-top:1px;">◆</span><span style="font-size:15px;color:#334155;line-height:1.5;">Cash deals optional — stack them on top.</span></div>
          </div>
          <a href="/register" style="color:#fff;background:#1D4ED8;text-decoration:none;font-size:15px;font-weight:600;padding:13px 22px;border-radius:11px;display:inline-flex;align-items:center;gap:9px;transition:background .15s ease,transform .15s ease,box-shadow .15s ease;" data-h="background:#1E40AF;transform:translateY(-2px);box-shadow:0 10px 26px rgba(29,78,216,.2);">Join as a creator <span style="font-size:16px;">→</span></a>
        </div>
        <div id="business" data-reveal data-reveal-delay="90" style="background:#fff;border:1px solid #E4E7EC;border-radius:20px;padding:clamp(26px,3.5vw,40px);box-shadow:0 1px 3px rgba(15,23,42,.04);">
          <div style="font-family:Inter,sans-serif;font-size:12px;font-weight:600;letter-spacing:.12em;color:#1D4ED8;text-transform:uppercase;">For businesses</div>
          <h3 style="font-family:Inter,sans-serif;font-weight:700;font-size:clamp(24px,3vw,30px);letter-spacing:-.02em;color:#0F172A;margin:14px 0 22px;line-height:1.15;">Reach real audiences without ad spend.</h3>
          <div style="display:flex;flex-direction:column;gap:15px;margin-bottom:30px;">
            <div style="display:flex;gap:12px;align-items:flex-start;"><span style="color:#1D4ED8;flex:0 0 auto;margin-top:1px;">◆</span><span style="font-size:15px;color:#334155;line-height:1.5;">Pay in what you already make — not cash.</span></div>
            <div style="display:flex;gap:12px;align-items:flex-start;"><span style="color:#1D4ED8;flex:0 0 auto;margin-top:1px;">◆</span><span style="font-size:15px;color:#334155;line-height:1.5;">Match with creators whose numbers are verified.</span></div>
            <div style="display:flex;gap:12px;align-items:flex-start;"><span style="color:#1D4ED8;flex:0 0 auto;margin-top:1px;">◆</span><span style="font-size:15px;color:#334155;line-height:1.5;">Put your product in front of the right niche.</span></div>
            <div style="display:flex;gap:12px;align-items:flex-start;"><span style="color:#1D4ED8;flex:0 0 auto;margin-top:1px;">◆</span><span style="font-size:15px;color:#334155;line-height:1.5;">Track results on every trade, start to finish.</span></div>
          </div>
          <a href="/register" style="color:#1D4ED8;background:#fff;border:1px solid #1D4ED8;text-decoration:none;font-size:15px;font-weight:600;padding:13px 22px;border-radius:11px;display:inline-flex;align-items:center;gap:9px;transition:background .15s ease,transform .15s ease;" data-h="background:#EFF6FF;transform:translateY(-2px);">List your business <span style="font-size:16px;">→</span></a>
        </div>
      </div>
    </section>

    <!-- TIERS -->
    <section id="tiers" style="position:relative;max-width:1280px;margin:0 auto;padding:clamp(40px,6vh,70px) clamp(20px,5vw,64px) clamp(72px,11vh,120px);">
      <div data-reveal style="text-align:center;margin-bottom:44px;">
        <div style="font-family:Inter,sans-serif;font-size:12px;font-weight:600;letter-spacing:.14em;color:#1D4ED8;text-transform:uppercase;">Creator tiers</div>
        <h2 style="font-family:Inter,sans-serif;font-weight:700;font-size:clamp(30px,4vw,44px);letter-spacing:-.03em;color:#0F172A;margin:14px 0 10px;line-height:1.1;">Tiers are earned, not bought.</h2>
        <p style="color:#475569;font-size:15px;margin:0;">Your tier reflects verified reach and a real trade record — nothing you can pay for.</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:16px;">
        <div data-reveal data-reveal-delay="0" style="background:#fff;border:1px solid #E4E7EC;border-radius:16px;padding:22px;box-shadow:0 1px 3px rgba(15,23,42,.04);transition:border-color .2s ease,transform .2s ease,box-shadow .2s ease;" data-h="border-color:#D1D5DB;transform:translateY(-4px);box-shadow:0 12px 28px rgba(15,23,42,.08);">
          <div style="width:18px;height:18px;background:#0891B2;transform:rotate(45deg);border-radius:3px;margin-bottom:16px;"></div>
          <div style="font-family:Inter,sans-serif;font-size:14px;font-weight:700;color:#0891B2;letter-spacing:.06em;">DIAMOND</div>
          <p style="color:#475569;font-size:13.5px;line-height:1.5;margin:10px 0 0;">Top-tier reach with a flawless trade record.</p>
        </div>
        <div data-reveal data-reveal-delay="70" style="background:#fff;border:1px solid #E4E7EC;border-radius:16px;padding:22px;box-shadow:0 1px 3px rgba(15,23,42,.04);transition:border-color .2s ease,transform .2s ease,box-shadow .2s ease;" data-h="border-color:#D1D5DB;transform:translateY(-4px);box-shadow:0 12px 28px rgba(15,23,42,.08);">
          <div style="width:18px;height:18px;background:#64748B;transform:rotate(45deg);border-radius:3px;margin-bottom:16px;"></div>
          <div style="font-family:Inter,sans-serif;font-size:14px;font-weight:700;color:#64748B;letter-spacing:.06em;">PLATINUM</div>
          <p style="color:#475569;font-size:13.5px;line-height:1.5;margin:10px 0 0;">Proven creators with consistent results.</p>
        </div>
        <div data-reveal data-reveal-delay="140" style="background:#fff;border:1px solid #E4E7EC;border-radius:16px;padding:22px;box-shadow:0 1px 3px rgba(15,23,42,.04);transition:border-color .2s ease,transform .2s ease,box-shadow .2s ease;" data-h="border-color:#D1D5DB;transform:translateY(-4px);box-shadow:0 12px 28px rgba(15,23,42,.08);">
          <div style="width:18px;height:18px;background:#CA8A04;transform:rotate(45deg);border-radius:3px;margin-bottom:16px;"></div>
          <div style="font-family:Inter,sans-serif;font-size:14px;font-weight:700;color:#CA8A04;letter-spacing:.06em;">GOLD</div>
          <p style="color:#475569;font-size:13.5px;line-height:1.5;margin:10px 0 0;">Established reach and reliable delivery.</p>
        </div>
        <div data-reveal data-reveal-delay="210" style="background:#fff;border:1px solid #E4E7EC;border-radius:16px;padding:22px;box-shadow:0 1px 3px rgba(15,23,42,.04);transition:border-color .2s ease,transform .2s ease,box-shadow .2s ease;" data-h="border-color:#D1D5DB;transform:translateY(-4px);box-shadow:0 12px 28px rgba(15,23,42,.08);">
          <div style="width:18px;height:18px;background:#6B7280;transform:rotate(45deg);border-radius:3px;margin-bottom:16px;"></div>
          <div style="font-family:Inter,sans-serif;font-size:14px;font-weight:700;color:#6B7280;letter-spacing:.06em;">SILVER</div>
          <p style="color:#475569;font-size:13.5px;line-height:1.5;margin:10px 0 0;">Growing audience with a solid history.</p>
        </div>
        <div data-reveal data-reveal-delay="280" style="background:#fff;border:1px solid #E4E7EC;border-radius:16px;padding:22px;box-shadow:0 1px 3px rgba(15,23,42,.04);transition:border-color .2s ease,transform .2s ease,box-shadow .2s ease;" data-h="border-color:#D1D5DB;transform:translateY(-4px);box-shadow:0 12px 28px rgba(15,23,42,.08);">
          <div style="width:18px;height:18px;background:#B45309;transform:rotate(45deg);border-radius:3px;margin-bottom:16px;"></div>
          <div style="font-family:Inter,sans-serif;font-size:14px;font-weight:700;color:#B45309;letter-spacing:.06em;">BRONZE</div>
          <p style="color:#475569;font-size:13.5px;line-height:1.5;margin:10px 0 0;">New to hyperr, building a track record.</p>
        </div>
      </div>
    </section>

    <!-- TRUST -->
    <section style="position:relative;background:#F7F8FA;border-top:1px solid #E4E7EC;border-bottom:1px solid #E4E7EC;">
      <div style="max-width:1280px;margin:0 auto;padding:clamp(72px,11vh,120px) clamp(20px,5vw,64px);">
        <div data-reveal style="margin-bottom:44px;">
          <div style="font-family:Inter,sans-serif;font-size:12px;font-weight:600;letter-spacing:.14em;color:#1D4ED8;text-transform:uppercase;">Trust &amp; safety</div>
          <h2 style="font-family:Inter,sans-serif;font-weight:700;font-size:clamp(30px,4vw,44px);letter-spacing:-.03em;color:#0F172A;margin:14px 0 0;max-width:600px;line-height:1.1;">Every trade is verified, tracked, and backed.</h2>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:18px;">
          <div data-reveal data-reveal-delay="0" style="background:#fff;border:1px solid #E4E7EC;border-radius:16px;padding:24px;transition:border-color .2s ease,transform .2s ease;" data-h="border-color:#D1D5DB;transform:translateY(-4px);">
            <div style="width:40px;height:40px;border-radius:11px;background:#EFF6FF;border:1px solid #DBEAFE;display:flex;align-items:center;justify-content:center;font-size:19px;color:#1D4ED8;margin-bottom:16px;">✓</div>
            <h3 style="font-family:Inter,sans-serif;font-weight:700;font-size:17px;color:#0F172A;margin:0 0 7px;">Verified socials</h3>
            <p style="color:#475569;font-size:13.5px;line-height:1.6;margin:0;">Every follower count is checked against the platform itself.</p>
          </div>
          <div data-reveal data-reveal-delay="70" style="background:#fff;border:1px solid #E4E7EC;border-radius:16px;padding:24px;transition:border-color .2s ease,transform .2s ease;" data-h="border-color:#D1D5DB;transform:translateY(-4px);">
            <div style="width:40px;height:40px;border-radius:11px;background:#EFF6FF;border:1px solid #DBEAFE;display:flex;align-items:center;justify-content:center;font-size:18px;color:#1D4ED8;margin-bottom:16px;">⇄</div>
            <h3 style="font-family:Inter,sans-serif;font-weight:700;font-size:17px;color:#0F172A;margin:0 0 7px;">Tracked trades</h3>
            <p style="color:#475569;font-size:13.5px;line-height:1.6;margin:0;">Each deal is logged end to end, with timestamps you can both see.</p>
          </div>
          <div data-reveal data-reveal-delay="140" style="background:#fff;border:1px solid #E4E7EC;border-radius:16px;padding:24px;transition:border-color .2s ease,transform .2s ease;" data-h="border-color:#D1D5DB;transform:translateY(-4px);">
            <div style="width:40px;height:40px;border-radius:11px;background:#EFF6FF;border:1px solid #DBEAFE;display:flex;align-items:center;justify-content:center;font-size:18px;color:#1D4ED8;margin-bottom:16px;">★</div>
            <h3 style="font-family:Inter,sans-serif;font-weight:700;font-size:17px;color:#0F172A;margin:0 0 7px;">Honest reviews</h3>
            <p style="color:#475569;font-size:13.5px;line-height:1.6;margin:0;">Reviews only unlock after a completed trade. No fakes, no padding.</p>
          </div>
          <div data-reveal data-reveal-delay="210" style="background:#fff;border:1px solid #E4E7EC;border-radius:16px;padding:24px;transition:border-color .2s ease,transform .2s ease;" data-h="border-color:#D1D5DB;transform:translateY(-4px);">
            <div style="width:40px;height:40px;border-radius:11px;background:#EFF6FF;border:1px solid #DBEAFE;display:flex;align-items:center;justify-content:center;font-size:18px;color:#1D4ED8;margin-bottom:16px;">⛨</div>
            <h3 style="font-family:Inter,sans-serif;font-weight:700;font-size:17px;color:#0F172A;margin:0 0 7px;">Dispute support</h3>
            <p style="color:#475569;font-size:13.5px;line-height:1.6;margin:0;">If a trade goes sideways, our team steps in to make it right.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FINAL CTA -->
    <section style="position:relative;max-width:1280px;margin:0 auto;padding:clamp(80px,12vh,130px) clamp(20px,5vw,64px);">
      <div data-reveal style="position:relative;background:radial-gradient(circle at 50% 0%, rgba(37,99,235,0.06), #fff 60%);border:1px solid #E4E7EC;border-radius:24px;padding:clamp(44px,7vw,76px) clamp(24px,5vw,64px);text-align:center;overflow:hidden;">
        <h2 style="font-family:Inter,sans-serif;font-weight:800;font-size:clamp(34px,5vw,56px);letter-spacing:-.035em;color:#0F172A;margin:0;line-height:1.05;">Ready to start trading?</h2>
        <p style="color:#475569;font-size:clamp(15px,1.5vw,18px);margin:18px auto 0;max-width:440px;">Set up your profile in minutes. The first trade is closer than you think.</p>
        <div style="display:flex;flex-wrap:wrap;gap:13px;justify-content:center;margin-top:34px;">
          <a href="/register" style="color:#fff;background:#1D4ED8;text-decoration:none;font-size:15.5px;font-weight:600;padding:14px 26px;border-radius:11px;display:inline-flex;align-items:center;gap:9px;transition:background .15s ease,transform .15s ease,box-shadow .15s ease;" data-h="background:#1E40AF;transform:translateY(-2px);box-shadow:0 10px 28px rgba(29,78,216,.22);">Join as a creator <span style="font-size:17px;">→</span></a>
          <a href="/register" style="color:#1D4ED8;background:#fff;border:1px solid #1D4ED8;text-decoration:none;font-size:15.5px;font-weight:600;padding:14px 26px;border-radius:11px;display:inline-flex;align-items:center;gap:9px;transition:background .15s ease,transform .15s ease;" data-h="background:#EFF6FF;transform:translateY(-2px);">List your business</a>
        </div>
      </div>
    </section>

    <!-- NEWSLETTER SIGNUP -->
    <section style="position:relative;max-width:1280px;margin:0 auto;padding:clamp(64px,10vh,96px) clamp(20px,5vw,64px);">
      <div data-reveal style="background:#F7F8FA;border:1px solid #E4E7EC;border-radius:20px;padding:clamp(40px,5vw,60px) clamp(24px,5vw,48px);text-align:center;">
        <h2 style="font-family:Inter,sans-serif;font-weight:700;font-size:clamp(24px,3.5vw,36px);letter-spacing:-.02em;margin:0 0 12px;color:#0F172A;">Stay in the loop</h2>
        <p style="color:#475569;font-size:clamp(14px,1.2vw,16px);margin:0 0 24px;max-width:520px;margin-left:auto;margin-right:auto;">Get updates on new creators, features, and trades from hyperr. No spam, just the good stuff.</p>
        <form data-newsletter-form style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:480px;margin:0 auto;">
          <input type="email" name="email" placeholder="Enter your email" required style="flex:1;min-width:220px;padding:14px 18px;border:1px solid #E4E7EC;border-radius:11px;background:#fff;color:#111827;font-size:14px;font-family:inherit;transition:border-color .2s ease,box-shadow .2s ease;" data-h="border-color:#1D4ED8;box-shadow:0 0 0 3px rgba(37,99,235,.12);" />
          <button type="submit" style="padding:14px 26px;background:#1D4ED8;border:none;border-radius:11px;color:#fff;font-weight:600;font-size:14px;font-family:inherit;cursor:pointer;transition:background .2s ease,transform .2s ease,box-shadow .2s ease;white-space:nowrap;" data-h="background:#1E40AF;transform:translateY(-2px);box-shadow:0 8px 20px rgba(29,78,216,.2);">Subscribe</button>
        </form>
        <p data-newsletter-error style="color:#DC2626;font-size:13px;margin:10px 0 0;display:none;font-family:Inter,sans-serif;"></p>
        <p style="color:#9CA3AF;font-size:12px;margin:16px 0 0;">We respect your inbox. Unsubscribe anytime.</p>
      </div>
    </section>

    <!-- FOOTER -->
    <footer style="position:relative;border-top:1px solid #E4E7EC;background:#F7F8FA;">
      <div style="max-width:1280px;margin:0 auto;padding:clamp(48px,7vh,72px) clamp(20px,5vw,64px) 40px;display:grid;grid-template-columns:minmax(200px,1.4fr) repeat(auto-fit,minmax(130px,1fr));gap:36px;">
        <div>
          <div style="display:inline-flex;align-items:center;gap:9px;">
             <svg viewBox="0 0 100 100" style="height:22px;width:auto;color:#1D4ED8;"><use href="#hyperr-swap"></use></svg>
             <span style="font-family:Inter,sans-serif;font-weight:700;font-size:23px;letter-spacing:-.04em;color:#111827;">hyperr</span>
           </div>
          <p style="color:#6B7280;font-size:13.5px;line-height:1.6;margin:14px 0 0;max-width:260px;">The barter marketplace where businesses and creators trade value for promotion.</p>
        </div>
        <div>
          <div style="font-family:Inter,sans-serif;font-size:11px;font-weight:600;letter-spacing:.1em;color:#9CA3AF;margin-bottom:16px;text-transform:uppercase;">Product</div>
          <div style="display:flex;flex-direction:column;gap:11px;">
            <a href="#how" style="color:#475569;text-decoration:none;font-size:14px;transition:color .15s ease;" data-h="color:#1D4ED8;">How it works</a>
            <a href="#creators" style="color:#475569;text-decoration:none;font-size:14px;transition:color .15s ease;" data-h="color:#1D4ED8;">For creators</a>
            <a href="#business" style="color:#475569;text-decoration:none;font-size:14px;transition:color .15s ease;" data-h="color:#1D4ED8;">For businesses</a>
            <a href="#tiers" style="color:#475569;text-decoration:none;font-size:14px;transition:color .15s ease;" data-h="color:#1D4ED8;">Tiers</a>
          </div>
        </div>
        <div>
          <div style="font-family:Inter,sans-serif;font-size:11px;font-weight:600;letter-spacing:.1em;color:#9CA3AF;margin-bottom:16px;text-transform:uppercase;">Company</div>
          <div style="display:flex;flex-direction:column;gap:11px;">
            <a href="/contact" style="color:#475569;text-decoration:none;font-size:14px;transition:color .15s ease;" data-h="color:#1D4ED8;">Contact</a>
          </div>
        </div>
        <div>
          <div style="font-family:Inter,sans-serif;font-size:11px;font-weight:600;letter-spacing:.1em;color:#9CA3AF;margin-bottom:16px;text-transform:uppercase;">Legal</div>
          <div style="display:flex;flex-direction:column;gap:11px;">
            <a href="/terms" style="color:#475569;text-decoration:none;font-size:14px;transition:color .15s ease;" data-h="color:#1D4ED8;">Terms of Service</a>
            <a href="/privacy" style="color:#475569;text-decoration:none;font-size:14px;transition:color .15s ease;" data-h="color:#1D4ED8;">Privacy Policy</a>
            <a href="/cookie-policy" style="color:#475569;text-decoration:none;font-size:14px;transition:color .15s ease;" data-h="color:#1D4ED8;">Cookie Policy</a>
          </div>
        </div>
      </div>
      <div style="max-width:1280px;margin:0 auto;padding:20px clamp(20px,5vw,64px) 36px;border-top:1px solid #E4E7EC;display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;align-items:center;">
        <div style="color:#9CA3AF;font-size:13px;font-family:Inter,sans-serif;">© 2026 hyperr. All rights reserved.</div>
        <div style="color:#9CA3AF;font-size:13px;">Made for creators &amp; businesses.</div>
      </div>
    </footer>

  </div>
`;

const FONT_HREF = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap";

const BASE_CSS = `html,body{margin:0;padding:0;background:#FFFFFF;}*{box-sizing:border-box;}::selection{background:#1D4ED8;color:#fff;}:focus-visible{outline:2px solid #1D4ED8;outline-offset:3px;border-radius:6px;}::placeholder{color:#9CA3AF;}@media (max-width:840px){[data-navlinks]{display:none !important;}}@media (prefers-reduced-motion: reduce){*{animation:none !important;}}.js-anim [data-reveal]{opacity:0;transform:translateY(20px);transition:opacity .4s cubic-bezier(.16,1,.3,1),transform .4s cubic-bezier(.16,1,.3,1);will-change:opacity,transform;}.js-anim [data-reveal].revealed{opacity:1;transform:none;}.js-anim [data-hero]{opacity:0;}`;

const rootStyle = {
  position: "relative",
  background: "#FFFFFF",
  color: "#111827",
  fontFamily: "Inter, system-ui, sans-serif",
  minHeight: "100vh",
  overflowX: "hidden",
  WebkitFontSmoothing: "antialiased",
};

export default function Landing() {
  const rootRef = useRef(null);

  useSEO({
    title: "hyperr — Trade products for promotion.",
    description: "A streamlined marketplace for businesses to trade products and services for high-impact promotions and creative content.",
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) root.classList.add("js-anim");

    if (!document.getElementById("hyperr-fonts")) {
      const fl = document.createElement("link");
      fl.id = "hyperr-fonts"; fl.rel = "stylesheet"; fl.href = FONT_HREF;
      document.head.appendChild(fl);
    }
    if (!document.getElementById("hyperr-base-css")) {
      const st = document.createElement("style");
      st.id = "hyperr-base-css"; st.textContent = BASE_CSS;
      document.head.appendChild(st);
    }

    // hover wiring
    const hoverCleanup = [];
    Array.prototype.slice.call(root.querySelectorAll("[data-h]")).forEach((el) => {
      const hov = el.getAttribute("data-h");
      let saved = "";
      const enter = () => { saved = el.style.cssText; hov.split(";").forEach((d) => { const i = d.indexOf(":"); if (i > 0) el.style.setProperty(d.slice(0, i).trim(), d.slice(i + 1).trim()); }); };
      const leave = () => { el.style.cssText = saved; };
      el.addEventListener("mouseenter", enter); el.addEventListener("mouseleave", leave);
      el.addEventListener("focus", enter, true); el.addEventListener("blur", leave, true);
      hoverCleanup.push(() => { el.removeEventListener("mouseenter", enter); el.removeEventListener("mouseleave", leave); el.removeEventListener("focus", enter, true); el.removeEventListener("blur", leave, true); });
    });

    // nav scroll
    const nav = root.querySelector("[data-nav]");
    const onScrollNav = () => {
      if (!nav) return;
      const on = window.scrollY > 24;
      nav.style.background = on ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0)";
      nav.style.backdropFilter = on ? "blur(14px)" : "blur(0px)";
      nav.style.webkitBackdropFilter = on ? "blur(14px)" : "blur(0px)";
      nav.style.borderBottomColor = on ? "#E4E7EC" : "transparent";
    };
    window.addEventListener("scroll", onScrollNav, { passive: true });
    onScrollNav();

    // count-up
    const counts = Array.prototype.slice.call(root.querySelectorAll("[data-count]"));
    const fmt = (el, v) => (el.getAttribute("data-prefix") || "") + Math.round(v).toLocaleString() + (el.getAttribute("data-suffix") || "");
    const runCount = (el) => { const target = parseFloat(el.getAttribute("data-target")) || 0; const dur = 950, start = performance.now(); const tick = (now) => { const p = Math.min(1, (now - start) / dur); const e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(el, target * e); if (p < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); };
    let ctTimer = null;
    if (!reduce) { counts.forEach((el) => { el.textContent = fmt(el, 0); }); ctTimer = setTimeout(() => counts.forEach(runCount), 560); }

    // scroll reveals — CSS hides via .js-anim; JS only toggles .revealed class
    let io = null;
    const reveals = Array.prototype.slice.call(root.querySelectorAll("[data-reveal]"));
    if (!reduce && "IntersectionObserver" in window) {
      io = new IntersectionObserver((entries) => { entries.forEach((en) => { if (en.isIntersecting) { const el = en.target; const d = parseFloat(el.getAttribute("data-reveal-delay")) || 0; setTimeout(() => { el.classList.add("revealed"); }, d); io.unobserve(el); } }); }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
      reveals.forEach((el) => io.observe(el));
    }

    // hero entrance — CSS hides via .js-anim; JS sets transforms & transitions only
    let hio = null;
    if (!reduce && "IntersectionObserver" in window) {
      const heroNodes = Array.prototype.slice.call(root.querySelectorAll("[data-hero]"));
      const fromState = (t) => t === "left" ? "translateX(-40px) scale(.97)" : t === "right" ? "translateX(40px) scale(.97)" : t === "swap" ? "rotate(-200deg) scale(.3)" : t === "pill" ? "translateX(-50%) translateY(8px) scale(.7)" : "translateY(20px)";
      const toState = (t) => t === "pill" ? "translateX(-50%)" : "none";
      heroNodes.forEach((el) => {
        const t = el.getAttribute("data-hero"); const delay = parseFloat(el.getAttribute("data-hero-delay")) || 0;
        const spring = (t === "swap" || t === "pill"); const dur = spring ? 400 : 420; const ease = spring ? "cubic-bezier(.34,1.56,.64,1)" : "cubic-bezier(.16,1,.3,1)";
        el.style.transform = fromState(t); el.style.willChange = "opacity, transform";
        el.style.transition = "opacity " + dur + "ms " + ease + " " + delay + "ms, transform " + dur + "ms " + ease + " " + delay + "ms";
      });
      hio = new IntersectionObserver((entries) => { entries.forEach((en) => { if (en.isIntersecting) { const el = en.target; el.style.opacity = "1"; el.style.transform = toState(el.getAttribute("data-hero")); hio.unobserve(el); } }); }, { threshold: 0 });
      heroNodes.forEach((el) => hio.observe(el));
    }

    // band cycle
    let band = null;
    const bandWords = Array.prototype.slice.call(root.querySelectorAll("[data-band]"));
    if (!reduce && bandWords.length) {
      bandWords.forEach((w) => { w.style.transition = "color .45s ease"; });
      let bi = 0;
      band = setInterval(() => { bandWords.forEach((w, i) => { const on = (i === bi); w.style.color = on ? "#1D4ED8" : "#6B7280"; w.style.fontWeight = on ? 600 : 500; }); bi = (bi + 1) % bandWords.length; }, 950);
    }

    const bounce = root.querySelector("[data-bounce] > span");

    // newsletter signup
    const form = root.querySelector("[data-newsletter-form]");
    if (form) {
      const input = form.querySelector('input[type="email"]');
      const errEl = form.parentElement.querySelector("[data-newsletter-error]");
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      const clearError = () => { if (errEl) { errEl.style.display = "none"; errEl.textContent = ""; } };
      if (input) input.addEventListener("input", clearError);

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = input?.value?.trim();
        if (!email) return;

        if (!emailRegex.test(email)) {
          if (errEl) { errEl.textContent = "Please enter a valid email address."; errEl.style.color = "#DC2626"; errEl.style.display = "block"; }
          return;
        }
        clearError();

        const btn = form.querySelector("button");
        btn.disabled = true;
        btn.textContent = "Subscribing…";
        try {
          const res = await base44.functions.invoke('sendNewsletterWelcome', { email });
          if (res.data?.error) throw new Error(res.data.error);
          input.value = "";
          if (errEl) { errEl.textContent = "You're in — check your inbox"; errEl.style.color = "#059669"; errEl.style.display = "block"; }
          btn.textContent = "✓ Subscribed";
          setTimeout(() => { btn.textContent = "Subscribe"; btn.disabled = false; if (errEl) { errEl.style.display = "none"; } }, 5000);
        } catch (err) {
          console.error("Newsletter signup failed:", err);
          const msg = err?.response?.data?.error || err?.message || "Something went wrong. Please try again.";
          if (errEl) { errEl.textContent = msg; errEl.style.color = "#DC2626"; errEl.style.display = "block"; }
          btn.textContent = "Subscribe";
          btn.disabled = false;
        }
      });
    }

    // parallax engine
    const pxEls = Array.prototype.slice.call(root.querySelectorAll("[data-px]")).map((el) => ({ el, sy: parseFloat(el.dataset.sy) || 0, mx: parseFloat(el.dataset.mx) || 0, my: parseFloat(el.dataset.my) || 0, rx: parseFloat(el.dataset.rx) || 0, ry: parseFloat(el.dataset.ry) || 0, fade: parseFloat(el.dataset.fade) || 0, baseOp: (el.dataset.baseOp != null) ? parseFloat(el.dataset.baseOp) : null }));
    const floatWrap = root.querySelector("[data-floatwrap]");
    let raf = null, onScroll = null, onMove = null;

    if (reduce) {
      if (floatWrap) floatWrap.style.opacity = "1";
      pxEls.forEach((p) => { if (p.baseOp != null) p.el.style.opacity = String(p.baseOp); });
    } else {
      if (floatWrap) floatWrap.style.transition = "none";
      let tScroll = window.scrollY, cScroll = window.scrollY;
      let tmx = 0, tmy = 0, cmx = 0, cmy = 0;
      onScroll = () => { tScroll = window.scrollY; };
      window.addEventListener("scroll", onScroll, { passive: true });
      onMove = (e) => { tmx = (e.clientX / window.innerWidth - 0.5) * 2; tmy = (e.clientY / window.innerHeight - 0.5) * 2; };
      window.addEventListener("pointermove", onMove, { passive: true });
      const t0 = performance.now();
      const frame = (now) => {
        cScroll += (tScroll - cScroll) * 0.16; cmx += (tmx - cmx) * 0.07; cmy += (tmy - cmy) * 0.07;
        const t = (now - t0) / 1000;
        if (floatWrap) floatWrap.style.opacity = Math.max(0, Math.min(1, (t - 0.2) / 0.9)).toFixed(3);
        for (let i = 0; i < pxEls.length; i++) {
          const p = pxEls[i]; const ty = cScroll * p.sy + cmy * p.my; const tx = cmx * p.mx;
          let tr = "translate3d(" + tx.toFixed(2) + "px," + ty.toFixed(2) + "px,0)";
          if (p.rx || p.ry) tr += " rotateX(" + (-cmy * p.rx).toFixed(2) + "deg) rotateY(" + (cmx * p.ry).toFixed(2) + "deg)";
          p.el.style.transform = tr;
          if (p.fade || p.baseOp != null) { const base = (p.baseOp != null) ? p.baseOp : 1; const f = p.fade ? Math.max(0, 1 - cScroll * p.fade) : 1; p.el.style.opacity = (base * f).toFixed(3); }
        }
        if (bounce) bounce.style.transform = "translateY(" + (Math.sin(t * 2.4) * 3).toFixed(2) + "px)";
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    }

    // Safety: reveal anything still hidden after 2s (in case IO fails or doesn't fire)
    const safety = setTimeout(() => {
      root.querySelectorAll("[data-reveal]:not(.revealed)").forEach((el) => el.classList.add("revealed"));
      root.querySelectorAll("[data-hero]").forEach((el) => { if (!el.style.opacity || el.style.opacity === "0") { el.style.opacity = "1"; el.style.transform = el.getAttribute("data-hero") === "pill" ? "translateX(-50%)" : "none"; } });
    }, 2000);

    return () => {
      clearTimeout(safety);
      window.removeEventListener("scroll", onScrollNav);
      if (onScroll) window.removeEventListener("scroll", onScroll);
      if (onMove) window.removeEventListener("pointermove", onMove);
      if (io) io.disconnect();
      if (hio) hio.disconnect();
      if (ctTimer) clearTimeout(ctTimer);
      if (band) clearInterval(band);
      if (raf) cancelAnimationFrame(raf);
      hoverCleanup.forEach((fn) => fn());
    };
  }, []);

  return <div ref={rootRef} style={rootStyle} dangerouslySetInnerHTML={{ __html: MARKUP }} />;
}