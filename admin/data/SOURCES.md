# Benelux geographic data

Prepared 2026-10-08. Public geographical data only; no customer records.

- `benelux-places.json`: GeoNames postal data for NL, BE and LU.
  Source: https://download.geonames.org/export/zip/
  Attribution: GeoNames, https://www.geonames.org/
  License: Creative Commons Attribution 4.0 (CC BY 4.0), as stated in the source readme.
  Original entries were filtered to the Benelux bounding area and reduced to postal code,
  place name and coordinates rounded to four decimals. NL uses four-digit postcode areas.
- `benelux-borders.json`: Natural Earth 1:50m admin-0 countries, NLD/BEL/LUX.
  Source: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson
  License: public domain, https://www.naturalearthdata.com/about/terms-of-use/
  Only country labels and geometry retained.

The map provides an approximate area, not a verified street address or route.
The application loads these local files and never sends customer addresses to a geocoding provider.
