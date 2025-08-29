// lib/searchLogic.js

const BASE_URL = "https://paradiserealtyfla.com/search/results/?";

export function buildSearchUrl(filters) {
  let params = [];

  // Geography (always include)
  params.push(`county=${filters.county}`);
  params.push(`city=${filters.city}`);

  // Property types
  filters.type.forEach(t => params.push(`type=${t}`));

  // Price
  params.push(`list_price_min=${filters.list_price_min}`);
  params.push(`list_price_max=${filters.list_price_max}`);

  // Beds / Baths
  params.push(`beds_min=${filters.beds_min}`);
  params.push(`baths_min=${filters.baths_min}`);

  // Year built
  params.push(`year_built_min=${filters.year_built_min}`);

  // Lifestyle
  params.push(`pool=${filters.pool}`);
  params.push(`senior_community_yn=${filters.senior_community_yn}`);
  params.push(`short_sale=${filters.short_sale}`);
  params.push(`foreclosure=${filters.foreclosure}`);

  // HOA
  params.push(`hoa_yn=${filters.hoa_yn}`);
  params.push(`hoa_fee_min=${filters.hoa_fee_min}`);
  params.push(`hoa_fee_max=${filters.hoa_fee_max}`);
  filters.hoa_fee_includes.forEach(item =>
    params.push(`hoa_fee_includes=${encodeURIComponent(item)}`)
  );

  // Garage
  params.push(`garage_spaces_min=${filters.garage_spaces_min}`);
  params.push(`garage_spaces_max=${filters.garage_spaces_max}`);

  // Membership
  params.push(`membership_purch_rqd=${filters.membership_purch_rqd}`);

  // Views
  filters.view.forEach(v => params.push(`view=${v}`));

  // Roof
  filters.roof.forEach(r => params.push(`roof=${r}`));

  // Lot
  filters.lot_dimensions.forEach(l => params.push(`lot_dimensions=${l}`));

  // Waterfront
  params.push(`waterfront=${filters.waterfront}`);

  return BASE_URL + params.join("&");
}

export function phraseToFilters(query) {
  query = query.toLowerCase();

  // ✅ Defaults (safe baseline)
  let filters = {
    county: "St.+Lucie",     // ✅ default county
    city: "all",
    type: ["res", "con", "twn", "mul", "lnd"],
    list_price_min: 50000,
    list_price_max: 7000000,
    beds_min: 2,
    baths_min: 1,
    year_built_min: 2014,
    senior_community_yn: false,
    pool: false,
    short_sale: false,
    foreclosure: false,
    hoa_yn: true,
    hoa_fee_min: 200,
    hoa_fee_max: 1000,
    hoa_fee_includes: [],
    garage_spaces_min: "all",
    garage_spaces_max: "all",
    membership_purch_rqd: "all",
    view: [],
    roof: [],
    lot_dimensions: [],
    waterfront: false
  };

  // ------------------
  // GEOGRAPHY ENFORCED
  // ------------------
  if (query.includes("port st lucie")) {
    filters.city = "Port+St.+Lucie";
    filters.county = "all";
  } else if (query.includes("fort pierce")) {
    filters.city = "Fort+Pierce";
    filters.county = "all";
  } else if (query.includes("hobe sound")) {
    filters.city = "Hobe+Sound";
    filters.county = "all";
  } else if (query.includes("palm city")) {
    filters.city = "Palm+City";
    filters.county = "all";
  } else if (query.includes("st lucie county")) {
    filters.county = "St.+Lucie";
    filters.city = "all";
  } else if (query.includes("martin county")) {
    filters.county = "Martin";
    filters.city = "all";
  }
  // else → defaults remain (St. Lucie County)

  // ------------------
  // PRICE
  // ------------------
  if (query.includes("under 300k")) filters.list_price_max = 300000;
  if (query.includes("under 400k")) filters.list_price_max = 400000;
  if (query.includes("under 500k")) filters.list_price_max = 500000;
  if (query.includes("over 1m")) filters.list_price_min = 1000000;
  if (query.includes("between 500k and 750k")) {
    filters.list_price_min = 500000;
    filters.list_price_max = 750000;
  }

  // ------------------
  // PROPERTY TYPES
  // ------------------
  if (query.includes("single family")) filters.type = ["res"];
  if (query.includes("condo")) filters.type = ["con"];
  if (query.includes("townhome") || query.includes("townhouse")) filters.type = ["twn"];
  if (query.includes("multi-family")) filters.type = ["mul"];
  if (query.includes("land")) filters.type = ["lnd"];

  // ------------------
  // BEDS & BATHS
  // ------------------
  if (query.includes("2 bed")) filters.beds_min = 2;
  if (query.includes("3 bed")) filters.beds_min = 3;
  if (query.includes("4 bed")) filters.beds_min = 4;
  if (query.includes("5 bed")) filters.beds_min = 5;
  if (query.includes("2 bath")) filters.baths_min = 2;
  if (query.includes("3 bath")) filters.baths_min = 3;

  // ------------------
  // LIFESTYLE
  // ------------------
  if (query.includes("pool")) filters.pool = true;
  if (query.includes("55+")) filters.senior_community_yn = true;
  if (query.includes("waterfront")) filters.waterfront = true;
  if (query.includes("oceanfront")) { filters.waterfront = true; filters.view.push("Ocean"); }
  if (query.includes("lakefront")) { filters.waterfront = true; filters.view.push("Lake"); }
  if (query.includes("riverfront")) { filters.waterfront = true; filters.view.push("River"); }

  // ------------------
  // HOA
  // ------------------
  if (query.includes("no hoa")) filters.hoa_yn = false;
  if (query.includes("hoa under 300")) { filters.hoa_yn = true; filters.hoa_fee_max = 300; }
  if (query.includes("hoa under 500")) { filters.hoa_yn = true; filters.hoa_fee_max = 500; }
  if (query.includes("gated")) { filters.hoa_yn = true; filters.hoa_fee_includes.push("Security"); }
  if (query.includes("includes cable")) filters.hoa_fee_includes.push("Cable+TV");
  if (query.includes("includes lawn care")) filters.hoa_fee_includes.push("Maintenance+Grounds");

  // ------------------
  // YEAR BUILT
  // ------------------
  if (query.includes("built after 2015")) filters.year_built_min = 2015;
  if (query.includes("built after 2018")) filters.year_built_min = 2018;
  if (query.includes("new construction")) filters.year_built_min = 2020;

  // ------------------
  // GARAGE
  // ------------------
  if (query.includes("2 car garage")) filters.garage_spaces_min = 2;
  if (query.includes("3 car garage")) filters.garage_spaces_min = 3;

  return filters;
}
