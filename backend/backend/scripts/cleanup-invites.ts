import { readFile, writeFile } from "fs/promises";
import path from "path";
import { escapeCsv, parseCsvLine } from "../src/utils/csv";

type InviteRow = {
  id: string;
  groupId: string;
  fromUsername: string;
  toUsername: string;
  canEdit: string;
  shareEvents: string;
  shareBalances: string;
  shareAnalytics: string;
  status: string;
  createdAt: string;
};

const invitesPath = path.join(process.cwd(), "db", "group_invites.csv");

const run = async () => {
  let content = "";
  try {
    content = await readFile(invitesPath, "utf8");
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      console.log("No invite file found.");
      return;
    }
    throw error;
  }

  if (!content.trim()) {
    console.log("No invites to clean.");
    return;
  }

  const rows = content
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => parseCsvLine(line));

  const invites: InviteRow[] = rows.map(
    ([
      id,
      groupId,
      fromUsername,
      toUsername,
      canEdit,
      shareEvents,
      shareBalances,
      shareAnalytics,
      status,
      createdAt,
    ]) => ({
      id: id ?? "",
      groupId: groupId ?? "",
      fromUsername: fromUsername ?? "",
      toUsername: toUsername ?? "",
      canEdit: canEdit ?? "false",
      shareEvents: shareEvents ?? "false",
      shareBalances: shareBalances ?? "false",
      shareAnalytics: shareAnalytics ?? "false",
      status: status ?? "pending",
      createdAt: createdAt ?? "",
    }),
  );

  const pendingInvites = invites.filter((invite) => invite.status === "pending");
  const output = pendingInvites
    .map((invite) =>
      [
        invite.id,
        invite.groupId,
        invite.fromUsername,
        invite.toUsername,
        invite.canEdit,
        invite.shareEvents,
        invite.shareBalances,
        invite.shareAnalytics,
        invite.status,
        invite.createdAt,
      ]
        .map((value) => escapeCsv(value))
        .join(","),
    )
    .join("\n");

  await writeFile(invitesPath, output ? `${output}\n` : "", "utf8");
  console.log(
    `Cleaned invites. Remaining pending invites: ${pendingInvites.length}`,
  );
};

run().catch((error) => {
  console.error("Invite cleanup failed.", error);
  process.exitCode = 1;
});
