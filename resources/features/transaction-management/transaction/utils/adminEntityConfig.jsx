// utils/adminEntityConfig.js
import { Building2, Users, CreditCard } from "lucide-react";

export const ENTITY_CONFIG = {
  banks: {
    label: "Banks",
    field: "bank_name",
    iconComponent: Building2,
    useList: "useCheckStreamBanks",
    useCreate: "useCreateBank",
    useUpdate: "useUpdateBank",
    useDelete: "useDeleteBank",
  },
  users: {
    label: "Users",
    field: "role",
    iconComponent: Users,
    useList: "useCheckStreamAdminSettings",
    useCreate: "useCreateCheckStreamAdminSettings",
    useUpdate: "useUpdateCheckStreamAdminSettings",
    useDelete: "useDeleteCheckStreamAdminSettings",
    renderItemContent: (item) => (
      <div className="space-y-1">
        <div className="font-semibold">
          {item.employee.firstname} {item.employee.lastname}
        </div>
        <div className="text-sm text-gray-500">{item.employee.employee_email}</div>
        <div className="text-xs text-gray-600 italic">{item.role}</div>
      </div>
    ),
  },
  payorders: {
    label: "Pay to Order",
    field: "payTo",
    iconComponent: CreditCard,
    useList: "useCheckEntities",
    useCreate: "useCreateEntity",
    useUpdate: "useUpdateEntity",
    useDelete: "useDeleteEntity",
  },
};
