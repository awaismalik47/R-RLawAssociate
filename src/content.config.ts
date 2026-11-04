import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const faq = z.object({ q: z.string(), a: z.string() });

const practiceAreas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/practice-areas' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(), // H1
      seoTitle: z.string(),
      description: z.string(),
      keyword: z.string(),
      secondaryKeywords: z.array(z.string()).default([]),
      label: z.string(), // short name, e.g. "Family Law"
      summary: z.string(), // card text
      intro: z.string(), // first paragraph; must contain the primary keyword
      icon: z.string(),
      order: z.number(),
      serviceType: z.string(),
      image: image(),
      imageAlt: z.string(),
      faqs: z.array(faq).min(3).max(5),
      related: z.array(reference('practiceAreas')).min(2).max(3),
      guide: reference('guides').optional(),
      published: z.coerce.date(),
      updated: z.coerce.date(),
    }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      seoTitle: z.string(),
      description: z.string(),
      keyword: z.string(),
      excerpt: z.string(),
      author: reference('advocates'),
      practiceArea: reference('practiceAreas'),
      image: image(),
      imageAlt: z.string(),
      faqs: z.array(faq).default([]),
      related: z.array(reference('practiceAreas')).default([]),
      published: z.coerce.date(),
      updated: z.coerce.date(),
    }),
});

const advocates = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/advocates' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      seoTitle: z.string(),
      description: z.string(),
      jobTitle: z.string(),
      /** 'principal' = head of chambers (featured first); others are associates. */
      role: z.enum(['principal', 'associate']).default('associate'),
      enrolment: z.string(),
      yearsOfPractice: z.string(),
      education: z.array(z.string()),
      alumniOf: z.array(z.string()).default([]),
      barMemberships: z.array(z.string()),
      focus: z.array(reference('practiceAreas')),
      knowsAbout: z.array(z.string()),
      image: image(),
      imageAlt: z.string(),
      sameAs: z.array(z.string()).default([]),
      order: z.number(),
      updated: z.coerce.date(),
    }),
});

export const collections = { practiceAreas, guides, advocates };
