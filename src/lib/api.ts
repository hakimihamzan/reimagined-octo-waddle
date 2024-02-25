import { Post } from "@/interfaces/post";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";

const postsDirectory = join(process.cwd(), "_posts");

export function getPostSlugs() {
  return fs.readdirSync(postsDirectory);
}

export function getPostBySlug(slug: string) {
  let realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  let { data, content } = matter(fileContents);
  
  let basePathReplacement = '';
  if (process.env.NODE_ENV === "production") {
    basePathReplacement = '/reimagined-octo-waddle';
  }
  
  // Convert data and realSlug to strings
  let dataStr = JSON.stringify(data);
  let realSlugStr = JSON.stringify(realSlug);
  
  // Replace ${basePath} with the appropriate value
  dataStr = dataStr.replaceAll(/\$\{basePath\}/g, basePathReplacement);
  realSlugStr = realSlugStr.replaceAll(/\$\{basePath\}/g, basePathReplacement);
  
  // Parse the modified strings back to JSON
  data = JSON.parse(dataStr);
  realSlug = JSON.parse(realSlugStr);

  return { ...data, slug: realSlug, content } as Post;
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}
