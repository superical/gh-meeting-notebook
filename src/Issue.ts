import { paginate } from './helpers'
import IssuesBook from './IssuesBook'

export default class Issue {
  public data: IssueResponse
  private IssuesBook: IssuesBook

  constructor(issuesBook: IssuesBook, issueResponse: IssueResponse) {
    this.data = issueResponse
    this.IssuesBook = issuesBook
  }

  public static async CreateIssue(issuesBook: IssuesBook, issueResponse: IssueResponse): Promise<Issue> {
    const me = new Issue(issuesBook, issueResponse)
    await me.init()
    return me
  }

  public async getComments(order: 'asc' | 'desc' = 'desc'): Promise<CommentResponse[]> {
    const params = {
      owner: this.IssuesBook.repoOwner,
      repo: this.IssuesBook.repoName,
      number: this.data.number,
    }
    const comments: CommentResponse[] = await paginate(
      this.IssuesBook.octokit,
      this.IssuesBook.octokit.issues.getComments,
      params
    )
    for (const comment of comments) {
      const html = await this.renderMarkdown(comment.body)
      comment.body_html = html.data
    }

    comments.sort((a, b) => {
      const aDate = new Date(a.created_at)
      const bDate = new Date(b.created_at)
      if (order === 'asc') {
        if (aDate < bDate) return -1
        if (aDate > bDate) return 1
      } else {
        if (aDate < bDate) return 1
        if (aDate > bDate) return -1
      }

      return 0
    })
    return comments
  }

  public getAssignees(): string[] {
    const targetTag = 'Assignee'

    return this.getTaggedLabels(targetTag)
  }

  public mustIncludeInReport(): boolean {
    const reportLabels = this.getTaggedLabels('Report')
    if (reportLabels.indexOf('Exclude') > -1) return false
    return reportLabels.indexOf('Include') >= 0
  }

  public mustExcludeFromReport(): boolean {
    const reportLabels = this.getTaggedLabels('Report')
    return reportLabels.indexOf('Exclude') > -1
  }

  public getMilestone() {
    if (this.data.milestone === null) return null
    return this.data.milestone
  }

  private getTaggedLabels(targetTag: string): string[] {
    const taggedValues: string[] = []
    this.data.labels.forEach(label => {
      const labelVal = label.name.split(':')
      if (labelVal.length > 1) {
        if (labelVal[0].toLowerCase() === targetTag.toLowerCase()) {
          const value = labelVal[1].trim()
          taggedValues.push(value)
        }
      }
    })

    return taggedValues
  }

  private async init() {
    const res = await this.renderMarkdown(this.data.body)
    this.data.body_html = res.data
  }

  private async renderMarkdown(text: string) {
    return this.IssuesBook.octokit.misc.renderMarkdown({
      text,
      mode: 'markdown',
    })
  }
}

export interface IssueResponse {
  url: string
  repository_url: string
  labels_url: string
  comments_url: string
  events_url: string
  html_url: string
  id: number
  number: number
  title: string
  body: string
  body_html: string
  user: UserResponse
  labels: {
    id: number
    url: string
    name: string
    description: string
    color: string
    default: boolean
  }[]
  state: 'open' | 'closed' | 'all'
  locked: boolean
  assignee: string
  assignees: string[]
  milestone: {
    url: string
    html_url: string
    labels_url: string
    id: number
    number: number
    state: 'open' | 'closed'
    title: string
    description: string
    creator: UserResponse
    open_issues: number
    closed_issues: number
    created_at: string
    updated_at: string
    closed_at: string
    due_on: string
  } | null
  comments: number
  created_at: string
  updated_at: string
  closed_at: string
}

export interface UserResponse {
  login: string
  id: number
  avatar_url: string
  gravatar_id: number
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  site_admin: boolean
}

export interface CommentResponse {
  author_association: string
  body: string
  body_html: string
  created_at: string
  html_url: string
  id: number
  issue_url: string
  reactions: {
    url: string
    '+1': number
    '-1': number
    confused: number
    heart: number
    hooray: number
    laugh: number
    total_count: number
  }
  updated_at: string
  url: string
  user: UserResponse
}
