import type { SocialMediaFormValues } from './socialMediaSchema'
import { socialMediaApi } from '../../services/api/socialMediaApi'

export type SocialMediaRecord = SocialMediaFormValues & {
  id: string
  updatedBy: string
  lastUpdated: string
  duplicateEmail?: boolean
  duplicateSellerId?: boolean
  missingFields?: string[]
  logs: Array<{
    actor: string
    detail: string
    timestamp: string
  }>
  customFields?: Record<string, unknown>
}

export const socialDepartments = [
  'Marketing',
  'Online Department',
  'Sales',
  'Operations',
  'Admin',
  'Customer Support',
]

export const socialPeople = [
  'Michaela Santos',
  'Marketing Team',
  'Store Supervisor',
  'Online Seller Admin',
  'Customer Support',
]

export const shopNameOptions = [
  'Avada Official',
  'Avada Center',
  'Avada Boutique',
  'Avada Marketplace',
  'North Mall Shop',
]

export const socialMediaRows: SocialMediaRecord[] = [
  {
    id: 'social-001',
    type: 'Facebook',
    email: 'social@avada.local',
    password: 'Encrypted@FB01',
    department: 'Marketing',
    personUsed: 'Marketing Team',
    shopName: 'Avada Official',
    sellerIdShopCode: 'FB-AVADA-OFFICIAL',
    phoneNumber: '+63 917 300 2201',
    status: 'Active',
    notes: 'Primary Facebook page and ad account login.',
    updatedBy: 'Michaela Santos',
    lastUpdated: 'Today 11:44',
    logs: [
      {
        actor: 'Michaela Santos',
        detail: 'Verified page admin access and recovery phone.',
        timestamp: 'Today 11:44',
      },
    ],
  },
  {
    id: 'social-002',
    type: 'Shopee',
    email: 'seller@avada.local',
    password: 'Encrypted@Shop01',
    department: 'Online Department',
    personUsed: 'Online Seller Admin',
    shopName: 'Avada Marketplace',
    sellerIdShopCode: 'SHP-882104',
    phoneNumber: '+63 998 412 7001',
    status: 'Active',
    notes: 'Main Shopee Seller Center account.',
    updatedBy: 'Online Seller Admin',
    lastUpdated: 'Today 09:22',
    logs: [
      {
        actor: 'Online Seller Admin',
        detail: 'Updated seller code after marketplace verification.',
        timestamp: 'Today 09:22',
      },
    ],
  },
  {
    id: 'social-003',
    type: 'Lazada',
    email: 'seller@avada.local',
    password: 'Encrypted@Laz01',
    department: 'Online Department',
    personUsed: 'Online Seller Admin',
    shopName: 'Avada Marketplace',
    sellerIdShopCode: 'LZD-778421',
    phoneNumber: '',
    status: 'For Checking',
    notes: 'Duplicate email with Shopee account; phone number missing.',
    updatedBy: 'Service Desk',
    lastUpdated: 'Yesterday 15:18',
    duplicateEmail: true,
    missingFields: ['Phone No.'],
    logs: [
      {
        actor: 'Service Desk',
        detail: 'Flagged duplicate email and missing phone number.',
        timestamp: 'Yesterday 15:18',
      },
    ],
  },
  {
    id: 'social-004',
    type: 'TikTok',
    email: 'tiktok@avada.local',
    password: 'Encrypted@Tik01',
    department: 'Marketing',
    personUsed: 'Marketing Team',
    shopName: 'Avada Official',
    sellerIdShopCode: '',
    phoneNumber: '+63 917 881 2004',
    status: 'Missing Details',
    notes: 'Seller shop code pending verification.',
    updatedBy: 'Marketing Team',
    lastUpdated: 'May 14, 2026',
    missingFields: ['Seller ID / Shop Code'],
    logs: [
      {
        actor: 'Marketing Team',
        detail: 'Marked seller shop code as missing.',
        timestamp: 'May 14, 2026 13:12',
      },
    ],
  },
  {
    id: 'social-005',
    type: 'Shopify',
    email: 'shopify@avada.local',
    password: 'Encrypted@Shopify01',
    department: 'Operations',
    personUsed: 'Michaela Santos',
    shopName: 'Avada Official',
    sellerIdShopCode: 'SHOP-AVADA-001',
    phoneNumber: '+63 917 100 2042',
    status: 'Password Updated',
    notes: 'Password rotated after ecommerce access review.',
    updatedBy: 'Ron Villanueva',
    lastUpdated: 'May 13, 2026',
    logs: [
      {
        actor: 'Ron Villanueva',
        detail: 'Rotated password and updated account owner notes.',
        timestamp: 'May 13, 2026 10:36',
      },
    ],
  },
  {
    id: 'social-006',
    type: 'Seller Center',
    email: 'sellercenter@avada.local',
    password: '',
    department: 'Online Department',
    personUsed: 'Customer Support',
    shopName: 'North Mall Shop',
    sellerIdShopCode: 'SHP-882104',
    phoneNumber: '+63 917 441 2200',
    status: 'Missing Details',
    notes: 'Duplicate seller ID and missing password.',
    updatedBy: 'Customer Support',
    lastUpdated: 'May 12, 2026',
    duplicateSellerId: true,
    missingFields: ['Password'],
    logs: [
      {
        actor: 'Customer Support',
        detail: 'Duplicate seller ID detected during online account audit.',
        timestamp: 'May 12, 2026 09:48',
      },
    ],
  },
]

export async function fetchSocialMediaRows(): Promise<SocialMediaRecord[]> {
  const response = await socialMediaApi.list()
  const rows = Array.isArray(response.data) ? response.data : response.data?.data ?? []

  return rows as SocialMediaRecord[]
}

export function getDefaultSocialMediaFormValues(): SocialMediaFormValues {
  return {
    type: 'Facebook',
    email: '',
    password: '',
    department: 'Online Department',
    personUsed: '',
    shopName: '',
    sellerIdShopCode: '',
    phoneNumber: '',
    status: 'Active',
    notes: '',
  }
}
