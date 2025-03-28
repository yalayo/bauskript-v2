import { useQuery } from "@tanstack/react-query";
import { Contact, Email } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserRound } from "lucide-react";

interface CampaignContactsListProps {
  campaignId: number;
}

export default function CampaignContactsList({ campaignId }: CampaignContactsListProps) {
  // Fetch campaign emails with contact information
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/email-campaigns', campaignId, 'contacts'],
    queryFn: async () => {
      const res = await fetch(`/api/email-campaigns/${campaignId}/contacts`);
      if (!res.ok) {
        throw new Error('Failed to fetch campaign contacts');
      }
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Contacts</CardTitle>
          <CardDescription>Recipients of this campaign</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Contacts</CardTitle>
          <CardDescription>Recipients of this campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Failed to load campaign contacts. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  const { contacts, emails } = data;

  if (contacts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Contacts</CardTitle>
          <CardDescription>Recipients of this campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center p-8">
            <div className="text-center">
              <UserRound className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No contacts assigned to this campaign yet.</p>
              <p className="text-muted-foreground text-sm mt-2">Use the form above to assign contacts.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Helper function to get email status for a contact
  const getEmailStatusBadge = (contactId: number) => {
    const email = emails.find(e => e.contactId === contactId);
    if (!email) return <Badge variant="outline">Not sent</Badge>;

    switch (email.status) {
      case 'sent':
        return <Badge>Sent</Badge>;
      case 'opened':
        return <Badge variant="secondary">Opened</Badge>;
      case 'clicked':
        return <Badge variant="default">Clicked</Badge>;
      case 'replied':
        return <Badge variant="success">Replied</Badge>;
      case 'bounced':
        return <Badge variant="destructive">Bounced</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Contacts</CardTitle>
        <CardDescription>
          {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'} assigned to this campaign
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name/Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
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
                  <TableCell>{getEmailStatusBadge(contact.id)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}