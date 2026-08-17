from rest_framework import serializers

from api.models import User, Subscription, Message, NewsUser


class UserShortSerializer(serializers.ModelSerializer):
    """Краткий сериализатор автора новости.

    Содержит только публичные данные (без email и пароля), чтобы
    анонимные пользователи могли видеть авторов в ленте новостей
    без запроса к /api/users/, который доступен только авторизованным.
    """

    class Meta:
        model = User
        fields = (
            'id', 'username', 'first_name', 'last_name', 'avatar'
        )


class UserSerializer(serializers.ModelSerializer):
    """Сериализатор пользователя."""

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        required=False
    )
    unread_count = serializers.IntegerField(
        read_only=True,
        default=0
    )

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name',
            'last_name', 'avatar', 'password', 'unread_count',
            'is_developer'
        )

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        request = self.context.get('request')
        if request is not None and instance != request.user:
            raise serializers.ValidationError(
                'Нельзя редактировать чужой профиль.'
            )
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        return super().update(instance, validated_data)


class UserCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для регистрации нового пользователя."""

    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name',
            'last_name', 'password'
        )

    def create(self, validated_data):
        user = User(
            email=validated_data['email'],
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class SubscribeSerializer(serializers.ModelSerializer):
    """Сериализатор подписки."""

    email = serializers.ReadOnlyField(source='author.email')
    id = serializers.IntegerField(source='author.id', read_only=True)
    username = serializers.ReadOnlyField(source='author.username')
    first_name = serializers.ReadOnlyField(source='author.first_name')
    last_name = serializers.ReadOnlyField(source='author.last_name')
    is_subscribed = serializers.SerializerMethodField()
    recipes_count = serializers.SerializerMethodField()

    class Meta:
        model = Subscription
        fields = (
            'email', 'id', 'username', 'first_name',
            'last_name', 'is_subscribed', 'recipes_count'
        )

    def get_is_subscribed(self, obj):
        return Subscription.objects.filter(
            user=self.context['request'].user,
            author=obj.author
        ).exists()


class MessageSerializer(serializers.ModelSerializer):
    """Сериализатор чатов."""

    author = serializers.PrimaryKeyRelatedField(read_only=True)
    created_at = serializers.DateTimeField(
        read_only=True, format='%Y-%m-%dT%H:%M:%SZ'
    )

    class Meta:
        model = Message
        fields = (
            'id', 'author', 'recipient',
            'text', 'created_at', 'is_read'
        )
        read_only_fields = ('author', 'created_at', 'is_read')

    def validate_recipient(self, value):
        """Запрещаем отправку сообщения самому себе."""

        request = self.context.get('request')
        if request is not None and request.user == value:
            raise serializers.ValidationError(
                'Нельзя отправить сообщение самому себе.'
            )
        return value

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class NewsUserSerializer(serializers.ModelSerializer):
    """Сериализатор новостей пользователей."""

    # Автор приходит сразу объектом (id, имя, аватар), чтобы не
    # делать отдельный запрос к /api/users/ — он недоступен гостям.
    author = UserShortSerializer(read_only=True)

    class Meta:
        model = NewsUser
        fields = (
            'id', 'author', 'news',
            'text_news', 'image',
            'created_at'
        )
        read_only_fields = ('author', 'created_at')

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)
