from redminelib import Redmine
import argparse
 
parser = argparse.ArgumentParser(description="Redmine upload or download")
parser.add_argument('-m','--mode',dest='Mode',help='download or upload',required=True)
parser.add_argument('-i','--id',dest='ID',help='redmine job id',required=True)
parser.add_argument('-p','--path',dest='Path',help='if download save path,or upload file path(Up to the directory name containing the file)',required=True)
parser.add_argument('-n','--name',dest='Name',help='if upload,need to specify filename',required=False)
args=parser.parse_args()
 
mode = args.Mode
jid = args.ID
path = args.Path
filename = args.Name
 
redmine = Redmine('https://projects.rsupport.com/', key='1522ae601c99b45bc6739876fb923c1fcd82bf69')
 
# need uploading file's path, name
def upload(jid,path,filename):
    redmine.issue.update(jid, uploads = [{"path" : path+"/"+filename, "filename" : filename}])
 
def download(jid,path):
    redmine_page = list(redmine.issue.get(jid,include='attachments'))
    file_li = dict(subject for subject in redmine_page if subject[0]=='attachments')['attachments']
    file_dict = dict((file['filename'],file['content_url']) for file in file_li)
    filename,content_url = list(file_dict.items())[0]
    redmine.download(content_url, savepath = path, filename=filename)
 
if mode.lower() == 'download':
    download(jid,path)
elif mode.lower() == 'upload':
    upload(jid,path,filename)