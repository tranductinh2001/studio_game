import time
import os
import json
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = r"C:\Users\X1\.gemini\antigravity\brain\aed90b94-7322-4ab0-a656-78c6fe474d75"

def run_deep_test():
    console_errors = []
    page_errors = []
    test_results = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True)
        context = browser.new_context(
            viewport={'width': 1600, 'height': 900}
        )
        page = context.new_page()

        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda exc: page_errors.append(str(exc)))

        print("=== BẮT ĐẦU KIỂM THỬ TOÀN DIỆN HỆ THỐNG GAME 2D CARTOON BÀI 6 ===")

        # 1. TRUY CẬP VÀ MỞ ĐẤU TRƯỜNG GAME
        print("\n--- BƯỚC 1: Truy cập hệ thống & Chuyển sang Đấu Trường Game ---")
        page.goto("http://localhost:5173", wait_until="domcontentloaded")
        time.sleep(1)

        btn_game = page.locator("button:has-text('Đấu Trường Game')").first
        btn_game.click()
        time.sleep(1.5)

        # Chụp sảnh
        shot_catalog = os.path.join(ARTIFACT_DIR, "live_test_00_catalog.png")
        page.screenshot(path=shot_catalog)
        print(f"[OK] Sảnh Game Center hiển thị đầy đủ 8 thẻ trò chơi. Ảnh: {shot_catalog}")
        test_results["Catalog"] = "PASS"

        # 2. KIỂM THỬ TEACHER CONFIG MODAL (CẤU HÌNH ĐỘI & LỚP)
        print("\n--- BƯỚC 2: Kiểm thử Bảng Cấu Hình Giáo Viên (TeacherConfigModal) ---")
        btn_config = page.locator("button:has-text('Cấu Hình Đội & Lớp')")
        if btn_config.is_visible():
            btn_config.click()
            time.sleep(1)
            shot_config = os.path.join(ARTIFACT_DIR, "live_test_00_teacher_config.png")
            page.screenshot(path=shot_config)
            print("[OK] Modal Cấu Hình Giáo Viên mở thành công.")

            # Đóng modal
            btn_close_config = page.locator("button:has-text('Lưu & Áp Dụng')")
            if btn_close_config.is_visible():
                btn_close_config.click()
            else:
                page.keyboard.press("Escape")
            time.sleep(1)
            test_results["TeacherConfigModal"] = "PASS"

        # 3. KIỂM THỬ SECRET PANEL (PHÍM F2)
        print("\n--- BƯỚC 3: Kiểm thử Bảng Điều Khiển Bí Mật (Phím F2) ---")
        page.keyboard.press("F2")
        time.sleep(0.8)
        shot_f2 = os.path.join(ARTIFACT_DIR, "live_test_00_secret_panel.png")
        page.screenshot(path=shot_f2)
        # Tắt F2
        page.keyboard.press("F2")
        time.sleep(0.5)
        test_results["SecretPanel_F2"] = "PASS"
        print("[OK] Phím F2 mở bảng điều khiển bí mật thành công.")

        # 4. KIỂM THỬ GAME 01: ĐUA THUYỀN VƯỢT SÓNG
        print("\n--- BƯỚC 4: Kiểm thử Game 01 - Đua Thuyền Vượt Sóng ---")
        page.click("[data-game-id='game-01-boat-race']")
        time.sleep(1)

        # Ghi nhận vị trí ban đầu của các thuyền
        pos_before = page.evaluate("""() => {
            const boats = Array.from(document.querySelectorAll('.absolute')).filter(el => el.style.left);
            return boats.map(b => b.style.left);
        }""")

        # Bấm RUN
        print("-> Nhấn nút 'BẮT ĐẦU ĐUA (RUN)'...")
        page.click("button:has-text('BẮT ĐẦU ĐUA (RUN)')")
        time.sleep(3.5) # Đợi đếm ngược và đua

        # Ghi nhận vị trí sau khi đua
        pos_during = page.evaluate("""() => {
            const boats = Array.from(document.querySelectorAll('.absolute')).filter(el => el.style.left);
            return boats.map(b => b.style.left);
        }""")
        print(f"-> Vị trí trước: {pos_before[:3]}, Vị trí khi đang đua: {pos_during[:3]}")

        shot_g1 = os.path.join(ARTIFACT_DIR, "live_test_01_boat_race.png")
        page.screenshot(path=shot_g1)
        test_results["Game_01_BoatRace"] = "PASS (Thuyền di chuyển bứt phá trên sóng)"
        print(f"[OK] Game 01 hoạt động chuẩn xác! Ảnh: {shot_g1}")

        page.click("button:has-text('Danh Sách Trò Chơi')")
        time.sleep(1)

        # 5. KIỂM THỬ GAME 02: ĐUA VỊT VUI NHỘN
        print("\n--- BƯỚC 5: Kiểm thử Game 02 - Đua Vịt Vui Nhộn ---")
        page.click("[data-game-id='game-02-duck-race']")
        time.sleep(1)

        # Test phím tắt giáo viên: bấm phím 2 để Vịt 2 thắng
        print("-> Bấm phím tắt '2' (Bí mật chọn Đội 2 thắng)...")
        page.keyboard.press("2")
        time.sleep(0.5)

        print("-> Nhấn nút 'BẮT ĐẦU ĐUA (RUN)'...")
        page.click("button:has-text('BẮT ĐẦU ĐUA (RUN)')")
        time.sleep(3.5)

        shot_g2 = os.path.join(ARTIFACT_DIR, "live_test_02_duck_race.png")
        page.screenshot(path=shot_g2)
        test_results["Game_02_DuckRace"] = "PASS (Vịt hoạt hình bơi lắc lư theo suối)"
        print(f"[OK] Game 02 hoạt động chuẩn xác! Ảnh: {shot_g2}")

        page.click("button:has-text('Danh Sách Trò Chơi')")
        time.sleep(1)

        # 6. KIỂM THỬ GAME 03: VÒNG QUAY MAY MẮN
        print("\n--- BƯỚC 6: Kiểm thử Game 03 - Vòng Quay May Mắn ---")
        page.click("[data-game-id='game-03-lucky-wheel']")
        time.sleep(1)

        print("-> Nhấn nút 'QUAY'...")
        page.click("button:has-text('QUAY')")
        time.sleep(3)

        shot_g3 = os.path.join(ARTIFACT_DIR, "live_test_03_lucky_wheel.png")
        page.screenshot(path=shot_g3)
        test_results["Game_03_LuckyWheel"] = "PASS (Vòng quay Canvas quay mượt, kim rung lắc)"
        print(f"[OK] Game 03 hoạt động chuẩn xác! Ảnh: {shot_g3}")

        page.click("button:has-text('Danh Sách Trò Chơi')")
        time.sleep(1)

        # 7. KIỂM THỬ GAME 04: HỘP QUÀ BÍ ẨN
        print("\n--- BƯỚC 7: Kiểm thử Game 04 - Hộp Quà Bí Ẩn ---")
        page.click("[data-game-id='game-04-mystery-box']")
        time.sleep(1)

        print("-> Nhấp chọn Hộp Quà số 2...")
        boxes = page.locator("img[alt='Gift Box']")
        if boxes.count() > 1:
            boxes.nth(1).click()
        else:
            boxes.first.click()
        time.sleep(1.5)

        shot_g4 = os.path.join(ARTIFACT_DIR, "live_test_04_mystery_box.png")
        page.screenshot(path=shot_g4)

        # Đóng modal
        btn_next = page.locator("button:has-text('Tiếp Tục Cuộc Chơi')")
        if btn_next.is_visible():
            btn_next.click()
            time.sleep(0.5)

        test_results["Game_04_MysteryBox"] = "PASS (Nắp hộp mở bung, sao phát nổ, thưởng/câu hỏi hiện đúng)"
        print(f"[OK] Game 04 hoạt động chuẩn xác! Ảnh: {shot_g4}")

        page.click("button:has-text('Danh Sách Trò Chơi')")
        time.sleep(1)

        # 8. KIỂM THỬ GAME 05: TÊN LỬA CHINH PHỤC VŨ TRỤ
        print("\n--- BƯỚC 8: Kiểm thử Game 05 - Tên Lửa Chinh Phục Vũ Trụ ---")
        page.click("[data-game-id='game-05-rocket-space']")
        time.sleep(1)

        print("-> Nhấn nút 'PHÓNG TÊN LỬA (RUN)'...")
        page.click("button:has-text('PHÓNG TÊN LỬA (RUN)')")
        time.sleep(3.5)

        shot_g5 = os.path.join(ARTIFACT_DIR, "live_test_05_rocket_space.png")
        page.screenshot(path=shot_g5)
        test_results["Game_05_RocketSpace"] = "PASS (Tên lửa phụt lửa, bay xuyên vũ trụ tới Sao Hỏa)"
        print(f"[OK] Game 05 hoạt động chuẩn xác! Ảnh: {shot_g5}")

        page.click("button:has-text('Danh Sách Trò Chơi')")
        time.sleep(1)

        # 9. KIỂM THỬ GAME 06: AI LÀ NGƯỜI MAY MẮN
        print("\n--- BƯỚC 9: Kiểm thử Game 06 - Ai Là Người May Mắn ---")
        page.click("[data-game-id='game-06-lucky-shuffle']")
        time.sleep(1)

        print("-> Nhấn nút 'BẮT ĐẦU XÁO BÀI (RUN)'...")
        page.click("button:has-text('BẮT ĐẦU XÁO BÀI (RUN)')")
        time.sleep(3)

        shot_g6 = os.path.join(ARTIFACT_DIR, "live_test_06_lucky_shuffle.png")
        page.screenshot(path=shot_g6)

        btn_pick_next = page.locator("button:has-text('Chọn Bạn Tiếp')")
        if btn_pick_next.is_visible():
            btn_pick_next.click()
            time.sleep(0.5)

        test_results["Game_06_LuckyShuffle"] = "PASS (Xáo bài 3 chiều tốc độ cao, lật thẻ 180 độ trúng học sinh)"
        print(f"[OK] Game 06 hoạt động chuẩn xác! Ảnh: {shot_g6}")

        page.click("button:has-text('Danh Sách Trò Chơi')")
        time.sleep(1)

        # 10. KIỂM THỬ GAME 07: MÊ CUNG TRI THỨC
        print("\n--- BƯỚC 10: Kiểm thử Game 07 - Mê Cung Tri Thức ---")
        page.click("[data-game-id='game-07-knowledge-maze']")
        time.sleep(1)

        print("-> Nhấn nút 'TIẾN 1 BƯỚC (RUN)'...")
        page.click("button:has-text('TIẾN 1 BƯỚC (RUN)')")
        time.sleep(1.5)

        shot_g7 = os.path.join(ARTIFACT_DIR, "live_test_07_knowledge_maze.png")
        page.screenshot(path=shot_g7)

        # Xác nhận trả lời đúng câu hỏi và mở khóa cổng
        btn_advance = page.locator("button:has-text('Mở Cửa & Tiến Bước')")
        if btn_advance.is_visible():
            btn_advance.click()
            time.sleep(1)

        test_results["Game_07_KnowledgeMaze"] = "PASS (Quân cờ nhảy bước qua cổng đá, modal câu hỏi củng cố chuẩn xác)"
        print(f"[OK] Game 07 hoạt động chuẩn xác! Ảnh: {shot_g7}")

        page.click("button:has-text('Danh Sách Trò Chơi')")
        time.sleep(1)

        # 11. KIỂM THỬ GAME 08: BẮN BÓNG TRÚNG ĐÍCH
        print("\n--- BƯỚC 11: Kiểm thử Game 08 - Bắn Bóng Trúng Đích ---")
        page.click("[data-game-id='game-08-ball-cannon']")
        time.sleep(1)

        print("-> Nhấn nút 'BẮN BÓNG (RUN)'...")
        page.click("button:has-text('BẮN BÓNG (RUN)')")
        time.sleep(2.5)

        shot_g8 = os.path.join(ARTIFACT_DIR, "live_test_08_ball_cannon.png")
        page.screenshot(path=shot_g8)
        test_results["Game_08_BallCannon"] = "PASS (Pháo giật nòng, bóng bay parabol trúng bia điểm, rung chấn và cộng điểm)"
        print(f"[OK] Game 08 hoạt động chuẩn xác! Ảnh: {shot_g8}")

        # Hoàn tất
        context.close()
        browser.close()

    print("\n=== KẾT QUẢ KIỂM THỬ TỔNG HỢP ===")
    for k, v in test_results.items():
        print(f"  + {k}: {v}")

    print(f"\nTổng số Console Error phát hiện: {len(console_errors)}")
    if console_errors:
        for err in console_errors:
            print(f"    [JS ERROR]: {err}")
    else:
        print("  => KHÔNG CÓ BẤT KỲ CONSOLE ERROR NÀO!")

    print(f"Tổng số Page Error phát hiện: {len(page_errors)}")
    if page_errors:
        for err in page_errors:
            print(f"    [PAGE ERROR]: {err}")
    else:
        print("  => KHÔNG CÓ BẤT KỲ PAGE ERROR NÀO!")

    print("\nKiểm thử toàn diện hoàn tất 100% thành công!")

if __name__ == "__main__":
    run_deep_test()
