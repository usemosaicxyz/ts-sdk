export type Hex = `0x${string}`;
export type Address = `0x${string}`;
export type UintLike = bigint | number | string;

export type WalletTx = {
  chainId: number;
  to: Address;
  data: Hex;
  value: Hex;
};

export type MosaicConfig = {
  chainId?: number;
  contractAddress: Address;
  usdcAddress?: Address;
};

export type MetadataInput = {
  metadataUri: string;
  metadataHash: Hex;
};

export type CreateBountyInput = MetadataInput & {
  rewardAmount: UintLike;
  duration: UintLike;
};

export type SubmitInput = MetadataInput & {
  bountyId: UintLike;
};

export type DisputeInput = MetadataInput & {
  submissionId: UintLike;
};

export type ResolveInput = {
  challengeId: UintLike;
  accepted: boolean;
};

export type SetConfigInput = {
  minRewardAmount: UintLike;
  bondBps: UintLike;
  postFeeBps: UintLike;
  reviewWindow: UintLike;
  feeRecipient: Address;
};

export type SetAllowedDurationInput = {
  duration: UintLike;
  allowed: boolean;
};

export type SetGroutInput = {
  grout: Address;
  allowed: boolean;
};

export type BountyContractConfig = {
  minRewardAmount: bigint;
  bondBps: number;
  postFeeBps: number;
  reviewWindow: number;
  durations: number[];
};

export type BountyStatus = "open" | "resolved" | "refunded";
export type SubmissionStatus = "submitted" | "disputed" | "accepted" | "rejected" | "refunded";
export type DisputeStatus = "pending_human_review" | "upheld" | "rejected" | "cancelled" | string;

export type MortarBounty = {
  id: number;
  prompt: string;
  bounty_amount: number | string;
  fee_amount?: number | string | null;
  bond_amount: number | string;
  duration?: number | null;
  status: BountyStatus;
  poster: Address | string | null;
  deadline: number | null;
  challenge_window: number | null;
  metadata_uri: string | null;
  metadata_hash: Hex | string | null;
  tx_hash: Hex | string | null;
  block_number: number | null;
  log_index: number | null;
  created_at: string;
};

export type MortarSubmission = {
  id: number;
  bounty_id: number;
  tile_id: string;
  content: string;
  bond_amount: number | string;
  review_deadline?: number | string | null;
  status: SubmissionStatus;
  claimant: Address | string | null;
  metadata_uri: string | null;
  metadata_hash: Hex | string | null;
  tx_hash: Hex | string | null;
  block_number: number | null;
  log_index: number | null;
  created_at: string;
};

export type MortarDispute = {
  id: number;
  bounty_id: number | null;
  submission_id: number;
  challenger_id: string;
  reason: string;
  bond_amount: number | string;
  status: DisputeStatus;
  metadata_uri: string | null;
  metadata_hash: Hex | string | null;
  tx_hash: Hex | string | null;
  block_number: number | null;
  log_index: number | null;
  created_at: string;
};

export type MosaicMetadata = {
  version: number;
  title: string;
  brief: string;
  acceptanceCriteria?: string;
  createdAt?: string;
};

export type MosaicApiConfig = {
  baseUrl: string;
  fetcher?: typeof fetch;
};

export const BASE_CHAIN_ID = 8453;
export const BASE_USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
export const MOSAIC_BOUNTIES_ADDRESS = "0x0c7fad7C9bBaD0BE62aAc867c6069d7Aad7Cb361";
export const DEFAULT_BOUNTY_DURATIONS = [21_600, 86_400, 259_200, 604_800] as const;
export const DEFAULT_BOUNTY_CONTRACT_CONFIG: BountyContractConfig = {
  minRewardAmount: BigInt(15_000_000),
  bondBps: 1_000,
  postFeeBps: 25,
  reviewWindow: 172_800,
  durations: [...DEFAULT_BOUNTY_DURATIONS],
};

export const MOSAIC_BOUNTIES_ABI = [
  {
    type: "function",
    name: "minRewardAmount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "bondBps",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint16" }],
  },
  {
    type: "function",
    name: "postFeeBps",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint16" }],
  },
  {
    type: "function",
    name: "reviewWindow",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint64" }],
  },
  {
    type: "function",
    name: "durationOptions",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint64[]" }],
  },
] as const;

const SELECTORS = {
  approve: "0x095ea7b3",
  createBounty: "0xd0dd210e",
  submit: "0x5d1e8ebb",
  dispute: "0x09488a43",
  resolveDispute: "0x34b25ee2",
  finalize: "0x05261aea",
  advanceReviewCursor: "0x05dac212",
  refundSubmissionBond: "0xacde04fb",
  cancelResolvedDispute: "0xf5c662cd",
  refundExpired: "0x1402b17a",
  withdraw: "0x3ccfd60b",
  withdrawTo: "0x72b0d90c",
  setConfig: "0x380c046c",
  setAllowedDuration: "0x477a34bd",
  setGrout: "0xe9864f5b",
  setAdmin: "0x704b6c02",
} as const;

type AbiType = "address" | "bool" | "bytes32" | "string" | "uint16" | "uint64" | "uint256";

export function createMosaicSdk(config: MosaicConfig) {
  const normalized = normalizeConfig(config);
  return {
    approveUsdc: (amount: UintLike) => approveUsdcTx(normalized, amount),
    createBounty: (input: CreateBountyInput) => createBountyTx(normalized, input),
    submit: (input: SubmitInput) => submitTx(normalized, input),
    dispute: (input: DisputeInput) => disputeTx(normalized, input),
    refundSubmissionBond: (submissionId: UintLike) =>
      refundSubmissionBondTx(normalized, submissionId),
    finalize: (bountyId: UintLike) => finalizeBountyTx(normalized, bountyId),
    advanceReviewCursor: (bountyId: UintLike) => advanceReviewCursorTx(normalized, bountyId),
    resolveDispute: (input: ResolveInput) => resolveDisputeTx(normalized, input),
    cancelResolvedDispute: (challengeId: UintLike) =>
      cancelResolvedDisputeTx(normalized, challengeId),
    refundExpired: (bountyId: UintLike) => refundBountyTx(normalized, bountyId),
    withdraw: () => withdrawTx(normalized),
    withdrawTo: (recipient: Address) => withdrawToTx(normalized, recipient),
    setConfig: (input: SetConfigInput) => setConfigTx(normalized, input),
    setAllowedDuration: (input: SetAllowedDurationInput) =>
      setAllowedDurationTx(normalized, input),
    setGrout: (input: SetGroutInput) => setGroutTx(normalized, input),
    setAdmin: (admin: Address) => setAdminTx(normalized, admin),
  };
}

export function createMosaicApiClient(config: MosaicApiConfig) {
  const baseUrl = config.baseUrl.replace(/\/+$/, "");
  const fetcher = config.fetcher ?? fetch;

  async function get<T>(path: string): Promise<T> {
    const response = await fetcher(`${baseUrl}${path}`, {
      headers: { accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`mortar request failed ${response.status}`);
    }
    return (await response.json()) as T;
  }

  return {
    listBounties: () => get<MortarBounty[]>("/bounties"),
    getBounty: (bountyId: UintLike) =>
      get<MortarBounty>(`/bounties/${encodeURIComponent(String(bountyId))}`),
    listSubmissions: (bountyId?: UintLike) =>
      get<MortarSubmission[]>(
        bountyId === undefined
          ? "/submissions"
          : `/submissions?bounty_id=${encodeURIComponent(String(bountyId))}`,
      ),
    listDisputes: (submissionId?: UintLike) =>
      get<MortarDispute[]>(
        submissionId === undefined
          ? "/disputes"
          : `/disputes?submission_id=${encodeURIComponent(String(submissionId))}`,
      ),
  };
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortJson(value));
}

export function metadataToDataUri(metadata: MosaicMetadata): string {
  return `data:application/json,${encodeURIComponent(canonicalJson(metadata))}`;
}

export function parseMetadataUri(uri: string | null | undefined): unknown | null {
  if (!uri) return null;
  if (uri.startsWith("data:application/json,")) {
    return parseJson(decodeURIComponent(uri.slice("data:application/json,".length)));
  }
  if (uri.startsWith("data:application/json;base64,")) {
    return parseJson(atob(uri.slice("data:application/json;base64,".length)));
  }
  if (uri.trim().startsWith("{")) return parseJson(uri);
  return null;
}

export function approveUsdcTx(config: MosaicConfig, amount: UintLike): WalletTx {
  const normalized = normalizeConfig(config);
  return tx(
    normalized,
    normalized.usdcAddress,
    encodeCall(SELECTORS.approve, ["address", "uint256"], [normalized.contractAddress, amount]),
  );
}

export function createBountyTx(config: MosaicConfig, input: CreateBountyInput): WalletTx {
  const normalized = normalizeConfig(config);
  return tx(
    normalized,
    normalized.contractAddress,
    encodeCall(
      SELECTORS.createBounty,
      ["string", "bytes32", "uint256", "uint64"],
      [input.metadataUri, input.metadataHash, input.rewardAmount, input.duration],
    ),
  );
}

export function submitTx(config: MosaicConfig, input: SubmitInput): WalletTx {
  const normalized = normalizeConfig(config);
  return tx(
    normalized,
    normalized.contractAddress,
    encodeCall(
      SELECTORS.submit,
      ["uint256", "string", "bytes32"],
      [input.bountyId, input.metadataUri, input.metadataHash],
    ),
  );
}

export function refundSubmissionBondTx(config: MosaicConfig, submissionId: UintLike): WalletTx {
  const normalized = normalizeConfig(config);
  return tx(
    normalized,
    normalized.contractAddress,
    encodeCall(SELECTORS.refundSubmissionBond, ["uint256"], [submissionId]),
  );
}

export function disputeTx(config: MosaicConfig, input: DisputeInput): WalletTx {
  const normalized = normalizeConfig(config);
  return tx(
    normalized,
    normalized.contractAddress,
    encodeCall(
      SELECTORS.dispute,
      ["uint256", "string", "bytes32"],
      [input.submissionId, input.metadataUri, input.metadataHash],
    ),
  );
}

export function finalizeBountyTx(config: MosaicConfig, bountyId: UintLike): WalletTx {
  const normalized = normalizeConfig(config);
  return tx(
    normalized,
    normalized.contractAddress,
    encodeCall(SELECTORS.finalize, ["uint256"], [bountyId]),
  );
}

export function advanceReviewCursorTx(config: MosaicConfig, bountyId: UintLike): WalletTx {
  const normalized = normalizeConfig(config);
  return tx(
    normalized,
    normalized.contractAddress,
    encodeCall(SELECTORS.advanceReviewCursor, ["uint256"], [bountyId]),
  );
}

export function resolveDisputeTx(config: MosaicConfig, input: ResolveInput): WalletTx {
  const normalized = normalizeConfig(config);
  return tx(
    normalized,
    normalized.contractAddress,
    encodeCall(SELECTORS.resolveDispute, ["uint256", "bool"], [input.challengeId, input.accepted]),
  );
}

export function cancelResolvedDisputeTx(config: MosaicConfig, challengeId: UintLike): WalletTx {
  const normalized = normalizeConfig(config);
  return tx(
    normalized,
    normalized.contractAddress,
    encodeCall(SELECTORS.cancelResolvedDispute, ["uint256"], [challengeId]),
  );
}

export function refundBountyTx(config: MosaicConfig, bountyId: UintLike): WalletTx {
  const normalized = normalizeConfig(config);
  return tx(
    normalized,
    normalized.contractAddress,
    encodeCall(SELECTORS.refundExpired, ["uint256"], [bountyId]),
  );
}

export function withdrawTx(config: MosaicConfig): WalletTx {
  const normalized = normalizeConfig(config);
  return tx(normalized, normalized.contractAddress, encodeCall(SELECTORS.withdraw, [], []));
}

export function withdrawToTx(config: MosaicConfig, recipient: Address): WalletTx {
  const normalized = normalizeConfig(config);
  return tx(
    normalized,
    normalized.contractAddress,
    encodeCall(SELECTORS.withdrawTo, ["address"], [recipient]),
  );
}

export function setConfigTx(config: MosaicConfig, input: SetConfigInput): WalletTx {
  const normalized = normalizeConfig(config);
  return tx(
    normalized,
    normalized.contractAddress,
    encodeCall(
      SELECTORS.setConfig,
      ["uint256", "uint16", "uint16", "uint64", "address"],
      [
        input.minRewardAmount,
        input.bondBps,
        input.postFeeBps,
        input.reviewWindow,
        input.feeRecipient,
      ],
    ),
  );
}

export function setAllowedDurationTx(
  config: MosaicConfig,
  input: SetAllowedDurationInput,
): WalletTx {
  const normalized = normalizeConfig(config);
  return tx(
    normalized,
    normalized.contractAddress,
    encodeCall(SELECTORS.setAllowedDuration, ["uint64", "bool"], [input.duration, input.allowed]),
  );
}

export function setGroutTx(config: MosaicConfig, input: SetGroutInput): WalletTx {
  const normalized = normalizeConfig(config);
  return tx(
    normalized,
    normalized.contractAddress,
    encodeCall(SELECTORS.setGrout, ["address", "bool"], [input.grout, input.allowed]),
  );
}

export function setAdminTx(config: MosaicConfig, admin: Address): WalletTx {
  const normalized = normalizeConfig(config);
  return tx(
    normalized,
    normalized.contractAddress,
    encodeCall(SELECTORS.setAdmin, ["address"], [admin]),
  );
}

export function quoteCreateAmount(
  rewardAmount: UintLike,
  config: Pick<BountyContractConfig, "bondBps" | "postFeeBps"> = DEFAULT_BOUNTY_CONTRACT_CONFIG,
) {
  const reward = parseUint(rewardAmount);
  const bondAmount = bpsAmount(reward, config.bondBps);
  const feeAmount = bpsAmount(reward, config.postFeeBps);
  return {
    rewardAmount: reward,
    bondAmount,
    feeAmount,
    totalAmount: reward + feeAmount,
  };
}

function normalizeConfig(config: MosaicConfig): Required<MosaicConfig> {
  return {
    chainId: config.chainId ?? BASE_CHAIN_ID,
    contractAddress: normalizeAddress(config.contractAddress),
    usdcAddress: normalizeAddress(config.usdcAddress ?? BASE_USDC_ADDRESS),
  };
}

function tx(config: Required<MosaicConfig>, to: Address, data: Hex): WalletTx {
  return {
    chainId: config.chainId,
    to,
    data,
    value: "0x0",
  };
}

function encodeCall(selector: Hex, types: AbiType[], values: unknown[]): Hex {
  if (types.length !== values.length) throw new Error("abi input length mismatch");

  const head: string[] = [];
  const tail: string[] = [];
  let tailBytes = 0;

  for (let index = 0; index < types.length; index += 1) {
    const type = types[index];
    const value = values[index];
    if (type === "string") {
      head.push(encodeUint(BigInt(types.length * 32 + tailBytes)));
      const encoded = encodeString(String(value));
      tail.push(encoded);
      tailBytes += encoded.length / 2;
    } else {
      head.push(encodeStatic(type, value));
    }
  }

  return `0x${selector.slice(2)}${head.join("")}${tail.join("")}`;
}

function encodeStatic(type: AbiType, value: unknown): string {
  switch (type) {
    case "address":
      return encodeAddress(String(value));
    case "bool":
      return encodeUint(value ? BigInt(1) : BigInt(0));
    case "bytes32":
      return encodeBytes32(String(value));
    case "uint16":
      return encodeUint(toUint(value, 16));
    case "uint64":
      return encodeUint(toUint(value, 64));
    case "uint256":
      return encodeUint(toUint(value, 256));
    case "string":
      throw new Error("string is dynamic");
  }
}

function encodeString(value: string): string {
  const bytes = new TextEncoder().encode(value);
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${encodeUint(BigInt(bytes.length))}${padRight(hex)}`;
}

function encodeAddress(value: string): string {
  return normalizeAddress(value).slice(2).toLowerCase().padStart(64, "0");
}

function encodeBytes32(value: string): string {
  const raw = stripHex(value);
  if (raw.length !== 64) throw new Error("bytes32 value must be 32 bytes");
  return raw.toLowerCase();
}

function encodeUint(value: UintLike): string {
  return toUint(value, 256).toString(16).padStart(64, "0");
}

function toUint(value: unknown, bits: number): bigint {
  const bigint = parseUint(value);
  if (bigint < BigInt(0) || bigint >= BigInt(1) << BigInt(bits)) {
    throw new Error(`uint${bits} value out of range`);
  }
  return bigint;
}

function parseUint(value: unknown): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value) || value < 0) throw new Error("number must be a safe uint");
    return BigInt(value);
  }
  if (typeof value === "string" && /^(0x[0-9a-fA-F]+|[0-9]+)$/.test(value)) {
    return BigInt(value);
  }
  throw new Error("invalid uint value");
}

function bpsAmount(amount: bigint, bps: number): bigint {
  const bpsValue = BigInt(bps);
  const scale = BigInt(10_000);
  const remainder = (amount % scale) * bpsValue;
  const roundedRemainder =
    remainder === BigInt(0) ? BigInt(0) : (remainder - BigInt(1)) / scale + BigInt(1);
  return (amount / scale) * bpsValue + roundedRemainder;
}

function normalizeAddress(value: string): Address {
  if (!/^0x[0-9a-fA-F]{40}$/.test(value)) throw new Error("invalid address");
  return value as Address;
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortJson);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, sortJson(item)]),
  );
}

function parseJson(value: string): unknown | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function stripHex(value: string): string {
  if (!/^0x[0-9a-fA-F]*$/.test(value)) throw new Error("invalid hex");
  return value.slice(2);
}

function padRight(hex: string): string {
  const remainder = hex.length % 64;
  return remainder === 0 ? hex : hex.padEnd(hex.length + 64 - remainder, "0");
}
