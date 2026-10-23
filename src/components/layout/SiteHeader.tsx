"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { SoleMark } from "@/components/SoleMark";
import { UnionJack } from "@/components/UnionJack";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import styles from "./SiteHeader.module.css";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Shop all", href: "/shop/" },
  { label: "Sneakers", href: "/sneakers/" },
  { label: "Apparel", href: "/apparel/" },
  { label: "Sell with us", href: "/contact/" },
] as const;

function isCurrent(pathname: string, href: string) {
  if (!href.startsWith("/")) return false;
  const path = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  const target = href.length > 1 && href.endsWith("/") ? href.slice(0, -1) : href;
  if (target === "/") return path === "/";
  return path === target || path.startsWith(`${target}/`);
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return NAV_ITEMS.map((item) =>
    item.href.startsWith("/") ? (
      <Link
        key={item.label}
        href={item.href}
        aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
        onClick={onNavigate}
      >
        {item.label}
      </Link>
    ) : (
      <a key={item.label} href={item.href} onClick={onNavigate}>
        {item.label}
      </a>
    ),
  );
}

function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      {children}
    </svg>
  );
}

export function SiteHeader() {
  const { count, lines, remove, reveal } = useCart();
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [bagEntered, setBagEntered] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const bagRef = useRef<HTMLButtonElement>(null);
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
    <header className={styles.hdr}>
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
          <SoleMark />
        </Link>
        <div className={styles.side}>
          <div className={styles.utils}>
          <button className={styles.cur} type="button">
            <UnionJack className={styles.flag} />
            GBP / EN{" "}
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M5 9l7 7 7-7" />
            </svg>
          </button>
          <button className={styles.ib} type="button" aria-label="Search">
            <Glyph>
              <circle cx="10.5" cy="10.5" r="6" />
              <path d="M15 15l5 5" />
            </Glyph>
          </button>
          <button className={styles.ib} type="button" aria-label="Account">
            <Glyph>
              <circle cx="12" cy="8.5" r="3.5" />
              <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
            </Glyph>
          </button>
          <button
            ref={bagRef}
            className={`${styles.ib} ${styles.bag}`}
            type="button"
            aria-label={count === 0 ? "Bag" : `Bag, ${count} ${count === 1 ? "item" : "items"}`}
            aria-expanded={bagOpen}
            aria-controls={bagId}
            onClick={toggleBag}
          >
            <Glyph>
              <path d="M5 8h14l-1 12H6L5 8z" />
              <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
            </Glyph>
            {count > 0 ? <span className={styles.bagCount}>{count}</span> : null}
          </button>
          </div>
        </div>
      </div>
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
