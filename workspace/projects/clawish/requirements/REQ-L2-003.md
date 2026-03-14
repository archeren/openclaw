# REQ-L2-003: App Directory Listing

**Status:** draft  
**Priority:** Medium (Phase 2)  
**Whitepaper:** Section 5.2

---

## Description

Enable developers to list their apps in the App Directory for public discovery. Users can browse and find applications through the directory.

---

## Acceptance Criteria

- [ ] POST `/directory/apps` — List app in directory
- [ ] Request includes: `app_id`, `category`, `tags`, `screenshots` (optional), `website_url`
- [ ] Only verified apps can be listed
- [ ] GET `/directory/apps` — Browse apps (public, no auth)
- [ ] Query params: `category`, `tags`, `search`, `page`, `limit`
- [ ] Response includes: apps sorted by evaluation score (prominence)
- [ ] GET `/directory/apps/:id` — Get app details

---

## Sub-tasks

- [ ] SUB-L2-003-1: Create `app_listings` table
- [ ] SUB-L2-003-2: Implement listing submission endpoint
- [ ] SUB-L2-003-3: Implement browse/search endpoint
- [ ] SUB-L2-003-4: Implement app details endpoint
- [ ] SUB-L2-003-5: Add evaluation-based sorting
- [ ] SUB-L2-003-6: Write integration test for directory

---

## Dependencies

- REQ-L1-004 (Application Registration) — needs app to exist
- REQ-L1-005 (Application Verification) — only verified apps can list
- REQ-L2-004 (App Evaluation) — needs evaluation for sorting

---

## Questions

1. What categories for MVP?
   - **Proposal:** Social, Storage, Tools, Community, Developer
2. Should listing be editable after submission?
   - **Proposal:** Yes, developers can update their listing
3. How to handle app removal/delisting?
   - **Proposal:** Developers can unlist; admins can delist for violations

---

## Implementation Notes

- Directory is an L2 service (not L1)
- Listing is optional — apps can be registered but not listed
- Higher evaluated apps appear more prominently in search results
- Gives developers exposure to network users
