import { getNotificationsByDayAction , deleteNotificationAction} from "../actions/bill-actions";

export default async function Notifications() {
  const notifications = await getNotificationsByDayAction();

  return (
    <div className="rounded-lg  bg-gray-900 p-4 text-gray-300 dark:bg-white dark:text-black">
      <h2 className="text-lg font-semibold">Notifications</h2>

      <div className="mt-4 space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-center justify-between gap-3 rounded-md border border-gray-700 p-3 text-sm dark:border-gray-300"
            >
              <div>
                <p>{notification.description} today</p>
                <time
                  dateTime={notification.sendDate.toISOString()}
                  className="text-xs text-gray-400 dark:text-gray-600"
                >
                  {notification.sendDate.toLocaleDateString()}
                </time>
              </div>

              <form action={deleteNotificationAction.bind(null, notification.id)}>
                <button
                  type="submit"
                  className="rounded-md bg-red-700 px-3 py-1 text-xs font-semibold text-white hover:bg-red-800"
                >
                  Delete
                </button>
              </form>
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
