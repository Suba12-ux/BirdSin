from django.http import Http404
from django.db.models import Count, Q, Max, F
from django.shortcuts import get_object_or_404
from djoser.views import UserViewSet as DjoserUserViewSet
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import (
    AllowAny, IsAuthenticatedOrReadOnly, IsAuthenticated
)
from rest_framework.response import Response

from api.models import (
    User, Subscription,
    Message, NewsUser
)
from api.paginations import (
    UserPagePagination, PageLimitPagination
)
from api.serializers import (
    UserSerializer, UserShortSerializer, SubscribeSerializer,
    MessageSerializer, NewsUserSerializer
)
from bird.constants import _OWNER_ONLY_ACTIONS


def annotate_user_with_chat_data(queryset, user):
    """
    Добавляет каждому пользователю:
    - last_message_time – дата последнего отправленного сообщения
      (макс created_at из sent_messages). NULL, если сообщений нет.
    - unread_count – количество непрочитанных сообщений, отправленных
      этому пользователю (user).

    Сортировка: сначала по убыванию unread_count, затем по убыванию
    last_message_time (NULLs last).
    """

    queryset = queryset.annotate(
        last_message_time=Max('sent_messages__created_at'),
        unread_count=Count(
            'sent_messages',
            filter=Q(
                sent_messages__recipient=user,
                sent_messages__is_read=False
            ),
            distinct=True
        )
    )
    return queryset


class UserViewSet(DjoserUserViewSet):
    """Вьюсет для пользователей."""

    serializer_class = UserSerializer
    pagination_class = UserPagePagination

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return User.objects.none()
        if self.action in _OWNER_ONLY_ACTIONS:
            return User.objects.filter(pk=user.pk)

        # Исключаем самого пользователя: он не должен видеть себя
        # в списке пользователей и в списке собеседников.
        queryset = annotate_user_with_chat_data(
            User.objects.exclude(pk=user.pk), user
        )

        # Для раздела чата (список собеседников): показываем только тех,
        # с кем уже есть переписка — хотя бы одно сообщение в любую сторону.
        # Пользователи, которым не писал сам пользователь и которые
        # не писали ему, в списке собеседников не отображаются.
        if self.request.query_params.get('with_chat') in ('1', 'true', 'True'):
            queryset = queryset.filter(
                Q(sent_messages__recipient=user)
                | Q(received_messages__author=user)
            ).distinct()

        queryset = queryset.order_by(
            F('unread_count').desc(),
            F('last_message_time').desc(nulls_last=True)
        )
        return queryset

    @action(
        detail=False,
        methods=['get'],
        permission_classes=(IsAuthenticated,),
        url_path='me/notifications',
    )
    def notifications(self, request):
        """
        Возвращает количество непрочитанных сообщений и общие уведомления.
        Лёгкий эндпоинт для polling'а с фронтенда.
        """

        user = request.user
        total_unread = Message.objects.filter(
            recipient=user,
            is_read=False
        ).count()

        # Кто написал непрочитанные
        unread_from = (
            Message.objects
            .filter(recipient=user, is_read=False)
            .values('author_id', 'author__first_name', 'author__last_name')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        return Response({
            'total_unread': total_unread,
            'unread_from': list(unread_from),
        })

    @action(
        detail=False,
        methods=['get'],
        permission_classes=(AllowAny,),
        url_path='developers',
    )
    def developers(self, request):
        """Список авторов проекта (is_developer=True).

        Публичный эндпоинт: доступен и неавторизованным пользователям
        (например, страница «О проекте»). Отдаёт только публичные поля
        через UserShortSerializer — без email и других приватных данных.
        """

        developers = User.objects.filter(is_developer=True)
        serializer = UserShortSerializer(
            developers, many=True, context={'request': request}
        )
        return Response(serializer.data)

    @action(
        detail=False,
        methods=['put', 'delete'],
        permission_classes=(IsAuthenticated,),
        url_path='me/avatar',
    )
    def avatar(self, request):
        """Управление аватаром пользователя."""

        user = request.user

        if request.method == 'PUT':
            if 'avatar' not in request.data:
                return Response(
                    {'avatar': ['Обязательное поле.']},
                    status=status.HTTP_400_BAD_REQUEST
                )
            serializer = UserSerializer(
                user, data=request.data,
                context={'request': request},
                partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(
                {'avatar': user.avatar.url if user.avatar else None},
                status=status.HTTP_200_OK
            )

        elif request.method == 'DELETE':
            if user.avatar:
                user.avatar.delete(save=True)
            return Response(status=status.HTTP_204_NO_CONTENT)

    @action(
        detail=False,
        methods=['get'],
        permission_classes=(IsAuthenticated,),
        url_path='subscriptions'
    )
    def subscriptions(self, request):
        """Список авторов, на которых подписан пользователь."""

        subscriptions = User.objects.filter(
            following__user=request.user
        )

        page = self.paginate_queryset(subscriptions)
        if page is not None:
            serializer = SubscribeSerializer(
                page, many=True, context={'request': request}
            )
            return self.get_paginated_response(serializer.data)

        serializer = SubscribeSerializer(
            subscriptions, many=True, context={'request': request}
        )
        return Response(serializer.data)

    @action(
        detail=True,
        methods=['post', 'delete'],
        permission_classes=(IsAuthenticated,),
        url_path='subscribe'
    )
    def subscribe(self, request, pk=None):
        author = get_object_or_404(User, pk=pk)

        if request.method == 'POST':
            if request.user == author:
                return Response(
                    {'error': 'Нельзя подписаться на самого себя'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            sub, created = Subscription.objects.get_or_create(
                user=request.user,
                author=author
            )
            if not created:
                return Response(
                    {'error': 'Вы уже подписаны на этого автора'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            serializer = SubscribeSerializer(
                sub,
                context={'request': request}
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        else:
            deleted_count, _ = Subscription.objects.filter(
                user=request.user, author=author
            ).delete()
            if not deleted_count:
                return Response(
                    {'error': 'Вы не подписаны на этого автора'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(status=status.HTTP_204_NO_CONTENT)

    def get_object(self):
        """Разрешаем изменять/удалять только собственный профиль (IDOR)."""

        if self.action in _OWNER_ONLY_ACTIONS:
            user = self.request.user
            pk = self.kwargs.get('pk')
            if pk != 'me' and str(pk) != str(user.pk):
                raise Http404
            return user
        return super().get_object()


class MessageViewSet(viewsets.ModelViewSet):
    """Вьюсет для сообщений. Чтение, создание, обновление."""

    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        qs = Message.objects.filter(
            Q(
                recipient=self.request.user
            ) | Q(
                author=self.request.user
            )
        )

        recipient = self.request.query_params.get('recipient')
        if recipient:
            user_is_author = Q(
                author=self.request.user,
                recipient_id=recipient
            )
            user_is_recipient = Q(
                recipient=self.request.user,
                author_id=recipient
            )
            qs = qs.filter(user_is_author | user_is_recipient)

            qs.filter(
                recipient=self.request.user,
                author_id=recipient,
                is_read=False
            ).update(is_read=True)

        return qs


class NewsViewSet(viewsets.ModelViewSet):
    """Вьюсет для новостей поьзователей."""

    queryset = NewsUser.objects.all().order_by('-created_at')
    serializer_class = NewsUserSerializer
    permission_classes = (IsAuthenticatedOrReadOnly,)
    pagination_class = PageLimitPagination

    def get_permissions(self):
        """Анонимным пользователям доступно только чтение новостей.

        Список новостей и детальная страница новости (list, retrieve)
        доступны всем, включая неавторизованных. Создание, редактирование
        и удаление новостей — только авторизованным пользователям.
        """
        if self.action in ('list', 'retrieve'):
            return (AllowAny(),)
        return super().get_permissions()

    def get_queryset(self):
        """Запись/редактирование/удаление — только свои новости."""

        # защита   от IDOR
        if self.action in ('update', 'partial_update', 'destroy'):
            return NewsUser.objects.filter(
                author=self.request.user
            )

        qs = NewsUser.objects.all().order_by('-created_at')
        author = self.request.query_params.get('author')
        if author == 'me':
            qs = qs.filter(author=self.request.user)
        elif author:
            try:
                qs = qs.filter(author_id=int(author))
            except ValueError:
                qs = qs.none()
        return qs
