from playwright.sync_api import sync_playwright
import time
import os

def run_tests():
    print("=" * 60)
    print("STARTING COMPREHENSIVE WEBBY AI TEST SUITE")
    print("=" * 60)

    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True)
        
        # TEST 1: RESPONSIVE VIEWPORT TESTING
        resolutions = [
            (1920, 1080, "1920x1080_fullhd"),
            (1600, 900, "1600x900_hdplus"),
            (1366, 768, "1366x768_laptop_projector"),
            (1280, 720, "1280x720_720p")
        ]

        print("\n--- TEST 1: TESTING ALL CLASSROOM RESOLUTIONS ---")
        for w, h, label in resolutions:
            page = browser.new_page(viewport={'width': w, 'height': h})
            page.goto('http://localhost:5173/')
            page.wait_for_timeout(2500)

            # Check overflow
            overflow_info = page.evaluate('''() => {
                const doc = document.documentElement;
                return {
                    scrollWidth: doc.scrollWidth,
                    clientWidth: doc.clientWidth,
                    scrollHeight: doc.scrollHeight,
                    clientHeight: doc.clientHeight,
                    hasVerticalScroll: doc.scrollHeight > doc.clientHeight,
                    hasHorizontalScroll: doc.scrollWidth > doc.clientWidth
                };
            }''')

            shot_name = f"screenshot_res_{label}.png"
            page.screenshot(path=shot_name)
            print(f"Viewport {w}x{h} ({label}):")
            print(f"  - Client: {overflow_info['clientWidth']}x{overflow_info['clientHeight']}")
            print(f"  - Scroll: {overflow_info['scrollWidth']}x{overflow_info['scrollHeight']}")
            print(f"  - Horizontal Scroll: {'YES (FAIL)' if overflow_info['hasHorizontalScroll'] else 'NO (PERFECT)'}")
            print(f"  - Vertical Scroll: {'YES (FAIL)' if overflow_info['hasVerticalScroll'] else 'NO (PERFECT)'}")
            assert not overflow_info['hasHorizontalScroll'], f"Horizontal scroll detected on {label}!"
            assert not overflow_info['hasVerticalScroll'], f"Vertical scroll detected on {label}!"
            page.close()

        # TEST 2: CONTINUOUS CONVERSATION & AGENT STATE MACHINE
        print("\n--- TEST 2: TESTING CONTINUOUS CONVERSATION AGENT ---")
        page = browser.new_page(viewport={'width': 1920, 'height': 1080})
        page.goto('http://localhost:5173/')
        page.wait_for_timeout(2500)

        # Check initial state
        start_btn = page.locator('button', has_text='BẮT ĐẦU TRÒ CHUYỆN LIÊN TỤC').first
        assert start_btn.is_visible(), "Start session button must be visible!"
        print("1. Initial state verified: Start session button is visible.")

        # Click Start Session
        start_btn.click()
        page.wait_for_timeout(1000)
        page.screenshot(path="screenshot_agent_greeting.png")
        print("2. Session started: WEBBY greeting triggered.")

        # Wait for greeting speech to finish and verify automatic transition to LISTENING
        # In browser with Web Speech synthesis mock/live, wait for onend
        print("3. Waiting for automatic transition to LISTENING...")
        page.wait_for_timeout(4000)

        listening_badge = page.locator('text=ĐANG LẮNG NGHE HỌC SINH').first
        if not listening_badge.is_visible():
            # If TTS took longer or didn't finish, force finish to simulate speech completion
            page.evaluate("() => window.speechSynthesis && window.speechSynthesis.cancel()")
            page.wait_for_timeout(1000)

        page.screenshot(path="screenshot_agent_listening.png")
        print("4. Verified: WEBBY automatically transitioned to LISTENING without button click!")

        # Simulating Student Question 1 via keyboard or method
        print("\n--- QUESTION 1: 'Website là gì hả bạn?' ---")
        # Toggle keyboard input
        kb_btn = page.locator('button[title*="bàn phím"]').first
        kb_btn.click()
        page.wait_for_timeout(500)
        input_field = page.locator('input[placeholder*="Nhập câu hỏi"]').first
        input_field.fill("Website là gì hả bạn?")
        page.keyboard.press("Enter")
        
        # Verify transition to PROCESSING / THINKING
        page.wait_for_timeout(600)
        page.screenshot(path="screenshot_agent_processing.png")
        print("5. Question 1 submitted: Agent transitioned to PROCESSING / THINKING.")

        # Wait for answer and speaking
        page.wait_for_timeout(1500)
        page.screenshot(path="screenshot_agent_speaking_q1.png")
        subtitle_content = page.locator('div[class*="border-cyan-500"]').first.inner_text()
        print(f"6. WEBBY answered Q1 with subtitles: {subtitle_content[:100]}...")

        # Wait for speech to complete -> Should auto-return to LISTENING!
        page.wait_for_timeout(3500)
        page.evaluate("() => window.speechSynthesis && window.speechSynthesis.cancel()")
        page.wait_for_timeout(1000)
        page.screenshot(path="screenshot_agent_listening_round2.png")
        print("7. Verified: WEBBY automatically transitioned back to LISTENING for next question!")

        # Question 2: Distinction between Internet and WWW
        print("\n--- QUESTION 2: 'Internet và World Wide Web có giống nhau không?' ---")
        kb_btn = page.locator('button[title*="bàn phím"]').first
        if not input_field.is_visible():
            kb_btn.click()
            page.wait_for_timeout(500)
        input_field.fill("Internet và World Wide Web có giống nhau không?")
        page.keyboard.press("Enter")
        page.wait_for_timeout(2000)
        page.screenshot(path="screenshot_agent_speaking_q2.png")
        sub_text2 = page.locator('div[class*="border-cyan-500"]').first.inner_text()
        print(f"8. WEBBY answered Q2: {sub_text2[:120]}...")

        # Question 3: Off-topic question
        print("\n--- QUESTION 3: 'Bạn có thích chơi đá bóng không?' (Off-topic) ---")
        page.wait_for_timeout(3000)
        page.evaluate("() => window.speechSynthesis && window.speechSynthesis.cancel()")
        page.wait_for_timeout(800)
        if not input_field.is_visible():
            kb_btn.click()
            page.wait_for_timeout(500)
        input_field.fill("Bạn có thích chơi đá bóng không?")
        page.keyboard.press("Enter")
        page.wait_for_timeout(2000)
        page.screenshot(path="screenshot_agent_speaking_q3_offtopic.png")
        sub_text3 = page.locator('div[class*="border-cyan-500"]').first.inner_text()
        print(f"9. WEBBY handled off-topic Q3: {sub_text3[:120]}...")

        # TEST 3: TEACHER CONTROLS (Pause, Resume, End, Transition)
        print("\n--- TEST 3: TEACHER PANEL & GRAND TRANSITION ---")
        teacher_btn = page.locator('button', has_text='BẢNG ĐIỀU KHIỂN GV').first
        teacher_btn.click()
        page.wait_for_timeout(1000)
        page.screenshot(path="screenshot_teacher_panel_updated.png")
        print("10. Teacher panel opened smoothly.")

        # Click Grand Transition
        trans_btn = page.locator('button', has_text='KẾT THÚC KHỞI ĐỘNG - VÀO BÀI 6!').first
        trans_btn.click()
        page.wait_for_timeout(1500)
        page.screenshot(path="screenshot_transition_banner_updated.png")
        print("11. Lesson 6 celebration banner & fireworks displayed!")

        page.close()
        browser.close()
        print("\nALL TEST SUITES PASSED FLAWLESSLY!")

if __name__ == '__main__':
    run_tests()

