import { StaggerGroup } from "@/components/motion";
import { SectionHeading } from "@/components/site";
import { BlogCard } from "@/components/site/blog-card";
import type { Service } from "@/content/services";
import { getPostsByTags } from "@/lib/queries/blog";

/**
 * Blog posts related to this service.
 *
 * Internal linking is a ranking input rather than decoration, and this is the half of it that
 * cannot be written by hand: the service pages are fixed and the posts are not, so the link
 * is made by tag. A post tagged `seo` or `e-commerce` appears under Web Development the day
 * it is published, without anybody editing a service page to add it.
 *
 * The tags are declared per service in `src/content/services.ts`. Nothing renders until a
 * published post carries one of them, which for now is every service, since the blog starts
 * empty.
 */
export async function ServiceReading({ service }: { service: Service }) {
  const posts = await getPostsByTags(service.blogTags, 3);

  if (posts.length === 0) return null;

  return (
    <section className="section-y">
      <div className="container-page">
        <SectionHeading
          eyebrow="Related reading"
          title={`What we have written about ${service.name}`}
          description="Notes on the work: what we built, what broke, and what we would do differently."
        />

        <StaggerGroup asChild className="mt-section-sm grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ul>
            {posts.map((post) => (
              <li key={post.id} className="h-full">
                <BlogCard post={post} className="h-full" />
              </li>
            ))}
          </ul>
        </StaggerGroup>
      </div>
    </section>
  );
}
