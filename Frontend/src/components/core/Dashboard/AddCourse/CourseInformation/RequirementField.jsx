import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function RequirementsField({
  name,
  label,
  register,
  setValue,
  errors,
}) {
  const { editCourse, course } = useSelector((state) => state.course);
  const [requirement, setRequirement] = useState("");
  const [requirementsList, setRequirementsList] = useState([]);

  // Register field on mount
  useEffect(() => {
    register(name, { required: true, validate: (value) => value.length > 0 });
  }, [register, name]);

  // Load existing course requirements when editing
  useEffect(() => {
    if (editCourse && course?.instructions) {
      setRequirementsList(course.instructions);
    }
  }, [editCourse, course]);

  // Update field value when requirementsList changes
  useEffect(() => {
    setValue(name, requirementsList);
  }, [requirementsList, setValue, name]);

  // Add new requirement
  const handleAddRequirement = () => {
    const trimmedRequirement = requirement.trim();
    if (trimmedRequirement && !requirementsList.includes(trimmedRequirement)) {
      setRequirementsList([...requirementsList, trimmedRequirement]);
      setRequirement("");
    }
  };

  // Remove requirement
  const handleRemoveRequirement = (index) => {
    setRequirementsList(requirementsList.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm text-richblack-5" htmlFor={name}>
        {label} <sup className="text-pink-200">*</sup>
      </label>
      <div className="flex flex-col items-start space-y-2">
        <input
          type="text"
          id={name}
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          className="form-style w-full"
        />
        <button
          type="button"
          onClick={handleAddRequirement}
          className="font-semibold text-yellow-50"
        >
          Add
        </button>
      </div>

      {requirementsList.length > 0 && (
        <ul className="mt-2 list-inside list-disc">
          {requirementsList.map((req, index) => (
            <li key={index} className="flex items-center text-richblack-5">
              <span>{req}</span>
              <button
                type="button"
                className="ml-2 text-xs text-pure-greys-300"
                onClick={() => handleRemoveRequirement(index)}
              >
                Clear
              </button>
            </li>
          ))}
        </ul>
      )}

      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">
          {label} is required
        </span>
      )}
    </div>
  );
}
