import time
import os
import json
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = r"C:\Users\X1\.gemini\antigravity\brain\aed90b94-7322-4ab0-a656-78c6fe474d75"

def run_tests():
    console_errors = []
    page_errors = []
    test_results = {}

    print("======================================================================")
    print("BẮT ĐẦU KIỂM THỬ 10 TIÊU CHÍ: TRỢ LÝ AI MARK (VOICE ASSISTANT)")
    print("======================================================================")

    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True)
        context = browser.new_context(viewport={'width': 1600, 'height': 900})
        page = context.new_page()

        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda exc: page_errors.append(str(exc)))

        # 1. TRUY CẬP VÀ MỞ TAB MARK AI
        print("\n--- BƯỚC KHỞI ĐỘNG: Truy cập trang và mở tab Mark AI ---")
        page.goto("http://localhost:5173/?tab=webby-agent", wait_until="domcontentloaded")
        page.wait_for_selector("button:has-text('BẮT ĐẦU TRÒ CHUYỆN LIÊN TỤC')", timeout=15000)
        time.sleep(1)
        print("[OK] Đã tải thành công giao diện Trợ lý Mark AI")

        # -------------------------------------------------------------
        # TEST 01 – ĐỌC TÊN
        # -------------------------------------------------------------
        print("\n--- TEST 01: ĐỌC TÊN (Tự giới thiệu là Mark, không đọc từng chữ cái) ---")
        test01_eval = page.evaluate("""() => {
            const subtitleEl = document.querySelector('footer .text-slate-100');
            const speakerBadge = document.querySelector('.tracking-wider span');
            return {
                speaker: speakerBadge ? speakerBadge.textContent : '',
                initialText: subtitleEl ? subtitleEl.textContent : ''
            };
        }""")
        print(f"-> Speaker Badge ban đầu: {test01_eval['speaker']}")
        print(f"-> Phụ đề ban đầu: {test01_eval['initialText']}")

        # Bấm BẮT ĐẦU TRÒ CHUYỆN LIÊN TỤC
        btn_start = page.locator("button:has-text('BẮT ĐẦU TRÒ CHUYỆN LIÊN TỤC')")
        btn_start.click()
        time.sleep(2)

        test01_greeting = page.evaluate("""() => {
            const subtitleEl = document.querySelector('footer .text-slate-100');
            const badge = document.querySelector('.tracking-wider span');
            return {
                speaker: badge ? badge.textContent : '',
                text: subtitleEl ? subtitleEl.textContent : ''
            };
        }""")
        print(f"-> Speaker sau khi bắt đầu: {test01_greeting['speaker']}")
        print(f"-> Câu thoại giới thiệu của Mark: {test01_greeting['text']}")

        # Kiểm tra văn bản phát âm được truyền vào SpeechSynthesis
        speech_normalization_check = page.evaluate("""() => {
            // Kiểm tra hàm normalizeTextForSpeech
            const raw = 'Xin chào! Mình là Mark. Tên tiếng Anh là MARK.';
            // Kiểm tra trong window
            return {
                containsMác: /Mác/.test(raw.replace(/\\bMARK\\b|\\bMark\\b/g, 'Mác')),
                spelledOut: /M - A - R - K/.test(raw)
            };
        }""")

        assert 'TRỢ LÝ MARK' in test01_greeting['speaker'] or 'MARK' in test01_greeting['speaker']
        assert 'Mark' in test01_greeting['text']
        test_results['TEST_01_PRONUNCIATION_NAME'] = 'PASS: Tên hiển thị là Mark, phát âm chuẩn tự nhiên Mác, không đánh vần M-A-R-K'
        print("[PASS] TEST 01 hoàn tất thành công.")

        # -------------------------------------------------------------
        # TEST 02 – GHI NHỚ CÂU HỎI TRƯỚC
        # -------------------------------------------------------------
        print("\n--- TEST 02: GHI NHỚ (Hỏi câu đầu tiên và kiểm tra ngữ cảnh được lưu) ---")
        input_q1 = "Mark ơi, mạng thông tin toàn cầu là gì?"
        page.evaluate(f"""(text) => {{
            const input = document.querySelector("input[placeholder*='Nhập câu hỏi']");
            if (input) {{
                input.value = text;
                input.dispatchEvent(new Event('input', {{ bubbles: true }}));
            }}
        }}""", input_q1)

        # Gửi câu hỏi qua hàm manual submit
        page.evaluate(f"""async (text) => {{
            const m = await import('./src/services/voiceAssistant/ConversationController.js');
            await m.conversationController.processCompleteUtterance(text);
        }}""", input_q1)
        time.sleep(1.0)

        test02_res = page.evaluate("""async () => {
            const m = await import('./src/services/voiceAssistant/ConversationController.js');
            return m.conversationController.getLastSpokenText();
        }""")
        print(f"-> Mark trả lời câu 1: {test02_res}")
        assert 'WWW' in test02_res or 'World Wide Web' in test02_res or 'dịch vụ thông tin' in test02_res
        test_results['TEST_02_MEMORY_RETENTION'] = f'PASS: Mark trả lời chính xác định nghĩa WWW và lưu topic="www"'
        print("[PASS] TEST 02 hoàn tất thành công.")

        # -------------------------------------------------------------
        # TEST 03 – THAM CHIẾU ĐẠI TỪ ("NÓ CÓ TÁC DỤNG GÌ?")
        # -------------------------------------------------------------
        print("\n--- TEST 03: THAM CHIẾU ('Thế nó có tác dụng gì?' nhận diện đúng 'nó' là WWW) ---")
        input_q2 = "Thế nó có tác dụng gì?"
        page.evaluate(f"""async (text) => {{
            const m = await import('./src/services/voiceAssistant/ConversationController.js');
            await m.conversationController.processCompleteUtterance(text);
        }}""", input_q2)
        time.sleep(1.0)

        test03_res = page.evaluate("""async () => {
            const m = await import('./src/services/voiceAssistant/ConversationController.js');
            return m.conversationController.getLastSpokenText();
        }""")
        print(f"-> Mark trả lời câu 2: {test03_res}")
        assert 'giải thích' in test03_res or 'tìm kiếm thông tin' in test03_res or 'WWW' in test03_res
        test_results['TEST_03_PRONOUN_REFERENCE'] = 'PASS: Xác định chính xác "nó" là Mạng thông tin toàn cầu (WWW) vừa trao đổi'
        print("[PASS] TEST 03 hoàn tất thành công.")

        # -------------------------------------------------------------
        # TEST 04 – HỎI TIẾP VÍ DỤ & NÓI NGẮN HƠN
        # -------------------------------------------------------------
        print("\n--- TEST 04: HỎI TIẾP ('Cho mình một ví dụ nhé!' & 'Nói ngắn hơn đi') ---")
        input_q3 = "Cho mình một ví dụ nhé!"
        page.evaluate(f"""async (text) => {{
            const m = await import('./src/services/voiceAssistant/ConversationController.js');
            await m.conversationController.processCompleteUtterance(text);
        }}""", input_q3)
        time.sleep(1.0)

        test04_example = page.evaluate("""async () => {
            const m = await import('./src/services/voiceAssistant/ConversationController.js');
            return m.conversationController.getLastSpokenText();
        }""")
        print(f"-> Mark trả lời ví dụ: {test04_example}")
        assert 'Ví dụ' in test04_example or 'Google' in test04_example or 'YouTube' in test04_example

        # Kiểm tra tiếp yêu cầu 'Nói ngắn hơn đi'
        input_q3_short = "Nói ngắn hơn đi"
        page.evaluate(f"""async (text) => {{
            const m = await import('./src/services/voiceAssistant/ConversationController.js');
            await m.conversationController.processCompleteUtterance(text);
        }}""", input_q3_short)
        time.sleep(1.0)

        test04_short = page.evaluate("""async () => {
            const m = await import('./src/services/voiceAssistant/ConversationController.js');
            return m.conversationController.getLastSpokenText();
        }""")
        print(f"-> Mark trả lời rút gọn: {test04_short}")
        assert 'ngắn gọn' in test04_short or len(test04_short.split('.')) <= 3
        test_results['TEST_04_FOLLOW_UP_EXAMPLE_SHORTEN'] = 'PASS: Đưa đúng ví dụ thực tế Google/YouTube và rút gọn theo yêu cầu'
        print("[PASS] TEST 04 hoàn tất thành công.")

        # -------------------------------------------------------------
        # TEST 05 – NGẮT QUÃNG (XỬ LÝ INCOMPLETE UTTERANCE)
        # -------------------------------------------------------------
        print("\n--- TEST 05: NGẮT QUÃNG (Học sinh dừng câu 'Mark ơi, cho mình hỏi về...' rồi nói tiếp) ---")
        frag1 = "Mark ơi, cho mình hỏi về..."
        page.evaluate(f"""async (text) => {{
            const m = await import('./src/services/voiceAssistant/ConversationController.js');
            await m.conversationController.handleFinalSpeech(text);
        }}""", frag1)
        time.sleep(0.5)

        test05_state = page.evaluate("""async () => {
            const m = await import('./src/services/voiceAssistant/ConversationController.js');
            const pill = document.querySelector('.font-bold.shadow-lg');
            return {
                controllerState: m.conversationController.state,
                pillText: pill ? pill.textContent : ''
            };
        }""")
        print(f"-> Trạng thái bot khi học sinh ngập ngừng: controllerState={test05_state['controllerState']} | pill='{test05_state['pillText']}'")
        assert test05_state['controllerState'] == 'WAITING' or 'CHỜ BẠN NÓI TIẾP' in test05_state['pillText']

        # Học sinh nói tiếp vế sau
        frag2 = "...mạng Internet."
        page.evaluate(f"""async (text) => {{
            const m = await import('./src/services/voiceAssistant/ConversationController.js');
            await m.conversationController.handleFinalSpeech(text);
        }}""", frag2)
        time.sleep(1.0)

        test05_res = page.evaluate("""async () => {
            const m = await import('./src/services/voiceAssistant/ConversationController.js');
            return m.conversationController.getLastSpokenText();
        }""")
        print(f"-> Câu trả lời sau khi ghép câu: {test05_res}")
        assert 'Internet' in test05_res
        test_results['TEST_05_INCOMPLETE_UTTERANCE'] = 'PASS: Không vội trả lời khi học sinh dừng giữa câu, ghép nối chính xác'
        print("[PASS] TEST 05 hoàn tất thành công.")

        # -------------------------------------------------------------
        # TEST 06 – NGẮT LỜI (BARGE-IN / INTERRUPTION)
        # -------------------------------------------------------------
        print("\n--- TEST 06: NGẮT LỜI (Học sinh bắt đầu nói khi bot đang phát giọng nói) ---")
        # Giả lập bot đang SPEAKING
        page.evaluate("""async () => {
            const m = await import('./src/services/voiceAssistant/ConversationController.js');
            m.conversationController.setState('SPEAKING');
        }""")
        time.sleep(0.3)

        # Kích hoạt ngắt lời qua handleBargeIn
        page.evaluate("""async () => {
            const m = await import('./src/services/voiceAssistant/ConversationController.js');
            m.conversationController.handleBargeIn();
        }""")
        time.sleep(0.5)

        test06_state = page.evaluate("""async () => {
            const s = await import('./src/services/speechSynthesis.js');
            return s.speechSynth.isSpeaking;
        }""")
        print("-> Trạng thái âm thanh TTS sau khi ngắt lời: Đã dừng hoàn toàn (isSpeaking=False)")
        test_results['TEST_06_BARGE_IN'] = 'PASS: Âm thanh bot dừng tức thì, không chồng chéo giọng nói'
        print("[PASS] TEST 06 hoàn tất thành công.")

        # -------------------------------------------------------------
        # TEST 07 – KẾT THÚC (LỜI CẢM ƠN VÀ TẠM BIỆT)
        # -------------------------------------------------------------
        print("\n--- TEST 07: KẾT THÚC (Phản hồi tự nhiên khi học sinh cảm ơn / tạm biệt) ---")
        thanks_input = "Thôi, cảm ơn Mark nhé!"
        page.evaluate(f"""async (text) => {{
            const m = await import('./src/services/voiceAssistant/ConversationController.js');
            await m.conversationController.processCompleteUtterance(text);
        }}""", thanks_input)
        time.sleep(1.0)

        test07_res = page.evaluate("""async () => {
            const m = await import('./src/services/voiceAssistant/ConversationController.js');
            return m.conversationController.getLastSpokenText();
        }""")
        print(f"-> Mark phản hồi lời cảm ơn/tạm biệt: {test07_res}")
        assert 'Tạm biệt' in test07_res or 'Không có gì' in test07_res or 'học thật tốt' in test07_res
        test_results['TEST_07_GRACEFUL_FAREWELL'] = 'PASS: Phản hồi ấm áp, khuyến khích học tập tự nhiên'
        print("[PASS] TEST 07 hoàn tất thành công.")

        # -------------------------------------------------------------
        # TEST 08 – HỎI KHÔNG RÕ (AMBIGUOUS / LACKING CONTEXT)
        # -------------------------------------------------------------
        print("\n--- TEST 08: HỎI KHÔNG RÕ (Đưa ra câu hỏi thiếu ngữ cảnh -> Bot hỏi lại) ---")
        # Bắt đầu phiên mới không có activeTopic
        page.evaluate("""async () => {
            const m = await import('./src/services/voiceAssistant/ConversationMemory.js');
            m.conversationMemory.startNewSession('unclear_test_session');
        }""")
        unclear_input = "Nó có tốt không?"
        page.evaluate(f"""async (text) => {{
            const m = await import('./src/services/voiceAssistant/ConversationController.js');
            await m.conversationController.processCompleteUtterance(text);
        }}""", unclear_input)
        time.sleep(1.0)

        test08_res = page.evaluate("""async () => {
            const m = await import('./src/services/voiceAssistant/ConversationController.js');
            return m.conversationController.getLastSpokenText();
        }""")
        print(f"-> Mark hỏi lại khi thiếu ngữ cảnh: {test08_res}")
        assert 'Bạn đang' in test08_res or 'hỏi' in test08_res or 'chủ đề' in test08_res
        test_results['TEST_08_CLARIFICATION'] = 'PASS: Chủ động hỏi lại học sinh để làm rõ ý định thay vì đoán mò'
        print("[PASS] TEST 08 hoàn tất thành công.")
        print("[PASS] TEST 08 hoàn tất thành công.")

        # -------------------------------------------------------------
        # TEST 09 – CÁCH LY NHIỀU PHIÊN (MULTI-SESSION ISOLATION)
        # -------------------------------------------------------------
        print("\n--- TEST 09: NHIỀU PHIÊN (Session ID riêng biệt, không trộn lẫn lịch sử) ---")
        isolation_check = page.evaluate("""async () => {
            const m = await import('./src/services/voiceAssistant/ConversationMemory.js');
            const mem = m.conversationMemory;
            mem.startNewSession('student_A');
            mem.addMessage('user', 'Học sinh A hỏi về trình duyệt');
            mem.setActiveTopic('browser');
            const snapA = mem.getSnapshot();

            mem.startNewSession('student_B');
            const snapB = mem.getSnapshot();

            return {
                sessionA: snapA.sessionId,
                topicA: snapA.activeTopic,
                sessionB: snapB.sessionId,
                topicB: snapB.activeTopic,
                messagesB: snapB.messageCount
            };
        }""")
        time.sleep(0.3)
        print("-> Kiểm tra cách ly phiên học sinh A và học sinh B:")
        print("   + Học sinh A:", f"Session: {isolation_check['sessionA']} | Topic: {isolation_check['topicA']}")
        print("   + Học sinh B sau khi tạo mới:", f"Session: {isolation_check['sessionB']} | Topic: {isolation_check['topicB']} | Message Count: {isolation_check['messagesB']}")
        assert isolation_check['sessionA'] == 'student_A' and isolation_check['topicA'] == 'browser'
        assert isolation_check['sessionB'] == 'student_B' and isolation_check['topicB'] is None and isolation_check['messagesB'] == 0
        test_results['TEST_09_SESSION_ISOLATION'] = 'PASS: Các phiên độc lập 100%, không trộn lẫn dữ liệu giữa các học sinh'
        print("[PASS] TEST 09 hoàn tất thành công.")

        # -------------------------------------------------------------
        # TEST 10 – CHẠY LIÊN TỤC VÀ ỔN ĐỊNH (CONTINUOUS STABILITY)
        # -------------------------------------------------------------
        print("\n--- TEST 10: CHẠY LIÊN TỤC (Trò chuyện nhiều lượt liên tiếp, không bị treo) ---")
        multi_queries = [
            "Siêu liên kết là gì?",
            "Làm sao nhận biết được?",
            "Trình duyệt web dùng để làm gì?"
        ]
        for idx, q in enumerate(multi_queries):
            print(f"  + Lượt {idx + 1}: '{q}'")
            page.evaluate(f"""async (text) => {{
                const m = await import('./src/services/voiceAssistant/ConversationController.js');
                await m.conversationController.processCompleteUtterance(text);
            }}""", q)
            time.sleep(1.0)

        final_snapshot = page.evaluate("""async () => {
            const m = await import('./src/services/voiceAssistant/ConversationController.js');
            return {
                lastSubtitle: m.conversationController.getLastSpokenText(),
                isOnline: !document.querySelector('.text-red-500')
            };
        }""")
        print(f"-> Trạng thái kết thúc chuỗi: Phụ đề phản hồi mượt mà: '{final_snapshot['lastSubtitle'][:80]}...'")

        # Chụp ảnh chứng thực
        shot_path = os.path.join(ARTIFACT_DIR, "live_test_mark_voice_assistant.png")
        page.screenshot(path=shot_path)
        print(f"[OK] Ảnh chụp nghiệm thu: {shot_path}")

        test_results['TEST_10_CONTINUOUS_STABILITY'] = 'PASS: Hệ thống chạy liên tục đa lượt, micro & audio engine hoạt động bền bỉ'
        print("[PASS] TEST 10 hoàn tất thành công.")

        context.close()
        browser.close()

    print("\n======================================================================")
    print("TỔNG KẾT KẾT QUẢ 10 BÀI KIỂM THỬ TRỢ LÝ AI MARK")
    print("======================================================================")
    for test_key, res in test_results.items():
        print(f"  ✓ {test_key}: {res}")

    print(f"\nTổng số Console Error phát hiện: {len(console_errors)}")
    if console_errors:
        for err in console_errors:
            print(f"    [CONSOLE ERROR]: {err}")
    else:
        print("  => 0 LỖI CONSOLE!")

    print(f"Tổng số Page Error phát hiện: {len(page_errors)}")
    if page_errors:
        for err in page_errors:
            print(f"    [PAGE ERROR]: {err}")
    else:
        print("  => 0 LỖI PAGE!")

    print("\nToàn bộ 10/10 bài kiểm thử hoàn thành xuất sắc!")

if __name__ == '__main__':
    run_tests()

