import React, { useState, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import Badge from "../../components/ui/Badge";
import StatCard from "../../components/ui/StatCard";
import { academicsApi, studentApi } from "../../services/api";
import {
  BookOpen,
  Calendar,
  FileText,
  ExternalLink,
  CheckCircle2,
  Clock,
  Layers,
  UserCheck,
} from "lucide-react";

export const StudentAcademicsPage = () => {
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAcademics = async () => {
      try {
        const [profRes, courseRes, attRes] = await Promise.all([
          studentApi.getMyProfile(),
          academicsApi.getCourses(),
          academicsApi.getAttendance(),
        ]);
        setProfile(profRes.data);
        setCourses(courseRes.data.results || courseRes.data || []);
        setAttendance(attRes.data.results || attRes.data || []);
      } catch (err) {
        console.error("Load academics error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadAcademics();
  }, []);

  const enrolledCourseIds = new Set((profile?.enrolled_courses || []).map((c) => c.course_id));
  const myCourses = courses.filter((c) => enrolledCourseIds.has(c.id));
  const displayCourses = myCourses.length > 0 ? myCourses : courses;

  const presentCount = attendance.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 100;

  return (
    <AppLayout title="Learning & Curriculum Modules" subtitle="Course syllabus, study materials, and attendance log">
      <div className="space-y-7">
        {/* Top Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard
            title="Enrolled Programs"
            value={profile?.enrolled_courses?.length || 0}
            subtitle={profile?.active_batch_name || "Assigned Cohort"}
            icon={BookOpen}
            color="indigo"
          />
          <StatCard
            title="Curriculum Modules"
            value={displayCourses.reduce((acc, c) => acc + (c.modules?.length || 0), 0)}
            subtitle="Structured learning units"
            icon={Layers}
            color="teal"
          />
          <StatCard
            title="Attendance Rate"
            value={`${attendanceRate}%`}
            subtitle={`${presentCount} of ${attendance.length} sessions attended`}
            icon={UserCheck}
            color="emerald"
          />
        </div>

        {/* Courses & Modules */}
        <div className="space-y-5">
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-500">
              Loading your curriculum...
            </div>
          ) : (
            displayCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
              >
                <div className="p-6 bg-gradient-to-r from-indigo-50/80 via-blue-50/50 to-teal-50/60 border-b border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white">
                        {course.code || "COURSE"}
                      </span>
                      <Badge variant={enrolledCourseIds.has(course.id) ? "success" : "neutral"} size="sm">
                        {enrolledCourseIds.has(course.id) ? "Enrolled" : "Catalog"}
                      </Badge>
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900 mt-2">{course.name}</h2>
                    <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">{course.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shrink-0">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>{course.duration_months} Months Program</span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Syllabus Modules ({course.modules?.length || 0})
                  </h3>
                  {!course.modules || course.modules.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4">No modules published for this course yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {course.modules.map((mod, idx) => (
                        <div
                          key={mod.id}
                          className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                                {mod.order || idx + 1}
                              </span>
                              <h4 className="font-bold text-sm text-slate-900">{mod.title}</h4>
                            </div>
                            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 shrink-0">
                              {mod.duration_weeks || 2}w
                            </span>
                          </div>
                          {mod.description && (
                            <p className="text-xs text-slate-600 leading-relaxed">{mod.description}</p>
                          )}
                          {mod.materials && mod.materials.length > 0 && (
                            <div className="pt-2 border-t border-slate-200/70 space-y-1.5">
                              <p className="text-[10px] font-bold uppercase text-slate-500">Learning Resources</p>
                              {mod.materials.map((mat) => (
                                <div key={mat.id} className="flex items-center justify-between text-xs bg-white px-3 py-2 rounded-xl border border-slate-200/70">
                                  <span className="font-medium text-slate-800 flex items-center gap-2 truncate">
                                    <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                    <span className="truncate">{mat.title}</span>
                                  </span>
                                  {(mat.external_url || mat.file) && (
                                    <a
                                      href={mat.external_url || mat.file}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-indigo-600 hover:underline font-bold inline-flex items-center gap-1 shrink-0 ml-2"
                                    >
                                      <span>Open</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Attendance Log */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Session Attendance History</h3>
              <p className="text-xs text-slate-500">Verified cohort attendance logged by your trainer</p>
            </div>
            <Badge variant="success" size="sm">
              {attendanceRate}% Overall
            </Badge>
          </div>
          {attendance.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No attendance entries recorded yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {attendance.slice(0, 12).map((att) => (
                <div key={att.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{att.date}</p>
                    <p className="text-[11px] text-slate-500 truncate">{att.batch_name}</p>
                  </div>
                  <Badge
                    variant={
                      att.status === "PRESENT" ? "success" : att.status === "LATE" ? "warning" : "danger"
                    }
                    size="sm"
                  >
                    {att.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentAcademicsPage;
