import os
import time
import pytest
from multidisk_filebalancer import _create_webpanel_app, _save_config_to_disk, _normalize_config_for_runtime

@pytest.fixture
def app():
    webpanel_app = _create_webpanel_app()
    webpanel_app.config['TESTING'] = True
    return webpanel_app

@pytest.fixture
def client(app):
    return app.test_client()

def test_unauthenticated_access_denied(client):
    res = client.get('/', follow_redirects=False)
    assert res.status_code in (302, 303)
    assert '/login' in res.location

    res = client.get('/panel', follow_redirects=False)
    assert res.status_code in (302, 303)
    assert '/login' in res.location

    res = client.get('/api/config')
    assert res.status_code == 401
    assert res.get_json() == {"error": "Unauthorized"}

    res = client.get('/api/stats')
    assert res.status_code == 401
    assert res.get_json() == {"error": "Unauthorized"}

def test_public_routes_allowed(client):
    res = client.get('/webpanel.css')
    assert res.status_code == 200

    res = client.get('/webpanel.js')
    assert res.status_code == 200

    res = client.get('/login')
    assert res.status_code == 200

def test_login_invalid_credentials(client):
    res = client.post('/login', json={"username": "wronguser", "password": "wrongpassword"})
    assert res.status_code == 401
    assert "error" in res.get_json()

def test_login_and_authenticated_access(client):
    res = client.post('/login', json={"username": "admin", "password": "changeme"})
    assert res.status_code == 200
    data = res.get_json()
    assert data.get("success") is True

    res = client.get('/panel', follow_redirects=False)
    assert res.status_code == 200

    res = client.get('/api/config')
    assert res.status_code == 200

    res = client.get('/api/stats')
    assert res.status_code == 200

def test_logout(client):
    client.post('/login', json={"username": "admin", "password": "changeme"})
    res = client.get('/api/stats')
    assert res.status_code == 200

    res = client.post('/logout', json={})
    assert res.status_code == 200

    res = client.get('/api/stats')
    assert res.status_code == 401

def test_session_timeout_after_30_minutes(client):
    client.post('/login', json={"username": "admin", "password": "changeme"})
    res = client.get('/api/stats')
    assert res.status_code == 200

    with client.session_transaction() as sess:
        sess['login_time'] = time.time() - 1801

    res = client.get('/api/stats')
    assert res.status_code == 401
    assert res.get_json().get("error") == "Session expired"

def test_inactivity_timeout_after_30_minutes(client):
    client.post('/login', json={"username": "admin", "password": "changeme"})
    res = client.get('/api/stats')
    assert res.status_code == 200

    with client.session_transaction() as sess:
        sess['last_activity'] = time.time() - 1801

    res = client.get('/api/stats')
    assert res.status_code == 401
    assert res.get_json().get("error") == "Session expired"
