import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface ContactsCampaignAssignProps {
  campaignId: number;
  onSuccess?: () => void;
}

export default function ContactsCampaignAssign({ campaignId, onSuccess }: ContactsCampaignAssignProps) {
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch contacts
  const { data, isLoading } = useQuery({
    queryKey: ['/api/contacts'],
    queryFn: async () => {
      const res = await fetch('/api/contacts');
      if (!res.ok) {
        throw new Error('Failed to fetch contacts');
      }
      return res.json();
    },
  });
  
  // Mutation to assign contacts to campaign
  const assignMutation = useMutation({
    mutationFn: async (contactIds: number[]) => {
      return apiRequest('POST', `/api/email-campaigns/${campaignId}/assign-contacts`, { contactIds });
    },
    onSuccess: () => {
      toast({
        title: 'Contacts assigned',
        description: `${selectedContacts.length} contacts have been assigned to the campaign.`,
      });
      setSelectedContacts([]);
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns', campaignId, 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns', campaignId, 'processing-info'] });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to assign contacts',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Toggle contact selection
  const toggleContact = (contactId: number) => {
    setSelectedContacts(current => 
      current.includes(contactId)
        ? current.filter(id => id !== contactId)
        : [...current, contactId]
    );
  };
  
  // Select all contacts
  const selectAll = () => {
    if (data?.contacts) {
      if (selectedContacts.length === data.contacts.length) {
        setSelectedContacts([]);
      } else {
        setSelectedContacts(data.contacts.map(c => c.id));
      }
    }
  };
  
  // Handle assignment
  const handleAssign = () => {
    if (selectedContacts.length === 0) {
      toast({
        title: 'No contacts selected',
        description: 'Please select at least one contact to assign to the campaign.',
        variant: 'destructive',
      });
      return;
    }
    
    assignMutation.mutate(selectedContacts);
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assign Contacts</CardTitle>
          <CardDescription>Select contacts to add to this campaign</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Contacts</CardTitle>
        <CardDescription>Select contacts to add to this campaign</CardDescription>
      </CardHeader>
      <CardContent>
        {data?.contacts?.length > 0 ? (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={data.contacts.length > 0 && selectedContacts.length === data.contacts.length}
                      onCheckedChange={selectAll}
                    />
                  </TableHead>
                  <TableHead>Name/Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={() => toggleContact(contact.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        {(contact.firstName || contact.lastName) && (
                          <div className="font-medium">
                            {[contact.firstName, contact.lastName].filter(Boolean).join(' ')}
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground">{contact.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{contact.company || '-'}</TableCell>
                    <TableCell>{contact.category || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No contacts available to assign. Create contacts first.
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedContacts.length} contacts selected
        </div>
        <Button 
          onClick={handleAssign} 
          disabled={selectedContacts.length === 0 || assignMutation.isPending}
        >
          {assignMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Assign to Campaign
        </Button>
      </CardFooter>
    </Card>
  );
}