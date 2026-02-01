export interface WritingPost {
  slug: string;
  title: string;
  date: Date;
  description: string;
  draft?: boolean;
}

export interface WritingFrontmatter {
  title: string;
  date: string;
  description: string;
  draft?: boolean;
}
