import time
import os
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = r"C:\Users\X1\.gemini\antigravity\brain\aed90b94-7322-4ab0-a656-78c6fe474d75"

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True)
        context = browser.new_context(viewport={'width': 1600, 'height': 900})
        page = context.new_page()

        print("1. Navigating to http://localhost:5173 ...")
        page.goto("http://localhost:5173", wait_until="networkidle")
        time.sleep(1)

        print("2. Switching to Game Center tab...")
        page.click("button:has-text('Đấu Trường Game')")
        time.sleep(1.5)

        # Screenshot Catalog
        catalog_shot = os.path.join(ARTIFACT_DIR, "screenshot_2d_catalog.png")
        page.screenshot(path=catalog_shot)
        print(f"Catalog saved: {catalog_shot}")

        # --- GAME 01: BOAT RACE ---
        print("3. Testing Game 01 - Đua Thuyền Vượt Sóng...")
        page.click("[data-game-id='game-01-boat-race']")
        time.sleep(1)

        print("Clicking BẮT ĐẦU ĐUA (RUN)...")
        page.click("button:has-text('BẮT ĐẦU ĐUA (RUN)')")
        time.sleep(3.5) # Wait past countdown into race

        shot_g1 = os.path.join(ARTIFACT_DIR, "screenshot_2d_game_01_boat_race.png")
        page.screenshot(path=shot_g1)
        print(f"Game 01 running screenshot: {shot_g1}")

        # Back to Catalog
        page.click("button:has-text('Danh Sách Trò Chơi')")
        time.sleep(1)

        # --- GAME 02: DUCK RACE ---
        print("4. Testing Game 02 - Đua Vịt Vui Nhộn...")
        page.click("[data-game-id='game-02-duck-race']")
        time.sleep(1)

        page.click("button:has-text('BẮT ĐẦU ĐUA (RUN)')")
        time.sleep(3.5)

        shot_g2 = os.path.join(ARTIFACT_DIR, "screenshot_2d_game_02_duck_race.png")
        page.screenshot(path=shot_g2)
        print(f"Game 02 running screenshot: {shot_g2}")

        page.click("button:has-text('Danh Sách Trò Chơi')")
        time.sleep(1)

        # --- GAME 03: LUCKY WHEEL ---
        print("5. Testing Game 03 - Vòng Quay May Mắn...")
        page.click("[data-game-id='game-03-lucky-wheel']")
        time.sleep(1)

        page.click("button:has-text('QUAY')")
        time.sleep(2)

        shot_g3 = os.path.join(ARTIFACT_DIR, "screenshot_2d_game_03_lucky_wheel.png")
        page.screenshot(path=shot_g3)
        print(f"Game 03 spinning screenshot: {shot_g3}")

        page.click("button:has-text('Danh Sách Trò Chơi')")
        time.sleep(1)

        # --- GAME 04: MYSTERY BOXES ---
        print("6. Testing Game 04 - Hộp Quà Bí Ẩn...")
        page.click("[data-game-id='game-04-mystery-box']")
        time.sleep(1)

        # Click the first box
        boxes = page.locator("div:has-text('Hộp 1')")
        if boxes.count() > 0:
            boxes.first.click()
        else:
            page.locator("img[alt='Gift Box']").first.click()
        time.sleep(1.5)

        shot_g4 = os.path.join(ARTIFACT_DIR, "screenshot_2d_game_04_mystery_box.png")
        page.screenshot(path=shot_g4)
        print(f"Game 04 opened screenshot: {shot_g4}")

        # Close modal if open
        if page.locator("button:has-text('Tiếp Tục Cuộc Chơi')").is_visible():
            page.click("button:has-text('Tiếp Tục Cuộc Chơi')")
            time.sleep(0.5)

        page.click("button:has-text('Danh Sách Trò Chơi')")
        time.sleep(1)

        # --- GAME 05: ROCKET SPACE ---
        print("7. Testing Game 05 - Tên Lửa Chinh Phục Vũ Trụ...")
        page.click("[data-game-id='game-05-rocket-space']")
        time.sleep(1)

        page.click("button:has-text('PHÓNG TÊN LỬA (RUN)')")
        time.sleep(3.5)

        shot_g5 = os.path.join(ARTIFACT_DIR, "screenshot_2d_game_05_rocket_space.png")
        page.screenshot(path=shot_g5)
        print(f"Game 05 screenshot: {shot_g5}")

        page.click("button:has-text('Danh Sách Trò Chơi')")
        time.sleep(1)

        # --- GAME 06: LUCKY CARD SHUFFLE ---
        print("8. Testing Game 06 - Ai Là Người May Mắn...")
        page.click("[data-game-id='game-06-lucky-shuffle']")
        time.sleep(1)

        page.click("button:has-text('BẮT ĐẦU XÁO BÀI (RUN)')")
        time.sleep(3)

        shot_g6 = os.path.join(ARTIFACT_DIR, "screenshot_2d_game_06_lucky_shuffle.png")
        page.screenshot(path=shot_g6)
        print(f"Game 06 screenshot: {shot_g6}")

        # Close victory modal if visible
        if page.locator("button:has-text('Chọn Bạn Tiếp')").is_visible():
            page.click("button:has-text('Chọn Bạn Tiếp')")
            time.sleep(0.5)

        page.click("button:has-text('Danh Sách Trò Chơi')")
        time.sleep(1)

        # --- GAME 07: KNOWLEDGE MAZE ---
        print("9. Testing Game 07 - Mê Cung Tri Thức...")
        page.click("[data-game-id='game-07-knowledge-maze']")
        time.sleep(1)

        page.click("button:has-text('TIẾN 1 BƯỚC (RUN)')")
        time.sleep(1.5)

        shot_g7 = os.path.join(ARTIFACT_DIR, "screenshot_2d_game_07_knowledge_maze.png")
        page.screenshot(path=shot_g7)
        print(f"Game 07 screenshot: {shot_g7}")

        # Close question modal
        btn_advance = page.locator("button:has-text('Mở Cửa & Tiến Bước')")
        if btn_advance.is_visible():
            btn_advance.click()
            time.sleep(0.5)

        page.click("button:has-text('Danh Sách Trò Chơi')")
        time.sleep(1)

        # --- GAME 08: BALL CANNON ---
        print("10. Testing Game 08 - Bắn Bóng Trúng Đích...")
        page.click("[data-game-id='game-08-ball-cannon']")
        time.sleep(1)

        page.click("button:has-text('BẮN BÓNG (RUN)')")
        time.sleep(2)

        shot_g8 = os.path.join(ARTIFACT_DIR, "screenshot_2d_game_08_ball_cannon.png")
        page.screenshot(path=shot_g8)
        print(f"Game 08 screenshot: {shot_g8}")

        browser.close()
        print("ALL 8 2D CARTOON GAMES SUCCESSFULLY TESTED & CAPTURED!")

if __name__ == "__main__":
    run_tests()
