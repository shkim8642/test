import gspread
from oauth2client.service_account import ServiceAccountCredentials
scope = [
'https://spreadsheets.google.com/feeds',
'https://www.googleapis.com/auth/drive',
]
json_file_name = 'modified-petal-335107-51ffbe83374b.json'
credentials = ServiceAccountCredentials.from_json_keyfile_name(json_file_name, scope)
gc = gspread.authorize(credentials)
spreadsheet_url = 'https://docs.google.com/spreadsheets/d/13Gt2fqt60qMO_P1HfY5uj3i1VkiGtfqCX9jNeSJ_5pg/edit#gid=0'
# 스프레스시트 문서 가져오기 
doc = gc.open_by_url(spreadsheet_url)
# 시트 선택하기
worksheet = doc.worksheet('시트1')

worksheet = gs.add_worksheet(title='{시트추가}', rows='{10}', cols='{10}')
# 시트 추가

cell_data = worksheet.acell('B2').value

print(cell_data)