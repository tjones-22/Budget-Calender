"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Invite = {
  id: string;
  fromUsername: string;
  canEdit: boolean;
  shareEvents: boolean;
  shareBalances: boolean;
  shareAnalytics: boolean;
  createdAt: number;
};

type AccountDetails = {
  name: string;
  phone: string;
  notifyBills: boolean;
  notifyPaydays: boolean;
};

type ProfileMenuProps = {
  name: string;
  role: "owner" | "viewer";
};

const ProfileMenu = ({ name, role }: ProfileMenuProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [inviteUsername, setInviteUsername] = useState("");
  const [canEdit, setCanEdit] = useState(true);
  const [shareEvents, setShareEvents] = useState(true);
  const [shareBalances, setShareBalances] = useState(true);
  const [shareAnalytics, setShareAnalytics] = useState(true);
  const [accountOpen, setAccountOpen] = useState(false);
  const [account, setAccount] = useState<AccountDetails | null>(null);
  const [accountError, setAccountError] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  const initials = useMemo(() => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) {
      return "U";
    }
    if (parts.length === 1) {
      return parts[0][0]?.toUpperCase() ?? "U";
    }
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }, [name]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const loadInvites = async () => {
      setLoadingInvites(true);
      try {
        const response = await fetch("/api/groups/invites");
        const data = (await response.json()) as { invites?: Invite[] };
        setInvites(data.invites ?? []);
      } catch {
        setInvites([]);
      } finally {
        setLoadingInvites(false);
      }
    };
    loadInvites();
  }, [open]);

  const openAccount = async () => {
    setAccountError("");
    setAccountOpen(true);
    try {
      const response = await fetch("/api/account");
      const data = (await response.json()) as { user?: AccountDetails | null };
      if (!data.user) {
        setAccount({
          name: "",
          phone: "",
          notifyBills: false,
          notifyPaydays: false,
        });
        setAccountError("Unable to load account details.");
        return;
      }
      setAccount(data.user);
    } catch {
      setAccount({
        name: "",
        phone: "",
        notifyBills: false,
        notifyPaydays: false,
      });
      setAccountError("Unable to load account details.");
    }
  };

  const saveAccount = async () => {
    if (!account) {
      return;
    }
    setAccountError("");
    try {
      const response = await fetch("/api/account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(account),
      });
      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        setAccountError(data.message ?? "Unable to update account.");
        return;
      }
      setAccountOpen(false);
      router.refresh();
    } catch {
      setAccountError("Unable to update account.");
    }
  };

  const sendInvite = async () => {
    setInviteError("");
    setInviteSuccess("");
    const username = inviteUsername.trim();
    if (!username) {
      setInviteError("Enter a username.");
      return;
    }
    try {
      const response = await fetch("/api/groups/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          canEdit,
          shareEvents,
          shareBalances,
          shareAnalytics,
        }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setInviteError(data.message ?? "Unable to send invite.");
        return;
      }
      setInviteUsername("");
      setInviteSuccess("Invite sent.");
    } catch {
      setInviteError("Unable to send invite.");
    }
  };

  const respondInvite = async (inviteId: string, action: "accept" | "decline") => {
    try {
      await fetch("/api/groups/invites/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inviteId, action }),
      });
      setInvites((prev) => prev.filter((invite) => invite.id !== inviteId));
      if (action === "accept") {
        router.refresh();
      }
    } catch {
      // noop
    }
  };

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open profile menu"
      >
        {initials}
      </button>
      {open && (
        <div className="absolute left-0 z-20 mt-3 w-80 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Account
              </p>
              <p className="text-base font-semibold text-slate-900">{name}</p>
            </div>
            <button
              type="button"
              className="text-xs text-slate-400 hover:text-slate-700"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <button
              type="button"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:border-slate-300 hover:text-slate-900"
              onClick={openAccount}
            >
              Edit Account Info
            </button>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Pending Requests
                </p>
                {loadingInvites && (
                  <span className="text-xs text-slate-400">Loading...</span>
                )}
              </div>
              {invites.length === 0 ? (
                <p className="mt-2 text-xs text-slate-500">
                  No pending requests.
                </p>
              ) : (
                <div className="mt-2 space-y-2">
                  {invites.map((invite) => (
                    <div
                      key={invite.id}
                      className="rounded-lg border border-slate-200 bg-white p-2 text-xs"
                    >
                      <p className="font-semibold text-slate-700">
                        {invite.fromUsername} shared a calendar
                      </p>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
                          onClick={() => respondInvite(invite.id, "accept")}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600"
                          onClick={() => respondInvite(invite.id, "decline")}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {role === "owner" && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Share Calendar
                </p>
                <input
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                  placeholder="Username"
                  value={inviteUsername}
                  onChange={(event) => setInviteUsername(event.target.value)}
                />
                <div className="mt-2 grid gap-2 text-xs text-slate-600">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={canEdit}
                      onChange={(event) => setCanEdit(event.target.checked)}
                    />
                    Allow editing
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={shareEvents}
                      onChange={(event) => setShareEvents(event.target.checked)}
                    />
                    Share calendar events
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={shareBalances}
                      onChange={(event) => setShareBalances(event.target.checked)}
                    />
                    Share bank balances
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={shareAnalytics}
                      onChange={(event) => setShareAnalytics(event.target.checked)}
                    />
                    Share analytics
                  </label>
                </div>
                {inviteError && (
                  <p className="mt-2 text-xs text-red-500">{inviteError}</p>
                )}
                {inviteSuccess && (
                  <p className="mt-2 text-xs text-green-600">{inviteSuccess}</p>
                )}
                <button
                  type="button"
                  className="mt-3 w-full rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                  onClick={sendInvite}
                >
                  Send Invite
                </button>
              </div>
            )}

            <button
              type="button"
              className="w-full rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700"
              onClick={logout}
            >
              Log out
            </button>
          </div>
        </div>
      )}

      {accountOpen && account && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">
              Edit Account
            </h2>
            <div className="mt-4 grid gap-3 text-sm">
              <label className="grid gap-1">
                <span className="text-xs uppercase tracking-wide text-slate-500">
                  Name
                </span>
                <input
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  value={account.name}
                  onChange={(event) =>
                    setAccount((prev) =>
                      prev ? { ...prev, name: event.target.value } : prev,
                    )
                  }
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs uppercase tracking-wide text-slate-500">
                  Phone
                </span>
                <input
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  value={account.phone}
                  onChange={(event) =>
                    setAccount((prev) =>
                      prev ? { ...prev, phone: event.target.value } : prev,
                    )
                  }
                  placeholder="(012)-345-6789"
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={account.notifyBills}
                  onChange={(event) =>
                    setAccount((prev) =>
                      prev ? { ...prev, notifyBills: event.target.checked } : prev,
                    )
                  }
                />
                Text me about upcoming bills
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={account.notifyPaydays}
                  onChange={(event) =>
                    setAccount((prev) =>
                      prev ? { ...prev, notifyPaydays: event.target.checked } : prev,
                    )
                  }
                />
                Text me about upcoming paydays
              </label>
              {accountError && (
                <p className="text-xs text-red-500">{accountError}</p>
              )}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600"
                onClick={() => setAccountOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                onClick={saveAccount}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
