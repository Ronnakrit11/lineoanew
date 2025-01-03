import { WidgetUser } from '@/app/types/widget';
import { cn } from '@/lib/utils';

interface UserListProps {
  users: WidgetUser[];
}

export function UserList({ users }: UserListProps) {
  const onlineUsers = users.filter(user => user.isOnline);
  const offlineUsers = users.filter(user => !user.isOnline);

  return (
    <div className="w-48 border-l border-slate-200 bg-slate-50 p-4 overflow-y-auto">
      <div className="space-y-4">
        {/* Online Users */}
        <div>
          <h3 className="text-xs font-medium text-slate-500 mb-2">
            Online ({onlineUsers.length})
          </h3>
          <div className="space-y-2">
            {onlineUsers.map(user => (
              <UserItem key={user.id} user={user} />
            ))}
          </div>
        </div>

        {/* Offline Users */}
        {offlineUsers.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-slate-500 mb-2">
              Offline ({offlineUsers.length})
            </h3>
            <div className="space-y-2">
              {offlineUsers.map(user => (
                <UserItem key={user.id} user={user} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UserItem({ user }: { user: WidgetUser }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "w-2 h-2 rounded-full",
        user.isOnline ? "bg-green-500" : "bg-slate-300"
      )} />
      <span className="text-sm text-slate-600 truncate">
        {user.name || `User (${user.ip})`}
      </span>
    </div>
  );
}