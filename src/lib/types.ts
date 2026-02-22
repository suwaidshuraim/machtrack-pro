
export type MachineStatus = 'Operational' | 'In Maintenance' | 'Down' | 'In Transit';

export interface Machine {
  id: string;
  name: string;
  serialNumber: string;
  type: string;
  location: string;
  status: MachineStatus;
  lastMaintenanceDate: string;
  lastInspectionDate: string;
  usageHistory: string;
  imageUrl: string;
  runningCount?: number; // Added for UI display logic
}

export interface Transfer {
  id: string;
  machineId: string;
  machineName: string;
  fromLocation: string;
  toLocation: string;
  transferDate: string;
  requestedBy: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
}

export interface MaintenanceTask {
  id: string;
  machineId: string;
  machineName: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  scheduledDate: string;
  assignedTechnician: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';
}
