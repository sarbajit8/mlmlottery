export type Role = 'SUPER_ADMIN' | 'AGENT';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING_KYC';
export type SlotStatus = 'ACTIVE' | 'OPEN_NOW' | 'DRAW_DONE' | 'CLOSED';
export type BatchStatus = 'OPEN' | 'LOCKED';
export type TicketStatus = 'AVAILABLE' | 'SOLD' | 'WINNER' | 'CANCELLED';
export type CommissionStatus = 'PENDING' | 'PAID' | 'REVERSED';
export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
export type PayoutMode = 'INSTANT' | 'BATCH';
export type ShortfallPolicy = 'FORFEIT' | 'ROLLUP_TO_ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  mobile: string;
  whatsapp?: string | null;
  role: Role;
  sponsorId?: number | null;
  referralCode: string;
  status: UserStatus;
  isCompanyWallet: boolean;
  walletBalance: string;
  kycDocUrl?: string | null;
  createdAt: string;
  sponsor?: { id: number; name: string; referralCode: string } | null;
  _count?: { downline: number };
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DrawSlot {
  id: number;
  name: string;
  salesOpenTime: string;
  drawCloseTime: string;
  isActive: boolean;
  status: SlotStatus;
  salesWindowMinutes: number;
}

export interface Series {
  id: number;
  name: string;
  multiplier: string;
  basePrice: string;
  status: 'ACTIVE' | 'INACTIVE';
  semValue: string;
}

export interface TicketBatch {
  id: number;
  batchCode: string;
  drawSlotId: number;
  drawDate: string;
  seriesId: number;
  prefix: string;
  startNumber: number;
  quantity: number;
  pricePerTicket: string;
  totalSemValue: string;
  status: BatchStatus;
  createdAt: string;
  drawSlot: DrawSlot;
  series: Series;
  createdBy: { id: number; name: string };
  counts: { available: number; sold: number; cancelled: number; total: number };
  soldPercent: number;
}

export interface Ticket {
  id: number;
  ticketNumber: string;
  status: TicketStatus;
  price: string;
  semValue: string;
  soldAt?: string | null;
  series?: { id: number; name: string; multiplier: string };
}

export interface Customer {
  id: number;
  name: string;
  mobile: string;
  whatsapp?: string | null;
  email?: string | null;
  createdAt: string;
  _count?: { tickets: number };
}

export interface PaymentMethod {
  id: number;
  label: string;
  upiId: string;
  qrImage: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  createdBy?: { id: number; name: string };
}

export interface Receipt {
  id: number;
  receiptCode: string;
  agentId: number;
  customerId: number;
  drawSlotId: number;
  drawDate: string;
  totalTickets: number;
  totalSemValue: string;
  totalAmount: string;
  paymentMethodId: number;
  transactionId: string;
  createdAt: string;
  agent?: { id: number; name: string };
  customer?: Customer;
  drawSlot?: DrawSlot;
  tickets?: Ticket[];
  paymentMethod?: { id: number; label: string; upiId: string };
}

export interface SaleResult {
  receipt: Receipt;
  customer: Customer;
  ticketNumbers: string[];
  waLink: string | null;
}

export type PrizeTier = 'FIRST' | 'SECOND' | 'THIRD' | 'FOURTH' | 'FIFTH';

export interface DrawResultInput {
  drawName: string;
  drawNumber: string;
  drawSlotId: number;
  drawDate: string;
  firstPrizeTicketNumber: string;
  firstPrizeAmount: number;
  secondPrizeAmount: number;
  secondPrizeNumbers: string[];
  thirdPrizeAmount: number;
  thirdPrizeNumbers: string[];
  fourthPrizeAmount: number;
  fourthPrizeNumbers: string[];
  fifthPrizeAmount: number;
  fifthPrizePercentage: number;
  fifthPrizeNumbers: string[];
}

export interface WinnerTicket extends Ticket {
  soldByAgent?: { id: number; name: string } | null;
  soldToCustomer?: Customer | null;
}

export interface DrawResultWinnerEntry {
  id: number;
  prizeTier: PrizeTier;
  prizeAmount: string;
  ticket: WinnerTicket;
  drawResult?: { id: number; drawName: string; drawNumber: string; declaredAt: string; drawSlot: DrawSlot };
}

export interface DrawResult {
  id: number;
  drawName: string;
  drawNumber: string;
  drawSlotId: number;
  drawDate: string;
  firstPrizeTicket: WinnerTicket;
  firstPrizeAmount: string;
  secondPrizeAmount: string;
  secondPrizeNumbers: string[];
  thirdPrizeAmount: string;
  thirdPrizeNumbers: string[];
  fourthPrizeAmount: string;
  fourthPrizeNumbers: string[];
  fifthPrizeAmount: string;
  fifthPrizePercentage: string;
  fifthPrizeNumbers: string[];
  declaredAt: string;
  declaredBy?: { id: number; name: string };
  drawSlot: DrawSlot;
  winners: DrawResultWinnerEntry[];
}

export interface DrawResultListItem extends Omit<DrawResult, 'winners'> {
  totalWinners: number;
  winnerCounts: Record<PrizeTier, number>;
}

export interface MlmLevelPercentage {
  id: number;
  levelNumber: number;
  percentage: string;
}

export interface MlmSettings {
  id: number;
  maxLevels: number;
  commissionBase: 'SEM_VALUE' | 'PRICE' | 'FLAT';
  flatAmount?: string | null;
  payoutMode: PayoutMode;
  minPayoutThreshold: string;
  shortfallPolicy: ShortfallPolicy;
  effectiveFrom: string;
  effectiveTo?: string | null;
  levelPercentages: MlmLevelPercentage[];
}

export interface TreeNode {
  id: number;
  name: string;
  referralCode: string;
  role: Role;
  status: UserStatus;
  sponsorId: number | null;
  depth: number;
  personalSalesToday: number;
  personalSalesMonth: number;
  teamSales: number;
  directCount: number;
  totalDownlineCount: number;
  children: TreeNode[];
}

export interface CommissionLedgerEntry {
  id: number;
  levelNumber: number;
  semValue: string;
  percentageApplied: string;
  commissionAmount: string;
  status: CommissionStatus;
  createdAt: string;
  paidAt?: string | null;
  sourceAgent: { id: number; name: string };
  ticket: { ticketNumber: string };
  receipt: { receiptCode: string };
}

export interface WalletTransaction {
  id: number;
  type: 'COMMISSION' | 'WITHDRAWAL' | 'ADJUSTMENT';
  amount: string;
  balanceAfter: string;
  refId?: string | null;
  status: string;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: number;
  userId: number;
  amount: string;
  status: WithdrawalStatus;
  requestedAt: string;
  processedAt?: string | null;
  user?: { id: number; name: string; referralCode: string };
}

export interface AdminDashboard {
  ticketsSoldToday: number;
  revenueToday: string;
  ticketsSoldTotal: number;
  revenueTotal: string;
  activeAgents: number;
  commissionPaidToday: string;
  commissionPaidTotal: string;
  pendingWithdrawals: number;
  trend: { date: string; tickets: number; revenue: number }[];
}

export interface AgentDashboard {
  todaySemValue: string;
  todayTicketCount: number;
  monthlySemValue: string;
  monthlyTicketCount: number;
  todayCommission: string;
  teamSales: string;
  directReferrals: number;
}

export interface TicketSummaryCard {
  drawSlotId: number;
  drawSlotName: string;
  available: number;
  sold: number;
  revenue: string;
  batchCount: number;
}

export interface ApiErrorShape {
  error: { code: string; message: string; details?: unknown };
}
