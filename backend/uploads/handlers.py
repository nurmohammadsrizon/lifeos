import datetime
import json
import pathlib
import re
from typing import Any, Dict

from fastapi import UploadFile

from ..headers import files as header_files

BACKEND_DIR = pathlib.Path(__file__).resolve().parents[2]
UPLOADS_BASE_DIR = BACKEND_DIR / "uploads"
UPLOADS_FILES_DIR = UPLOADS_BASE_DIR / "files"
UPLOADS_USERS_DIR = UPLOADS_FILES_DIR / "users"
UPLOADS_DB_DIR = BACKEND_DIR / "uploads_db"

PROFILE_PICTURE_FIELD = "profile_picture"


def _normalize_user_folder_name(name: str) -> str:
    text = str(name or "").strip()
    if not text:
        return "guest"
    text = re.sub(r"@.*$", "", text)
    text = re.sub(r"[^a-zA-Z0-9_-]+", "_", text)
    return text or "guest"


def _resolve_username(identifier: str) -> str:
    identifier = str(identifier or "").strip()
    if not identifier:
        return "guest"

    user = header_files.find_user_by_email(identifier) or header_files.find_user_by_username(identifier)
    if user and user.get("username"):
        return _normalize_user_folder_name(user.get("username"))

    if "@" in identifier:
        return _normalize_user_folder_name(identifier.split("@", 1)[0])

    return _normalize_user_folder_name(identifier)


def _ensure_directories() -> None:
    UPLOADS_USERS_DIR.mkdir(parents=True, exist_ok=True)
    UPLOADS_DB_DIR.mkdir(parents=True, exist_ok=True)


def _metadata_path_for(username: str) -> pathlib.Path:
    _ensure_directories()
    return UPLOADS_DB_DIR / f"{username}.json"


def _read_metadata(username: str) -> Dict[str, Any]:
    path = _metadata_path_for(username)
    if not path.exists():
        return {"username": username, "files": []}

    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, dict):
                data.setdefault("username", username)
                data.setdefault("files", [])
                return data
    except (json.JSONDecodeError, OSError):
        pass

    return {"username": username, "files": []}


def _write_metadata(username: str, data: Dict[str, Any]) -> None:
    path = _metadata_path_for(username)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")


def _safe_file_name(original_name: str) -> str:
    base = pathlib.Path(original_name).stem
    ext = pathlib.Path(original_name).suffix
    if not base:
        base = "file"
    safe_base = re.sub(r"[^a-zA-Z0-9_-]+", "_", base)
    return f"{safe_base}{ext}"


def _unique_file_name(prefix: str, original_name: str) -> str:
    safe_base = _safe_file_name(original_name)
    timestamp = datetime.datetime.utcnow().strftime("%Y%m%d%H%M%S")
    return f"{prefix}_{timestamp}_{safe_base}"


async def _write_upload_file(destination: pathlib.Path, upload_file: UploadFile) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists():
        destination.unlink()

    contents = await upload_file.read()
    with open(destination, "wb") as out_file:
        out_file.write(contents)
    await upload_file.close()


def _resolve_real_path(relative_path: str) -> pathlib.Path:
    route_path = str(relative_path or "").strip()
    if route_path.startswith("http://") or route_path.startswith("https://"):
        return pathlib.Path("")
    route_path = route_path.lstrip("/")
    return BACKEND_DIR / route_path


def _is_internal_upload_path(relative_path: str) -> bool:
    route_path = str(relative_path or "").strip()
    return route_path.startswith("/uploads/files/users/") or route_path.startswith("uploads/files/users/")


async def save_user_upload(identifier: str, upload_file: UploadFile, field: str = "file") -> Dict[str, Any]:
    username = _resolve_username(identifier)
    user_dir = UPLOADS_USERS_DIR / username
    user_dir.mkdir(parents=True, exist_ok=True)

    original_name = pathlib.Path(upload_file.filename or "").name or "upload"
    if field == PROFILE_PICTURE_FIELD:
        ext = pathlib.Path(original_name).suffix or ".png"
        filename = PROFILE_PICTURE_FIELD + ext
        destination = user_dir / filename
        metadata = _read_metadata(username)

        for entry in list(metadata.get("files", [])):
            if entry.get("field") == PROFILE_PICTURE_FIELD:
                old_file = _resolve_real_path(entry.get("path", ""))
                if old_file.exists():
                    old_file.unlink()

        metadata["files"] = [entry for entry in metadata.get("files", []) if entry.get("field") != PROFILE_PICTURE_FIELD]
    else:
        filename = _unique_file_name(field, original_name)
        destination = user_dir / filename
        metadata = _read_metadata(username)

    await _write_upload_file(destination, upload_file)

    relative_path = f"/uploads/files/users/{username}/{filename}"
    entry = {
        "field": field,
        "filename": filename,
        "path": relative_path,
        "original_name": original_name,
        "uploaded_at": datetime.datetime.utcnow().isoformat() + "Z",
    }

    metadata.setdefault("files", [])
    metadata["files"].append(entry)
    _write_metadata(username, metadata)

    return {
        "success": True,
        "field": field,
        "filename": filename,
        "path": relative_path,
        "metadata": metadata,
    }


def get_user_upload_metadata(identifier: str) -> Dict[str, Any]:
    username = _resolve_username(identifier)
    return _read_metadata(username)
