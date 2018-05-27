/*
    This script should be minified and compressed for use as bookmarklet's script.
    Parameters:
      owner:                      Github repository owner
      repo:                       Github repository name
      token:                      Github token
      filename:                   File name of report to be saved. Will be prefixed before the current date.
      templateUrl:                URL to where the template HTML file is hosted.
      scriptUrl:                  URL to where the gh-meeting-notebook.min.js script is hosted.
      reportClosedIsssueNumDays:  Number of days a closed issue should still show in the report.
 */
(function(
  owner='',
  repo='',
  token='',
  filename='',
  templateUrl='',
  scriptUrl='',
  reportClosedIssueNumDays=30
) {
  const wrapperFunc = async function(owner, repo, token, filenamePrefix, templateUrl, scriptUrl, reportClosedIssueNumDays) {

    const isRemoteFileExist = async url => {
      try {
        return (await fetch(url, {
          method: 'HEAD',
          cache: 'no-cache'
        })).status === 200;
      } catch(err) {
        return false;
      }
    };

    const isScriptFileExist = await isRemoteFileExist(scriptUrl);
    if(!isScriptFileExist) {
      alert('Error: Cannot find main script file.');
      window.close();
      return false;
    }

    const isTemplateFileExist = await isRemoteFileExist(templateUrl);
    if(!isTemplateFileExist) {
      alert('Error: Cannot find template file.');
      window.close();
      return false;
    }

    const s = document.createElement('script');
    s.src = scriptUrl;
    document.body.appendChild(s);
    s.addEventListener('load', async () => {
      const bookmarklet = GhMeetingNotebook.bookmarklet;
      const tplHtml = await (await fetch(templateUrl)).text();
      const config = {
        token: token,
        repo: {
          owner: owner,
          name: repo
        },
        report: {
          filenamePrefix: filenamePrefix,
          closedIssuesNumDays: reportClosedIssueNumDays,
          templateHtml: tplHtml
        }
      };
      bookmarklet(config);
    })
  }

  const js = `eval(\`(${(wrapperFunc.toString())})('${owner}', '${repo}', '${token}', '${filename}', '${templateUrl}', '${scriptUrl}', '${reportClosedIssueNumDays}')\`)`;
  window.open(`javascript:${js}`, '_blank');
})();
