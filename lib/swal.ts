import Swal from "sweetalert2";

// Base instance styled to match the admin panel (black/white, sharp corners)
const AdminSwal = Swal.mixin({
  customClass: {
    popup:          "!rounded-2xl !shadow-2xl !border !border-black/8 !p-0 !overflow-hidden",
    title:          "!font-sans !text-[17px] !font-semibold !text-black !px-6 !pt-6 !pb-0",
    htmlContainer:  "!font-sans !text-[14px] !text-black/55 !px-6 !pt-2 !pb-0 !m-0",
    actions:        "!px-6 !pb-6 !pt-4 !gap-2 !m-0",
    confirmButton:  "!rounded-lg !bg-black !text-white !text-[13px] !font-semibold !px-5 !py-2.5 !shadow-none hover:!bg-black/80 !transition",
    cancelButton:   "!rounded-lg !border !border-black/15 !bg-white !text-black/60 !text-[13px] !font-semibold !px-5 !py-2.5 !shadow-none hover:!text-black !transition",
    denyButton:     "!rounded-lg !bg-red-600 !text-white !text-[13px] !font-semibold !px-5 !py-2.5 !shadow-none hover:!bg-red-700 !transition",
    icon:           "!border-0 !mt-6 !mx-auto",
  },
  buttonsStyling: false,
  reverseButtons: true,
});

// Danger confirm (delete actions)
export async function confirmDelete(title: string, text?: string): Promise<boolean> {
  const result = await AdminSwal.fire({
    title,
    html: text ?? "This action <strong>cannot be undone</strong>.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
    customClass: {
      popup:         "!rounded-2xl !shadow-2xl !border !border-black/8 !p-0 !overflow-hidden",
      title:         "!font-sans !text-[17px] !font-semibold !text-black !px-6 !pt-6 !pb-0",
      htmlContainer: "!font-sans !text-[14px] !text-black/55 !px-6 !pt-2 !pb-0 !m-0",
      actions:       "!px-6 !pb-6 !pt-4 !gap-2 !m-0",
      confirmButton: "!rounded-lg !bg-red-600 !text-white !text-[13px] !font-semibold !px-5 !py-2.5 !shadow-none hover:!bg-red-700 !transition",
      cancelButton:  "!rounded-lg !border !border-black/15 !bg-white !text-black/60 !text-[13px] !font-semibold !px-5 !py-2.5 !shadow-none hover:!text-black !transition",
      icon:          "!border-0 !mt-6 !mx-auto",
    },
    buttonsStyling: false,
    reverseButtons: true,
  });
  return result.isConfirmed;
}

// Success toast (top-right, auto-dismiss)
export function toastSuccess(message: string) {
  AdminSwal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title: message,
    showConfirmButton: false,
    timer: 2800,
    timerProgressBar: true,
    customClass: {
      popup: "!rounded-xl !shadow-lg !border !border-black/8 !py-3 !px-4",
      title: "!font-sans !text-[13px] !font-medium !text-black",
      timerProgressBar: "!bg-emerald-500",
    },
  });
}

// Error toast
export function toastError(message: string) {
  AdminSwal.fire({
    toast: true,
    position: "top-end",
    icon: "error",
    title: message,
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: true,
    customClass: {
      popup: "!rounded-xl !shadow-lg !border !border-black/8 !py-3 !px-4",
      title: "!font-sans !text-[13px] !font-medium !text-black",
      timerProgressBar: "!bg-red-500",
    },
  });
}

// Info alert
export function alertInfo(title: string, text?: string) {
  return AdminSwal.fire({ title, text, icon: "info", confirmButtonText: "OK" });
}

export default AdminSwal;
