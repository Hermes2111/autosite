from __future__ import annotations

import csv
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware


def _project_root() -> Path:
    return Path(__file__).resolve().parents[1]


def _csv_path() -> Path:
    csv_env = os.getenv("AUTOSITE_COLLECTION_CSV")
    if csv_env:
        return Path(csv_env).expanduser().resolve()
    return _project_root() / "collection.csv"


def _normalize_column_name(name: str) -> str:
    return (
        name.strip()
        .lower()
        .replace("  ", " ")
        .replace(" ", "_")
        .replace("-", "_")
    )


def _load_collection() -> List[Dict[str, Any]]:
    csv_file = _csv_path()
    if not csv_file.exists():
        raise FileNotFoundError(f"CSV not found at {csv_file}")

    with csv_file.open(newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        rows = list(reader)

    if not rows:
        return []

    headers = rows[0]
    data_rows = rows[1:]

    # Some files contain duplicate header rows; drop any row that matches header
    data_rows = [r for r in data_rows if r and r[0] != headers[0]]

    # Normalize headers
    norm_headers = [_normalize_column_name(h) for h in headers]

    # Map rows to dicts with normalized keys
    records: List[Dict[str, Any]] = []
    for r in data_rows:
        record: Dict[str, Any] = {}
        for i, key in enumerate(norm_headers):
            value = r[i] if i < len(r) else ""
            record[key] = value
        records.append(record)

    # Rename known odd headers
    column_renames: Dict[str, str] = {
        "shipping__fees_not_included!": "shipping_fees_note",
        "afbeeldingen": "images",
    }
    for rec in records:
        for old, new in column_renames.items():
            if old in rec and new not in rec:
                rec[new] = rec.pop(old)

    # Ensure expected columns exist
    for rec in records:
        for required in ["year", "what", "scale", "specs", "numbers", "price"]:
            rec.setdefault(required, "")

        # Parse images column into list
        if "images" in rec and isinstance(rec["images"], str):
            val = rec["images"].strip()
            if val:
                rec["images"] = [p.strip() for p in val.split(",") if p.strip()]
            else:
                rec["images"] = []

    # Add a stable numeric id based on order
    for idx, rec in enumerate(records):
        rec["id"] = idx

    return records


def _record_public(rec: Dict[str, Any]) -> Dict[str, Any]:
    public: Dict[str, Any] = {
        "id": int(rec.get("id", 0)),
        "year": str(rec.get("year", "")),
        "what": str(rec.get("what", "")),
        "scale": str(rec.get("scale", "")),
        "specs": str(rec.get("specs", "")),
        "numbers": str(rec.get("numbers", "")),
        "price": str(rec.get("price", "")),
    }
    images_val = rec.get("images", [])
    public["images"] = images_val if isinstance(images_val, list) else []
    return public


app = FastAPI(title="autosite API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.get("/collection")
async def get_collection(
    q: Optional[str] = Query(default=None, description="Search term across key fields"),
    limit: int = Query(default=2000, ge=1, le=10000),
    offset: int = Query(default=0, ge=0),
) -> Dict[str, Any]:
    records = _load_collection()

    if q:
        needle = q.strip().lower()
        def match(rec: Dict[str, Any]) -> bool:
            return any(
                str(rec.get(field, "")).lower().find(needle) != -1
                for field in ("year", "what", "specs", "numbers")
            )
        records = [r for r in records if match(r)]

    total = len(records)
    window = records[offset : offset + limit]
    items = [_record_public(r) for r in window]
    return {"total": total, "count": len(items), "items": items}


@app.get("/collection/{item_id}")
async def get_item(item_id: int) -> Dict[str, Any]:
    records = _load_collection()
    for rec in records:
        if rec.get("id") == item_id:
            return _record_public(rec)
    raise HTTPException(status_code=404, detail="Item not found")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=False)
