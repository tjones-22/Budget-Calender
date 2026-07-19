import { AddBill } from "@/app/components/AddBill";

type AddBillPageProps = {
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

export default async function AddBillPage({ searchParams }: AddBillPageProps) {
    const params = await searchParams;

    return (
        <AddBill
          date={getDateValue(params)}
          redirectHref={getRedirectHref(params)}
        />
    );
}
