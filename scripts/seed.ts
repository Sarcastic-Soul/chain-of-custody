import 'dotenv/config'
import { createHash } from 'crypto'
import { writeClient } from '../lib/sanity/client'

interface SeedDoc {
  _id: string
  title: string
  documentType: 'article' | 'filing' | 'transcript' | 'officialStatement'
  publishedAt: string
  url: string
  verified: boolean
  body: string
  supersedes?: string
}

const docs: SeedDoc[] = [
  {
    _id: 'sourceDocument-smci-hindenburg',
    title: 'Hindenburg Research: Super Micro — Fresh Evidence of Accounting Manipulation',
    documentType: 'article',
    publishedAt: '2024-08-27T00:00:00Z',
    url: 'https://hindenburgresearch.com/smci/',
    verified: true,
    body:
      'Hindenburg Research published a report on Super Micro Computer on August 27, 2024, disclosing a short position in the company. ' +
      'The report cited "glaring accounting red flags, evidence of undisclosed related party transactions, sanctions and export control failures, and customer issues". ' +
      'It also alleged that companies owned by the CEO\'s brothers "appear to be undisclosed suppliers of Super Micro".',
  },
  {
    _id: 'sourceDocument-smci-nt10k',
    title: 'Super Micro Computer — Notification of Late Filing (Form 12b-25 / NT 10-K)',
    documentType: 'filing',
    publishedAt: '2024-08-28T00:00:00Z',
    url: 'https://www.sec.gov/Archives/edgar/data/1375365/000137536524000031/smci-form12bx25nt10xkx2024.htm',
    verified: true,
    body:
      'Super Micro Computer filed a Form 12b-25 notification of late filing with the SEC on August 28, 2024. The filing states: ' +
      '\'Super Micro Computer, Inc. (the "Company") is unable to file its Annual Report on Form 10-K for the period ended June 30, 2024 in a timely manner without unreasonable effort or expense.\' ' +
      'It further states: "Additional time is also needed for the Company\'s management to complete its assessment of the effectiveness of its internal controls over financial reporting as of June 30, 2024."',
  },
  {
    _id: 'sourceDocument-smci-ey-resignation',
    title: 'Super Micro Computer — Form 8-K: Ernst & Young Resignation Letter',
    documentType: 'filing',
    publishedAt: '2024-10-30T00:00:00Z',
    url: 'https://www.sec.gov/Archives/edgar/data/1375365/000137536524000036/smci-20241024.htm',
    verified: true,
    supersedes: 'sourceDocument-smci-nt10k',
    body:
      'Ernst & Young LLP sent a letter of resignation, dated October 24, 2024, to the Audit Committee of Super Micro Computer, disclosed in a Form 8-K filed October 30, 2024. The letter states: ' +
      '"we are resigning due to information that has recently come to our attention which has led us to no longer be able to rely on management\'s and the Audit Committee\'s representations and to be unwilling to be associated with the financial statements prepared by management, and after concluding we can no longer provide the Audit Services in accordance with applicable law or professional obligations."',
  },
  {
    _id: 'sourceDocument-smci-special-committee',
    title: 'Supermicro — Update from the Independent Special Committee',
    documentType: 'officialStatement',
    publishedAt: '2024-11-05T00:00:00Z',
    url: 'https://ir.supermicro.com/news/news-details/2024/Supermicro-Announces-an-Update-from-the-Independent-Special-Committee-and-First-Quarter-Fiscal-Year-2025-Preliminary-Financial-Information/default.aspx',
    verified: true,
    body:
      "On November 5, 2024, Super Micro Computer's Independent Special Committee announced an update on its investigation. The statement reads: " +
      '"The Special Committee has completed its investigation based on a set of initial concerns raised by EY. Following a three-month investigation led by Independent Counsel, the Committee\'s investigation to date has found that the Audit Committee has acted independently and that there is no evidence of fraud or misconduct on the part of management or the Board of Directors."',
  },
  {
    _id: 'sourceDocument-smci-final-10k',
    title: 'Super Micro Computer — FY2024 Form 10-K (Filed February 2025)',
    documentType: 'filing',
    publishedAt: '2025-02-25T00:00:00Z',
    url: 'https://www.sec.gov/Archives/edgar/data/1375365/000137536525000004/smci-20240630.htm',
    verified: true,
    supersedes: 'sourceDocument-smci-ey-resignation',
    body:
      'Super Micro Computer filed its delayed Annual Report on Form 10-K for fiscal year 2024 on February 25, 2025. The filing states: ' +
      '\'On November 18, 2024, the Audit Committee appointed BDO USA, P.C. ("BDO") as our new independent registered public accounting firm.\' ' +
      "The 10-K's error-correction checkbox was left unchecked, meaning no restatement of prior-year results was made.",
  },
]

async function seed() {
  for (const doc of docs) {
    const contentHash = createHash('sha256').update(doc.body).digest('hex')

    const document = {
      _id: doc._id,
      _type: 'sourceDocument' as const,
      title: doc.title,
      body: doc.body,
      url: doc.url,
      documentType: doc.documentType,
      publishedAt: doc.publishedAt,
      contentHash,
      verified: doc.verified,
      ...(doc.supersedes ? { supersedes: { _type: 'reference' as const, _ref: doc.supersedes } } : {}),
    }

    await writeClient.createOrReplace(document)
    console.log(`seeded ${doc._id}`)
  }
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
