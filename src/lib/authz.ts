import { EditMode, type UserRole } from "@prisma/client";

export function isAdmin(role: UserRole | undefined): boolean {
  return role === "ADMIN";
}

export function canEditPad(params: {
  userId?: string;
  ownerId?: string | null;
  editMode: EditMode;
  isPrivate?: boolean;
}): boolean {
  if (params.isPrivate) return Boolean(params.userId && params.userId === params.ownerId);
  if (params.editMode === "ANONYMOUS") return true;
  if (!params.userId) return false;
  if (params.editMode === "COLLABORATIVE") return true;
  return params.userId === params.ownerId;
}

export function canReadPad(params: {
  userId?: string;
  ownerId?: string | null;
  isPrivate: boolean;
}): boolean {
  return !params.isPrivate || Boolean(params.userId && params.userId === params.ownerId);
}
