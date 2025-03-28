import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
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
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Loader2, RefreshCw, Search } from "lucide-react";

interface ContactsCampaignAssignProps {
  campaignId: number;
  onSuccess?: () => void;
}

export default function ContactsCampaignAssign({ campaignId, onSuccess }: ContactsCampaignAssignProps) {
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [availableContacts, setAvailableContacts] = useState<any[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const contactsPerPage = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all contacts with a large limit to ensure we get all
  const { 
    data: contactsData, 
    isLoading: contactsLoading,
    refetch: refetchContacts
  } = useQuery({
    queryKey: ['/api/contacts', 'all'],
    queryFn: async () => {
      // Request a large number of contacts (e.g., 1000) to ensure we get all
      const res = await fetch('/api/contacts?limit=1000');
      if (!res.ok) {
        throw new Error('Failed to fetch contacts');
      }
      return res.json();
    },
  });

  // Fetch campaign contacts to filter out
  const {
    data: campaignContactsData,
    isLoading: campaignContactsLoading,
    refetch: refetchCampaignContacts
  } = useQuery({
    queryKey: ['/api/email-campaigns', campaignId, 'contacts'],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/email-campaigns/${campaignId}/contacts`);
        if (!res.ok) {
          // If endpoint doesn't exist yet, return empty array instead of throwing
          if (res.status === 404) {
            return { contacts: [], emails: [] };
          }
          throw new Error('Failed to fetch campaign contacts');
        }
        return res.json();
      } catch (error) {
        console.error('Error fetching campaign contacts:', error);
        return { contacts: [], emails: [] };
      }
    },
  });
  
  // Filter out contacts that are already assigned to this campaign
  useEffect(() => {
    if (contactsData?.contacts && campaignContactsData?.contacts) {
      const campaignContactIds = new Set(
        campaignContactsData.contacts.map((contact: any) => contact.id)
      );
      
      const filtered = contactsData.contacts.filter(
        (contact: any) => !campaignContactIds.has(contact.id)
      );
      
      setAvailableContacts(filtered);
      setFilteredContacts(filtered); // Initialize filtered contacts with all available contacts
    }
  }, [contactsData, campaignContactsData]);
  
  // Handle search and filtering
  useEffect(() => {
    if (!availableContacts) return;
    
    let result = [...availableContacts];
    
    // Apply search filter if search term exists
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(contact => {
        const name = [contact.firstName, contact.lastName].filter(Boolean).join(' ').toLowerCase();
        const email = (contact.email || '').toLowerCase();
        const company = (contact.company || '').toLowerCase();
        
        return name.includes(searchLower) || 
               email.includes(searchLower) || 
               company.includes(searchLower);
      });
    }
    
    setFilteredContacts(result);
    setCurrentPage(1); // Reset to first page when search changes
  }, [availableContacts, searchTerm]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredContacts.length / contactsPerPage);
  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = filteredContacts.slice(indexOfFirstContact, indexOfLastContact);
  
  // Change page
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
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
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns', campaignId, 'contacts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/contacts', 'all'] });
      
      // Refresh data
      refetchContacts();
      refetchCampaignContacts();
      
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
  
  // Select all visible contacts on current page
  const selectAll = () => {
    // Check if all current page contacts are selected
    const allSelected = currentContacts.every(c => selectedContacts.includes(c.id));
    
    if (allSelected) {
      // Remove current page contacts from selection
      setSelectedContacts(prev => 
        prev.filter(id => !currentContacts.some(c => c.id === id))
      );
    } else {
      // Add current page contacts to selection, avoiding duplicates
      setSelectedContacts(prev => {
        const combined = [...prev];
        currentContacts.forEach(contact => {
          if (!combined.includes(contact.id)) {
            combined.push(contact.id);
          }
        });
        return combined;
      });
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

  // Handle refresh
  const handleRefresh = () => {
    refetchContacts();
    refetchCampaignContacts();
  };
  
  if (contactsLoading || campaignContactsLoading) {
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Assign Contacts</CardTitle>
          <CardDescription>
            Select contacts to add to this campaign
            {contactsData?.total > 0 && (
              <span className="block mt-1 text-xs">
                {availableContacts.length} of {contactsData.total} total contacts available to assign
              </span>
            )}
          </CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={handleRefresh} title="Refresh contacts list">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {availableContacts.length > 0 ? (
          <>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search contacts..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={currentContacts.length > 0 && 
                                currentContacts.every(c => selectedContacts.includes(c.id))}
                        onCheckedChange={selectAll}
                      />
                    </TableHead>
                    <TableHead>Name/Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentContacts.length > 0 ? (
                    currentContacts.map((contact) => (
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
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        No contacts match your search
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => goToPage(page)}
                          isActive={page === currentPage}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => currentPage < totalPages && goToPage(currentPage + 1)}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
            
            <div className="mt-2 text-xs text-muted-foreground text-center">
              {searchTerm ? (
                <>Showing {currentContacts.length} of {filteredContacts.length} matching contacts</>
              ) : (
                <>Showing {indexOfFirstContact + 1}-{Math.min(indexOfLastContact, filteredContacts.length)} of {filteredContacts.length} contacts</>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {contactsData?.contacts?.length > 0 
              ? "All contacts have already been assigned to this campaign."
              : "No contacts available to assign. Create contacts first."}
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