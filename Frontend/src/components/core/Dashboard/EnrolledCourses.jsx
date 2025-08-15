import { useEffect, useState } from "react";
import ProgressBar from "@ramonak/react-progress-bar";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { getUserEnrolledCourses } from "../../../services/operations/profileAPI";

export default function EnrolledCourses() {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const res = await getUserEnrolledCourses(token);
        setEnrolledCourses(res || []);
      } catch (error) {
        console.error("Could not fetch enrolled courses.", error);
      }
    };

    fetchEnrolledCourses();
  }, [token]);

  return (
    <>
      <div className="text-3xl text-richblack-50">Enrolled Courses</div>

      {!enrolledCourses.length ? (
        <p className="grid h-[10vh] w-full place-content-center text-richblack-5">
          You have not enrolled in any course yet.
        </p>
      ) : (
        <div className="my-8 text-richblack-5">
          {/* Headings */}
          <div className="flex rounded-t-lg bg-richblack-500">
            <p className="w-[45%] px-5 py-3">Course Name</p>
            <p className="w-1/4 px-2 py-3">Duration</p>
            <p className="flex-1 px-2 py-3">Progress</p>
          </div>

          {/* Course List */}
          {enrolledCourses.map((course) => {
            const firstSectionId = course.sections?.[0]?._id ?? "0";
            const firstSubSectionId =
              course.sections?.[0]?.subSections?.[0]?._id ?? "0";

            return (
              <div
                className="flex items-center border border-richblack-700"
                key={course._id}
              >
                <div
                  className="flex w-[45%] cursor-pointer items-center gap-4 px-5 py-3"
                  onClick={() =>
                    navigate(
                      `/view-course/${course._id}/section/${firstSectionId}/sub-section/${firstSubSectionId}`
                    )
                  }
                >
                  <img
                    src={course.thumbnail}
                    alt="course_img"
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                  <div className="flex max-w-xs flex-col gap-2">
                    <p className="font-semibold">{course.courseName}</p>
                    <p className="text-xs text-richblack-300">
                      {course.courseDescription.length > 50
                        ? `${course.courseDescription.slice(0, 50)}...`
                        : course.courseDescription}
                    </p>
                  </div>
                </div>

                <div className="w-1/4 px-2 py-3">{course?.totalDuration}</div>

                <div className="flex w-1/5 flex-col gap-2 px-2 py-3">
                  <p>Progress: {course.progressPercentage || 0}%</p>
                  <ProgressBar
                    completed={Number(course.progressPercentage) || 0}
                    height="8px"
                    isLabelVisible={false}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
