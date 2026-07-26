import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  notification: {
    create: vi.fn(),
    deleteMany: vi.fn(),
    findMany: vi.fn(),
  },
}));

vi.mock("./prisma", () => ({
  prisma: prismaMock,
}));

import {
  createNotification,
  deleteNotification,
  getNotificationsByDay,
} from "./notifications";

describe("notification db helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 25, 12));
  });

  it("queries today's notifications for a user", async () => {
    prismaMock.notification.findMany.mockResolvedValue([]);

    await getNotificationsByDay("user-1");

    expect(prismaMock.notification.findMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        sendDate: {
          gte: new Date(2026, 6, 25),
          lt: new Date(2026, 6, 26),
        },
      },
      orderBy: {
        sendDate: "asc",
      },
      select: {
        description: true,
        sendDate: true,
        id: true,
        amount: true,
      },
    });
  });

  it("creates a notification", async () => {
    const sendDate = new Date(2026, 6, 25);

    await createNotification("Internet", sendDate, "bill-1", "user-1", 79.99);

    expect(prismaMock.notification.create).toHaveBeenCalledWith({
      data: {
        description: "Internet",
        sendDate,
        billId: "bill-1",
        userId: "user-1",
        amount: 79.99,
      },
    });
  });

  it("deletes only the matching user's notification", async () => {
    await deleteNotification("notification-1", "user-1");

    expect(prismaMock.notification.deleteMany).toHaveBeenCalledWith({
      where: {
        id: "notification-1",
        userId: "user-1",
      },
    });
  });
});
