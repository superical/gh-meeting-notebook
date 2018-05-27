import tmpl from 'blueimp-tmpl'
import format from 'date-fns/format'
import htmlDocx from 'html-docx-js/dist/html-docx'
import juiceClient from 'juice/client'
import Issue from './Issue'

export default class Report {
  private templateHtml: string
  private issuesList: Issue[]
  private vm: {
    issues: IIssueViewData[]
    issuesCount: number
    openIssuesCount: number
    closedIssuesCount: number
    todayDate: string
    currentTime: string
    todayLongDate: string
    currentLongTime: string
  } | null

  constructor(issues: Issue[]) {
    this.issuesList = issues
    this.vm = null
    this.templateHtml = ''
  }

  public async renderDocx(): Promise<Blob> {
    const issuesDataList: IIssueViewData[] = await Promise.all(
      this.issuesList.map(async issue => this.prepIssueData(issue))
    )
    const issuesCount = issuesDataList.length
    const openIssuesCount = this.issuesList.filter(issue => issue.data.state === 'open').length
    const closedIssuesCount = this.issuesList.filter(issue => issue.data.state === 'closed').length

    this.vm = {
      issues: issuesDataList,
      issuesCount,
      openIssuesCount,
      closedIssuesCount,
      todayDate: format(new Date(), 'DD/MM/YYYY'),
      todayLongDate: format(new Date(), 'dddd, DD MMMM YYYY'),
      currentTime: format(new Date(), 'h:mmA'),
      currentLongTime: format(new Date(), 'hh:mm:ss A'),
    }
    if (this.templateHtml === '') throw new Error('No report template provided.')
    const rendered = tmpl(this.templateHtml, this.vm)
    const html = juiceClient(rendered)

    return htmlDocx.asBlob(html) as Blob
  }

  public setTemplate(html: string) {
    this.templateHtml = html
  }

  private async prepIssueData(issue: Issue): Promise<IIssueViewData> {
    let milestoneDueDate = '–'
    if (issue.data.milestone) {
      if (issue.data.milestone.due_on) {
        milestoneDueDate = format(new Date(issue.data.milestone.due_on), 'DD/MM/YYYY')
      }
    }

    const comments = (await issue.getComments()).map(commentRes => {
      return {
        create_date: format(new Date(commentRes.created_at), 'DD/MM/YYYY'),
        content_html: commentRes.body_html,
      }
    })

    return {
      title: issue.data.title,
      number: issue.data.number,
      content_html: issue.data.body_html,
      create_date: format(new Date(issue.data.created_at), 'DD/MM/YYYY'),
      target_date: milestoneDueDate,
      status: issue.data.state.charAt(0).toUpperCase() + issue.data.state.slice(1),
      assignees: issue.getAssignees().length > 0 ? issue.getAssignees().join(', ') : '–',
      comments,
    }
  }
}

export interface IIssueViewData {
  title: string
  number: number
  content_html: string
  create_date: string
  target_date: string
  status: 'Open' | 'Closed' | string
  assignees: string
  comments: {
    content_html: string
    create_date: string
  }[]
}
