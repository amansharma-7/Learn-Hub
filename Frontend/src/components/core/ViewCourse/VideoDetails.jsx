import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import ReactPlayer from "react-player";

import { markLectureAsComplete } from "../../../services/operations/courseDetailsAPI";
import { updateCompletedLectures } from "../../../slices/viewCourseSlice";
import IconBtn from "../../common/IconBtn";

const VideoDetails = () => {
  const { courseId, sectionId, subSectionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const playerRef = useRef(null);
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { courseSectionData, courseEntireData, completedLectures } =
    useSelector((state) => state.viewCourse);

  const [videoData, setVideoData] = useState(null);
  const [previewSource, setPreviewSource] = useState("");
  const [videoEnded, setVideoEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!courseSectionData.length) return;
    if (!courseId || !sectionId || !subSectionId) {
      navigate(`/dashboard/enrolled-courses`);
      return;
    }

    const section = courseSectionData.find(
      (course) => course._id === sectionId
    );
    const video = section?.subSection.find((data) => data._id === subSectionId);

    setVideoData(video || null);
    setPreviewSource(courseEntireData.thumbnail);
    setVideoEnded(false);
  }, [courseSectionData, courseEntireData, location.pathname]);

  const handlePlay = () => {
    setPlaying(true);
  };

  const handlePause = () => {
    setPlaying(false);
  };

  const handleLectureCompletion = async () => {
    // console.log("aman");
    setLoading(true);
    const res = await markLectureAsComplete(
      { courseId, subsectionId: subSectionId },
      token
    );
    if (res) dispatch(updateCompletedLectures(subSectionId));
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-5 text-white">
      {!videoData ? (
        <img
          src={previewSource}
          alt="Preview"
          className="h-full w-full rounded-md object-cover"
        />
      ) : (
        <div
          className="relative w-full h-0"
          style={{ paddingBottom: "56.25%" }}
        >
          <ReactPlayer
            ref={playerRef}
            url={videoData.videoUrl}
            controls
            playing={playing}
            width="100%"
            height="100%"
            onEnded={() => setVideoEnded(true)}
            onPlay={handlePlay}
            onPause={handlePause}
            className="absolute top-0 left-0"
          />
          {!playing && (
            <button
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-4xl rounded-full w-16 h-16 mx-auto my-auto pl-2"
              onClick={() => setPlaying(true)}
            >
              ▶
            </button>
          )}
          {videoEnded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70">
              {!completedLectures.includes(subSectionId) && (
                <IconBtn
                  disabled={loading}
                  onclick={handleLectureCompletion}
                  text={loading ? "Loading..." : "Mark As Completed"}
                  customClasses="text-xl max-w-max px-4 mx-auto"
                />
              )}
              <IconBtn
                disabled={loading}
                onclick={() => {
                  playerRef.current?.seekTo(0);
                  setVideoEnded(false);
                  setPlaying(true);
                }}
                text="Rewatch"
                customClasses="text-xl max-w-max px-4 mx-auto mt-2"
              />
            </div>
          )}
        </div>
      )}
      <h1 className="mt-4 text-3xl font-semibold">{videoData?.title}</h1>
      <p className="pt-2 pb-6">{videoData?.description}</p>
    </div>
  );
};

export default VideoDetails;
