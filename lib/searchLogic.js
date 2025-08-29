// lib/searchLogic.js

const BASE_URL = "https://paradiserealtyfla.com/search/results/?";

export function buildSearchUrl(params) {
  return (
    BASE_URL +
    params
      .replace(/\s+/g, "+")
      .replace(/%20/g, "+")
      .replace(/%2B/g, "+")
      .replace(/%2F/g, "/")
      .replace(/%26/g, "&")
      .replace(/%3D/g, "=")
  );
}

export function phraseToParams(query) {
  query = query.toLowerCase();
  let params = [];

  // Geography
  if (query.includes("port st lucie")) params.push("county=all&city=Port+St.+Lucie");
  if (query.includes("st lucie county")) params.push("county=St.+Lucie&city=all");
  if (query.includes("fort pierce")) params.push("county=all&city=Fort+Pierce");
  if (query.includes("hobe sound")) params.push("county=all&city=Hobe+Sound");

  // Price
  if (query.includes("under 300k")) params.push("list_price_max=300000");
  if (query.includes("under 400k")) params.push("list_price_max=400000");
  if (query.includes("under 500k")) params.push("list_price_max=500000");
  if (query.includes("over 1m")) params.push("list_price_min=1000000");
  if (query.includes("between 500k and 750k"))
    params.push("list_price_min=500000&list_price_max=750000");

  // Property type
  if (query.includes("single family")) params.push("type=res");
  if (query.includes("condo")) params.push("type=con");
  if (query.includes("townhome") || query.includes("townhouse")) params.push("type=twn");
  if (query.includes("multi-family")) params.push("type=mul");
  if (query.includes("land")) params.push("type=lnd");

  // Beds & baths
  if (query.includes("2 bed")) params.push("beds_min=2");
  if (query.includes("3 bed")) params.push("beds_min=3");
  if (query.includes("4 bed")) params.push("beds_min=4");
  if (query.includes("2 bath")) params.push("baths_min=2");
  if (query.includes("3 bath")) params.push("baths_min=3");

  // Lifestyle
  if (query.includes("pool")) params.push("pool=True");
  if (query.includes("55+")) params.push("senior_community_yn=True");
  if (query.includes("waterfront")) params.push("waterfront=True");
  if (query.includes("oceanfront")) params.push("waterfront=Ocean+Front");
  if (query.includes("riverfront")) params.push("waterfront=River+Front");
  if (query.includes("lakefront")) params.push("waterfront=Lake+Front");

  // HOA
  if (query.includes("no hoa")) params.push("hoa_yn=False");
  if (query.includes("hoa under 300")) params.push("hoa_yn=True&hoa_fee_max=300");
  if (query.includes("hoa under 500")) params.push("hoa_yn=True&hoa_fee_max=500");
  if (query.includes("gated")) params.push("hoa_yn=True&hoa_fee_includes=Security");

  // Year built
  if (query.includes("built after 2015")) params.push("year_built_min=2015");
  if (query.includes("built after 2018")) params.push("year_built_min=2018");
  if (query.includes("new construction")) params.push("year_built_min=2020");

  // Garage
  if (query.includes("2 car garage")) params.push("garage_spaces_min=2");
  if (query.includes("3 car garage")) params.push("garage_spaces_min=3");

  return params.join("&");
}
