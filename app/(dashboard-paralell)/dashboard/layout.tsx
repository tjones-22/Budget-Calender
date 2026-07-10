import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Budget Calender - Dashboard ",
  description:
    "Users dashboard containing bill notifications, types of bills for the day, and bank analytics",
};

export default async function DashboardLayout({
  children,
  day,
  analytics,
  notifications,
  modal,
}: Readonly<{
  children: React.ReactNode;
  day: React.ReactNode;
  analytics: React.ReactNode;
  notifications: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-white p-6 text-black dark:bg-gray-900 dark:text-white">
      <div className="mx-auto max-w-5xl">
        {children}

        <section className="grid gap-4 min-[850px]:grid-cols-2">
          {notifications}

          <div className="flex h-full w-full flex-col items-center justify-between">
            {day}
            {analytics}
          </div>
        </section>
        {modal}
      </div>
    </main>
    

    
  );
}
