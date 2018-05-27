import Github from '@octokit/rest'

const octokit = (token: string): Github => {
  const api = new Github()
  api.authenticate({
    type: 'token',
    token,
  })
  return api
}

export default octokit
