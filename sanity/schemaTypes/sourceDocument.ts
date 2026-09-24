import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'sourceDocument',
  title: 'Source Document',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      description: 'Plain text, not portable text — exact-substring quote matching depends on this being unambiguous.',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'url', title: 'Source URL', type: 'url' }),
    defineField({
      name: 'documentType',
      type: 'string',
      options: { list: ['article', 'filing', 'transcript', 'officialStatement'] },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'publishedAt', type: 'datetime', validation: (r) => r.required() }),
    defineField({
      name: 'supersedes',
      title: 'Supersedes',
      type: 'reference',
      to: [{ type: 'sourceDocument' }],
      description: 'Marks this document as a correction/update of an older one.',
    }),
    defineField({
      name: 'contentHash',
      title: 'Content hash (sha256 of body)',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'verified',
      title: 'Verified (human-reviewed real source)',
      type: 'boolean',
      initialValue: true,
      description: 'false for seeded red-team/adversarial material.',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'documentType' },
  },
})
