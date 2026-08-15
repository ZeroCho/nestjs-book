from __future__ import annotations

import argparse
import json
from collections import OrderedDict
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    return parser.parse_args()


def code(value: str) -> str:
    return f"`{value.replace('`', '\\`')}`"


def main() -> int:
    args = parse_args()
    manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    assets = manifest["assets"]

    chapters: OrderedDict[str, list[dict]] = OrderedDict()
    for asset in assets:
        chapters.setdefault(asset["chapter"], []).append(asset)

    chapter_total = sum(len(items) for name, items in chapters.items() if name != "common")
    common_total = len(chapters.get("common", []))

    lines = [
        "# NestJS 9장 인포그래픽",
        "",
        f"총 {len(assets)}장: 챕터별 {chapter_total}장 + 공통 요약 {common_total}장.",
        "모든 이미지는 16:9, 1920×1080 PNG입니다.",
        "",
        "- [전체 콘택트시트](contact-sheet.png)",
        "- [자산 명세](manifest.json)",
        "- [생성·검증 계획](../../docs/superpowers/plans/2026-08-12-nestjs-chapter-9-infographics.md)",
        "- [디자인 명세](../../docs/superpowers/specs/2026-08-12-nestjs-chapter-9-infographics-design.md)",
        "",
        "## 시각 언어",
        "",
        "- Module: 보라, Controller: 하늘색, Provider/Service: 초록",
        "- Guard: 노랑, Pipe: 파랑, Interceptor: 분홍, Exception Filter: 빨강",
        "- Database/외부 시스템: 회색, Event/WebSocket: 청록",
        "- 실선: 실행 흐름, 점선: DI/설정, 물결선: Event/WebSocket, 빨간선: 예외",
        "",
        "## 프롬프트 재현 규칙",
        "",
        "각 이미지의 최종 프롬프트는 `manifest.json`의 `shared_prompt`에 해당 항목의 "
        "`objective`, `required_labels`, `flow`, `source_files`를 결합하고, 해당 챕터 코드에 없는 "
        "요소를 추가하지 않는 제약을 적용해 구성합니다.",
        "",
        "## 이미지 목록",
        "",
    ]

    for chapter, items in chapters.items():
        heading = "공통 요약" if chapter == "common" else chapter
        lines.extend([f"### {heading}", ""])
        for index, asset in enumerate(items, start=1):
            filename = asset["filename"]
            relative = filename.split("/", 1)[1] if chapter == "common" else filename.split("/", 1)[1]
            link = f"{chapter}/{relative}"
            source_text = ", ".join(code(path) for path in asset["source_files"])
            labels = " · ".join(asset["required_labels"])
            lines.extend(
                [
                    f"#### {index}. {asset['title']}",
                    "",
                    f"[이미지 열기]({link})",
                    "",
                    f"- 목적: {asset['objective']}",
                    f"- 흐름: {asset['flow']}",
                    f"- 필수 라벨: {labels}",
                    f"- 코드 근거: {source_text}",
                    "",
                ]
            )

    lines.extend(
        [
            "## 검증",
            "",
            "```powershell",
            "& 'C:\\Users\\speak\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe' `",
            "  infographics/ch9/tools/finalize.py `",
            "  --manifest infographics/ch9/manifest.json `",
            "  --root infographics/ch9 `",
            "  --contact-sheet infographics/ch9/contact-sheet.png",
            "```",
            "",
            "성공 기준: `60/60 assets present`, `all assets: 1920x1080`.",
            "",
        ]
    )

    args.output.write_text("\n".join(lines), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
