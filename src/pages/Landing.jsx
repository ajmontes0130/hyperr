import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import HyperrLogo from "@/components/HyperrLogo";

const MARKUP = `
  <!-- symbol defs -->
  <svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <symbol id="hyperr-swap" viewBox="0 0 100 100"><g fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"><path d="M24 34 H58" /><path d="M50 24 L71 34 L50 44" /><path d="M76 66 H42" /><path d="M50 56 L29 66 L50 76" /></g></symbol>
    <symbol id="hyperr-whale" viewBox="0 0 240 96"><path d="M16,56 C16,44 30,38 52,37 C104,34 150,34 188,40 C200,42 210,40 220,34 L236,22 C228,33 226,38 232,44 L236,68 C226,60 214,58 200,58 C150,62 104,64 56,60 C30,58 16,68 16,56 Z"></path><path d="M84,60 C92,74 110,80 122,75 C112,69 98,64 92,59 Z"></path></symbol>
  </svg>

  <!-- FIXED DEEP PARALLAX LAYERS -->
  <div aria-hidden="true" style="position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;">
    <div data-px data-sy="0.018" data-mx="-14" data-my="-10" style="position:absolute;inset:-10% -10% -10% -10%;background-image:linear-gradient(rgba(45,212,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(45,212,255,.05) 1px,transparent 1px);background-size:66px 66px;-webkit-mask-image:radial-gradient(120% 80% at 50% 18%,#000,transparent 72%);mask-image:radial-gradient(120% 80% at 50% 18%,#000,transparent 72%);"></div>
    <div data-px data-sy="0.05" data-mx="-30" data-my="-22" style="position:absolute;left:50%;top:34%;width:min(900px,120vw);height:min(900px,120vw);transform:translate(-50%,-50%);">
      <div data-glow style="position:absolute;inset:0;background:radial-gradient(circle,rgba(45,212,255,.18),rgba(45,212,255,0) 62%);filter:blur(10px);"></div>
    </div>
    <div data-px data-sy="0.09" data-mx="22" data-my="16" style="position:absolute;left:74%;top:64%;width:min(620px,90vw);height:min(620px,90vw);transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(255,77,109,.09),rgba(255,77,109,0) 64%);filter:blur(14px);"></div>
    <div data-whales data-px data-sy="0.06" data-my="10" style="position:absolute;inset:0;-webkit-mask-image:linear-gradient(to bottom,transparent,#000 14%,#000 84%,transparent);mask-image:linear-gradient(to bottom,transparent,#000 14%,#000 84%,transparent);">
      <div data-whale data-speed="20" data-dir="-1" data-bob="5" data-phase="2.3" style="position:absolute;left:0;top:24%;width:230px;opacity:.06;filter:blur(5px);will-change:transform;"><svg viewBox="0 0 240 96" style="width:100%;height:auto;display:block;fill:#173343;"><use href="#hyperr-whale"></use></svg></div>
      <div data-whale data-speed="24" data-dir="1" data-bob="6" data-phase="0.2" style="position:absolute;left:0;top:15%;width:262px;opacity:.085;filter:blur(4px);will-change:transform;"><svg viewBox="0 0 240 96" style="width:100%;height:auto;display:block;fill:#173343;"><use href="#hyperr-whale"></use></svg></div>
      <div data-whale data-speed="33" data-dir="-1" data-bob="7" data-phase="1.1" style="position:absolute;left:0;top:58%;width:300px;opacity:.1;filter:blur(3px);will-change:transform;"><svg viewBox="0 0 240 96" style="width:100%;height:auto;display:block;fill:#1A3A4D;"><use href="#hyperr-whale"></use></svg></div>
      <div data-whale data-speed="44" data-dir="1" data-bob="9" data-phase="0.6" style="position:absolute;left:0;top:42%;width:360px;opacity:.12;filter:blur(2px);will-change:transform;"><svg viewBox="0 0 240 96" style="width:100%;height:auto;display:block;fill:#1C404F;"><use href="#hyperr-whale"></use></svg></div>
      <div data-whale data-speed="56" data-dir="1" data-bob="10" data-phase="1.7" style="position:absolute;left:0;top:78%;width:420px;opacity:.14;filter:blur(1.5px);will-change:transform;"><svg viewBox="0 0 240 96" style="width:100%;height:auto;display:block;fill:#1E4658;"><use href="#hyperr-whale"></use></svg></div>
    </div>
    <div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(10,14,20,.55),rgba(10,14,20,0) 22%,rgba(10,14,20,0) 70%,rgba(10,14,20,.8));"></div>
  </div>

  <!-- FOREGROUND -->
  <div style="position:relative;z-index:1;">

    <!-- NAV -->
    <nav data-nav style="position:fixed;top:0;left:0;right:0;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:15px clamp(20px,5vw,64px);border-bottom:1px solid transparent;transition:background .25s ease,border-color .25s ease,backdrop-filter .25s ease;">
      <a href="#top" style="display:inline-flex;align-items:center;gap:10px;text-decoration:none;">
         <svg viewBox="0 0 100 100" style="height:24px;width:auto;color:#2DD4FF;filter:drop-shadow(0 0 7px rgba(45,212,255,.65)) drop-shadow(0 0 16px rgba(45,212,255,.32));"><use href="#hyperr-swap"></use></svg>
         <span style="font-family:Bricolage Grotesque,sans-serif;font-weight:800;font-size:23px;letter-spacing:-.04em;color:#2DD4FF;">hyperr</span>
       </a>
      <div data-navlinks style="display:flex;align-items:center;gap:30px;">
        <a href="#how" style="color:#8C97A3;text-decoration:none;font-size:14.5px;font-weight:500;transition:color .15s ease;" data-h="color:#EAF1F7;">How it works</a>
        <a href="#creators" style="color:#8C97A3;text-decoration:none;font-size:14.5px;font-weight:500;transition:color .15s ease;" data-h="color:#EAF1F7;">For creators</a>
        <a href="#business" style="color:#8C97A3;text-decoration:none;font-size:14.5px;font-weight:500;transition:color .15s ease;" data-h="color:#EAF1F7;">For businesses</a>
        <a href="#tiers" style="color:#8C97A3;text-decoration:none;font-size:14.5px;font-weight:500;transition:color .15s ease;" data-h="color:#EAF1F7;">Tiers</a>
      </div>
      <div style="display:flex;align-items:center;gap:12px;">
        <a href="/login" style="color:#EAF1F7;text-decoration:none;font-size:14.5px;font-weight:600;padding:9px 16px;border-radius:10px;border:1px solid #34404F;transition:background .15s ease,border-color .15s ease;" data-h="background:rgba(255,255,255,.05);">Log in</a>
        <a href="/register" style="color:#06303B;background:#2DD4FF;text-decoration:none;font-size:14.5px;font-weight:600;padding:10px 18px;border-radius:10px;transition:background .15s ease,transform .15s ease,box-shadow .15s ease;" data-h="background:#5CDEFF;transform:translateY(-2px);box-shadow:0 8px 22px rgba(45,212,255,.3);">Sign up</a>
      </div>
    </nav>

    <!-- HERO STAGE -->
    <header id="top" style="position:relative;min-height:clamp(660px,94vh,940px);max-width:1280px;margin:0 auto;padding:clamp(120px,16vh,176px) clamp(20px,5vw,64px) clamp(40px,6vh,72px);display:flex;align-items:center;overflow:visible;">
      <div data-px data-sy="0.14" data-mx="-46" data-my="-30" style="position:absolute;left:clamp(-40px,3vw,40px);top:46%;transform:translateY(-50%);pointer-events:none;z-index:0;">
        <svg viewBox="0 0 100 100" style="height:min(112vh,940px);width:auto;color:#2DD4FF;opacity:.05;filter:blur(2px) drop-shadow(0 0 60px rgba(45,212,255,.35));"><use href="#hyperr-swap"></use></svg>
      </div>
      <div data-floatwrap style="position:absolute;inset:0;z-index:1;pointer-events:none;opacity:0;transition:opacity .9s ease .2s;">
        <div data-px data-sy="-0.20" data-fade="0.0016" data-base-op="0.55" data-mx="32" data-my="22" style="position:absolute;left:6%;top:23%;display:inline-flex;align-items:center;gap:8px;background:rgba(18,24,35,.72);border:1px solid #25303F;border-radius:999px;padding:8px 13px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);box-shadow:0 12px 30px rgba(0,0,0,.4);">
          <span style="width:7px;height:7px;border-radius:50%;background:#2DD4FF;box-shadow:0 0 9px #2DD4FF;"></span>
          <span style="font-family:JetBrains Mono,monospace;font-size:11.5px;color:#EAF1F7;letter-spacing:.02em;">$150 · free dinner</span>
        </div>
        <div data-px data-sy="-0.13" data-fade="0.0018" data-base-op="0.5" data-mx="-26" data-my="18" style="position:absolute;left:3%;top:62%;display:inline-flex;align-items:center;gap:8px;background:rgba(18,24,35,.72);border:1px solid rgba(255,194,71,.34);border-radius:999px;padding:8px 13px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);box-shadow:0 12px 30px rgba(0,0,0,.4);">
          <span style="color:#FFC247;font-size:12px;">◆</span>
          <span style="font-family:JetBrains Mono,monospace;font-size:11.5px;color:#FFC247;letter-spacing:.04em;">GOLD tier</span>
        </div>
        <div data-px data-sy="-0.28" data-fade="0.0017" data-base-op="0.55" data-mx="20" data-my="15" style="position:absolute;right:30%;top:15%;display:inline-flex;align-items:center;gap:8px;background:rgba(18,24,35,.72);border:1px solid #25303F;border-radius:999px;padding:8px 13px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);box-shadow:0 12px 30px rgba(0,0,0,.4);">
          <span style="font-family:JetBrains Mono,monospace;font-size:11.5px;color:#8C97A3;">reach</span>
          <span style="font-family:JetBrains Mono,monospace;font-size:11.5px;color:#EAF1F7;letter-spacing:.02em;">957K</span>
        </div>
        <div data-px data-sy="-0.22" data-fade="0.0015" data-base-op="0.5" data-mx="-22" data-my="24" style="position:absolute;right:5%;top:74%;display:inline-flex;align-items:center;gap:8px;background:rgba(6,48,59,.66);border:1px solid #2EE6A6;border-radius:999px;padding:8px 13px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);box-shadow:0 12px 30px rgba(0,0,0,.4);">
          <span style="width:7px;height:7px;border-radius:50%;background:#2EE6A6;"></span>
          <span style="font-family:JetBrains Mono,monospace;font-size:11.5px;color:#2EE6A6;letter-spacing:.04em;">trade complete</span>
        </div>
        <div data-px data-sy="-0.16" data-fade="0.0019" data-base-op="0.42" data-mx="26" data-my="-14" style="position:absolute;left:40%;top:9%;display:inline-flex;align-items:center;gap:8px;background:rgba(18,24,35,.7);border:1px solid #25303F;border-radius:999px;padding:7px 12px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);">
          <span style="font-family:JetBrains Mono,monospace;font-size:11px;color:#8C97A3;letter-spacing:.02em;">$270 · 3-mo pass</span>
        </div>
      </div>
      <div style="position:relative;z-index:2;display:flex;flex-wrap:wrap;align-items:center;gap:clamp(36px,5vw,72px);width:100%;">
        <div data-px data-sy="0.05" data-my="6" style="flex:1 1 440px;min-width:300px;">
          <div data-hero="rise" data-hero-delay="0" style="display:inline-flex;align-items:center;gap:9px;padding:7px 13px;border:1px solid #25303F;border-radius:999px;background:rgba(18,24,35,.6);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);">
            <span style="width:7px;height:7px;border-radius:50%;background:#2DD4FF;box-shadow:0 0 10px #2DD4FF;"></span>
            <span style="font-family:JetBrains Mono,monospace;font-size:11.5px;letter-spacing:.14em;color:#8C97A3;">THE BARTER MARKETPLACE</span>
          </div>
          <h1 data-hero="rise" data-hero-delay="90" style="font-family:Bricolage Grotesque,sans-serif;font-weight:800;font-size:clamp(44px,6.4vw,80px);line-height:1.0;letter-spacing:-.04em;margin:22px 0 0;">Trade products for <span style="color:#2DD4FF;text-shadow:0 0 24px rgba(45,212,255,.45);">promotion.</span></h1>
          <p data-hero="rise" data-hero-delay="180" style="color:#8C97A3;font-size:clamp(16px,1.5vw,19px);line-height:1.55;max-width:480px;margin:22px 0 0;">hyperr connects businesses and creators to swap real value — products, services, experiences — for content and reach. Cash potential.</p>
          <div data-hero="rise" data-hero-delay="270" style="display:flex;flex-wrap:wrap;gap:13px;margin-top:34px;">
            <a href="/register" style="color:#4B1320;background:#FF4D6D;text-decoration:none;font-size:15.5px;font-weight:600;padding:14px 24px;border-radius:11px;display:inline-flex;align-items:center;gap:9px;transition:background .15s ease,transform .15s ease,box-shadow .15s ease;" data-h="background:#FF6B85;transform:translateY(-2px);box-shadow:0 10px 28px rgba(255,77,109,.32);">Join as a creator <span style="font-size:17px;">→</span></a>
            <a href="/register" style="color:#06303B;background:#2DD4FF;text-decoration:none;font-size:15.5px;font-weight:600;padding:14px 24px;border-radius:11px;display:inline-flex;align-items:center;gap:9px;transition:background .15s ease,transform .15s ease,box-shadow .15s ease;" data-h="background:#5CDEFF;transform:translateY(-2px);box-shadow:0 10px 28px rgba(45,212,255,.32);">List your business</a>
          </div>
        </div>
        <div style="flex:1 1 430px;min-width:300px;display:flex;justify-content:center;perspective:1200px;">
          <div data-hero="right" data-hero-delay="120" style="position:relative;width:100%;max-width:540px;">
            <div data-px data-sy="-0.06" data-mx="20" data-my="14" data-rx="5.5" data-ry="7" style="position:relative;transform-style:preserve-3d;will-change:transform;">
              <div data-hero="pill" data-hero-delay="1000" style="position:absolute;top:-15px;left:50%;transform:translateX(-50%);z-index:4;">
                <div style="display:inline-flex;align-items:center;gap:8px;background:#06303B;color:#2EE6A6;border:1px solid #2EE6A6;padding:7px 15px;border-radius:999px;font-family:JetBrains Mono,monospace;font-size:11.5px;font-weight:600;letter-spacing:.08em;box-shadow:0 8px 24px rgba(46,230,166,.22);">
                  <span style="width:7px;height:7px;border-radius:50%;background:#2EE6A6;"></span>COMPLETED
                </div>
              </div>
              <div style="position:relative;z-index:2;display:flex;align-items:center;gap:0;">
                <div data-hero="left" data-hero-delay="180" style="flex:1 1 0;min-width:0;background:#121823;border:1px solid #25303F;border-radius:16px;padding:18px;box-shadow:0 24px 56px rgba(0,0,0,.5);">
                  <div style="font-family:JetBrains Mono,monospace;font-size:10.5px;letter-spacing:.1em;color:#2DD4FF;">BUSINESS OFFER</div>
                  <div style="font-family:Bricolage Grotesque,sans-serif;font-weight:700;font-size:19px;letter-spacing:-.02em;margin-top:11px;line-height:1.15;">Free dinner for 2</div>
                  <div style="color:#8C97A3;font-size:12.5px;margin-top:5px;">Lumen Bistro · Austin</div>
                  <div style="margin-top:15px;padding-top:13px;border-top:1px solid #25303F;display:flex;align-items:baseline;gap:7px;">
                    <span data-count data-prefix="$" data-target="150" style="font-family:JetBrains Mono,monospace;font-size:22px;font-weight:600;color:#EAF1F7;">$150</span>
                    <span style="color:#5C6672;font-size:11.5px;">est. value</span>
                  </div>
                </div>
                <div data-hero="swap" data-hero-delay="520" style="flex:0 0 auto;margin:0 -16px;z-index:3;">
                  <div style="width:48px;height:48px;border-radius:50%;background:#1B2330;border:1px solid #34404F;display:flex;align-items:center;justify-content:center;font-size:22px;color:#2DD4FF;box-shadow:0 8px 22px rgba(0,0,0,.5),0 0 18px rgba(45,212,255,.25);">⇄</div>
                </div>
                <div data-hero="right" data-hero-delay="240" style="flex:1 1 0;min-width:0;background:#121823;border:1px solid #25303F;border-radius:16px;padding:18px;box-shadow:0 24px 56px rgba(0,0,0,.5);">
                  <div style="display:flex;align-items:center;gap:11px;">
                    <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#1B2330,#25303F);border:1px solid #34404F;display:flex;align-items:center;justify-content:center;font-family:JetBrains Mono,monospace;font-size:13px;font-weight:600;color:#7FE9FF;flex:0 0 auto;">KT</div>
                    <div style="min-width:0;">
                      <div style="font-family:Bricolage Grotesque,sans-serif;font-weight:700;font-size:17px;letter-spacing:-.02em;">Kai Tanaka</div>
                      <div style="font-family:JetBrains Mono,monospace;font-size:11px;color:#FFC247;letter-spacing:.04em;margin-top:1px;">◆ GOLD</div>
                    </div>
                  </div>
                  <div style="margin-top:15px;padding-top:13px;border-top:1px solid #25303F;display:flex;flex-direction:column;gap:9px;">
                    <div style="display:flex;align-items:center;justify-content:space-between;">
                      <span style="color:#8C97A3;font-size:12px;">Instagram</span>
                      <span data-count data-suffix="K" data-target="445" style="font-family:JetBrains Mono,monospace;font-size:16px;font-weight:600;color:#EAF1F7;">445K</span>
                    </div>
                    <div style="display:flex;align-items:center;justify-content:space-between;">
                      <span style="color:#8C97A3;font-size:12px;">YouTube</span>
                      <span data-count data-suffix="K" data-target="512" style="font-family:JetBrains Mono,monospace;font-size:16px;font-weight:600;color:#EAF1F7;">512K</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div data-px data-fade="0.004" data-base-op="1" style="position:absolute;left:50%;bottom:22px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;z-index:2;pointer-events:none;">
        <span style="font-family:JetBrains Mono,monospace;font-size:10.5px;letter-spacing:.18em;color:#5C6672;">SCROLL</span>
        <span data-bounce style="width:22px;height:34px;border:1.5px solid #34404F;border-radius:12px;display:flex;justify-content:center;padding-top:6px;"><span style="width:3px;height:7px;border-radius:2px;background:#2DD4FF;"></span></span>
      </div>
    </header>

    <!-- THIN BAND -->
    <div style="position:relative;border-top:1px solid #25303F;border-bottom:1px solid #25303F;background:rgba(12,17,26,.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);">
      <div style="max-width:1280px;margin:0 auto;padding:18px clamp(20px,5vw,64px);display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:6px 14px;text-align:center;font-size:14.5px;">
        <span data-band style="font-family:JetBrains Mono,monospace;font-size:14px;color:#EAF1F7;">Products</span>
        <span style="color:#34404F;">·</span>
        <span data-band style="font-family:JetBrains Mono,monospace;font-size:14px;color:#EAF1F7;">Services</span>
        <span style="color:#34404F;">·</span>
        <span data-band style="font-family:JetBrains Mono,monospace;font-size:14px;color:#EAF1F7;">Experiences</span>
        <span style="color:#34404F;">·</span>
        <span data-band style="font-family:JetBrains Mono,monospace;font-size:14px;color:#EAF1F7;">Exposure</span>
        <span style="color:#5C6672;margin-left:6px;">— traded directly, no invoices.</span>
      </div>
    </div>

    <!-- HOW IT WORKS -->
    <section id="how" style="position:relative;max-width:1280px;margin:0 auto;padding:clamp(72px,11vh,120px) clamp(20px,5vw,64px);">
      <div data-reveal style="margin-bottom:48px;">
        <div style="font-family:JetBrains Mono,monospace;font-size:12px;letter-spacing:.14em;color:#2DD4FF;">HOW IT WORKS</div>
        <h2 style="font-family:Bricolage Grotesque,sans-serif;font-weight:700;font-size:clamp(30px,4vw,46px);letter-spacing:-.03em;margin:14px 0 0;max-width:580px;line-height:1.05;">Three steps from sign-up to settled trade.</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;">
        <div data-reveal data-reveal-delay="0" style="background:rgba(18,24,35,.82);border:1px solid #25303F;border-radius:16px;padding:26px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);transition:border-color .2s ease,transform .2s ease;" data-h="border-color:#34404F;transform:translateY(-4px);">
          <div style="font-family:JetBrains Mono,monospace;font-size:28px;font-weight:600;color:#2DD4FF;">01</div>
          <h3 style="font-family:Bricolage Grotesque,sans-serif;font-weight:700;font-size:20px;letter-spacing:-.02em;margin:16px 0 8px;">Build your profile</h3>
          <p style="color:#8C97A3;font-size:14.5px;line-height:1.55;margin:0;">Connect your socials and show what you offer. We verify the numbers so trust is built in.</p>
        </div>
        <div data-reveal data-reveal-delay="90" style="background:rgba(18,24,35,.82);border:1px solid #25303F;border-radius:16px;padding:26px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);transition:border-color .2s ease,transform .2s ease;" data-h="border-color:#34404F;transform:translateY(-4px);">
          <div style="font-family:JetBrains Mono,monospace;font-size:28px;font-weight:600;color:#2DD4FF;">02</div>
          <h3 style="font-family:Bricolage Grotesque,sans-serif;font-weight:700;font-size:20px;letter-spacing:-.02em;margin:16px 0 8px;">Find your match</h3>
          <p style="color:#8C97A3;font-size:14.5px;line-height:1.55;margin:0;">Browse offers and creators. Filter by reach, niche, and the value on the table.</p>
        </div>
        <div data-reveal data-reveal-delay="180" style="background:rgba(18,24,35,.82);border:1px solid #25303F;border-radius:16px;padding:26px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);transition:border-color .2s ease,transform .2s ease;" data-h="border-color:#34404F;transform:translateY(-4px);">
          <div style="font-family:JetBrains Mono,monospace;font-size:28px;font-weight:600;color:#2DD4FF;">03</div>
          <h3 style="font-family:Bricolage Grotesque,sans-serif;font-weight:700;font-size:20px;letter-spacing:-.02em;margin:16px 0 8px;">Trade and track</h3>
          <p style="color:#8C97A3;font-size:14.5px;line-height:1.55;margin:0;">Agree the terms, deliver, and track every trade end to end in one place.</p>
        </div>
      </div>
    </section>

    <!-- DUAL VALUE PROPS -->
    <section style="position:relative;max-width:1280px;margin:0 auto;padding:0 clamp(20px,5vw,64px) clamp(40px,6vh,70px);">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:22px;">
        <div id="creators" data-reveal style="background:linear-gradient(165deg,rgba(255,77,109,.12),rgba(18,24,35,.66));border:1px solid rgba(255,77,109,.28);border-radius:20px;padding:clamp(26px,3.5vw,40px);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);">
          <div style="font-family:JetBrains Mono,monospace;font-size:12px;letter-spacing:.12em;color:#FF4D6D;">FOR CREATORS</div>
          <h3 style="font-family:Bricolage Grotesque,sans-serif;font-weight:700;font-size:clamp(24px,3vw,32px);letter-spacing:-.02em;margin:14px 0 22px;line-height:1.08;">Earn from the content you'd make anyway.</h3>
          <div style="display:flex;flex-direction:column;gap:15px;margin-bottom:30px;">
            <div style="display:flex;gap:12px;align-items:flex-start;"><span style="color:#FF4D6D;flex:0 0 auto;margin-top:1px;">◆</span><span style="font-size:15px;color:#EAF1F7;line-height:1.45;">Get paid in products you'd post about anyway.</span></div>
            <div style="display:flex;gap:12px;align-items:flex-start;"><span style="color:#FF4D6D;flex:0 0 auto;margin-top:1px;">◆</span><span style="font-size:15px;color:#EAF1F7;line-height:1.45;">Keep full creative control of every post.</span></div>
            <div style="display:flex;gap:12px;align-items:flex-start;"><span style="color:#FF4D6D;flex:0 0 auto;margin-top:1px;">◆</span><span style="font-size:15px;color:#EAF1F7;line-height:1.45;">Build a verified record that earns you tiers.</span></div>
            <div style="display:flex;gap:12px;align-items:flex-start;"><span style="color:#FF4D6D;flex:0 0 auto;margin-top:1px;">◆</span><span style="font-size:15px;color:#EAF1F7;line-height:1.45;">Cash deals optional — stack them on top.</span></div>
          </div>
          <a href="/register" style="color:#4B1320;background:#FF4D6D;text-decoration:none;font-size:15px;font-weight:600;padding:13px 22px;border-radius:11px;display:inline-flex;align-items:center;gap:9px;transition:background .15s ease,transform .15s ease,box-shadow .15s ease;" data-h="background:#FF6B85;transform:translateY(-2px);box-shadow:0 10px 26px rgba(255,77,109,.3);">Join as a creator <span style="font-size:16px;">→</span></a>
        </div>
        <div id="business" data-reveal data-reveal-delay="90" style="background:linear-gradient(165deg,rgba(45,212,255,.12),rgba(18,24,35,.66));border:1px solid rgba(45,212,255,.28);border-radius:20px;padding:clamp(26px,3.5vw,40px);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);">
          <div style="font-family:JetBrains Mono,monospace;font-size:12px;letter-spacing:.12em;color:#2DD4FF;">FOR BUSINESSES</div>
          <h3 style="font-family:Bricolage Grotesque,sans-serif;font-weight:700;font-size:clamp(24px,3vw,32px);letter-spacing:-.02em;margin:14px 0 22px;line-height:1.08;">Reach real audiences without ad spend.</h3>
          <div style="display:flex;flex-direction:column;gap:15px;margin-bottom:30px;">
            <div style="display:flex;gap:12px;align-items:flex-start;"><span style="color:#2DD4FF;flex:0 0 auto;margin-top:1px;">◆</span><span style="font-size:15px;color:#EAF1F7;line-height:1.45;">Pay in what you already make — not cash.</span></div>
            <div style="display:flex;gap:12px;align-items:flex-start;"><span style="color:#2DD4FF;flex:0 0 auto;margin-top:1px;">◆</span><span style="font-size:15px;color:#EAF1F7;line-height:1.45;">Match with creators whose numbers are verified.</span></div>
            <div style="display:flex;gap:12px;align-items:flex-start;"><span style="color:#2DD4FF;flex:0 0 auto;margin-top:1px;">◆</span><span style="font-size:15px;color:#EAF1F7;line-height:1.45;">Put your product in front of the right niche.</span></div>
            <div style="display:flex;gap:12px;align-items:flex-start;"><span style="color:#2DD4FF;flex:0 0 auto;margin-top:1px;">◆</span><span style="font-size:15px;color:#EAF1F7;line-height:1.45;">Track results on every trade, start to finish.</span></div>
          </div>
          <a href="/register" style="color:#06303B;background:#2DD4FF;text-decoration:none;font-size:15px;font-weight:600;padding:13px 22px;border-radius:11px;display:inline-flex;align-items:center;gap:9px;transition:background .15s ease,transform .15s ease,box-shadow .15s ease;" data-h="background:#5CDEFF;transform:translateY(-2px);box-shadow:0 10px 26px rgba(45,212,255,.3);">List your business <span style="font-size:16px;">→</span></a>
        </div>
      </div>
    </section>

    <!-- TIERS -->
    <section id="tiers" style="position:relative;max-width:1280px;margin:0 auto;padding:clamp(40px,6vh,70px) clamp(20px,5vw,64px) clamp(72px,11vh,120px);">
      <div data-reveal style="text-align:center;margin-bottom:44px;">
        <div style="font-family:JetBrains Mono,monospace;font-size:12px;letter-spacing:.14em;color:#2DD4FF;">CREATOR TIERS</div>
        <h2 style="font-family:Bricolage Grotesque,sans-serif;font-weight:700;font-size:clamp(30px,4vw,46px);letter-spacing:-.03em;margin:14px 0 10px;line-height:1.05;">Tiers are earned, not bought.</h2>
        <p style="color:#8C97A3;font-size:15px;margin:0;">Your tier reflects verified reach and a real trade record — nothing you can pay for.</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:16px;">
        <div data-reveal data-reveal-delay="0" style="background:rgba(18,24,35,.82);border:1px solid #25303F;border-radius:16px;padding:22px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);transition:border-color .2s ease,transform .2s ease,box-shadow .2s ease;" data-h="border-color:#34404F;transform:translateY(-4px);box-shadow:0 14px 34px rgba(127,233,255,.16);">
          <div style="width:18px;height:18px;background:#7FE9FF;transform:rotate(45deg);border-radius:3px;margin-bottom:16px;box-shadow:0 0 14px rgba(127,233,255,.5);"></div>
          <div style="font-family:JetBrains Mono,monospace;font-size:14px;font-weight:600;color:#7FE9FF;letter-spacing:.06em;">DIAMOND</div>
          <p style="color:#8C97A3;font-size:13.5px;line-height:1.5;margin:10px 0 0;">Top-tier reach with a flawless trade record.</p>
        </div>
        <div data-reveal data-reveal-delay="70" style="background:rgba(18,24,35,.82);border:1px solid #25303F;border-radius:16px;padding:22px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);transition:border-color .2s ease,transform .2s ease,box-shadow .2s ease;" data-h="border-color:#34404F;transform:translateY(-4px);box-shadow:0 14px 34px rgba(201,214,227,.14);">
          <div style="width:18px;height:18px;background:#C9D6E3;transform:rotate(45deg);border-radius:3px;margin-bottom:16px;box-shadow:0 0 14px rgba(201,214,227,.4);"></div>
          <div style="font-family:JetBrains Mono,monospace;font-size:14px;font-weight:600;color:#C9D6E3;letter-spacing:.06em;">PLATINUM</div>
          <p style="color:#8C97A3;font-size:13.5px;line-height:1.5;margin:10px 0 0;">Proven creators with consistent results.</p>
        </div>
        <div data-reveal data-reveal-delay="140" style="background:rgba(18,24,35,.82);border:1px solid #25303F;border-radius:16px;padding:22px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);transition:border-color .2s ease,transform .2s ease,box-shadow .2s ease;" data-h="border-color:#34404F;transform:translateY(-4px);box-shadow:0 14px 34px rgba(255,194,71,.16);">
          <div style="width:18px;height:18px;background:#FFC247;transform:rotate(45deg);border-radius:3px;margin-bottom:16px;box-shadow:0 0 14px rgba(255,194,71,.45);"></div>
          <div style="font-family:JetBrains Mono,monospace;font-size:14px;font-weight:600;color:#FFC247;letter-spacing:.06em;">GOLD</div>
          <p style="color:#8C97A3;font-size:13.5px;line-height:1.5;margin:10px 0 0;">Established reach and reliable delivery.</p>
        </div>
        <div data-reveal data-reveal-delay="210" style="background:rgba(18,24,35,.82);border:1px solid #25303F;border-radius:16px;padding:22px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);transition:border-color .2s ease,transform .2s ease,box-shadow .2s ease;" data-h="border-color:#34404F;transform:translateY(-4px);box-shadow:0 14px 34px rgba(168,178,189,.14);">
          <div style="width:18px;height:18px;background:#A8B2BD;transform:rotate(45deg);border-radius:3px;margin-bottom:16px;box-shadow:0 0 14px rgba(168,178,189,.4);"></div>
          <div style="font-family:JetBrains Mono,monospace;font-size:14px;font-weight:600;color:#A8B2BD;letter-spacing:.06em;">SILVER</div>
          <p style="color:#8C97A3;font-size:13.5px;line-height:1.5;margin:10px 0 0;">Growing audience with a solid history.</p>
        </div>
        <div data-reveal data-reveal-delay="280" style="background:rgba(18,24,35,.82);border:1px solid #25303F;border-radius:16px;padding:22px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);transition:border-color .2s ease,transform .2s ease,box-shadow .2s ease;" data-h="border-color:#34404F;transform:translateY(-4px);box-shadow:0 14px 34px rgba(208,138,90,.16);">
          <div style="width:18px;height:18px;background:#D08A5A;transform:rotate(45deg);border-radius:3px;margin-bottom:16px;box-shadow:0 0 14px rgba(208,138,90,.45);"></div>
          <div style="font-family:JetBrains Mono,monospace;font-size:14px;font-weight:600;color:#D08A5A;letter-spacing:.06em;">BRONZE</div>
          <p style="color:#8C97A3;font-size:13.5px;line-height:1.5;margin:10px 0 0;">New to hyperr, building a track record.</p>
        </div>
      </div>
    </section>

    <!-- TRUST -->
    <section style="position:relative;background:rgba(12,17,26,.72);border-top:1px solid #25303F;border-bottom:1px solid #25303F;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);">
      <div style="max-width:1280px;margin:0 auto;padding:clamp(72px,11vh,120px) clamp(20px,5vw,64px);">
        <div data-reveal style="margin-bottom:44px;">
          <div style="font-family:JetBrains Mono,monospace;font-size:12px;letter-spacing:.14em;color:#2DD4FF;">TRUST &amp; SAFETY</div>
          <h2 style="font-family:Bricolage Grotesque,sans-serif;font-weight:700;font-size:clamp(30px,4vw,46px);letter-spacing:-.03em;margin:14px 0 0;max-width:600px;line-height:1.05;">Every trade is verified, tracked, and backed.</h2>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:18px;">
          <div data-reveal data-reveal-delay="0" style="background:rgba(18,24,35,.82);border:1px solid #25303F;border-radius:16px;padding:24px;transition:border-color .2s ease,transform .2s ease;" data-h="border-color:#34404F;transform:translateY(-4px);">
            <div style="width:40px;height:40px;border-radius:11px;background:#1B2330;border:1px solid #25303F;display:flex;align-items:center;justify-content:center;font-size:19px;color:#2DD4FF;margin-bottom:16px;">✓</div>
            <h3 style="font-family:Bricolage Grotesque,sans-serif;font-weight:700;font-size:17px;margin:0 0 7px;">Verified socials</h3>
            <p style="color:#8C97A3;font-size:13.5px;line-height:1.5;margin:0;">Every follower count is checked against the platform itself.</p>
          </div>
          <div data-reveal data-reveal-delay="70" style="background:rgba(18,24,35,.82);border:1px solid #25303F;border-radius:16px;padding:24px;transition:border-color .2s ease,transform .2s ease;" data-h="border-color:#34404F;transform:translateY(-4px);">
            <div style="width:40px;height:40px;border-radius:11px;background:#1B2330;border:1px solid #25303F;display:flex;align-items:center;justify-content:center;font-size:18px;color:#2DD4FF;margin-bottom:16px;">⇄</div>
            <h3 style="font-family:Bricolage Grotesque,sans-serif;font-weight:700;font-size:17px;margin:0 0 7px;">Tracked trades</h3>
            <p style="color:#8C97A3;font-size:13.5px;line-height:1.5;margin:0;">Each deal is logged end to end, with timestamps you can both see.</p>
          </div>
          <div data-reveal data-reveal-delay="140" style="background:rgba(18,24,35,.82);border:1px solid #25303F;border-radius:16px;padding:24px;transition:border-color .2s ease,transform .2s ease;" data-h="border-color:#34404F;transform:translateY(-4px);">
            <div style="width:40px;height:40px;border-radius:11px;background:#1B2330;border:1px solid #25303F;display:flex;align-items:center;justify-content:center;font-size:18px;color:#2DD4FF;margin-bottom:16px;">★</div>
            <h3 style="font-family:Bricolage Grotesque,sans-serif;font-weight:700;font-size:17px;margin:0 0 7px;">Honest reviews</h3>
            <p style="color:#8C97A3;font-size:13.5px;line-height:1.5;margin:0;">Reviews only unlock after a completed trade. No fakes, no padding.</p>
          </div>
          <div data-reveal data-reveal-delay="210" style="background:rgba(18,24,35,.82);border:1px solid #25303F;border-radius:16px;padding:24px;transition:border-color .2s ease,transform .2s ease;" data-h="border-color:#34404F;transform:translateY(-4px);">
            <div style="width:40px;height:40px;border-radius:11px;background:#1B2330;border:1px solid #25303F;display:flex;align-items:center;justify-content:center;font-size:18px;color:#2DD4FF;margin-bottom:16px;">⛨</div>
            <h3 style="font-family:Bricolage Grotesque,sans-serif;font-weight:700;font-size:17px;margin:0 0 7px;">Dispute support</h3>
            <p style="color:#8C97A3;font-size:13.5px;line-height:1.5;margin:0;">If a trade goes sideways, our team steps in to make it right.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FINAL CTA -->
    <section style="position:relative;max-width:1280px;margin:0 auto;padding:clamp(80px,12vh,130px) clamp(20px,5vw,64px);">
      <div data-reveal style="position:relative;background:radial-gradient(circle at 50% 0%,rgba(45,212,255,.14),rgba(18,24,35,.66) 60%);border:1px solid #25303F;border-radius:24px;padding:clamp(44px,7vw,76px) clamp(24px,5vw,64px);text-align:center;overflow:hidden;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);">
        <h2 style="font-family:Bricolage Grotesque,sans-serif;font-weight:800;font-size:clamp(34px,5vw,58px);letter-spacing:-.035em;margin:0;line-height:1.02;">Ready to start trading?</h2>
        <p style="color:#8C97A3;font-size:clamp(15px,1.5vw,18px);margin:18px auto 0;max-width:440px;">Set up your profile in minutes. The first trade is closer than you think.</p>
        <div style="display:flex;flex-wrap:wrap;gap:13px;justify-content:center;margin-top:34px;">
          <a href="/register" style="color:#4B1320;background:#FF4D6D;text-decoration:none;font-size:15.5px;font-weight:600;padding:14px 26px;border-radius:11px;display:inline-flex;align-items:center;gap:9px;transition:background .15s ease,transform .15s ease,box-shadow .15s ease;" data-h="background:#FF6B85;transform:translateY(-2px);box-shadow:0 10px 28px rgba(255,77,109,.3);">Join as a creator <span style="font-size:17px;">→</span></a>
          <a href="/register" style="color:#06303B;background:#2DD4FF;text-decoration:none;font-size:15.5px;font-weight:600;padding:14px 26px;border-radius:11px;display:inline-flex;align-items:center;gap:9px;transition:background .15s ease,transform .15s ease,box-shadow .15s ease;" data-h="background:#5CDEFF;transform:translateY(-2px);box-shadow:0 10px 28px rgba(45,212,255,.3);">List your business</a>
        </div>
      </div>
    </section>

    <!-- NEWSLETTER SIGNUP -->
    <section style="position:relative;max-width:1280px;margin:0 auto;padding:clamp(64px,10vh,96px) clamp(20px,5vw,64px);">
      <div data-reveal style="background:linear-gradient(165deg,rgba(45,212,255,.08),rgba(18,24,35,.72));border:1px solid rgba(45,212,255,.24);border-radius:20px;padding:clamp(40px,5vw,60px) clamp(24px,5vw,48px);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);text-align:center;">
        <h2 style="font-family:Bricolage Grotesque,sans-serif;font-weight:700;font-size:clamp(24px,3.5vw,36px);letter-spacing:-.02em;margin:0 0 12px;color:#EAF1F7;">Stay in the loop</h2>
        <p style="color:#8C97A3;font-size:clamp(14px,1.2vw,16px);margin:0 0 24px;max-width:520px;margin-left:auto;margin-right:auto;">Get updates on new creators, features, and trades from hyperr. No spam, just the good stuff.</p>
        <form data-newsletter-form style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:480px;margin:0 auto;">
          <input type="email" name="email" placeholder="Enter your email" required style="flex:1;min-width:220px;padding:14px 18px;border:1px solid rgba(45,212,255,.3);border-radius:11px;background:rgba(12,17,26,.8);color:#EAF1F7;font-size:14px;font-family:inherit;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);transition:border-color .2s ease,box-shadow .2s ease;" data-h="border-color:rgba(45,212,255,.6);box-shadow:0 0 0 3px rgba(45,212,255,.15);" />
          <button type="submit" style="padding:14px 26px;background:#2DD4FF;border:none;border-radius:11px;color:#06303B;font-weight:600;font-size:14px;font-family:inherit;cursor:pointer;transition:background .2s ease,transform .2s ease,box-shadow .2s ease;white-space:nowrap;" data-h="background:#5CDEFF;transform:translateY(-2px);box-shadow:0 8px 20px rgba(45,212,255,.24);">Subscribe</button>
        </form>
        <p style="color:#5C6672;font-size:12px;margin:16px 0 0;">We respect your inbox. Unsubscribe anytime.</p>
      </div>
    </section>

    <!-- FOOTER -->
    <footer style="position:relative;border-top:1px solid #25303F;background:rgba(12,17,26,.82);">
      <div style="max-width:1280px;margin:0 auto;padding:clamp(48px,7vh,72px) clamp(20px,5vw,64px) 40px;display:grid;grid-template-columns:minmax(200px,1.4fr) repeat(auto-fit,minmax(130px,1fr));gap:36px;">
        <div>
          <div style="display:inline-flex;align-items:center;gap:9px;">
             <svg viewBox="0 0 100 100" style="height:22px;width:auto;color:#2DD4FF;filter:drop-shadow(0 0 6px rgba(45,212,255,.55));"><use href="#hyperr-swap"></use></svg>
             <span style="font-family:Bricolage Grotesque,sans-serif;font-weight:800;font-size:23px;letter-spacing:-.04em;color:#2DD4FF;">hyperr</span>
           </div>
          <p style="color:#8C97A3;font-size:13.5px;line-height:1.55;margin:14px 0 0;max-width:260px;">The barter marketplace where businesses and creators trade value for promotion.</p>
        </div>
        <div>
          <div style="font-family:JetBrains Mono,monospace;font-size:11px;letter-spacing:.1em;color:#5C6672;margin-bottom:16px;">PRODUCT</div>
          <div style="display:flex;flex-direction:column;gap:11px;">
            <a href="#how" style="color:#8C97A3;text-decoration:none;font-size:14px;transition:color .15s ease;" data-h="color:#EAF1F7;">How it works</a>
            <a href="#creators" style="color:#8C97A3;text-decoration:none;font-size:14px;transition:color .15s ease;" data-h="color:#EAF1F7;">For creators</a>
            <a href="#business" style="color:#8C97A3;text-decoration:none;font-size:14px;transition:color .15s ease;" data-h="color:#EAF1F7;">For businesses</a>
            <a href="#tiers" style="color:#8C97A3;text-decoration:none;font-size:14px;transition:color .15s ease;" data-h="color:#EAF1F7;">Tiers</a>
          </div>
        </div>
        <div>
          <div style="font-family:JetBrains Mono,monospace;font-size:11px;letter-spacing:.1em;color:#5C6672;margin-bottom:16px;">COMPANY</div>
          <div style="display:flex;flex-direction:column;gap:11px;">
            <a href="#" style="color:#8C97A3;text-decoration:none;font-size:14px;transition:color .15s ease;" data-h="color:#EAF1F7;">About</a>
            <a href="#" style="color:#8C97A3;text-decoration:none;font-size:14px;transition:color .15s ease;" data-h="color:#EAF1F7;">Careers</a>
            <a href="#" style="color:#8C97A3;text-decoration:none;font-size:14px;transition:color .15s ease;" data-h="color:#EAF1F7;">Contact</a>
          </div>
        </div>
        <div>
          <div style="font-family:JetBrains Mono,monospace;font-size:11px;letter-spacing:.1em;color:#5C6672;margin-bottom:16px;">LEGAL</div>
          <div style="display:flex;flex-direction:column;gap:11px;">
            <a href="/terms" style="color:#8C97A3;text-decoration:none;font-size:14px;transition:color .15s ease;" data-h="color:#EAF1F7;">Terms of Service</a>
            <a href="/privacy" style="color:#8C97A3;text-decoration:none;font-size:14px;transition:color .15s ease;" data-h="color:#EAF1F7;">Privacy Policy</a>
            <a href="#" style="color:#8C97A3;text-decoration:none;font-size:14px;transition:color .15s ease;" data-h="color:#EAF1F7;">Cookie Policy</a>
          </div>
        </div>
      </div>
      <div style="max-width:1280px;margin:0 auto;padding:20px clamp(20px,5vw,64px) 36px;border-top:1px solid #1B2330;display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;align-items:center;">
        <div style="color:#5C6672;font-size:13px;font-family:JetBrains Mono,monospace;">© 2026 hyperr. All rights reserved.</div>
        <div style="color:#5C6672;font-size:13px;">Made for creators &amp; businesses.</div>
      </div>
    </footer>

  </div>
`;

const FONT_HREF = "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap";

const BASE_CSS = `html,body{margin:0;padding:0;background:#0A0E14;}*{box-sizing:border-box;}::selection{background:#2DD4FF;color:#06303B;}:focus-visible{outline:2px solid #2DD4FF;outline-offset:3px;border-radius:6px;}::placeholder{color:#5C6672;}@media (max-width:840px){[data-navlinks]{display:none !important;}}@media (prefers-reduced-motion: reduce){*{animation:none !important;}}`;

const rootStyle = {
  position: "relative",
  background: "#0A0E14",
  color: "#EAF1F7",
  fontFamily: "Inter, system-ui, sans-serif",
  minHeight: "100vh",
  overflowX: "hidden",
  WebkitFontSmoothing: "antialiased",
};

export default function Landing() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      nav.style.background = on ? "rgba(10,14,20,0.82)" : "rgba(10,14,20,0)";
      nav.style.backdropFilter = on ? "blur(14px)" : "blur(0px)";
      nav.style.webkitBackdropFilter = on ? "blur(14px)" : "blur(0px)";
      nav.style.borderBottomColor = on ? "#25303F" : "transparent";
    };
    window.addEventListener("scroll", onScrollNav, { passive: true });
    onScrollNav();

    // count-up
    const counts = Array.prototype.slice.call(root.querySelectorAll("[data-count]"));
    const fmt = (el, v) => (el.getAttribute("data-prefix") || "") + Math.round(v).toLocaleString() + (el.getAttribute("data-suffix") || "");
    const runCount = (el) => { const target = parseFloat(el.getAttribute("data-target")) || 0; const dur = 950, start = performance.now(); const tick = (now) => { const p = Math.min(1, (now - start) / dur); const e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(el, target * e); if (p < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); };
    let ctTimer = null;
    if (!reduce) { counts.forEach((el) => { el.textContent = fmt(el, 0); }); ctTimer = setTimeout(() => counts.forEach(runCount), 560); }

    // scroll reveals
    let io = null;
    const reveals = Array.prototype.slice.call(root.querySelectorAll("[data-reveal]"));
    if (!reduce && "IntersectionObserver" in window) {
      reveals.forEach((el) => { el.style.opacity = "0"; el.style.transform = "translateY(26px)"; el.style.transition = "opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1)"; el.style.willChange = "opacity, transform"; });
      io = new IntersectionObserver((entries) => { entries.forEach((en) => { if (en.isIntersecting) { const el = en.target; const d = parseFloat(el.getAttribute("data-reveal-delay")) || 0; setTimeout(() => { el.style.opacity = "1"; el.style.transform = "none"; }, d); io.unobserve(el); } }); }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
      reveals.forEach((el) => io.observe(el));
    }

    // hero entrance
    let hio = null;
    if (!reduce) {
      const heroNodes = Array.prototype.slice.call(root.querySelectorAll("[data-hero]"));
      const fromState = (t) => t === "left" ? "translateX(-40px) scale(.97)" : t === "right" ? "translateX(40px) scale(.97)" : t === "swap" ? "rotate(-200deg) scale(.3)" : t === "pill" ? "translateX(-50%) translateY(8px) scale(.7)" : "translateY(20px)";
      const toState = (t) => t === "pill" ? "translateX(-50%)" : "none";
      heroNodes.forEach((el) => {
        const t = el.getAttribute("data-hero"); const delay = parseFloat(el.getAttribute("data-hero-delay")) || 0;
        const spring = (t === "swap" || t === "pill"); const dur = spring ? 580 : 640; const ease = spring ? "cubic-bezier(.34,1.56,.64,1)" : "cubic-bezier(.16,1,.3,1)";
        el.style.opacity = "0"; el.style.transform = fromState(t); el.style.willChange = "opacity, transform";
        el.style.transition = "opacity " + dur + "ms " + ease + " " + delay + "ms, transform " + dur + "ms " + ease + " " + delay + "ms";
      });
      hio = new IntersectionObserver((entries) => { entries.forEach((en) => { if (en.isIntersecting) { const el = en.target; el.style.opacity = "1"; el.style.transform = toState(el.getAttribute("data-hero")); hio.unobserve(el); } }); }, { threshold: 0 });
      heroNodes.forEach((el) => hio.observe(el));
    }

    // band cycle
    let band = null;
    const bandWords = Array.prototype.slice.call(root.querySelectorAll("[data-band]"));
    if (!reduce && bandWords.length) {
      bandWords.forEach((w) => { w.style.transition = "color .45s ease, text-shadow .45s ease"; });
      let bi = 0;
      band = setInterval(() => { bandWords.forEach((w, i) => { const on = (i === bi); w.style.color = on ? "#2DD4FF" : "#EAF1F7"; w.style.textShadow = on ? "0 0 14px rgba(45,212,255,.5)" : "none"; }); bi = (bi + 1) % bandWords.length; }, 950);
    }

    const bounce = root.querySelector("[data-bounce] > span");

    // newsletter signup
    const form = root.querySelector("[data-newsletter-form]");
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        const email = input?.value?.trim();
        if (!email) return;
        const btn = form.querySelector("button");
        btn.disabled = true;
        try {
          await base44.entities.Newsletter.create({ email });
          input.value = "";
          const orig = btn.textContent;
          btn.textContent = "✓ Thanks for subscribing!";
          setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3000);
        } catch (err) {
          console.error("Newsletter signup failed:", err);
          btn.textContent = "Error — try again";
          setTimeout(() => { btn.textContent = "Subscribe"; btn.disabled = false; }, 2000);
        }
      });
    }

    // parallax engine
    const pxEls = Array.prototype.slice.call(root.querySelectorAll("[data-px]")).map((el) => ({ el, sy: parseFloat(el.dataset.sy) || 0, mx: parseFloat(el.dataset.mx) || 0, my: parseFloat(el.dataset.my) || 0, rx: parseFloat(el.dataset.rx) || 0, ry: parseFloat(el.dataset.ry) || 0, fade: parseFloat(el.dataset.fade) || 0, baseOp: (el.dataset.baseOp != null) ? parseFloat(el.dataset.baseOp) : null }));
    const floatWrap = root.querySelector("[data-floatwrap]");
    const glow = root.querySelector("[data-glow]");
    const whaleWrap = root.querySelector("[data-whales]");
    const whales = Array.prototype.slice.call(root.querySelectorAll("[data-whale]")).map((el) => ({ el, dir: parseFloat(el.dataset.dir) || 1, speed: parseFloat(el.dataset.speed) || 30, bob: parseFloat(el.dataset.bob) || 6, phase: parseFloat(el.dataset.phase) || 0, x: 0, w: 0 }));
    const layoutWhales = () => { const vw = whaleWrap ? whaleWrap.clientWidth : window.innerWidth; whales.forEach((wh, i) => { wh.w = wh.el.offsetWidth || 300; wh.x = -wh.w + ((i + 0.5) / whales.length) * (vw + wh.w); }); };
    layoutWhales();
    window.addEventListener("resize", layoutWhales);

    let raf = null, onScroll = null, onMove = null;

    if (reduce) {
      if (floatWrap) floatWrap.style.opacity = "1";
      pxEls.forEach((p) => { if (p.baseOp != null) p.el.style.opacity = String(p.baseOp); });
      whales.forEach((wh) => { wh.el.style.transform = "translateX(" + wh.x.toFixed(0) + "px) scaleX(" + (-wh.dir) + ")"; });
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
        if (glow) { const k = (Math.sin(t / 2.7 * Math.PI) + 1) / 2; glow.style.opacity = (0.55 + 0.35 * k).toFixed(3); }
        if (bounce) bounce.style.transform = "translateY(" + (Math.sin(t * 2.4) * 3).toFixed(2) + "px)";
        const vw = whaleWrap ? whaleWrap.clientWidth : window.innerWidth;
        for (let i = 0; i < whales.length; i++) {
          const wh = whales[i]; wh.x += wh.dir * wh.speed * 0.016;
          if (wh.dir > 0 && wh.x > vw + 60) wh.x = -wh.w - 60;
          if (wh.dir < 0 && wh.x < -wh.w - 60) wh.x = vw + 60;
          const bobY = Math.sin(t * 0.5 + wh.phase) * wh.bob;
          wh.el.style.transform = "translate(" + wh.x.toFixed(1) + "px," + bobY.toFixed(1) + "px) scaleX(" + (-wh.dir) + ")";
        }
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    }

    return () => {
      window.removeEventListener("scroll", onScrollNav);
      if (onScroll) window.removeEventListener("scroll", onScroll);
      if (onMove) window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", layoutWhales);
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