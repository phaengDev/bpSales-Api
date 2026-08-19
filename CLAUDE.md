# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # nodemon + ts-node on src/App.ts (watches src/**/*.ts)
npm run build    # tsc -> dist/
npm start        # node dist/App.js (requires build first)
```

There is no test runner, linter, or formatter configured. `tsc` (strict mode) is the only static check — run `npm run build` to type-check.

## Environment

`.env` is loaded via `dotenv` in both [src/server.ts](src/server.ts) and [src/config/database.ts](src/config/database.ts). Required: `DB_HOSTNAME`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, `TZ`.

Two mismatches to be aware of:
- The listen port reads `process.env.PORT` ([src/App.ts:3](src/App.ts#L3)) but `.env` defines `SERVER_PORT`, so the server effectively always runs on the fallback **3707**.
- `JWT_SECRET`, `JWT_ISSUER`, `JWT_EXPIRES_IN` are not in `.env`; both auth files fall back to a hardcoded literal ([src/middleware/auth.ts:8-10](src/middleware/auth.ts#L8-L10)).

## Architecture

Express 5 + Sequelize 6 (MySQL) REST API for a multi-shop retail/stock system (products, purchasing, imports, POS bill sales, online delivery orders).

**Layering is flat and consistent:** `routes/index.ts` → `controllers/*.ts` → `models/*.ts`. There is no service layer; controllers hold all business logic and talk to Sequelize directly.

**Entry point split:** [src/App.ts](src/App.ts) authenticates the DB then listens; [src/server.ts](src/server.ts) builds the Express app (CORS `*`, JSON body parser, static `/image` mount) and exports it.

**Single router, auth boundary by position.** All routes live in [src/routes/index.ts](src/routes/index.ts) under the `/api` prefix. Routes declared *before* [`router.use(verifyToken)`](src/routes/index.ts#L145) are public (login, address lookups); everything after requires a `Bearer` JWT. Adding a route above that line silently makes it public.

**Multi-tenancy is `shopid`, passed by the client.** Nearly every query filters on `shopid` taken from `req.params.id` or `req.body.shopid` — never from the token. `req.user` is populated by `verifyToken` but is not read by any controller.

**Database is schema-first.** There is no `sequelize.sync()` and no migrations; tables (`tbl_*`) are managed outside this repo. Model definitions must be kept in sync with the live schema by hand.

**Associations are import side effects.** Each model file calls `belongsTo`/`hasMany` at the bottom (e.g. [src/models/Products.ts:157-161](src/models/Products.ts#L157-L161)). An `include: [{ model: X, as: "y" }]` only works if that alias was registered by a model file that got imported — so importing the model into the controller is what wires up the association.

## Conventions that will trip you up

**Primary keys are generated in application code.** Most tables are not `AUTO_INCREMENT`, so `create()` calls must supply the PK. [src/utils/index.ts](src/utils/index.ts) provides the generators; pick the right one:

| Helper | Produces | Used for |
| --- | --- | --- |
| `maxid(model, col, {transaction})` | `max(col) + 1`, floor 10001 | most `*_uuid` PKs |
| `maxids(model, field, t)` | year-prefixed (`2026001`), row-locked | import batches |
| `codeNo(model, field, prefix)` | `<prefix><n>` | bill/transport running numbers |
| `billno(model, field, prefix, dateField)` | `<prefix><n>`, resets daily (`CURDATE()`) | purchase bill numbers |
| `maxCode(model, col, prefix, t?)` | `<prefix>-0001` zero-padded | bill codes |
| `maxsku` / `generateBarCode` ([src/utils/generateBarCode.ts](src/utils/generateBarCode.ts)) | SKU by prefix / unique random 10-digit barcode | products |

**Route `:id` params are base64.** Update/delete handlers decode with `atob(req.params.id)`. Not universal — `get*` handlers usually take the raw id, and [src/controllers/addOrder.ts:16](src/controllers/addOrder.ts#L16) has a `decodeParamId` that accepts either. Check the specific handler before assuming.

**List endpoints are `POST` with filters in the body**, pagination in the query string (`limit`, `skip`, `orderBy`, `order`), returning `{ data, total, limit, skip }`. Simple option/dropdown endpoints are `GET /<thing>/option/:shopid`. Every controller redeclares the same local `QueryParams` interface.

**File uploads** use `createUpload(folder).single(field)` from [src/utils/uploadFile.ts](src/utils/uploadFile.ts) as route middleware (5MB cap, random filename). Files land in `src/uploads/<folder>/` and are served at `/image/<folder>/<file>`. Only the filename is stored in the DB; the full URL is built in SQL via the `url()` helper, which **hardcodes `http://localhost:3707/image`** ([src/utils/index.ts:3-5](src/utils/index.ts#L3-L5)) — change it for any non-local deployment.

**Stock movement:** sales decrement `tbl_products.quantity` only when `product.stock === 1` ([src/controllers/billsaleController.ts:142](src/controllers/billsaleController.ts#L142)); imports increment it ([src/controllers/importController.ts](src/controllers/importController.ts)). Cancelling a bill sets `status: 2` on the bill, its lines, and the transport row — it does **not** restore stock. Multi-table writes wrap in a transaction (`sequelize.transaction()` or `Model.sequelize?.transaction()`); cart rows are destroyed inside the same transaction once converted to a bill.

**Error handling is per-handler try/catch returning a generic 500.** There is no error middleware, and most `catch` blocks discard the error, so a bad Sequelize alias or column surfaces as `{"error": "Failed to fetch ..."}` with nothing logged. When debugging a 500, add a `console.error` first.

## Known drift in the codebase

- `dist/` is committed to git and is not in `.gitignore` — it goes stale unless rebuilt.
- `moment` is imported by four controllers but is missing from `package.json` dependencies (it resolves only because it's present in `node_modules`).
- Some includes reference aliases/columns that don't exist: `Billsales` ↔ `Exchanges as "exchange"` has no association, and `Users` includes request `"phones"` while the model declares `phone` ([src/controllers/billsaleController.ts](src/controllers/billsaleController.ts)). Those endpoints throw and return 500.
- Comments and some error strings are in Thai and Lao; keep existing comment language when editing nearby code.
