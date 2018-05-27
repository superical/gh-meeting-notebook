import Github from '@octokit/rest'
import FileSaver from 'file-saver'
import octokit from './github-api'
import Issue from './Issue'
import IssuesBook from './IssuesBook'
import Report from './Report'

export default class MeetingNotebook {
  private readonly octokit: Github
  private repoOwner: string
  private repoName: string

  constructor(githubInfo: {
    token: string
    repo: {
      name: string
      owner: string
    }
  }) {
    console.log('Starting MeetingNotebook...')
    this.octokit = octokit(githubInfo.token)
    this.repoOwner = githubInfo.repo.owner
    this.repoName = githubInfo.repo.name
  }

  public async run(templateHtml = ''): Promise<Blob> {
    let issuesList: Issue[] = []
    const issuesBook = new IssuesBook(this.octokit, this.repoOwner, this.repoName)
    const closedIssues = await issuesBook.getClosedIssues({}, 30)
    const openIssues = await issuesBook.getOpenIssues()

    issuesList.push(...openIssues.filter(issue => !issue.mustExcludeFromReport()))
    issuesList.push(...closedIssues.filter(issue => !issue.mustExcludeFromReport()))

    const includeClosedIssues = await issuesBook.getClosedIssues({ labels: 'Report: Include' })
    issuesList.push(...includeClosedIssues)

    issuesList = issuesList.filter(
      (issue, pos, issuesListArr) => issuesListArr.map(mapIssue => mapIssue.data.id).indexOf(issue.data.id) === pos
    )

    issuesList.sort((a, b) => {
      const aDate = new Date(a.data.updated_at || a.data.created_at)
      const bDate = new Date(b.data.updated_at || b.data.created_at)
      if (aDate < bDate) return 1
      if (aDate > bDate) return -1

      return 0
    })

    const report = new Report(issuesList)
    report.setTemplate(templateHtml)

    return await report.renderDocx()
  }

  public async saveAs(reportBlob: Blob, filename: string): Promise<void> {
    FileSaver.saveAs(reportBlob, filename)
  }
}
