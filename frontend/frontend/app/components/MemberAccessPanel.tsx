"use client";

import { useEffect, useState } from "react";

type GroupMember = {
  username: string;
  role: "owner" | "viewer";
  canEdit: boolean;
  shareEvents: boolean;
  shareBalances: boolean;
  shareAnalytics: boolean;
};

const MemberAccessPanel = () => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [memberError, setMemberError] = useState("");
  const [memberSuccess, setMemberSuccess] = useState("");

  useEffect(() => {
    const loadMembers = async () => {
      setLoadingMembers(true);
      setMemberError("");
      setMemberSuccess("");
      try {
        const response = await fetch("/api/groups/members");
        const data = (await response.json()) as { members?: GroupMember[] };
        setMembers(data.members ?? []);
      } catch {
        setMembers([]);
        setMemberError("Unable to load group members.");
      } finally {
        setLoadingMembers(false);
      }
    };
    loadMembers();
  }, []);

  const updateMember = async (member: GroupMember) => {
    setMemberError("");
    setMemberSuccess("");
    try {
      const response = await fetch("/api/groups/members/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: member.username,
          canEdit: member.canEdit,
          shareEvents: member.shareEvents,
          shareBalances: member.shareBalances,
          shareAnalytics: member.shareAnalytics,
        }),
      });
      const data = (await response.json()) as {
        message?: string;
        member?: GroupMember;
      };
      if (!response.ok) {
        setMemberError(data.message ?? "Unable to update permissions.");
        return;
      }
      if (data.member) {
        setMembers((prev) =>
          prev.map((item) =>
            item.username === data.member?.username ? data.member : item,
          ),
        );
      }
      setMemberSuccess("Permissions updated.");
    } catch {
      setMemberError("Unable to update permissions.");
    }
  };

  const updateMemberField = (
    username: string,
    field: keyof Pick<
      GroupMember,
      "canEdit" | "shareEvents" | "shareBalances" | "shareAnalytics"
    >,
    value: boolean,
  ) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.username === username ? { ...member, [field]: value } : member,
      ),
    );
  };

  const editableMembers = members.filter((member) => member.role !== "owner");

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 md:sticky md:top-6 md:self-start">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Member Access</h3>
        {loadingMembers && (
          <span className="text-xs text-slate-400">Loading...</span>
        )}
      </div>
      {editableMembers.length === 0 ? (
        <p className="mt-2 text-xs text-slate-500">No shared members yet.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {editableMembers.map((member) => (
            <div
              key={member.username}
              className="rounded-xl border border-slate-200 bg-white p-3 text-xs"
            >
              <p className="font-semibold text-slate-700">{member.username}</p>
              <div className="mt-2 grid gap-2 text-xs text-slate-600">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={member.canEdit}
                    onChange={(event) =>
                      updateMemberField(
                        member.username,
                        "canEdit",
                        event.target.checked,
                      )
                    }
                  />
                  Allow editing
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={member.shareEvents}
                    onChange={(event) =>
                      updateMemberField(
                        member.username,
                        "shareEvents",
                        event.target.checked,
                      )
                    }
                  />
                  Share calendar events
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={member.shareBalances}
                    onChange={(event) =>
                      updateMemberField(
                        member.username,
                        "shareBalances",
                        event.target.checked,
                      )
                    }
                  />
                  Share bank balances
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={member.shareAnalytics}
                    onChange={(event) =>
                      updateMemberField(
                        member.username,
                        "shareAnalytics",
                        event.target.checked,
                      )
                    }
                  />
                  Share analytics
                </label>
              </div>
              <button
                type="button"
                className="mt-3 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
                onClick={() => updateMember(member)}
              >
                Save
              </button>
            </div>
          ))}
        </div>
      )}
      {memberError && <p className="mt-2 text-xs text-red-500">{memberError}</p>}
      {memberSuccess && (
        <p className="mt-2 text-xs text-green-600">{memberSuccess}</p>
      )}
    </div>
  );
};

export default MemberAccessPanel;
