import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'quoteEvidence',
  title: 'Quote Evidence',
  type: 'document',
  fields: [
    defineField({ name: 'claim', type: 'reference', to: [{ type: 'claim' }], validation: (r) => r.required() }),
    defineField({
      name: 'sourceDocument',
      type: 'reference',
      to: [{ type: 'sourceDocument' }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'quoteText',
      title: 'Quote text',
      type: 'text',
      description: 'Must be an exact substring of sourceDocument.body — verified in code before this document is written.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'stance',
      type: 'string',
      options: { list: ['supports', 'contradicts'] },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'extractedAt', type: 'datetime', validation: (r) => r.required() }),
  ],
  preview: {
    select: { title: 'quoteText', subtitle: 'stance' },
  },
})
