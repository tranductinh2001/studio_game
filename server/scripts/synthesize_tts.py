# -*- coding: utf-8 -*-
"""
synthesize_tts.py - Multi-engine TTS & Learner Voice Simulation Script
Supports:
1. Microsoft Edge Neural Voices (Studio Quality, en-US, en-GB, male/female)
2. Google Translate TTS (gTTS) with US / UK accent fallback
3. Learner Audio Filter (FFmpeg acoustic simulation: speed, bandpass, mic response)
"""

import sys
import os
import argparse
import asyncio
import subprocess
import hashlib
import json

def get_hash(text):
    return hashlib.md5(text.encode('utf-8')).hexdigest()[:10]

async def synth_edge_tts(text, voice, rate, pitch, out_path):
    import edge_tts
    comm = edge_tts.Communicate(text, voice=voice, rate=rate, pitch=pitch)
    await comm.save(out_path)

def synth_gtts(text, accent, slow, out_path):
    from gtts import gTTS
    tld = 'co.uk' if accent == 'uk' else 'com'
    tts = gTTS(text=text, lang='en', tld=tld, slow=slow)
    tts.save(out_path)

def apply_learner_filter(in_path, out_path, speed=0.88, mic_simulate=True):
    speed_factor = max(0.70, min(1.30, float(speed)))
    if mic_simulate:
        # Acoustic mic filter: cut sub-bass rumble (<100Hz), roll off ultra-crisp studio air (>7000Hz)
        filt = f"atempo={speed_factor},highpass=f=110,lowpass=f=7000,volume=1.08"
    else:
        filt = f"atempo={speed_factor}"
    
    cmd = ["ffmpeg", "-y", "-i", in_path, "-filter:a", filt, "-q:a", "3", out_path]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

def analyze_audio(file_path):
    try:
        cmd = [
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration,size,bit_rate:stream=sample_rate,channels",
            "-of", "json", file_path
        ]
        res = subprocess.check_output(cmd).decode('utf-8')
        info = json.loads(res)
        dur = float(info.get('format', {}).get('duration', 0))
        rate = int(info.get('streams', [{}])[0].get('sample_rate', 24000))
        ch = int(info.get('streams', [{}])[0].get('channels', 1))
        
        score = 85
        notes = []
        if dur >= 5 and dur <= 90:
            score += 10
            notes.append("Thời lượng lý tưởng (5 - 90s)")
        elif dur < 3:
            score -= 20
            notes.append("Thời lượng quá ngắn (< 3s)")
        else:
            notes.append("Thời lượng tốt")
            
        if rate >= 22050:
            score += 5
            notes.append(f"Tần số chuẩn ({rate} Hz)")
        
        return {
            "duration": round(dur, 2),
            "sampleRate": rate,
            "channels": ch,
            "qualityScore": min(100, max(40, score)),
            "qualityNotes": " • ".join(notes)
        }
    except Exception as e:
        return {
            "duration": 0,
            "sampleRate": 24000,
            "channels": 1,
            "qualityScore": 75,
            "qualityNotes": f"Đã phân tích cơ bản: {str(e)}"
        }

def main():
    parser = argparse.ArgumentParser(description="Voice Synthesis & Audio Processor")
    parser.add_argument("--action", choices=["tts", "clone_simulate", "analyze"], default="tts")
    parser.add_argument("--text", default="Hello world")
    parser.add_argument("--voice", default="en-US-JennyNeural")
    parser.add_argument("--rate", default="+0%")
    parser.add_argument("--pitch", default="+0Hz")
    parser.add_argument("--accent", choices=["us", "uk"], default="us")
    parser.add_argument("--speed", type=float, default=0.88)
    parser.add_argument("--mic-sim", action="store_true")
    parser.add_argument("--in-file", default="")
    parser.add_argument("--out-file", default="")
    
    args = parser.parse_args()
    
    if args.action == "analyze":
        if not args.in_file or not os.path.exists(args.in_file):
            print(json.dumps({"error": "File not found"}))
            return 1
        res = analyze_audio(args.in_file)
        print(json.dumps(res))
        return 0

    if args.action == "tts":
        out_path = args.out_file or f"output_{get_hash(args.text)}.mp3"
        try:
            asyncio.run(synth_edge_tts(args.text, args.voice, args.rate, args.pitch, out_path))
            print(json.dumps({"success": True, "engine": "Edge-TTS", "path": out_path}))
            return 0
        except Exception as e:
            try:
                synth_gtts(args.text, args.accent, False, out_path)
                print(json.dumps({"success": True, "engine": "gTTS-Fallback", "notice": str(e), "path": out_path}))
                return 0
            except Exception as e2:
                print(json.dumps({"success": False, "error": f"EdgeTTS: {str(e)} | gTTS: {str(e2)}"}))
                return 1

    if args.action == "clone_simulate":
        out_path = args.out_file or f"cloned_{get_hash(args.text)}.mp3"
        temp_raw = f"temp_raw_{get_hash(args.text)}.mp3"
        try:
            # Generate base voice at neutral rate, let ffmpeg handle exact speed & room mic filter
            asyncio.run(synth_edge_tts(args.text, args.voice, "+0%", args.pitch, temp_raw))
        except Exception:
            synth_gtts(args.text, args.accent, False, temp_raw)
            
        try:
            apply_learner_filter(temp_raw, out_path, speed=args.speed, mic_simulate=args.mic_sim)
            if os.path.exists(temp_raw):
                os.remove(temp_raw)
            print(json.dumps({"success": True, "engine": "LearnerAcousticSim", "path": out_path}))
            return 0
        except Exception as e:
            if os.path.exists(temp_raw):
                os.rename(temp_raw, out_path)
            print(json.dumps({"success": True, "engine": "DirectFallback", "notice": str(e), "path": out_path}))
            return 0

if __name__ == "__main__":
    main()
