import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { HiOutlineCurrencyRupee } from "react-icons/hi";
import { MdNavigateNext } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";

import {
  addCourseDetails,
  editCourseDetails,
  fetchCourseCategories,
} from "../../../../../services/operations/courseDetailsAPI";
import { setCourse, setStep } from "../../../../../slices/courseSlice";
import { COURSE_STATUS } from "../../../../../utils/constants";
import IconBtn from "../../../../common/IconBtn";
import Upload from "../Upload";
import ChipInput from "./ChipInput";
import RequirementsField from "./RequirementField";

export default function CourseInformationForm() {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();

  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { course, editCourse } = useSelector((state) => state.course);
  const [loading, setLoading] = useState(false);
  const [courseCategories, setCourseCategories] = useState([]);

  useEffect(() => {
    const getCategories = async () => {
      setLoading(true);
      const categories = await fetchCourseCategories();
      if (categories && categories.length > 0) setCourseCategories(categories);
      setLoading(false);
    };

    if (editCourse && course) {
      // Populate form with existing course data
      setValue("courseTitle", course.courseName);
      setValue("courseShortDesc", course.courseDescription);
      setValue("coursePrice", course.price);
      setValue("courseTags", course.tag || []);
      setValue("courseBenefits", course.whatWillYouLearn);
      setValue("courseCategory", course.category?._id || "");
      setValue("courseRequirements", course.instructions || []);
      setValue("courseImage", course.thumbnail || null);
    }

    getCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isFormUpdated = () => {
    const currentValues = getValues();
    if (
      currentValues.courseTitle !== course.courseName ||
      currentValues.courseShortDesc !== course.courseDescription ||
      currentValues.coursePrice !== course.price ||
      currentValues.courseTags.toString() !== (course.tag || []).toString() ||
      currentValues.courseBenefits !== course.whatWillYouLearn ||
      currentValues.courseCategory !== course.category?._id ||
      currentValues.courseRequirements.toString() !==
        (course.instructions || []).toString() ||
      currentValues.courseImage !== course.thumbnail
    ) {
      return true;
    }
    return false;
  };

  const onSubmit = async (data) => {
    const formData = new FormData();

    if (editCourse && course) {
      if (!isFormUpdated()) {
        toast.error("No changes made to the form");
        return;
      }

      formData.append("courseId", course._id);

      if (data.courseTitle !== course.courseName)
        formData.append("courseName", data.courseTitle);
      if (data.courseShortDesc !== course.courseDescription)
        formData.append("courseDescription", data.courseShortDesc);
      if (data.coursePrice !== course.price)
        formData.append("price", data.coursePrice);
      if (data.courseTags.toString() !== (course.tag || []).toString()) {
        formData.append("tag", JSON.stringify(data.courseTags));
      }
      if (data.courseBenefits !== course.whatWillYouLearn)
        formData.append("whatWillYouLearn", data.courseBenefits);
      if (data.courseCategory !== course.category?._id)
        formData.append("category", data.courseCategory);
      if (
        data.courseRequirements.toString() !==
        (course.instructions || []).toString()
      ) {
        formData.append(
          "instructions",
          JSON.stringify(data.courseRequirements)
        );
      }
      if (data.courseImage !== course.thumbnail && data.courseImage !== null) {
        formData.append("thumbnailImage", data.courseImage);
      }

      setLoading(true);
      const result = await editCourseDetails(formData, token);
      setLoading(false);

      if (result) {
        dispatch(setStep(2));
        dispatch(setCourse(result));
      }
    } else {
      // CREATE new course
      formData.append("courseName", data.courseTitle);
      formData.append("courseDescription", data.courseShortDesc);
      formData.append("price", data.coursePrice);
      formData.append("tag", JSON.stringify(data.courseTags || []));
      formData.append("whatWillYouLearn", data.courseBenefits);
      formData.append("category", data.courseCategory);
      formData.append("status", COURSE_STATUS.DRAFT);
      formData.append(
        "instructions",
        JSON.stringify(data.courseRequirements || [])
      );
      formData.append("thumbnailImage", data.courseImage);

      setLoading(true);
      const result = await addCourseDetails(formData, token);
      setLoading(false);

      if (result) {
        dispatch(setStep(2));
        dispatch(setCourse(result));
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6"
    >
      {/* Course Title */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="courseTitle">
          Course Title <sup className="text-pink-200">*</sup>
        </label>
        <input
          id="courseTitle"
          placeholder="Enter Course Title"
          {...register("courseTitle", { required: true })}
          className="form-style w-full"
        />
        {errors.courseTitle && (
          <span className="ml-2 text-xs text-pink-200">
            Course title is required
          </span>
        )}
      </div>

      {/* Short Description */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="courseShortDesc">
          Course Short Description <sup className="text-pink-200">*</sup>
        </label>
        <textarea
          id="courseShortDesc"
          placeholder="Enter Description"
          {...register("courseShortDesc", { required: true })}
          className="form-style resize-x-none min-h-[130px] w-full"
        />
        {errors.courseShortDesc && (
          <span className="ml-2 text-xs text-pink-200">
            Course description is required
          </span>
        )}
      </div>

      {/* Price */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="coursePrice">
          Course Price <sup className="text-pink-200">*</sup>
        </label>
        <div className="relative">
          <input
            id="coursePrice"
            placeholder="Enter Course Price"
            {...register("coursePrice", {
              required: true,
              valueAsNumber: true,
            })}
            className="form-style w-full !pl-12"
          />
          <HiOutlineCurrencyRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl text-richblack-400" />
        </div>
        {errors.coursePrice && (
          <span className="ml-2 text-xs text-pink-200">
            Course price is required
          </span>
        )}
      </div>

      {/* Category */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="courseCategory">
          Course Category <sup className="text-pink-200">*</sup>
        </label>
        <select
          {...register("courseCategory", { required: true })}
          defaultValue=""
          id="courseCategory"
          className="form-style w-full"
        >
          <option value="" disabled>
            Choose a Category
          </option>
          {!loading &&
            courseCategories?.map((cat, i) => (
              <option key={i} value={cat._id}>
                {cat.name}
              </option>
            ))}
        </select>
        {errors.courseCategory && (
          <span className="ml-2 text-xs text-pink-200">
            Course category is required
          </span>
        )}
      </div>

      {/* Tags */}
      <ChipInput
        label="Tags"
        name="courseTags"
        placeholder="Enter Tags and press Enter"
        register={register}
        errors={errors}
        setValue={setValue}
        getValues={getValues}
      />

      {/* Thumbnail */}
      <Upload
        name="courseImage"
        label="Course Thumbnail"
        register={register}
        setValue={setValue}
        errors={errors}
        editData={editCourse ? course.thumbnail : null}
      />

      {/* Benefits */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="courseBenefits">
          Benefits of the course <sup className="text-pink-200">*</sup>
        </label>
        <textarea
          id="courseBenefits"
          placeholder="Enter benefits of the course"
          {...register("courseBenefits", { required: true })}
          className="form-style resize-x-none min-h-[130px] w-full"
        />
        {errors.courseBenefits && (
          <span className="ml-2 text-xs text-pink-200">
            Benefits are required
          </span>
        )}
      </div>

      {/* Requirements / Instructions */}
      <RequirementsField
        name="courseRequirements"
        label="Requirements / Instructions"
        register={register}
        setValue={setValue}
        errors={errors}
        getValues={getValues}
      />

      {/* Next / Save Button */}
      <div className="flex justify-end gap-x-2">
        {editCourse && (
          <button
            type="button"
            onClick={() => dispatch(setStep(2))}
            disabled={loading}
            className="flex items-center gap-x-2 rounded-md bg-richblack-300 py-2 px-5 font-semibold text-richblack-900"
          >
            Continue Without Saving
          </button>
        )}
        <IconBtn
          disabled={loading}
          text={editCourse ? "Save Changes" : "Next"}
          type="submit"
        >
          <MdNavigateNext />
        </IconBtn>
      </div>
    </form>
  );
}
