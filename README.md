# Github Meeting Notes Bookmarklet

Using Github's issue tracker as a notebook to record and keep track of meeting tasks. 

This bookmarklet basically generates a meeting tasks report in MS Word document. The template of the report can be customised in a HTML file and fed to the bookmarklet.


## The Problem
Have you ever had to record and keep track of tasks discussed in meetings and then churn out a meeting report in a MS Word document for your boss at work?

Recently, I found myself having to keep track of meeting tasks and compile them into a Microsoft Word document report on a weekly basis at work. The process isn't difficult, but it's a very tedious, time-consuming and error-prone one. 

After the initial weeks at refining my motor skills in MS Word, eye-balling through rows after rows of meeting tasks and clicking away updating them one by one, I can't help questioning the irony of using a word processor as a task tracking tool.

## The Idea!
There are already many tools out there for such purposes, and I just need to convert the end result to a format in which typical office workers are used to reading. 
In my case, I'm required to produce the report in a MS Word document. 

Github already has a great issue tracking tool! Best of all, Github is _free_!
So, instead of tracking issues manually, why not use Github's issue tracker and its kanban board to record meeting tasks in a repository 
and then, with just a single click, generate a report that's ready to be sent out?

![Demo](https://i.imgur.com/f6987td.gif)

The issues in the Github repository are then plugged into the Word document:
![Word Document Report](https://i.imgur.com/ccCsD3rl.png)

This simple idea uses a bookmarklet. Currently, it does the following which fulfils what I need at work:
- Create/Update tasks discussed in meetings
- Update task statuses
- Sort the most recently updated tasks at the top of the list in the report for easy viewing
- Closed tasks should remain in the reports for a certain number of days (configurable: `reportClosedIssueNumDays`) before removing them in subsequent reports
- Tasks should include assignees (use of labels prefixed with `Assignee:`) and target dates (milestones)
- After report is generated, launch default email client for me to send meeting report after a meeting

Now, need to reopen an old task? No need to manually flip through the past _n_ months of Word documents for that closed task intended 
to be reopened, copy all of its contents/past updates and paste them into the new file. :cold_sweat:

Just have to reopen an issue in the repository, and then click on that bookmarklet! :sweat_smile:

I'm hoping this can save myself a lot of time and headaches!

## Usage
```javascript
npm install
```

Either build the files or download from the release:
```javascript
npm run build
```

### Bookmarklet Script
Works only in modern browsers that support ES6. Tested in Chrome 64.0.3282.167, Webkit 537.36.

Create a bookmark with this script:
```javascript
javascript:(function(a='REPO_USERNAME',b='REPO_NAME',c='GITHUB_TOKEN',d='FILENAME',e='REPORT_TEMPLATE_URL',f='URL_TO_UMD_SCRIPT',g=30){const i=`eval(\`(${async function(j,k,l,m,n,o,p){const q=async v=>{try{return 200===(await fetch(v,{method:'HEAD',cache:'no-cache'})).status}catch(w){return!1}},r=await q(o);if(!r)return alert('Error: Cannot find main script file.'),window.close(),!1;const t=await q(n);if(!t)return alert('Error: Cannot find template file.'),window.close(),!1;const u=document.createElement('script');u.src=o,document.body.appendChild(u),u.addEventListener('load',async()=>{const v=GhMeetingNotebook.bookmarklet,w=await(await fetch(n)).text();v({token:l,repo:{owner:j,name:k},report:{filenamePrefix:m,closedIssuesNumDays:p,templateHtml:w}})})}.toString()})('${a}', '${b}', '${c}', '${d}', '${e}', '${f}', '${g}')\`)`;window.open(`javascript:${i}`,'_blank')})();
```
| Placeholder Variables | Description |
| --- | ---- |
| REPO_USERNAME | Username of Github repo |
| REPO_NAME | Name of repo on Github |
| GITHUB_TOKEN | Github token |
| FILENAME | File name to be used when saving report |
| REPORT_TEMPLATE_URL | URL to a HTML template file for report |
| URL_TO_UMD_SCRIPT | URL to the UMD gh-meeting-notes.js script |

Have to find a place to host the files at `REPORT_TEMPLATE_URL` and `URL_TO_UMD_SCRIPT`.

The un-minified version of this script is at `./src/bookmarklet/bookmarklet-client.js`. 

### Special Labels
These special labels can be used for an issue.

| Label | Description |
| --- | ---- |
| Assignee: # | To set an assignee name to a task. Eg: Assignee: Jane. Jane will be one of the assignees of the task. |
| Report: Include | Include a closed task in the report even if it is older than its `reportClosedIssueNumDays`  |
| Report: Exclude | Exclude a task from the report |
