from redminelib import Redmine
import requests

redmine_url = "https://projects.rsupport.com"
# redmine = Redmine(redmine_url, username="shkim", password="k135799!")
redmine = Redmine('https://projects.rsupport.com/', key='1522ae601c99b45bc6739876fb923c1fcd82bf69')
# print(list(redmine.project.all())) # list of project
print("AAA")
# print(len(redmine.project.all())) #number of project

projects = redmine.project.all()
projects.export('json',savepath='./',filename='projects.json')

print("BBB")
prj = redmine.project.get(resource_id="rc6")
print(prj)
print("ccc")
my_prj_issue_list = list(prj.issues)
my_prj_issue_list.export('json',savepath='./',filename='my_prj_issue_list.json')