from redminelib import Redmine
import requests

redmine_url = "레드마인URL"
# redmine = Redmine(redmine_url, username="레드마인 ID", password="PASSWORD")
redmine = Redmine('REDMINE URL', key='REDMINE_KEY')
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
