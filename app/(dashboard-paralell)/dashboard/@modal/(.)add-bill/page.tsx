import { AddBill } from "@/app/components/AddBill";
import Modal from "@/app/components/Modal";

type AddBillModalProps = {
  searchParams: Promise<{
    year?: string;
    month?: string;
    day?: string;
  }>;
};

function getDateValue({
  year,
  month,
  day,
}: {
  year?: string;
  month?: string;
  day?: string;
}) {
  if (!year || !month || !day) {
    return "";
  }

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function getRedirectHref({ year, month }: { year?: string; month?: string }) {
  if (!year || !month) {
    return "/dashboard/calender";
  }

  return `/dashboard/calender?year=${year}&month=${month}`;
}

export default async function AddBillModal({ searchParams }: AddBillModalProps) {
  const params = await searchParams;

  return (
    <Modal pathname="/dashboard/add-bill">
      <AddBill
        date={getDateValue(params)}
        redirectHref={getRedirectHref(params)}
      />
    </Modal>
  );
}
