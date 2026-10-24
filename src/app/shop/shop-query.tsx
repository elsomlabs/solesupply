"use client";

import { useSyncExternalStore } from "react";
import { ShopListing, readShopQuery } from "./listing";

function subscribe() {
  return () => {};
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
  const { category, sort } = readShopQuery({
    category: params.get("category") ?? undefined,
    sort: params.get("sort") ?? undefined,
  });

  return <ShopListing category={category} sort={sort} />;
}
