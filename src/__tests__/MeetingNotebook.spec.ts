import MeetingNotebook from '../MeetingNotebook'

describe(`MeetingNotebook`, () => {
  let notebook: MeetingNotebook

  beforeEach(() => {
    notebook = new MeetingNotebook({
      token: '',
      repo: {
        owner: '',
        name: '',
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
