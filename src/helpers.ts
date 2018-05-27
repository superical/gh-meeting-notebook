import Github from '@octokit/rest'

export const paginate = async (octokit: Github, method: (params: {}) => Promise<any>, params = {}): Promise<any> => {
  let response = await method({ ...params, per_page: 100 })
  let { data } = response
  while (octokit.hasNextPage(response)) {
    response = await octokit.getNextPage(response)
    data = data.concat(response.data)
  }

  return data
}
