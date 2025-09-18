import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const PlaceholderContent = ({ title, icon: Icon }) => (
  <Card className="bg-card-themed border-card-themed shadow-lg text-card-themed-primary">
    <CardHeader>
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-7 w-7 text-[var(--theme-accent-maintenance)]" />}
        <CardTitle className="text-foreground">{title}</CardTitle>
      </div>
      <CardDescription className="text-muted-foreground">Functionality for {title.toLowerCase()} is under development.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-center h-48 border-2 border-dashed border-border rounded-lg">
        <p className="text-muted-foreground">Content for {title} will appear here.</p>
      </div>
    </CardContent>
  </Card>
);

export default PlaceholderContent;