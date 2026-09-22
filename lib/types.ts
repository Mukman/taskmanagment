// lib/types.ts

export type UserRole = "staff" | "manager" | "director";
export type TaskPriority = "High" | "Med" | "Low";
export type TaskStatus = "To Do" | "In Progress" | "Done";
export type TaskSource = "assigned" | "self";

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  manager_id: string | null;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  priority: TaskPriority;
  start_date: string;
  due_date: string;
  status: TaskStatus;
  source: TaskSource;
  owner: string;
  assigned_by: string | null;
  completed_date: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  created_at: string;
}