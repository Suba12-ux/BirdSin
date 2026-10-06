import asyncio
from datetime import timedelta

from asgiref.sync import sync_to_async
from django.core.management.base import BaseCommand
from django.utils import timezone

from api.models import BotUser
from newsbot.views import Functionality


class Command(BaseCommand):
    """Публикует новости ботов по их интервалу.

    Без флагов выполняет один проход: для каждого активного бота, у которого
    подошёл интервал, создаётся одна новость. С флагом --loop команда
    работает постоянно, проверяя ботов каждые --sleep секунд.
    """

    help = 'Публикует новости ботов по заданному интервалу.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--loop',
            action='store_true',
            help='Работать в режиме постоянного цикла.',
        )
        parser.add_argument(
            '--bot',
            type=int,
            help='ID бота, для которого выполнить публикацию '
                 '(по умолчанию — все).',
        )
        parser.add_argument(
            '--sleep',
            type=int,
            default=60,
            help='Пауза между проверками в режиме --loop, в секундах.',
        )

    def handle(self, *args, **options):
        asyncio.run(self._run(options))

    async def _run(self, options):
        functionality = Functionality()

        if options['loop']:
            sleep = max(10, options.get('sleep') or 60)
            self.stdout.write(self.style.SUCCESS(
                f'Запущен цикл публикаций ботов (проверка каждые {sleep} с).'
            ))
            while True:
                try:
                    await self._publish_due(functionality, options)
                except Exception as exc:
                    self.stderr.write(self.style.ERROR(
                        f'Ошибка проверки ботов: {exc}'
                    ))
                await asyncio.sleep(sleep)

        published = await self._publish_due(functionality, options)
        if not published:
            self.stdout.write('Нет ботов, готовых к публикации.')

    def _due_bots(self, bot_id):
        """Активные боты, у которых подошёл интервал публикации."""

        now = timezone.now()
        bots = BotUser.objects.filter(is_active=True)
        if bot_id is not None:
            bots = bots.filter(pk=bot_id)

        return [
            bot for bot in bots
            if bot.last_post_at is None
            or (now - bot.last_post_at) >= timedelta(seconds=bot.interval)
        ]

    async def _publish_due(self, functionality, options):
        due = await sync_to_async(self._due_bots)(options.get('bot'))
        for bot in due:
            await self._publish(functionality, bot)
        return len(due)

    async def _publish(self, functionality, bot):
        try:
            news = await functionality.generate_bot_post(bot)
        except Exception as exc:
            self.stderr.write(self.style.ERROR(
                f'Бот #{bot.pk}: ошибка публикации — {exc}'
            ))
            return

        bot.last_post_at = timezone.now()
        await sync_to_async(bot.save)(update_fields=['last_post_at'])
        self.stdout.write(self.style.SUCCESS(
            f'Бот #{bot.pk} опубликовал новость #{news.pk}.'
        ))
