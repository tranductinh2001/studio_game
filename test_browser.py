from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})
    page.goto('http://localhost:5173/')
    page.wait_for_timeout(3000)
    page.screenshot(path='screenshot_main.png')
    print('1. Main page screenshot captured.')

    # Check button text
    buttons = page.locator('button').all()
    print('Buttons list:')
    for b in buttons:
        print(' -', repr(b.inner_text()))

    # Click Teacher Panel button
    btn = page.locator('button', has_text='BẢNG ĐIỀU KHIỂN GV').first
    btn.click()
    page.wait_for_timeout(1000)
    page.screenshot(path='screenshot_teacher_panel.png')
    print('2. Teacher panel opened screenshot captured.')

    # Click FAQ Tab
    faq_tab = page.locator('button', has_text='Ngân hàng 12 câu hỏi').first
    faq_tab.click()
    page.wait_for_timeout(1000)
    page.screenshot(path='screenshot_faq_tab.png')
    print('3. FAQ tab screenshot captured.')

    # Click first FAQ item: "1. Internet là gì?"
    faq_item = page.locator('text=Internet là gì?').first
    faq_item.click()
    page.wait_for_timeout(1500)
    page.screenshot(path='screenshot_faq_clicked.png')
    print('4. FAQ question clicked, Webby answering captured.')

    # Return to Script Tab & Trigger Transition
    script_tab = page.locator('button', has_text='Kịch bản khởi động').first
    script_tab.click()
    page.wait_for_timeout(500)
    trans_btn = page.locator('button', has_text='KẾT THÚC KHỞI ĐỘNG - VÀO BÀI 6!').first
    trans_btn.click()
    page.wait_for_timeout(2000)
    page.screenshot(path='screenshot_transition_banner.png')
    print('5. Lesson 6 celebration banner captured.')

    browser.close()
print('DONE!')

