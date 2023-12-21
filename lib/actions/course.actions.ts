'use server';

import { revalidatePath } from 'next/cache';

import { connectToDatabase } from '@/lib/database';
import Course from '@/lib/database/models/course.model';
import User from '@/lib/database/models/user.model';
import Category from '@/lib/database/models/category.model';
import { handleError } from '@/lib/utils';

import {
  CreateCourseParams,
  UpdateCourseParams,
  DeleteCourseParams,
  GetAllCoursesParams,
  GetCoursesByUserParams,
  GetRelatedCoursesByCategoryParams,
} from '@/types';

const getCategoryByName = async (name: string) => {
  return Category.findOne({ name: { $regex: name, $options: 'i' } });
};

const populateCourse = (query: any) => {
  return query
    .populate({
      path: 'organizer',
      model: User,
      select: '_id firstName lastName',
    })
    .populate({ path: 'category', model: Category, select: '_id name' });
};

// CREATE
export async function createCourse({
  userId,
  course,
  path,
}: CreateCourseParams) {
  try {
    await connectToDatabase();

    const organizer = await User.findById(userId);
    if (!organizer) throw new Error('Organizer not found');

    const newCourse = await Course.create({
      ...course,
      category: course.categoryId,
      organizer: userId,
    });
    revalidatePath(path);

    return JSON.parse(JSON.stringify(newCourse));
  } catch (error) {
    // handleError(error);
    console.error(error);
  }
}

// GET ONE COURSE BY ID
export async function getCourseById(courseId: string) {
  try {
    await connectToDatabase();

    const course = await populateCourse(Course.findById(courseId));

    if (!course) throw new Error('Course not found');

    return JSON.parse(JSON.stringify(course));
  } catch (error) {
    handleError(error);
  }
}

// UPDATE
export async function updateCourse({
  userId,
  course,
  path,
}: UpdateCourseParams) {
  try {
    await connectToDatabase();

    const courseToUpdate = await Course.findById(course._id);
    if (!courseToUpdate || courseToUpdate.organizer.toHexString() !== userId) {
      throw new Error('Unauthorized or course not found');
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      course._id,
      { ...course, category: course.categoryId },
      { new: true }
    );
    revalidatePath(path);

    return JSON.parse(JSON.stringify(updatedCourse));
  } catch (error) {
    handleError(error);
  }
}

// DELETE
export async function deleteCourse({ courseId, path }: DeleteCourseParams) {
  try {
    await connectToDatabase();

    const deletedCourse = await Course.findByIdAndDelete(courseId);
    if (deletedCourse) revalidatePath(path);
  } catch (error) {
    handleError(error);
  }
}

// GET ALL COURSES
export async function getAllCourses({
  query,
  limit = 6,
  page,
  category,
}: GetAllCoursesParams) {
  try {
    await connectToDatabase();

    const titleCondition = query
      ? { title: { $regex: query, $options: 'i' } }
      : {};

    const categoryCondition = category
      ? await getCategoryByName(category)
      : null;

    const conditions = {
      $and: [
        titleCondition,
        categoryCondition ? { category: categoryCondition._id } : {},
      ],
    };

    const skipAmount = (Number(page) - 1) * limit;
    const coursesQuery = Course.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit);

    const courses = await populateCourse(coursesQuery);
    const coursesCount = await Course.countDocuments(conditions);

    return {
      data: JSON.parse(JSON.stringify(courses)),
      totalPages: Math.ceil(coursesCount / limit),
    };
  } catch (error) {
    // handleError(error);
    console.error(error);
  }
}

// GET COURSES BY ORGANIZER
export async function getCoursesByUser({
  userId,
  limit = 6,
  page,
}: GetCoursesByUserParams) {
  try {
    await connectToDatabase();

    const conditions = { organizer: userId };
    const skipAmount = (page - 1) * limit;

    const coursesQuery = Course.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit);

    const courses = await populateCourse(coursesQuery);
    const coursesCount = await Course.countDocuments(conditions);

    return {
      data: JSON.parse(JSON.stringify(courses)),
      totalPages: Math.ceil(coursesCount / limit),
    };
  } catch (error) {
    handleError(error);
  }
}

// GET RELATED COURSES: COURSES WITH SAME CATEGORY
export async function getRelatedCoursesByCategory({
  categoryId,
  courseId,
  limit = 3,
  page = 1,
}: GetRelatedCoursesByCategoryParams) {
  try {
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;
    const conditions = {
      $and: [{ category: categoryId }, { _id: { $ne: courseId } }],
    };

    const coursesQuery = Course.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit);

    const courses = await populateCourse(coursesQuery);
    const coursesCount = await Course.countDocuments(conditions);

    return {
      data: JSON.parse(JSON.stringify(courses)),
      totalPages: Math.ceil(coursesCount / limit),
    };
  } catch (error) {
    handleError(error);
  }
}
