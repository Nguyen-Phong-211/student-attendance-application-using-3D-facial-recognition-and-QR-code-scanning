from django.views.generic import View
from django.shortcuts import render

class ReactAppView(View):
    def get(self, request):
        return render(request, 'index.html')