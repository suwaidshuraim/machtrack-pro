
import { Machine, Transfer, MaintenanceTask } from './types';

export const MACHINES: Machine[] = [
  {
    id: 'MAC-001',
    name: 'CNC Milling Center XL',
    serialNumber: 'SN-7721-A',
    type: 'Milling Machine',
    location: 'Production Floor A',
    status: 'Operational',
    lastMaintenanceDate: '2024-10-15',
    lastInspectionDate: '2024-11-20',
    usageHistory: 'Daily operation, 8 hours per day for the last 6 months. High load on Mondays.',
    imageUrl: 'https://picsum.photos/seed/cnc/800/600',
  },
  {
    id: 'MAC-002',
    name: 'Robotic Welder V3',
    serialNumber: 'SN-9902-B',
    type: 'Robotics',
    location: 'Assembly Line 1',
    status: 'In Maintenance',
    lastMaintenanceDate: '2024-12-01',
    lastInspectionDate: '2024-11-05',
    usageHistory: 'Continuous 24/7 operation. Precision work. Regular recalibration needed.',
    imageUrl: 'https://picsum.photos/seed/robot/800/600',
  },
  {
    id: 'MAC-003',
    name: 'Hydraulic Stamping Press',
    serialNumber: 'SN-1105-C',
    type: 'Press',
    location: 'Machine Bank',
    status: 'Operational',
    lastMaintenanceDate: '2024-08-20',
    lastInspectionDate: '2024-09-10',
    usageHistory: 'Used for heavy metal stamping. 12 hours daily. High pressure cycles.',
    imageUrl: 'https://picsum.photos/seed/press/800/600',
  },
  {
    id: 'MAC-004',
    name: 'Laser Cutter Pro',
    serialNumber: 'SN-4432-D',
    type: 'Laser',
    location: 'Warehouse B',
    status: 'Down',
    lastMaintenanceDate: '2024-11-10',
    lastInspectionDate: '2024-12-05',
    usageHistory: 'Intermittent use. High precision requirements. Currently cooling system failure.',
    imageUrl: 'https://picsum.photos/seed/laser/800/600',
  },
  {
    id: 'MAC-005',
    name: 'Automated Sorter S5',
    serialNumber: 'SN-2211-E',
    type: 'Conveyor',
    location: 'Packaging Area',
    status: 'Operational',
    lastMaintenanceDate: '2025-01-05',
    lastInspectionDate: '2024-12-20',
    usageHistory: 'Sorts finished products. High throughput. 16 hours daily.',
    imageUrl: 'https://picsum.photos/seed/conveyor/800/600',
  }
];

export const TRANSFERS: Transfer[] = [
  {
    id: 'TR-1001',
    machineId: 'MAC-001',
    machineName: 'CNC Milling Center XL',
    fromLocation: 'Machine Bank',
    toLocation: 'Production Floor A',
    transferDate: '2024-12-15',
    requestedBy: 'John Smith',
    status: 'Completed',
  },
  {
    id: 'TR-1002',
    machineId: 'MAC-004',
    machineName: 'Laser Cutter Pro',
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
    machineName: 'Robotic Welder V3',
    description: 'Arm joint lubrication and sensor recalibration.',
    priority: 'High',
    scheduledDate: '2025-02-14',
    assignedTechnician: 'Robert Miles',
    status: 'In Progress',
  },
  {
    id: 'MT-5002',
    machineId: 'MAC-004',
    machineName: 'Laser Cutter Pro',
    description: 'Cooling system repair and lens cleaning.',
    priority: 'Urgent',
    scheduledDate: '2025-02-12',
    assignedTechnician: 'Emily Chen',
    status: 'Overdue',
  },
  {
    id: 'MT-5003',
    machineId: 'MAC-003',
    machineName: 'Hydraulic Stamping Press',
    description: 'Quarterly hydraulic fluid check.',
    priority: 'Medium',
    scheduledDate: '2025-02-20',
    assignedTechnician: 'Mark Thompson',
    status: 'Scheduled',
  }
];
