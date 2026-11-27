from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static

admin.site.site_header = "Ascendra Administration"
admin.site.site_title = "Ascendra Admin"
admin.site.index_title = "Career Lifecycle Management"

urlpatterns = [
    path("django-admin/", admin.site.urls),
    
    # Core API Endpoints
    path("api/status/", include("common.urls")),
    path("api/", include("accounts.api_urls")),
    path("api/students/", include("students.urls")),
    path("api/academics/", include("academics.urls")),
    path("api/assessments/", include("assessments.urls")),
    path("api/skills/", include("skills.urls")),
    path("api/projects/", include("projects.urls")),
    path("api/placements/", include("placements.urls")),
    path("api/careers/", include("careers.urls")),
    path("api/common/", include("common.urls")),
    
    # Legacy Django templates support if needed
    path("accounts/", include("accounts.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
