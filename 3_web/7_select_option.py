
import time
from selenium import webdriver
from selenium.webdriver.common.by import By

browser = webdriver.Chrome()
browser.get('https://www.w3schools.com/tags/tryit.asp?filename=tryhtml_option')

browser.switch_to.frame('iframeResult')

# 1. car에 해당하는 element 찾고, 드롭다운 내부에 있는 4번째 옵션 선택
# elem = browser.find_element_by_xpath('//*[@id="cars"]/option[4]')

# elem.click()


# 2.텍스트 값을 통해 선택하는 방법
elem = browser.find_element_by_xpath('//*[@id="cars"]/option[text()="Audi"]')
elem.click()

time.sleep(5)

browser.quit() 