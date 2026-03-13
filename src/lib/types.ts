
export type MachineStatus = 'Running' | 'Idle' | 'Bank' | 'Breakdown' | 'Repair' | 'Maintenance' | 'Available';

export interface Machine {
  id: string;
  name: string;
  brand?: string;
  modelNo?: string;
  serialNumber: string;
  type: string;
  location: string;
  status: MachineStatus;
  lastMaintenanceDate: string;
  lastInspectionDate: string;
  usageHistory: string;
  imageUrl: string;
}

export interface Line {
  id: string;
  name: string;
  supervisor?: string;
  description?: string;
  imageUrl?: string;
}

export interface MachineType {
  id?: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface Transfer {
  id: string;
  machineId: string;
  machineName: string;
  fromLocation: string;
  toLocation: string;
  transferDate: string;
  requestedBy: string;
  authorizedBy?: string;
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
