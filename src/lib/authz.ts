import { EditMode, type UserRole } from "@prisma/client";

export function isAdmin(role: UserRole | undefined): boolean {
  return role === "ADMIN";
}

export function canEditPad(params: {
  userId?: string;
  ownerId: string;
  editMode: EditMode;
}): boolean {
  if (params.editMode === "ANONYMOUS") return true;
  if (!params.userId) return false;
  if (params.editMode === "COLLABORATIVE") return true;
  return params.userId === params.ownerId;
}
