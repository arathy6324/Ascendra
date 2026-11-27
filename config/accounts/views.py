
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render


@login_required
def dashboard(request):
    user = request.user

    if user.role == "ADMIN":
        return redirect("admin_dashboard")

    if user.role == "TRAINER":
        return redirect("trainer_dashboard")

    if user.role == "PLACEMENT":
        return redirect("placement_dashboard")

    if user.role == "ALUMNI":
        return redirect("alumni_dashboard")

    return redirect("student_dashboard")


@login_required
def student_dashboard(request):
    return render(
        request,
        "dashboards/student.html",
        {"user": request.user},
    )


@login_required
def trainer_dashboard(request):
    return render(
        request,
        "dashboards/trainer.html",
        {"user": request.user},
    )


@login_required
def placement_dashboard(request):
    return render(
        request,
        "dashboards/placement.html",
        {"user": request.user},
    )


@login_required
def alumni_dashboard(request):
    return render(
        request,
        "dashboards/alumni.html",
        {"user": request.user},
    )


@login_required
def admin_dashboard(request):
    if not request.user.is_superuser:
        if request.user.role != "ADMIN":
            from django.core.exceptions import PermissionDenied
            raise PermissionDenied

    return render(
        request,
        "dashboards/admin.html",
        {"user": request.user},
    )
