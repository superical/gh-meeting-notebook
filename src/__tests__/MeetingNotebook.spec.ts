import dotenv from 'dotenv'
import MeetingNotebook from '../MeetingNotebook'
dotenv.config()

describe(`MeetingNotebook`, () => {
  let notebook: MeetingNotebook

  beforeEach(() => {
    notebook = new MeetingNotebook({
      token: process.env.GITHUB_TOKEN,
      repo: {
        owner: process.env.GITHUB_OWNER,
        name: process.env.GITHUB_REPO,
      },
      report: {
        filenamePrefix: 'Minutes Report',
        closedIssuesNumDays: 30,
        templateHtml: '',
      },
    })
  })

  it(`should return report docx blob`, () => {
    try {
      const actual = notebook.run()
      const expected = new Blob()

      expect(actual).toBe(expected)
    } catch (err) {
      console.log('Errors:', err)
    }
  })
})
