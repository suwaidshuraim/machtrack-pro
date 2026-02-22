
import { Machine, Transfer, MaintenanceTask } from './types';

export const MACHINES: Machine[] = [
  {
    id: 'MAC-001',
    name: 'Flat Bed Stitcher X1',
    serialNumber: 'FB-7721-A',
    type: 'Flat Bed',
    location: 'Production Floor A',
    status: 'Operational',
    lastMaintenanceDate: '2024-10-15',
    lastInspectionDate: '2024-11-20',
    usageHistory: 'Daily operation, 8 hours per day. High throughput.',
    imageUrl: 'https://picsum.photos/seed/flatbed/800/600',
  },
  {
    id: 'MAC-002',
    name: 'Cylinder Bed V3',
    serialNumber: 'CB-9902-B',
    type: 'Cylinder Bed',
    location: 'Assembly Line 1',
    status: 'In Maintenance',
    lastMaintenanceDate: '2024-12-01',
    lastInspectionDate: '2024-11-05',
    usageHistory: 'Continuous use for heavy materials.',
    imageUrl: 'https://picsum.photos/seed/cylinder/800/600',
  },
  {
    id: 'MAC-003',
    name: 'AMS Automated Unit',
    serialNumber: 'AMS-1105-C',
    type: 'AMS',
    location: 'Machine Bank',
    status: 'Operational',
    lastMaintenanceDate: '2024-08-20',
    lastInspectionDate: '2024-09-10',
    usageHistory: 'Pattern stitching specialist.',
    imageUrl: 'https://picsum.photos/seed/ams/800/600',
  },
  {
    id: 'MAC-004',
    name: 'Heavy Duty Embosser',
    serialNumber: 'EMB-4432-D',
    type: 'Embossing',
    location: 'Warehouse B',
    status: 'Down',
    lastMaintenanceDate: '2024-11-10',
    lastInspectionDate: '2024-12-05',
    usageHistory: 'Used for logo pressing. Cooling system error.',
    imageUrl: 'https://picsum.photos/seed/emboss/800/600',
  },
  {
    id: 'MAC-005',
    name: 'Hydraulic Press P5',
    serialNumber: 'PRE-2211-E',
    type: 'Pressing',
    location: 'Packaging Area',
    status: 'Operational',
    lastMaintenanceDate: '2025-01-05',
    lastInspectionDate: '2024-12-20',
    usageHistory: 'Finishing press for high volume.',
    imageUrl: 'https://picsum.photos/seed/press/800/600',
  },
  {
    id: 'MAC-006',
    name: 'Flat Bed High-Speed',
    serialNumber: 'FB-8822-Z',
    type: 'Flat Bed',
    location: 'Production Floor A',
    status: 'Operational',
    lastMaintenanceDate: '2025-01-10',
    lastInspectionDate: '2025-01-05',
    usageHistory: 'Recently installed.',
    imageUrl: 'https://picsum.photos/seed/flatbed2/800/600',
  }
];

export const TRANSFERS: Transfer[] = [
  {
    id: 'TR-1001',
    machineId: 'MAC-001',
    machineName: 'Flat Bed Stitcher X1',
    fromLocation: 'Machine Bank',
    toLocation: 'Production Floor A',
    transferDate: '2024-12-15',
    requestedBy: 'John Smith',
    status: 'Completed',
  },
  {
    id: 'TR-1002',
    machineId: 'MAC-004',
    machineName: 'Heavy Duty Embosser',
    fromLocation: 'Production Floor B',
    toLocation: 'Warehouse B',
    transferDate: '2025-01-10',
    requestedBy: 'Sarah Connor',
    status: 'Completed',
  }
];

export const MAINTENANCE_TASKS: MaintenanceTask[] = [
  {
    id: 'MT-5001',
    machineId: 'MAC-002',
    machineName: 'Cylinder Bed V3',
    description: 'Arm joint lubrication.',
    priority: 'High',
    scheduledDate: '2025-02-14',
    assignedTechnician: 'Robert Miles',
    status: 'In Progress',
  }
];
