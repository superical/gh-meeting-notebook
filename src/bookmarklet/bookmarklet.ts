import format from 'date-fns/format'
import MeetingNotebook from '../MeetingNotebook'

export default async (owner: string, repo: string, token: string, filenamePrefix: string, templateUrl: string) => {
  console.log('Running bookmarklet...')

  const github = {
    token,
    repo: {
      owner,
      name: repo,
    },
  }

  const getStatusMessage = (msg: string) => {
    return (
      '<div style="' +
      'display: flex;' +
      'justify-content: center;' +
      'height: 100vh;' +
      'align-items: center;' +
      'font-size: 25px;' +
      'font-family: Arial;">' +
      '<span id="status-msg"  style="' +
      'border: 1px solid #999;' +
      'padding: 20px;' +
      'border-radius:  15px;' +
      'background-color: rgba(255, 243, 99, 0.64);' +
      '">' +
      msg +
      '</span>' +
      '</div>'
    )
  }

  const main = async () => {
    document.write(getStatusMessage('Starting main function...'))
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    await sleep(200)
    // const GithubNotebook = GhMeetingNotebook.GithubNotebook;
    const notebook = new MeetingNotebook(github)
    try {
      ;(document.querySelector('#status-msg') as HTMLDivElement).innerText = 'Retrieving notes data...'
      const blob = await notebook.run(templateUrl)
      ;(document.querySelector('#status-msg') as HTMLDivElement).innerText = 'Preparing notes...'
      await sleep(200)
      try {
        const now = new Date()
        const month =
          now.getMonth().toString().length === 1 ? '0' + now.getMonth().toString() : now.getMonth().toString()
        const date = now.getDate().toString().length === 1 ? '0' + now.getDate().toString() : now.getDate().toString()
        const filename = filenamePrefix + now.getUTCFullYear().toString() + month + date
        ;(document.querySelector('#status-msg') as HTMLDivElement).innerText = 'Saving report...'
        await sleep(200)
        if (confirm('Do you want to open an email to send notes?')) {
          const msgCurrDateTime = format(new Date(), 'dddd, DD MMMM YYYY') + ' at ' + format(new Date(), 'hh:mm:ss A')
          window.open(
            'mailto:?subject=Meeting notes on ' +
              date +
              '/' +
              month +
              '/' +
              now.getUTCFullYear().toString() +
              '&body=' +
              encodeURIComponent(
                'Hi,\r\n\r\nThe meeting notes as at ' + msgCurrDateTime + ' is attached in this email.\r\n\r\n'
              ),
            '_self'
          )
        }
        await notebook.saveAs(blob, filename)
        ;(document.querySelector('#status-msg') as HTMLDivElement).innerText = 'Report saved!'
        alert('Report saved successfully!')
      } catch (err) {
        alert('Error occurred while saving notebook file: ' + err.message)
        window.close()
      }
    } catch (err) {
      alert('Error occurred while running notebook: ' + err.message)
      window.close()
    }
  }
  await main()
}
