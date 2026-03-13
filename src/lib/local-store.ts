/**
 * local-store.ts
 * Event-driven localStorage CRUD store — replaces Firestore entirely.
 * Operates only in the browser; SSR calls are no-ops.
 */

const PREFIX = 'machtrack_';

// ─── Event Emitter ───────────────────────────────────────────────────────────

type Listener = () => void;
const listeners: Map<string, Set<Listener>> = new Map();

export function subscribe(collectionName: string, fn: Listener): () => void {
  if (!listeners.has(collectionName)) listeners.set(collectionName, new Set());
  listeners.get(collectionName)!.add(fn);
  return () => listeners.get(collectionName)?.delete(fn);
}

function emit(collectionName: string) {
  listeners.get(collectionName)?.forEach(fn => fn());
}

// ─── Core Storage Helpers ─────────────────────────────────────────────────────

function storageKey(collectionName: string): string {
  return `${PREFIX}${collectionName}`;
}

export function getAll<T = any>(collectionName: string): (T & { id: string })[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey(collectionName));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getById<T = any>(
  collectionName: string,
  id: string
): (T & { id: string }) | null {
  return getAll<T>(collectionName).find((item: any) => item.id === id) ?? null;
}

export function setItem<T = any>(
  collectionName: string,
  id: string,
  data: T
): void {
  if (typeof window === 'undefined') return;
  const items = getAll<T>(collectionName).filter((i: any) => i.id !== id);
  items.push({ ...data, id } as any);
  localStorage.setItem(storageKey(collectionName), JSON.stringify(items));
  emit(collectionName);
}

export function updateItem<T = any>(
  collectionName: string,
  id: string,
  partial: Partial<T>
): void {
  if (typeof window === 'undefined') return;
  const items = getAll<T>(collectionName).map((item: any) =>
    item.id === id ? { ...item, ...partial } : item
  );
  localStorage.setItem(storageKey(collectionName), JSON.stringify(items));
  emit(collectionName);
}

export function deleteItem(collectionName: string, id: string): void {
  if (typeof window === 'undefined') return;
  const items = getAll(collectionName).filter((item: any) => item.id !== id);
  localStorage.setItem(storageKey(collectionName), JSON.stringify(items));
  emit(collectionName);
}

export function addItem<T = any>(collectionName: string, data: T): string {
  const id =
    Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  setItem(collectionName, id, data);
  return id;
}

// ─── Seed Initial Data ────────────────────────────────────────────────────────

function seed(collectionName: string, data: any[]): void {
  if (typeof window === 'undefined') return;
  const existing = localStorage.getItem(storageKey(collectionName));
  if (existing && JSON.parse(existing).length > 0) return;
  localStorage.setItem(storageKey(collectionName), JSON.stringify(data));
}

export function seedAllCollections(): void {
  seed('machineTypes', [
    { id: 'Overlock Machine',    name: 'Overlock Machine',    description: 'High-speed serging for seam finishing and edge trimming.' },
    { id: 'Flatlock Machine',    name: 'Flatlock Machine',    description: 'Flat seam stitching for knitwear and sportswear.' },
    { id: 'Feed of the Arm',     name: 'Feed of the Arm',     description: 'Cylindrical arm feed for tubular garment sewing.' },
    { id: 'Bartack Machine',     name: 'Bartack Machine',     description: 'Reinforcement stitching at stress points.' },
    { id: 'Buttonhole Machine',  name: 'Buttonhole Machine',  description: 'Automated precision buttonhole cutting and binding.' },
  ]);

  seed('lines', [
    { id: 'line-01', name: 'Line 01', supervisor: 'Ahmad Rashid',   description: 'T-shirt and polo shirt assembly zone.' },
    { id: 'line-02', name: 'Line 02', supervisor: 'Sara Khan',      description: 'Knitwear finishing and quality check zone.' },
    { id: 'line-03', name: 'Line 03', supervisor: 'Hamid Iqbal',    description: 'Denim & bottoms specialized line.' },
    { id: 'line-04', name: 'Line 04', supervisor: 'Fatima Malik',   description: 'Fast-fashion sample & alteration unit.' },
  ]);

  seed('machines', [
    { id: 'OL-101', name: 'Overlock Machine OL-101', brand: 'Juki',   modelNo: 'MO-6714S',  serialNumber: 'SN-OL-A1B2', type: 'Overlock Machine',   location: 'Line 01',      status: 'Running',   lastMaintenanceDate: '2026-01-10', lastInspectionDate: '2026-02-15', usageHistory: 'Normal operation.',         imageUrl: 'https://picsum.photos/seed/OL-101/400/300' },
    { id: 'OL-102', name: 'Overlock Machine OL-102', brand: 'Juki',   modelNo: 'MO-6714S',  serialNumber: 'SN-OL-C3D4', type: 'Overlock Machine',   location: 'Line 01',      status: 'Idle',      lastMaintenanceDate: '2026-01-20', lastInspectionDate: '2026-02-20', usageHistory: 'Awaiting batch.',            imageUrl: 'https://picsum.photos/seed/OL-102/400/300' },
    { id: 'OL-103', name: 'Overlock Machine OL-103', brand: 'Brother',modelNo: 'MA4-B551',  serialNumber: 'SN-OL-E5F6', type: 'Overlock Machine',   location: 'Line 02',      status: 'Running',   lastMaintenanceDate: '2026-02-01', lastInspectionDate: '2026-02-28', usageHistory: 'Recently transferred.',     imageUrl: 'https://picsum.photos/seed/OL-103/400/300' },
    { id: 'FL-101', name: 'Flatlock Machine FL-101',  brand: 'Pegasus',modelNo: 'W664-35',   serialNumber: 'SN-FL-G7H8', type: 'Flatlock Machine',  location: 'Line 01',      status: 'Running',   lastMaintenanceDate: '2026-01-15', lastInspectionDate: '2026-02-10', usageHistory: 'Normal operation.',         imageUrl: 'https://picsum.photos/seed/FL-101/400/300' },
    { id: 'FL-102', name: 'Flatlock Machine FL-102',  brand: 'Pegasus',modelNo: 'W564-35',   serialNumber: 'SN-FL-I9J0', type: 'Flatlock Machine',  location: 'Machine Bank', status: 'Bank',      lastMaintenanceDate: '2025-12-05', lastInspectionDate: '2026-01-10', usageHistory: 'In storage.',               imageUrl: 'https://picsum.photos/seed/FL-102/400/300' },
    { id: 'FA-101', name: 'Feed of the Arm FA-101',   brand: 'Juki',   modelNo: 'MS-1261',   serialNumber: 'SN-FA-K1L2', type: 'Feed of the Arm',   location: 'Line 02',      status: 'Running',   lastMaintenanceDate: '2026-01-25', lastInspectionDate: '2026-03-01', usageHistory: 'Normal operation.',         imageUrl: 'https://picsum.photos/seed/FA-101/400/300' },
    { id: 'FA-102', name: 'Feed of the Arm FA-102',   brand: 'Juki',   modelNo: 'MS-1261',   serialNumber: 'SN-FA-M3N4', type: 'Feed of the Arm',   location: 'Machine Bank', status: 'Repair',    lastMaintenanceDate: '2025-11-20', lastInspectionDate: '2026-02-05', usageHistory: 'Feed dog replacement due.', imageUrl: 'https://picsum.photos/seed/FA-102/400/300' },
    { id: 'BT-101', name: 'Bartack Machine BT-101',   brand: 'Brother',modelNo: 'LK3-B430',  serialNumber: 'SN-BT-O5P6', type: 'Bartack Machine',   location: 'Line 03',      status: 'Running',   lastMaintenanceDate: '2026-02-10', lastInspectionDate: '2026-03-05', usageHistory: 'Normal operation.',         imageUrl: 'https://picsum.photos/seed/BT-101/400/300' },
    { id: 'BT-102', name: 'Bartack Machine BT-102',   brand: 'Brother',modelNo: 'LK3-B430',  serialNumber: 'SN-BT-Q7R8', type: 'Bartack Machine',   location: 'Line 03',      status: 'Breakdown', lastMaintenanceDate: '2025-10-15', lastInspectionDate: '2026-01-20', usageHistory: 'Motor failure reported.',   imageUrl: 'https://picsum.photos/seed/BT-102/400/300' },
    { id: 'BH-101', name: 'Buttonhole Machine BH-101',brand: 'Juki',   modelNo: 'LBH-1790',  serialNumber: 'SN-BH-S9T0', type: 'Buttonhole Machine',location: 'Line 04',      status: 'Running',   lastMaintenanceDate: '2026-02-20', lastInspectionDate: '2026-03-08', usageHistory: 'Normal operation.',         imageUrl: 'https://picsum.photos/seed/BH-101/400/300' },
    { id: 'BH-102', name: 'Buttonhole Machine BH-102',brand: 'Juki',   modelNo: 'LBH-1790',  serialNumber: 'SN-BH-U1V2', type: 'Buttonhole Machine',location: 'Machine Bank', status: 'Bank',      lastMaintenanceDate: '2025-12-20', lastInspectionDate: '2026-01-30', usageHistory: 'In storage.',               imageUrl: 'https://picsum.photos/seed/BH-102/400/300' },
    { id: 'OL-104', name: 'Overlock Machine OL-104',  brand: 'Brother',modelNo: 'MA4-B551',  serialNumber: 'SN-OL-W3X4', type: 'Overlock Machine',  location: 'Machine Bank', status: 'Bank',      lastMaintenanceDate: '2025-11-10', lastInspectionDate: '2026-02-01', usageHistory: 'New unit, not deployed.',   imageUrl: 'https://picsum.photos/seed/OL-104/400/300' },
  ]);

  const now = new Date();
  const d = (days: number) => new Date(now.getTime() - days * 86400000).toISOString();

  seed('transfers', [
    { id: 'tr-001', machineId: 'OL-103', machineName: 'Overlock Machine OL-103', fromLocation: 'Machine Bank', toLocation: 'Line 02',      transferDate: d(0),  requestedBy: 'Ahmad Rashid',  authorizedBy: 'Sara Khan',    status: 'Completed' },
    { id: 'tr-002', machineId: 'FL-102', machineName: 'Flatlock Machine FL-102',  fromLocation: 'Line 01',      toLocation: 'Machine Bank', transferDate: d(1),  requestedBy: 'Sara Khan',     authorizedBy: 'Ahmad Rashid', status: 'Completed' },
    { id: 'tr-003', machineId: 'FA-102', machineName: 'Feed of the Arm FA-102',   fromLocation: 'Line 03',      toLocation: 'Machine Bank', transferDate: d(3),  requestedBy: 'Hamid Iqbal',   authorizedBy: 'Ahmad Rashid', status: 'Completed' },
    { id: 'tr-004', machineId: 'BT-102', machineName: 'Bartack Machine BT-102',   fromLocation: 'Machine Bank', toLocation: 'Line 03',      transferDate: d(5),  requestedBy: 'Hamid Iqbal',   authorizedBy: 'Sara Khan',    status: 'Completed' },
    { id: 'tr-005', machineId: 'BH-102', machineName: 'Buttonhole Machine BH-102',fromLocation: 'Line 04',      toLocation: 'Machine Bank', transferDate: d(10), requestedBy: 'Fatima Malik',  authorizedBy: 'Ahmad Rashid', status: 'Completed' },
  ]);

  seed('maintenanceTasks', [
    { id: 'mt-001', machineId: 'BT-102', machineName: 'Bartack Machine BT-102',    description: 'Diagnose and replace faulty motor assembly. Unit is non-operational.',              priority: 'Urgent', scheduledDate: '2026-03-10', assignedTechnician: 'Raza Hussain', status: 'Overdue'     },
    { id: 'mt-002', machineId: 'FA-102', machineName: 'Feed of the Arm FA-102',    description: 'Replace worn feed dog mechanism and lubricate transport assembly.',                 priority: 'High',   scheduledDate: '2026-03-13', assignedTechnician: 'Raza Hussain', status: 'In Progress' },
    { id: 'mt-003', machineId: 'OL-101', machineName: 'Overlock Machine OL-101',   description: 'Routine 500-hour service: oil change, tension plate inspection, needle bar check.', priority: 'Medium', scheduledDate: '2026-03-15', assignedTechnician: 'Ali Hassan',   status: 'Scheduled'   },
    { id: 'mt-004', machineId: 'FL-102', machineName: 'Flatlock Machine FL-102',   description: 'Pre-deployment inspection before next line assignment.',                            priority: 'Low',    scheduledDate: '2026-03-18', assignedTechnician: 'Ali Hassan',   status: 'Scheduled'   },
    { id: 'mt-005', machineId: 'BH-101', machineName: 'Buttonhole Machine BH-101', description: 'Calibrate buttonhole width sensor and replace cutting blade.',                      priority: 'Medium', scheduledDate: '2026-03-20', assignedTechnician: 'Raza Hussain', status: 'Scheduled'   },
    { id: 'mt-006', machineId: 'OL-102', machineName: 'Overlock Machine OL-102',   description: 'Investigate unusual thread tension variation reported by Line 01 supervisor.',      priority: 'Urgent', scheduledDate: '2026-03-14', assignedTechnician: 'Ali Hassan',   status: 'In Progress' },
  ]);

  seed('users', [
    { id: 'user-01', firstName: 'Ahmad',  lastName: 'Rashid',  email: 'ahmad@factory.com',  role: 'Floor Manager'    },
    { id: 'user-02', firstName: 'Sara',   lastName: 'Khan',    email: 'sara@factory.com',   role: 'Production Head'  },
    { id: 'user-03', firstName: 'Hamid',  lastName: 'Iqbal',   email: 'hamid@factory.com',  role: 'Line Supervisor'  },
    { id: 'user-04', firstName: 'Fatima', lastName: 'Malik',   email: 'fatima@factory.com', role: 'Line Supervisor'  },
  ]);
}
