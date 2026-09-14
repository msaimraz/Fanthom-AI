import sys
import os
import json
import re
import threading
from datetime import datetime, timezone

def read_stdin_timeout(timeout=0.5):
    res = []
    def target():
        try:
            res.append(sys.stdin.read())
        except Exception:
            pass
    t = threading.Thread(target=target)
    t.daemon = True
    t.start()
    t.join(timeout)
    return res[0] if res else ""

def find_repo_root(start_dir):
    current = os.path.abspath(start_dir)
    while True:
        if os.path.exists(os.path.join(current, ".git")) or os.path.exists(os.path.join(current, ".agents")):
            return current
        parent = os.path.dirname(current)
        if parent == current:
            break
        current = parent
    return os.path.abspath(start_dir)

def extract_prompt_text(content):
    if not content:
        return ""
    # Extract inside <USER_REQUEST>...</USER_REQUEST> if present
    match = re.search(r'<USER_REQUEST>(.*?)</USER_REQUEST>', content, re.DOTALL)
    if match:
        text = match.group(1)
        if text.startswith("\r\n"):
            text = text[2:]
        elif text.startswith("\n"):
            text = text[1:]
        if text.endswith("\r\n"):
            text = text[:-2]
        elif text.endswith("\n"):
            text = text[:-1]
        return text
    return content.strip()

def extract_response_text(step):
    if not step:
        return ""
    content = step.get("content", "")
    return content.strip()

def resolve_model_name(payload, steps):
    model = payload.get("modelName")
    if model and model != "auto":
        return model
    for step in steps:
        c = step.get("content", "")
        if "Gemini 3.8 Flash (High)" in c or "gemini-3.8-flash-high" in c:
            return "gemini-3.8-flash-high"
        if "Gemini 3.7 Flash" in c or "gemini-3.7-flash" in c:
            return "gemini-3.7-flash-high"
    return "gemini-3.8-flash-high"

def update_capture_test_report(repo_root, short_id, exchanges, filename, model_name):
    if short_id == "22f678b2":
        return
    report_path = os.path.join(repo_root, "CAPTURE-TEST.md")
    if not os.path.exists(report_path):
        return
    try:
        with open(report_path, "r", encoding="utf-8") as cf:
            ct_content = cf.read()

        ct_content = re.sub(
            r"- \*\*Session 2 Log File\*\*: .*",
            f"- **Session 2 Log File**: `.agent-logs/{filename}`",
            ct_content
        )

        if exchanges:
            p_step = exchanges[0]["prompt"]
            r_step = exchanges[0].get("response")
            p_time = p_step.get("created_at", "")
            p_text = extract_prompt_text(p_step.get("content", ""))

            s2_block = [
                f"#### Session 2 (`{short_id}`)",
                "```",
                f"[LOG_ENTRY type=PROMPT num=1 session={short_id}]",
                f"timestamp: {p_time}",
                f"model: {model_name}",
                "",
                p_text,
                "",
                ""
            ]
            if r_step:
                r_time = r_step.get("created_at", "")
                r_text = extract_response_text(r_step)
                s2_block.extend([
                    f"[LOG_ENTRY type=RESPONSE num=1 session={short_id}]",
                    f"timestamp: {r_time}",
                    f"model: {model_name}",
                    "",
                    r_text,
                    ""
                ])
            s2_block.append("```")
            new_s2_section = "\n".join(s2_block)

            pattern = r"#### Session 2.*?(?=\n## 5\.|\Z)"
            ct_content = re.sub(pattern, new_s2_section + "\n\n", ct_content, flags=re.DOTALL)

        with open(report_path, "w", encoding="utf-8") as cf:
            cf.write(ct_content)
    except Exception:
        pass

def main():
    payload = {}
    stdin_data = read_stdin_timeout(0.5)
    if stdin_data.strip():
        try:
            payload = json.loads(stdin_data)
        except Exception:
            pass

    workspace_paths = payload.get("workspacePaths", [])
    if workspace_paths and os.path.exists(workspace_paths[0]):
        repo_root = os.path.abspath(workspace_paths[0])
    else:
        repo_root = find_repo_root(os.path.dirname(__file__))

    transcript_path = payload.get("transcriptPath")
    conversation_id = payload.get("conversationId")

    if not transcript_path or not os.path.exists(transcript_path):
        brain_dir = os.path.expanduser(r"~\.gemini\antigravity\brain")
        if conversation_id and os.path.exists(os.path.join(brain_dir, conversation_id, ".system_generated", "logs", "transcript_full.jsonl")):
            transcript_path = os.path.join(brain_dir, conversation_id, ".system_generated", "logs", "transcript_full.jsonl")
        elif os.path.exists(brain_dir):
            candidates = []
            for entry in os.listdir(brain_dir):
                full_log = os.path.join(brain_dir, entry, ".system_generated", "logs", "transcript_full.jsonl")
                if os.path.exists(full_log):
                    candidates.append((os.path.getmtime(full_log), entry, full_log))
            if candidates:
                candidates.sort(key=lambda x: x[0], reverse=True)
                conversation_id = candidates[0][1]
                transcript_path = candidates[0][2]

    if not transcript_path or not os.path.exists(transcript_path):
        print(json.dumps({"decision": "allow"}))
        return

    dir_name = os.path.dirname(transcript_path)
    full_path = os.path.join(dir_name, "transcript_full.jsonl")
    target_path = full_path if os.path.exists(full_path) else transcript_path

    if not conversation_id:
        parts = os.path.normpath(target_path).split(os.sep)
        for i, part in enumerate(parts):
            if part == "brain" and i + 1 < len(parts):
                conversation_id = parts[i + 1]
                break
        if not conversation_id:
            conversation_id = "unknown-session"

    short_id = conversation_id[:8]

    lines = []
    try:
        with open(target_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
    except Exception:
        print(json.dumps({"decision": "allow"}))
        return

    steps = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        try:
            steps.append(json.loads(line))
        except Exception:
            continue

    if not steps:
        print(json.dumps({"decision": "allow"}))
        return

    exchanges = []
    current_prompt = None
    current_responses = []

    for step in steps:
        step_type = step.get("type")
        source = step.get("source")

        if step_type == "USER_INPUT" or source == "USER_EXPLICIT":
            if current_prompt is not None:
                final_resp = None
                for r in reversed(current_responses):
                    if r.get("source") == "MODEL" and r.get("type") == "PLANNER_RESPONSE" and r.get("content"):
                        final_resp = r
                        break
                exchanges.append({
                    "prompt": current_prompt,
                    "response": final_resp
                })
                current_responses = []
            current_prompt = step
        else:
            if current_prompt is not None:
                current_responses.append(step)

    if current_prompt is not None:
        final_resp = None
        for r in reversed(current_responses):
            if r.get("source") == "MODEL" and r.get("type") == "PLANNER_RESPONSE" and r.get("content"):
                final_resp = r
                break
        exchanges.append({
            "prompt": current_prompt,
            "response": final_resp
        })

    if not exchanges:
        print(json.dumps({"decision": "allow"}))
        return

    model_name = resolve_model_name(payload, steps)
    first_prompt_time = exchanges[0]["prompt"].get("created_at", datetime.now(timezone.utc).isoformat())
    last_prompt_time = exchanges[-1]["prompt"].get("created_at", first_prompt_time)

    date_str = first_prompt_time[:10]
    time_str = first_prompt_time[11:19].replace(":", "-")
    filename = f"{date_str}_{time_str}_{short_id}.md"

    log_dir = os.path.join(repo_root, ".agent-logs")
    os.makedirs(log_dir, exist_ok=True)
    out_file = os.path.join(log_dir, filename)

    author = "msaimraz"
    project = "Fanthom-AI"
    tool = "google-antigravity-ide"

    lines_out = []
    lines_out.append("---")
    lines_out.append(f"session_id: {conversation_id}")
    lines_out.append(f"date: {date_str}")
    lines_out.append(f"author: {author}")
    lines_out.append(f"model: {model_name}")
    lines_out.append(f"tool: {tool}")
    lines_out.append(f"project: {project}")
    lines_out.append(f"total_exchanges: {len(exchanges)}")
    lines_out.append(f"first_prompt_time: {first_prompt_time}")
    lines_out.append(f"last_prompt_time: {last_prompt_time}")
    lines_out.append("---")
    lines_out.append("")
    lines_out.append(f"# Session Log - {date_str}")
    lines_out.append("")
    lines_out.append(f"Session: `{short_id}` | Project: `{project}` | Author: `{author}`")
    lines_out.append("")
    lines_out.append("---")
    lines_out.append("")

    for i, ex in enumerate(exchanges, 1):
        p_step = ex["prompt"]
        r_step = ex.get("response")

        p_time = p_step.get("created_at", "")
        p_text = extract_prompt_text(p_step.get("content", ""))

        lines_out.append(f"[LOG_ENTRY type=PROMPT num={i} session={short_id}]")
        lines_out.append(f"timestamp: {p_time}")
        lines_out.append(f"model: {model_name}")
        lines_out.append("")
        lines_out.append(p_text)
        lines_out.append("")
        lines_out.append("")

        if r_step:
            r_time = r_step.get("created_at", "")
            r_text = extract_response_text(r_step)
            lines_out.append(f"[LOG_ENTRY type=RESPONSE num={i} session={short_id}]")
            lines_out.append(f"timestamp: {r_time}")
            lines_out.append(f"model: {model_name}")
            lines_out.append("")
            lines_out.append(r_text)
            lines_out.append("")
            lines_out.append("")

    content_str = "\n".join(lines_out).rstrip() + "\n"

    try:
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(content_str)
    except Exception:
        pass

    update_capture_test_report(repo_root, short_id, exchanges, filename, model_name)

    print(json.dumps({"decision": "allow"}))

if __name__ == "__main__":
    main()
