import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import { Loader2, User, Building2, Mail, Phone } from "lucide-react";

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
  campaignId: number;
  currentContact: ProcessingInfoContact | null;
  nextContact: ProcessingInfoContact | null;
  totalProcessed: number;
  totalScheduled: number;
  remainingContacts: number;
  isProcessingActive: boolean;
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

  // Simplified component without the time estimation logic which is no longer provided by the backend
  
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
  
  // Calculate derived values that were previously returned from the server
  const total = data.totalProcessed + data.remainingContacts;
  const percentComplete = total > 0 ? Math.round((data.totalProcessed / total) * 100) : 0;

  // If no active processing and no contacts in queue, show a simple message
  if (!data.isProcessingActive && !data.currentContact && !data.nextContact && data.remainingContacts === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Status</CardTitle>
          <CardDescription>
            {data.totalProcessed > 0 
              ? 'All emails have been processed'
              : 'Campaign is not currently processing emails'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <div className="mb-4">
              <p className="text-lg font-bold">{data.totalProcessed}</p>
              <p className="text-xs text-muted-foreground">Total emails processed</p>
            </div>
            {data.totalProcessed === 0 && (
              <p>Start the campaign to begin sending emails every 220 seconds.</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Only show campaign progress when emails are actively being sent */}
      {data.isProcessingActive && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign Progress</CardTitle>
            <CardDescription>
              {percentComplete === 100 
                ? 'All emails have been processed'
                : 'Emails being processed in sequence'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-medium">{percentComplete}%</span>
              </div>
              <Progress value={percentComplete} className="h-2" />
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-bold">{total}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Processed</p>
                  <p className="text-lg font-bold">{data.totalProcessed}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p className="text-lg font-bold">{data.remainingContacts}</p>
                </div>
              </div>
              
              {data.remainingContacts > 0 && (
                <div className="mt-4 p-2 bg-primary/5 rounded text-sm text-muted-foreground border border-primary/10">
                  <p className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-primary" /> 
                    Emails are automatically sent every 220 seconds (3.67 minutes)
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
          
      {/* Only show processing queue if there are contacts to process or being processed */}
      {(data.currentContact || data.nextContact || data.remainingContacts > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Queue</CardTitle>
            <CardDescription>
              Current and next contacts in the processing queue
              {!data.isProcessingActive && data.remainingContacts > 0 && 
                " (Paused - start campaign to begin processing)"}
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
            
            {(data.nextContact || data.remainingContacts > 1) && (
              <>
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
                      {percentComplete === 100 
                        ? 'All contacts have been processed' 
                        : 'No contact in the queue'}
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}