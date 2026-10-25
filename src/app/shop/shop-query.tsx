"use client";

import { useSyncExternalStore } from "react";
import { ShopListing, readShopQuery } from "./listing";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  return () => window.removeEventListener("popstate", onStoreChange);
}

function getSearch() {
  return window.location.search;
}

function getServerSearch() {
  return "";
}

export function ShopQuery() {
  const search = useSyncExternalStore(subscribe, getSearch, getServerSearch);
  const params = new URLSearchParams(search);
  const { category, sort, q } = readShopQuery({
    category: params.get("category") ?? undefined,
    sort: params.get("sort") ?? undefined,
    q: params.get("q") ?? undefined,
  });

  return <ShopListing category={category} sort={sort} q={q} />;
}
