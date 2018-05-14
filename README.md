# Send Custom Release Email
VSTS extension to send customized release email which adds completed workitems based on your own custom query and  automatically adds in your email.

## Purpose of this extension
> If you need to send a customized email with workitems attached automatically as per your own query criteria then this extension will
> help you reolve the problem.

## Prerequisites
- Backend API which accepts below JSON as post to send email (I used Azure Functions).
> "To":"<EMAIL ADDRESSES>","Subject":"<SUBJECT>","Body":"<EMAIL BODY>"}
# Demo 
- Once you installed it will appear in **Build and Release**
- Select UAT or Prod and Web or Mobile so it will trigger the query you have set in settings page (next image) and adds it in email once   you click preview 
![Alt Title](images/demo-1.png?raw=true "Title")

- Everything added here will be saved for future released. add multiple emails seperated by **;**
![Alt Title](images/demo-2.png?raw=true "Demo 1")



# TODO
- [ ] Validation
- [ ] Generalize Release types and environments 
- [ ] Add CC support
