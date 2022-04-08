from django.http import JsonResponse


def ping(request):
    data = {"ping": "pong!"}
    # print("In ping request, trying the logging on Heroku, added word")
    # print(request)
    # print(request.headers)
    return JsonResponse(data)
