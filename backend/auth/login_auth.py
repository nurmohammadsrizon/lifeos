from ..headers import files


def checkUser(email: str, password: str) -> bool:
    """Return True if credentials match a registered user."""
    if not email or not password:
        return False
    return files.check_user_credentials(email, password)