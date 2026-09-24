import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'redTeamCase',
  title: 'Red Team Case',
  type: 'document',
  fields: [
    defineField({ name: 'caseId', title: 'Case ID (unique slug)', type: 'slug', validation: (r) => r.required() }),
    defineField({
      name: 'category',
      type: 'string',
      options: { list: ['promptInjection', 'fabricatedAuthority', 'staleClaim', 'nearMissQuote'] },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'seedDocument',
      title: 'Seed document (poisoned/adversarial)',
      type: 'reference',
      to: [{ type: 'sourceDocument' }],
      validation: (r) => r.required(),
    }),
    defineField({ name: 'probeQuestion', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'expectedBehavior',
      type: 'string',
      options: { list: ['refuse', 'flagContradiction', 'preferNewerSource', 'rejectNearMissQuote'] },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'description', type: 'text' }),
  ],
  preview: {
    select: { title: 'caseId.current', subtitle: 'category' },
  },
})
