import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from 'lucide-react';

const ChatSummaryDialog = ({ isOpen, onOpenChange, summaryResult, groupName, isSummarizing }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dialog-themed sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chat Summary: {groupName || summaryResult?.groupName}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] my-4">
          {isSummarizing ? 
            <div className="flex items-center justify-center p-4"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Summarizing...</div> 
            : <p className="text-sm text-foreground whitespace-pre-wrap">{summaryResult?.summary || "No summary available."}</p>
          }
        </ScrollArea>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="ui-button-primary">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChatSummaryDialog;