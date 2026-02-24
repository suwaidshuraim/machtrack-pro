
import { Machine, Transfer, MaintenanceTask } from './types';

// Expanded mock data to reflect requested counts for a realistic prototype
export const MACHINES: Machine[] = [
  ...Array(15).fill(null).map((_, i) => ({
    id: `FB-${100 + i}`,
    name: `Flat Bed Stitcher ${i + 1}`,
    serialNumber: `SN-FB-${1000 + i}`,
    type: 'Flat Bed',
    location: i < 5 ? 'Line 1' : i < 10 ? 'Line 2' : 'Machine Bank',
    status: 'Operational' as const,
    lastMaintenanceDate: '2024-10-15',
    lastInspectionDate: '2024-11-20',
    usageHistory: 'Standard production use.',
    imageUrl: 'https://picsum.photos/seed/flatbed/400/300',
  })),
  ...Array(10).fill(null).map((_, i) => ({
    id: `CB-${200 + i}`,
    name: `Cylinder Bed ${i + 1}`,
    serialNumber: `SN-CB-${2000 + i}`,
    type: 'Cylinder',
    location: i < 5 ? 'Line 3' : 'Machine Bank',
    status: i === 0 ? 'Down' as const : 'Operational' as const,
    lastMaintenanceDate: '2024-12-01',
    lastInspectionDate: '2024-11-05',
    usageHistory: 'Heavy material processing.',
    imageUrl: 'https://picsum.photos/seed/cylinder/400/300',
  })),
  ...Array(25).fill(null).map((_, i) => ({
    id: `AMS-${300 + i}`,
    name: `AMS Automated ${i + 1}`,
    serialNumber: `SN-AMS-${3000 + i}`,
    type: 'AMS',
    location: i < 10 ? 'Line 4' : i < 20 ? 'Line 5' : 'Machine Bank',
    status: i % 10 === 0 ? 'In Maintenance' as const : 'Operational' as const,
    lastMaintenanceDate: '2024-08-20',
    lastInspectionDate: '2024-09-10',
    usageHistory: 'Pattern stitching specialist.',
    imageUrl: 'https://picsum.photos/seed/ams/400/300',
  })),
  {
    id: 'MAC-999',
    name: 'Heavy Presser',
    serialNumber: 'SN-PRS-999',
    type: 'Others',
    location: 'Line 1',
    status: 'Operational',
    lastMaintenanceDate: '2025-01-10',
    lastInspectionDate: '2025-01-05',
    usageHistory: 'Final stage pressing.',
    imageUrl: 'https://picsum.photos/seed/press/400/300',
  }
];

export const TRANSFERS: Transfer[] = [
  {
    id: 'TR-1001',
    machineId: 'FB-101',
    machineName: 'Flat Bed Stitcher 2',
    fromLocation: 'Machine Bank',
    toLocation: 'Line 1',
    transferDate: '2024-12-15',
    requestedBy: 'Admin',
    status: 'Completed',
  }
];

export const MAINTENANCE_TASKS: MaintenanceTask[] = [
  {
    id: 'MT-5001',
    machineId: 'CB-200',
    machineName: 'Cylinder Bed 1',
    description: 'Scheduled calibration.',
    priority: 'High',
    scheduledDate: '2025-02-28',
    assignedTechnician: 'Robert M.',
    status: 'Scheduled',
  }
];
