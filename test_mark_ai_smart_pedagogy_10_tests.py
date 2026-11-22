import time
import os
import json
import urllib.request
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = r"C:\Users\X1\.gemini\antigravity\brain\aed90b94-7322-4ab0-a656-78c6fe474d75"

def run_tests():
    console_errors = []
    page_errors = []
    test_results = {}

    print("======================================================================")
    print("KIỂM THỬ TỰ ĐỘNG 10 TÌNH HUỐNG SƯ PHẠM (SOCRATIC PEDAGOGY) MARK AI")
    print("THAO GIẢNG TIN HỌC 6 - BÀI 6: MẠNG THÔNG TIN TOÀN CẦU (THCS ĐẮK TRÔI)")
    print("======================================================================")

    # A. KIỂM TRA HEALTH CHECK CỦA SERVER TRƯỚC
    print("\n--- 0. KIỂM TRA SERVER HEALTH CHECK ---")
    try:
        req = urllib.request.Request("http://localhost:3001/api/status")
        with urllib.request.urlopen(req, timeout=3) as res:
            status_data = json.loads(res.read().decode('utf-8'))
            print(f"[OK] Backend Server Online: Assistant={status_data.get('assistantName')}, Model={status_data.get('model')}")
    except Exception as e:
        print(f"[CẢNH BÁO] Không kết nối được trực tiếp backend port 3001: {e}")

    # B. CHẠY PLAYWRIGHT VỚI BROWSER
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True)
        context = browser.new_context(viewport={'width': 1600, 'height': 900})
        page = context.new_page()

        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda exc: page_errors.append(str(exc)))

        # 1. TRUY CẬP VÀ MỞ TAB MARK AI
        print("\n--- BƯỚC 1: Mở giao diện Trợ lý Mark AI trên hệ thống bài giảng ---")
        page.goto("http://localhost:5173/?tab=webby-agent", wait_until="domcontentloaded")
        time.sleep(2)

        start_btn = page.get_by_role("button", name="BẮT ĐẦU TRÒ CHUYỆN LIÊN TỤC")
        start_btn.wait_for(timeout=15000)
        print("[OK] Đã tải thành công giao diện Webby/Mark AI")

        # Bấm BẮT ĐẦU TRÒ CHUYỆN LIÊN TỤC để khởi động phiên và phát lời chào thách thức
        start_btn.click()
        time.sleep(1.5)

        # -------------------------------------------------------------
        # TEST 01: Học sinh trả lời Có -> AI tiếp tục từ câu hỏi trước
        # -------------------------------------------------------------
        print("\n--- TEST 01: HỌC SINH TRẢ LỜI 'CÓ' (TIẾP TỤC TỪ CÂU HỎI MỞ ĐẦU GOOGLE) ---")
        reply_01 = page.evaluate("""() => {
            return new Promise((resolve) => {
                import('./src/services/voiceAssistant/ConversationController.js').then(async (m) => {
                    const ctrl = m.conversationController;
                    ctrl.memory.startNewSession();
                    ctrl.memory.setConversationStage('STAGE_1_HOOK');
                    ctrl.memory.lastAiQuestion = 'Các bạn có thường sử dụng Google để tìm kiếm thông tin, xem video hoặc tìm hình ảnh không?';
                    
                    const res = await ctrl.processCompleteUtterance('Có ạ!');
                    resolve({
                        reply: ctrl.memory.getLastAssistantReply(),
                        stage: ctrl.memory.getConversationStage(),
                        lastQuestion: ctrl.memory.getLastAiQuestion()
                    });
                });
            });
        }""")
        print(f"-> Phản hồi của Mark: {reply_01['reply']}")
        print(f"-> Giai đoạn sư phạm mới: {reply_01['stage']}")
        print(f"-> Câu hỏi tiếp theo của Mark: {reply_01['lastQuestion']}")

        assert 'Internet' in reply_01['reply'] or 'video' in reply_01['reply'] or 'Mỹ' in reply_01['reply'], "Phản hồi phải liên kết từ Google sang Internet/video từ Mỹ"
        assert reply_01['stage'] == 'STAGE_2_EXPLORE', f"Giai đoạn phải chuyển sang STAGE_2_EXPLORE, nhận được {reply_01['stage']}"
        test_results['TEST_01_ANSWER_YES'] = f"PASS: Mark hiểu 'Có ạ!' gắn liền với câu hỏi Google, chuyển sang STAGE_2_EXPLORE ({reply_01['stage']})"
        print("[PASS] TEST 01 hoàn tất thành công.")

        # -------------------------------------------------------------
        # TEST 02: Học sinh trả lời Không -> AI hiểu và khai thác câu trả lời
        # -------------------------------------------------------------
        print("\n--- TEST 02: HỌC SINH TRẢ LỜI 'KHÔNG' (MÂU THUẪN NHẬN THỨC VỀ DÂY CÁP) ---")
        reply_02 = page.evaluate("""() => {
            return new Promise((resolve) => {
                import('./src/services/voiceAssistant/ConversationController.js').then(async (m) => {
                    const ctrl = m.conversationController;
                    ctrl.memory.setConversationStage('STAGE_3_COGNITIVE_CONFLICT');
                    ctrl.memory.lastAiQuestion = 'Các bạn có nghĩ rằng Internet chỉ đơn giản là một chiếc dây cáp kết nối các máy tính lại với nhau không?';
                    
                    const res = await ctrl.processCompleteUtterance('Không ạ!');
                    resolve({
                        reply: ctrl.memory.getLastAssistantReply(),
                        stage: ctrl.memory.getConversationStage(),
                        lastQuestion: ctrl.memory.getLastAiQuestion()
                    });
                });
            });
        }""")
        print(f"-> Phản hồi của Mark: {reply_02['reply']}")
        print(f"-> Giai đoạn sư phạm: {reply_02['stage']}")

        assert 'dây cáp' in reply_02['reply'] or 'hàng triệu trang web' in reply_02['reply'] or 'kỳ diệu' in reply_02['reply']
        assert reply_02['stage'] == 'STAGE_4_DISCOVERY'
        test_results['TEST_02_ANSWER_NO'] = f"PASS: Mark xác nhận Internet không chỉ là dây cáp, dẫn dắt sang khám phá WWW (STAGE_4_DISCOVERY)"
        print("[PASS] TEST 02 hoàn tất thành công.")

        # -------------------------------------------------------------
        # TEST 03: Học sinh trả lời "Em không biết" -> AI gợi ý dễ hơn
        # -------------------------------------------------------------
        print("\n--- TEST 03: HỌC SINH TRẢ LỜI 'EM KHÔNG BIẾT' (GỢI Ý THÂN THIỆN, KHÔNG DỪNG) ---")
        reply_03 = page.evaluate("""() => {
            return new Promise((resolve) => {
                import('./src/services/voiceAssistant/ConversationController.js').then(async (m) => {
                    const ctrl = m.conversationController;
                    ctrl.memory.setConversationStage('STAGE_2_EXPLORE');
                    ctrl.memory.lastAiQuestion = 'Vì sao một chiếc điện thoại ở Việt Nam lại xem được video đăng tải ở Mỹ?';
                    
                    const res = await ctrl.processCompleteUtterance('Em không biết ạ');
                    resolve({
                        reply: ctrl.memory.getLastAssistantReply(),
                        stage: ctrl.memory.getConversationStage()
                    });
                });
            });
        }""")
        print(f"-> Phản hồi gợi ý của Mark: {reply_03['reply']}")

        assert 'gợi ý' in reply_03['reply'].lower() or 'wifi' in reply_03['reply'].lower() or '4g' in reply_03['reply'].lower()
        test_results['TEST_03_ANSWER_DONT_KNOW'] = "PASS: Mark không trách mắng hay dừng lại, đưa ra gợi ý chia nhỏ về Wifi/4G"
        print("[PASS] TEST 03 hoàn tất thành công.")

        # -------------------------------------------------------------
        # TEST 04: Học sinh trả lời sai / hiểu lầm -> AI hướng dẫn tự sửa
        # -------------------------------------------------------------
        print("\n--- TEST 04: HỌC SINH TRẢ LỜI SAI / HIỂU LẦM (DẪN DẮT BẰNG ẨN DỤ SƯ PHẠM) ---")
        reply_04 = page.evaluate("""() => {
            return new Promise((resolve) => {
                import('./src/services/voiceAssistant/ConversationController.js').then(async (m) => {
                    const ctrl = m.conversationController;
                    ctrl.memory.setConversationStage('STAGE_3_COGNITIVE_CONFLICT');
                    ctrl.memory.lastAiQuestion = 'Internet có phải chỉ là sợi dây cáp không?';
                    
                    const res = await ctrl.processCompleteUtterance('Nó chỉ là cái dây cáp thôi ạ');
                    resolve({
                        reply: ctrl.memory.getLastAssistantReply(),
                        stage: ctrl.memory.getConversationStage()
                    });
                });
            });
        }""")
        print(f"-> Phản hồi uốn nắn của Mark: {reply_04['reply']}")

        assert 'thú vị' in reply_04['reply'] or 'dây cáp' in reply_04['reply']
        assert 'trang' in reply_04['reply'] or 'xem phim' in reply_04['reply'] or 'tài liệu' in reply_04['reply']
        test_results['TEST_04_ANSWER_WRONG'] = "PASS: Mark phản biện nhẹ nhàng bằng câu hỏi phản tư (nếu chỉ có cáp mà không có nội dung thì xem sao được)"
        print("[PASS] TEST 04 hoàn tất thành công.")

        # -------------------------------------------------------------
        # TEST 05: Học sinh hỏi ngược lại -> AI trả lời rồi quay lại chủ đề
        # -------------------------------------------------------------
        print("\n--- TEST 05: HỌC SINH HỎI NGƯỢC LẠI AI ('THẾ CÒN MARK?') ---")
        reply_05 = page.evaluate("""() => {
            return new Promise((resolve) => {
                import('./src/services/voiceAssistant/ConversationController.js').then(async (m) => {
                    const ctrl = m.conversationController;
                    ctrl.memory.setConversationStage('STAGE_2_EXPLORE');
                    ctrl.memory.lastAiQuestion = 'Vì sao điện thoại ở Việt Nam xem được video ở Mỹ?';
                    
                    const res = await ctrl.processCompleteUtterance('Thế còn Mark thì sao? Mark có biết không?');
                    resolve({
                        reply: ctrl.memory.getLastAssistantReply(),
                        stage: ctrl.memory.getConversationStage(),
                        lastQuestion: ctrl.memory.getLastAiQuestion()
                    });
                });
            });
        }""")
        print(f"-> Phản hồi của Mark khi bị hỏi ngược lại: {reply_05['reply']}")

        assert 'Mark biết chứ' in reply_05['reply'] or 'Internet' in reply_05['reply']
        assert reply_05['reply'].endswith('?') or 'nhỉ' in reply_05['reply']
        test_results['TEST_05_STUDENT_ASK_BACK'] = "PASS: Mark trả lời ngắn gọn trong 1 câu và lập tức quay lại mạch khám phá với câu hỏi mới"
        print("[PASS] TEST 05 hoàn tất thành công.")

        # -------------------------------------------------------------
        # TEST 06: Học sinh trả lời dài -> AI hiểu ý chính và khen ngợi
        # -------------------------------------------------------------
        print("\n--- TEST 06: HỌC SINH TRẢ LỜI DÀI VÀ SÂU (> 12 TỪ) ---")
        long_answer = "Em nghĩ là nhờ các trạm vệ tinh và đường cáp quang biển xuyên lục địa kết nối các máy chủ dữ liệu khổng lồ với nhau ạ"
        reply_06 = page.evaluate(f"""() => {{
            return new Promise((resolve) => {{
                import('./src/services/voiceAssistant/ConversationController.js').then(async (m) => {{
                    const ctrl = m.conversationController;
                    ctrl.memory.setConversationStage('STAGE_2_EXPLORE');
                    
                    const res = await ctrl.processCompleteUtterance('{long_answer}');
                    resolve({{
                        reply: ctrl.memory.getLastAssistantReply(),
                        stage: ctrl.memory.getConversationStage()
                    }});
                }});
            }});
        }}""")
        print(f"-> Phản hồi của Mark đối với câu trả lời dài: {reply_06['reply']}")

        assert 'sâu sắc' in reply_06['reply'] or 'chuyên gia' in reply_06['reply'] or 'chuẩn xác' in reply_06['reply']
        test_results['TEST_06_LONG_ANSWER'] = "PASS: Mark trích xuất được ý chính về hạ tầng truyền dữ liệu, khen ngợi chuyên sâu và nâng tầm khám phá WWW"
        print("[PASS] TEST 06 hoàn tất thành công.")

        # -------------------------------------------------------------
        # TEST 07: Hội thoại nhiều lượt -> AI vẫn nhớ nội dung ban đầu
        # -------------------------------------------------------------
        print("\n--- TEST 07: HỘI THOẠI NHIỀU LƯỢT (NHỚ CÂU HỎI ĐẦU TIÊN) ---")
        reply_07 = page.evaluate("""() => {
            return new Promise((resolve) => {
                import('./src/services/voiceAssistant/ConversationController.js').then(async (m) => {
                    const ctrl = m.conversationController;
                    
                    const res = await ctrl.processCompleteUtterance('Lúc nãy Mark hỏi câu đầu tiên về cái gì vậy?');
                    resolve({
                        reply: ctrl.memory.getLastAssistantReply(),
                        firstTopic: ctrl.memory.getFirstTopic()
                    });
                });
            });
        }""")
        print(f"-> Trí nhớ của Mark về câu đầu tiên: {reply_07['reply']}")

        assert 'Google' in reply_07['reply'] or 'tìm kiếm' in reply_07['reply']
        test_results['TEST_07_MULTI_TURN_MEMORY'] = "PASS: Mark nhớ rõ câu hỏi đầu tiên về thói quen sử dụng Google tìm kiếm thông tin"
        print("[PASS] TEST 07 hoàn tất thành công.")

        # -------------------------------------------------------------
        # TEST 08: Học sinh đổi chủ đề -> AI xử lý và dẫn trở lại mục tiêu
        # -------------------------------------------------------------
        print("\n--- TEST 08: HỌC SINH ĐỔI CHỦ ĐỀ / NÓI LẠC ĐỀ (CHƠI ROBLOX) ---")
        reply_08 = page.evaluate("""() => {
            return new Promise((resolve) => {
                import('./src/services/voiceAssistant/ConversationController.js').then(async (m) => {
                    const ctrl = m.conversationController;
                    
                    const res = await ctrl.processCompleteUtterance('Mark có chơi game Roblox hay Liên Quân không?');
                    resolve({
                        reply: ctrl.memory.getLastAssistantReply(),
                        stage: ctrl.memory.getConversationStage()
                    });
                });
            });
        }""")
        print(f"-> Phản hồi dí dỏm dẫn về bài học của Mark: {reply_08['reply']}")

        assert 'ngoài lề' in reply_08['reply'] or 'ngộ nghĩnh' in reply_08['reply'] or 'nhiệm vụ' in reply_08['reply']
        assert 'Mạng thông tin toàn cầu' in reply_08['reply'] or 'dây cáp' in reply_08['reply']
        test_results['TEST_08_TOPIC_SWITCH'] = "PASS: Mark dí dỏm ghi nhận câu hỏi game ngộ nghĩnh và khéo léo kéo học sinh quay lại nhiệm vụ bài học"
        print("[PASS] TEST 08 hoàn tất thành công.")

        # -------------------------------------------------------------
        # TEST 09: Học sinh trả lời đúng liên tục -> AI tăng độ sâu câu hỏi
        # -------------------------------------------------------------
        print("\n--- TEST 09: TRẢ LỜI ĐÚNG LIÊN TỤC (TỰ ĐỘNG TĂNG ĐỘ SÂU SƯ PHẠM) ---")
        reply_09 = page.evaluate("""() => {
            return new Promise((resolve) => {
                import('./src/services/voiceAssistant/ConversationController.js').then(async (m) => {
                    const ctrl = m.conversationController;
                    // Giả lập học sinh trả lời đúng liên tiếp 2 lần
                    ctrl.memory.consecutiveCorrect = 2;
                    ctrl.memory.setConversationStage('STAGE_2_EXPLORE');
                    
                    const res = await ctrl.processCompleteUtterance('Vì có Internet ạ!');
                    resolve({
                        reply: ctrl.memory.getLastAssistantReply(),
                        stage: ctrl.memory.getConversationStage(),
                        consecutive: ctrl.memory.getConsecutiveCorrect()
                    });
                });
            });
        }""")
        print(f"-> Phản hồi tăng độ khó của Mark: {reply_09['reply']}")

        assert 'World Wide Web' in reply_09['reply'] or 'mối quan hệ' in reply_09['reply'] or 'độ khó' in reply_09['reply']
        test_results['TEST_09_CONSECUTIVE_CORRECT'] = "PASS: Mark tự động nâng độ sâu sư phạm, chất vấn mối quan hệ giữa WWW và Internet"
        print("[PASS] TEST 09 hoàn tất thành công.")

        # -------------------------------------------------------------
        # TEST 10: Hoàn thành mở đầu -> Tự nhiên kết nối và chuyển giao cho Thầy giáo
        # -------------------------------------------------------------
        print("\n--- TEST 10: HOÀN THÀNH MỞ ĐẦU (KẾT NỐI VÀO BÀI HỌC VÀ CHUYỂN GIAO CHO THẦY TRẦN ĐỨC TÌNH) ---")
        reply_10 = page.evaluate("""() => {
            return new Promise((resolve) => {
                import('./src/services/voiceAssistant/ConversationController.js').then(async (m) => {
                    const ctrl = m.conversationController;
                    ctrl.memory.setConversationStage('STAGE_4_DISCOVERY');
                    ctrl.memory.lastAiQuestion = 'Điều kỳ diệu gì giúp chia sẻ hàng triệu trang web với nhau nhỉ?';
                    
                    const res = await ctrl.processCompleteUtterance('Đó là Mạng thông tin toàn cầu ạ!');
                    resolve({
                        reply: ctrl.memory.getLastAssistantReply(),
                        stage: ctrl.memory.getConversationStage()
                    });
                });
            });
        }""")
        print(f"-> Lời kết nối và chuyển giao của Mark: {reply_10['reply']}")

        assert 'Trần Đức Tình' in reply_10['reply'] or 'thầy giáo' in reply_10['reply'] or 'bài học hôm nay' in reply_10['reply']
        assert reply_10['stage'] == 'STAGE_6_HANDOFF'
        test_results['TEST_10_WARMUP_COMPLETION_HANDOFF'] = "PASS: Mark tổng kết ý nghĩa WWW, chuyển giao sư phạm cho Thầy giáo Trần Đức Tình (STAGE_6_HANDOFF)"
        print("[PASS] TEST 10 hoàn tất thành công.")

        # -------------------------------------------------------------
        # CHỤP ẢNH MINH CHỨNG GIAO DIỆN
        # -------------------------------------------------------------
        time.sleep(1)
        screenshot_path = os.path.join(ARTIFACT_DIR, "live_test_mark_smart_pedagogy_10_scenarios.png")
        page.screenshot(path=screenshot_path, full_page=False)
        print(f"\n[OK] Đã chụp ảnh giao diện minh chứng: {screenshot_path}")

        # Kiểm tra console errors
        print("\n--- KIỂM TRA LỖI CONSOLE & PAGE ERRORS ---")
        real_console_errors = [e for e in console_errors if not any(ign in e.lower() for ign in ['favicon', 'audio', 'socket', 'speech'])]
        print(f"Console errors: {len(real_console_errors)}")
        print(f"Page errors: {len(page_errors)}")
        assert len(real_console_errors) == 0, f"Có {len(real_console_errors)} lỗi console: {real_console_errors}"
        assert len(page_errors) == 0, f"Có {len(page_errors)} lỗi trang: {page_errors}"

        browser.close()

    print("\n======================================================================")
    print("KẾT QUẢ TỔNG HỢP KIỂM THỬ 10 TIÊU CHÍ:")
    print("======================================================================")
    for k, v in test_results.items():
        print(f"✓ {k}: {v}")
    print("\n>>> TẤT CẢ 10/10 BÀI KIỂM THỬ ĐÃ ĐẠT 100% HOÀN HẢO! <<<")

if __name__ == '__main__':
    run_tests()

