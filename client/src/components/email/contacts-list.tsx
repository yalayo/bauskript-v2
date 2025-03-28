import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Contact } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Trash2, User, Mail, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ContactsResponse {
  contacts: Contact[];
  total: number;
}

export default function ContactsList() {
  const { toast } = useToast();
  const [selectedContact, setSelectedContact] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  
  // Add debounce effect for search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  const { data, isLoading } = useQuery<ContactsResponse>({
    queryKey: ["/api/contacts", page, limit, debouncedSearchTerm],
    queryFn: async () => {
      let url = `/api/contacts?page=${page}&limit=${limit}`;
      if (debouncedSearchTerm) {
        url += `&search=${encodeURIComponent(debouncedSearchTerm)}`;
      }
      const res = await apiRequest("GET", url);
      return res.json();
    },
    retry: false,
  });
  
  const contacts = data?.contacts || [];

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/contacts/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Contact deleted",
        description: "The contact has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] }); // Invalidate all contact queries
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete contact",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
    setSelectedContact(null);
  };

  // The contacts are already filtered by the server based on the search parameter

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge>Active</Badge>;
      case "unsubscribed":
        return <Badge variant="outline">Unsubscribed</Badge>;
      case "bounced":
        return <Badge variant="destructive">Bounced</Badge>;
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  if (isLoading) {
    return <div>Loading contacts...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <User className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
        </div>
        <div>
          <span className="text-muted-foreground">
            {contacts.length} contacts
          </span>
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-8">
          <p>No contacts found. {searchTerm ? "Try a different search term." : ""}</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">
                  {`${contact.firstName || ""} ${contact.lastName || ""}`.trim() || "N/A"}
                </TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>{contact.company || "N/A"}</TableCell>
                <TableCell>{getStatusBadge(contact.status)}</TableCell>
                <TableCell>{contact.source || "N/A"}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        // Generate email to this contact
                      }}
                      title="Send Email"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        // Edit contact
                      }}
                      title="Edit Contact"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog open={selectedContact === contact.id} onOpenChange={(open) => !open && setSelectedContact(null)}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSelectedContact(contact.id)}
                          title="Delete Contact"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete {contact.firstName} {contact.lastName} ({contact.email}).
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(contact.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      
      {/* Show pagination when there's more than one page */}
      {data?.total && data.total > limit && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {/* First page */}
            <PaginationItem>
              <PaginationLink 
                onClick={() => setPage(1)}
                isActive={page === 1}
              >
                1
              </PaginationLink>
            </PaginationItem>
            
            {/* Show ellipsis if current page is more than 3 */}
            {page > 3 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            
            {/* Show current page and surrounding pages */}
            {page > 2 && (
              <PaginationItem>
                <PaginationLink 
                  onClick={() => setPage(page - 1)}
                >
                  {page - 1}
                </PaginationLink>
              </PaginationItem>
            )}
            
            {page > 1 && page < Math.ceil(data.total / limit) && (
              <PaginationItem>
                <PaginationLink 
                  onClick={() => setPage(page)} 
                  isActive={true}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )}
            
            {page < Math.ceil(data.total / limit) - 1 && (
              <PaginationItem>
                <PaginationLink 
                  onClick={() => setPage(page + 1)}
                >
                  {page + 1}
                </PaginationLink>
              </PaginationItem>
            )}
            
            {/* Show ellipsis if there are more pages */}
            {page < Math.ceil(data.total / limit) - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            
            {/* Last page */}
            {Math.ceil(data.total / limit) > 1 && (
              <PaginationItem>
                <PaginationLink 
                  onClick={() => setPage(Math.ceil(data.total / limit))}
                  isActive={page === Math.ceil(data.total / limit)}
                >
                  {Math.ceil(data.total / limit)}
                </PaginationLink>
              </PaginationItem>
            )}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setPage(p => Math.min(Math.ceil(data.total / limit), p + 1))}
                className={page >= Math.ceil(data.total / limit) ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Display total contacts info */}
      <div className="text-center text-sm text-muted-foreground mt-2">
        {data?.total ? (
          `Showing ${contacts.length} ${searchTerm ? "filtered " : ""}contacts out of ${data.total} total (Page ${page} of ${Math.max(1, Math.ceil(data.total / limit))})`
        ) : (
          "No contacts available"
        )}
      </div>
    </div>
  );
}