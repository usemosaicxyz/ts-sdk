# @usemosaicxyz/ts-sdk

TypeScript SDK for [Mosaic](https://usemosaic.xyz) bounty contracts on Base and the Mortar API.

## Install

**npm (recommended for most apps):**

```bash
npm install @usemosiac/ts-sdk
```

**GitHub Packages** (linked to this repo; scope must match the GitHub org):

```bash
npm install @usemosaicxyz/ts-sdk --registry=https://npm.pkg.github.com
```

Add to `.npmrc`:

```
@usemosaicxyz:registry=https://npm.pkg.github.com
```

## Quick start

### Wallet transactions

Build calldata for your wallet (EIP-1193, WalletConnect, etc.). The SDK does not sign or broadcast.

```ts
import { createMosaicSdk, metadataToDataUri } from "@usemosiac/ts-sdk"; // or @usemosaicxyz/ts-sdk from GitHub Packages

const sdk = createMosaicSdk({
  contractAddress: "0x0c7fad7C9bBaD0BE62aAc867c6069d7Aad7Cb361",
});

const metadataUri = metadataToDataUri({
  version: 1,
  title: "Fix login redirect",
  brief: "Users land on /home after OAuth instead of their intended path.",
});

const approveTx = sdk.approveUsdc(50_000_000); // 50 USDC (6 decimals)
const createTx = sdk.createBounty({
  metadataUri,
  metadataHash: "0x...", // bytes32 — must match your off-chain hashing scheme
  rewardAmount: 25_000_000,
  duration: 86_400,
});

// Pass approveTx / createTx to your wallet provider
```

### Mortar API (read-only)

```ts
import { createMosaicApiClient } from "@usemosiac/ts-sdk";

const api = createMosaicApiClient({
  baseUrl: "https://your-mortar-api.example",
});

const bounties = await api.listBounties();
const bounty = await api.getBounty(1);
const submissions = await api.listSubmissions(1);
const disputes = await api.listDisputes();
```

## Defaults

On Base mainnet you can rely on built-in constants:

| Constant | Value |
|----------|--------|
| `BASE_CHAIN_ID` | `8453` |
| `BASE_USDC_ADDRESS` | Base USDC |
| `MOSAIC_BOUNTIES_ADDRESS` | Mosaic bounties contract |
| `DEFAULT_BOUNTY_CONTRACT_CONFIG` | Min reward, bond/fee bps, review window, durations |

Override `chainId`, `contractAddress`, and `usdcAddress` in `createMosaicSdk` for other deployments.

## Metadata

Canonical JSON for stable hashing:

```ts
import { canonicalJson, metadataToDataUri, parseMetadataUri } from "@usemosiac/ts-sdk";

const uri = metadataToDataUri({ version: 1, title: "...", brief: "..." });
const parsed = parseMetadataUri(uri);
```

`metadataToDataUri` produces `data:application/json,...` URIs suitable for on-chain metadata fields.

## Quoting create cost

```ts
import { quoteCreateAmount } from "@usemosiac/ts-sdk";

const { rewardAmount, bondAmount, feeAmount, totalAmount } = quoteCreateAmount(25_000_000);
// totalAmount is what the poster pays (reward + post fee); bond is separate per contract rules
```

## API surface

**`createMosaicSdk(config)`** — transaction builders:

- `approveUsdc`, `createBounty`, `submit`, `dispute`
- `finalize`, `advanceReviewCursor`, `refundSubmissionBond`, `refundExpired`
- `resolveDispute`, `cancelResolvedDispute`
- `withdraw`, `withdrawTo`
- Admin: `setConfig`, `setAllowedDuration`, `setGrout`, `setAdmin`

**`createMosaicApiClient(config)`** — Mortar HTTP client:

- `listBounties`, `getBounty`, `listSubmissions`, `listDisputes`

Each tx method returns a `WalletTx`: `{ chainId, to, data, value }`.

## Releases

| Registry | Package |
|----------|---------|
| [npm](https://www.npmjs.com/package/@usemosiac/ts-sdk) | `@usemosiac/ts-sdk` |
| [GitHub Packages](https://github.com/usemosaicxyz/ts-sdk/packages) | `@usemosaicxyz/ts-sdk` |

GitHub [releases](https://github.com/usemosaicxyz/ts-sdk/releases) use tags `v*` matching `package.json` `version`.

```bash
# bump version in package.json, commit, then:
git tag v0.1.1 && git push origin v0.1.1
```

The release workflow publishes to **GitHub Packages** (`GITHUB_TOKEN`) and **npmjs** (`NPM_TOKEN` secret), then creates a GitHub Release.

## License

MIT
