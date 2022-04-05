import requests
from bs4 import BeautifulSoup
webpage = requests.get("https://solutionwv.rsup.io/")
soup = BeautifulSoup(webpage.content, "html.parser")

print(soup.find_all("body"))