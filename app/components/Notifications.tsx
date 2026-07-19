import { getNotificationsByDayAction , deleteNotificationAction} from "../actions/bill-actions";
import { formatCurrency } from "../lib/format";
export default async function Notifications({
  showDeleteActions = true,
}: {
  showDeleteActions?: boolean;
}) {
  const notifications = await getNotificationsByDayAction();

  return (
    <div className="rounded-lg  bg-gray-900 p-4 text-gray-300 dark:bg-white dark:text-black">
      <div className="flex items-center justify-between gap-3 border-b border-gray-700 pb-2 dark:border-gray-300">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <span
          aria-label={`${notifications.length} notifications`}
          className="grid min-h-8 min-w-8 place-items-center rounded-full border border-yellow-300/70 bg-gray-950 px-2 text-sm font-bold text-green-400 shadow-[0_0_18px_rgba(250,204,21,0.25)] dark:bg-blue-950 dark:text-yellow-300"
        >
          {notifications.length}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-center justify-between gap-3 rounded-md border border-gray-700 p-3 text-sm dark:border-gray-300"
            >
              <div>
                <p>{notification.description} (today): {formatCurrency(notification.amount)}</p>
                <time
                  dateTime={notification.sendDate.toISOString()}
                  className="text-xs text-gray-400 dark:text-gray-600"
                >
                  {notification.sendDate.toLocaleDateString()}
                </time>
              </div>

              {showDeleteActions ? (
                <form action={deleteNotificationAction.bind(null, notification.id)}>
                  <button
                    type="submit"
                    className="rounded-md bg-red-700 px-3 py-1 text-xs font-semibold text-white hover:bg-red-800"
                  >
                    Delete
                  </button>
                </form>
              ) : null}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-600">
            No bills scheduled for today.
          </p>
        )}
      </div>
    </div>
  );
}
