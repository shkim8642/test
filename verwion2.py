import requests
from bs4 import BeautifulSoup
webpage = requests.get("https://www.daangn.com/hot_articles")
soup = BeautifulSoup(webpage.content, "html.parser")
#print(soup.p.string) #p테그 텍스트만
#for child in soup.ul.children:
 #   print(child)

#  for parent in soup.ul.parents:
#     print(parent)

print(soup.find_all("h2"))
print(soup.find_all("h1"))