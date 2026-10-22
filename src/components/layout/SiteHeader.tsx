"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./SiteHeader.module.css";

const NAV_ITEMS = [
  { label: "Shop all brands", href: "#", current: false },
  { label: "Sneakers", href: "#", current: true },
  { label: "Apparel", href: "#", current: false },
  { label: "Sell with us", href: "#", current: false },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return NAV_ITEMS.map((item) => (
    <a
      key={item.label}
      href={item.href}
      aria-current={item.current ? "page" : undefined}
      onClick={onNavigate}
    >
      {item.label}
    </a>
  ));
}

function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      {children}
    </svg>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const drawerId = useId();

  function close() {
    setEntered(false);
    setOpen(false);
  }

  function toggle() {
    if (open) {
      close();
      return;
    }
    setEntered(false);
    setOpen(true);
  }

  useEffect(() => {
    const media = window.matchMedia("(min-width: 900px)");
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
        <Link className={styles.mark} href="/" aria-label="SoleSupply home">
          Sole<br />Supply
        </Link>
        <div className={styles.utils}>
          <button className={styles.cur} type="button">
            <i aria-hidden="true" />
            USD / EN{" "}
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
          <button className={styles.ib} type="button" aria-label="Bag">
            <Glyph>
              <path d="M5 8h14l-1 12H6L5 8z" />
              <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
            </Glyph>
          </button>
        </div>
      </div>
      {open ? createPortal(drawer, document.body) : null}
    </header>
  );
}
