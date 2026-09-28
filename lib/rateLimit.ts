import { writeClient } from '@/lib/sanity/client'

const DAILY_QUESTION_LIMIT = Number(process.env.DAILY_QUESTION_LIMIT) || 100

/**
 * Counts questions per UTC day in a Sanity document, so the limit holds across every serverless
 * instance. The dot in the id keeps the counter out of the public dataset. Returns false once
 * today's limit is used up.
 */
export async function takeDailyQuestionSlot(): Promise<boolean> {
  const day = new Date().toISOString().slice(0, 10)
  const id = `usage.questions-${day}`
  const docs = await writeClient
    .transaction()
    .createIfNotExists({ _id: id, _type: 'questionUsage', day, count: 0 })
    .patch(id, (patch) => patch.inc({ count: 1 }))
    .commit({ returnDocuments: true })
  const count = (docs.find((doc) => doc._id === id)?.count as number | undefined) ?? 0
  return count <= DAILY_QUESTION_LIMIT
}
