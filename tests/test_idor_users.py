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
def test_cannot_patch_another_user(auth_client, db):
    victim = User.objects.create(
        username='victim', email='victim@mail.ru',
        first_name='V', last_name='V'
    )
    resp = auth_client.patch(
        f'/api/users/{victim.id}/', {'first_name': 'HACKED'}, format='json'
    )
    assert resp.status_code == status.HTTP_404_NOT_FOUND
    victim.refresh_from_db()
    assert victim.first_name == 'V'


@pytest.mark.django_db
def test_cannot_delete_another_user(auth_client, db):
    victim = User.objects.create(
        username='victim', email='victim@mail.ru',
        first_name='V', last_name='V'
    )
    resp = auth_client.delete(f'/api/users/{victim.id}/')
    assert resp.status_code == status.HTTP_404_NOT_FOUND
    assert User.objects.filter(pk=victim.pk).exists()
