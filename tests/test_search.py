import pytest
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from api.models import User


@pytest.fixture
def auth_client(user):
    token = Token.objects.create(user=user)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
    return client


@pytest.mark.django_db
def test_search_finds_user_by_email(auth_client):
    User.objects.create(
        username='friend', email='friend@mail.ru',
        first_name='F', last_name='F',
    )
    resp = auth_client.get('/api/search/', {'email': 'friend@mail.ru'})
    assert resp.status_code == status.HTTP_200_OK
    assert resp.data['count'] == 1
    assert len(resp.data['results']) == 1
    # UserShortSerializer — без email
    assert 'email' not in resp.data['results'][0]


@pytest.mark.django_db
def test_search_excludes_self(auth_client):
    # user из conftest имеет email 'test@mail.ru'
    resp = auth_client.get('/api/search/', {'email': 'test@mail.ru'})
    assert resp.status_code == status.HTTP_200_OK
    assert resp.data['results'] == []
    assert resp.data['count'] == 0


@pytest.mark.django_db
def test_search_without_email_returns_empty(auth_client):
    resp = auth_client.get('/api/search/')
    assert resp.status_code == status.HTTP_200_OK
    assert resp.data['results'] == []
    assert resp.data['count'] == 0


@pytest.mark.django_db
def test_search_requires_auth(db):
    client = APIClient()
    resp = client.get('/api/search/', {'email': 'test@mail.ru'})
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED
