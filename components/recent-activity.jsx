"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function RecentActivity({ activity }) {
  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activity?.map((activity, index) => (
            <div
              key={activity._id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-all duration-200 animate-in slide-in-from-left"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Avatar className="h-10 w-10 border-2 border-border">
                <AvatarImage
                  src={activity.avatar || "/placeholder.svg"}
                  alt={activity.name}
                />
                <AvatarFallback>{activity.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {activity.name}{" "}
                  <span className="text-muted-foreground font-normal">
                    {activity.action}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Joined on : 
                  {new Date(activity.createdAt).toLocaleDateString()}
                </p>
              </div>
              {/* {activity.amount && (
                <Badge variant="secondary" className="font-mono">
                  {activity.amount}
                </Badge>
              )} */}
              {/* {activity.rating && (
                <Badge variant="default" className="bg-accent text-accent-foreground">
                  {activity.rating}
                </Badge>
              )} */}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
