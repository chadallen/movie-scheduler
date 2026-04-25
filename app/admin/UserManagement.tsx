"use client";

import { useState, useTransition } from "react";
import type { AdminUser } from "@/lib/actions/adminUsers";
import {
  createUser,
  deleteUser,
  updateUserPhone,
} from "@/lib/actions/adminUsers";
import { normalizePhone } from "@/lib/phone";

interface Props {
  initialUsers: AdminUser[];
}

export default function UserManagement({ initialUsers }: Props) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [createPhone, setCreatePhone] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Per-row edit state: maps supabaseId → draft phone value
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPhone, setEditPhone] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  // Per-row delete pending state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Create user
  // -------------------------------------------------------------------------
  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);

    const phone = normalizePhone(createPhone);
    if (!phone) return;

    startTransition(async () => {
      const result = await createUser(phone);
      if ("error" in result) {
        setCreateError(result.error);
      } else {
        setUsers((prev) => [...prev, result]);
        setCreatePhone("");
        setCreateSuccess(`Added ${result.phone}`);
      }
    });
  }

  // -------------------------------------------------------------------------
  // Delete user
  // -------------------------------------------------------------------------
  function handleDelete(user: AdminUser) {
    if (!user.clerkId) {
      // No Clerk user — can only remove from Supabase; surface a note
      setEditError("This user has no Clerk account. Delete them from Supabase manually.");
      return;
    }

    setDeletingId(user.supabaseId);

    startTransition(async () => {
      const result = await deleteUser(user.supabaseId, user.clerkId!);
      if (result && "error" in result) {
        setEditError(result.error);
      } else {
        setUsers((prev) => prev.filter((u) => u.supabaseId !== user.supabaseId));
        if (editingId === user.supabaseId) setEditingId(null);
      }
      setDeletingId(null);
    });
  }

  // -------------------------------------------------------------------------
  // Edit (inline)
  // -------------------------------------------------------------------------
  function startEdit(user: AdminUser) {
    setEditingId(user.supabaseId);
    setEditPhone(user.phone);
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditPhone("");
    setEditError(null);
  }

  function handleEditSave(user: AdminUser) {
    const newPhone = normalizePhone(editPhone);
    if (!newPhone || newPhone === user.phone) {
      cancelEdit();
      return;
    }

    if (!user.clerkId) {
      setEditError("Cannot update: this user has no Clerk account. Add them to Clerk first.");
      return;
    }

    setEditError(null);

    startTransition(async () => {
      const result = await updateUserPhone(user.supabaseId, user.clerkId!, newPhone);
      if ("error" in result) {
        setEditError(result.error);
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.supabaseId === result.supabaseId ? result : u))
        );
        setEditingId(null);
        setEditPhone("");
      }
    });
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-8">
      {/* ----------------------------------------------------------------- */}
      {/* Create user form                                                   */}
      {/* ----------------------------------------------------------------- */}
      <section className="border-2 border-wire-border bg-wire-white rounded-sm p-6">
        <h2 className="text-lg font-bold text-wire-text mb-4">Add a User</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <div className="flex gap-3">
            <input
              type="tel"
              value={createPhone}
              onChange={(e) => setCreatePhone(e.target.value)}
              placeholder="+15555551234"
              disabled={isPending}
              className="
                flex-1
                border-2 border-wire-border
                bg-wire-bg
                text-wire-text
                placeholder:text-wire-text-muted
                px-4
                text-base
                rounded-sm
                outline-none
                focus:border-wire-accent
                min-h-[44px]
                disabled:opacity-50
              "
            />
            <button
              type="submit"
              disabled={isPending || !createPhone.trim()}
              className="
                border-2 border-wire-accent
                bg-wire-white
                text-wire-accent
                font-bold
                text-base
                rounded-sm
                px-5
                min-h-[44px]
                hover:bg-wire-surface
                transition-colors
                disabled:opacity-40
                disabled:cursor-not-allowed
              "
            >
              {isPending ? "Adding…" : "Add"}
            </button>
          </div>
          {createError && (
            <p className="text-sm text-red-400 border border-red-800 bg-red-950 rounded-sm px-3 py-2">
              {createError}
            </p>
          )}
          {createSuccess && (
            <p className="text-sm text-wire-accent border border-wire-border bg-wire-surface rounded-sm px-3 py-2">
              {createSuccess}
            </p>
          )}
        </form>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Error banner for edit/delete errors                               */}
      {/* ----------------------------------------------------------------- */}
      {editError && (
        <div className="border border-red-800 bg-red-950 rounded-sm px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-sm text-red-400">{editError}</p>
          <button
            onClick={() => setEditError(null)}
            className="text-wire-text-muted text-xs underline hover:no-underline flex-shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* User table                                                         */}
      {/* ----------------------------------------------------------------- */}
      <section className="border-2 border-wire-border bg-wire-white rounded-sm overflow-hidden">
        <h2 className="text-lg font-bold text-wire-text px-6 py-4 border-b border-wire-border">
          Users{" "}
          <span className="text-wire-text-muted font-normal text-sm">
            ({users.length})
          </span>
        </h2>

        {users.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-wire-text-muted text-base">No users yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-wire-border">
            {users.map((user) => {
              const isEditing = editingId === user.supabaseId;
              const isDeleting = deletingId === user.supabaseId;

              return (
                <div
                  key={user.supabaseId}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-4"
                >
                  {/* Phone / edit input */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        disabled={isPending}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEditSave(user);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        className="
                          w-full
                          border-2 border-wire-accent
                          bg-wire-bg
                          text-wire-text
                          px-3
                          text-base
                          rounded-sm
                          outline-none
                          min-h-[40px]
                          disabled:opacity-50
                        "
                      />
                    ) : (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-wire-text text-base font-medium">
                          {user.phone}
                        </span>
                        <span className="text-wire-text-muted text-xs">
                          {user.clerkId ? (
                            <>Clerk: {user.clerkId}</>
                          ) : (
                            <span className="text-yellow-600">No Clerk account</span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleEditSave(user)}
                          disabled={isPending}
                          className="
                            border-2 border-wire-accent
                            bg-wire-white
                            text-wire-accent
                            font-bold
                            text-sm
                            rounded-sm
                            px-4
                            min-h-[36px]
                            hover:bg-wire-surface
                            transition-colors
                            disabled:opacity-40
                            disabled:cursor-not-allowed
                          "
                        >
                          {isPending ? "Saving…" : "Save"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={isPending}
                          className="
                            border border-wire-border
                            bg-wire-surface
                            text-wire-text-muted
                            text-sm
                            rounded-sm
                            px-4
                            min-h-[36px]
                            hover:bg-wire-white
                            transition-colors
                            disabled:opacity-40
                          "
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(user)}
                          disabled={isPending || isDeleting}
                          className="
                            border border-wire-border
                            bg-wire-surface
                            text-wire-text
                            text-sm
                            rounded-sm
                            px-4
                            min-h-[36px]
                            hover:bg-wire-white
                            transition-colors
                            disabled:opacity-40
                            disabled:cursor-not-allowed
                          "
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={isPending || isDeleting}
                          className="
                            border border-red-800
                            bg-wire-surface
                            text-red-400
                            text-sm
                            rounded-sm
                            px-4
                            min-h-[36px]
                            hover:bg-red-950
                            transition-colors
                            disabled:opacity-40
                            disabled:cursor-not-allowed
                          "
                        >
                          {isDeleting ? "Deleting…" : "Delete"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
