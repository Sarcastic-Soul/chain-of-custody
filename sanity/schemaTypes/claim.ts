import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'claim',
  title: 'Claim',
  type: 'document',
  fields: [
    defineField({ name: 'question', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'evidence',
      title: 'Evidence',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'quoteEvidence' }] }],
    }),
    defineField({
      name: 'status',
      type: 'string',
      options: { list: ['grounded', 'contradicted', 'ungrounded'] },
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { title: 'question', subtitle: 'status' },
  },
})
