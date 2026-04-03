import { BlogHeader } from "@/components/blog/blog-header";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen font-sans">
      <BlogHeader />
      <main>{children}</main>
    </div>
  );
}
