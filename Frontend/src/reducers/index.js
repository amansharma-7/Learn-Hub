import { combineReducers } from "redux";
import authReducer from "../slices/authSlice";
import cartReducer from "../slices/cartSlice";
import profieReducer from "../slices/profileSlice";

import courseReducer from "../slices/courseSlice";
import viewCourseReducer from "../slices/viewCourseSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  profile: profieReducer,
  course: courseReducer,
  viewCourse: viewCourseReducer,
});

export default rootReducer;
