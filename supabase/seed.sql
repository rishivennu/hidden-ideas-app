-- Sample data — run after migration to test locally

-- Sample reel
INSERT INTO reels (id, title, slug, description, duration_seconds, published)
VALUES (
  'a1000000-0000-0000-0000-000000000001',
  'Micro‑Fulfillment Kiosk — Weekend MVP',
  'micro-fulfillment-kiosk',
  'Turn unused retail space into a micro-fulfillment hub in 30 days. A lean model with $200–$500 startup cost and $2k–$8k/month potential.',
  47,
  true
);

-- Sample guide
INSERT INTO guides (id, reel_id, title, file_path, summary, is_gated)
VALUES (
  'b1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001',
  'Micro-Fulfillment Kiosk — 10-Page Setup Guide',
  'guides/micro-fulfillment-kiosk.pdf',
  'This guide covers everything from finding your first retail partner, negotiating shelf space, stocking inventory, and scaling to a second location. Includes templates for partnerships, inventory sheets, and a 30-day launch calendar.',
  true
);

-- Sample roadmaps
INSERT INTO roadmaps (guide_id, name, duration_days, cost_estimate, difficulty, steps)
VALUES
(
  'b1000000-0000-0000-0000-000000000001',
  'Weekend MVP (30 days)',
  30,
  '$200–$500',
  2,
  '[
    {"order":1,"title":"Find retail partner","description":"Approach 5 local convenience stores or pharmacies. Pitch revenue share (15–20%).","deliverable":"Signed 30-day trial agreement"},
    {"order":2,"title":"Source inventory","description":"Pick 10–15 fast-moving SKUs. Use a local distributor or Sam'\''s Club.","deliverable":"$150 starter inventory"},
    {"order":3,"title":"Set up kiosk","description":"Use a 3-shelf display unit ($40). Label clearly, set price tags.","deliverable":"Live kiosk with stock"},
    {"order":4,"title":"Track weekly sales","description":"Use a $0 Google Sheet to track sell-through rate per SKU.","deliverable":"First week''s data"},
    {"order":5,"title":"Reorder winners","description":"Double down on top 3 SKUs. Remove slow movers.","deliverable":"Optimized inventory mix"}
  ]'::jsonb
),
(
  'b1000000-0000-0000-0000-000000000001',
  'Local Scale (90 days)',
  90,
  '$1k–$3k',
  3,
  '[
    {"order":1,"title":"Expand to 3 locations","description":"Replicate the model at 2 more stores near your first location."},
    {"order":2,"title":"Brand your kiosk","description":"Custom printed shelf strips and logo. ~$80 from Vistaprint."},
    {"order":3,"title":"Negotiate better margins","description":"Order larger quantities to unlock distributor volume discounts (10–15% off)."},
    {"order":4,"title":"Hire a part-time restock person","description":"Pay per-visit (~$15/stop). Frees your time for expansion."},
    {"order":5,"title":"Simple website","description":"One-pager listing your service for B2B outreach to more stores."}
  ]'::jsonb
),
(
  'b1000000-0000-0000-0000-000000000001',
  'Franchise Ready (12 months)',
  365,
  '$10k–$25k',
  4,
  '[
    {"order":1,"title":"Document your system","description":"Write an operations manual: sourcing, pricing, restock schedule, partner contracts."},
    {"order":2,"title":"Build supplier relationships","description":"Lock in direct wholesale accounts at 30–40% margin."},
    {"order":3,"title":"Develop a franchise kit","description":"Training materials, territory rights, brand standards guide."},
    {"order":4,"title":"Sell 3 franchise units","description":"At $5k–$8k per unit. Validate the model with external operators."},
    {"order":5,"title":"Launch franchise website","description":"SEO-optimized page targeting ''vending franchise'' and ''kiosk business'' keywords."}
  ]'::jsonb
);
