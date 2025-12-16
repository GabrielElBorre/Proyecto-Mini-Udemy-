import InstructorFollow from "../models/InstructorFollow.js";
import User from "../models/User.js";
import Course from "../models/Course.js";

// Seguir/dejar de seguir instructor
export const toggleFollow = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const userId = req.user.id;

    if (instructorId === userId) {
      return res.status(400).json({ message: "No puedes seguirte a ti mismo" });
    }

    // Verificar que el instructor existe
    const instructor = await User.findById(instructorId);
    if (!instructor) {
      return res.status(404).json({ message: "Instructor no encontrado" });
    }

    const existingFollow = await InstructorFollow.findOne({
      follower: userId,
      instructor: instructorId
    });

    if (existingFollow) {
      // Dejar de seguir
      await InstructorFollow.findByIdAndDelete(existingFollow._id);
      res.status(200).json({ 
        message: "Dejaste de seguir al instructor",
        isFollowing: false
      });
    } else {
      // Seguir
      const follow = await InstructorFollow.create({
        follower: userId,
        instructor: instructorId
      });
      
      const populatedFollow = await InstructorFollow.findById(follow._id)
        .populate("instructor", "name email photoUrl");
      
      res.status(201).json({ 
        message: "Ahora sigues a este instructor",
        follow: populatedFollow,
        isFollowing: true
      });
    }
  } catch (err) {
    console.error("Error al gestionar seguimiento:", err);
    res.status(500).json({ message: "Error al gestionar seguimiento", error: err.message });
  }
};

// Obtener instructores seguidos
export const getFollowing = async (req, res) => {
  try {
    const userId = req.user.id;

    const follows = await InstructorFollow.find({ follower: userId })
      .populate("instructor", "name email photoUrl")
      .sort({ createdAt: -1 });

    // Obtener cursos de cada instructor
    const instructorsWithCourses = await Promise.all(
      follows.map(async (follow) => {
        const courses = await Course.find({ 
          instructor: follow.instructor._id,
          isPublished: true
        })
          .select("title imageUrl price rating ratingCount")
          .limit(3)
          .sort({ createdAt: -1 });

        return {
          ...follow.instructor.toObject(),
          courses,
          followedAt: follow.createdAt
        };
      })
    );

    res.status(200).json({ instructors: instructorsWithCourses });
  } catch (err) {
    console.error("Error al obtener instructores seguidos:", err);
    res.status(500).json({ message: "Error al obtener instructores seguidos", error: err.message });
  }
};

// Verificar si se sigue a un instructor
export const checkFollow = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const userId = req.user.id;

    const follow = await InstructorFollow.findOne({
      follower: userId,
      instructor: instructorId
    });

    res.status(200).json({ isFollowing: !!follow });
  } catch (err) {
    console.error("Error al verificar seguimiento:", err);
    res.status(500).json({ message: "Error al verificar seguimiento", error: err.message });
  }
};

// Obtener seguidores de un instructor
export const getFollowers = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const userId = req.user.id;

    // Verificar que el usuario es el instructor
    const instructor = await User.findById(instructorId);
    if (!instructor || instructor._id.toString() !== userId) {
      return res.status(403).json({ message: "No tienes permiso para ver los seguidores" });
    }

    const followers = await InstructorFollow.find({ instructor: instructorId })
      .populate("follower", "name email photoUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({ followers: followers.map(f => f.follower) });
  } catch (err) {
    console.error("Error al obtener seguidores:", err);
    res.status(500).json({ message: "Error al obtener seguidores", error: err.message });
  }
};

