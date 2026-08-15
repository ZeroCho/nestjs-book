from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


TARGET_SIZE = (1920, 1080)
BACKGROUND = "#0B1020"
EXPECTED_ASSET_COUNT = 60


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--contact-sheet", type=Path, required=True)
    return parser.parse_args()


def normalize_image(path: Path) -> None:
    with Image.open(path) as source:
        source.load()
        image = source.convert("RGB")
    if image.size == TARGET_SIZE:
        return
    contained = ImageOps.contain(image, TARGET_SIZE, Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", TARGET_SIZE, BACKGROUND)
    left = (TARGET_SIZE[0] - contained.width) // 2
    top = (TARGET_SIZE[1] - contained.height) // 2
    canvas.paste(contained, (left, top))
    canvas.save(path, "PNG", optimize=True)


def build_contact_sheet(paths: list[Path], output: Path) -> None:
    columns = 6
    thumb_width = 320
    thumb_height = 180
    caption_height = 34
    rows = (len(paths) + columns - 1) // columns
    sheet = Image.new(
        "RGB",
        (columns * thumb_width, rows * (thumb_height + caption_height)),
        BACKGROUND,
    )
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default(size=14)

    for index, path in enumerate(paths):
        row, column = divmod(index, columns)
        x = column * thumb_width
        y = row * (thumb_height + caption_height)
        with Image.open(path) as source:
            preview = ImageOps.fit(
                source.convert("RGB"),
                (thumb_width, thumb_height),
                method=Image.Resampling.LANCZOS,
            )
        sheet.paste(preview, (x, y))
        caption = path.name
        if len(caption) > 42:
            caption = f"{caption[:39]}..."
        draw.text((x + 8, y + thumb_height + 8), caption, fill="#E8EDF7", font=font)

    output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(output, "PNG", optimize=True)


def main() -> int:
    args = parse_args()
    manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    assets = manifest.get("assets", [])
    filenames = [asset["filename"] for asset in assets]

    if len(assets) != EXPECTED_ASSET_COUNT:
        print(f"manifest asset count: {len(assets)}; expected: {EXPECTED_ASSET_COUNT}")
        return 1
    if len(set(filenames)) != EXPECTED_ASSET_COUNT:
        print("manifest contains duplicate filenames")
        return 1

    paths = [args.root / filename for filename in filenames]
    missing = [path for path in paths if not path.is_file()]
    if missing:
        print(f"missing assets: {len(missing)}")
        for path in missing:
            print(path)
        return 1

    for path in paths:
        try:
            normalize_image(path)
        except Exception as error:
            print(f"unreadable asset: {path}: {error}")
            return 1

    invalid_sizes = []
    for path in paths:
        with Image.open(path) as image:
            if image.size != TARGET_SIZE:
                invalid_sizes.append((path, image.size))
    if invalid_sizes:
        for path, size in invalid_sizes:
            print(f"wrong size: {path}: {size}")
        return 1

    build_contact_sheet(paths, args.contact_sheet)

    totals = Counter(asset["chapter"] for asset in assets)
    chapter_total = sum(count for chapter, count in totals.items() if chapter != "common")
    common_total = totals["common"]
    for chapter in sorted(totals, key=lambda value: (value == "common", value)):
        print(f"{chapter}: {totals[chapter]}")
    print(f"chapter assets: {chapter_total}")
    print(f"common assets: {common_total}")
    print(f"{len(paths)}/{EXPECTED_ASSET_COUNT} assets present")
    print("all assets: 1920x1080")
    return 0


if __name__ == "__main__":
    sys.exit(main())
