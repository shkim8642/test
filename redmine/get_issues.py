from redminelib import Redmine
import requests

import json


redmine_url = "https://projects.rsupport.com"
redmine = Redmine('https://projects.rsupport.com/', key='1522ae601c99b45bc6739876fb923c1fcd82bf69')

#RC6 프로젝트의 모든 issues 들 csv 파일로 등록
# prj = redmine.project.get(resource_id="rc50")
# # #print(prj)
# my_prj_issue_list = list(prj.issues)
# print(my_prj_issue_list)
#my_prj_issue_list.export('csv',savepath='./',filename='my_prj_issue_list.csv')

# issues = redmine.issue.filter(project_id='rc50')
# issues.export('csv', savepath='./', columns='all')


#rc50 프로젝트의 속성을 목록으로 반환
# dir=dir(redmine.project.get('rc50'))
# print(dir)


# #108236번 이슈의 속성(id, name)을 튜플 목록으로 반환
# issue = list(redmine.issue.get(108236))
# print(issue)
print("--==--")
es=redmine.issue.all().filter(status__id=5)
print(es)
print("--==--")