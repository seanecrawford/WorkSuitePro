import React from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { UserCircle } from 'lucide-react';

const CommentList = ({ comments, isDemoMode }) => {
  if (!comments || comments.length === 0) {
    return <p className="text-slate-400 text-sm text-center py-4">No comments yet. {isDemoMode ? "" : "Be the first to comment!"}</p>;
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => {
        const userName = comment.user?.full_name || comment.user?.email || (comment.isSample ? "Demo User" : "Anonymous");
        const avatarFallback = userName.substring(0, 2).toUpperCase();
        let timeAgo = 'just now';
        try {
            timeAgo = formatDistanceToNowStrict(new Date(comment.created_at), { addSuffix: true });
        } catch(e) {
            // ignore invalid date for sample data
        }

        return (
          <div key={comment.comment_id} className="flex items-start space-x-3 p-2 bg-slate-800/50 rounded-md border border-slate-700/60">
            <div className="flex-shrink-0">
              <UserCircle className="h-6 w-6 text-teal-400 mt-0.5" />
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex items-baseline space-x-2">
                <p className="text-xs font-semibold text-sky-300 truncate">{userName}</p>
                <p className="text-2xs text-slate-500">{timeAgo}</p>
              </div>
              <p className="text-sm text-slate-200 whitespace-pre-wrap break-words">{comment.comment_text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CommentList;