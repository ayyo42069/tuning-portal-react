import React from "react";
import { ModerationInfo, User } from "./types";
import { formatTimestamp } from "./utils";

type ModerationPanelProps = {
  moderationAction: string;
  setModerationAction: (action: string) => void;
  moderationUserId: string;
  setModerationUserId: (userId: string) => void;
  moderationReason: string;
  setModerationReason: (reason: string) => void;
  moderationDuration: string;
  setModerationDuration: (duration: string) => void;
  moderationPermanent: boolean;
  setModerationPermanent: (isPermanent: boolean) => void;
  bannedUsers: ModerationInfo[];
  mutedUsers: ModerationInfo[];
  performModerationAction: (e?: React.FormEvent) => void;
  setModerationView: (isVisible: boolean) => void;
  loading: boolean;
};

const ModerationPanel: React.FC<ModerationPanelProps> = ({
  moderationAction,
  setModerationAction,
  moderationUserId,
  setModerationUserId,
  moderationReason,
  setModerationReason,
  moderationDuration,
  setModerationDuration,
  moderationPermanent,
  setModerationPermanent,
  bannedUsers,
  mutedUsers,
  performModerationAction,
  setModerationView,
  loading,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-900">
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
          <h4 className="font-medium text-sm mb-3 text-gray-800 dark:text-white">
            Moderation Actions
          </h4>

          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
                Action
              </label>
              <select
                value={moderationAction}
                onChange={(e) => setModerationAction(e.target.value)}
                className="w-full p-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="ban">Ban User</option>
                <option value="mute">Mute User</option>
                <option value="unban">Unban User</option>
                <option value="unmute">Unmute User</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
                User ID
              </label>
              <input
                type="text"
                value={moderationUserId}
                onChange={(e) => setModerationUserId(e.target.value)}
                placeholder="Enter user ID"
                className="w-full p-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {(moderationAction === "ban" || moderationAction === "mute") && (
              <>
                <div>
                  <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
                    Reason
                  </label>
                  <input
                    type="text"
                    value={moderationReason}
                    onChange={(e) => setModerationReason(e.target.value)}
                    placeholder="Reason for action"
                    className="w-full p-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                {moderationAction === "ban" && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="permanent-ban"
                      checked={moderationPermanent}
                      onChange={(e) => setModerationPermanent(e.target.checked)}
                      className="mr-1"
                    />
                    <label
                      htmlFor="permanent-ban"
                      className="text-xs text-gray-700 dark:text-gray-300"
                    >
                      Permanent Ban
                    </label>
                  </div>
                )}

                {!moderationPermanent && (
                  <div>
                    <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
                      Duration (hours)
                    </label>
                    <input
                      type="number"
                      value={moderationDuration}
                      onChange={(e) => setModerationDuration(e.target.value)}
                      min="1"
                      className="w-full p-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                )}
              </>
            )}

            <button
              onClick={performModerationAction}
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded-md text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Action
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
            <h4 className="font-medium text-sm mb-2 text-gray-800 dark:text-white">
              Banned Users
            </h4>
            {bannedUsers.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No banned users
              </p>
            ) : (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {bannedUsers.map((ban) => (
                  <div
                    key={ban.user_id}
                    className="text-xs p-1 border border-gray-200 dark:border-gray-700 rounded-md"
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-medium">
                        {ban.username} (ID: {ban.user_id})
                      </div>
                      <button
                        onClick={() => {
                          setModerationUserId(ban.user_id.toString());
                          setModerationAction("unban");
                          performModerationAction();
                        }}
                        className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-0.5 rounded-md"
                      >
                        Unban
                      </button>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Reason: {ban.reason}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {ban.is_permanent
                        ? "Permanent"
                        : `Until: ${formatTimestamp(ban.expires_at)}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
            <h4 className="font-medium text-sm mb-2 text-gray-800 dark:text-white">
              Muted Users
            </h4>
            {mutedUsers.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No muted users
              </p>
            ) : (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {mutedUsers.map((mute) => (
                  <div
                    key={mute.user_id}
                    className="text-xs p-1 border border-gray-200 dark:border-gray-700 rounded-md"
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-medium">
                        {mute.username} (ID: {mute.user_id})
                      </div>
                      <button
                        onClick={() => {
                          setModerationUserId(mute.user_id.toString());
                          setModerationAction("unmute");
                          performModerationAction();
                        }}
                        className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-0.5 rounded-md"
                      >
                        Unmute
                      </button>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Reason: {mute.reason}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Until: {formatTimestamp(mute.expires_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModerationPanel;