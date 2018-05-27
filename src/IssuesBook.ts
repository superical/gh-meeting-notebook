import Github from '@octokit/rest'
import { paginate } from './helpers'
import Issue, { IssueResponse } from './Issue'

export default class IssuesBook {
  public repoOwner: string
  public repoName: string
  public octokit: Github

  constructor(octokit: Github, repoOwner: string, repoName: string) {
    this.repoOwner = repoOwner
    this.repoName = repoName
    this.octokit = octokit
  }

  public getIssues(params: object): Promise<any> {
    params = {
      state: 'all',
      ...params,
      owner: this.repoOwner,
      repo: this.repoName,
    }
    return paginate(this.octokit, this.octokit.issues.getForRepo, params)
  }

  public async getOpenIssues(additionalParams: object = {}): Promise<Issue[]> {
    const issueResponses: IssueResponse[] = await this.getIssues({ ...additionalParams, state: 'open' })
    const result: Issue[] = []
    for (const issueResponse of issueResponses) {
      const issueObj = await Issue.CreateIssue(this, issueResponse)
      result.push(issueObj)
    }
    return result
  }
  public async getClosedIssues(additionalParams: object = {}, inLastNumDays?: number): Promise<Issue[]> {
    const params = { ...additionalParams, state: 'closed' }
    if (!inLastNumDays) inLastNumDays = -1
    if (inLastNumDays > -1) {
      const date = new Date()
      date.setDate(date.getDate() - inLastNumDays)
      const sinceDate: string = date.toISOString()
      params['since'] = sinceDate
    }
    const issueResponses: IssueResponse[] = await this.getIssues(params)
    const result: Issue[] = []
    for (const issueResponse of issueResponses) {
      const issueObj = await Issue.CreateIssue(this, issueResponse)
      result.push(issueObj)
    }
    return result
  }
}
