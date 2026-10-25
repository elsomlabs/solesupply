"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { UnionJack } from "@/components/UnionJack";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import styles from "./SiteHeader.module.css";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop all", href: "/shop/" },
  { label: "Sneakers", href: "/sneakers/" },
  { label: "Apparel", href: "/apparel/" },
  { label: "Laces", href: "/shop/?category=shoe-laces" },
  { label: "Sell with us", href: "/contact/" },
] as const;

function isCurrent(pathname: string, href: string) {
  if (!href.startsWith("/") || href.includes("?")) return false;
  const path = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  const target = href.length > 1 && href.endsWith("/") ? href.slice(0, -1) : href;
  if (target === "/") return path === "/";
  if (target === "/shop") return path === "/shop";
  return path === target || path.startsWith(`${target}/`);
}

function NavLinks() {
  const pathname = usePathname();
  return (
    <ul>
      {NAV_LINKS.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
            onFocus={(event) => {
              const link = event.currentTarget;
              requestAnimationFrame(() => {
                link.scrollIntoView({ block: "nearest", inline: "nearest" });
              });
            }}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Glyph({ children, strokeWidth = 1.5 }: { children: ReactNode; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} aria-hidden="true">
      {children}
    </svg>
  );
}

export function SiteHeader() {
  const { count, lines, remove, reveal } = useCart();
  const [bagOpen, setBagOpen] = useState(false);
  const [bagEntered, setBagEntered] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchEntered, setSearchEntered] = useState(false);
  const [away, setAway] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const awayRef = useRef(false);
  const scrolledRef = useRef(false);
  const searchLockRef = useRef(false);
  searchLockRef.current = searchOpen;
  const bagRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const bagDrawerRef = useRef<HTMLDivElement>(null);
  const bagId = useId();
  const total = lines.reduce((sum, line) => sum + line.price, 0);

  function closeBag() {
    setBagEntered(false);
    setBagOpen(false);
  }

  function openSearch() {
    closeBag();
    setSearchEntered(false);
    setSearchOpen(true);
  }

  function closeSearch() {
    setSearchEntered(false);
    setSearchOpen(false);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchRef.current?.value.trim() ?? "";
    closeSearch();
    const href = query ? `/shop/?q=${encodeURIComponent(query)}` : "/shop/";
    window.location.assign(href);
  }

  useEffect(() => {
    if (!searchOpen) return;
    awayRef.current = false;
    setAway(false);
  }, [searchOpen]);

  useEffect(() => {
    let frame = 0;
    let lastY = window.scrollY;
    let down = 0;
    let alive = true;

    const apply = () => {
      frame = 0;
      if (!alive) return;
      const y = Math.max(window.scrollY, 0);
      const delta = y - lastY;
      if (delta > 0) down += delta;
      else if (delta < 0) down = 0;

      const locked = searchLockRef.current;
      let nextAway = awayRef.current;
      if (locked) {
        nextAway = false;
        down = 0;
      } else if (y <= 80 || delta < 0) {
        nextAway = false;
      } else if (down > 80) {
        nextAway = true;
      }

      if (nextAway !== awayRef.current) {
        awayRef.current = nextAway;
        setAway(nextAway);
      }

      const nextScrolled = y > 0;
      if (nextScrolled !== scrolledRef.current) {
        scrolledRef.current = nextScrolled;
        setScrolled(nextScrolled);
      }

      lastY = y;
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(apply);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    apply();
    return () => {
      alive = false;
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    const frame = requestAnimationFrame(() => {
      setSearchEntered(true);
      searchRef.current?.focus();
    });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setSearchEntered(false);
      setSearchOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [searchOpen]);

  useEffect(() => {
    if (reveal === 0) return;
    setBagEntered(false);
    setBagOpen(true);
  }, [reveal]);

  function toggleBag() {
    if (bagOpen) {
      closeBag();
      return;
    }
    setBagEntered(false);
    setBagOpen(true);
  }

  useEffect(() => {
    if (!bagOpen) return;
    const drawer = bagDrawerRef.current;
    if (!drawer) return;

    const inerted: HTMLElement[] = [];
    for (const child of Array.from(document.body.children)) {
      if (child !== drawer && child instanceof HTMLElement && !child.hasAttribute("inert")) {
        child.setAttribute("inert", "");
        inerted.push(child);
      }
    }

    const focusable = () =>
      Array.from(drawer.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")).filter(
        (element) => element.tabIndex >= 0,
      );

    const frame = requestAnimationFrame(() => {
      setBagEntered(true);
      focusable()[0]?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setBagEntered(false);
        setBagOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      event.preventDefault();
      if (items.length === 0) return;
      const current = items.indexOf(document.activeElement as HTMLElement);
      const next = event.shiftKey
        ? current <= 0
          ? items.length - 1
          : current - 1
        : current === items.length - 1
          ? 0
          : current + 1;
      items[next]?.focus();
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const bagButton = bagRef.current;

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      inerted.forEach((element) => element.removeAttribute("inert"));
      bagButton?.focus();
    };
  }, [bagOpen]);

  return (
    <header className={[styles.hdr, away ? styles.away : "", scrolled ? styles.scrolled : ""].filter(Boolean).join(" ")}>
      <div className={`${styles.wrap} ${styles.hdrIn}`}>
        <nav className={styles.nav} aria-label="Main">
          <NavLinks />
        </nav>
        <Link className={styles.mark} href="/" aria-label="SoleSupply home">
          Sole Supply
          <span className={styles.period} aria-hidden="true">
            <svg viewBox="0 0 12 14" focusable="false">
              <polygon points="6,0.4 11.6,3.6 11.6,10.4 6,13.6 0.4,10.4 0.4,3.6" />
            </svg>
          </span>
        </Link>
        <div className={styles.side}>
          <div className={styles.utils}>
          <span className={styles.cur}>
            <UnionJack className={styles.flag} />
            UK: GBP
          </span>
          <button className={styles.ib} type="button" aria-label="Search" aria-expanded={searchOpen} onClick={openSearch}>
            <Glyph strokeWidth={1.75}>
              <circle cx="10.5" cy="10.5" r="6" />
              <path d="M15 15l5 5" />
            </Glyph>
          </button>
          <button className={styles.ib} type="button" aria-label="Account">
            <Glyph strokeWidth={1.75}>
              <circle cx="12" cy="8.5" r="3.5" />
              <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
            </Glyph>
          </button>
          <button
            ref={bagRef}
            className={`${styles.ib} ${styles.bag}`}
            type="button"
            aria-label={`Bag, ${count} ${count === 1 ? "item" : "items"}`}
            aria-expanded={bagOpen}
            aria-controls={bagId}
            onClick={toggleBag}
          >
            <Glyph strokeWidth={1.75}>
              <path d="M5 8h14l-1 12H6L5 8z" />
              <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
            </Glyph>
            {count > 0 ? <span className={styles.bagCount}>{count}</span> : null}
          </button>
          </div>
        </div>
      </div>
      {searchOpen ? (
        <form className={searchEntered ? `${styles.search} ${styles.searchOpen}` : styles.search} onSubmit={submitSearch}>
          <input ref={searchRef} type="search" name="q" placeholder="SEARCH" aria-label="Search the store" />
          <button type="button" aria-label="Close search" onClick={closeSearch}>
            <Glyph strokeWidth={1.75}>
              <path d="M6 6l12 12M18 6L6 18" />
            </Glyph>
          </button>
        </form>
      ) : null}
      {bagOpen ? createPortal(
        <div
          ref={bagDrawerRef}
          id={bagId}
          className={bagEntered ? `${styles.drawer} ${styles.bagDrawer} ${styles.drawerOpen}` : `${styles.drawer} ${styles.bagDrawer}`}
          role="dialog"
          aria-modal="true"
          aria-label="Bag"
        >
          <button type="button" className={styles.scrim} aria-label="Close bag" tabIndex={-1} onClick={closeBag} />
          <div className={styles.bagPanel}>
            <div className={styles.bagHead}>
              <h2>Bag</h2>
              <button className={styles.ib} type="button" aria-label="Close bag" onClick={closeBag}>
                <Glyph>
                  <path d="M6 6l12 12M18 6L6 18" />
                </Glyph>
              </button>
            </div>
            {lines.length === 0 ? (
              <p className={styles.bagEmpty}>Your bag is empty.</p>
            ) : (
              <ul className={styles.bagList}>
                {lines.map((line) => (
                  <li key={`${line.id}-${line.size}`}>
                    <Link href={`/sneakers/${line.id}/`} onClick={closeBag}>
                      <img src={line.image} alt="" />
                    </Link>
                    <div>
                      <Link href={`/sneakers/${line.id}/`} onClick={closeBag}>
                        {line.name}
                      </Link>
                      <p>Size {line.size}</p>
                      <p>{formatPrice(line.price)}</p>
                    </div>
                    <button type="button" onClick={() => remove(line.id, line.size)}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {lines.length > 0 ? (
              <div className={styles.bagFoot}>
                <div className={styles.bagTotal}>
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <Link className={styles.checkout} href="/checkout/" onClick={closeBag}>
                  Proceed to checkout
                </Link>
              </div>
            ) : null}
          </div>
        </div>,
        document.body,
      ) : null}
    </header>
  );
}
