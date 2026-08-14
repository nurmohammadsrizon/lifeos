import json

from backend.headers import files


def test_get_and_update_profile_persists_values(tmp_path, monkeypatch):
    db_dir = tmp_path / 'database'
    users_file = db_dir / 'sign_up.json'
    users_data_dir = db_dir / 'users_data'
    users_data_dir.mkdir(parents=True)
    users_file.write_text(json.dumps([
        {
            'id': 1,
            'email': 'alex@example.com',
            'username': 'alex',
            'fullname': 'Alex Carter',
            'password_hash': 'hash',
            'salt': 'salt',
        }
    ]), encoding='utf-8')

    monkeypatch.setattr(files, 'DATABASE_DIR', db_dir)
    monkeypatch.setattr(files, 'USERS_FILE', users_file)
    monkeypatch.setattr(files, 'USERS_DATA_DIR', users_data_dir)
    monkeypatch.setattr(files, 'FORMATTED_GOAL_FILE', db_dir / 'user_data' / 'formatted_goal.json')

    profile = files.get_profile_for_user('alex@example.com')
    assert profile['email'] == 'alex@example.com'
    assert profile['fullname'] == 'Alex Carter'

    updated = files.update_profile_for_user('alex@example.com', {
        'fullname': 'Alex Morgan',
        'username': 'alexm',
        'email': 'alexm@example.com',
        'password': 'newpass123',
        'bio': 'Product builder',
        'location': 'Dhaka',
        'phone': '+123456789',
        'website': 'https://example.com',
        'profile_picture': 'https://cdn.example.com/avatar.png',
    })

    assert updated['success'] is True
    assert updated['profile']['fullname'] == 'Alex Morgan'
    assert updated['profile']['email'] == 'alexm@example.com'

    saved_users = json.loads(users_file.read_text(encoding='utf-8'))
    assert saved_users[0]['email'] == 'alexm@example.com'
    assert saved_users[0]['fullname'] == 'Alex Morgan'
    assert saved_users[0]['username'] == 'alexm'
    assert saved_users[0]['password_hash'] != 'hash'
