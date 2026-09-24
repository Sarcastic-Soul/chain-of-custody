import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'redTeamRun',
  title: 'Red Team Run',
  type: 'document',
  fields: [
    defineField({ name: 'suiteVersion', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'runAt', type: 'datetime', validation: (r) => r.required() }),
    defineField({
      name: 'results',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'redTeamResult',
          fields: [
            defineField({ name: 'caseId', type: 'reference', to: [{ type: 'redTeamCase' }] }),
            defineField({ name: 'passed', type: 'boolean' }),
            defineField({ name: 'agentResponse', type: 'text' }),
          ],
        },
      ],
    }),
    defineField({ name: 'aggregateScore', type: 'number', validation: (r) => r.required().min(0).max(1) }),
  ],
  preview: {
    select: { title: 'suiteVersion', subtitle: 'runAt' },
  },
})
