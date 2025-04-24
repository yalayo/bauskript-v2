import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { BlogPost } from "@shared/schema";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import BlogEditor from "../components/blog/blog-editor";
import BlogList from "../components/blog/blog-list";

export default function BlogPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [isEditorDialogOpen, setIsEditorDialogOpen] = useState(false);

  // Fetch blog posts data
  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  // Filter posts based on active tab
  const filteredPosts = posts.filter((post) => {
    if (activeTab === "all") return true;
    return post.status?.toLowerCase() === activeTab.toLowerCase();
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-dark mb-1">Blog Management</h1>
          <p className="text-gray-500">
            Create and manage SEO-optimized construction blog posts
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Dialog
            open={isEditorDialogOpen}
            onOpenChange={setIsEditorDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <i className="fas fa-plus mr-2"></i>New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create New Blog Post</DialogTitle>
              </DialogHeader>
              <BlogEditor 
                onSuccess={() => setIsEditorDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium text-sm">Total Posts</h3>
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary bg-opacity-10 text-primary">
              <i className="fas fa-newspaper"></i>
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-dark">{posts.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium text-sm">Published</h3>
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-success bg-opacity-10 text-success">
              <i className="fas fa-check-circle"></i>
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-dark">
            {posts.filter(post => post.status === "published").length}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium text-sm">Drafts</h3>
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary bg-opacity-10 text-secondary">
              <i className="fas fa-edit"></i>
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-dark">
            {posts.filter(post => post.status === "draft").length}
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Blog Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Posts</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredPosts.length > 0 ? (
                <BlogList posts={filteredPosts} />
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-gray-100 mb-4">
                    <i className="fas fa-newspaper text-gray-400 text-xl"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No blog posts found</h3>
                  <p className="text-gray-500 mb-4">
                    {activeTab === "all"
                      ? "You haven't created any blog posts yet."
                      : `No ${activeTab} posts found.`}
                  </p>
                  <Button
                    onClick={() => setIsEditorDialogOpen(true)}
                    variant="outline"
                    size="sm"
                  >
                    <i className="fas fa-plus mr-2"></i>Create New Post
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
