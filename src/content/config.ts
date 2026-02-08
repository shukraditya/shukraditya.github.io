import { defineCollection, z } from 'astro:content';

const writing = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string(),
    draft: z.boolean().default(false),
    author: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { writing };
