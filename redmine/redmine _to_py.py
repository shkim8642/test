import gspread
from oauth2client.service_account import ServiceAccountCredentials

scope = [
'https://spreadsheets.google.com/feeds',
'https://www.googleapis.com/auth/drive',
]

json_file_name = 'refined-grammar-334504-6115d51a3108.json'
credentials = ServiceAccountCredentials.from_json_keyfile_name(json_file_name, scope)
gc = gspread.authorize(credentials)
spreadsheet_url = 'https://docs.google.com/spreadsheets/d/11WE-doucI31hBf5ghoHdn9HR0VAe9wMc1G-5R3-Y210/edit#gid=0'
# 스프레스시트 문서 가져오기 
doc = gc.open_by_url(spreadsheet_url)
# 시트 선택하기
worksheet = doc.worksheet('시트1')

#특정 셀 데이터 가져오기
cell_data = worksheet.acell('B1').value
print(cell_data)


#특정 셀에 값 쓰기
worksheet = doc.worksheet('Redmine')
worksheet.update_acell('A1', 'b1 updated')

#행으로 데이터 추가하기 (append로 맨 아래에 한 행을 추가)
worksheet.append_row(['new1', 'new2', 'new3', 'new4'])

#특정 위치에 한 행을 추가하고 싶다면 insert_row를 쓰고 행 번호를 넣어주어야 한다. 예를 들어 4번 행에 추가하고 싶다면 이렇게.
worksheet.insert_row(['new1', 'new2', 'new3', 'new4'], 4)

#특정 위치에 한 행을 추가하고 싶다면 insert_row를 쓰고 행 번호를 넣어주어야 한다. 예를 들어 4번 행에 추가하고 싶다면 이렇게.
worksheet.insert_row(['new1', 'new2', 'new3', 'new4'], 4)