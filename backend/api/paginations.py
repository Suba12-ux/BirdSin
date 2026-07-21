from rest_framework.pagination import PageNumberPagination

from bird.constants import USER_PAGE_SIZE, PAGE_LIMIT


class UserPagePagination(PageNumberPagination):
    page_size = USER_PAGE_SIZE
    page_size_query_param = 'limit'


class PageLimitPagination(PageNumberPagination):
    page_size = PAGE_LIMIT
    page_size_query_param = 'limit'
