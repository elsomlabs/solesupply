"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { UnionJack } from "@/components/UnionJack";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import styles from "./SiteHeader.module.css";

const SHOP_LINKS = [
  { label: "Sneakers", href: "/sneakers/" },
  { label: "Apparel", href: "/apparel/" },
] as const;

const NAV_LINKS = [{ label: "Sell with us", href: "/contact/" }] as const;

function isCurrent(pathname: string, href: string) {
  if (!href.startsWith("/")) return false;
  const path = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  const target = href.length > 1 && href.endsWith("/") ? href.slice(0, -1) : href;
  if (target === "/") return path === "/";
  return path === target || path.startsWith(`${target}/`);
}

function ShopMenu({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onFocusIn = (event: FocusEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      if (rootRef.current?.contains(document.activeElement)) buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function openFromHover() {
    if (window.matchMedia("(min-width: 1024px)").matches) setOpen(true);
  }

  function closeFromHover() {
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    if (rootRef.current?.contains(document.activeElement)) return;
    setOpen(false);
  }

  return (
    <div
      ref={rootRef}
      className={styles.shop}
      onMouseEnter={openFromHover}
      onMouseLeave={closeFromHover}
    >
      <Link href="/shop/" aria-current={isCurrent(pathname, "/shop/") ? "page" : undefined} onClick={onNavigate}>
        Shop
      </Link>
      <button
        ref={buttonRef}
        type="button"
        className={styles.shopTrigger}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        aria-label="Shop menu"
        onClick={() => setOpen((value) => !value)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <path d="M5 9l7 7 7-7" />
        </svg>
      </button>
      <div id={menuId} className={open ? `${styles.shopMenu} ${styles.shopMenuOpen}` : styles.shopMenu} hidden={!open}>
        <div className={styles.shopPanel}>
          {SHOP_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      <ShopMenu onNavigate={onNavigate} />
      {NAV_LINKS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
          onClick={onNavigate}
        >
          {item.label}
        </Link>
      ))}
    </>
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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [bagEntered, setBagEntered] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchEntered, setSearchEntered] = useState(false);
  const [away, setAway] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const awayRef = useRef(false);
  const scrolledRef = useRef(false);
  const lockRef = useRef({ menu: false, search: false });
  lockRef.current.menu = open;
  lockRef.current.search = searchOpen;
  const menuRef = useRef<HTMLButtonElement>(null);
  const bagRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const bagDrawerRef = useRef<HTMLDivElement>(null);
  const drawerId = useId();
  const bagId = useId();
  const total = lines.reduce((sum, line) => sum + line.price, 0);

  function close() {
    setEntered(false);
    setOpen(false);
  }

  function closeBag() {
    setBagEntered(false);
    setBagOpen(false);
  }

  function openSearch() {
    close();
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
    router.push(`/shop/?q=${encodeURIComponent(query)}`);
  }

  useEffect(() => {
    if (!open && !searchOpen) return;
    awayRef.current = false;
    setAway(false);
  }, [open, searchOpen]);

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

      const shopOpen = document.querySelector('[aria-label="Shop menu"][aria-expanded="true"]') !== null;
      const locked = lockRef.current.menu || lockRef.current.search || shopOpen;
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

  function toggle() {
    if (open) {
      close();
      return;
    }
    closeBag();
    setEntered(false);
    setOpen(true);
  }

  useEffect(() => {
    if (reveal === 0) return;
    setEntered(false);
    setOpen(false);
    setBagEntered(false);
    setBagOpen(true);
  }, [reveal]);

  function toggleBag() {
    if (bagOpen) {
      closeBag();
      return;
    }
    close();
    setBagEntered(false);
    setBagOpen(true);
  }

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (media.matches) {
        setEntered(false);
        setOpen(false);
      }
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!open) return;
    const drawer = drawerRef.current;
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
      setEntered(true);
      focusable()[0]?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setEntered(false);
        setOpen(false);
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

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      inerted.forEach((element) => element.removeAttribute("inert"));
      if (menuRef.current && getComputedStyle(menuRef.current).display !== "none") {
        menuRef.current.focus();
      }
    };
  }, [open]);

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

  const drawer = (
    <div
      ref={drawerRef}
      id={drawerId}
      className={entered ? `${styles.drawer} ${styles.drawerOpen}` : styles.drawer}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
    >
      <button type="button" className={styles.scrim} aria-label="Close menu" tabIndex={-1} onClick={close} />
      <div className={styles.panel}>
        <nav className={styles.drawerNav} aria-label="Main">
          <NavLinks onNavigate={close} />
        </nav>
      </div>
    </div>
  );

  return (
    <header className={[styles.hdr, away ? styles.away : "", scrolled ? styles.scrolled : ""].filter(Boolean).join(" ")}>
      <div className={`${styles.wrap} ${styles.hdrIn}`}>
        <div className={styles.lead}>
          <button
            ref={menuRef}
            className={`${styles.ib} ${styles.menu}`}
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            aria-controls={drawerId}
            onClick={toggle}
          >
            <Glyph>
              <path d="M4 7h16M4 12h16M4 17h16" />
            </Glyph>
          </button>
          <nav className={styles.nav} aria-label="Main">
            <NavLinks />
          </nav>
        </div>
        <Link className={styles.mark} href="/" aria-label="SoleSupply home">
          Sole Supply
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
          <input ref={searchRef} type="search" name="q" placeholder="SEARCH SNEAKERS" aria-label="Search sneakers" />
          <button type="button" aria-label="Close search" onClick={closeSearch}>
            <Glyph strokeWidth={1.75}>
              <path d="M6 6l12 12M18 6L6 18" />
            </Glyph>
          </button>
        </form>
      ) : null}
      {open ? createPortal(drawer, document.body) : null}
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
