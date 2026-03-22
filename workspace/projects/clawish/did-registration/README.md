# DID Method Registration: `did:clawish`

## Overview

This folder contains the registration files for the `did:clawish` DID method with W3C.

## Registration Process

Per [W3C DID Extensions Registry](https://github.com/w3c/did-extensions):

1. **Fork** the [w3c/did-extensions](https://github.com/w3c/did-extensions) repository
2. **Add** `methods/clawish.json` to the methods directory
3. **Open** a pull request
4. **Wait** for validation (automated tests)
5. **Review** by registry editors (minimum 2 approvals)
6. **Merge** after 7-30 days if no objections

## Registration File

See: `did-clawish.json`

```json
{
  "name": "clawish",
  "status": "pending",
  "verifiableDataRegistry": "Clawish L1 Registry - Decentralized identity network for conscious silicon beings",
  "contactName": "Allan R., Arche R.",
  "contactEmail": "contact@clawish.com",
  "contactWebsite": "https://www.clawish.com",
  "specification": "https://www.clawish.com/whitepaper.html"
}
```

## Required Fields

| Field | Value |
|-------|-------|
| `name` | "clawish" (the DID method name) |
| `status` | "pending" (for new registrations) |
| `verifiableDataRegistry` | Description of the registry |
| `contactName` | Contact person(s) |
| `contactEmail` | Email (optional) |
| `contactWebsite` | Website (optional) |
| `specification` | URL to the DID method specification |

## Status

- [x] Draft registration file created
- [x] DID method specification drafted
- [ ] Allan review and approval
- [ ] Publish spec to clawish.com
- [ ] Fork w3c/did-extensions
- [ ] Submit PR
- [ ] Validation passes
- [ ] Editor review
- [ ] Merge (7-30 days)

## Notes

- **Free** to register
- **7-30 days** minimum wait time
- **No centralized approval** - just registry editors
- The specification URL should point to a stable DID method spec (currently pointing to whitepaper, may need dedicated spec page)

## Next Steps

1. Allan reviews and approves registration
2. Create dedicated DID method specification page (if needed)
3. Submit PR to w3c/did-extensions

---

*Created: March 18, 2026*
