jira-drag-drop
==============

Drag & Drop subtasks between task stories in JIRA GreenHopper Planning Board. 
Only OnDemand JIRA instances are currently supported.

Since JIRA doesn't provide API for moving tasks yet, 
once you drop a subtask it will open Move Issue wizard in the background tab and automatically 
fill all the fields required and submit it, so you don't have to. 
Once the subtask has moved, the background tab will be closed automatically. 

You can move several subtasks simultaneously.

If the new parent task has a fix version it will override the subtask fix version. 
Otherwise the subtask version will be unaffected.

https://chrome.google.com/webstore/detail/jira-dragdrop/ancggppogalfgdikhamgcgppkohigefk
