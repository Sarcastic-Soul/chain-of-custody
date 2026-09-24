import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'trustMetricSnapshot',
  title: 'Trust Metric Snapshot',
  type: 'document',
  fields: [
    defineField({ name: 'computedAt', type: 'datetime', validation: (r) => r.required() }),
    defineField({ name: 'groundingRate', type: 'number', validation: (r) => r.required().min(0).max(1) }),
    defineField({ name: 'contradictionSurfaceRate', type: 'number', validation: (r) => r.required().min(0).max(1) }),
    defineField({ name: 'redTeamPassRate', type: 'number', validation: (r) => r.required().min(0).max(1) }),
  ],
  preview: {
    select: { title: 'computedAt' },
  },
})
