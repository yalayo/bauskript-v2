import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, MailCheck, Clock, User, Building2, Mail, Phone, TimerReset } from "lucide-react";

interface CampaignProcessingInfoProps {
  campaignId: number;
}

interface ProcessingInfoContact {
  id: number;
  email: string;
  name?: string;
  company?: string;
  phone?: string;
}

interface ProcessingInfo {
  currentContact: ProcessingInfoContact | null;
  nextContact: ProcessingInfoContact | null;
  progress: {
    total: number;
    processed: number;
    scheduled: number;
    remaining: number;
    percentComplete: number;
  };
  lastProcessedAt: string | null;
  estimatedCompletionTime: string | null;
}

export default function CampaignProcessingInfo({ campaignId }: CampaignProcessingInfoProps) {
  // Polling interval in milliseconds
  const pollingInterval = 10000; // 10 seconds
  
  // Get processing info with polling
  const { data, isLoading, error, isError } = useQuery<ProcessingInfo>({
    queryKey: ['/api/email-campaigns', campaignId, 'processing-info'],
    queryFn: async () => {
      const response = await fetch(`/api/email-campaigns/${campaignId}/processing-info`);
      if (!response.ok) {
        throw new Error('Failed to fetch campaign processing info');
      }
      return response.json();
    },
    refetchInterval: pollingInterval,
  });

  // Format time remaining
  const formatTimeRemaining = (estimatedTime: string | null) => {
    if (!estimatedTime) return 'Unknown';
    
    const estimatedDate = new Date(estimatedTime);
    const now = new Date();
    
    // Get time difference in milliseconds
    const diff = estimatedDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Any moment now';
    
    // Convert to appropriate time unit
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Progress</CardTitle>
          <CardDescription>Current processing status</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Progress</CardTitle>
          <CardDescription>Error loading processing information</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Unable to load campaign processing information. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Campaign Progress</CardTitle>
          <CardDescription>
            {data.progress.percentComplete === 100 
              ? 'All emails have been processed'
              : 'Emails being processed in sequence'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-sm font-medium">{Math.round(data.progress.percentComplete)}%</span>
            </div>
            <Progress value={data.progress.percentComplete} className="h-2" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-bold">{data.progress.total}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Processed</p>
                <p className="text-lg font-bold">{data.progress.processed}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Scheduled</p>
                <p className="text-lg font-bold">{data.progress.scheduled}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Remaining</p>
                <p className="text-lg font-bold">{data.progress.remaining}</p>
              </div>
            </div>
          </div>
          
          {data.estimatedCompletionTime && (
            <div className="flex items-center text-sm">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Estimated time to completion: {formatTimeRemaining(data.estimatedCompletionTime)}</span>
            </div>
          )}
          
          {data.lastProcessedAt && (
            <div className="flex items-center text-sm">
              <TimerReset className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Last processed: {new Date(data.lastProcessedAt).toLocaleString()}</span>
            </div>
          )}
        </CardContent>
      </Card>
          
      <Card>
        <CardHeader>
          <CardTitle>Processing Queue</CardTitle>
          <CardDescription>
            Current and next contacts in the processing queue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Currently Processing</h3>
            {data.currentContact ? (
              <div className="bg-muted rounded-md p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-full p-2">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="font-medium">{data.currentContact.email}</p>
                    <div className="text-sm text-muted-foreground">
                      {data.currentContact.name && (
                        <div className="flex items-center">
                          <User className="mr-1 h-3 w-3" /> {data.currentContact.name}
                        </div>
                      )}
                      {data.currentContact.company && (
                        <div className="flex items-center">
                          <Building2 className="mr-1 h-3 w-3" /> {data.currentContact.company}
                        </div>
                      )}
                      {data.currentContact.phone && (
                        <div className="flex items-center">
                          <Phone className="mr-1 h-3 w-3" /> {data.currentContact.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge>Current</Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No contact being processed currently
              </div>
            )}
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-sm font-medium mb-2">Next in Queue</h3>
            {data.nextContact ? (
              <div className="bg-muted rounded-md p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-full p-2">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="font-medium">{data.nextContact.email}</p>
                    <div className="text-sm text-muted-foreground">
                      {data.nextContact.name && (
                        <div className="flex items-center">
                          <User className="mr-1 h-3 w-3" /> {data.nextContact.name}
                        </div>
                      )}
                      {data.nextContact.company && (
                        <div className="flex items-center">
                          <Building2 className="mr-1 h-3 w-3" /> {data.nextContact.company}
                        </div>
                      )}
                      {data.nextContact.phone && (
                        <div className="flex items-center">
                          <Phone className="mr-1 h-3 w-3" /> {data.nextContact.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline">Next</Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                {data.progress.percentComplete === 100 
                  ? 'All contacts have been processed' 
                  : 'No contact in the queue'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}